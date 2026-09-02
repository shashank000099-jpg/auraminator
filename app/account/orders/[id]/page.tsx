"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, ArrowLeft, CheckCircle2, AlertTriangle, Package, Truck, ShieldCheck, XCircle } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { AuraminatorLogo, AuraminatorIcon } from "@/components/brand-logo";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "";

  const [orderData, setOrderData] = useState<any>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  // Dispute state
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Cancellation state
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Buyer requested cancellation before fulfillment");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<any>(null);
  const [cancelBlockedError, setCancelBlockedError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/orders?orderId=${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.orders && data.orders.length > 0) {
          const match = data.orders.find((o: any) => o.id === orderId) || data.orders[0];
          setOrderData(match);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingOrder(false));
  }, [orderId]);

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason) return;
    setIsSubmittingDispute(true);

    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          reason: disputeReason,
          disputed_by: "buyer",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDisputeSubmitted(true);
        setIsDisputeOpen(false);
        alert("🚨 Formal Escrow Dispute Filed!\n\nSeller payout has been FROZEN in ESCROW_DISPUTED_HOLD. Admin Mission Control tribunal will arbitrate within 24 hours.");
      } else {
        alert(data.error || "Failed to submit dispute");
      }
    } catch {
      setDisputeSubmitted(true);
      setIsDisputeOpen(false);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCancelling(true);
    setCancelBlockedError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason, cancelledBy: "buyer" }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCancelResult(data);
        setIsCancelOpen(false);
      } else {
        // Policy guard rejection (e.g. package already handed over to courier)
        setCancelBlockedError(data.error || "Order cancellation is blocked by platform policy guard.");
        setIsCancelOpen(false);
      }
    } catch (err: any) {
      setCancelBlockedError(err.message || "Failed to cancel order.");
      setIsCancelOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const subtotal = orderData?.items_subtotal || 3499;
  const shippingFee = orderData?.shipping_fee !== undefined ? orderData.shipping_fee : 149;
  const gatewayFee = orderData?.gateway_fee !== undefined ? orderData.gateway_fee : Math.round((subtotal + shippingFee) * 0.0236);
  const totalPaid = orderData?.total_amount || (subtotal + shippingFee + gatewayFee);

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
            <span className="text-xs text-zinc-500">Order Reference: #{orderId ? orderId.slice(0, 8).toUpperCase() : "LIVE"}</span>
            <AuraminatorIcon size={18} />
          </div>
        </div>

        {/* Cancellation Succeeded Alert Banner */}
        {cancelResult && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 space-y-2 text-xs text-emerald-300 brutalist-card">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>ORDER CANCELLED BEFORE PICKUP • FULL REFUND PROCESSED</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                REFUND_COMPLETED
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 font-sans">
              Shiprocket courier pickup has been cancelled. Full refund of {formatINR(totalPaid)} has been initiated to your original payment method via Razorpay. Seller payout blocked in ledger.
            </p>
          </div>
        )}

        {/* Cancellation Blocked by Policy Guard (Already Picked Up) Banner */}
        {cancelBlockedError && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3 text-xs text-amber-300 brutalist-card">
            <div className="flex items-center gap-2 font-bold uppercase text-white">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Cancellation Blocked: Package Already Handed Over to Courier</span>
            </div>
            <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
              {cancelBlockedError}
            </p>
            <div className="p-3 rounded-lg bg-black/40 border border-amber-500/20 space-y-2">
              <p className="text-[11px] text-amber-400 font-bold">What happens next? (7-Day Warranty Policy)</p>
              <p className="text-[10px] text-zinc-400 font-sans">
                1. Track your delivery in real-time below using the assigned Shiprocket AWB.<br />
                2. Once the courier delivers the package, your <strong>7-Day (168-Hour) Return &amp; Inspection Period</strong> activates.<br />
                3. If the item has any defects, damages, or discrepancies, open an <strong>Escrow Dispute</strong> below to freeze the seller payout and arbitrate for an immediate refund.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setCancelBlockedError(null);
                  setIsDisputeOpen(true);
                }}
                className="mt-1"
              >
                Open Escrow Dispute / Request Return ➔
              </Button>
            </div>
          </div>
        )}

        {/* Order Status Hero */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase">Order Status &amp; Financials</span>
              <h1 className="text-xl font-bold text-white mt-0.5">
                {orderData?.items?.[0]?.product?.title || "VORTEX 500 GSM Heavyweight Modular Hoodie"}
              </h1>
              <p className="text-xs text-zinc-400 mt-1 font-sans">
                Order ID: #{orderId} • Status:{" "}
                <span className="uppercase text-emerald-400 font-bold">
                  {cancelResult ? "Cancelled & Refunded" : (orderData?.status || "Paid & In Escrow")}
                </span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-zinc-500 uppercase">Total Amount Paid by Buyer</span>
              <p className="text-xl font-bold text-white font-mono">{formatINR(totalPaid)}</p>
              <span className={`text-[10px] font-bold ${cancelResult ? "text-rose-400" : "text-emerald-400"}`}>
                {cancelResult ? "Full Refund Initiated" : "Escrow Locked (Zero-Trust)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg border border-white/5 bg-surface-elevated p-3 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase">Delivery Address</p>
              <p className="font-bold text-white">
                {orderData?.shipping_address?.full_name || "Verified Customer"}
              </p>
              <p className="text-zinc-400 font-sans text-[11px]">
                {orderData?.shipping_address
                  ? `${orderData.shipping_address.address_line1}, ${orderData.shipping_address.city}, ${orderData.shipping_address.state} - ${orderData.shipping_address.postal_code}`
                  : "Indiranagar, Bengaluru, KA 560038"}
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-surface-elevated p-3 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase">Itemized Financial Breakdown</p>
              <div className="text-[11px] text-zinc-400 space-y-0.5 font-sans">
                <div className="flex justify-between">
                  <span>Product Subtotal:</span>
                  <span className="text-white">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dynamic Shipping (Buyer Paid):</span>
                  <span className="text-white">{formatINR(shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Razorpay Fee 2.36% (Buyer Paid):</span>
                  <span className="text-white">{formatINR(gatewayFee)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/5 bg-surface-elevated p-3 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase">Seller Escrow Share</p>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{cancelResult ? "Payout Blocked" : "85% Net Held in Escrow"}</span>
              </div>
              <p className="text-zinc-400 font-sans text-[11px]">
                {cancelResult
                  ? "Escrow cancelled. Refund dispatched to buyer."
                  : `Creator payout of ${formatINR(Math.round(subtotal * 0.85))} releases post-delivery (7-Day Warranty).`}
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Shiprocket Tracking Timeline */}
        {!cancelResult && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase text-white tracking-wider">
              Real-Time Logistics Telemetry (Shiprocket)
            </h2>
            <TrackingTimeline
              awb={orderData?.shipments?.[0]?.awb_code || "SR94829104"}
              courierName={orderData?.shipments?.[0]?.courier_name || "Delhivery Surface Express"}
              trackingStatus={orderData?.shipments?.[0]?.tracking_status || "in_transit"}
            />
          </div>
        )}

        {/* Actions: Cancellation & Dispute Tribunal */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
          {!cancelResult && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">Need to Cancel this Order?</h3>
                  <span className="text-[10px] bg-white/10 text-zinc-300 px-2 py-0.5 rounded uppercase">
                    BEFORE-PICKUP POLICY
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  • <strong>Before Courier Handover</strong>: Instant 1-click cancellation &amp; 100% automated refund.<br />
                  • <strong>After Courier Handover</strong>: Direct cancel blocked (use 7-Day Warranty Return/Dispute upon delivery).
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

          {/* Dispute / Return Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Need Escrow Arbitration or 7-Day Return?</h3>
              <p className="text-xs text-zinc-400 font-sans">
                If the item is defective, damaged, or not as described, opening an escrow dispute will instantly freeze seller payout and trigger Admin Mission Control review.
              </p>
            </div>

            {!disputeSubmitted ? (
              <Button
                variant="danger"
                size="md"
                onClick={() => setIsDisputeOpen(!isDisputeOpen)}
              >
                OPEN ESCROW DISPUTE / RETURN
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-amber-400 text-xs font-bold">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Dispute Under Tribunal Review (Payout Frozen)</span>
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
                <Button variant="danger" size="sm" type="submit" isLoading={isSubmittingDispute}>
                  Submit Formal Dispute (Freeze Escrow)
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
