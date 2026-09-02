"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, ShieldCheck, Scale, FileText, Lock, AlertTriangle } from "lucide-react";
import { AuraminatorLogo } from "@/components/brand-logo";

export default function TermsOfCommercePage() {
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
            <Scale className="h-6 w-6 text-emerald-400 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              TERMS OF COMMERCE &amp; PLATFORM INTERMEDIARY AGREEMENT
            </h1>
          </div>
          <p className="text-[11px] text-zinc-500 font-sans">
            Effective Date: September 2026 • Governs all transactions, escrow deal rooms, digital vault deliveries, and physical drops on Auraminator.in.
          </p>
        </div>

        {/* Critical Legal Disclaimer Card */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3 font-sans">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>MANDATORY PLATFORM INTERMEDIARY DISCLAIMER (NO LIABILITY FOR PEER-TO-PEER DISPUTES / FRAUD)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong>Auraminator.in operates strictly as an automated technology intermediary and peer-to-peer escrow software facilitator.</strong> Auraminator does NOT manufacture physical apparel, author third-party codebases, develop turnkey applications, nor manage social media accounts listed by independent creators.
          </p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            All commercial representations, product specifications, intellectual property ownership claims, software code functionality, and accounts are solely between the <strong>Buyer and the Seller</strong>. Auraminator expressly disclaims all liability for any direct, indirect, incidental, punitive, or consequential damages, financial losses, or intentional fraud perpetrated by either party outside the formal 7-Day Escrow Inspection Window. Both parties enter into peer-to-peer transactions entirely at their own sole discretion and risk.
          </p>
        </div>

        {/* Detailed Terms Sections */}
        <div className="space-y-6 font-sans text-xs text-zinc-400 leading-relaxed">
          {/* Section 1 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">01.</span>
              <span>Platform Role &amp; Scope of Services</span>
            </h2>
            <p>
              Auraminator provides technological infrastructure including the 10-State Escrow Finite State Machine (FSM), multi-vendor logistics routing (via Shiprocket), encrypted Deal Rooms, and digital asset vault streaming (via Supabase Storage). The platform facilitates peer-to-peer transactions between independent creators/sellers and buyers. Auraminator does not act as an employer, agent, partner, or insurer for any seller or buyer.
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">02.</span>
              <span>7-Day Support &amp; Technical Warranty Escrow Hold Protocol</span>
            </h2>
            <p>
              For high-ticket turnkey assets (SaaS platforms, web applications, mobile apps, source code repositories, and social media accounts) as well as Tech Services, transactions are subject to a mandatory <strong>7-Day (168 Hours) Technical Support &amp; Warranty Period</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                <strong>Escrow Retention</strong>: 100% of the transaction funds remain safely locked in platform escrow for 7 consecutive days following the initial credential handover.
              </li>
              <li>
                <strong>Seller Warranty Obligation</strong>: The seller is contractually bound to provide 7 days of technical setup support, domain transfer assistance, store invitation verification, and defect correction.
              </li>
              <li>
                <strong>Dispute Filing Window</strong>: Any defect, account recovery issue, or metrics divergence must be reported by the buyer within these 7 days via the formal Dispute Tribunal.
              </li>
              <li>
                <strong>Irreversible Settlement</strong>: Upon the expiration of the 7-day period without an active dispute (or upon early buyer sign-off), the 85% net payout is irreversibly disbursed to the seller. No chargebacks or post-settlement claims will be entertained by the platform.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">03.</span>
              <span>Post-Payment Contact Details Reveal Protocol</span>
            </h2>
            <p>
              To protect the commercial integrity of the marketplace while ensuring seamless technical handover:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
              <li>
                <strong>Pre-Deposit Protection</strong>: Before escrow funds are captured, all direct contact information (phone numbers, WhatsApp links, personal emails, Telegram handles, and UPI IDs) is algorithmically filtered and prohibited in Deal Room messaging to prevent fee circumvention.
              </li>
              <li>
                <strong>Post-Deposit Unlock</strong>: Once the buyer's payment is securely confirmed in escrow, the buyer's verified contact details (Full Name, Phone/WhatsApp, Email, and Location) are unlocked for the seller solely for the purpose of live credential transfer, video walkthroughs, and developer coordination.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">04.</span>
              <span>Category-Specific Cancellation &amp; Refund Rules</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li>
                <strong>Physical Cut-and-Sew Merchandise</strong>: Cancellation with instant 100% refund is permitted only prior to courier handover. Once marked in-transit by Shiprocket/Delhivery, cancellation is locked; returns must be processed upon doorstep delivery.
              </li>
              <li>
                <strong>Instant Digital Vaults (ZIP/3D Files/Templates)</strong>: Direct self-cancellation is strictly disabled once presigned download access or private template duplication has been initiated. In case of file corruption, buyers must submit an evidence ticket to the Dispute Tribunal.
              </li>
              <li>
                <strong>On-Demand Tech Services</strong>: Cancellation is permitted while the status is <code className="text-emerald-400 font-mono">intake_pending</code>. Once the developer begins work (<code className="text-emerald-400 font-mono">in_progress</code>), direct cancellation is locked to protect creator labor.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase text-white font-mono flex items-center gap-2">
              <span className="text-emerald-400">05.</span>
              <span>Platform Commission &amp; Double-Entry Ledger</span>
            </h2>
            <p>
              Auraminator charges a standard 15% platform brokerage commission on finalized transactions for maintaining secure escrow infrastructure, cryptographic vault streaming, and automated dispute tribunal arbitration. 85% net proceeds are credited to the verified seller upon satisfactory order completion.
            </p>
          </section>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-border flex items-center justify-between text-[11px] text-zinc-500">
          <span>© {new Date().getFullYear()} Auraminator.in • Legal &amp; Compliance Directorate</span>
          <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
            View Privacy Protocol ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
