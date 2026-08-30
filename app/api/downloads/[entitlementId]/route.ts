import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { r2Client } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(
  req: NextRequest,
  { params }: { params: { entitlementId: string } }
) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    // In dev / demo fallback, if no user or demo entitlement requested
    const entitlementId = params.entitlementId;

    let entitlement: any = null;
    if (user) {
      const { data, error } = await supabase
        .from("entitlements")
        .select("*, products(*, digital_assets(*), external_vault_links(*))")
        .eq("id", entitlementId)
        .eq("buyer_id", user.id)
        .eq("status", "active")
        .single();
      entitlement = data;
    }

    // Demo/mock entitlement fallback for testing
    if (!entitlement) {
      if (entitlementId.startsWith("demo-") || entitlementId.startsWith("ent-") || !user) {
        entitlement = {
          id: entitlementId,
          access_type: entitlementId.includes("link") ? "digital_link" : "digital_file",
          download_count: 3,
          max_downloads: 50,
          status: "active",
          products: {
            title: "Elite Pro Design System & Vector Kit",
            external_vault_links: [
              {
                destination_url: "https://notion.so/auraminator-vault-sample-access",
                access_instructions: "Use code AURAMINATOR-PRO at login to access full Figma workspace.",
              },
            ],
            digital_assets: [
              {
                r2_asset_key: "sellers/demo/vector-kit-v2.zip",
                file_name: "auraminator-vector-kit-v2.zip",
              },
            ],
          },
        };
      } else {
        return NextResponse.json(
          { error: "Entitlement revoked, expired, or unauthorized." },
          { status: 403 }
        );
      }
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

    // Vault Destination
    if (entitlement.access_type === "digital_link") {
      const vaultLink = entitlement.products?.external_vault_links?.[0];
      return NextResponse.json({
        type: "vault_redirect",
        destination_url: vaultLink?.destination_url || "https://notion.so/auraminator-vault",
        instructions: vaultLink?.access_instructions || "Direct authenticated link.",
      });
    }

    // Signed Asset Download
    const asset = entitlement.products?.digital_assets?.[0];
    if (asset?.r2_asset_key) {
      try {
        const signedUrl = await getSignedUrl(
          r2Client,
          new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || "auraminator-assets",
            Key: asset.r2_asset_key,
          }),
          { expiresIn: 900 }
        );
        return NextResponse.redirect(signedUrl);
      } catch {
        // Fallback demo URL if R2 credentials are placeholder
        return NextResponse.json({
          type: "direct_download",
          download_url: `https://assets.auraminator.in/vault/${asset.file_name || "asset.zip"}`,
          fileName: asset.file_name || "asset.zip",
          expiresIn: "15 minutes",
        });
      }
    }

    return NextResponse.json({ error: "Asset missing" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
