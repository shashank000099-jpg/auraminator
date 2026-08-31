"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  User,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/context/auth-context";
import { AuraminatorLogo, AuraminatorIcon, AuraminatorWatermark } from "@/components/brand-logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/explore";

  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await signIn(email, password || "password123");
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setErrorMessage(res.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role: "buyer" | "seller") => {
    setIsSubmitting(true);
    setErrorMessage("");
    const demoEmail = role === "seller" ? "kaizen@auraminator.in" : "alex@auraminator.in";
    const res = await signIn(demoEmail, "password123");
    if (res.success) {
      router.push(redirectUrl === "/explore" ? (role === "seller" ? "/seller/dashboard" : "/explore") : redirectUrl);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md w-full space-y-6 relative z-10">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex justify-center mb-2">
          <AuraminatorLogo size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface px-3 py-0.5 text-[11px] text-zinc-400">
          <Lock className="h-3 w-3 text-emerald-400" />
          <span>SOVEREIGN ESCROW AUTHENTICATION</span>
        </div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">
          SIGN IN TO AURAMINATOR
        </h1>
        <p className="text-xs text-zinc-400 font-sans">
          Access your orders, digital vaults, tech services, and creator studio.
        </p>
      </div>

      {/* Card Form */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 brutalist-card">
        {errorMessage && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-xs font-sans">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1.5 relative">
            <label className="block text-[11px] text-zinc-400 uppercase font-bold">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 pr-10 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full flex items-center justify-center gap-2"
          >
            <span>SIGN IN &amp; CONTINUE</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* 1-Click Fast Preview Login */}
        <div className="pt-4 border-t border-border space-y-3">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block text-center">
            Or Fast One-Click Sign In
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("buyer")}
              className="rounded-lg border border-border bg-surface-elevated p-2.5 text-left hover:border-white/40 transition-all text-xs group"
            >
              <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-white">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-bold">Collector / Buyer</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Explore &amp; Checkout</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("seller")}
              className="rounded-lg border border-border bg-surface-elevated p-2.5 text-left hover:border-white/40 transition-all text-xs group"
            >
              <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-white">
                <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-bold">Creator / Studio</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Seller Studio &amp; Payouts</p>
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs font-sans text-zinc-400">
          Don't have an account yet?{" "}
          <Link
            href={`/auth/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="text-white font-bold hover:underline font-mono"
          >
            Sign Up (Free)
          </Link>
        </div>
      </div>

      {/* Guest Exploration Notice */}
      <div className="rounded-xl border border-white/5 bg-surface/50 p-3 text-center text-xs text-zinc-500 font-sans">
        <span>Browsing public drops or careers? You can </span>
        <Link href="/explore" className="text-zinc-300 hover:text-white underline">
          explore everything freely without an account
        </Link>.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 flex items-center justify-center font-mono selection:bg-white selection:text-black relative overflow-hidden">
      <AuraminatorWatermark size={650} className="-top-32 -right-32" />
      <Suspense fallback={<div className="text-zinc-500 text-xs">Loading authentication terminal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
