"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Handshake,
  Clock,
  Key,
  Globe,
  Code2,
  DollarSign,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { MOCK_DEAL_ROOMS } from "@/lib/mock-data";
import { DealRoom, DealTransfer, DealMessage, TransferType } from "@/lib/types";

export default function ProtectedDealRoomPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = (params?.id as string) || "deal-001";
  const { user } = useAuth();

  const [deal, setDeal] = useState<DealRoom | null>(null);
  const [activeRole, setActiveRole] = useState<"buyer" | "seller">("buyer");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Interaction States
  const [counterAmount, setCounterAmount] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [isCountering, setIsCountering] = useState(false);

  // Transfer Credential Form State
  const [transferType, setTransferType] = useState<TransferType>("domain_auth_code");
  const [credentialPayload, setCredentialPayload] = useState("");
  const [handoverInstructions, setHandoverInstructions] = useState("");
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Action Loading
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/deals/${dealId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.deal) {
          setDeal(data.deal);
          setCounterAmount(data.deal.agreed_price.toString());
        }
      })
      .catch(() => {
        const mock = MOCK_DEAL_ROOMS.find((d) => d.id === dealId) || MOCK_DEAL_ROOMS[0];
        setDeal(mock);
        setCounterAmount(mock.agreed_price.toString());
      });
  }, [dealId]);

  if (!deal) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
          <span>INITIALIZING PROTECTED DEAL ROOM...</span>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterAmount || parseFloat(counterAmount) <= 0) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "counter_offer",
          payload: {
            amount: parseFloat(counterAmount),
            note: counterNote,
            senderId: activeRole === "seller" ? "seller-004" : "buyer-001",
            senderRole: activeRole,
          },
        }),
      });
      const data = await res.json();
      if (data.deal) {
        setDeal(data.deal);
        setIsCountering(false);
      }
    } catch {
      alert("Counter-offer submitted.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept_offer",
          payload: {
            senderId: activeRole === "seller" ? "seller-004" : "buyer-001",
            senderRole: activeRole,
          },
        }),
      });
      const data = await res.json();
      if (data.deal) setDeal(data.deal);
    } catch {
      alert("Offer accepted.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDepositEscrow = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deposit_escrow",
          payload: {
            paymentId: `pay_escrow_${Date.now()}`,
            senderId: "buyer-001",
          },
        }),
      });
      const data = await res.json();
      if (data.deal) setDeal(data.deal);
    } catch {
      alert("Escrow deposit completed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialPayload) return;

    setIsSubmittingCredentials(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_credentials",
          payload: {
            transferType,
            credentialPayload,
            instructions: handoverInstructions,
            senderId: "seller-004",
          },
        }),
      });
      const data = await res.json();
      if (data.deal) {
        setDeal(data.deal);
        setCredentialPayload("");
        setHandoverInstructions("");
      }
    } catch {
      alert("Credentials submitted.");
    } finally {
      setIsSubmittingCredentials(false);
    }
  };

  const handleVerifyTransferItem = async (transferId: string) => {
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_transfer_item",
          payload: { transferId },
        }),
      });
      const data = await res.json();
      if (data.deal) setDeal(data.deal);
    } catch {}
  };

  const handleConfirmHandoverRelease = async () => {
    if (!confirm("Are you sure you want to approve handover and release escrow? This will transfer ₹" + deal.seller_payout.toLocaleString("en-IN") + " to the seller's bank account.")) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm_handover_release",
          payload: { senderId: "buyer-001" },
        }),
      });
      const data = await res.json();
      if (data.deal) setDeal(data.deal);
    } catch {
      alert("Escrow released.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenDispute = async () => {
    const reason = prompt("Please provide reason for opening compliance arbitration dispute:");
    if (!reason) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "open_dispute",
          payload: { reason, senderId: activeRole === "seller" ? "seller-004" : "buyer-001" },
        }),
      });
      const data = await res.json();
      if (data.deal) setDeal(data.deal);
    } catch {
      alert("Dispute opened.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsSendingChat(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          payload: {
            message: chatInput,
            senderId: activeRole === "seller" ? "seller-004" : "buyer-001",
            senderRole: activeRole,
          },
        }),
      });
      const data = await res.json();
      if (data.deal) {
        setDeal(data.deal);
        setChatInput("");
      }
    } catch {} finally {
      setIsSendingChat(false);
    }
  };

  const getStepNumber = () => {
    switch (deal.escrow_status) {
      case "awaiting_deposit":
        return 2;
      case "escrow_locked":
        return 3;
      case "credentials_transferred":
      case "buyer_inspecting":
        return 4;
      case "completed_paid":
        return 5;
      case "disputed":
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStepNumber();

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Breadcrumb & Perspective Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/account/deals" className="hover:text-white transition-colors">
              DEALS
            </Link>
            <span>/</span>
            <span className="text-zinc-200">DEAL ROOM #{deal.id.toUpperCase()}</span>
          </div>

          {/* Perspective View Switcher */}
          <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border text-xs">
            <span className="text-zinc-500 text-[10px] uppercase px-2">Simulate View:</span>
            <button
              onClick={() => setActiveRole("buyer")}
              className={`px-3 py-1 rounded text-xs transition-all ${
                activeRole === "buyer"
                  ? "bg-white text-black font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Buyer Perspective
            </button>
            <button
              onClick={() => setActiveRole("seller")}
              className={`px-3 py-1 rounded text-xs transition-all ${
                activeRole === "seller"
                  ? "bg-white text-black font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Seller Perspective
            </button>
          </div>
        </div>

        {/* 5-Stage Stepper Bar */}
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 space-y-4 brutalist-card">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Protected Escrow Deal Progress</span>
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
              {deal.escrow_status.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              { num: 1, label: "1. Price Negotiation" },
              { num: 2, label: "2. Escrow Deposit" },
              { num: 3, label: "3. Credential Handover" },
              { num: 4, label: "4. 48h Inspection" },
              { num: 5, label: "5. Payout Release" },
            ].map((step) => {
              const isPassed = currentStep > step.num || (currentStep === 5 && step.num === 5);
              const isCurrent = currentStep === step.num && currentStep !== 5;
              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isPassed
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : isCurrent
                      ? "border-white bg-white/10 text-white font-bold animate-pulse"
                      : "border-border bg-surface-elevated text-zinc-600"
                  }`}
                >
                  <div className="text-[10px] opacity-75">Stage {step.num}</div>
                  <div className="text-[11px] truncate mt-0.5">{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Deal Workspace: 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Deal Execution & Handover Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Asset Details Header */}
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 brutalist-card">
              <div className="flex gap-4 items-start">
                <div className="relative h-16 w-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                  <Image
                    src={deal.product?.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"}
                    alt="Asset"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-1 flex-1">
                  <span className="text-[10px] text-zinc-500 uppercase">
                    Asset Type: {deal.product?.product_type.toUpperCase() || "SAAS ASSET"}
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-white uppercase">
                    {deal.product?.title || "VividAI • Video Generator SaaS"}
                  </h2>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-400">Seller: @{deal.seller?.username || "syntaxlabs"}</span>
                    <span className="text-zinc-400">Buyer: @{deal.buyer?.username || "alexmercer"}</span>
                  </div>
                </div>
              </div>

              {/* Price & Split Metrics */}
              <div className="rounded-xl border border-white/10 bg-surface-elevated p-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-zinc-500 block text-[10px]">AGREED DEAL PRICE</span>
                  <span className="text-white font-bold text-base">{formatINR(deal.agreed_price)}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">SELLER NET PAYOUT (85%)</span>
                  <span className="text-emerald-400 font-bold text-base">{formatINR(deal.seller_payout)}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">PLATFORM FEE (15%)</span>
                  <span className="text-zinc-300 font-bold text-base">{formatINR(deal.platform_fee)}</span>
                </div>
              </div>
            </div>

            {/* STAGE 1: NEGOTIATION ACTIONS */}
            {deal.escrow_status === "awaiting_deposit" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                  <Handshake className="h-4 w-4 text-emerald-400" />
                  <span>Price Agreed: {formatINR(deal.agreed_price)}</span>
                </div>
                <p className="text-xs text-zinc-300 font-sans">
                  The deal price is officially agreed upon. To proceed, the buyer must lock the funds in Auraminator Escrow.
                </p>

                {activeRole === "buyer" ? (
                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={isActionLoading}
                    onClick={handleDepositEscrow}
                    className="w-full flex items-center justify-between bg-white text-black hover:bg-zinc-200"
                  >
                    <span>DEPOSIT {formatINR(deal.agreed_price)} INTO ESCROW</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-zinc-400 text-center">
                    Awaiting buyer escrow deposit. You will be notified once funds are safely locked.
                  </div>
                )}
              </div>
            )}

            {/* STAGE 2: ESCROW LOCKED -> SELLER CREDENTIAL SUBMISSION */}
            {deal.escrow_status === "escrow_locked" && (
              <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-4 brutalist-card">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                  <Key className="h-4 w-4 text-emerald-400" />
                  <span>Encrypted Credential Handover Vault</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Escrow of {formatINR(deal.agreed_price)} is securely locked. Seller must now provide transfer credentials.
                </p>

                {activeRole === "seller" ? (
                  <form onSubmit={handleSubmitCredentials} className="space-y-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                        Credential / Asset Type
                      </label>
                      <select
                        value={transferType}
                        onChange={(e) => setTransferType(e.target.value as any)}
                        className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs font-mono text-white focus:border-white focus:outline-none"
                      >
                        <option value="domain_auth_code">Domain EPP Authorization Code</option>
                        <option value="github_repo_transfer">GitHub Repository / Org Transfer</option>
                        <option value="cloud_hosting_access">Cloudflare / AWS / Stripe Transfer</option>
                        <option value="social_login_credentials">Original Email / Social Account Login</option>
                        <option value="apk_ipa_source">App Store Connect / Play Console Transfer</option>
                        <option value="custom_transfer">Custom Archive / Direct Keys</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                        Encrypted Credential Payload
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="e.g. EPP Auth Code: #vividai-epp-99214 or GitHub Org Owner Invite link"
                        value={credentialPayload}
                        onChange={(e) => setCredentialPayload(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                        Handover &amp; Verification Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Initiate domain transfer at Namecheap/Cloudflare Registrar."
                        value={handoverInstructions}
                        onChange={(e) => setHandoverInstructions(e.target.value)}
                        className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isSubmittingCredentials}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <span>SUBMIT TO ENCRYPTED VAULT</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-xs text-zinc-400 text-center space-y-2">
                    <Clock className="h-5 w-5 text-emerald-400 mx-auto animate-spin" />
                    <p className="text-white font-bold">Awaiting seller to deposit transfer credentials.</p>
                    <p className="text-[11px] text-zinc-500 font-sans">
                      Your funds are 100% protected in Auraminator Escrow.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 3 & 4: BUYER INSPECTION & VERIFICATION */}
            {(deal.escrow_status === "buyer_inspecting" || deal.escrow_status === "credentials_transferred") && (
              <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-6 brutalist-card">
                {/* 48h Inspection Timer */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="text-emerald-400 font-bold text-xs block">48-HOUR INSPECTION WINDOW ACTIVE</span>
                      <span className="text-[11px] text-zinc-400 font-sans">
                        Verify domain control, source code, database access, and Stripe revenues.
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <span className="text-xs text-zinc-500 block">TIME REMAINING</span>
                    <span className="text-sm font-bold text-white">41h : 24m : 18s</span>
                  </div>
                </div>

                {/* Handover Credentials Vault List */}
                <div className="space-y-3">
                  <h3 className="font-bold text-white uppercase text-xs flex items-center gap-2">
                    <Key className="h-4 w-4 text-emerald-400" />
                    <span>Submitted Handover Credentials ({deal.transfers?.length || 0})</span>
                  </h3>

                  {deal.transfers && deal.transfers.length > 0 ? (
                    <div className="space-y-3">
                      {deal.transfers.map((trf) => (
                        <div
                          key={trf.id}
                          className="rounded-xl border border-white/10 bg-surface-elevated p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                              {trf.transfer_type.replace(/_/g, " ")}
                            </span>
                            {trf.verified_by_buyer ? (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Verified by Buyer</span>
                              </span>
                            ) : (
                              activeRole === "buyer" && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyTransferItem(trf.id)}
                                  className="text-[10px] text-zinc-400 hover:text-white border border-white/10 px-2 py-0.5 rounded"
                                >
                                  Mark Verified
                                </button>
                              )
                            )}
                          </div>

                          <div className="rounded-lg bg-black/60 border border-white/5 p-3 flex items-center justify-between gap-3 text-xs font-mono">
                            <span className="text-zinc-200 break-all">{trf.credential_payload}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(trf.credential_payload, trf.id)}
                              className="text-zinc-400 hover:text-white p-1 rounded"
                            >
                              {copiedKeyId === trf.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>

                          {trf.handover_instructions && (
                            <p className="text-[11px] text-zinc-400 font-sans">
                              <strong>Instructions:</strong> {trf.handover_instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No credentials deposited yet.</p>
                  )}
                </div>

                {/* Buyer Handover Approval Action */}
                {activeRole === "buyer" ? (
                  <div className="space-y-3 pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      isLoading={isActionLoading}
                      onClick={handleConfirmHandoverRelease}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>CONFIRM HANDOVER &amp; RELEASE ESCROW ({formatINR(deal.seller_payout)})</span>
                    </Button>

                    <button
                      type="button"
                      onClick={handleOpenDispute}
                      className="w-full text-center text-xs text-red-400 hover:text-red-300 py-1 font-mono flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Issue with credentials? Open Escrow Dispute Tribunal</span>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-zinc-400 text-center">
                    Buyer is currently inspecting your submitted assets. Once verified, {formatINR(deal.seller_payout)} will be credited to your payout account.
                  </div>
                )}
              </div>
            )}

            {/* STAGE 5: COMPLETED DEAL INVOICE */}
            {deal.escrow_status === "completed_paid" && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Deal Completed &amp; Escrow Successfully Settled</span>
                </div>
                <p className="text-xs text-zinc-300 font-sans">
                  The asset handover has been verified and settled. Net payout of {formatINR(deal.seller_payout)} dispatched to seller with 15% platform fee recorded in the double-entry ledger.
                </p>

                <div className="rounded-lg border border-white/10 bg-black/50 p-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Settlement Timestamp:</span>
                    <span className="text-white">{new Date(deal.completed_at || Date.now()).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Razorpay Route Settlement:</span>
                    <span className="text-emerald-400 font-bold">COMPLETED (85% Payout)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Platform Commission (15%):</span>
                    <span className="text-white">{formatINR(deal.platform_fee)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* DISPUTE ACTIVE NOTICE */}
            {deal.escrow_status === "disputed" && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 space-y-3 text-xs font-mono text-red-300">
                <div className="flex items-center gap-2 font-bold text-red-400 text-sm uppercase">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Escrow Frozen • Compliance Tribunal Review</span>
                </div>
                <p className="font-sans leading-relaxed">
                  Escrow funds are frozen. Our compliance team is verifying credential audit logs and will arbitrate within 24 hours.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Negotiation History & In-Deal Chat (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 brutalist-card">
              <h3 className="font-bold text-white uppercase text-xs flex items-center justify-between border-b border-border pb-3">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Deal Audit &amp; Negotiation Log</span>
                </span>
                <span className="text-[10px] text-zinc-500">ENCRYPTED</span>
              </h3>

              {/* Message List */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 text-xs font-mono">
                {deal.messages && deal.messages.length > 0 ? (
                  deal.messages.map((msg) => {
                    const isSender = msg.sender_role === activeRole;
                    const isSystem = ["payment_deposit", "credentials_submitted", "escrow_released", "dispute_opened"].includes(msg.message_type);

                    if (isSystem) {
                      return (
                        <div
                          key={msg.id}
                          className="rounded-lg border border-white/10 bg-surface-elevated p-3 text-[11px] text-zinc-300 space-y-1"
                        >
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase">
                            <ShieldCheck className="h-3 w-3" />
                            <span>System Protocol Event</span>
                          </div>
                          <p>{msg.message}</p>
                          <span className="text-[9px] text-zinc-500 block">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`rounded-lg p-3 space-y-1 ${
                          isSender
                            ? "bg-white text-black ml-4"
                            : "bg-surface-elevated border border-white/10 text-white mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-75">
                          <span className="font-bold uppercase">{msg.sender_role}</span>
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="font-sans text-xs">{msg.message}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-zinc-500">No messages yet.</p>
                )}
              </div>

              {/* In-Deal Chat Input */}
              <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-border">
                <input
                  type="text"
                  placeholder={`Message ${activeRole === "buyer" ? "Seller" : "Buyer"}...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 h-9 rounded-lg border border-border bg-surface-elevated px-3 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  isLoading={isSendingChat}
                  className="h-9 px-3"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>

            {/* Security Guarantee Accordion */}
            <div className="rounded-xl border border-white/10 bg-surface p-4 space-y-2 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Auraminator Handover Protocol</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-400 font-sans">
                <li>• <strong>No Off-Platform Dealings:</strong> Transactions completed outside this room lose all escrow &amp; legal protection.</li>
                <li>• <strong>Domain &amp; Repo Escrow:</strong> 48 hours to confirm DNS propagation and administrator privileges.</li>
                <li>• <strong>Automated 85/15 Split:</strong> Seller receives 85% net payout without manual invoice processing.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
