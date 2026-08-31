"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  GitPullRequest,
  ExternalLink,
  Code2,
  Terminal,
  Clock,
  Send,
  AlertTriangle,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import { AuraminatorIcon, AuraminatorLogo } from "@/components/brand-logo";

export default function ServiceWorkspacePage() {
  const params = useParams();
  const serviceId = (params?.id as string) || "SRV-94012";

  const [status, setStatus] = useState<"intake_pending" | "in_progress" | "deliverable_submitted" | "completed">(
    "in_progress"
  );

  // Intake State
  const [repoUrl, setRepoUrl] = useState("https://github.com/my-enterprise/nextjs-saas-platform");
  const [techStack, setTechStack] = useState("Next.js 14, Supabase, Tailwind, Cloudflare R2");
  const [requirements, setRequirements] = useState(
    "1. Fix memory leak on /api/webhooks route.\n2. Resolve hydration mismatch on dynamic user avatar.\n3. Add atomic PostgreSQL inventory reservation RPC."
  );
  const [environmentSecrets, setEnvironmentSecrets] = useState("NEXT_PUBLIC_SUPABASE_URL=https://sample.supabase.co");
  const [isIntakeSubmitted, setIsIntakeSubmitted] = useState(true);

  // Deliverables from Seller
  const [deliverables] = useState({
    github_pr_url: "https://github.com/my-enterprise/nextjs-saas-platform/pull/42",
    preview_url: "https://staging-fix-v42.auraminator-client.dev",
    handover_notes:
      "All 3 issues resolved. Memory leak traced to unclosed edge streams; replaced with node stream reader. Added atomic PostgreSQL RPC 'reserve_inventory' with test suite passing 100%.",
    submitted_at: "20 minutes ago",
  });

  const [isEscrowReleased, setIsEscrowReleased] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const handleReleaseEscrow = () => {
    setIsReleasing(true);
    setTimeout(() => {
      setIsReleasing(false);
      setIsEscrowReleased(true);
      setStatus("completed");
      alert("Escrow funds released! 85% credited to creator bank account. 15% platform commission settled.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/account" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white mb-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Buyer Portfolio</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                SERVICE DELIVERY WORKSPACE
              </h1>
              <span className="text-xs text-zinc-500 bg-surface px-2.5 py-1 rounded border border-border">
                #{serviceId}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AuraminatorLogo size="sm" />
          </div>
        </div>

        {/* Service Order Overview Card */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-400 mb-2">
                <ShieldCheck className="h-3 w-3" />
                <span>100% ESCROW PROTECTED WORKSPACE</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Emergency Full-Stack Debug &amp; Bug Fix Sprint (24h SLA)
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Assigned Engineer: <strong className="text-white">SYNTAX LABS (Verified Creator)</strong>
              </p>
            </div>

            <div className="text-left sm:text-right font-mono">
              <p className="text-xl font-bold text-white">₹4,999</p>
              <p className="text-[10px] text-zinc-500">15% Platform Escrow Fee Included</p>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-surface-elevated px-2 py-0.5 rounded border border-white/10">
                <Clock className="h-3 w-3" /> SLA: 24h Countdown Active
              </div>
            </div>
          </div>

          {/* Milestone Progress Bar */}
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span className="font-bold text-white">Milestone Execution Protocol</span>
              <span className="text-emerald-400">
                {status === "completed" ? "100% Completed" : "Phase 3 of 3: Verification & Handover"}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-elevated border border-border overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{
                  width:
                    status === "intake_pending"
                      ? "25%"
                      : status === "in_progress"
                      ? "65%"
                      : status === "deliverable_submitted"
                      ? "90%"
                      : "100%",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Deliverables & Handover Section (Sellers Submits Work here, Buyer Reviews & Releases Escrow) */}
        <div className="rounded-xl border border-emerald-500/30 bg-surface p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base uppercase">
                Engineer Deliverables &amp; PR Handover
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              Ready for Verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-2">
              <span className="text-zinc-500 uppercase font-bold">1. Verified GitHub Pull Request</span>
              <a
                href={deliverables.github_pr_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-white hover:text-emerald-400 font-bold break-all pt-1"
              >
                <span>{deliverables.github_pr_url}</span>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              </a>
            </div>

            <div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-2">
              <span className="text-zinc-500 uppercase font-bold">2. Staging Deployment Preview</span>
              <a
                href={deliverables.preview_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-white hover:text-emerald-400 font-bold break-all pt-1"
              >
                <span>{deliverables.preview_url}</span>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              </a>
            </div>
          </div>

          {/* Engineer Handover Notes */}
          <div className="rounded-lg border border-border bg-black p-4 space-y-2 text-xs">
            <span className="text-zinc-500 uppercase font-bold">Engineer Changelog &amp; Resolution Notes</span>
            <p className="text-zinc-300 font-sans leading-relaxed pt-1">
              {deliverables.handover_notes}
            </p>
          </div>

          {/* Action Release Escrow Bar */}
          <div className="rounded-xl border border-white/20 bg-surface-elevated p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Verified Solution &amp; Test Suite Passed?</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Releasing escrow releases ₹4,249.15 (85%) directly to the developer and marks this service order completed.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isEscrowReleased ? (
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Escrow Released &amp; Completed</span>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => alert("Revision requested from developer. SLA paused.")}
                    className="text-xs"
                  >
                    Request Revision
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleReleaseEscrow}
                    isLoading={isReleasing}
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>ACCEPT &amp; RELEASE ESCROW</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Intake Requirements Reference */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4 text-xs">
          <h3 className="font-bold text-white uppercase border-b border-border pb-3">
            Original Client Intake Requirements
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-zinc-500 uppercase font-bold">Target Repository:</span>
              <p className="text-white mt-0.5">{repoUrl}</p>
            </div>
            <div>
              <span className="text-zinc-500 uppercase font-bold">Tech Stack:</span>
              <p className="text-white mt-0.5">{techStack}</p>
            </div>
            <div>
              <span className="text-zinc-500 uppercase font-bold">Scope &amp; Bug Symptoms:</span>
              <pre className="mt-1 p-3 rounded bg-black border border-border text-zinc-300 font-mono text-[11px] whitespace-pre-wrap">
                {requirements}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
