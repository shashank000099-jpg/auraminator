"use client";

import React from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Clock } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalAmount, reservationExpiry } = useCartStore();
  const total = getTotalAmount();

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="border-b border-border pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase">SHOPPING CART</h1>
            <p className="text-xs font-mono text-zinc-500 mt-1">
              Review reserved drop artifacts and verify order quantities before checkout.
            </p>
          </div>
          <Link href="/explore" className="text-xs font-mono text-zinc-400 hover:text-white">
            ← Continue Browsing
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center space-y-4 font-mono rounded-xl border border-dashed border-border bg-surface">
            <p className="text-sm text-zinc-400">YOUR CART IS CURRENTLY EMPTY</p>
            <Link href="/explore">
              <Button variant="primary" size="md">
                DISCOVER ACTIVE DROPS
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item, idx) => {
                const price = item.variant ? item.variant.price : item.product.base_price;
                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id || "base"}-${idx}`}
                    className="rounded-xl border border-border bg-surface p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {item.product.product_type.replace("_", " ")}
                        </span>
                        <h3 className="font-semibold text-white text-base mt-0.5">
                          {item.product.title}
                        </h3>
                        {item.variant && (
                          <p className="text-xs font-mono text-zinc-400 mt-1">
                            SKU / Variant: {item.variant.title}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.variant?.id)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 font-mono text-xs">
                      <div className="flex items-center gap-2 rounded border border-border bg-surface-elevated px-2.5 py-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-white font-bold px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-white">
                        {formatINR(price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Box */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl border border-border bg-surface p-6 space-y-4 font-mono text-xs">
                <p className="font-bold text-white uppercase text-sm border-b border-border pb-3">
                  ORDER SUMMARY
                </p>

                <div className="space-y-2 text-zinc-400">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-white">{formatINR(total)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Shipping &amp; Razorpay Fee</span>
                    <span className="text-zinc-400">Calculated at Checkout</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Escrow Protection</span>
                    <span className="text-emerald-400">Included</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-base border-t border-border pt-3">
                    <span>Estimated Subtotal</span>
                    <span>{formatINR(total)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block w-full pt-2">
                  <Button variant="primary" size="lg" className="w-full flex items-center justify-between">
                    <span>PROCEED TO SECURE CHECKOUT</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <div className="space-y-2 pt-2 border-t border-border text-[10px]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>100% Escrow Protection • Zero Risk</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 font-sans">
                    <Clock className="h-3 w-3 text-zinc-400" />
                    <span>Inventory is held for 15 mins to guarantee stock for you.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
