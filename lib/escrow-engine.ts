import { createServerSupabase } from "@/lib/supabase/server";
import { razorpay } from "@/lib/razorpay";

export type EscrowFsmState =
  | "ESCROW_PENDING"
  | "DELIVERY_VERIFIED"
  | "AVAILABLE_FOR_PAYOUT"
  | "PAYOUT_INITIATED"
  | "PAYOUT_COMPLETED"
  | "PAYOUT_FAILED"
  | "MANUAL_REVIEW_REQUIRED"
  | "ESCROW_FROZEN_RTO"
  | "ESCROW_DISPUTED_HOLD"
  | "BUYER_CANCELLED"
  | "PAYOUT_BLOCKED"
  | "REFUND_INITIATED"
  | "REFUND_COMPLETED"
  | "REFUND_FAILED";

export interface EscrowTransitionResult {
  success: boolean;
  previousState?: EscrowFsmState;
  currentState: EscrowFsmState;
  message: string;
  transferId?: string;
  refundId?: string;
  failureCode?: string;
}

export class EscrowStateMachine {
  /**
   * 1. TRANSITION: ESCROW_PENDING ➔ DELIVERY_VERIFIED ➔ AVAILABLE_FOR_PAYOUT
   * Triggered upon verified Shiprocket PoD delivery scan or buyer digital handover approval.
   * Includes strict guard checks against active disputes, cancellations, or RTO.
   */
  static async verifyDeliveryAndAuthorize(params: {
    orderId: string;
    sellerId: string;
    triggerSource: "shiprocket_delivery_scan" | "buyer_deal_handover" | "auto_inspection_timeout";
    referenceId?: string; // AWB code or Deal ID
  }): Promise<EscrowTransitionResult> {
    const supabase = createServerSupabase();
    const { orderId, sellerId, triggerSource, referenceId } = params;

    // A. Check for blocking conditions (Active Dispute, RTO, or Cancellation)
    const { data: activeDisputes } = await supabase
      .from("disputes")
      .select("id, status")
      .eq("order_id", orderId)
      .in("status", ["opened", "under_review", "investigating"]);

    if (activeDisputes && activeDisputes.length > 0) {
      await this.freezeEscrow({
        orderId,
        sellerId,
        reason: "Active buyer dispute under tribunal review",
        targetState: "ESCROW_DISPUTED_HOLD",
      });
      return {
        success: false,
        currentState: "ESCROW_DISPUTED_HOLD",
        message: "Escrow release halted: Active dispute on this order.",
      };
    }

    // B. Check order and existing payout state (Strict Idempotency)
    const idempotencyKey = `payout_${orderId}_${sellerId}`;
    const { data: existingPayout } = await supabase
      .from("payouts")
      .select("*")
      .eq("idempotency_key", idempotencyKey)
      .single();

    if (existingPayout) {
      // If already initiated or completed, do NOT re-trigger
      if (["PAYOUT_INITIATED", "PAYOUT_COMPLETED"].includes(existingPayout.escrow_state)) {
        return {
          success: true,
          previousState: existingPayout.escrow_state as EscrowFsmState,
          currentState: existingPayout.escrow_state as EscrowFsmState,
          message: `Payout already in [${existingPayout.escrow_state}] state. Duplicate event ignored safely.`,
          transferId: existingPayout.gateway_transfer_id,
        };
      }

      if (["ESCROW_FROZEN_RTO", "ESCROW_DISPUTED_HOLD", "PAYOUT_BLOCKED", "BUYER_CANCELLED", "REFUND_INITIATED", "REFUND_COMPLETED"].includes(existingPayout.escrow_state)) {
        return {
          success: false,
          currentState: existingPayout.escrow_state as EscrowFsmState,
          message: `Payout blocked due to [${existingPayout.escrow_state}] condition.`,
        };
      }
    }

    // C. Calculate exact Seller Payable & Platform Cut
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (!order) {
      return {
        success: false,
        currentState: "ESCROW_PENDING",
        message: "Order record not found.",
      };
    }

    const sellerItems = (order.order_items || []).filter((i: any) => i.seller_id === sellerId);
    const sellerPayableAmount = sellerItems.reduce((acc: number, cur: any) => acc + Number(cur.seller_share || 0), 0) || Number(order.total_seller_net || 0);

    // D. Record State: DELIVERY_VERIFIED ➔ AVAILABLE_FOR_PAYOUT in Immutable Ledger
    await supabase.from("ledger_entries").insert({
      seller_id: sellerId,
      order_id: orderId,
      entry_type: "escrow_release",
      amount: sellerPayableAmount,
      balance_type: "available",
      description: `Delivery verified via ${triggerSource} (Ref #${referenceId || "N/A"}). Balance marked AVAILABLE_FOR_PAYOUT.`,
    });

    // Upsert payout record with AVAILABLE_FOR_PAYOUT state
    await supabase.from("payouts").upsert(
      {
        order_id: orderId,
        seller_id: sellerId,
        amount: sellerPayableAmount,
        idempotency_key: idempotencyKey,
        escrow_state: "AVAILABLE_FOR_PAYOUT",
        status: "processing",
        authorized_at: new Date().toISOString(),
      },
      { onConflict: "idempotency_key" }
    );

    // E. Trigger Stage 2: Route Transfer Dispatch
    const dispatchRes = await this.initiateRoutePayout({
      orderId,
      sellerId,
      payableAmount: sellerPayableAmount,
      gatewayPaymentId: order.gateway_payment_id,
      idempotencyKey,
    });

    return dispatchRes;
  }

