import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({
        pendingEscrow: 0,
        availableBalance: 0,
        totalLifetimeEarnings: 0,
        totalOrders: 0,
        activeDisputes: 0,
        ledger: [],
      });
    }

    const sellerId = user.id;

    // 1. Fetch real ledger entries
    const { data: ledgerEntries } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    // 2. Fetch real products and orders count
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", sellerId);

    const { data: dealRooms } = await supabase
      .from("deal_rooms")
      .select("agreed_price, seller_payout, escrow_status")
      .eq("seller_id", sellerId);

    // Calculate live balances
    let pendingEscrow = 0;
    let availableBalance = 0;
    let totalLifetimeEarnings = 0;
    let activeDisputes = 0;

    if (dealRooms && dealRooms.length > 0) {
      for (const deal of dealRooms) {
        if (deal.escrow_status === "escrow_locked" || deal.escrow_status === "buyer_inspecting") {
          pendingEscrow += deal.seller_payout || 0;
        } else if (deal.escrow_status === "completed_paid") {
          availableBalance += deal.seller_payout || 0;
          totalLifetimeEarnings += deal.seller_payout || 0;
        } else if (deal.escrow_status === "disputed") {
          activeDisputes += 1;
        }
      }
    }

    if (ledgerEntries && ledgerEntries.length > 0) {
      for (const entry of ledgerEntries) {
        const amt = parseFloat(entry.amount);
        if (entry.balance_type === "pending" && entry.entry_type === "credit_escrow") {
          pendingEscrow += amt;
        } else if (entry.balance_type === "available") {
          if (entry.entry_type === "escrow_release") availableBalance += amt;
          if (entry.entry_type === "debit_payout") availableBalance -= amt;
        }
      }
    }

    return NextResponse.json({
      pendingEscrow,
      availableBalance,
      totalLifetimeEarnings,
      totalOrders: dealRooms?.length || 0,
      activeDisputes,
      ledger: ledgerEntries || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
