import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required for seller onboarding." }, { status: 401 });
    }

    const sellerId = user.id;

    const body = await req.json();
    const { legal_business_name, tax_identifier, document_urls, bank_details } = body;

    if (!legal_business_name) {
      return NextResponse.json({ error: "Legal business name is required" }, { status: 400 });
    }

    const { data: onboarding, error: obErr } = await supabase
      .from("seller_onboarding")
      .upsert({
        seller_id: sellerId,
        legal_business_name,
        tax_identifier: tax_identifier || null,
        document_urls: document_urls || [],
        verification_status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bank_details) {
      await supabase.from("seller_payout_accounts").upsert({
        seller_id: sellerId,
        gateway_account_id: `acc_${Math.random().toString(36).substring(2, 10)}`,
        settlement_bank_details: bank_details,
        is_active: true,
      });
    }

    return NextResponse.json({
      success: true,
      status: "pending",
      message: "KYC documents submitted for verification. Review typically takes 12-24 hours.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
