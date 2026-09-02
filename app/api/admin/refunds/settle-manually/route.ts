import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { EscrowStateMachine } from "@/lib/escrow-engine";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED: Authentication required." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "FORBIDDEN: Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, utrNumber, notes } = body;

    if (!orderId || !utrNumber) {
      return NextResponse.json(
        { error: "orderId and utrNumber (Bank UTR / Transaction Reference) are required." },
        { status: 400 }
      );
    }

    const result = await EscrowStateMachine.resolveFailedRefundManually({
      orderId,
      utrNumber,
      notes: notes || "Offline manual settlement recorded by Admin",
      adminEmail: user.email || "admin@auraminator.in",
    });

    return NextResponse.json({
      success: result.success,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
