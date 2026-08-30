import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const type = searchParams.get("type") || "";
    const seller = searchParams.get("seller") || "";

    const supabase = createServerSupabase();
    let { data: products, error } = await supabase
      .from("products")
      .select("*, seller:profiles(*), variants:product_variants(*), digital_assets(*), external_vault_links(*)")
      .eq("status", "published");

    if (error || !products || products.length === 0) {
      products = MOCK_PRODUCTS as any;
    }

    let filtered = [...(products as Product[])];

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.slug?.toLowerCase().includes(search)
      );
    }

    if (type && type !== "all") {
      filtered = filtered.filter((p) => p.product_type === type);
    }

    if (seller) {
      filtered = filtered.filter((p) => p.seller?.username === seller || p.seller_id === seller);
    }

    return NextResponse.json({ products: filtered });
  } catch (err: any) {
    return NextResponse.json({ products: MOCK_PRODUCTS });
  }
}
