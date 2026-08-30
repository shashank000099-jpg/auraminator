"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  Users,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  XCircle,
  Eye,
  Lock,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminMissionControl() {
  const [kycRequests, setKycRequests] = useState([
    {
      id: "kyc-001",
      business_name: "Apex Cybernetics Studio",
      tax_id: "27AABCA1234F1Z9",
      submitted_at: "2 hours ago",
      doc_url: "https://assets.auraminator.in/docs/kyc-apex.pdf",
    },
    {
      id: "kyc-002",
      business_name: "Noir Atelier International",
      tax_id: "06AAACT9876C1Z2",
      submitted_at: "5 hours ago",
      doc_url: "https://assets.auraminator.in/docs/kyc-noir.pdf",
    },
  ]);

  const [activeDisputes, setActiveDisputes] = useState([
    {
      id: "disp-101",
      order_id: "ORD-98214",
      buyer: "Alex Mercer",
      seller: "KAIZEN STUDIOS",
      amount: 3499,
      reason: "Fabric density inspection requested before escrow release",
      status: "under_review",
    },
  ]);

  const handleApproveKYC = (id: string) => {
    setKycRequests((prev) => prev.filter((k) => k.id !== id));
    alert("Seller KYC dossier approved and verified badge granted.");
  };

  const handleRejectKYC = (id: string) => {
    setKycRequests((prev) => prev.filter((k) => k.id !== id));
    alert("Seller KYC application rejected.");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-mono text-red-400 mb-3">
              <ShieldAlert className="h-3 w-3" /> Platform Security Level: High
            </div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">Admin Mission Control</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Multi-tenant platform oversight, dispute tribunal, KYC compliance, and double-entry escrow liquidity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface border border-border px-3 py-1.5 text-xs text-emerald-400">
              <Activity className="h-3.5 w-3.5" />
              <span>Telemetry: 100% Operational</span>
            </span>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
          <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-5 brutalist-card">
            <p className="text-xs text-zinc-500">Gross Merchandise Value</p>
            <h2 className="text-2xl font-bold text-white mt-2">₹1,420,800</h2>
            <p className="text-[10px] text-emerald-400 mt-1">+14.2% this week</p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-5 brutalist-card">
            <p className="text-xs text-zinc-500">Platform Escrow Balance</p>
            <h2 className="text-2xl font-bold text-white mt-2">₹348,200</h2>
            <p className="text-[10px] text-zinc-400 mt-1">Held across 84 orders</p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-5 brutalist-card">
            <p className="text-xs text-zinc-500">Pending Seller KYC</p>
            <h2 className="text-2xl font-bold text-white mt-2">{kycRequests.length + 10} Sellers</h2>
            <p className="text-[10px] text-amber-400 mt-1">Verification required</p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-5 brutalist-card">
            <p className="text-xs text-zinc-500">Active Disputes</p>
            <h2 className="text-2xl font-bold text-red-400 mt-2">{activeDisputes.length} Flagged</h2>
            <p className="text-[10px] text-zinc-400 mt-1">Action required</p>
          </div>
        </div>

        {/* Section 1: Pending Seller KYC Verification Tribunal */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-tight text-white">
                Seller KYC Verification Queue
              </h2>
              <p className="text-xs text-zinc-500">
                Review legal business registration, GSTIN, and compliance documents before unlocking store publishing.
              </p>
            </div>
            <span className="text-xs text-zinc-400">{kycRequests.length} In Queue</span>
          </div>

          {kycRequests.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">All seller applications reviewed.</p>
          ) : (
            <div className="divide-y divide-border text-xs">
              {kycRequests.map((kyc) => (
                <div key={kyc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{kyc.business_name}</span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                        GSTIN: {kyc.tax_id}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Submitted {kyc.submitted_at}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(kyc.doc_url, "_blank")}
                      className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View PDF</span>
                    </button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApproveKYC(kyc.id)}
                      className="flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectKYC(kyc.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Dispute Tribunal */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-tight text-white">
                Escrow Dispute Arbitration Tribunal
              </h2>
              <p className="text-xs text-zinc-500">
                Arbitrate frozen escrow transactions between buyers and sellers.
              </p>
            </div>
            <span className="text-xs text-red-400">{activeDisputes.length} Open Dispute</span>
          </div>

          <div className="divide-y divide-border text-xs">
            {activeDisputes.map((disp) => (
              <div key={disp.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Case #{disp.id} • Order #{disp.order_id}</span>
                    <span className="rounded bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] text-red-400">
                      Escrow Frozen ({formatINR(disp.amount)})
                    </span>
                  </div>
                  <p className="text-zinc-300 font-sans text-xs">{disp.reason}</p>
                  <p className="text-[11px] text-zinc-500">
                    Buyer: <strong className="text-zinc-400">{disp.buyer}</strong> | Seller:{" "}
                    <strong className="text-zinc-400">{disp.seller}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      alert("Tribunal ruled in favor of buyer: Refund released from escrow.");
                      setActiveDisputes([]);
                    }}
                  >
                    Release Refund to Buyer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      alert("Tribunal ruled in favor of seller: Escrow released to seller.");
                      setActiveDisputes([]);
                    }}
                  >
                    Release to Seller
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Webhook & Security Audit Stream */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2 text-white">
              <Lock className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-tight">
                Cryptographic Webhook & Audit Event Stream
              </h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">HMAC SHA-256 Verified</span>
          </div>

          <div className="space-y-2 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span>[2026-08-30 23:20:10] • razorpay.payment.captured • evt_94821092 • Order #ORD-98214</span>
              <span className="text-emerald-400">IDEMPOTENT PROCESSED</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span>[2026-08-30 23:14:02] • shiprocket.tracking.update • AWB #SR94829104 • Status: IN_TRANSIT</span>
              <span className="text-emerald-400">LOGGED</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span>[2026-08-30 22:58:30] • r2.vault.signed_url_issued • Entitlement #ent-001 • Buyer #usr-9102</span>
              <span className="text-zinc-500">EXPIRES 15M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
