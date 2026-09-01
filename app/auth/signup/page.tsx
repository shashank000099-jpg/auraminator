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
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/context/auth-context";
import { AuraminatorLogo, AuraminatorIcon, AuraminatorWatermark } from "@/components/brand-logo";

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/explore";

  const { signUp, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    if (!agreeTerms) {
      setErrorMessage("Please agree to the platform escrow & commerce terms.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await signUp(email, password, fullName, role);
      if (res.success) {
        if (role === "seller") {
          router.push("/seller/onboarding");
        } else {
          router.push(redirectUrl);
        }
      } else {
        setErrorMessage(res.error || "Registration failed. Please check details.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleSubmitting(true);
    setErrorMessage("");
    try {
      const res = await signInWithGoogle(redirectUrl);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setErrorMessage(res.error || "Google sign up failed.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Google sign up failed");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 relative z-10">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex justify-center mb-2">
          <AuraminatorLogo size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface px-3 py-0.5 text-[11px] text-zinc-400">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>JOIN THE AURAMINATOR NETWORK</span>
        </div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">
          CREATE SOVEREIGN ACCOUNT
        </h1>
        <p className="text-xs text-zinc-400 font-sans">
          100% Free registration for Collectors, Creators, Developers &amp; Startups.
        </p>
      </div>

      {/* Card Form */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 brutalist-card">
        {errorMessage && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-xs font-sans">
            {errorMessage}
          </div>
        )}

        {/* Google OAuth One-Click */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleSubmitting}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-surface-elevated hover:bg-white/10 hover:border-white/40 py-2.5 px-4 text-xs font-mono text-white transition-all duration-200"
        >
          <GoogleIcon className="h-4 w-4 flex-shrink-0" />
          <span className="font-bold">
            {isGoogleSubmitting ? "Signing up with Google..." : "CONTINUE WITH GOOGLE"}
          </span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full"></div>
          <span className="bg-surface px-3 text-[10px] text-zinc-500 uppercase font-mono absolute">
            or register with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Role Switcher */}
          <div className="space-y-1.5">
            <label className="block text-[11px] text-zinc-400 uppercase font-bold">
              Account Intent
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`rounded-lg border p-3 text-left transition-all ${
                  role === "buyer"
                    ? "border-white bg-white text-black font-bold"
                    : "border-border bg-surface-elevated text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>Buyer / Talent</span>
                </div>
                <p className="text-[10px] font-sans opacity-80 mt-0.5">Shop &amp; Apply for Jobs</p>
              </button>

              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`rounded-lg border p-3 text-left transition-all ${
                  role === "seller"
                    ? "border-white bg-white text-black font-bold"
                    : "border-border bg-surface-elevated text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Creator / Seller</span>
                </div>
                <p className="text-[10px] font-sans opacity-80 mt-0.5">Sell Drops &amp; Post Jobs</p>
              </button>
            </div>
          </div>

          <Input
            label="Full Legal Name / Studio Name"
            required
            placeholder="e.g. Alex Mercer"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

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
              Create Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minimum 8 characters"
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

          {/* Terms checkbox */}
          <label className="flex items-start gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-border bg-surface-elevated accent-white"
            />
            <span className="text-[11px] text-zinc-400 font-sans leading-tight">
              I agree to the <span className="text-white">Escrow Protocol</span>, 15% Platform Commission Terms, and Zero-Counterfeit Policy.
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full flex items-center justify-center gap-2"
          >
            <span>CREATE ACCOUNT &amp; CONTINUE</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs font-sans text-zinc-400">
          Already have an account?{" "}
          <Link
            href={`/auth/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="text-white font-bold hover:underline font-mono"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 flex items-center justify-center font-mono selection:bg-white selection:text-black relative overflow-hidden">
      <AuraminatorWatermark size={650} className="-top-32 -right-32" />
      <Suspense fallback={<div className="text-zinc-500 text-xs">Loading registration terminal...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
