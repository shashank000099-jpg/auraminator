import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const sellerId = user?.id || "seller-001";

    const body = await req.json();
    const {
      title,
      description,
      product_type,
      base_price,
      thumbnail_url,
      media_gallery,
      variants,
      digital_asset,
      vault_link,
    } = body;

    if (!title || !base_price || !product_type) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const productId = uuidv4();
    const slug = `${slugify(title)}-${uuidv4().substring(0, 6)}`;

    const { data: product, error: prodErr } = await supabase
      .from("products")
      .insert({
        id: productId,
        seller_id: sellerId,
        title,
        slug,
        description: description || "",
        product_type,
        base_price: parseFloat(base_price),
        platform_fee_percent: 5.0,
        thumbnail_url: thumbnail_url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
        media_gallery: media_gallery || [],
        status: "published",
      })
      .select()
      .single();

    if (variants && variants.length) {
      for (const variant of variants) {
        await supabase.from("product_variants").insert({
          product_id: productId,
          sku: variant.sku || `SKU-${uuidv4().substring(0, 8).toUpperCase()}`,
          title: variant.title,
          price: parseFloat(variant.price || base_price),
          inventory_count: parseInt(variant.inventory_count || "0", 10),
          attributes: variant.attributes || {},
          status: "active",
        });
      }
    }

    if (product_type === "digital_file" && digital_asset) {
      await supabase.from("digital_assets").insert({
        product_id: productId,
        r2_asset_key: digital_asset.r2_asset_key || `sellers/${sellerId}/asset-${uuidv4()}.zip`,
        file_name: digital_asset.file_name || "asset.zip",
        file_size_bytes: digital_asset.file_size_bytes || 1024000,
        mime_type: digital_asset.mime_type || "application/zip",
        version: 1,
        is_current: true,
      });
    }

    if (product_type === "digital_link" && vault_link) {
      await supabase.from("external_vault_links").insert({
        product_id: productId,
        provider: vault_link.provider || "notion",
        destination_url: vault_link.destination_url,
        access_instructions: vault_link.access_instructions || "",
        status: "active",
      });
    }

    return NextResponse.json({ success: true, product: product || { id: productId, slug, title } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
