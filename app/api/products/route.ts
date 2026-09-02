import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { Product } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const type = searchParams.get("type") || "";
    const seller = searchParams.get("seller") || "";

    const supabase = createServerSupabase();
    let query = supabase
      .from("products")
      .select("*, seller:profiles(id, full_name, username, avatar_url, is_verified, bio), variants:product_variants(*), digital_assets(id, file_name, file_size_bytes, mime_type)")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (type && type !== "all") {
      query = query.eq("product_type", type);
    }

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({ products: [] });
    }

    let filtered = [...((products || []) as Product[])];

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.slug?.toLowerCase().includes(search)
      );
    }

    if (seller) {
      filtered = filtered.filter((p) => p.seller?.username === seller || p.seller_id === seller);
    }

    return NextResponse.json({ products: filtered });
  } catch (err: any) {
    return NextResponse.json({ products: [] });
  }
}
