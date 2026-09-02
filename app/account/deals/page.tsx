"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Handshake,
  Clock,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Filter,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { DealRoom, Offer } from "@/lib/types";

export default function DealsDashboardPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<DealRoom[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeTab, setActiveTab] = useState<"deals" | "offers">("deals");
  const [filterRole, setFilterRole] = useState<"all" | "buyer" | "seller">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[11px] text-emerald-400 mb-2">
              <Handshake className="h-3.5 w-3.5" />
              <span>SOVEREIGN ESCROW BROKERAGE</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">
              DEALS &amp; ASSET NEGOTIATIONS
            </h1>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Track live negotiations, locked deal rooms, and credential handovers for Apps, SaaS, Source Code &amp; Social Accounts.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("deals")}
              className={`px-4 py-2 rounded-lg text-xs transition-all ${
                activeTab === "deals"
                  ? "bg-white text-black font-bold"
                  : "border border-border text-zinc-400 hover:text-white"
              }`}
            >
              Active Deals ({deals.length})
            </button>
            <button
              onClick={() => setActiveTab("offers")}
              className={`px-4 py-2 rounded-lg text-xs transition-all ${
                activeTab === "offers"
                  ? "bg-white text-black font-bold"
                  : "border border-border text-zinc-400 hover:text-white"
              }`}
            >
              Offers ({offers.length})
            </button>
          </div>
        </div>

        {/* ACTIVE DEALS TAB */}
        {activeTab === "deals" && (
          <div className="space-y-4">
            {deals.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-surface/40 p-8 space-y-3 font-mono">
                <Box className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-white uppercase">No Active Deals Found</p>
                <p className="text-xs text-zinc-500 font-sans max-w-md mx-auto">
                  When you make an offer on a SaaS, turnkey app, or digital asset, your negotiation deal room will appear here.
                </p>
                <Link href="/explore">
                  <Button variant="outline" size="sm" className="font-mono text-xs mt-2">
                    EXPLORE MARKETPLACE
                  </Button>
                </Link>
              </div>
            ) : (
              deals.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-2xl border border-border bg-surface p-6 space-y-4 brutalist-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="relative h-14 w-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                        <Image
                          src={deal.product?.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80"}
                          alt="Asset"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-400 uppercase">
                            {deal.product?.product_type.toUpperCase() || "SAAS"}
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                            {deal.escrow_status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white uppercase">
                          {deal.product?.title || "Asset Deal Room"}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Buyer: @{deal.buyer?.username || "buyer"} • Seller: @{deal.seller?.username || "seller"}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono">
                      <span className="text-xs text-zinc-500 block">AGREED ESCROW VALUE</span>
                      <span className="text-xl font-bold text-white">{formatINR(deal.agreed_price)}</span>
                      <span className="text-[10px] text-emerald-400 block">
                        Net Payout: {formatINR(deal.seller_payout)} (85%)
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-zinc-400 font-sans">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span>Inspection Period: 7 Days • Escrow Protected by Auraminator</span>
                    </div>

                    <Link href={`/deals/${deal.id}`}>
                      <Button variant="primary" size="sm" className="flex items-center gap-1.5 w-full sm:w-auto">
                        <span>ENTER PROTECTED DEAL ROOM</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* OFFERS TAB */}
        {activeTab === "offers" && (
          <div className="space-y-4">
            {offers.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-surface/40 p-8 space-y-3 font-mono">
                <Box className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-white uppercase">No Offers Found</p>
                <p className="text-xs text-zinc-500 font-sans max-w-md mx-auto">
                  You haven&apos;t submitted any counter-offers or bids yet.
                </p>
              </div>
            ) : (
              offers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-2xl border border-border bg-surface p-6 space-y-4 brutalist-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-400 uppercase">
                          {offer.product?.product_type.toUpperCase() || "ASSET"}
                        </span>
                        <span className="text-[10px] text-white bg-white/10 px-2 py-0.5 rounded uppercase font-bold">
                          STATUS: {offer.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white uppercase">
                        {offer.product?.title || "Asset Offer"}
                      </h3>
                      <p className="text-xs text-zinc-400 font-sans">
                        {offer.terms_note}
                      </p>
                    </div>

                    <div className="text-left sm:text-right font-mono">
                      <span className="text-xs text-zinc-500 block">CURRENT OFFER</span>
                      <span className="text-xl font-bold text-white">{formatINR(offer.current_offer_amount)}</span>
                      <span className="text-[10px] text-zinc-500 block">
                        List Price: {formatINR(offer.product?.base_price || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-between items-center text-xs">
                    <span className="text-zinc-500 text-[11px]">
                      Last action by: {offer.last_offered_by.toUpperCase()} • {new Date(offer.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
