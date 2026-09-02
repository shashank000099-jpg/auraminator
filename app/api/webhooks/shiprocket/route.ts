import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { EscrowStateMachine } from "@/lib/escrow-engine";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);

    if (!payload) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // 0. Verify Webhook Authenticity
    const webhookToken =
      req.headers.get("x-shiprocket-token") ||
      req.headers.get("x-api-key") ||
      req.nextUrl.searchParams.get("token");
    const configuredToken = process.env.SHIPROCKET_WEBHOOK_TOKEN || process.env.SHIPROCKET_PASSWORD;

    if (configuredToken && configuredToken !== "placeholder-password" && webhookToken !== configuredToken) {
      return NextResponse.json({ error: "UNAUTHORIZED: Invalid Shiprocket webhook token." }, { status: 401 });
    }

    const { awb, current_status, scans, order_id: shiprocketOrderId } = payload;

    if (!awb) {
      return NextResponse.json({ error: "AWB code is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Resolve shipment from database by AWB
    const { data: shipment } = await supabase
      .from("shipments")
      .select("*, orders(*)")
      .eq("awb_code", awb)
      .single();

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found for AWB code: " + awb }, { status: 404 });
    }

    // 2. Map Shiprocket courier status to internal lifecycle status
    let trackingStatus = "in_transit";
    if (current_status === "DELIVERED" || current_status === "Delivered") {
      trackingStatus = "delivered";
    } else if (current_status === "OUT FOR DELIVERY") {
      trackingStatus = "out_for_delivery";
    } else if (current_status?.toUpperCase().includes("RTO")) {
      trackingStatus = "rto_initiated";
    }

    // 3. Idempotency: Check if this exact tracking status was already processed for this shipment UUID
    const { data: existingEvent } = await supabase
      .from("shipment_events")
      .select("id")
      .eq("shipment_id", shipment.id)
      .eq("status", trackingStatus)
      .limit(1)
      .maybeSingle();

    if (existingEvent && shipment.tracking_status === trackingStatus) {
      return NextResponse.json({ success: true, message: "Duplicate event acknowledged", trackingStatus });
    }

    // Update shipment tracking status
    await supabase
      .from("shipments")
      .update({
        tracking_status: trackingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shipment.id);

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
