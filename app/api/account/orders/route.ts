import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId") || user?.id;

    if (!userId) {
      return NextResponse.json({ orders: [], entitlements: [] });
    }

    if (user && user.id !== userId) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "FORBIDDEN: You do not have permission to view other users' orders." }, { status: 403 });
      }
    }

    // 1. Fetch user orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(*))")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false });

    // 2. Fetch digital entitlements from source-of-truth entitlements table
    const { data: entitlements } = await supabase
      .from("entitlements")
      .select("*, product:products(*)")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      orders: orders || [],
      entitlements: entitlements || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
