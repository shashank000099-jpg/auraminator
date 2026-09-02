import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED: Authentication required." }, { status: 401 });
    }

    const requestedUserId = req.nextUrl.searchParams.get("userId") || user.id;

    // If caller requests a different user's profile, verify admin privileges
    if (requestedUserId !== user.id) {
      const { data: callerProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (callerProfile?.role !== "admin") {
        return NextResponse.json(
          { error: "FORBIDDEN: You do not have permission to view other users' private profiles." },
          { status: 403 }
        );
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", requestedUserId)
      .single();

    const { data: authUser } = await supabase.auth.admin.getUserById(requestedUserId);
    const userMeta = authUser?.user?.user_metadata || {};

    return NextResponse.json({
      success: true,
      profile: {
        id: requestedUserId,
        email: authUser?.user?.email || "",
        fullName: profile?.full_name || userMeta.full_name || "",
        username: profile?.username || userMeta.username || "",
        avatarUrl: profile?.avatar_url || userMeta.avatar_url || "",
        bio: profile?.bio || userMeta.bio || "",
        phone: userMeta.phone || "",
        role: profile?.role || userMeta.role || "buyer",
        isVerified: profile?.is_verified ?? false,
        shippingAddress: userMeta.shipping_address || {
          street: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED: Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { userId, fullName, username, bio, avatarUrl, phone, shippingAddress } = body;
    const targetUserId = userId || user.id;

    // If caller tries to update a different user's profile, verify admin privileges
    if (targetUserId !== user.id) {
      const { data: callerProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (callerProfile?.role !== "admin") {
        return NextResponse.json(
          { error: "FORBIDDEN: You do not have permission to modify other users' profiles." },
          { status: 403 }
        );
      }
    }

    // 1. Update public.profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName?.trim(),
        username: username?.trim()?.toLowerCase(),
        bio: bio?.trim(),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);

    if (profileError) {
      console.warn("Profile table update warning:", profileError.message);
    }

    // 2. Update user_metadata in auth.users
    const { error: authError } = await supabase.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        full_name: fullName?.trim(),
        username: username?.trim()?.toLowerCase(),
        bio: bio?.trim(),
        avatar_url: avatarUrl,
        phone: phone?.trim(),
        shipping_address: shippingAddress,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile and settings updated successfully",
      profile: {
        id: targetUserId,
        fullName: fullName?.trim(),
        username: username?.trim()?.toLowerCase(),
        bio: bio?.trim(),
        avatarUrl,
        phone: phone?.trim(),
        shippingAddress,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
