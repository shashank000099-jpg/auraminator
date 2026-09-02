import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    const supabase = createServerSupabase();

    const { data: product, error } = await supabase
      .from("products")
      .select("*, seller:profiles(*), variants:product_variants(*), digital_assets(*), external_vault_links(*)")
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .single();

    if (!error && product) {
      return NextResponse.json({ product });
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
