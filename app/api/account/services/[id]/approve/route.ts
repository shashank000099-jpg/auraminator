import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { EscrowStateMachine } from "@/lib/escrow-engine";

/**
 * BUYER TECH SERVICE APPROVAL OR REVISION REQUEST
 *
 * Actions:
 * - "approve": Buyer accepts deliverables -> Releases 85% net escrow to seller
 * - "request_revision": Buyer requests changes within the 7-day warranty window
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { action = "approve", feedbackNotes } = body;

    // 1. Fetch Order and verify that user is the buyer
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: "UNAUTHORIZED: Only the buyer can approve or review service deliverables." }, { status: 403 });
    }

    const serviceItem = (order.order_items as any[])?.find(
      (i: any) => i.product_type === "service" || i.product_type === "tech_service"
    );
    const sellerId = serviceItem?.seller_id || (order.order_items as any[])?.[0]?.seller_id;

    if (action === "approve") {
      // 2A. Update service intake status
      await supabase
        .from("service_intakes")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      // 2B. Update order fulfillment status
      await supabase
        .from("order_items")
        .update({ fulfillment_status: "delivered" })
        .eq("order_id", orderId);

      // 2C. Authorize and release escrow to seller
      const fsmResult = await EscrowStateMachine.verifyDeliveryAndAuthorize({
        orderId,
        sellerId,
        triggerSource: "buyer_deal_handover",
        referenceId: `BUYER_APPROVED_${orderId.slice(0, 8)}`,
      });

      return NextResponse.json({
        success: true,
        action: "approved",
        fsmResult,
        message: "Deliverables approved! Escrow payment (85% net) authorized for transfer to seller.",
      });
    } else if (action === "request_revision") {
      // 3. Request revision within 7-day warranty (sets status back to in_progress to comply with service_intakes_status_check)
      await supabase
        .from("service_intakes")
        .update({
          status: "in_progress",
          handover_notes: feedbackNotes ? `[REVISION REQUESTED]: ${feedbackNotes}` : "Buyer requested revision on deliverables under 7-day warranty.",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      await supabase
        .from("order_items")
        .update({ fulfillment_status: "in_progress" })
        .eq("order_id", orderId);

      return NextResponse.json({
        success: true,
        action: "revision_requested",
        message: "Revision requested. Service status returned to 'in_progress'. Seller has been notified to make changes under the 7-day warranty.",
      });
    }

    return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'request_revision'." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
