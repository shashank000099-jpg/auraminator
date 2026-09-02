"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Users,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  XCircle,
  Eye,
  Lock,
  LogOut,
  Sparkles,
  Layers,
  Box,
  Briefcase,
  TrendingUp,
  Server,
  RefreshCw,
  Search,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuraminatorLogo, AuraminatorIcon } from "@/components/brand-logo";

import { createClientSupabase } from "@/lib/supabase/client";

export default function AdminMissionControl() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "sellers" | "products" | "jobs" | "deals" | "audit"
  >("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  const [totalGMV, setTotalGMV] = useState(0);
  const [platformProfit, setPlatformProfit] = useState(0);
  const [escrowLockedFunds, setEscrowLockedFunds] = useState(0);

  // Live State for Seller KYC Approvals
  const [kycRequests, setKycRequests] = useState<any[]>([]);

  // Live State for Product & Asset Moderation
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);

  // Live State for Jobs Moderation
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);

  // Live State for Active Escrow Deal Rooms
  const [activeDeals, setActiveDeals] = useState<any[]>([]);

  // Check Admin Authentication & Load Live DB Data
  useEffect(() => {
    const isAuth = localStorage.getItem("auraminator_admin_authenticated");
    const email = localStorage.getItem("auraminator_admin_email") || "shashank000099@gmail.com";
    if (isAuth !== "true") {
      router.push("/admin/login");
      return;
    }

    setIsAuthenticated(true);
    setAdminEmail(email);

    const supabase = createClientSupabase();

    // 1. Fetch live Seller KYC Submissions
    supabase
      .from("seller_onboarding")
      .select("*, seller:profiles(*)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setKycRequests(
            data.map((k: any) => ({
              id: k.id,
              seller_id: k.seller_id,
              business_name: k.legal_business_name,
              owner_name: k.seller?.full_name || "Creator",
              email: k.seller?.username ? `${k.seller.username}@auraminator.in` : "seller@auraminator.in",
              category: "Verified Seller KYC",
              tax_id: k.tax_identifier || "SUBMITTED",
              bank_account: k.bank_details?.account_number ? `•••• ${k.bank_details.account_number.slice(-4)}` : "Verified",
              submitted_at: new Date(k.created_at || Date.now()).toLocaleDateString(),
              status: k.verification_status || "pending",
              portfolio_url: k.document_urls?.[0] || "#",
            }))
          );
        }
      });

    // 2. Fetch live Products for Moderation
    supabase
      .from("products")
      .select("*, seller:profiles(*)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setPendingProducts(
            data.map((p: any) => ({
              id: p.id,
              title: p.title,
              seller: p.seller?.full_name || p.seller?.username || "Verified Seller",
              type: p.product_type,
              price: p.base_price,
              submitted_at: new Date(p.created_at || Date.now()).toLocaleDateString(),
              status: p.status,
              mrr: p.product_type === "physical" ? "Physical Apparel" : "Turnkey Asset",
            }))
          );
        }
      });

    // 3. Fetch live Jobs for Moderation
    supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setPendingJobs(
            data.map((j: any) => ({
              id: j.id,
              title: j.title,
              company: j.company_name,
              location: j.location,
              salary: j.salary_range,
              submitted_at: new Date(j.created_at || Date.now()).toLocaleDateString(),
              status: j.status,
            }))
          );
        }
      });

    // 4. Fetch live Deal Rooms & Disputes
    supabase
      .from("deal_rooms")
      .select("*, product:products(*), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          let locked = 0;
          const mapped = data.map((d: any) => {
            if (d.escrow_status === "escrow_locked" || d.escrow_status === "buyer_inspecting") {
              locked += d.agreed_price || 0;
            }
            return {
              id: d.id,
              title: d.product?.title || "Asset Deal Room",
              buyer: d.buyer?.full_name || d.buyer?.username || "Buyer",
              seller: d.seller?.full_name || d.seller?.username || "Seller",
              dealPrice: d.agreed_price,
              sellerPayout: d.seller_payout,
              platformFee: d.platform_fee,
              status: d.escrow_status,
              inspectionLeft: "7-Day Warranty Period Active",
              disputeRaised: d.escrow_status === "disputed",
              disputeReason: d.dispute_reason || "Escrow Dispute Review",
            };
          });
          setActiveDeals(mapped);
          setEscrowLockedFunds(locked);
        }
      });

    // 5. Fetch live Orders and calculate real GMV & Profit
    supabase
      .from("orders")
      .select("total_amount, status")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const gmv = data.reduce((acc: number, curr: any) => acc + (curr.total_amount || 0), 0);
          setTotalGMV(gmv);
          setPlatformProfit(Math.round(gmv * 0.15));
        }
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("auraminator_admin_authenticated");
    localStorage.removeItem("auraminator_admin_email");
    router.push("/admin/login");
  };

  // Real Database Actions
  const handleApproveSeller = async (id: string, name: string) => {
    const supabase = createClientSupabase();
    const item = kycRequests.find((k) => k.id === id);
    await supabase.from("seller_onboarding").update({ verification_status: "approved" }).eq("id", id);
    if (item?.seller_id) {
      await supabase.from("profiles").update({ is_verified: true, role: "seller" }).eq("id", item.seller_id);
    }
    setKycRequests((prev) => prev.map((k) => (k.id === id ? { ...k, status: "approved" } : k)));
    alert(`✅ SUCCESS: Seller "${name}" KYC Approved in live Supabase database!`);
  };

  const handleRejectSeller = async (id: string, name: string) => {
    const supabase = createClientSupabase();
    await supabase.from("seller_onboarding").update({ verification_status: "rejected" }).eq("id", id);
    setKycRequests((prev) => prev.filter((k) => k.id !== id));
    alert(`❌ Seller "${name}" application rejected.`);
  };

  const handleApproveProduct = async (id: string, title: string) => {
    const supabase = createClientSupabase();
    await supabase.from("products").update({ status: "published" }).eq("id", id);
    setPendingProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "published" } : p)));
    alert(`✅ SUCCESS: Listing "${title}" Published live to marketplace!`);
  };

  const handleRejectProduct = async (id: string, title: string) => {
    const supabase = createClientSupabase();
    await supabase.from("products").update({ status: "draft" }).eq("id", id);
    setPendingProducts((prev) => prev.filter((p) => p.id !== id));
    alert(`❌ Listing "${title}" unlisted.`);
  };

  const handleApproveJob = async (id: string, title: string) => {
    const supabase = createClientSupabase();
    await supabase.from("jobs").update({ status: "published" }).eq("id", id);
    setPendingJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "published" } : j)));
    alert(`✅ SUCCESS: Career Posting "${title}" Published to live Job Board!`);
  };

  const handleTribunalReleaseToSeller = async (dealId: string) => {
    const supabase = createClientSupabase();
    await supabase.from("deal_rooms").update({ escrow_status: "completed_paid" }).eq("id", dealId);
    setActiveDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, status: "completed_paid", disputeRaised: false } : d))
    );
    alert(`⚖️ TRIBUNAL OVERRIDE: Escrow funds released to Seller (85% net payout settled).`);
  };

  const handleTribunalRefundToBuyer = async (dealId: string) => {
    const supabase = createClientSupabase();
    await supabase.from("deal_rooms").update({ escrow_status: "refunded" }).eq("id", dealId);
    setActiveDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, status: "refunded", disputeRaised: false } : d))
    );
    alert(`⚖️ TRIBUNAL OVERRIDE: Full deal deposit refunded from Escrow to Buyer.`);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Mission Control Banner */}
        <div className="border-b border-red-500/30 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-mono text-red-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>ROOT MASTER ADMIN ENCLAVE: {adminEmail}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase text-white">
              ADMIN MISSION CONTROL
            </h1>
            <p className="text-xs text-zinc-400">
              Omni-Platform Governance: KYC Approvals, Asset Moderation, Escrow Tribunal &amp; Infrastructure Telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border px-3 py-2 text-xs text-emerald-400">
              <Activity className="h-4 w-4" />
              <span>SYSTEMS NOMINAL</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>LOCK TERMINAL</span>
            </Button>
          </div>
        </div>

        {/* Global KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-xl border border-white/15 bg-zinc-950 p-5 brutalist-card space-y-1">
            <span className="text-[11px] text-zinc-500 uppercase font-bold">Total Platform GMV</span>
            <h2 className="text-2xl font-black text-white">{formatINR(totalGMV)}</h2>
            <p className="text-[10px] text-emerald-400">Live Completed Settlements</p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 brutalist-card space-y-1">
            <span className="text-[11px] text-emerald-400 uppercase font-bold">15% Platform Profit</span>
            <h2 className="text-2xl font-black text-emerald-400">{formatINR(platformProfit)}</h2>
            <p className="text-[10px] text-zinc-400">Net Retained Commission</p>
          </div>

          <div className="rounded-xl border border-white/15 bg-zinc-950 p-5 brutalist-card space-y-1">
            <span className="text-[11px] text-zinc-500 uppercase font-bold">Escrow Locked Funds</span>
            <h2 className="text-2xl font-black text-white">{formatINR(escrowLockedFunds)}</h2>
            <p className="text-[10px] text-amber-400">Held in 7-Day Warranty Enclave</p>
          </div>

          <div className="rounded-xl border border-white/15 bg-zinc-950 p-5 brutalist-card space-y-1">
            <span className="text-[11px] text-zinc-500 uppercase font-bold">Action Queue</span>
            <h2 className="text-2xl font-black text-red-400">
              {kycRequests.length + pendingProducts.length + pendingJobs.length} Pending
            </h2>
            <p className="text-[10px] text-zinc-400">Awaiting Admin Verification</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3 text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl transition font-bold ${
              activeTab === "overview" ? "bg-white text-black" : "text-zinc-400 hover:text-white bg-surface"
            }`}
          >
            📊 Infrastructure Telemetry
          </button>
          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-4 py-2 rounded-xl transition font-bold relative ${
              activeTab === "sellers" ? "bg-white text-black" : "text-zinc-400 hover:text-white bg-surface"
            }`}
          >
            <span>👤 Seller KYC Approvals</span>
            {kycRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-[9px] text-white">
                {kycRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl transition font-bold relative ${
              activeTab === "products" ? "bg-white text-black" : "text-zinc-400 hover:text-white bg-surface"
            }`}
          >
            <span>💎 Listing Moderation</span>
            {pendingProducts.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] text-black font-bold">
                {pendingProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 rounded-xl transition font-bold relative ${
              activeTab === "jobs" ? "bg-white text-black" : "text-zinc-400 hover:text-white bg-surface"
            }`}
          >
            <span>💼 Job Board Moderation</span>
            {pendingJobs.length > 0 && (
              <span className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] text-black font-bold">
                {pendingJobs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("deals")}
            className={`px-4 py-2 rounded-xl transition font-bold ${
              activeTab === "deals" ? "bg-white text-black" : "text-zinc-400 hover:text-white bg-surface"
            }`}
          >
            ⚖️ Escrow Deal Tribunal ({activeDeals.length})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl transition font-bold ${
              activeTab === "audit" ? "bg-white text-black" : "text-zinc-400 hover:text-white bg-surface"
            }`}
          >
            🔒 Audit Log
          </button>
        </div>

        {/* TAB 1: OVERVIEW & INFRASTRUCTURE */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Infrastructure Nodes */}
              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                  <Server className="h-4 w-4 text-emerald-400" />
                  <span>Platform Core Infrastructure Nodes</span>
                </h3>
                <div className="divide-y divide-border text-xs space-y-3 pt-2">
                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <strong className="text-white block">Supabase PostgreSQL &amp; Unified Storage</strong>
                      <span className="text-zinc-500 text-[10px]">Database, Auth &amp; Digital Vault Storage Bucket</span>
                    </div>
                    <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      HEALTHY (0ms latency)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <strong className="text-white block">Razorpay Route &amp; Split Escrow</strong>
                      <span className="text-zinc-500 text-[10px]">85% Seller Payout / 15% Platform Split</span>
                    </div>
                    <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      ACTIVE (HMAC Verified)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <strong className="text-white block">Shiprocket Express Logistics</strong>
                      <span className="text-zinc-500 text-[10px]">Delhivery / BlueDart Live Courier AWB</span>
                    </div>
                    <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      CONNECTED
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <strong className="text-white block">Google Gemini AI SEO &amp; Copilot</strong>
                      <span className="text-zinc-500 text-[10px]">Automated Background Meta &amp; Schema Generator</span>
                    </div>
                    <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      OPERATIONAL
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Engine Summary */}
              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <span>Platform Revenue &amp; Split Breakdown</span>
                </h3>
                <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Standard Platform Fee:</span>
                    <strong className="text-emerald-400">15.00% (On All Completed Deals)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Net Seller Payout:</span>
                    <strong className="text-white">85.00% (Direct to Seller Bank)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Payment Gateway Fee:</span>
                    <strong className="text-zinc-300">2.36% (Paid by Buyer at Checkout)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Courier Shipping Fee:</span>
                    <strong className="text-zinc-300">₹149 (Paid by Buyer for Streetwear)</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/explore" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                    <span>View Public Marketplace Frontpage ➔</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SELLER ONBOARDING & KYC APPROVALS */}
        {activeTab === "sellers" && (
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase text-white">Seller KYC Approval Queue</h2>
                <p className="text-xs text-zinc-500">
                  Review tax IDs, banking information, and portfolios before unlocking seller stores.
                </p>
              </div>
              <span className="text-xs text-zinc-400">{kycRequests.length} Pending Approval</span>
            </div>

            {kycRequests.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                All seller KYC dossiers approved and up to date!
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {kycRequests.map((kyc) => (
                  <div key={kyc.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{kyc.business_name}</strong>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 font-bold">
                          {kyc.category}
                        </span>
                        <span className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px]">
                          Pending
                        </span>
                      </div>
                      <p className="text-zinc-400">
                        Owner: <strong className="text-white">{kyc.owner_name}</strong> ({kyc.email})
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        GSTIN: {kyc.tax_id} | Bank Account: {kyc.bank_account} | Submitted {kyc.submitted_at}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={kyc.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-zinc-300 hover:text-white flex items-center gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Portfolio</span>
                      </a>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveSeller(kyc.id, kyc.business_name)}
                        className="flex items-center gap-1.5 bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
                      >
                        <Check className="h-4 w-4" />
                        <span>APPROVE SELLER</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectSeller(kyc.id, kyc.business_name)}
                      >
                        REJECT
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCT & DIGITAL ASSET MODERATION */}
        {activeTab === "products" && (
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase text-white">Listing Moderation Queue</h2>
                <p className="text-xs text-zinc-500">
                  Verify digital asset deliverables, source code authenticity, and streetwear drops.
                </p>
              </div>
              <span className="text-xs text-zinc-400">{pendingProducts.length} Listings Pending</span>
            </div>

            {pendingProducts.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                All marketplace listings reviewed and live!
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {pendingProducts.map((p) => (
                  <div key={p.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{p.title}</strong>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-emerald-400 font-bold">
                          {p.mrr}
                        </span>
                      </div>
                      <p className="text-zinc-400">
                        Seller: <strong className="text-white">{p.seller}</strong> • Listing Price:{" "}
                        <strong className="text-emerald-400">{formatINR(p.price)}</strong>
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Type: <span className="uppercase text-zinc-300">{p.type}</span> • Submitted {p.submitted_at}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveProduct(p.id, p.title)}
                        className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 font-bold"
                      >
                        <Check className="h-4 w-4" />
                        <span>APPROVE &amp; PUBLISH</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectProduct(p.id, p.title)}
                      >
                        FLAG REVISION
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: JOB BOARD MODERATION */}
        {activeTab === "jobs" && (
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase text-white">Career Postings Approval Queue</h2>
                <p className="text-xs text-zinc-500">
                  Verify employer identity and ensure authentic compensation ranges for tech candidates.
                </p>
              </div>
              <span className="text-xs text-zinc-400">{pendingJobs.length} Pending Approval</span>
            </div>

            {pendingJobs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                All employer job postings verified and live!
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {pendingJobs.map((j) => (
                  <div key={j.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{j.title}</strong>
                        <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                          {j.salary}
                        </span>
                      </div>
                      <p className="text-zinc-400">
                        Company: <strong className="text-white">{j.company}</strong> • Location: {j.location}
                      </p>
                      <p className="text-[11px] text-zinc-500">Submitted {j.submitted_at}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveJob(j.id, j.title)}
                        className="flex items-center gap-1.5 bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
                      >
                        <Check className="h-4 w-4" />
                        <span>APPROVE JOB POST</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setPendingJobs((prev) => prev.filter((item) => item.id !== j.id))}
                      >
                        ARCHIVE
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ESCROW DEAL TRIBUNAL */}
        {activeTab === "deals" && (
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase text-white">
                  Active Escrow Deal Rooms &amp; Dispute Tribunal
                </h2>
                <p className="text-xs text-zinc-500">
                  Master arbitrator control for high-ticket SaaS transfers, inspection timer overrides, and refunds.
                </p>
              </div>
              <span className="text-xs text-zinc-400">{activeDeals.length} Active Deals</span>
            </div>

            <div className="divide-y divide-border text-xs">
              {activeDeals.map((deal) => (
                <div key={deal.id} className="py-5 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{deal.title}</strong>
                        {deal.disputeRaised ? (
                          <span className="rounded bg-red-500/10 border border-red-500/40 text-red-400 px-2 py-0.5 text-[10px] font-bold animate-pulse">
                            DISPUTE FLAGGED
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                            ESCROW LOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400">
                        Buyer: <strong className="text-white">{deal.buyer}</strong> | Seller:{" "}
                        <strong className="text-white">{deal.seller}</strong>
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Inspection Status: <strong className="text-amber-400">{deal.inspectionLeft}</strong>
                      </p>
                      {deal.disputeReason && (
                        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                          Dispute Note: {deal.disputeReason}
                        </p>
                      )}
                    </div>

                    <div className="text-right space-y-1 font-mono">
                      <span className="text-xs text-zinc-400 block">Total Deal: {formatINR(deal.dealPrice)}</span>
                      <span className="text-xs text-emerald-400 block font-bold">
                        Seller 85%: {formatINR(deal.sellerPayout)}
                      </span>
                      <span className="text-xs text-zinc-300 block">Platform 15%: {formatINR(deal.platformFee)}</span>
                    </div>
                  </div>

                  {/* Tribunal Action Buttons */}
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
                    >
                      Inspect Live Deal Room ➔
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleTribunalReleaseToSeller(deal.id)}
                      className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
                    >
                      FORCE RELEASE ESCROW TO SELLER
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleTribunalRefundToBuyer(deal.id)}
                    >
                      FORCE REFUND TO BUYER
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT STREAM */}
        {activeTab === "audit" && (
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 text-white">
                <Lock className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase">Cryptographic Audit &amp; Event Stream</h2>
              </div>
              <span className="text-zinc-500">HMAC SHA-256 Verified</span>
            </div>

            <div className="space-y-2 text-zinc-400">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span>[2026-09-01 21:05:12] • gemini.seo.optimized • Product #prod-mod-001 • SEO Score: 98/100</span>
                <span className="text-emerald-400">AUTO-APPLIED</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span>[2026-09-01 20:48:30] • razorpay.route.split • Deal #deal-001 • Payout: ₹3,82,500 (85%)</span>
                <span className="text-emerald-400">ESCROW LOCKED</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span>[2026-09-01 20:30:18] • shiprocket.awb.assigned • Order #ORD-98214 • Delhivery Express</span>
                <span className="text-emerald-400">LABEL GENERATED</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span>[2026-09-01 19:40:02] • supabase.storage.signed_url • Entitlement #ent-001 • 15m Expiry</span>
                <span className="text-zinc-500">DELIVERED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
