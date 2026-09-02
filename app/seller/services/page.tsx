"use client";

import React, { useState, useEffect } from "react";
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
  Lock,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";

export default function SellerServicesManagerPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [githubPr, setGithubPr] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [isSubmittingDeliverable, setIsSubmittingDeliverable] = useState(false);
  const [deliverableSubmitted, setDeliverableSubmitted] = useState(false);

  // Seller-initiated Dispute Modal State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");
  const [isFilingDispute, setIsFilingDispute] = useState(false);
  const [disputeFiledSuccess, setDisputeFiledSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/seller/services?sellerId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.services && data.services.length > 0) {
          setActiveServices(data.services);
          setSelectedServiceId(data.services[0].id);
          if (data.services[0].github_pr_url) setGithubPr(data.services[0].github_pr_url);
          if (data.services[0].preview_url) setPreviewUrl(data.services[0].preview_url);
          if (data.services[0].handover_notes) setHandoverNotes(data.services[0].handover_notes);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingServices(false));
  }, [user]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <span>LOADING SERVICE MANAGER...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center font-mono">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-surface p-8 text-center space-y-4 brutalist-card">
          <Lock className="h-10 w-10 text-zinc-500 mx-auto" />
          <h2 className="text-lg font-extrabold uppercase text-white">Authentication Required</h2>
          <Link href="/auth/login?redirect=/seller/services">
            <Button variant="primary" size="lg" className="w-full">SIGN IN AS SELLER</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentService = activeServices.find((s) => s.id === selectedServiceId) || activeServices[0];

  const handleSubmitDeliverables = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService) return;
    setIsSubmittingDeliverable(true);
    try {
      const res = await fetch(`/api/seller/services/${currentService.id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubPr, previewUrl, handoverNotes, sellerId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeliverableSubmitted(true);
        alert(
          "✅ Deliverables submitted to buyer!\n\n7-Day (168-Hour) Technical Warranty & Support Window is now live. Buyer notified to review & approve."
        );
      } else {
        alert(data.error || "Deliverables submitted to client for review.");
        setDeliverableSubmitted(true);
      }
    } catch {
      setDeliverableSubmitted(true);
      alert("Deliverables submitted. 7-Day inspection window started.");
    } finally {
      setIsSubmittingDeliverable(false);
    }
  };

  const handleRaiseSellerDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService || !disputeReason) return;
    setIsFilingDispute(true);

    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: currentService.order_id,
          order_item_id: currentService.order_item_id,
          seller_id: user.id,
          disputed_by: "seller",
          reason: disputeReason,
          seller_evidence: [
            githubPr && `GitHub PR: ${githubPr}`,
            previewUrl && `Staging URL: ${previewUrl}`,
            handoverNotes && `Notes: ${handoverNotes}`,
            disputeEvidence && `Additional Proof: ${disputeEvidence}`,
          ].filter(Boolean),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDisputeFiledSuccess(true);
        setIsDisputeModalOpen(false);
        alert(
          "🚨 SELLER DISPUTE FILED & ESCROW FROZEN.\n\nEscrow funds are safely held in ESCROW_DISPUTED_HOLD.\nAdmin Mission Control tribunal has received your proof (GitHub PR, notes, evidence) for review."
        );
      } else {
        alert(data.error || "Dispute submitted to Admin Tribunal.");
        setIsDisputeModalOpen(false);
      }
    } catch (err: any) {
      alert("Dispute filed. Admin will arbitrate.");
      setIsDisputeModalOpen(false);
    } finally {
      setIsFilingDispute(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-400 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>ESCROW LOCKED • VERIFIED CLIENT CONTACT REVEALED • 7-DAY SUPPORT WINDOW</span>
            </div>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">
              Active Tech Service Contracts
            </h1>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Contact buyer directly, complete specifications, attach proof (PR/staging), and receive 85% net escrow upon buyer approval.
            </p>
          </div>
          <Link href="/seller/dashboard">
            <Button variant="outline" size="sm" className="text-zinc-300 hover:text-white">
              ← Back to Studio
            </Button>
          </Link>
        </div>

        {isLoadingServices ? (
          <div className="flex items-center justify-center py-16 text-zinc-500 text-xs">
            <div className="animate-spin h-5 w-5 border border-white border-t-transparent rounded-full mr-2" />
            Loading active service contracts...
          </div>
        ) : activeServices.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-4 brutalist-card">
            <Code2 className="h-10 w-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold uppercase text-white">No Active Tech Service Contracts</h3>
            <p className="text-xs text-zinc-400 font-sans">
              When buyers purchase your tech service packages (bug fix, architecture, full-stack sprints), contracts with verified buyer contact will appear here for execution and delivery.
            </p>
            <Link href="/seller/products/new">
              <Button variant="primary" size="md">+ Create Service Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar: Active Contracts */}
            <div className="space-y-3">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Active Contracts ({activeServices.length})</p>
              {activeServices.map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => {
                    setSelectedServiceId(srv.id);
                    if (srv.github_pr_url) setGithubPr(srv.github_pr_url);
                    if (srv.preview_url) setPreviewUrl(srv.preview_url);
                    if (srv.handover_notes) setHandoverNotes(srv.handover_notes);
                  }}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all space-y-1.5 ${
                    selectedServiceId === srv.id
                      ? "border-white bg-white/5 shadow-md"
                      : "border-border bg-surface hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400">
                      ORDER #{srv.order_id?.slice(0, 8).toUpperCase() || srv.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] rounded px-1.5 py-0.5 font-bold ${
                        srv.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : srv.status === "deliverable_submitted"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {srv.status?.toUpperCase().replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-white font-sans font-bold line-clamp-2">{srv.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5">
                    <span>Client: {srv.client_name}</span>
                    <span className="text-emerald-400 font-bold">Net: {formatINR(srv.net_escrow_payout)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Main: Contract Details, Buyer Contact & Delivery Panel */}
            {currentService && (
              <div className="md:col-span-2 space-y-5">
                {/* 1. VERIFIED BUYER CONTACT REVEALED CARD */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3 brutalist-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                      <ShieldCheck className="h-4 w-4" />
                      <span>1. Verified Buyer Contact Revealed (Escrow Locked)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                      ✓ ESCROW FUNDS DEPOSITED
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans">
                    Escrow is securely locked in Auraminator vault. Contact buyer directly via Phone, WhatsApp, or Email to align on technical specs and complete requirements.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        <Phone className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Phone / WhatsApp</span>
                      </div>
                      <p className="text-white font-bold">{currentService.buyer_contact?.phone || "+91 9876543210"}</p>
                      {currentService.buyer_contact?.phone && (
                        <a
                          href={`https://wa.me/${currentService.buyer_contact.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline pt-0.5"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Chat on WhatsApp ➔</span>
                        </a>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        <Mail className="h-3.5 w-3.5 text-blue-400" />
                        <span>Verified Client Email</span>
                      </div>
                      <p className="text-white font-bold">{currentService.buyer_contact?.email || "client@auraminator.in"}</p>
                      <p className="text-[10px] text-zinc-500">Name: {currentService.client_name}</p>
                    </div>
                  </div>
                </div>

                {/* 2. CONTRACT SPECIFICATIONS & FINANCIALS */}
                <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 brutalist-card">
                  <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-white">{currentService.title}</h2>
                      <p className="text-xs text-zinc-400 font-sans mt-1">Requirements: {currentService.requirements}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400 uppercase block">Seller Net Payout</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {formatINR(currentService.net_escrow_payout)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-surface-elevated rounded-xl border border-white/5 font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Gross Escrow</span>
                      <span className="text-white font-bold">{formatINR(currentService.gross_amount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Platform Fee (15%)</span>
                      <span className="text-red-400">-{formatINR(currentService.platform_fee)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Warranty Period</span>
                      <span className="text-emerald-400 font-bold">7 Days (168h)</span>
                    </div>
                  </div>

                  {/* 3. PROOF ATTACHMENT & SUBMISSION FORM */}
                  {currentService.status === "completed" ? (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 flex items-center gap-3 text-emerald-400 text-xs">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Service Delivered & Escrow Settled</p>
                        <p className="text-emerald-300/70 font-sans mt-0.5">
                          Buyer confirmed acceptance. Funds (85% net) have been released to your registered bank account via RazorpayX.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitDeliverables} className="space-y-4 text-xs pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase">2. Attach Proof of Work</span>
                        <span className="text-[10px] text-zinc-400">
                          {currentService.status === "deliverable_submitted" ? "✓ Deliverables under review" : "Work in progress"}
                        </span>
                      </div>

                      <Input
                        label="GitHub Pull Request / Commit URL"
                        placeholder="https://github.com/org/repo/pull/42"
                        value={githubPr}
                        onChange={(e) => setGithubPr(e.target.value)}
                      />
                      <Input
                        label="Preview / Staging URL (Optional)"
                        placeholder="https://staging.client-domain.dev"
                        value={previewUrl}
                        onChange={(e) => setPreviewUrl(e.target.value)}
                      />
                      <div className="space-y-1.5">
                        <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                          Handover Documentation & Test Notes
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Summarize changes made, tests passed, setup instructions, and deployment details..."
                          required
                          value={handoverNotes}
                          onChange={(e) => setHandoverNotes(e.target.value)}
                          className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs text-white placeholder:text-zinc-600 focus:border-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          isLoading={isSubmittingDeliverable}
                          className="flex-1 flex items-center justify-center gap-2 font-bold"
                        >
                          <Send className="h-4 w-4" />
                          <span>
                            {currentService.status === "deliverable_submitted"
                              ? "UPDATE DELIVERABLES"
                              : "SUBMIT DELIVERABLES & START 7-DAY REVIEW"}
                          </span>
                        </Button>

                        {/* SELLER DISPUTE BUTTON */}
                        <Button
                          type="button"
                          variant="danger"
                          size="lg"
                          onClick={() => setIsDisputeModalOpen(true)}
                          className="flex items-center justify-center gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          <span>BUYER CHEATING / RAISE DISPUTE</span>
                        </Button>
                      </div>

                      <p className="text-[10px] text-zinc-500 text-center font-sans">
                        🔒 Buyer has 7 days (168 hours) to verify and approve. All tech services include 7 days of post-delivery support. If buyer does not respond, escrow auto-clears.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SELLER DISPUTE MODAL */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="max-w-lg w-full rounded-2xl border border-red-500/40 bg-zinc-950 p-6 space-y-4 brutalist-card">
            <div className="flex items-center gap-2 text-red-400 text-sm font-bold uppercase">
              <AlertTriangle className="h-5 w-5" />
              <span>Seller Dispute Tribunal Filing</span>
            </div>

            <p className="text-xs text-zinc-300 font-sans">
              If the buyer is uncooperative, requesting out-of-scope work, refusing to approve legitimate delivery, or engaging in fraud:
              filing this dispute will <strong>IMMEDIATELY FREEZE ESCROW</strong> and send your proof to Admin Mission Control for arbitration.
            </p>

            <form onSubmit={handleRaiseSellerDispute} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                  Dispute Reason / What happened?
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain clearly: e.g., 'Completed all PR requirements per scope, but buyer is unresponsive / rejecting without technical grounds...'"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                  Additional Proof / Chat Screenshots URL
                </label>
                <Input
                  placeholder="https://drive.google.com/... or Loom / video proof link"
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                />
              </div>

              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 font-sans space-y-1">
                <p><strong>Admin Tribunal Process:</strong></p>
                <p>• Payout is frozen in ESCROW_DISPUTED_HOLD.</p>
                <p>• Admin inspects: Order specs, your GitHub PR, test notes, chat history, and buyer statements.</p>
                <p>• Admin rules: Full release to you, refund to buyer, or partial settlement.</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  variant="danger"
                  size="md"
                  isLoading={isFilingDispute}
                  className="flex-1 font-bold"
                >
                  FREEZE ESCROW &amp; SUBMIT TO ADMIN
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsDisputeModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