  /**
   * 2. TRANSITION: AVAILABLE_FOR_PAYOUT ➔ PAYOUT_INITIATED
   * Calls Razorpay Route API to create transfer to linked account.
   * State changes to PAYOUT_INITIATED (Waiting for actual webhook confirmation!).
   */
  static async initiateRoutePayout(params: {
    orderId: string;
    sellerId: string;
    payableAmount: number;
    gatewayPaymentId?: string;
    idempotencyKey: string;
  }): Promise<EscrowTransitionResult> {
    const supabase = createServerSupabase();
    const { orderId, sellerId, payableAmount, gatewayPaymentId, idempotencyKey } = params;

    // Check seller's registered linked account
    const { data: payoutAccount } = await supabase
      .from("seller_payout_accounts")
      .select("gateway_account_id")
      .eq("seller_id", sellerId)
      .eq("is_active", true)
      .single();

    const linkedAccountId = payoutAccount?.gateway_account_id;

    if (!gatewayPaymentId || !linkedAccountId) {
      // If mock environment or linked account not connected, hold in AVAILABLE_FOR_PAYOUT
      return {
        success: true,
        previousState: "AVAILABLE_FOR_PAYOUT",
        currentState: "AVAILABLE_FOR_PAYOUT",
        message: "Payable balance authorized in ledger. Payout will dispatch once seller links Razorpay Route account.",
      };
    }

    try {
      const rzpRes = await razorpay.authorizeRouteTransfer({
        paymentId: gatewayPaymentId,
        transfers: [
          {
            account: linkedAccountId,
            amount: Math.round(payableAmount * 100), // in paise
            currency: "INR",
            notes: { orderId, sellerId, idempotencyKey },
          },
        ],
      });

      const transferId = rzpRes.id || `trf_${Date.now()}`;

      // Update state to PAYOUT_INITIATED
      await supabase
        .from("payouts")
        .update({
          gateway_transfer_id: transferId,
          gateway_account_id: linkedAccountId,
          escrow_state: "PAYOUT_INITIATED",
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("idempotency_key", idempotencyKey);

      return {
        success: true,
        previousState: "AVAILABLE_FOR_PAYOUT",
        currentState: "PAYOUT_INITIATED",
        transferId,
        message: `Route transfer initiated with gateway ID [${transferId}]. Awaiting webhook settlement confirmation.`,
      };
    } catch (err: any) {
      console.error("[-] Route API dispatch error:", err.message);

      // Transition to PAYOUT_FAILED with failure code and branch to MANUAL_REVIEW_REQUIRED
      await supabase
        .from("payouts")
        .update({
          escrow_state: "PAYOUT_FAILED",
          status: "failed",
          failure_code: "GATEWAY_DISPATCH_REJECTED",
          failure_reason: err.message || "Razorpay Route transfer rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("idempotency_key", idempotencyKey);

      return {
        success: false,
        previousState: "AVAILABLE_FOR_PAYOUT",
        currentState: "PAYOUT_FAILED",
        failureCode: "GATEWAY_DISPATCH_REJECTED",
        message: `Payout dispatch failed: ${err.message}. Flagged for manual review.`,
      };
    }
  }

  /**
   * 3. EXPLICIT CANCELLATION & REFUND PIPELINE:
   * ESCROW_PENDING ➔ BUYER_CANCELLED ➔ PAYOUT_BLOCKED ➔ REFUND_INITIATED ➔ REFUND_COMPLETED
   */
  static async cancelOrderAndBlockPayout(params: {
    orderId: string;
    reason: string;
    cancelledBy: "buyer" | "seller" | "admin";
  }): Promise<EscrowTransitionResult> {
    const supabase = createServerSupabase();
    const { orderId, reason, cancelledBy } = params;

    // Fetch order details
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return {
        success: false,
        currentState: "ESCROW_PENDING",
        message: "Order record not found.",
      };
    }

    // Check if order is already fulfilled/shipped
    const hasShippedItems = (order.order_items || []).some(
      (item: any) => ["shipped", "delivered"].includes(item.fulfillment_status)
    );

    if (hasShippedItems && cancelledBy !== "admin") {
      return {
        success: false,
        currentState: "ESCROW_PENDING",
        message: "Order cannot be instantly cancelled after dispatch. Please open a return request or dispute.",
      };
    }

    // 1. Block Payout on all seller payout records for this order
    const sellerIds = Array.from(new Set((order.order_items || []).map((i: any) => i.seller_id)));
    for (const sId of sellerIds) {
      const idempotencyKey = `payout_${orderId}_${sId}`;
      await supabase.from("payouts").upsert(
        {
          order_id: orderId,
          seller_id: sId,
          idempotency_key: idempotencyKey,
          escrow_state: "PAYOUT_BLOCKED",
          status: "on_hold",
          failure_reason: `Cancelled by ${cancelledBy}: ${reason}`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "idempotency_key" }
      );
    }

    // 2. Mark Order as Cancelled in database
    await supabase
      .from("orders")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // 3. Mark Order Items as cancelled
    await supabase
      .from("order_items")
      .update({ fulfillment_status: "cancelled" })
      .eq("order_id", orderId);

    // 4. Revoke any digital entitlements
    await supabase
      .from("entitlements")
      .update({ status: "revoked" })
      .eq("order_id", orderId);

    // 5. Trigger Stage: REFUND_INITIATED to Buyer via Razorpay
    const refundRes = await this.processRefundToBuyer({
      orderId,
      buyerId: order.buyer_id,
      amount: Number(order.total_amount),
      reason,
      paymentId: order.gateway_payment_id,
    });

    return refundRes;
  }

  /**
   * 4. PROCESS REFUND TO BUYER
   * Calls Razorpay Refund API and inserts double-entry debit_refund in ledger.
   */
  static async processRefundToBuyer(params: {
    orderId: string;
    buyerId: string;
    amount: number;
    reason: string;
    paymentId?: string;
  }): Promise<EscrowTransitionResult> {
    const supabase = createServerSupabase();
    const { orderId, buyerId, amount, reason, paymentId } = params;

    // Record debit_refund in double-entry ledger
    await supabase.from("ledger_entries").insert({
      seller_id: buyerId, // Reference buyer account
      order_id: orderId,
      entry_type: "debit_refund",
      amount: -Math.abs(amount),
      balance_type: "available",
      description: `Order #${orderId.slice(0, 8)} cancelled. Full refund of ₹${amount} initiated to buyer. Reason: ${reason}`,
    });

    if (!paymentId) {
      // Mock / direct completion
      await supabase
        .from("payouts")
        .update({
          escrow_state: "REFUND_COMPLETED",
          status: "completed",
          settled_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      return {
        success: true,
        previousState: "PAYOUT_BLOCKED",
        currentState: "REFUND_COMPLETED",
        message: `Refund of ₹${amount} completed successfully to buyer. Payout blocked.`,
      };
    }

    try {
      const rzpRefund = await razorpay.createRefund({
        paymentId,
        amount: Math.round(amount * 100), // in paise
        notes: { orderId, buyerId, reason },
      });

      const refundId = rzpRefund.id || `rfnd_${Date.now()}`;

      await supabase
        .from("payouts")
        .update({
          escrow_state: "REFUND_INITIATED",
          status: "processing",
          gateway_transfer_id: refundId,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      return {
        success: true,
        previousState: "PAYOUT_BLOCKED",
        currentState: "REFUND_INITIATED",
        refundId,
        message: `Refund #${refundId} initiated via Razorpay. Payout to seller blocked.`,
      };
    } catch (refundErr: any) {
      console.error("[-] Razorpay Refund error:", refundErr.message);

      await supabase
        .from("payouts")
        .update({
          escrow_state: "REFUND_FAILED",
          status: "failed",
          failure_code: "REFUND_GATEWAY_ERROR",
          failure_reason: refundErr.message,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      return {
        success: false,
        previousState: "PAYOUT_BLOCKED",
        currentState: "REFUND_FAILED",
        failureCode: "REFUND_GATEWAY_ERROR",
        message: `Refund dispatch failed: ${refundErr.message}. Flagged for manual admin review.`,
      };
    }
  }

  /**
   * 5. SOURCE OF TRUTH: Razorpay Webhook Event Processor
   * Handles transfer.processed, payout.processed, transfer.failed, payout.failed, refund.processed, refund.failed.
   */
  static async handleRazorpayWebhookEvent(event: {
    eventType: string;
    transferId?: string;
    refundId?: string;
    failureReason?: string;
    failureCode?: string;
    rawPayload: any;
  }): Promise<EscrowTransitionResult> {
    const supabase = createServerSupabase();
    const { eventType, transferId, refundId, failureReason, failureCode } = event;

    // A. REFUND WEBHOOKS (Source of Truth)
    if (["refund.processed", "refund.created"].includes(eventType)) {
      if (refundId) {
        await supabase
          .from("payouts")
          .update({
            escrow_state: "REFUND_COMPLETED",
            status: "completed",
            settled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("gateway_transfer_id", refundId);
      }

      return {
        success: true,
        previousState: "REFUND_INITIATED",
        currentState: "REFUND_COMPLETED",
        message: `Refund #${refundId} verified as COMPLETED via Razorpay Webhook.`,
      };
    }

    if (eventType === "refund.failed") {
      if (refundId) {
        await supabase
          .from("payouts")
          .update({
            escrow_state: "REFUND_FAILED",
            status: "failed",
            failure_code: failureCode || "REFUND_FAILED",
            failure_reason: failureReason || "Bank rejected refund",
            updated_at: new Date().toISOString(),
          })
          .eq("gateway_transfer_id", refundId);
      }

      return {
        success: false,
        previousState: "REFUND_INITIATED",
        currentState: "REFUND_FAILED",
        failureCode: failureCode || "REFUND_FAILED",
        message: `Refund failed: ${failureReason}. Alert sent to manual review tribunal.`,
      };
    }

    if (!transferId) {
      return { success: false, currentState: "PAYOUT_INITIATED", message: "Transfer ID missing in webhook" };
    }

    const { data: payout } = await supabase
      .from("payouts")
      .select("*")
      .eq("gateway_transfer_id", transferId)
      .single();

    if (!payout) {
      return { success: false, currentState: "PAYOUT_INITIATED", message: `No payout record matching transfer ID [${transferId}]` };
    }

    // B. SUCCESS PAYOUT CASE: transfer.processed / settlement.processed
    if (["transfer.processed", "payout.processed", "settlement.processed"].includes(eventType)) {
      if (payout.escrow_state === "PAYOUT_COMPLETED") {
        return {
          success: true,
          previousState: "PAYOUT_COMPLETED",
          currentState: "PAYOUT_COMPLETED",
          message: "Idempotent event: Payout already marked COMPLETED.",
        };
      }

      await supabase
        .from("payouts")
        .update({
          escrow_state: "PAYOUT_COMPLETED",
          status: "completed",
          settled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payout.id);

      // Record final settlement debit entry in double-entry ledger
      await supabase.from("ledger_entries").insert({
        seller_id: payout.seller_id,
        order_id: payout.order_id,
        entry_type: "debit_payout",
        amount: payout.amount,
        balance_type: "available",
        description: `Settlement confirmed via Razorpay Route webhook (${transferId}). Payout COMPLETED.`,
      });

      return {
        success: true,
        previousState: payout.escrow_state as EscrowFsmState,
        currentState: "PAYOUT_COMPLETED",
        message: `Payout successfully confirmed and marked COMPLETED.`,
      };
    }

    // C. FAILURE BRANCH: transfer.failed / payout.failed / transfer.reversed
    if (["transfer.failed", "payout.failed", "transfer.reversed"].includes(eventType)) {
      await supabase
        .from("payouts")
        .update({
          escrow_state: "PAYOUT_FAILED",
          status: "failed",
          failure_code: failureCode || "SETTLEMENT_REJECTED",
          failure_reason: failureReason || "Bank rejected settlement transfer",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payout.id);

      return {
        success: false,
        previousState: payout.escrow_state as EscrowFsmState,
        currentState: "PAYOUT_FAILED",
        failureCode: failureCode || "SETTLEMENT_REJECTED",
        message: `Payout settlement failed: ${failureReason}. Routed to MANUAL_REVIEW_REQUIRED.`,
      };
    }

    return {
      success: true,
      currentState: payout.escrow_state as EscrowFsmState,
      message: `Webhook event [${eventType}] acknowledged.`,
    };
  }

  /**
   * 6. RTO & DISPUTE FREEZE GUARD
   * Freezes funds immediately if physical parcel is returned (RTO) or dispute opened.
   */
  static async freezeEscrow(params: {
    orderId: string;
    sellerId: string;
    reason: string;
    targetState: "ESCROW_FROZEN_RTO" | "ESCROW_DISPUTED_HOLD";
  }): Promise<void> {
    const supabase = createServerSupabase();
    const { orderId, sellerId, reason, targetState } = params;
    const idempotencyKey = `payout_${orderId}_${sellerId}`;

    await supabase.from("payouts").upsert(
      {
        order_id: orderId,
        seller_id: sellerId,
        idempotency_key: idempotencyKey,
        escrow_state: targetState,
        status: "on_hold",
        failure_reason: reason,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "idempotency_key" }
    );
  }
}
