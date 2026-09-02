import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || "buyer";

  try {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data, error } = await supabase
        .from("offers")
        .select("*, product:products(*), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)")
        .or(role === "seller" ? `seller_id.eq.${session.user.id}` : `buyer_id.eq.${session.user.id}`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, offers: data });
      }
    }

    return NextResponse.json({
      success: true,
      offers: [],
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      offers: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, offerAmount, termsNote } = body;

    if (!productId || !offerAmount || offerAmount <= 0) {
      return NextResponse.json(
        { error: "Product ID and valid offer amount are required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED: You must be logged in to make an offer." },
        { status: 401 }
      );
    }

    const buyerId = user.id;

    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", productId)
      .single();

    if (prodErr || !product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const sellerId = product.seller_id;

    const offerPayload = {
      product_id: productId,
      buyer_id: buyerId,
      seller_id: sellerId,
      initial_offer_amount: parseFloat(offerAmount),
      current_offer_amount: parseFloat(offerAmount),
      last_offered_by: "buyer" as const,
      status: "pending" as const,
      terms_note: termsNote || "Standard buyer offer subject to 7-day escrow inspection.",
    };

    const { data: insertedOffer, error: insertErr } = await supabase
      .from("offers")
      .insert(offerPayload)
      .select()
      .single();

    if (insertErr) {
      console.error("[-] Offer insert error:", insertErr.message);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      offer: insertedOffer,
      message: "Offer submitted successfully. The seller has been notified to review or counter.",
      dealUrl: `/account/deals`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit offer" },
      { status: 500 }
    );
  }
}
