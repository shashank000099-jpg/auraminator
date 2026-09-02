import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { EscrowStateMachine } from "@/lib/escrow-engine";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { awb, current_status, scans } = payload;

    if (!awb) {
      return NextResponse.json({ error: "AWB code is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Map Shiprocket courier status to internal lifecycle status
    let trackingStatus = "in_transit";
    if (current_status === "DELIVERED" || current_status === "Delivered") {
      trackingStatus = "delivered";
    } else if (current_status === "OUT FOR DELIVERY") {
      trackingStatus = "out_for_delivery";
    } else if (current_status?.toUpperCase().includes("RTO")) {
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

      // 2. RTO / Return Initiated: FREEZE Escrow Immediately
      if (trackingStatus === "rto_initiated") {
        await EscrowStateMachine.freezeEscrow({
          orderId: shipment.order_id,
          sellerId: shipment.seller_id,
          reason: `RTO Initiated by Courier (AWB #${awb}). Payout frozen for buyer refund.`,
          targetState: "ESCROW_FROZEN_RTO",
        });

        return NextResponse.json({
          success: true,
          trackingStatus,
          message: "Shipment marked RTO. Escrow frozen.",
        });
      }

      // 3. Proof of Delivery Verified: Execute Finite State Machine Authorization
      if (trackingStatus === "delivered") {
        const fsmResult = await EscrowStateMachine.verifyDeliveryAndAuthorize({
          orderId: shipment.order_id,
          sellerId: shipment.seller_id,
          triggerSource: "shiprocket_delivery_scan",
          referenceId: String(awb),
        });

        // Mark items as delivered in DB
        await supabase
          .from("order_items")
          .update({ fulfillment_status: "delivered" })
          .eq("order_id", shipment.order_id)
          .eq("seller_id", shipment.seller_id);

        return NextResponse.json({
          success: true,
          trackingStatus,
          fsmResult,
        });
      }
    }

    return NextResponse.json({ success: true, trackingStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
