import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    if (!idOrSlug) {
      return NextResponse.json({ error: "Product identifier missing" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    let query = supabase
      .from("products")
      .select("*, seller:profiles(id, full_name, username, avatar_url, is_verified, bio), variants:product_variants(*), digital_assets(id, file_name, file_size_bytes, mime_type)");

    if (isUUID) {
      query = query.eq("id", idOrSlug);
    } else {
      query = query.eq("slug", idOrSlug);
    }

    const { data: product, error } = await query.single();

    if (!error && product) {
      return NextResponse.json({ product });
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
