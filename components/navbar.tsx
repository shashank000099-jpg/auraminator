"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sparkles, User, Search, Shield, Menu, X, ArrowUpRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { AICopilotModal } from "./ai-copilot-modal";

export function Navbar() {
  const pathname = usePathname();
  const { openCart, getTotalCount } = useCartStore();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = getTotalCount();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="h-4 w-4 bg-white rounded-sm inline-block group-hover:scale-110 transition-transform duration-200"></span>
              <span className="font-mono text-sm font-extrabold tracking-tight text-white">
                AURAMINATOR<span className="text-zinc-500">.IN</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-mono">
              <Link
                href="/explore"
                className={`transition-colors ${pathname === "/explore" ? "text-white font-bold" : "text-zinc-400 hover:text-white"}`}
              >
                DROPS
              </Link>
              <Link
                href="/explore?type=digital_file"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                DIGITAL VAULT
              </Link>
              <Link
                href="/explore?type=physical"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                STREETWEAR
              </Link>
              <Link
                href="/seller/dashboard"
                className={`transition-colors ${pathname.startsWith("/seller") ? "text-white font-bold" : "text-zinc-400 hover:text-white"}`}
              >
                SELLER STUDIO
              </Link>
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* AI Copilot Button */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-[11px] font-mono text-zinc-300 hover:border-white/30 hover:text-white transition-all duration-200"
            >
              <Sparkles className="h-3 w-3 text-white" />
              <span>AI COPILOT</span>
            </button>

            {/* Admin link */}
            <Link
              href="/admin/dashboard"
              className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title="Admin Mission Control"
            >
              <Shield className="h-4 w-4" />
            </Link>

            {/* Account link */}
            <Link
              href="/account"
              className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title="Buyer Portfolio"
            >
              <User className="h-4 w-4" />
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-mono text-white hover:border-white/40 transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
              <span>CART</span>
              {totalItems > 0 && (
                <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="border-b border-border bg-black px-4 py-4 md:hidden font-mono text-xs space-y-3">
            <Link
              href="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-white py-1"
            >
              BROWSE ALL DROPS
            </Link>
            <Link
              href="/explore?type=digital_file"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-white py-1"
            >
              DIGITAL ASSET VAULT
            </Link>
            <Link
              href="/explore?type=physical"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-white py-1"
            >
              HEAVYWEIGHT STREETWEAR
            </Link>
            <Link
              href="/seller/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-white py-1"
            >
              SELLER STUDIO & ONBOARDING
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-zinc-300 hover:text-white py-1"
            >
              ADMIN MISSION CONTROL
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCopilotOpen(true);
              }}
              className="w-full text-left text-zinc-300 hover:text-white py-1 flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3" /> LAUNCH AI COPILOT
            </button>
          </div>
        )}
      </header>

      <AICopilotModal isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </>
  );
}
