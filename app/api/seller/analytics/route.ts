import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const sellerId = user?.id || "seller-001";

    const { data: ledgerEntries } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    // Calculate balances
    let pendingEscrow = 0;
    let availableBalance = 0;
    let totalLifetimeEarnings = 0;

    if (ledgerEntries && ledgerEntries.length > 0) {
      for (const entry of ledgerEntries) {
        const amt = parseFloat(entry.amount);
        if (entry.balance_type === "pending" && entry.entry_type === "credit_escrow") {
          pendingEscrow += amt;
        } else if (entry.balance_type === "available") {
          if (entry.entry_type === "escrow_release") availableBalance += amt;
          if (entry.entry_type === "debit_payout") availableBalance -= amt;
        }
        if (entry.entry_type === "credit_escrow" || entry.entry_type === "escrow_release") {
          totalLifetimeEarnings += amt;
        }
      }
    } else {
      // Demo analytics for seller preview
      pendingEscrow = 48200;
      availableBalance = 124500;
      totalLifetimeEarnings = 684000;
    }

    return NextResponse.json({
      pendingEscrow,
      availableBalance,
      totalLifetimeEarnings,
      totalOrders: 142,
      activeDisputes: 0,
      ledger: ledgerEntries || [
        {
          id: "led-01",
          entry_type: "credit_escrow",
          amount: 3324,
          balance_type: "pending",
          description: "Escrow hold for Order #ORD-98214 (Vortex Hoodie)",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "led-02",
          entry_type: "escrow_release",
          amount: 7990,
          balance_type: "available",
          description: "Escrow released for Order #ORD-97810 (Delivered)",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "led-03",
          entry_type: "debit_payout",
          amount: 50000,
          balance_type: "available",
          description: "Weekly payout transfer to HDFC Bank (**** 4891)",
          created_at: new Date(Date.now() - 259200000).toISOString(),
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
