import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { shiprocket } from "@/lib/shiprocket";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderItemId, sellerId, pickupLocation } = body;

    const supabase = createServerSupabase();
    const { data: order } = await supabase
      .from("orders")
      .select("*, shipping_address:order_shipping_addresses(*), order_items(*, products(*))")
      .eq("id", orderId)
      .single();

    const address = order?.shipping_address;
    const items = (order?.order_items || []).filter((i: any) => i.product_type === "physical");

    // Call Shiprocket Order Creation
    const srRes = await shiprocket.createAdhocOrder({
      order_id: orderId.slice(0, 10),
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: pickupLocation || "Primary Warehouse",
      billing_customer_name: address?.full_name || "Customer",
      billing_address: address?.address_line1 || "Main Street",
      billing_address_2: address?.address_line2 || "",
      billing_city: address?.city || "Mumbai",
      billing_pincode: address?.postal_code || "400001",
      billing_state: address?.state || "Maharashtra",
      billing_country: "India",
      billing_phone: address?.phone || "9876543210",
      shipping_is_billing: true,
      order_items: items.map((i: any) => ({
        name: i.products?.title || "Merch Drop Item",
        sku: i.variant_id || "SKU-DEF",
        units: i.quantity,
        selling_price: i.unit_price,
      })),
      payment_method: "Prepaid",
      sub_total: order?.total_amount || 2199,
      length: 30,
      breadth: 20,
      height: 10,
      weight: 0.8,
    });

    // Record Shipment in DB
    const { data: shipment } = await supabase
      .from("shipments")
      .insert({
        order_id: orderId,
        seller_id: sellerId || "seller-001",
        shiprocket_order_id: String(srRes.order_id),
        shiprocket_shipment_id: String(srRes.shipment_id),
        awb_code: srRes.awb_code,
        courier_name: srRes.courier_name,
        tracking_status: "pickup_scheduled",
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      shipment: shipment || {
        awb_code: srRes.awb_code,
        courier_name: srRes.courier_name,
        tracking_status: "pickup_scheduled",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const awb = searchParams.get("awb");

    if (!awb) {
      return NextResponse.json({ error: "AWB is required" }, { status: 400 });
    }

    const trackingData = await shiprocket.getTrackingDetails(awb);
    return NextResponse.json({ success: true, tracking: trackingData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
