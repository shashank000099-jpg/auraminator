"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sparkles, User, Search, Shield, Menu, X, ArrowUpRight, LogOut, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuth } from "@/lib/context/auth-context";
import { AICopilotModal } from "./ai-copilot-modal";
import { AuraminatorLogo } from "./brand-logo";

export function Navbar() {
  const pathname = usePathname();
  const { openCart, getTotalCount } = useCartStore();
  const { user, signOut } = useAuth();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
                href="/account/deals"
                className={`transition-colors flex items-center gap-1 ${pathname.startsWith("/account/deals") || pathname.startsWith("/deals") ? "text-emerald-400 font-bold" : "text-zinc-400 hover:text-white"}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>DEALS</span>
              </Link>
              <Link
                href="/explore?type=saas"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                APPS &amp; SAAS
              </Link>
              <Link
                href="/explore?type=service"
                className={`transition-colors ${pathname === "/explore?type=service" ? "text-white font-bold" : "text-zinc-400 hover:text-white"}`}
              >
                SERVICES
              </Link>
              <Link
                href="/explore?type=physical"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                STREETWEAR
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
                STUDIO
              </Link>
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Copilot Button - Mobile & Desktop */}
            <button
              onClick={() => {
                try {
                  if ("vibrate" in navigator) navigator.vibrate(12);
                } catch {}
                setIsCopilotOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-surface px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:border-white/40 hover:text-white transition-all duration-150 active:scale-95"
            >
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span className="hidden sm:inline">AI COPILOT</span>
              <span className="sm:hidden text-[10px] font-bold text-white">AI</span>
            </button>

            {/* Admin link */}
            <Link
              href="/admin/dashboard"
              className="hidden sm:inline-flex p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title="Admin Mission Control"
            >
              <Shield className="h-4 w-4" />
            </Link>

            {/* Auth / Account Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-mono text-white hover:border-white/40 transition-colors active:scale-95"
                >
                  <div className="h-4 w-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">{user.fullName.split(" ")[0]}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface-elevated p-2 shadow-2xl z-50 text-xs font-mono animate-in fade-in space-y-1">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="font-bold text-white truncate">{user.fullName}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-bold">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Orders &amp; Downloads
                    </Link>

                    <Link
                      href="/account/deals"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-emerald-400 hover:bg-white/10 transition-colors font-bold"
                    >
                      Deals &amp; Negotiations
                    </Link>

                    <Link
                      href="/seller/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Seller Studio &amp; Payouts
                    </Link>

                    <Link
                      href="/jobs/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Candidate Pipeline
                    </Link>

                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/auth/login"
                  className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/40 transition-colors active:scale-95"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/auth/signup"
                  className="hidden sm:inline-flex rounded-lg border border-white bg-white px-3 py-1.5 text-xs font-mono text-black font-bold hover:bg-zinc-200 transition-colors active:scale-95"
                >
                  JOIN
                </Link>
              </div>
            )}

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => {
                try {
                  if ("vibrate" in navigator) navigator.vibrate(12);
                } catch {}
                openCart();
              }}
              className="relative flex items-center justify-center rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-mono text-white hover:border-white/40 transition-colors active:scale-95"
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">CART</span>
              {totalItems > 0 && (
                <span className="ml-1 sm:ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                try {
                  if ("vibrate" in navigator) navigator.vibrate(10);
                } catch {}
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="p-1.5 text-zinc-400 hover:text-white md:hidden active:scale-95"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-black/95 p-4 space-y-4 font-mono text-xs animate-in slide-in-from-top-2">
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

            <div className="pt-2 border-t border-border flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-zinc-400">Signed in as <strong className="text-white">{user.fullName}</strong></span>
                  <button onClick={() => signOut()} className="text-red-400 font-bold">Sign Out</button>
                </div>
              ) : (
                <div className="flex gap-2 w-full">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2 rounded-lg border border-border text-white">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2 rounded-lg bg-white text-black font-bold">
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Multimodal AI Copilot Modal */}
      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </>
  );
}
