import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ntamobfnorrejazppzej.supabase.co";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!anonKey) {
      return NextResponse.json(
        { error: "Authentication configuration missing." },
        { status: 500 }
      );
    }

    const clientSupabase = createClient(supabaseUrl, anonKey);

    const { data, error } = await clientSupabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data?.user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Fetch profile
    const { data: dbProfile } = await clientSupabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    const userMeta = data.user.user_metadata || {};

    return NextResponse.json({
      success: true,
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: dbProfile?.full_name || userMeta.full_name || data.user.email?.split("@")[0],
        username: dbProfile?.username || userMeta.username || data.user.email?.split("@")[0],
        role: dbProfile?.role || userMeta.role || "buyer",
        isVerified: dbProfile?.is_verified ?? (userMeta.role === "seller" ? false : true),
        avatarUrl: dbProfile?.avatar_url || userMeta.avatar_url,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login error" }, { status: 500 });
  }
}
