"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatINR } from "@/lib/utils";
import { Button } from "./ui/button";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalAmount,
    reservationExpiry,
  } = useCartStore();

  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!reservationExpiry) {
      setTimeLeft("");
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = reservationExpiry - now;
      if (diff <= 0) {
        setTimeLeft("00:00 (Expired)");
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservationExpiry]);

  const total = getTotalAmount();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-surface border-l border-border text-white flex flex-col justify-between shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <h2 className="text-base font-bold tracking-tight">CART & RESERVATIONS</h2>
                  </div>
                  <button
                    onClick={closeCart}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Live Concurrency Reservation Banner */}
                {items.length > 0 && timeLeft && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-elevated border border-border px-3 py-2 text-[11px] font-mono text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-amber-400 animate-pulse" />
                      <span>Inventory Hold:</span>
                    </div>
                    <span className="font-bold text-amber-400">{timeLeft}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="py-20 text-center space-y-3 font-mono">
                    <div className="h-10 w-10 mx-auto rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
                      ∅
                    </div>
                    <p className="text-xs text-zinc-400">YOUR CART IS CURRENTLY EMPTY</p>
                    <p className="text-[11px] text-zinc-600">Explore active drops and exclusive vaults.</p>
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const price = item.variant ? item.variant.price : item.product.base_price;
                    return (
                      <div
                        key={`${item.product.id}-${item.variant?.id || "base"}-${idx}`}
                        className="rounded-xl border border-border bg-surface-elevated p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">
                              {item.product.product_type.replace("_", " ")}
                            </span>
                            <h4 className="text-xs font-semibold text-white line-clamp-1 mt-0.5">
                              {item.product.title}
                            </h4>
                            {item.variant && (
                              <p className="text-[11px] font-mono text-zinc-400">
                                Variant: {item.variant.title}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.variant?.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-xs">
                          {/* Quantity control */}
                          <div className="flex items-center gap-2 rounded border border-border bg-surface px-2 py-1">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.variant?.id
                                )
                              }
                              className="text-zinc-400 hover:text-white"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-white font-bold px-1">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.variant?.id
                                )
                              }
                              className="text-zinc-400 hover:text-white"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-white">{formatINR(price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer / Summary */}
              {items.length > 0 && (
                <div className="border-t border-border p-6 bg-surface space-y-4">
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Items Subtotal</span>
                      <span className="text-white">{formatINR(total)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>Shipping &amp; Razorpay Fee</span>
                      <span className="text-zinc-500">Added at Checkout</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>Escrow Protection (15%)</span>
                      <span className="text-emerald-400 font-bold">Included</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-border text-sm">
                      <span>Estimated Total</span>
                      <span>{formatINR(total)}</span>
                    </div>
                  </div>

                  <Link href="/checkout" onClick={closeCart} className="block w-full">
                    <Button variant="primary" size="lg" className="w-full flex items-center justify-between">
                      <span>PROCEED TO CHECKOUT</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>Protected by Auraminator Double-Entry Escrow</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
