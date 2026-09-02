import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role = "buyer" } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Full Name, Email, and Password are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ntamobfnorrejazppzej.supabase.co";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      return NextResponse.json(
        { error: "Server authentication service is temporarily unavailable." },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const trimmedEmail = email.trim().toLowerCase();
    const username = trimmedEmail.split("@")[0].replace(/[^a-z0-9]/g, "");

    // 1. Create user with email auto-confirmed so they can log in instantly
    const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        username,
        role,
        is_verified: role === "seller" ? false : true,
      },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!userData?.user) {
      return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
    }

    // 2. Upsert profile in public.profiles table
    try {
      await adminSupabase.from("profiles").upsert({
        id: userData.user.id,
        full_name: fullName.trim(),
        username,
        role,
        is_verified: role === "seller" ? false : true,
        updated_at: new Date().toISOString(),
      });
    } catch (profileErr) {
      console.warn("Profile sync warning:", profileErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.user.id,
        email: trimmedEmail,
        fullName: fullName.trim(),
        username,
        role,
        isVerified: role === "seller" ? false : true,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Registration error" }, { status: 500 });
  }
}
