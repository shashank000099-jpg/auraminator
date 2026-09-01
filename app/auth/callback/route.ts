import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect = requestUrl.searchParams.get("redirect") || "/explore";

  if (code) {
    try {
      const supabase = createServerSupabase();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {}
  }

  return NextResponse.redirect(new URL(redirect, requestUrl.origin));
}
