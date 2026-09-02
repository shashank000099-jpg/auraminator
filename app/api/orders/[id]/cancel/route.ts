import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { EscrowStateMachine } from "@/lib/escrow-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await req.json().catch(() => ({}));
    const { reason = "Buyer requested order cancellation before fulfillment", cancelledBy = "buyer" } = body;

    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    // Execute the cancellation & refund state machine protocol
    const fsmResult = await EscrowStateMachine.cancelOrderAndBlockPayout({
      orderId,
      reason,
      cancelledBy: user ? cancelledBy : "buyer",
    });

    if (!fsmResult.success) {
      return NextResponse.json({ error: fsmResult.message, fsmResult }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderId,
      fsmResult,
      message: "Order successfully cancelled. Seller payout blocked and refund initiated to buyer.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
