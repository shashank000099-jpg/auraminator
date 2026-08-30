import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { awb, current_status, scans } = payload;

    const supabase = createServerSupabase();

    // Map Shiprocket status to internal status
    let trackingStatus = "in_transit";
    if (current_status === "DELIVERED" || current_status === "Delivered") {
      trackingStatus = "delivered";
    } else if (current_status === "OUT FOR DELIVERY") {
      trackingStatus = "out_for_delivery";
    } else if (current_status?.includes("RTO")) {
      trackingStatus = "rto_initiated";
    }

    const { data: shipment } = await supabase
      .from("shipments")
      .update({
        tracking_status: trackingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("awb_code", awb)
      .select("*, orders(*)")
      .single();

    if (shipment) {
      await supabase.from("shipment_events").insert({
        shipment_id: shipment.id,
        status: trackingStatus,
        location: scans?.[0]?.location || "Transit Hub",
        raw_payload: payload,
      });

      // If delivered, automatically trigger Double-Entry Escrow Release to Seller
      if (trackingStatus === "delivered") {
        await supabase.from("ledger_entries").insert({
          seller_id: shipment.seller_id,
          order_id: shipment.order_id,
          entry_type: "escrow_release",
          amount: shipment.orders?.total_seller_net || 0,
          balance_type: "available",
          description: `Escrow released upon verified physical delivery (AWB #${awb})`,
        });

        await supabase
          .from("order_items")
          .update({ fulfillment_status: "delivered" })
          .eq("order_id", shipment.order_id);
      }
    }

    return NextResponse.json({ success: true, trackingStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
