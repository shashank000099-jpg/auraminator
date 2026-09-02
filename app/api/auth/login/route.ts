import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ntamobfnorrejazppzej.supabase.co";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!anonKey) {
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable." },
        { status: 500 }
      );
    }

    // Use anon key to sign in (validates real credentials)
    const clientSupabase = createClient(supabaseUrl, anonKey);
    const { data, error } = await clientSupabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json({ error: "Email not confirmed. Contact support." }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data?.user) {
      return NextResponse.json({ error: "Authentication failed." }, { status: 401 });
    }

    // Fetch profile from public.profiles using service key for RLS bypass
    let dbProfile: any = null;
    if (serviceKey) {
      const adminSupabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: profileData } = await adminSupabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      dbProfile = profileData;

      // Auto-create profile if it doesn't exist (safety net)
      if (!dbProfile) {
        const userMeta = data.user.user_metadata || {};
        const autoUsername = (data.user.email || "").split("@")[0].toLowerCase();
        await adminSupabase.from("profiles").upsert({
          id: data.user.id,
          full_name: userMeta.full_name || autoUsername,
          username: userMeta.username || autoUsername,
          role: userMeta.role || "buyer",
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        dbProfile = {
          full_name: userMeta.full_name || autoUsername,
          username: userMeta.username || autoUsername,
          role: userMeta.role || "buyer",
          is_verified: false,
          avatar_url: null,
        };
      }
    }

    const userMeta = data.user.user_metadata || {};

    return NextResponse.json({
      success: true,
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email || "",
        fullName: dbProfile?.full_name || userMeta.full_name || (data.user.email || "").split("@")[0],
        username: dbProfile?.username || userMeta.username || (data.user.email || "").split("@")[0],
        role: dbProfile?.role || userMeta.role || "buyer",
        isVerified: dbProfile?.is_verified ?? false,
        avatarUrl: dbProfile?.avatar_url || userMeta.avatar_url || "",
      },
    });
  } catch (err: any) {
    console.error("[login] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error during sign in." }, { status: 500 });
  }
}
