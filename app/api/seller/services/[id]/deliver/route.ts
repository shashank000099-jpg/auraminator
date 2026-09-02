import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * SELLER TECH SERVICE DELIVERABLE SUBMISSION
 *
 * Attaches proof of work:
 * - GitHub Pull Request / Commit URL
 * - Staging / Preview URL
 * - Technical handover documentation & architecture notes
 *
 * Transitions status to "deliverable_submitted" and initiates
 * the 7-Day (168-Hour) Buyer Inspection & Acceptance Window.
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
    const { githubPr, previewUrl, handoverNotes } = body;

    if (!githubPr && !handoverNotes) {
      return NextResponse.json(
        { error: "Please provide either a GitHub PR URL or comprehensive handover notes." },
        { status: 400 }
      );
    }

    // 1. Verify that user is the seller of this order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const isSeller = (order.order_items as any[])?.some((i: any) => i.seller_id === user.id);
    if (!isSeller) {
      return NextResponse.json({ error: "UNAUTHORIZED: Only the assigned seller can submit deliverables." }, { status: 403 });
    }

    const serviceItem = (order.order_items as any[])?.find(
      (i: any) => i.seller_id === user.id && (i.product_type === "service" || i.product_type === "tech_service")
    );

    // 2. Upsert into service_intakes
    const { data: intake, error: intakeErr } = await supabase
      .from("service_intakes")
      .upsert(
        {
          order_id: orderId,
          order_item_id: serviceItem?.id || null,
          buyer_id: order.buyer_id,
          seller_id: user.id,
          github_pr_url: githubPr || "",
          preview_url: previewUrl || "",
          handover_notes: handoverNotes || "",
          delivery_sla_days: 7, // 7-day inspection window
          status: "deliverable_submitted",
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "order_id" }
      )
      .select()
      .single();

    // 3. Update order items fulfillment status
    await supabase
      .from("order_items")
      .update({ fulfillment_status: "delivered" })
      .eq("order_id", orderId)
      .eq("seller_id", user.id);

    return NextResponse.json({
      success: true,
      serviceIntake: intake,
      message: "Deliverables submitted to buyer! 7-Day (168-Hour) Buyer Inspection & Support Window is now live. Buyer notified to review & approve.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
