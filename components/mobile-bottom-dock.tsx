"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  ShieldCheck,
  Search,
  Briefcase,
  ShoppingBag,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { MobileSearchDrawer } from "./mobile-search-drawer";

export function MobileBottomDock() {
  const pathname = usePathname();
  const { openCart, getTotalCount } = useCartStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = getTotalCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Haptic feedback trigger for native mobile feel
  const triggerHaptic = (duration = 12) => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(duration);
      }
    } catch {}
  };

  // Do not render on checkout page to avoid input occlusion
  if (pathname === "/checkout") return null;

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-[60] md:hidden pointer-events-none pb-[env(safe-area-inset-bottom,10px)] px-3 mb-2">
        <nav
          aria-label="Mobile Bottom App Navigation"
          className="pointer-events-auto max-w-md mx-auto flex items-center justify-between rounded-full border border-white/20 bg-black/90 backdrop-blur-2xl px-2 py-1.5 shadow-[0_12px_45px_rgba(0,0,0,0.95),0_0_25px_rgba(16,185,129,0.2)]"
        >
          {/* 1. Explore / Drops Tab */}
          <Link
            href="/explore"
            onClick={() => triggerHaptic(15)}
            className={`flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150 active:scale-90 rounded-full select-none ${
              pathname === "/explore" || pathname === "/"
                ? "text-white font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <Flame
                className={`h-4 w-4 ${
                  pathname === "/explore" || pathname === "/"
                    ? "text-emerald-400 fill-emerald-400/20"
                    : ""
                }`}
              />
              {(pathname === "/explore" || pathname === "/") && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-400" />
              )}
            </div>
            <span className="text-[9px] font-mono tracking-tight mt-0.5">DROPS</span>
          </Link>

          {/* 2. Escrow Deals Tab */}
          <Link
            href="/account/deals"
            onClick={() => triggerHaptic(15)}
            className={`flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150 active:scale-90 rounded-full select-none ${
              pathname.startsWith("/deals") || pathname.startsWith("/account/deals")
                ? "text-emerald-400 font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <ShieldCheck className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[9px] font-mono tracking-tight mt-0.5">DEALS</span>
          </Link>

          {/* 3. Center Spotlight Search & AI Trigger */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setIsSearchOpen(true);
            }}
            className="flex h-11 w-11 -my-2 mx-1 items-center justify-center rounded-full bg-gradient-to-b from-white via-zinc-200 to-zinc-400 text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-150 active:scale-90 select-none shrink-0"
            title="Search & AI Copilot"
          >
            <Search className="h-4 w-4 stroke-[2.5]" />
          </button>

          {/* 4. Jobs / Careers Tab */}
          <Link
            href="/jobs"
            onClick={() => triggerHaptic(15)}
            className={`flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150 active:scale-90 rounded-full select-none ${
              pathname.startsWith("/jobs")
                ? "text-white font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <Briefcase className="h-4 w-4" />
              <span className="absolute -top-1.5 -right-2 text-[7px] font-mono font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1 rounded-full">
                FREE
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-tight mt-0.5">JOBS</span>
          </Link>

          {/* 5. Cart / Vault Tab */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              openCart();
            }}
            className="flex flex-1 flex-col items-center justify-center py-1.5 text-zinc-400 hover:text-white transition-all duration-150 active:scale-90 rounded-full select-none"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-white px-0.5 text-[8px] font-mono font-bold text-black shadow-sm">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[9px] font-mono tracking-tight mt-0.5">CART</span>
          </button>
        </nav>
      </div>

      {/* Mobile Instant Spotlight Search & Filter Drawer */}
      <MobileSearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
