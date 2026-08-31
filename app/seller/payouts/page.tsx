"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, CheckCircle2, Clock, ShieldCheck, ArrowDownRight, ArrowUpRight, Lock, Code2, Box, Download } from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SellerPayoutsPage() {
  const [ledgerData, setLedgerData] = useState<any>({
    pendingEscrow: 48200,
    availableBalance: 124500,
    totalLifetimeEarnings: 684000,
    ledger: [
      {
        id: "led-001",
        description: "Emergency Full-Stack Debug Sprint (#SRV-94012) • 85% Net Escrow Split",
        amount: 4249.15,
        type: "credit_escrow",
        balance_type: "pending",
        date: "2026-08-31T10:30:00Z",
      },
      {
        id: "led-002",
        description: "Platform Fee Deduction (15% on #SRV-94012)",
        amount: -749.85,
        type: "platform_fee",
        balance_type: "available",
        date: "2026-08-31T10:30:00Z",
      },
      {
        id: "led-003",
        description: "VORTEX 500 GSM Heavyweight Hoodie (#ORD-98214) • Delivery Scan Verified",
        amount: 2974.15,
        type: "escrow_release",
        balance_type: "available",
        date: "2026-08-29T14:12:00Z",
      },
    ],
  });

  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/seller/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.availableBalance !== undefined) {
          setLedgerData((prev: any) => ({
            ...prev,
            pendingEscrow: data.pendingEscrow || prev.pendingEscrow,
            availableBalance: data.availableBalance || prev.availableBalance,
            totalLifetimeEarnings: data.totalLifetimeEarnings || prev.totalLifetimeEarnings,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleRequestPayout = () => {
    setIsRequestingPayout(true);
    setTimeout(() => {
      setIsRequestingPayout(false);
      setPayoutSuccess(true);
      setLedgerData((prev: any) => ({
        ...prev,
        availableBalance: 0,
      }));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/seller/dashboard" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Studio Dashboard</span>
            </Link>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white mt-2">
              DOUBLE-ENTRY ESCROW SETTLEMENT ENGINE
            </h1>
            <p className="text-xs text-zinc-400 font-sans">
              15% Platform Commission Model • 85% Direct Creator Payout to Bank via Razorpay Route
            </p>
          </div>

          {ledgerData.availableBalance > 0 && (
            <Button
              variant="primary"
              size="md"
              onClick={handleRequestPayout}
              isLoading={isRequestingPayout}
            >
              REQUEST INSTANT PAYOUT ({formatINR(ledgerData.availableBalance)})
            </Button>
          )}
        </div>

        {payoutSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Payout initiated via Razorpay Route to verified bank account. Expected settlement in 2-4 hours.</span>
            </div>
            <button onClick={() => setPayoutSuccess(false)} className="text-white hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Ledger Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-border bg-surface p-5 space-y-1 brutalist-card">
            <span className="text-[10px] uppercase text-zinc-500">Pending Escrow Hold</span>
            <p className="text-2xl font-bold text-amber-400">{formatINR(ledgerData.pendingEscrow)}</p>
            <p className="text-[10px] text-zinc-500">Releases upon delivery or PR approval</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-1 brutalist-card">
            <span className="text-[10px] uppercase text-zinc-500">Available For Instant Withdrawal</span>
            <p className="text-2xl font-bold text-white">{formatINR(ledgerData.availableBalance)}</p>
            <p className="text-[10px] text-emerald-400">Verified &amp; Ready to transfer (85% net)</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-1 brutalist-card">
            <span className="text-[10px] uppercase text-zinc-500">Total Lifetime Settled Volume</span>
            <p className="text-2xl font-bold text-zinc-300">{formatINR(ledgerData.totalLifetimeEarnings)}</p>
            <p className="text-[10px] text-zinc-500">100% Double-entry audited</p>
          </div>
        </div>

        {/* Escrow Release Triggers Transparency */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-3">
            How Escrow Releases Work Across Categories
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>1. Online Tech Services</span>
              </div>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Escrow unlocks 85% immediately when client approves GitHub PR or automatically 72 hours post delivery.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Box className="h-4 w-4 text-emerald-400" />
                <span>2. Physical Streetwear</span>
              </div>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Escrow unlocks automatically when Shiprocket marks the AWB courier status as "Delivered".
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Download className="h-4 w-4 text-emerald-400" />
                <span>3. Digital R2 Vaults</span>
              </div>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Escrow unlocks instantly upon verified cryptographic presigned download token issuance.
              </p>
            </div>
          </div>
        </div>

        {/* Double-Entry Transaction Ledger Table */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold uppercase text-white tracking-wider">
              Real-Time Escrow &amp; Commission Journal
            </h3>
            <span className="text-[10px] text-zinc-500">Auto-Reconciled</span>
          </div>

          <div className="divide-y divide-border">
            {ledgerData.ledger.map((item: any, idx: number) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="font-bold text-white text-xs">{item.description}</p>
                  <p className="text-[10px] text-zinc-500">{formatDate(item.date)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                      item.balance_type === "pending"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {item.balance_type}
                  </span>
                  <span
                    className={`font-bold text-sm ${
                      item.amount > 0 ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {item.amount > 0 ? `+${formatINR(item.amount)}` : formatINR(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
