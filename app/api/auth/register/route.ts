import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ntamobfnorrejazppzej.supabase.co";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role = "buyer" } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Full Name, Email, and Password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: "Server auth service unavailable. Contact support." },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const trimmedEmail = email.trim().toLowerCase();
    const baseUsername = trimmedEmail.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase();
    const username = baseUsername + "_" + Math.floor(1000 + Math.random() * 9000);

    // Create user - email auto-confirmed so login works immediately
    const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        username,
        role,
      },
    });

    if (createError) {
      // Friendly error messages
      if (createError.message.includes("already registered") || createError.message.includes("already been registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!userData?.user) {
      return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
    }

    // Upsert profile row in public.profiles
    const { error: profileError } = await adminSupabase.from("profiles").upsert({
      id: userData.user.id,
      full_name: fullName.trim(),
      username,
      role,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.warn("[register] Profile upsert warning:", profileError.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.user.id,
        email: trimmedEmail,
        fullName: fullName.trim(),
        username,
        role,
        isVerified: false,
        avatarUrl: "",
      },
    });
  } catch (err: any) {
    console.error("[register] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error during registration." }, { status: 500 });
  }
}
