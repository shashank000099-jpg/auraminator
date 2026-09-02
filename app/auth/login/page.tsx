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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/explore";

  const { signIn, signInWithGoogle, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMessage("");

    // Master Root Admin Auto-Route
    if (
      email.trim().toLowerCase() === "shashank000099@gmail.com" &&
      password.trim() === "469087383207"
    ) {
      localStorage.setItem("auraminator_admin_authenticated", "true");
      localStorage.setItem("auraminator_admin_email", "shashank000099@gmail.com");
      router.push("/admin/dashboard");
      return;
    }

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

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setErrorMessage("");
    try {
      const res = await signInWithGoogle(redirectUrl);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setErrorMessage(res.error || "Google authentication failed.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Google authentication failed");
    } finally {
      setIsGoogleSubmitting(false);
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

        {/* Google One-Click OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-surface-elevated hover:bg-white/10 hover:border-white/40 py-2.5 px-4 text-xs font-mono text-white transition-all duration-200 group"
        >
          <GoogleIcon className="h-4 w-4 flex-shrink-0" />
          <span className="font-bold">
            {isGoogleSubmitting ? "Connecting to Google..." : "CONTINUE WITH GOOGLE"}
          </span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full"></div>
          <span className="bg-surface px-3 text-[10px] text-zinc-500 uppercase font-mono absolute">
            or sign in with email
          </span>
        </div>

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

        <div className="pt-2 text-center text-xs font-sans text-zinc-400">
          Don&apos;t have an account yet?{" "}
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
