"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sparkles, User, Search, Shield, Menu, X, ArrowUpRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { AICopilotModal } from "./ai-copilot-modal";
import { AuraminatorLogo } from "./brand-logo";

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
            <Link href="/" className="flex items-center">
              <AuraminatorLogo size="md" />
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
                href="/explore?type=service"
                className={`transition-colors ${pathname === "/explore?type=service" ? "text-white font-bold" : "text-zinc-400 hover:text-white"}`}
              >
                TECH SERVICES
              </Link>
              <Link
                href="/explore?type=physical"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                STREETWEAR
              </Link>
              <Link
                href="/explore?type=digital_file"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                DIGITAL VAULT
              </Link>
              <Link
                href="/jobs"
                className={`transition-colors ${pathname.startsWith("/jobs") ? "text-white font-bold" : "text-zinc-400 hover:text-white"}`}
              >
                CAREERS
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
          <div className="border-b border-border bg-black px-4 py-5 md:hidden font-mono text-xs space-y-4">
            <Link
              href="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block group"
            >
              <span className="text-white font-bold block">ALL RELEASES &amp; DROPS</span>
              <span className="text-[10px] text-zinc-500 font-sans">Explore tech services, physical streetwear &amp; digital vaults</span>
            </Link>
            <Link
              href="/explore?type=service"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block group"
            >
              <span className="text-emerald-400 font-bold block">TECH SERVICES (Debug &amp; Code)</span>
              <span className="text-[10px] text-zinc-500 font-sans">24h bug fixing, Next.js architecture &amp; smart contract audits</span>
            </Link>
            <Link
              href="/explore?type=physical"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block group"
            >
              <span className="text-white font-bold block">HEAVYWEIGHT STREETWEAR</span>
              <span className="text-[10px] text-zinc-500 font-sans">500 GSM luxury garments with tracked courier delivery</span>
            </Link>
            <Link
              href="/jobs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block group"
            >
              <span className="text-white font-bold block">CAREERS &amp; TECH JOBS</span>
              <span className="text-[10px] text-zinc-500 font-sans">100% Free job board &amp; candidate applications</span>
            </Link>
            <Link
              href="/seller/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block group"
            >
              <span className="text-white font-bold block">SELLER STUDIO &amp; KYC</span>
              <span className="text-[10px] text-zinc-500 font-sans">Creator dashboard, escrow settlements &amp; drop creator</span>
            </Link>
            <Link
              href="/brand"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block group"
            >
              <span className="text-white font-bold block">BRAND ASSETS &amp; LOGOS</span>
              <span className="text-[10px] text-zinc-500 font-sans">Download official vector SVG &amp; PNG logo files</span>
            </Link>
            <div className="pt-2 border-t border-border">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCopilotOpen(true);
                }}
                className="w-full text-left text-emerald-400 font-bold py-1 flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" /> LAUNCH AI COPILOT ASSISTANT
              </button>
            </div>
          </div>
        )}
      </header>

      <AICopilotModal isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </>
  );
}
