import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED: Authentication required." }, { status: 401 });
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role === "admin";

    const { searchParams } = req.nextUrl;
    const sellerId = searchParams.get("sellerId");
    const buyerId = searchParams.get("buyerId");
    const status = searchParams.get("status");

    let query = supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(title, product_type, thumbnail_url, seller_id))")
      .order("created_at", { ascending: false });

    // Non-admins can only view their own buyer or seller orders
    if (!isAdmin) {
      if (sellerId && sellerId === user.id) {
        query = query.eq("items.product.seller_id", user.id);
      } else {
        query = query.eq("buyer_id", user.id);
      }
    } else {
      if (sellerId) query = query.eq("items.product.seller_id", sellerId);
      if (buyerId) query = query.eq("buyer_id", buyerId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("[orders GET]", error.message);
      return NextResponse.json({ orders: [] });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
