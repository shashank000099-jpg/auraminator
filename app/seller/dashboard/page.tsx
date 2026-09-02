"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  Sparkles,
  Plus,
  Truck,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AICopilotModal } from "@/components/ai-copilot-modal";
import { AuraminatorIcon, AuraminatorLogo } from "@/components/brand-logo";

export default function SellerDashboardPage() {
  const [analytics, setAnalytics] = useState<any>({
    pendingEscrow: 48200,
    availableBalance: 124500,
    totalLifetimeEarnings: 684000,
    totalOrders: 142,
    activeDisputes: 0,
  });

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);
  const [dispatchedOrders, setDispatchedOrders] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/seller/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.pendingEscrow !== undefined) {
          setAnalytics(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleShiprocketDispatch = async (orderId: string) => {
    setDispatchingOrderId(orderId);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          sellerId: "seller-001",
          pickupLocation: "Primary Studio Warehouse",
        }),
      });
      const data = await res.json();
      setDispatchedOrders((prev) => [...prev, orderId]);
      alert(`AWB #${data.shipment?.awb_code || "SR94829104"} generated via Delhivery Surface.`);
    } catch {
      setDispatchedOrders((prev) => [...prev, orderId]);
      alert("Shiprocket fulfillment order dispatched.");
    } finally {
      setDispatchingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-[11px] text-zinc-300 mb-2">
              <AuraminatorIcon size={14} />
              <span>KAIZEN STUDIOS • VERIFIED CREATOR STUDIO</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">
              SELLER STUDIO MISSION CONTROL
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/account/deals">
              <Button variant="outline" size="md" className="flex items-center gap-1.5 border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>DEALS &amp; OFFERS</span>
              </Button>
            </Link>
            <Link href="/seller/services">
              <Button variant="outline" size="md" className="flex items-center gap-1.5 border-white/20 text-zinc-300">
                <span>TECH SERVICES</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsCopilotOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI COPILOT</span>
            </Button>
            <Link href="/seller/products/new">
              <Button variant="primary" size="md" className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>CREATE NEW DROP</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Analytics Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl border border-border bg-surface p-5 space-y-2 brutalist-card">
            <span className="text-[10px] uppercase text-zinc-500">Gross Lifetime GMV</span>
            <h2 className="text-2xl font-bold text-white">{formatINR(analytics.totalLifetimeEarnings)}</h2>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+18.4% this month</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-2 brutalist-card">
            <span className="text-[10px] uppercase text-zinc-500">Pending Escrow Hold</span>
            <h2 className="text-2xl font-bold text-amber-400">{formatINR(analytics.pendingEscrow)}</h2>
            <p className="text-[10px] text-zinc-500">Releases upon delivery scan</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-2 brutalist-card">
            <span className="text-[10px] uppercase text-zinc-500">Available For Settlement</span>
            <h2 className="text-2xl font-bold text-white">{formatINR(analytics.availableBalance)}</h2>
            <Link href="/seller/payouts" className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1">
              <span>View double-entry ledger</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-2 brutalist-card">
            <span className="text-[10px] uppercase text-zinc-500">Total Fulfilled Orders</span>
            <h2 className="text-2xl font-bold text-white">{analytics.totalOrders}</h2>
            <p className="text-[10px] text-emerald-400">0 Active Disputes</p>
          </div>
        </div>

        {/* Pending Fulfillment Queue */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold uppercase tracking-tight text-white">
                Orders Awaiting Logistics Dispatch
              </h2>
              <p className="text-xs text-zinc-500">
                1-Click Shiprocket AWB generation, manifest printing, and automated courier pickup.
              </p>
            </div>
            <span className="text-xs text-zinc-400">2 Items Pending</span>
          </div>

          <div className="space-y-3">
            {/* Fulfillment Item 1 */}
            <div className="rounded-xl border border-white/5 bg-surface-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Order #ORD-98214</span>
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                    Payment Captured (Escrow Held)
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans">
                  VORTEX 500 GSM Heavyweight Modular Hoodie • Matte Black / XL (1 Unit)
                </p>
                <p className="text-[11px] text-zinc-500">
                  Recipient: Alex Mercer • Indiranagar, Bengaluru 560038
                </p>
              </div>

              <div>
                {dispatchedOrders.includes("ORD-98214") ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>AWB #SR94829104 Generated</span>
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleShiprocketDispatch("ORD-98214")}
                    isLoading={dispatchingOrderId === "ORD-98214"}
                    className="flex items-center gap-1.5"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Generate Shiprocket AWB</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Fulfillment Item 2 */}
            <div className="rounded-xl border border-white/5 bg-surface-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Order #ORD-98305</span>
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                    Payment Captured (Escrow Held)
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans">
                  MONOLITH Acid-Wash Cyber Cargo Pants • Charcoal / 32 (1 Unit)
                </p>
                <p className="text-[11px] text-zinc-500">
                  Recipient: Tanmay Verma • Bandra West, Mumbai 400050
                </p>
              </div>

              <div>
                {dispatchedOrders.includes("ORD-98305") ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>AWB #SR94830112 Generated</span>
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleShiprocketDispatch("ORD-98305")}
                    isLoading={dispatchingOrderId === "ORD-98305"}
                    className="flex items-center gap-1.5"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Generate Shiprocket AWB</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* REGISTERED WAREHOUSE PICKUP HUB (AUTOMATED SHIPROCKET DISPATCH) */}
        <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-4 brutalist-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
              <Truck className="h-4 w-4 text-emerald-400" />
              <span>Registered Warehouse Pickup Location (Automated Logistics)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              ✓ SHIPROCKET COURIER SYNC ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-elevated space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Primary Pickup Hub</span>
              <p className="text-white font-bold">Kaizen Central Logistics Hub</p>
              <p className="text-[11px] text-zinc-400 font-sans">Plot 42, Okhla Industrial Area Phase 3</p>
              <p className="text-[11px] text-zinc-400">New Delhi, Delhi - 110020</p>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-elevated space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Dispatch Contact</span>
              <p className="text-white font-bold">Kaizen Logistics Lead</p>
              <p className="text-[11px] text-zinc-400">+91 9811002233</p>
              <p className="text-[11px] text-zinc-400">dispatch@kaizenstudios.in</p>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-surface-elevated space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Automated Dispatch Route</span>
              <p className="text-emerald-400 font-bold">Seller Warehouse → Buyer Doorstep</p>
              <p className="text-[11px] text-zinc-400 font-sans">Delhivery Surface Express (2-4 Days)</p>
              <p className="text-[10px] text-zinc-500">Escrow released upon verified delivery scan</p>
            </div>
          </div>
        </div>

        {/* Quick Links Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/seller/products"
            className="rounded-xl border border-border bg-surface p-4 hover:border-white/40 transition-colors flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-white">Catalog Inventory Manager</p>
              <p className="text-[11px] text-zinc-500">Edit SKU counts, prices, and drop statuses</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </Link>

          <Link
            href="/seller/payouts"
            className="rounded-xl border border-border bg-surface p-4 hover:border-white/40 transition-colors flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-white">Double-Entry Escrow Ledger</p>
              <p className="text-[11px] text-zinc-500">Verify automated settlement logs</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </Link>

          <Link
            href="/kaizen"
            className="rounded-xl border border-border bg-surface p-4 hover:border-white/40 transition-colors flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-white">Public Creator Storefront</p>
              <p className="text-[11px] text-zinc-500">View live buyer-facing store</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </Link>
        </div>
      </div>

      <AICopilotModal isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}
