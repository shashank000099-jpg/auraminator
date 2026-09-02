"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Scale, AlertOctagon, HelpCircle, FileCheck } from "lucide-react";
import { AuraminatorLogo } from "@/components/brand-logo";

export default function EscrowDisclaimerPage() {
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
            <ShieldAlert className="h-6 w-6 text-emerald-400 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              ESCROW ARBITRATION &amp; PLATFORM LIABILITY DISCLAIMER
            </h1>
          </div>
          <p className="text-[11px] text-zinc-500 font-sans">
            Comprehensive legal disclaimer regarding peer-to-peer risk allocation, intermediary status, and dispute tribunal boundaries.
          </p>
        </div>

        {/* Core Disclaimer Card */}
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-3 font-sans">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase font-mono">
            <AlertOctagon className="h-4 w-4 flex-shrink-0" />
            <span>TOTAL DISCLAIMER OF DIRECT LIABILITY (PEER-TO-PEER RISK ALLOCATION)</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">
            <strong>AURAMINATOR.IN IS NOT A PARTY TO ANY DIRECT PURCHASE CONTRACT.</strong> All transactions for digital assets, high-ticket software codebases, turnkey web applications, social media channels, and physical apparel are executed strictly and exclusively between the registered Buyer and the registered Seller.
          </p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Auraminator does not independently verify the underlying profitability of SaaS businesses, audit every line of source code, test all physical fabric tensile strengths, or guarantee perpetual access to third-party social media platforms. The transacting parties assume 100% of all risks related to asset performance, tax compliance, intellectual property infringement, and platform policy shifts.
          </p>
        </div>

        {/* Disclaimer Clauses */}
        <div className="space-y-6 font-sans text-xs text-zinc-400 leading-relaxed">
          {/* Section 1 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">01.</span>
              <span>Intermediary Protection Under Applicable Law</span>
            </h2>
            <p>
              In accordance with relevant Intermediary Guidelines, Auraminator functions solely as an electronic platform facilitating communication, digital vault streaming, and escrow routing between users. Auraminator does not initiate the transmission, select the receiver of the transmission, or modify the information contained in the transmission.
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">02.</span>
              <span>7-Day Inspection Window as the Sole Dispute Remedy</span>
            </h2>
            <p>
              The platform provides a strict <strong>7-Day (168-Hour) Escrow Inspection Window</strong> for high-ticket turnkey assets and tech services. This 7-day window represents the buyer's sole and exclusive remedy to inspect, verify, and dispute the received assets:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                If a dispute is raised within the 7-day window, the platform's Master Admin tribunal arbitrates the evidence and determines fund allocation (refund vs. payout).
              </li>
              <li>
                If no dispute is lodged within 7 days, funds are irreversibly paid to the seller. <strong>Auraminator has zero technical or financial ability to reverse settlements after the 7-day window closes.</strong>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">03.</span>
              <span>Third-Party Platform Policy Changes</span>
            </h2>
            <p>
              For social media accounts (YouTube, Instagram, X/Twitter, TikTok) and mobile apps (iOS App Store, Google Play Console): Auraminator bears zero responsibility if a third-party platform algorithmically modifies monetization status, suspends handles, or updates terms of service subsequent to the verified handover.
            </p>
          </section>

          {/* Section 4 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">04.</span>
              <span>Dispute Tribunal Arbitration Process</span>
            </h2>
            <p>
              When a dispute is opened, both parties must submit factual cryptographic evidence (e.g. DNS propagation records, GitHub invite logs, courier damage photos, PR commit histories). The platform arbitrator's determination is based strictly on submitted proof within the deal room.
            </p>
          </section>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-border flex items-center justify-between text-[11px] text-zinc-500">
          <span>© {new Date().getFullYear()} Auraminator.in • Legal &amp; Compliance Directorate</span>
          <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
            View Terms of Commerce ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
