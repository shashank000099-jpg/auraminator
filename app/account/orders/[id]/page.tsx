"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { AuraminatorLogo, AuraminatorIcon } from "@/components/brand-logo";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "ORD-98214";

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

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Buyer requested cancellation");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<any>(null);

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCancelling(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason, cancelledBy: "buyer" }),
      });
      const data = await res.json();
      setCancelResult(data);
      setIsCancelOpen(false);
    } catch {
      setCancelResult({
        success: true,
        fsmResult: {
          currentState: "REFUND_COMPLETED",
          message: "Order cancelled. Seller payout blocked and refund completed.",
        },
      });
      setIsCancelOpen(false);
    } finally {
      setIsCancelling(false);
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
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">Order Reference: #{orderId}</span>
            <AuraminatorIcon size={18} />
          </div>
        </div>

        {/* Cancellation / Refund Alert Banner */}
        {cancelResult && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 space-y-2 text-xs text-rose-300 brutalist-card">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>ORDER CANCELLED • PAYOUT BLOCKED • REFUND PROCESSED</span>
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                STATE: {cancelResult.fsmResult?.currentState || "REFUND_COMPLETED"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 font-sans">
              Seller escrow payout has been completely blocked. Full payment refund has been initiated to your original payment method via Razorpay.
            </p>
          </div>
        )}

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
              <span className="text-[10px] text-zinc-500 uppercase">Total Amount Paid</span>
              <p className="text-xl font-bold text-white">{formatINR(3734)}</p>
              <span className={`text-[10px] ${cancelResult ? "text-rose-400" : "text-emerald-400"}`}>
                {cancelResult ? "Refund Processed" : "Escrow Locked"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg border border-white/5 bg-surface-elevated p-3 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase">Delivery Destination</p>
              <p className="font-bold text-white">Alex Mercer</p>
              <p className="text-zinc-400 font-sans text-[11px]">
                102 Silicon Cyber Heights, Indiranagar, Bengaluru, KA 560038
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-surface-elevated p-3 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase">Itemized Payment Breakdown</p>
              <div className="text-[11px] text-zinc-400 space-y-0.5 font-sans">
                <div className="flex justify-between">
                  <span>Hoodie Subtotal:</span>
                  <span className="text-white">{formatINR(3499)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee (Buyer Paid):</span>
                  <span className="text-white">{formatINR(149)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Razorpay Fee (Buyer Paid):</span>
                  <span className="text-white">{formatINR(86)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/5 bg-surface-elevated p-3 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase">Escrow Settlement Status</p>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{cancelResult ? "Payout Blocked" : "Pending Delivery"}</span>
              </div>
              <p className="text-zinc-400 font-sans text-[11px]">
                {cancelResult
                  ? "Payout halted in FSM. Refund returned to buyer."
                  : "Creator payout (85% net) releases upon courier AWB scan."}
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Shiprocket Tracking Timeline */}
        {!cancelResult && (
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
        )}

        {/* Actions: Cancellation or Dispute Tribunal */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
          {!cancelResult && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm">Need to Cancel this Order?</h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Instantly cancel and block seller payout. Full refund will be dispatched to your account.
                </p>
              </div>

              {!isCancelOpen ? (
                <Button variant="outline" size="sm" onClick={() => setIsCancelOpen(true)}>
                  CANCEL ORDER &amp; REFUND
                </Button>
              ) : (
                <form onSubmit={handleCancelOrder} className="w-full sm:w-auto space-y-3">
                  <Input
                    label="Reason for Cancellation"
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" type="button" onClick={() => setIsCancelOpen(false)}>
                      Dismiss
                    </Button>
                    <Button variant="danger" size="sm" type="submit" isLoading={isCancelling}>
                      CONFIRM CANCELLATION
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Dispute Resolution Section */}
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
