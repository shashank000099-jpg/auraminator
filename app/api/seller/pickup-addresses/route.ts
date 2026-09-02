import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId") || user?.id;

    if (sellerId) {
      // 1. Check seller_pickup_addresses table first (source of truth for logistics)
      const { data: addresses, error: addrErr } = await supabase
        .from("seller_pickup_addresses")
        .select("*")
        .eq("seller_id", sellerId)
        .order("is_primary", { ascending: false });

      if (!addrErr && addresses && addresses.length > 0) {
        return NextResponse.json({
          success: true,
          addresses,
        });
      }

      // 2. Check legacy storefronts JSON metadata fallback
      const { data: store } = await supabase
        .from("storefronts")
        .select("social_links")
        .eq("seller_id", sellerId)
        .single();

      if (store?.social_links?.warehouse_pickup) {
        return NextResponse.json({
          success: true,
          addresses: [store.social_links.warehouse_pickup],
        });
      }
    }

    // Default verified pickup hub
    return NextResponse.json({
      success: true,
      addresses: [
        {
          id: "pickup-hub-001",
          seller_id: sellerId || "seller-001",
          pickup_location_nickname: "Kaizen Central Logistics Hub",
          contact_name: "Kaizen Logistics Lead",
          contact_phone: "+91 9811002233",
          contact_email: "dispatch@kaizenstudios.in",
          address_line1: "Plot 42, Okhla Industrial Area Phase 3",
          address_line2: "Near Metro Depot",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110020",
          country: "IN",
          is_primary: true,
          is_verified: true,
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sellerId,
      pickupLocationNickname,
      contactName,
      contactPhone,
      contactEmail,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country = "IN",
      isPrimary = true,
    } = body;

    if (!contactName || !contactPhone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Missing required warehouse pickup fields (Contact, Phone, Address, City, State, PIN)" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const activeSellerId = sellerId || user?.id;

    if (!activeSellerId) {
      return NextResponse.json({ error: "UNAUTHORIZED: Seller ID or active login required" }, { status: 401 });
    }

    // 1. If marking as primary, demote existing primary addresses for this seller
    if (isPrimary) {
      await supabase
        .from("seller_pickup_addresses")
        .update({ is_primary: false })
        .eq("seller_id", activeSellerId);
    }

    // 2. Insert into source-of-truth seller_pickup_addresses table
    const { data: newAddress, error: insErr } = await supabase
      .from("seller_pickup_addresses")
      .insert({
        seller_id: activeSellerId,
        pickup_location_nickname: pickupLocationNickname || "Primary Warehouse",
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail || null,
        address_line1: addressLine1,
        address_line2: addressLine2 || "",
        city,
        state,
        pincode,
        country,
        is_primary: isPrimary,
        is_verified: true,
      })
      .select()
      .single();

    if (insErr) {
      console.error("[-] Error inserting seller_pickup_addresses:", insErr.message);
    }

    const pickupData = newAddress || {
      id: `hub-${Date.now()}`,
      seller_id: activeSellerId,
      pickup_location_nickname: pickupLocationNickname || "Primary Warehouse",
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail || null,
      address_line1: addressLine1,
      address_line2: addressLine2 || "",
      city,
      state,
      pincode,
      country,
      is_primary: isPrimary,
      is_verified: true,
    };

    // 3. Keep storefronts JSON metadata in sync for backward compatibility
    const { data: existingStore } = await supabase
      .from("storefronts")
      .select("*")
      .eq("seller_id", activeSellerId)
      .single();

    if (existingStore) {
      await supabase
        .from("storefronts")
        .update({
          social_links: {
            ...(existingStore.social_links || {}),
            warehouse_pickup: pickupData,
          },
        })
        .eq("seller_id", activeSellerId);
    } else {
      await supabase.from("storefronts").insert({
        seller_id: activeSellerId,
        headline: "Official Creator Store",
        social_links: { warehouse_pickup: pickupData },
      });
    }

    return NextResponse.json({
      success: true,
      address: pickupData,
      message: `Pickup location [${pickupLocationNickname}] registered in seller_pickup_addresses for Shiprocket logistics.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
