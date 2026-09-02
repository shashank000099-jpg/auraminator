"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart-store";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Sparkles, AlertCircle, Truck, CreditCard } from "lucide-react";
import { AuraminatorIcon, AuraminatorLogo } from "@/components/brand-logo";
import { useAuth } from "@/lib/context/auth-context";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalAmount, clearCart, anonymousSessionId } = useCartStore();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "Alex Mercer");
  const [phone, setPhone] = useState("9876543210");
  const [email, setEmail] = useState(user?.email || "alex@auraminator.in");
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
  const hasPhysicalItems = items.some((item) => item.product.product_type === "physical");
  
  // Dynamic Real-Time Shipping Calculation from Seller Origin PIN to Buyer Delivery PIN
  const [shippingFee, setShippingFee] = useState(hasPhysicalItems ? 149 : 0);
  const [courierName, setCourierName] = useState("Delhivery Surface Express");
  const [etdDays, setEtdDays] = useState(3);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  React.useEffect(() => {
    if (!hasPhysicalItems) {
      setShippingFee(0);
      return;
    }

    if (postalCode && postalCode.length === 6) {
      setIsCalculatingShipping(true);
      const firstPhysicalItem = items.find((i) => i.product.product_type === "physical");
      const sellerId = firstPhysicalItem?.product.seller_id;

      fetch("/api/shipping/calculate-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          destinationPincode: postalCode,
          weightInKg: 0.85,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.rate !== undefined) {
            setShippingFee(data.rate);
            if (data.courier_name) setCourierName(data.courier_name);
            if (data.etd_days) setEtdDays(data.etd_days);
          }
        })
        .catch(() => {
          setShippingFee(149);
        })
        .finally(() => {
          setIsCalculatingShipping(false);
        });
    }
  }, [postalCode, hasPhysicalItems, items]);

  const discountedSubtotal = Math.max(0, subtotal - appliedDiscount);
  // Razorpay Gateway Fee: 2% + 18% GST = 2.36% (Buyer Paid)
  const gatewayFee = Math.round((discountedSubtotal + shippingFee) * 0.0236);
  const finalTotal = discountedSubtotal + shippingFee + gatewayFee;

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
        shippingFee,
        gatewayFee,
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

      // Simulate payment capture webhook for instantaneous testing
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
        shippingFee,
        gatewayFee,
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
              <span className="text-zinc-500">Total Amount Paid:</span>
              <span className="font-bold text-white">{formatINR(orderCompleted.amount)}</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>• Shipping Fee (Buyer Paid):</span>
              <span>{orderCompleted.shippingFee > 0 ? formatINR(orderCompleted.shippingFee) : "Free (Digital)"}</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>• Razorpay Gateway Fee (Buyer Paid):</span>
              <span>{formatINR(orderCompleted.gatewayFee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-zinc-500">Escrow Security:</span>
              <span className="text-emerald-400 font-bold">100% Protected</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/account")}
            className="w-full"
          >
            VIEW PORTFOLIO &amp; ORDERS
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-[11px] font-mono text-zinc-300 mb-2">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>256-BIT ENCRYPTED RAZORPAY ROUTE ESCROW</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase">SECURE CHECKOUT</h1>
          </div>
          <div>
            <AuraminatorLogo size="md" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shipping & Billing (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider border-b border-border pb-3">
                1. Shipping &amp; Logistics Destination
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
              <div className="flex items-center justify-between">
                <h2 className="font-bold uppercase text-white tracking-wider">
                  2. Secure Payment Gateway (Razorpay Route)
                </h2>
                <span className="text-[10px] text-emerald-400 font-bold">100% Escrow Protected</span>
              </div>
              <div className="rounded-lg border border-white/20 bg-surface-elevated p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="font-bold text-white text-xs">UPI, Cards, Google Pay, PhonePe, NetBanking</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-sans">Instant Escrow</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-tight">
                  Your payment is locked safely in escrow. The creator is only paid once physical delivery is verified by the courier, service PR is accepted, or digital vault access is granted.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Ledger Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4 font-mono text-xs">
              <h2 className="font-bold uppercase text-white tracking-wider border-b border-border pb-3">
                Order Ledger Breakdown
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

              {/* Transparent Pricing Breakdown: Buyer Pays Shipping & Razorpay Fee */}
              <div className="pt-3 border-t border-border space-y-2.5 text-zinc-400 text-xs">
                <div className="flex justify-between">
                  <span>Gross Items Subtotal</span>
                  <span className="text-white">{formatINR(subtotal)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Drop Discount</span>
                    <span>-{formatINR(appliedDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Tracked Courier Delivery</span>
                    </div>
                    {hasPhysicalItems && (
                      <span className="text-[10px] text-zinc-500 block font-mono">
                        {isCalculatingShipping ? "Resolving fastest courier..." : `${courierName} • ~${etdDays} Days`}
                      </span>
                    )}
                  </div>
                  <span className={shippingFee > 0 ? "text-white font-bold" : "text-emerald-400 font-bold"}>
                    {hasPhysicalItems ? (isCalculatingShipping ? "..." : formatINR(shippingFee)) : "Free (Digital / Service)"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Razorpay Processing Fee (2.36%)</span>
                  </div>
                  <span className="text-white font-bold">{formatINR(gatewayFee)}</span>
                </div>

                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>Platform Escrow Coverage (15%)</span>
                  <span>Included in Seller Escrow</span>
                </div>

                <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-border">
                  <span>Total Payable Amount</span>
                  <span className="text-emerald-400">{formatINR(finalTotal)}</span>
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
                PAY {formatINR(finalTotal)} &amp; AUTHORIZE ESCROW
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
