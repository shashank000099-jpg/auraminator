import React from "react";
import Link from "next/link";
import { ShieldCheck, Activity, Terminal } from "lucide-react";
import { AuraminatorLogo, AuraminatorIcon } from "./brand-logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-black text-zinc-400 font-mono text-xs selection:bg-white selection:text-black relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <AuraminatorLogo size="md" showTagline />
            </Link>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Elite multi-sided commerce engine for high-tier digital assets, curated luxury physical apparel, and bespoke creator drops.
            </p>
            <div className="inline-flex items-center gap-2 rounded bg-surface border border-white/5 px-2 py-1 text-[10px] text-emerald-400">
              <Activity className="h-2.5 w-2.5" />
              <span>SYSTEMS NOMINAL • 99.99% UPTIME</span>
            </div>
          </div>

          {/* Catalog */}
          <div className="space-y-2">
            <p className="font-bold text-white text-[11px] uppercase tracking-wider">Marketplace</p>
            <ul className="space-y-1.5 text-zinc-500 text-[11px]">
              <li><Link href="/explore?type=digital_file" className="hover:text-white transition-colors">3D & Shader Assets</Link></li>
              <li><Link href="/explore?type=physical" className="hover:text-white transition-colors">Heavyweight Cut-and-Sew</Link></li>
              <li><Link href="/explore?type=digital_link" className="hover:text-white transition-colors">Notion & Figma Workspaces</Link></li>
              <li><Link href="/explore" className="hover:text-white transition-colors">All Verified Drops</Link></li>
            </ul>
          </div>

          {/* Creator & Partner */}
          <div className="space-y-2">
            <p className="font-bold text-white text-[11px] uppercase tracking-wider">Ecosystem</p>
            <ul className="space-y-1.5 text-zinc-500 text-[11px]">
              <li><Link href="/seller/onboarding" className="hover:text-white transition-colors">Become a Verified Seller</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-white transition-colors">Seller Studio & Analytics</Link></li>
              <li><Link href="/seller/payouts" className="hover:text-white transition-colors">Double-Entry Escrow Ledger</Link></li>
              <li><Link href="/jobs" className="hover:text-white transition-colors text-emerald-400 font-bold">Free Careers &amp; Tech Jobs</Link></li>
              <li><Link href="/brand" className="hover:text-white transition-colors text-white font-bold">Brand Kit & Logos (SVG/PNG)</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Admin Mission Control</Link></li>
            </ul>
          </div>

          {/* Infrastructure & Security */}
          <div className="space-y-2">
            <p className="font-bold text-white text-[11px] uppercase tracking-wider">Security & Architecture</p>
            <div className="rounded-lg border border-border bg-surface p-3 space-y-2 text-[10px] text-zinc-400">
              <div className="flex items-center gap-1.5 text-zinc-200">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                <span>Zero-Trust Ingestion</span>
              </div>
              <p className="text-zinc-500 leading-tight">
                Cryptographic HMAC webhook verifications, Cloudflare R2 presigned vaults, and atomic PostgreSQL inventory RPCs.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
          <p>© {new Date().getFullYear()} AURAMINATOR.IN • ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
              PRIVACY PROTOCOL
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">
              TERMS OF COMMERCE
            </Link>
            <span>•</span>
            <Link href="/disclaimer" className="hover:text-zinc-400 transition-colors">
              ESCROW ARBITRATION &amp; DISCLAIMER
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
