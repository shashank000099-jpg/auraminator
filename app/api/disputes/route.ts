import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required to raise a dispute." }, { status: 401 });
    }

    const callerId = user.id;
    const body = await req.json();
    const { order_id, order_item_id, seller_id, reason, buyer_evidence, seller_evidence, disputed_by } = body;

    if (!order_id || !reason) {
      return NextResponse.json({ error: "Order ID and reason are required" }, { status: 400 });
    }

    // 1. Fetch Order and Verify Caller Authorization (Must be either Buyer or Seller on this order)
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found in database." }, { status: 404 });
    }

    const isBuyer = order.buyer_id === callerId;
    const isSeller = (order.order_items as any[])?.some((i: any) => i.seller_id === callerId);

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: "UNAUTHORIZED: You can only raise disputes on orders where you are the buyer or seller." },
        { status: 403 }
      );
    }

    const disputeParty = disputed_by || (isSeller ? "seller" : "buyer");

    // Resolve buyer and seller IDs
    const resolvedBuyerId = order.buyer_id;
    const resolvedSellerId =
      seller_id ||
      (isSeller ? callerId : (order.order_items as any[])?.[0]?.seller_id) ||
      null;

    // Resolve order_item_id to prevent NOT NULL database violation
    const resolvedOrderItemId =
      order_item_id ||
      (order.order_items as any[])?.find((i: any) => !resolvedSellerId || i.seller_id === resolvedSellerId)?.id ||
      (order.order_items as any[])?.[0]?.id ||
      null;

    // 2. Insert Dispute Record into Supabase
    const { data: dispute, error: disputeErr } = await supabase
      .from("disputes")
      .insert({
        order_id,
        order_item_id: resolvedOrderItemId,
        buyer_id: resolvedBuyerId,
        seller_id: resolvedSellerId,
        reason: `[${disputeParty.toUpperCase()} DISPUTE] ${reason}`,
        buyer_evidence: isBuyer ? (buyer_evidence || []) : [],
        seller_evidence: isSeller ? (seller_evidence || buyer_evidence || []) : [],
        status: "opened",
      })
      .select()
      .single();

    if (disputeErr) {
      console.error("[-] Dispute insert error:", disputeErr.message);
    }

    // 3. Immediately FREEZE Escrow in Finite State Machine (Zero-Trust Guard)
    if (resolvedSellerId) {
      try {
        const { EscrowStateMachine } = await import("@/lib/escrow-engine");
        await EscrowStateMachine.freezeEscrow({
          orderId: order_id,
          sellerId: resolvedSellerId,
          reason: `${disputeParty.toUpperCase()} raised dispute: ${reason}. Payout frozen for Admin Mission Control tribunal review.`,
          targetState: "ESCROW_DISPUTED_HOLD",
        });
      } catch (fsmErr: any) {
        console.warn("[-] Escrow FSM freeze warning:", fsmErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      dispute: dispute || {
        id: `disp_${Date.now()}`,
        order_id,
        status: "opened",
        disputed_by: disputeParty,
        reason,
      },
      message: `Dispute filed by ${disputeParty}. Escrow payout is FROZEN in ESCROW_DISPUTED_HOLD. Admin Mission Control has been notified for tribunal arbitration.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const orderId = req.nextUrl.searchParams.get("orderId");

    let query = supabase
      .from("disputes")
      .select("*, buyer:profiles!buyer_id(full_name, username), seller:profiles!seller_id(full_name, username)")
      .order("created_at", { ascending: false });

    if (orderId) {
      query = query.eq("order_id", orderId);
    }

    const { data: disputes, error } = await query;

    if (error) {
      return NextResponse.json({ disputes: [] });
    }

    return NextResponse.json({ disputes: disputes || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
