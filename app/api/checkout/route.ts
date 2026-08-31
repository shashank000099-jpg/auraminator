import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { razorpay } from "@/lib/razorpay";
import { v4 as uuidv4 } from "uuid";

interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  sellerId: string;
  productType: string;
  title: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingAddress, couponCode, sessionId } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const buyerId = user?.id || "demo-buyer-uuid-0001";
    const anonSessionId = sessionId || `sess_${uuidv4().substring(0, 8)}`;

    // 1. Concurrency Reservation for Physical Items via Supabase RPC
    const reservations: string[] = [];
    for (const item of items) {
      if (item.productType === "physical" && item.variantId) {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc("reserve_inventory", {
          p_variant_id: item.variantId,
          p_quantity: item.quantity,
          p_session_id: anonSessionId,
        });

        if (rpcErr || (rpcRes && !rpcRes.success)) {
          // Rollback existing reservations
          for (const resId of reservations) {
            await supabase.rpc("release_inventory", { p_reservation_id: resId });
          }
          return NextResponse.json(
            { error: `Insufficient inventory for ${item.title}` },
            { status: 409 }
          );
        }

        if (rpcRes?.reservation_id) {
          reservations.push(rpcRes.reservation_id);
        }
      }
    }

    // 2. Compute Totals & Multi-Vendor Splits
    let itemsSubtotal = 0;
    let totalPlatformCut = 0;
    let totalSellerNet = 0;

    const orderItemsPayload = items.map((item: CheckoutItem) => {
      const subtotal = item.unitPrice * item.quantity;
      const platformFeePercent = 15.0; // 15% platform commission
      const platformFee = (subtotal * platformFeePercent) / 100;
      const sellerShare = subtotal - platformFee;

      itemsSubtotal += subtotal;
      totalPlatformCut += platformFee;
      totalSellerNet += sellerShare;

      return {
        product_id: item.productId,
        variant_id: item.variantId || null,
        seller_id: item.sellerId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal,
        platform_fee: platformFee,
        seller_share: sellerShare,
        product_type: item.productType,
        fulfillment_status: "unfulfilled",
      };
    });

    let discountAmount = 0;
    if (couponCode && couponCode.toUpperCase() === "AURA10") {
      discountAmount = Math.round(itemsSubtotal * 0.1);
    }

    const hasPhysicalItems = items.some((i: CheckoutItem) => i.productType === "physical");
    // Buyer pays shipping fee (₹149 for physical courier delivery, ₹0 for digital/services)
    const shippingFee = body.shippingFee !== undefined ? body.shippingFee : (hasPhysicalItems ? 149 : 0);
    const discountedBase = Math.max(0, itemsSubtotal - discountAmount);
    // Buyer pays Razorpay 2.36% Gateway Fee (2% + 18% GST)
    const gatewayFee = body.gatewayFee !== undefined ? body.gatewayFee : Math.round((discountedBase + shippingFee) * 0.0236);
    const totalGross = discountedBase + shippingFee + gatewayFee;

    // 3. Create Order in Database
    const orderId = uuidv4();
    const { data: createdOrder, error: orderErr } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        buyer_id: buyerId,
        total_amount: totalGross,
        items_subtotal: itemsSubtotal,
        shipping_fee: shippingFee,
        gateway_fee: gatewayFee,
        total_platform_cut: totalPlatformCut,
        total_seller_net: totalSellerNet,
        payment_status: "pending",
        coupon_code: couponCode || null,
        discount_amount: discountAmount,
      })
      .select()
      .single();

    if (shippingAddress) {
      await supabase.from("order_shipping_addresses").insert({
        order_id: orderId,
        full_name: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address_line1: shippingAddress.addressLine1,
        address_line2: shippingAddress.addressLine2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country || "IN",
      });
    }

    for (const itemPayload of orderItemsPayload) {
      await supabase.from("order_items").insert({
        order_id: orderId,
        ...itemPayload,
      });
    }

    // 4. Create Razorpay Payment Order
    const rzpOrder = await razorpay.createOrder({
      amount: Math.round(totalGross * 100), // in paise
      currency: "INR",
      receipt: `aura_${orderId.slice(0, 8)}`,
      notes: {
        orderId,
        buyerId,
      },
    });

    await supabase
      .from("orders")
      .update({ gateway_order_id: rzpOrder.id })
      .eq("id", orderId);

    return NextResponse.json({
      success: true,
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: totalGross,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      reservations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Checkout failed" }, { status: 500 });
  }
}
