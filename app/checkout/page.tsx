"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart-store";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalAmount, clearCart, anonymousSessionId } = useCartStore();

  const [fullName, setFullName] = useState("Alex Mercer");
  const [phone, setPhone] = useState("9876543210");
  const [email, setEmail] = useState("alex@auraminator.in");
  const [addressLine1, setAddressLine1] = useState("102 Silicon Cyber Heights, Indiranagar");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("560038");

  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any>(null);

  const subtotal = getTotalAmount();
  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setTimeout(() => {
      if (couponCode.toUpperCase() === "AURA10") {
        const disc = Math.round(subtotal * 0.1);
        setAppliedDiscount(disc);
        setCouponMessage("10% Drop discount applied successfully!");
      } else {
        setCouponMessage("Invalid or expired coupon code.");
      }
      setIsApplyingCoupon(false);
    }, 400);
  };

  const handleProcessPayment = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);

    try {
      // Call Checkout API route
      const payload = {
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity,
          unitPrice: item.variant ? item.variant.price : item.product.base_price,
          sellerId: item.product.seller_id,
          productType: item.product.product_type,
          title: item.product.title,
        })),
        shippingAddress: {
          fullName,
          phone,
          addressLine1,
          city,
          state,
          postalCode,
          country: "IN",
        },
        couponCode: appliedDiscount > 0 ? couponCode : null,
        sessionId: anonymousSessionId,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Payment initialization failed");
      }

      // Simulate payment capture webhook for instantaneous local testing
      await fetch("/api/webhooks/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "payment.captured",
          event_id: `evt_${Date.now()}`,
          payload: {
            payment: {
              entity: {
                id: `pay_${Math.random().toString(36).substring(2, 10)}`,
                order_id: data.razorpayOrderId,
                amount: finalTotal * 100,
                status: "captured",
              },
            },
          },
        }),
      });

      setOrderCompleted({
        orderId: data.orderId,
        amount: finalTotal,
      });

      clearCart();
    } catch (err: any) {
      alert(`Checkout error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 text-center space-y-6 font-mono brutalist-card">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
              PAYMENT CAPTURED
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Order #{orderCompleted.orderId.slice(0, 8)} has been confirmed and escrow hold initiated.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-4 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-500">Amount Paid:</span>
              <span className="font-bold text-white">{formatINR(orderCompleted.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Digital Vault Access:</span>
              <span className="text-emerald-400 font-bold">Instantly Issued</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Shipping Partner:</span>
              <span className="text-white">Shiprocket Surface</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/account")}
            className="w-full"
          >
            VIEW PORTFOLIO & DOWNLOADS
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-[11px] font-mono text-zinc-300 mb-2">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>256-BIT ENCRYPTED RAZORPAY ROUTE ESCROW</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase">SECURE CHECKOUT</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shipping & Billing (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider border-b border-border pb-3">
                1. Shipping & Logistics Destination
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  label="Phone (For OTP Verification)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Input
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Street Address"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-3">
                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
                <Input
                  label="Pincode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="rounded-xl border border-border bg-surface p-5 space-y-3 font-mono text-xs">
              <h2 className="font-bold uppercase text-white tracking-wider">
                2. Payment Gateway & Split Processing
              </h2>
              <div className="rounded-lg border border-white/20 bg-surface-elevated p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                  <span className="font-bold text-white">Razorpay Route Multi-Split (UPI, Cards, NetBanking)</span>
                </div>
                <span className="text-[10px] text-zinc-400">Instant Escrow</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Ledger Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4 font-mono text-xs">
              <h2 className="font-bold uppercase text-white tracking-wider border-b border-border pb-3">
                Order Ledger
              </h2>

              {/* Items summary */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-zinc-300">
                    <span className="line-clamp-1 flex-1 pr-2">
                      {item.quantity}x {item.product.title}
                    </span>
                    <span className="font-bold text-white">
                      {formatINR(
                        (item.variant ? item.variant.price : item.product.base_price) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="pt-3 border-t border-border space-y-2">
                <label className="block text-[11px] text-zinc-400 uppercase">Promo / Drop Code</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Try 'AURA10'"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleApplyCoupon}
                    isLoading={isApplyingCoupon}
                  >
                    APPLY
                  </Button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-[11px] ${
                      appliedDiscount > 0 ? "text-emerald-400" : "text-zinc-500"
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-3 border-t border-border space-y-2 text-zinc-400">
                <div className="flex justify-between">
                  <span>Gross Order Value</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Drop Discount</span>
                    <span>-{formatINR(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Platform Fee (5%)</span>
                  <span className="text-zinc-500">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Delivery</span>
                  <span className="text-emerald-400">Free Express</span>
                </div>
                <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-border">
                  <span>Payable Amount</span>
                  <span>{formatINR(finalTotal)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleProcessPayment}
                isLoading={isSubmitting}
                disabled={items.length === 0}
                className="w-full"
              >
                PAY & AUTHORIZE ESCROW
              </Button>

              <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-2 border-t border-border font-sans">
                <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Protected by double-entry escrow ledger. Funds released only upon delivery verification.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
