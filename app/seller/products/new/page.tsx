"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Lock,
  Download,
  Link2,
  Box,
  Code2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Layers,
  Handshake,
  Smartphone,
  Globe,
  Youtube,
  Instagram,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import { ProductType } from "@/lib/types";

export default function NewProductDropPage() {
  const router = useRouter();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Product Fields
  const [title, setTitle] = useState("VividAI • Automated Short-Form Video Generator SaaS");
  const [productType, setProductType] = useState<ProductType>("saas");
  const [basePrice, setBasePrice] = useState("450000");
  const [description, setDescription] = useState(
    "Turnkey B2B SaaS platform generating ₹48.5k verified MRR with 82% profit margins. Complete turnkey handover including domain, Stripe customers, and Next.js / FastAPI codebase."
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
  );
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState("");

  // SaaS & Web Asset Specific Fields
  const [assetMrr, setAssetMrr] = useState("48500");
  const [assetArr, setAssetArr] = useState("582000");
  const [assetNetProfit, setAssetNetProfit] = useState("39000");
  const [assetDomain, setAssetDomain] = useState("vividai.tools");
  const [assetMonthlyVisitors, setAssetMonthlyVisitors] = useState("34200");
  const [assetTechStack, setAssetTechStack] = useState("Next.js 14, FastAPI, Replicate AI, Stripe, Supabase");

  // Mobile App Specific Fields
  const [appPlatform, setAppPlatform] = useState<"both" | "ios" | "android">("both");
  const [appDownloads, setAppDownloads] = useState("65000");

  // Source Code Specific Fields
  const [repoUrl, setRepoUrl] = useState("github.com/syntaxlabs/vividai");
  const [licenseType, setLicenseType] = useState<"exclusive_ip" | "commercial_source">("exclusive_ip");

  // Social Account Specific Fields
  const [socialPlatform, setSocialPlatform] = useState<"youtube" | "instagram" | "twitter_x" | "tiktok">("youtube");
  const [socialHandle, setSocialHandle] = useState("@CodeVortexAI");
  const [socialFollowers, setSocialFollowers] = useState("142000");
  const [socialMonetized, setSocialMonetized] = useState(true);

  // Service Specific Fields
  const [serviceSlaDays, setServiceSlaDays] = useState("1");

  // Physical Specific Fields
  const [fabricGsm, setFabricGsm] = useState("500 GSM French Terry");
  const [itemWeightGrams, setItemWeightGrams] = useState("850");

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceNum = parseFloat(basePrice) || 0;
  const platformFee = priceNum * 0.15; // 15% platform fee
  const sellerNetPayout = priceNum * 0.85; // 85% creator payout

  const handleSubmitDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        product_type: productType,
        base_price: priceNum,
        platform_fee_percent: 15.0,
        thumbnail_url: thumbnailUrl,
        media_gallery: [thumbnailUrl, ...galleryUrls.split(",").map((u) => u.trim()).filter(Boolean)],
        asset_metrics: {
          mrr: assetMrr ? parseFloat(assetMrr) : undefined,
          arr: assetArr ? parseFloat(assetArr) : undefined,
          net_profit_monthly: assetNetProfit ? parseFloat(assetNetProfit) : undefined,
          domain_name: assetDomain || undefined,
          monthly_visitors: assetMonthlyVisitors ? parseInt(assetMonthlyVisitors) : undefined,
          tech_stack: assetTechStack ? assetTechStack.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
          platform: productType === "app" ? appPlatform : productType === "social_account" ? socialPlatform : undefined,
          downloads_count: appDownloads ? parseInt(appDownloads) : undefined,
          followers_count: socialFollowers ? parseInt(socialFollowers) : undefined,
          handle: socialHandle || undefined,
          is_monetized: socialMonetized,
          github_repo_url: repoUrl || undefined,
          license_type: licenseType,
          transfer_items: [
            "Primary Domain / Account Ownership Handover",
            "Full GitHub Organization & Source Code Access",
            "Revenue & Customer Database Integration Transfer",
            "30 Days Seller Transition Support"
          ]
        },
        variants:
          productType === "physical"
            ? [
                { sku: `SKU-${Date.now()}-M`, title: "Pitch Black / M", price: priceNum, inventory_count: 20 },
                { sku: `SKU-${Date.now()}-L`, title: "Pitch Black / L", price: priceNum, inventory_count: 15 },
                { sku: `SKU-${Date.now()}-XL`, title: "Pitch Black / XL", price: priceNum, inventory_count: 10 },
              ]
            : [],
      };

      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Drop publication failed");
      router.push("/seller/dashboard");
    } catch (err: any) {
      alert(`Drop creation notice: ${err.message}`);
      router.push("/seller/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/seller/dashboard" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Studio</span>
            </Link>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white mt-2">
              LIST NEW ASSET / PRODUCT / SAAS
            </h1>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>PROTECTED ESCROW BROKERAGE</span>
          </div>
        </div>

        {/* Drop Builder Form */}
        <form onSubmit={handleSubmitDrop} className="space-y-6">
          {/* Classification Selector */}
          <div className="space-y-2">
            <label className="block text-xs uppercase text-zinc-400 font-bold">1. Select Asset Classification</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { id: "saas", label: "Turnkey SaaS / Website", icon: Sparkles },
                { id: "app", label: "Mobile App (iOS/Android)", icon: Smartphone },
                { id: "source_code", label: "Full Source Code IP", icon: Code2 },
                { id: "social_account", label: "Social Media Account", icon: Globe },
                { id: "service", label: "Tech Service (Debug/Dev)", icon: Layers },
                { id: "physical", label: "Cut-and-Sew Streetwear", icon: Box },
                { id: "digital_file", label: "Digital Vault (ZIP/3D)", icon: Download },
                { id: "digital_link", label: "Notion / Workspace Link", icon: Link2 },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setProductType(t.id as any)}
                    className={`rounded-lg border p-3 text-left transition-all space-y-1.5 ${
                      productType === t.id
                        ? "border-white bg-white/10 text-white font-bold"
                        : "border-border bg-surface text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <p className="text-[11px] leading-tight">{t.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h2 className="text-xs font-bold uppercase text-white tracking-wider">
              2. Title &amp; Real-Time 15% Platform Commission Split
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Title (Asset or Product Name)"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="List / Buy Now Price (INR ₹)"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
            </div>

            {/* Real-time Commission Breakdown Card */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-emerald-400 font-bold block">✓ Net Seller Escrow Payout (85%)</span>
                <span className="text-xl font-bold text-white mt-0.5 block">{formatINR(sellerNetPayout)}</span>
                <span className="text-[10px] text-zinc-500">Dispatched automatically upon buyer handover inspection</span>
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                <span className="text-zinc-500 block text-[10px]">Platform Escrow Fee (15%)</span>
                <span className="text-zinc-300 font-bold">{formatINR(platformFee)}</span>
                <span className="text-[10px] text-zinc-500 block">Includes Razorpay + Protected Deal Room</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase text-zinc-400 font-bold">Description &amp; Deliverables Scope</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Thumbnail Image Link (URL)"
                required
                placeholder="https://images.unsplash.com/... or Cloudflare R2 link"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />

              <Input
                label="Video Preview / Reel Link (URL)"
                placeholder="https://domain.com/preview.mp4 or YouTube / Vimeo link"
                value={videoPreviewUrl}
                onChange={(e) => setVideoPreviewUrl(e.target.value)}
              />
            </div>

            <Input
              label="Additional Media Gallery Image Links (Comma-separated URLs)"
              placeholder="https://image1.jpg, https://image2.jpg, https://image3.jpg"
              value={galleryUrls}
              onChange={(e) => setGalleryUrls(e.target.value)}
            />
          </div>

          {/* Conditional Sub-settings for SaaS */}
          {productType === "saas" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>SaaS Revenue &amp; Architecture Metrics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Monthly Recurring Revenue (MRR ₹)"
                  value={assetMrr}
                  onChange={(e) => setAssetMrr(e.target.value)}
                  placeholder="e.g. 48500"
                />
                <Input
                  label="Monthly Net Profit (₹)"
                  value={assetNetProfit}
                  onChange={(e) => setAssetNetProfit(e.target.value)}
                  placeholder="e.g. 39000"
                />
                <Input
                  label="Primary Domain Name"
                  value={assetDomain}
                  onChange={(e) => setAssetDomain(e.target.value)}
                  placeholder="e.g. vividai.tools"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Monthly Website Visitors"
                  value={assetMonthlyVisitors}
                  onChange={(e) => setAssetMonthlyVisitors(e.target.value)}
                  placeholder="e.g. 34000"
                />
                <Input
                  label="Tech Stack (Comma separated)"
                  value={assetTechStack}
                  onChange={(e) => setAssetTechStack(e.target.value)}
                  placeholder="Next.js 14, FastAPI, Stripe, Supabase"
                />
              </div>
            </div>
          )}

          {/* Conditional Sub-settings for Mobile Apps */}
          {productType === "app" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>Mobile App Platform &amp; Store Metrics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase text-zinc-400 font-bold">App Store Platform</label>
                  <select
                    value={appPlatform}
                    onChange={(e) => setAppPlatform(e.target.value as any)}
                    className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs font-mono text-white focus:border-white focus:outline-none"
                  >
                    <option value="both">Both iOS (App Store) &amp; Android (Google Play)</option>
                    <option value="ios">iOS App Store Only</option>
                    <option value="android">Google Play Store Only</option>
                  </select>
                </div>
                <Input
                  label="Total Verified Downloads"
                  value={appDownloads}
                  onChange={(e) => setAppDownloads(e.target.value)}
                  placeholder="e.g. 65000"
                />
              </div>
            </div>
          )}

          {/* Conditional Sub-settings for Source Code */}
          {productType === "source_code" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>Source Code Repository &amp; IP Assignment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="GitHub / GitLab Repository URL"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="github.com/organization/repo-name"
                />
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase text-zinc-400 font-bold">License / IP Transfer Type</label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value as any)}
                    className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs font-mono text-white focus:border-white focus:outline-none"
                  >
                    <option value="exclusive_ip">100% Exclusive IP &amp; Copyright Assignment</option>
                    <option value="commercial_source">Non-Exclusive Commercial Source License</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Sub-settings for Social Accounts */}
          {productType === "social_account" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span>Social Media Account Reach &amp; Handover</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase text-zinc-400 font-bold">Social Platform</label>
                  <select
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value as any)}
                    className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs font-mono text-white focus:border-white focus:outline-none"
                  >
                    <option value="youtube">YouTube Channel</option>
                    <option value="instagram">Instagram Account</option>
                    <option value="twitter_x">X / Twitter Handle</option>
                    <option value="tiktok">TikTok Profile</option>
                  </select>
                </div>

                <Input
                  label="Handle / Channel Name"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="e.g. @CodeVortexAI"
                />

                <Input
                  label="Followers / Subscribers Count"
                  value={socialFollowers}
                  onChange={(e) => setSocialFollowers(e.target.value)}
                  placeholder="e.g. 142000"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <Link href="/seller/dashboard">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200"
            >
              <span>PUBLISH LISTING &amp; ENABLE ESCROW DEALS</span>
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
