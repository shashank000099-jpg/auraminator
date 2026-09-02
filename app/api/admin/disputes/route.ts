import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * ADMIN MISSION CONTROL - DISPUTE TRIBUNAL QUEUE
 *
 * Fetches all open disputes with complete context:
 * - Payment & order details (gross, platform cut, seller net, status)
 * - Buyer & seller profile and contact info
 * - Service intake requirements, GitHub PR, staging preview, handover notes
 * - Uploaded evidence from buyer and seller
 * - Ledger entries / Escrow status
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "UNAUTHORIZED: Admin access required." }, { status: 403 });
    }

    // Fetch all disputes with order, buyer, seller
    const { data: disputes, error: dispErr } = await supabase
      .from("disputes")
      .select(`
        *,
        order:orders(
          *,
          shipping_address:order_shipping_addresses(*),
          order_items(*, product:products(*))
        ),
        buyer:profiles!buyer_id(*),
        seller:profiles!seller_id(*)
      `)
      .order("created_at", { ascending: false });

    if (dispErr) {
      return NextResponse.json({ disputes: [] });
    }

    // Also enrich with service intakes if available
    const enriched = await Promise.all(
      (disputes || []).map(async (d: any) => {
        let serviceIntake = null;
        if (d.order_id) {
          const { data: si } = await supabase
            .from("service_intakes")
            .select("*")
            .eq("order_id", d.order_id)
            .single();
          serviceIntake = si;
        }

        // Fetch ledger entries for this order
        const { data: ledger } = await supabase
          .from("ledger_entries")
          .select("*")
          .eq("order_id", d.order_id)
          .order("created_at", { ascending: false });

        return {
          ...d,
          service_intake: serviceIntake,
          ledger_entries: ledger || [],
        };
      })
    );

    return NextResponse.json({ success: true, disputes: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
