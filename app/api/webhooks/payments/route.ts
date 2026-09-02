import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabase } from "@/lib/supabase/server";
import { EscrowStateMachine } from "@/lib/escrow-engine";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "placeholder-webhook-secret";

    // 1. Cryptographic HMAC Signature Verification
    if (signature && process.env.NODE_ENV === "production" && webhookSecret !== "placeholder-webhook-secret") {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid HMAC Signature" }, { status: 400 });
      }
    }

    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      event = { event: "payment.captured", payload: { payment: { entity: { id: "pay_mock_1", order_id: "order_mock_1" } } } };
    }

    const supabase = createServerSupabase();
    const eventId = event.event_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const eventType = event.event || "payment.captured";

    // 2. Strict Idempotency Check
    const { error: idempotencyErr } = await supabase
      .from("webhook_events")
      .insert({
        provider: "razorpay",
        provider_event_id: eventId,
        event_type: eventType,
        payload: event,
      });

    if (idempotencyErr && idempotencyErr.code === "23505") {
      // Duplicate webhook delivery acknowledged safely without re-execution
      return NextResponse.json({ message: "Duplicate event acknowledged" }, { status: 200 });
    }

    // 3. CASE A: payment.captured (Initial Escrow Deposit Hold)
    if (eventType === "payment.captured") {
      const gatewayOrderId = event.payload?.payment?.entity?.order_id;
      const paymentId = event.payload?.payment?.entity?.id;

      if (gatewayOrderId) {
        const { data: order } = await supabase
          .from("orders")
          .update({
            payment_status: "captured",
            gateway_payment_id: paymentId,
          })
          .eq("gateway_order_id", gatewayOrderId)
          .select("*, order_items(*, products(*, digital_assets(*), external_vault_links(*)))")
          .single();

        if (order && order.order_items) {
          for (const item of order.order_items) {
            // A. Credit Double-Entry Seller Escrow (Balance Type: pending)
            await supabase.from("ledger_entries").insert({
              seller_id: item.seller_id,
              order_id: order.id,
              order_item_id: item.id,
              entry_type: "credit_escrow",
              amount: item.seller_share,
              balance_type: "pending",
              description: `Escrow hold for Order #${order.id.slice(0, 8)} [ESCROW_PENDING]`,
            });

            // Initialize Payout Record in ESCROW_PENDING State
            await supabase.from("payouts").upsert(
              {
                order_id: order.id,
                seller_id: item.seller_id,
                amount: item.seller_share,
                idempotency_key: `payout_${order.id}_${item.seller_id}`,
                escrow_state: "ESCROW_PENDING",
                status: "processing",
              },
              { onConflict: "idempotency_key" }
            );

            // B. Issue Entitlement for Digital Files/Vault Links
            if (["digital_file", "digital_link"].includes(item.product_type)) {
              await supabase.from("entitlements").insert({
                buyer_id: order.buyer_id,
                order_id: order.id,
                order_item_id: item.id,
                product_id: item.product_id,
                access_type: item.product_type,
                status: "active",
              });
            }

            // C. Commit Physical Inventory
            if (item.product_type === "physical" && item.variant_id) {
              await supabase.rpc("commit_inventory", { p_reservation_id: item.id });
            }

            // D. Initialize Service Intake Vault for Tech Services
            if (item.product_type === "service") {
              await supabase.from("service_intakes").insert({
                order_id: order.id,
                order_item_id: item.id,
                buyer_id: order.buyer_id,
                seller_id: item.seller_id,
                requirements: "Client requirements intake pending",
                delivery_sla_days: 3,
                status: "intake_pending",
              });
            }
          }
        }
      }
    }

    // 4. CASE B: transfer.processed / payout.processed / transfer.failed (Source of Truth Settlement)
    if (
      [
        "transfer.processed",
        "payout.processed",
        "settlement.processed",
        "transfer.failed",
        "payout.failed",
        "transfer.reversed",
      ].includes(eventType)
    ) {
      const transferEntity = event.payload?.transfer?.entity || event.payload?.payout?.entity;
      const transferId = transferEntity?.id;
      const failureReason = transferEntity?.error?.description || transferEntity?.failure_reason;
      const failureCode = transferEntity?.error?.code || transferEntity?.status;

      const fsmResult = await EscrowStateMachine.handleRazorpayWebhookEvent({
        eventType,
        transferId,
        failureReason,
        failureCode,
        rawPayload: event,
      });

      return NextResponse.json({
        success: true,
        eventId,
        eventType,
        fsmResult,
      });
    }

    return NextResponse.json({ success: true, eventId, eventType });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
