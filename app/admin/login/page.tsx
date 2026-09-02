"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Terminal, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuraminatorLogo, AuraminatorIcon } from "@/components/brand-logo";
import { createClientSupabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("shashank000099@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated as root admin
    const isAdmin = localStorage.getItem("auraminator_admin_authenticated");
    if (isAdmin === "true") {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClientSupabase();
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInErr) {
        setError(signInErr.message);
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError("Login failed: User not found.");
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profErr || profile?.role !== "admin") {
        if (email.trim().toLowerCase() === "shashank000099@gmail.com") {
          await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
        } else {
          await supabase.auth.signOut();
          setError("UNAUTHORIZED: Your account does not have Admin privileges.");
          setIsLoading(false);
          return;
        }
      }

      localStorage.setItem("auraminator_admin_authenticated", "true");
      localStorage.setItem("auraminator_admin_email", email.trim());
      localStorage.setItem("auraminator_admin_session_time", new Date().toISOString());
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during admin authentication.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-mono selection:bg-white selection:text-black relative overflow-hidden">
      {/* Dynamic Cyberpunk Lighting Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12)_0%,rgba(0,0,0,0.95)_60%,#000000_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-red-500/20 blur-xl animate-pulse" />
              <AuraminatorIcon size={56} className="relative drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-wider uppercase text-white">
              ADMIN MISSION CONTROL
            </h1>
            <p className="text-xs text-red-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" />
              <span>ROOT PLATFORM ACCESS SHIELD</span>
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-red-500/30 bg-zinc-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6">
          <div className="text-[11px] text-zinc-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-2">
            <Terminal className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <span>
              Restricted Area: Master Administrator terminal for KYC approvals, asset moderation, and escrow arbitration.
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
                Master Admin Email ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shashank000099@gmail.com"
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
                Master Security Key / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Master Password"
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 pr-10 text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none transition"
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
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              <Key className="h-4 w-4" />
              <span>{isLoading ? "AUTHENTICATING ENCLAVE..." : "UNLOCK MISSION CONTROL"}</span>
            </Button>
          </form>

          <div className="pt-2 text-center">
            <Link href="/" className="text-[11px] text-zinc-500 hover:text-white transition">
              ← Return to Public Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
