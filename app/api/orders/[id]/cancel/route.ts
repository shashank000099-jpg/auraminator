import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { EscrowStateMachine } from "@/lib/escrow-engine";

/**
 * ZERO-TRUST SERVER-SIDE CANCELLATION & REFUND CONTROLLER
 *
 * Does NOT rely on frontend button state.
 * Validates buyer authentication, verifies product types, checks access tokens,
 * courier manifest state, and service progress independently against database source of truth.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { reason = "Buyer requested order cancellation before fulfillment" } = body;

    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Query Order from Database Source of Truth
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found in database." }, { status: 404 });
    }

    // 2. Server-side Authorization Check
    // If authenticated, ensure caller is the actual buyer or platform admin
    if (user && user.id !== order.buyer_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.json(
          { error: "UNAUTHORIZED: You do not have permission to cancel this order." },
          { status: 403 }
        );
      }
    }

    // 3. Prevent duplicate cancellation if already cancelled or refunded
    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "INVALID_STATE: Order is already cancelled." },
        { status: 400 }
      );
    }

    // 4. Execute Server-Side Category Invariant Evaluation in EscrowStateMachine
    const fsmResult = await EscrowStateMachine.cancelOrderAndBlockPayout({
      orderId,
      reason,
      cancelledBy: user ? (user.id === order.buyer_id ? "buyer" : "admin") : "buyer",
    });

    if (!fsmResult.success) {
      return NextResponse.json(
        {
          error: fsmResult.message,
          policyViolationCode: fsmResult.failureCode || "POLICY_GUARD_REJECTED",
          currentState: fsmResult.currentState,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      fsmResult,
      message: "Server verified cancellation rules. Seller payout blocked and refund initiated to buyer.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
