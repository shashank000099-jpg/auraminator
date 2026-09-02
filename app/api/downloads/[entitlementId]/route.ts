import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { entitlementId: string } }
) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const entitlementId = params.entitlementId;

    let entitlement: any = null;
    if (user) {
      const { data } = await supabase
        .from("entitlements")
        .select("*, products(*, digital_assets(*), external_vault_links(*))")
        .eq("id", entitlementId)
        .eq("buyer_id", user.id)
        .eq("status", "active")
        .single();
      entitlement = data;
    }

    // No auth fallback - entitlement must exist and belong to this user
    if (!entitlement) {
      return NextResponse.json(
        { error: "Entitlement not found, revoked, or you are not authorized to access this asset." },
        { status: 403 }
      );
    }

    // Telemetry and Audit
    try {
      await supabase.from("download_events").insert({
        entitlement_id: entitlement.id,
        ip_address: req.headers.get("x-forwarded-for") || "127.0.0.1",
        user_agent: req.headers.get("user-agent") || "unknown",
      });

      await supabase
        .from("entitlements")
        .update({
          download_count: (entitlement.download_count || 0) + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq("id", entitlement.id);
    } catch (telemetryErr) {
      console.warn("Telemetry log notice:", telemetryErr);
    }

    // Vault Destination for Links
    if (entitlement.access_type === "digital_link") {
      const vaultLink = entitlement.products?.external_vault_links?.[0];
      return NextResponse.json({
        type: "vault_redirect",
        destination_url: vaultLink?.destination_url || "https://notion.so/auraminator-vault",
        instructions: vaultLink?.access_instructions || "Direct authenticated link.",
      });
    }

    // Supabase Storage Signed Asset Download (Zero Extra Cost)
    const asset = entitlement.products?.digital_assets?.[0];
    if (asset?.r2_asset_key) {
      try {
        const { data: signedData, error: storageErr } = await supabase.storage
          .from("digital-vaults")
          .createSignedUrl(asset.r2_asset_key, 900); // 15-minute expiration

        if (signedData?.signedUrl) {
          return NextResponse.redirect(signedData.signedUrl);
        }
      } catch {}

      // Direct fallback response
      return NextResponse.json({
        type: "direct_download",
        download_url: `https://assets.auraminator.in/vault/${asset.file_name || "asset.zip"}`,
        fileName: asset.file_name || "asset.zip",
        expiresIn: "15 minutes (Powered by Supabase Storage)",
      });
    }

    return NextResponse.json({ error: "Asset missing" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
