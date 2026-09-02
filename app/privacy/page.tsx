"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Server, Database } from "lucide-react";
import { AuraminatorLogo } from "@/components/brand-logo";

export default function PrivacyProtocolPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 sm:p-8 font-mono text-xs selection:bg-white selection:text-black">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Storefront</span>
          </Link>
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-emerald-400 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              PRIVACY PROTOCOL &amp; ZERO-TRUST DATA ARCHITECTURE
            </h1>
          </div>
          <p className="text-[11px] text-zinc-500 font-sans">
            Effective Date: September 2026 • Governs how personal telemetry, shipping addresses, and post-escrow contact dossiers are handled on Auraminator.in.
          </p>
        </div>

        {/* Privacy Principles Card */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3 font-sans">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <span>ZERO-TRUST PRIVACY ARCHITECTURE &amp; CONTACT ISOLATION</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Auraminator enforces a strict zero-trust data minimization policy. We do NOT monetize user data, sell marketing lists, or store raw financial instruments (Credit/Debit Card numbers, CVVs, or NetBanking credentials). All banking and payment tokenization is handled directly by PCI-DSS Level 1 compliant gateway partners (Razorpay).
          </p>
        </div>

        {/* Privacy Clauses */}
        <div className="space-y-6 font-sans text-xs text-zinc-400 leading-relaxed">
          {/* Section 1 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">01.</span>
              <span>Information We Collect</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                <strong>Identity &amp; Profile</strong>: Full name, chosen username, avatar URL, and verified email address via Supabase Auth.
              </li>
              <li>
                <strong>Logistics &amp; Delivery Telemetry</strong>: Shipping recipient name, contact phone number, postal PIN code, and street address (used strictly for Shiprocket / Delhivery courier manifest generation).
              </li>
              <li>
                <strong>Creator Verification (KYC)</strong>: Legal business entity name, PAN / GSTIN registration, and payout settlement bank details stored securely for double-entry ledger disbursements.
              </li>
              <li>
                <strong>Digital Access Tokens</strong>: IP address and User Agent logged during presigned digital vault downloads to prevent unauthorized hotlinking.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">02.</span>
              <span>Post-Payment Contact Detail Revelation Policy</span>
            </h2>
            <p>
              In high-ticket turnkey asset transfers (SaaS, Mobile Apps, Social Accounts) and Tech Services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                Prior to escrow funding, direct contact details are obscured to protect marketplace safety.
              </li>
              <li>
                Upon verified payment capture, the buyer's verified contact details (Phone/WhatsApp, Email, Full Name) are shared exclusively with the assigned seller to coordinate technical handover, developer setup, and mandatory 7-day warranty support.
              </li>
              <li>
                Both parties agree not to use shared contact information for external spam, harassment, or unauthorized commercial solicitations.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">03.</span>
              <span>Data Storage &amp; Cryptographic Security</span>
            </h2>
            <p>
              All application data is housed in enterprise PostgreSQL clusters with Row Level Security (RLS) policies enabled. Digital assets hosted in private vaults utilize ephemeral 15-minute cryptographically signed tokens to prevent persistent exposure of raw storage URLs.
            </p>
          </section>

          {/* Section 4 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">04.</span>
              <span>User Rights &amp; Account Deletion</span>
            </h2>
            <p>
              Users may request complete account data deletion or export by contacting the Master Admin at <code className="text-white font-mono">support@auraminator.in</code>. Note that finalized transaction ledger entries are retained as required by financial auditing regulations.
            </p>
          </section>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-border flex items-center justify-between text-[11px] text-zinc-500">
          <span>© {new Date().getFullYear()} Auraminator.in • Privacy &amp; Data Security Protocol</span>
          <Link href="/disclaimer" className="text-zinc-400 hover:text-white transition-colors">
            View Escrow Disclaimer ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
