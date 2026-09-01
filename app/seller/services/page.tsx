"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  ExternalLink,
  Code2,
  ShieldCheck,
  Send,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import { AuraminatorIcon, AuraminatorLogo } from "@/components/brand-logo";

export default function SellerServicesManagerPage() {
  const [activeServices, setActiveServices] = useState([
    {
      id: "SRV-94012",
      order_id: "ORD-98214",
      client_name: "Alex Mercer",
      title: "Emergency Full-Stack Debug & Bug Fix Sprint (24h SLA)",
      gross_amount: 4999,
      platform_fee: 749.85, // 15%
      net_escrow_payout: 4249.15, // 85%
      status: "in_progress",
      sla_time_left: "14 hours remaining",
      repo_url: "https://github.com/my-enterprise/nextjs-saas-platform",
      requirements:
        "1. Fix memory leak on /api/webhooks route.\n2. Resolve hydration mismatch on dynamic user avatar.\n3. Add atomic PostgreSQL inventory reservation RPC.",
    },
    {
      id: "SRV-93810",
      order_id: "ORD-97992",
      client_name: "Devon Vance",
      title: "Next.js 14 & Supabase Enterprise Architecture Sprint",
      gross_amount: 14999,
      platform_fee: 2249.85, // 15%
      net_escrow_payout: 12749.15, // 85%
      status: "completed",
      sla_time_left: "Delivered & Escrow Released",
      repo_url: "https://github.com/vance-capital/auraminator-core",
      requirements: "Complete RLS policies, atomic inventory locks, and Cloudflare R2 presigned presigner.",
    },
  ]);

  const [selectedServiceId, setSelectedServiceId] = useState<string>("SRV-94012");
  const [githubPr, setGithubPr] = useState("https://github.com/my-enterprise/nextjs-saas-platform/pull/42");
  const [previewUrl, setPreviewUrl] = useState("https://staging-fix-v42.auraminator-client.dev");
  const [handoverNotes, setHandoverNotes] = useState(
    "All 3 issues resolved. Memory leak traced to unclosed edge streams; replaced with node stream reader. Added atomic PostgreSQL RPC 'reserve_inventory' with test suite passing 100%."
  );
  const [isSubmittingDeliverable, setIsSubmittingDeliverable] = useState(false);

  const currentService = activeServices.find((s) => s.id === selectedServiceId) || activeServices[0];

  const handleSubmitDeliverables = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDeliverable(true);
    setTimeout(() => {
      setIsSubmittingDeliverable(false);
      alert(
        "Deliverables submitted to client! Buyer notified via email and SMS. 72-hour automated escrow clearance timer started."
      );
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-[11px] text-zinc-300 mb-2">
              <AuraminatorIcon size={14} />
              <span>CREATOR SERVICE ESCROW DISPATCH</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">
              Tech Service Orders &amp; PR Submissions
            </h1>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Deliver code fixes, smart contract audits, and architecture sprints directly without client communication friction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/seller/dashboard">
              <Button variant="outline" size="md">
                ← Back to Seller Studio
              </Button>
            </Link>
            <Link href="/seller/products/new">
              <Button variant="primary" size="md">
                + Launch New Tech Service / Drop
              </Button>
            </Link>
          </div>
        </div>

        {/* 15% Platform Commission Transparency Bar */}
        <div className="rounded-xl border border-white/10 bg-surface-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Platform Fee Structure: <strong>15% Flat Commission</strong> • <strong>85% Direct Escrow Payout</strong> to Creator Bank</span>
          </div>
          <span className="text-zinc-500 font-mono text-[11px]">
            Instant bank payout upon delivery verification
          </span>
        </div>

        {/* Main Grid: Orders List & Delivery Submission Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Active Service Orders (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Active Client Service Orders ({activeServices.length})
            </h3>

            {activeServices.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={`rounded-xl border p-5 space-y-3 cursor-pointer transition-all ${
                  selectedServiceId === service.id
                    ? "border-white bg-surface-elevated text-white shadow-lg"
                    : "border-border bg-surface text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold">#{service.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      service.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/10 text-white border border-white/20"
                    }`}
                  >
                    {service.status === "completed" ? "Completed" : "Action Required"}
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm">{service.title}</h4>
                <p className="text-xs text-zinc-400 font-sans">Client: {service.client_name}</p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Net Creator Payout (85%)</span>
                    <span className="text-emerald-400 font-bold">{formatINR(service.net_escrow_payout)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 block text-[10px]">Gross Sale (15% Fee)</span>
                    <span className="text-white font-bold">{formatINR(service.gross_amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Submission Form & Client Requirements (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
              <div className="border-b border-border pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Selected Service Contract</span>
                  <h3 className="font-bold text-white text-base mt-0.5">{currentService.title}</h3>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold block">{formatINR(currentService.net_escrow_payout)}</span>
                  <span className="text-[10px] text-zinc-500">85% Net Escrow</span>
                </div>
              </div>

              {/* UNLOCKED CLIENT CONTACT DOSSIER (FOR SELLER TO REACH OUT) */}
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                    <ShieldCheck className="h-4 w-4" />
                    <span>CLIENT CONTACT DOSSIER (UNLOCKED)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    ESCROW DEPOSIT VERIFIED
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-sans">
                  The client has deposited <strong className="text-white">{formatINR(currentService.gross_amount)}</strong> into Escrow. Reach out to them directly to coordinate the sprint:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="rounded-lg border border-white/10 bg-black/50 p-3 space-y-1">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Client WhatsApp / Phone:</span>
                    <a
                      href="https://wa.me/919876512345"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5"
                    >
                      <span>+91 98765 12345 ({currentService.client_name})</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/50 p-3 space-y-1">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Client Email:</span>
                    <a
                      href="mailto:alex.mercer@gmail.com"
                      className="text-white hover:text-emerald-400 font-bold break-all"
                    >
                      alex.mercer@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Client Requirements Box */}
              <div className="rounded-lg border border-border bg-black p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-bold uppercase">Client GitHub Repository</span>
                  <a
                    href={currentService.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-emerald-400 flex items-center gap-1 font-bold"
                  >
                    <span>Open Repo</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <pre className="mt-2 p-3 rounded bg-zinc-950 border border-white/5 text-zinc-300 font-mono text-[11px] whitespace-pre-wrap">
                  {currentService.requirements}
                </pre>
              </div>

              {/* Deliverable Submission Form */}
              <form onSubmit={handleSubmitDeliverables} className="space-y-4 text-xs font-mono">
                <h4 className="font-bold text-white uppercase tracking-wider">
                  Submit Deliverables to Client
                </h4>

                <Input
                  label="GitHub Pull Request (PR) URL"
                  required
                  placeholder="https://github.com/client-repo/pull/1"
                  value={githubPr}
                  onChange={(e) => setGithubPr(e.target.value)}
                />

                <Input
                  label="Live Staging Preview URL (Optional)"
                  placeholder="https://staging.client.dev"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                    Technical Handover &amp; Resolution Notes
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
                    placeholder="Detail the root cause, tests added, and deployment instructions..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmittingDeliverable}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <GitPullRequest className="h-4 w-4" />
                  <span>SUBMIT DELIVERABLES &amp; REQUEST ESCROW CLEARANCE</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
