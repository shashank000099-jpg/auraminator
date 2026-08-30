"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = (params.id as string) || "ORD-98214";

  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason) return;

    try {
      await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          reason: disputeReason,
        }),
      });
      setDisputeSubmitted(true);
      setIsDisputeOpen(false);
    } catch {
      setDisputeSubmitted(true);
      setIsDisputeOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 selection:bg-white selection:text-black font-mono">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Top bar */}
        <div className="border-b border-border pb-6 flex items-center justify-between">
          <Link href="/account" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portfolio</span>
          </Link>
          <span className="text-xs text-zinc-500">Order Reference: #{orderId}</span>
        </div>

        {/* Order Status Hero */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase">Order Placed Aug 28, 2026</span>
              <h1 className="text-xl font-bold text-white mt-0.5">
                VORTEX 500 GSM Heavyweight Modular Hoodie
              </h1>
              <p className="text-xs text-zinc-400 mt-1 font-sans">
                Variant: Matte Black / XL • Seller: KAIZEN STUDIOS (Verified)
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-zinc-500 uppercase">Total Escrow Amount</span>
              <p className="text-xl font-bold text-white">{formatINR(3499)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-white/5 bg-surface-elevated p-3 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase">Delivery Destination</p>
              <p className="font-bold text-white">Alex Mercer</p>
              <p className="text-zinc-400 font-sans text-[11px]">
                102 Silicon Cyber Heights, Indiranagar, Bengaluru, KA 560038
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-surface-elevated p-3 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase">Escrow Settlement Status</p>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Held in Pending Ledger (Releases on Delivery)</span>
              </div>
              <p className="text-zinc-400 font-sans text-[11px]">Protected by Razorpay Route Multi-Split</p>
            </div>
          </div>
        </div>

        {/* Real-time Shiprocket Tracking Timeline */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase text-white tracking-wider">
            Real-Time Logistics Telemetry
          </h2>
          <TrackingTimeline
            awb="SR94829104"
            courierName="Delhivery Surface Express"
            trackingStatus="in_transit"
          />
        </div>

        {/* Dispute Resolution Section */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Need Escrow Arbitration or Return?</h3>
              <p className="text-xs text-zinc-400 font-sans">
                If the garment has defect issues or delivery differs from description, freeze escrow release by opening a formal dispute.
              </p>
            </div>

            {!disputeSubmitted ? (
              <Button
                variant="danger"
                size="md"
                onClick={() => setIsDisputeOpen(!isDisputeOpen)}
              >
                OPEN ESCROW DISPUTE
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-amber-400 text-xs font-bold">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Dispute Under Tribunal Review</span>
              </span>
            )}
          </div>

          {isDisputeOpen && !disputeSubmitted && (
            <form onSubmit={handleDisputeSubmit} className="pt-4 border-t border-border space-y-4 animate-in fade-in text-xs">
              <div className="space-y-1.5">
                <label className="block text-zinc-400 uppercase">Reason for Dispute / Evidence</label>
                <textarea
                  required
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe damage, size discrepancy, or delayed delivery..."
                  className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsDisputeOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" type="submit">
                  Submit Formal Dispute
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
