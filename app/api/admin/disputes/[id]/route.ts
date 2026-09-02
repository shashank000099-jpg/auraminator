import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { EscrowStateMachine } from "@/lib/escrow-engine";

/**
 * ADMIN MISSION CONTROL - DISPUTE TRIBUNAL ARBITRATION
 *
 * Decisions:
 * 1. "seller_correct" -> Force payout/release to seller (85% net settled)
 * 2. "buyer_correct" -> Force full refund to buyer (100% deposit refunded)
 * 3. "partial_settlement" -> Custom split: partial payout to seller, partial refund to buyer
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const disputeId = params.id;
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Verify Admin Role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "UNAUTHORIZED: Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { decision, adminNotes, sellerSharePercent = 50 } = body;

    if (!["seller_correct", "buyer_correct", "partial_settlement"].includes(decision)) {
      return NextResponse.json(
        { error: "Invalid decision. Must be 'seller_correct', 'buyer_correct', or 'partial_settlement'." },
        { status: 400 }
      );
    }

    // 1. Fetch Dispute Dossier
    const { data: dispute, error: dispErr } = await supabase
      .from("disputes")
      .select("*, order:orders(*)")
      .eq("id", disputeId)
      .single();

    if (dispErr || !dispute) {
      return NextResponse.json({ error: "Dispute dossier not found." }, { status: 404 });
    }

    const orderId = dispute.order_id;
    const sellerId = dispute.seller_id;
    const buyerId = dispute.buyer_id;
    const order = dispute.order;

    let resultMessage = "";

    // 2. Execute Admin Decision
    if (decision === "seller_correct") {
      // Release Escrow to Seller (verifyDeliveryAndAuthorize automatically creates ledger entry and Route transfer)
      await EscrowStateMachine.verifyDeliveryAndAuthorize({
        orderId,
        sellerId,
        triggerSource: "buyer_deal_handover",
        referenceId: `TRIBUNAL_SELLER_WIN_${disputeId.slice(0, 8)}`,
      });

      // Update dispute status to valid constraint status: resolved_rejected
      await supabase
        .from("disputes")
        .update({ status: "resolved_rejected" })
        .eq("id", disputeId);

      resultMessage = "Tribunal ruled in favor of Seller. Escrow release initiated to seller's linked account.";
    } else if (decision === "buyer_correct") {
      // Issue Full Refund to Buyer
      await EscrowStateMachine.cancelOrderAndBlockPayout({
        orderId,
        reason: `Tribunal ruled in favor of Buyer. Admin notes: ${adminNotes || "Seller non-delivery or fraud"}.`,
        cancelledBy: "admin",
      });

      // Update dispute status to valid constraint status: resolved_refunded
      await supabase
        .from("disputes")
        .update({ status: "resolved_refunded" })
        .eq("id", disputeId);

      resultMessage = "Tribunal ruled in favor of Buyer. Full refund dispatched and seller payout blocked.";
    } else if (decision === "partial_settlement") {
      // Split Responsibility: Partial Payout + Partial Refund
      const percent = Math.min(100, Math.max(0, Number(sellerSharePercent) || 50));
      const totalNet = Number(order?.total_seller_net) || (Number(order?.total_amount) * 0.85);
      const sellerPartialAmount = Math.round((totalNet * percent) / 100);
      const buyerRefundAmount = Math.round(Number(order?.total_amount) * (1 - percent / 100));

      // 1. Credit seller partial payout in ledger
      await supabase.from("ledger_entries").insert({
        seller_id: sellerId,
        order_id: orderId,
        entry_type: "escrow_release",
        amount: sellerPartialAmount,
        balance_type: "available",
        description: `TRIBUNAL PARTIAL SETTLEMENT: Seller awarded ${percent}% (₹${sellerPartialAmount}). Admin notes: ${adminNotes || "Mutual partial responsibility"}.`,
      });

      // 2. Initiate partial refund to buyer
      await EscrowStateMachine.processRefundToBuyer({
        orderId,
        buyerId,
        amount: buyerRefundAmount,
        reason: `Tribunal Partial Settlement (${100 - percent}% refund awarded by Admin). Notes: ${adminNotes || "Mutual partial settlement"}`,
        paymentId: order?.gateway_payment_id,
      });

      // Update dispute status to valid constraint status: resolved_refunded
      await supabase
        .from("disputes")
        .update({ status: "resolved_refunded" })
        .eq("id", disputeId);

      resultMessage = `Tribunal enforced Partial Settlement: Seller awarded ${percent}% (₹${sellerPartialAmount}), Buyer refunded ${100 - percent}% (₹${buyerRefundAmount}).`;
    }

    return NextResponse.json({
      success: true,
      decision,
      disputeId,
      message: resultMessage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
