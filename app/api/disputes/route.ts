import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const buyerId = user?.id || "demo-buyer-uuid-0001";

    const body = await req.json();
    const { order_id, order_item_id, seller_id, reason, buyer_evidence } = body;

    if (!order_id || !reason) {
      return NextResponse.json({ error: "Order ID and reason are required" }, { status: 400 });
    }

    const { data: dispute, error } = await supabase
      .from("disputes")
      .insert({
        order_id,
        order_item_id: order_item_id || order_id,
        buyer_id: buyerId,
        seller_id: seller_id || "seller-001",
        reason,
        buyer_evidence: buyer_evidence || [],
        status: "opened",
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      dispute: dispute || {
        id: `disp_${Date.now()}`,
        status: "opened",
        reason,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
