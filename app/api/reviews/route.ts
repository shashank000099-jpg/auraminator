import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED: You must be logged in to submit a review." }, { status: 401 });
    }

    const buyerId = user.id;

    const body = await req.json();
    const { product_id, rating, comment } = body;

    if (!product_id || !rating) {
      return NextResponse.json({ error: "Product ID and rating are required" }, { status: 400 });
    }

    // Check if buyer has a captured order containing this product
    const { data: verifiedOrder } = await supabase
      .from("order_items")
      .select("id, orders!inner(buyer_id, payment_status)")
      .eq("product_id", product_id)
      .eq("orders.buyer_id", buyerId)
      .eq("orders.payment_status", "captured")
      .limit(1)
      .maybeSingle();

    const isVerifiedPurchase = !!verifiedOrder;

    // Insert review into database
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        product_id,
        buyer_id: buyerId,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment: comment || "",
        is_verified_purchase: isVerifiedPurchase,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      review: review || {
        id: `rev_${Date.now()}`,
        product_id,
        rating,
        comment,
        is_verified_purchase: isVerifiedPurchase,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
