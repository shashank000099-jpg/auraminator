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
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-black text-white bg-grid-pattern">
      {/* 1. Ticker Banner */}
      <div className="border-b border-border bg-surface py-2 overflow-hidden whitespace-nowrap">
        <div className="inline-flex gap-8 font-mono text-[10px] uppercase tracking-wider text-zinc-400 animate-pulse-subtle">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            LIVE DROP: 500 GSM VORTEX HOODIE RESTOCK COMMITTED
          </span>
          <span>•</span>
          <span className="text-zinc-500">
            DOUBLE-ENTRY ESCROW SETTLEMENT ENGINE ACTIVE
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-white">
            <ShieldCheck className="h-3 w-3" /> ZERO-TRUST ASSET VAULT ONLINE
          </span>
          <span>•</span>
          <span className="text-zinc-500">SHIPROCKET AUTOMATED FULFILLMENT READY</span>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-[11px] font-mono text-zinc-300">
            <Sparkles className="h-3 w-3 text-white" />
            <span>ENTERPRISE MULTI-SIDED COMMERCE ENGINE</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[0.95]">
            CURATED DROPS. <br />
            <span className="text-zinc-500">ZERO COMPROMISE.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 font-sans max-w-2xl leading-relaxed">
            The next-generation marketplace engineered for sovereign tastemakers. High-density cut-and-sew luxury apparel, encrypted 3D digital vaults, and modular creator operating systems.
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
                <span>APPLY AS SELLER</span>
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border font-mono">
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-zinc-500">Active GMV Volume</p>
              <p className="text-xl font-bold text-white">₹1.42M+</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-zinc-500">Escrow Clearance</p>
              <p className="text-xl font-bold text-emerald-400">100% Guaranteed</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-zinc-500">Asset Ingestion Limit</p>
              <p className="text-xl font-bold text-white">50MB Zero-Trust</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-zinc-500">Average Fulfillment</p>
              <p className="text-xl font-bold text-white">2.4 Days</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Filterable Drop Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
              <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
                FEATURED DROPS & ARTIFACTS
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-500 mt-1">
              Direct-from-creator releases protected with multi-tenant escrow.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="inline-flex flex-wrap gap-1.5 rounded-lg border border-border bg-surface p-1 font-mono text-xs">
            {[
              { id: "all", label: "ALL ARTIFACTS" },
              { id: "physical", label: "STREETWEAR" },
              { id: "digital_file", label: "DIGITAL VAULT" },
              { id: "digital_link", label: "WORKSPACES" },
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

      {/* 4. Enterprise Architecture Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider">Engineered For Sovereign Commerce</p>
          <h2 className="text-3xl font-bold tracking-tight text-white uppercase mt-2">
            The Auraminator Trust Architecture
          </h2>
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
          </div>
        </div>
      </section>

      {/* 5. Creator Call to Action */}
      <section className="border-t border-border bg-surface-elevated py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            READY TO LAUNCH YOUR EXCLUSIVE DROP?
          </h2>
          <p className="text-xs font-mono text-zinc-400 max-w-xl mx-auto">
            Join the elite circle of verified creators. Autonomous payouts, automated shipping, and full multi-sided telemetry.
          </p>
          <div className="pt-2 font-mono">
            <Link href="/seller/onboarding">
              <Button variant="primary" size="lg">
                SUBMIT SELLER KYC APPLICATION
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
