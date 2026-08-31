"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Box,
  Download,
  Terminal,
  HelpCircle,
  Truck,
  FileCheck,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuraminatorIcon, AuraminatorLogo, AuraminatorWatermark, AuraminatorSeal } from "@/components/brand-logo";

export default function HomePage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.product_type === activeFilter);

  return (
    <div className="min-h-screen bg-black text-white bg-grid-pattern relative overflow-hidden">
      {/* Background Watermarks */}
      <AuraminatorWatermark size={560} className="-top-20 -right-20" />
      <AuraminatorWatermark size={480} className="top-[45%] -left-32 opacity-[0.02]" />

      {/* 1. Ticker Banner */}
      <div className="border-b border-border bg-surface py-2 overflow-hidden whitespace-nowrap relative z-10">
        <div className="inline-flex gap-8 font-mono text-[10px] uppercase tracking-wider text-zinc-400 animate-pulse-subtle">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            LIVE DROP: 500 GSM VORTEX HOODIE RESTOCK COMMITTED
          </span>
          <span>•</span>
          <span className="text-zinc-500">
            100% BUYER ESCROW PROTECTION ACTIVE (ZERO RISK)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-white">
            <ShieldCheck className="h-3 w-3" /> ZERO-TRUST ASSET VAULT ONLINE
          </span>
          <span>•</span>
          <span className="text-zinc-500">EXPRESS SHIPROCKET LOGISTICS (2-4 DAYS DELIVERY)</span>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-[11px] font-mono text-zinc-300">
            <AuraminatorIcon size={14} />
            <span>ENTERPRISE MULTI-SIDED COMMERCE ENGINE</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[0.95]">
            CURATED DROPS. <br />
            <span className="text-zinc-500">ZERO COMPROMISE.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-sans max-w-2xl leading-relaxed">
            The premium creator marketplace for exclusive heavyweight streetwear, downloadable 3D tokens &amp; UI vaults, and private Notion operating systems.
            <span className="block text-sm text-zinc-400 mt-2 font-mono">
              ⚡ Every purchase is held in double-entry escrow—seller gets paid only after your order is verified and delivered.
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 font-mono">
            <Link href="/explore">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                <span>EXPLORE ALL DROPS</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/seller/onboarding">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <span>START SELLING (CREATOR KYC)</span>
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border font-mono">
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-zinc-500">Verified Platform Volume</p>
              <p className="text-xl font-bold text-white">₹1.42M+</p>
              <p className="text-[10px] text-zinc-400 font-sans">Across 140+ drops</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-zinc-500">Escrow Security</p>
              <p className="text-xl font-bold text-emerald-400">100% Protected</p>
              <p className="text-[10px] text-zinc-400 font-sans">Zero buyer risk</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-zinc-500">Digital Vault Delivery</p>
              <p className="text-xl font-bold text-white">Instant Presigned</p>
              <p className="text-[10px] text-zinc-400 font-sans">Direct to account</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-zinc-500">Physical Fulfillment</p>
              <p className="text-xl font-bold text-white">2.4 Days Avg</p>
              <p className="text-[10px] text-zinc-400 font-sans">Live Delhivery tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. New Visitor Friendly Onboarding Guide: "How Auraminator Works" */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-border">
        <div className="rounded-2xl border border-white/10 bg-surface-elevated p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                First Time Here? (New Visitor Guide)
              </span>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight mt-0.5">
                How Auraminator Works in 3 Simple Steps
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-500">Safe • Verified • Instant</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {/* Step 1 */}
            <div className="rounded-xl border border-border bg-surface p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[10px] uppercase font-bold text-white">Step 01</span>
                <Box className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-sm font-bold text-white">Pick a Physical or Digital Drop</h4>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Browse limited cut-and-sew streetwear apparel (tees, hoodies, cargos) or digital vaults (3D assets, Figma kits, Notion OS).
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-border bg-surface p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[10px] uppercase font-bold text-white">Step 02</span>
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Pay with Escrow Protection</h4>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Checkout with UPI, cards, or netbanking. Your payment is safely locked in escrow and never given to the seller until your item arrives.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-border bg-surface p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[10px] uppercase font-bold text-white">Step 03</span>
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-sm font-bold text-white">Instant Access &amp; Tracked Shipping</h4>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Digital files unlock instantly in your account library. Physical items ship express via Shiprocket with live GPS tracking to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Filterable Drop Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
              <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
                FEATURED DROPS &amp; ARTIFACTS
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Direct releases from verified creators. 100% covered by buyer protection.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="inline-flex flex-wrap gap-1.5 rounded-lg border border-border bg-surface p-1 font-mono text-xs">
            {[
              { id: "all", label: "ALL RELEASES" },
              { id: "physical", label: "STREETWEAR (Apparel)" },
              { id: "digital_file", label: "DIGITAL VAULT (3D & UI)" },
              { id: "digital_link", label: "WORKSPACES (Notion)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md transition-all duration-150 ${
                  activeFilter === tab.id
                    ? "bg-white text-black font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Enterprise Architecture Pillars with Clear Plain Explanations */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-2xl mb-12 space-y-2">
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider">Engineered For Sovereign Commerce</p>
          <h2 className="text-3xl font-bold tracking-tight text-white uppercase">
            The Auraminator Trust Architecture
          </h2>
          <p className="text-xs font-sans text-zinc-400 leading-relaxed">
            We built an enterprise-grade infrastructure so buyers never get scammed and creators get automated, transparent settlements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Pillar 1 */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-3 brutalist-card">
            <div className="h-10 w-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-white">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Double-Entry Escrow Ledger</h3>
            <p className="text-zinc-400 font-sans leading-relaxed text-xs">
              Every transaction splits funds automatically into a pending escrow ledger. Payouts release only after cryptographic proof of digital delivery or verified Shiprocket delivery scans.
            </p>
            <div className="text-[10px] text-emerald-400 font-mono pt-1">
              ✓ Buyer safety guaranteed • 7-day dispute window
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-3 brutalist-card">
            <div className="h-10 w-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Zero-Trust SSRF-Safe Vaults</h3>
            <p className="text-zinc-400 font-sans leading-relaxed text-xs">
              Protected asset storage via Cloudflare R2 presigned URLs. Automated private IP filtering, strict 50MB payload limits, and instantaneous watermark vault routing.
            </p>
            <div className="text-[10px] text-zinc-300 font-mono pt-1">
              ✓ Instant 15-minute secure download tokens
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-3 brutalist-card">
            <div className="h-10 w-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-white">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Atomic Inventory RPCs</h3>
            <p className="text-zinc-400 font-sans leading-relaxed text-xs">
              PostgreSQL-level row locks prevent overselling on flash drops. Concurrency reservations lock SKU inventory for 15 minutes before committing upon Razorpay payment capture.
            </p>
            <div className="text-[10px] text-zinc-300 font-mono pt-1">
              ✓ 15-min cart hold • Zero oversold items
            </div>
          </div>
        </div>
      </section>

      {/* 6. Creator Call to Action */}
      <section className="border-t border-border bg-surface-elevated py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            ARE YOU A CREATOR? LAUNCH YOUR EXCLUSIVE DROP
          </h2>
          <p className="text-xs font-mono text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Sell heavyweight merchandise or digital source files. Automated shipping labels, zero upfront platform subscription, and protected escrow payouts.
          </p>
          <div className="pt-2 font-mono flex items-center justify-center gap-4">
            <Link href="/seller/onboarding">
              <Button variant="primary" size="lg">
                APPLY AS A CREATOR (KYC)
              </Button>
            </Link>
            <Link href="/brand">
              <Button variant="outline" size="lg">
                VIEW BRAND ASSETS &amp; LOGOS
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
