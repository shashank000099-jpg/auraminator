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
import { useAuth } from "@/lib/context/auth-context";

export default function NewProductDropPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Product Fields
  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState<ProductType>("saas");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState("");

  // SaaS & Web Asset Specific Fields
  const [assetMrr, setAssetMrr] = useState("");
  const [assetArr, setAssetArr] = useState("");
  const [assetNetProfit, setAssetNetProfit] = useState("");
  const [assetDomain, setAssetDomain] = useState("");
  const [assetMonthlyVisitors, setAssetMonthlyVisitors] = useState("");
  const [assetTechStack, setAssetTechStack] = useState("");

  // Mobile App Specific Fields
  const [appPlatform, setAppPlatform] = useState<"both" | "ios" | "android">("both");
  const [appDownloads, setAppDownloads] = useState("");

  // Source Code Specific Fields
  const [repoUrl, setRepoUrl] = useState("");
  const [licenseType, setLicenseType] = useState<"exclusive_ip" | "commercial_source">("exclusive_ip");

  // Social Account Specific Fields
  const [socialPlatform, setSocialPlatform] = useState<"youtube" | "instagram" | "twitter_x" | "tiktok">("youtube");
  const [socialHandle, setSocialHandle] = useState("");
  const [socialFollowers, setSocialFollowers] = useState("");
  const [socialMonetized, setSocialMonetized] = useState(false);

  // Service Specific Fields
  const [serviceSlaDays, setServiceSlaDays] = useState("7");

  // Physical & Shiprocket Specific Fields (Only active for physical products!)
  const [fabricGsm, setFabricGsm] = useState("");
  const [itemWeightGrams, setItemWeightGrams] = useState("");
  const [pickupNickname, setPickupNickname] = useState("");
  const [pickupContact, setPickupContact] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupState, setPickupState] = useState("");
  const [pickupPin, setPickupPin] = useState("");
  const [packageLength, setPackageLength] = useState("");
  const [packageBreadth, setPackageBreadth] = useState("");
  const [packageHeight, setPackageHeight] = useState("");

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <span>VERIFYING CREATOR CREDENTIALS...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center font-mono">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-surface p-8 text-center space-y-6 brutalist-card">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">
              AUTHENTICATION REQUIRED
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Sign in or register an account before listing a new asset, SaaS, or drop on Auraminator.
            </p>
          </div>
          <Link href="/auth/login?redirect=/seller/products/new">
            <Button variant="primary" size="lg" className="w-full font-mono">
              SIGN IN TO PUBLISH DROP
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const priceNum = parseFloat(basePrice) || 0;
  const platformFee = priceNum * 0.15; // 15% platform fee
  const sellerNetPayout = priceNum * 0.85; // 85% creator payout

  const handleSubmitDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If physical product, ensure warehouse pickup origin is registered for Shiprocket
      if (productType === "physical") {
        try {
          await fetch("/api/seller/pickup-addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pickupLocationNickname: pickupNickname,
              contactName: pickupContact,
              contactPhone: pickupPhone,
              addressLine1: pickupAddress,
              city: pickupCity,
              state: pickupState,
              pincode: pickupPin,
              isPrimary: true,
            }),
          });
        } catch {}
      }
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

          {/* Conditional Sub-settings for Physical Luxury Streetwear (Shiprocket Logistics Sync) */}
          {productType === "physical" && (
            <div className="space-y-6 pt-4 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                  <Box className="h-4 w-4 text-emerald-400" />
                  <span>Physical Garment &amp; Shiprocket Courier Pickup Origin</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  ✓ AUTOMATED COURIER DISPATCH SYNC
                </span>
              </div>

              {/* Informational Note */}
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-zinc-300 font-sans space-y-1">
                <p className="font-bold text-emerald-400">Automated Seller ➔ Customer Logistics Route</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Order aate hi Shiprocket automatically aapke is registered warehouse pickup address se customer ke checkout delivery address ka live courier route (Delhivery / BlueDart AWB) generate karega.
                </p>
              </div>

              {/* Warehouse Pickup Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  1. Seller Origin Warehouse / Studio Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Pickup Location Nickname"
                    required
                    value={pickupNickname}
                    onChange={(e) => setPickupNickname(e.target.value)}
                    placeholder="e.g. Kaizen Central Hub"
                  />
                  <Input
                    label="Dispatch Contact Person"
                    required
                    value={pickupContact}
                    onChange={(e) => setPickupContact(e.target.value)}
                    placeholder="e.g. Kaizen Dispatch Lead"
                  />
                  <Input
                    label="Warehouse Phone Number"
                    required
                    value={pickupPhone}
                    onChange={(e) => setPickupPhone(e.target.value)}
                    placeholder="e.g. +91 9811002233"
                  />
                </div>

                <Input
                  label="Warehouse / Studio Address (Line 1)"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Plot 42, Okhla Industrial Area Phase 3"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    required
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                  />
                  <Input
                    label="State"
                    required
                    value={pickupState}
                    onChange={(e) => setPickupState(e.target.value)}
                    placeholder="e.g. Delhi"
                  />
                  <Input
                    label="Postal PIN Code"
                    required
                    value={pickupPin}
                    onChange={(e) => setPickupPin(e.target.value)}
                    placeholder="e.g. 110020"
                  />
                </div>
              </div>

              {/* Parcel Dimensions & Weight */}
              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Parcel Metrics &amp; Box Dimensions (For Courier Rate Optimization)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Input
                    label="Fabric Specs (GSM)"
                    value={fabricGsm}
                    onChange={(e) => setFabricGsm(e.target.value)}
                    placeholder="e.g. 500 GSM French Terry"
                  />
                  <Input
                    label="Item Weight (Grams)"
                    required
                    value={itemWeightGrams}
                    onChange={(e) => setItemWeightGrams(e.target.value)}
                    placeholder="e.g. 850"
                  />
                  <Input
                    label="Box Length (cm)"
                    required
                    value={packageLength}
                    onChange={(e) => setPackageLength(e.target.value)}
                    placeholder="30"
                  />
                  <Input
                    label="Box Breadth x Height (cm)"
                    required
                    value={`${packageBreadth} x ${packageHeight}`}
                    onChange={(e) => {
                      const parts = e.target.value.split("x").map((s) => s.trim());
                      if (parts[0]) setPackageBreadth(parts[0]);
                      if (parts[1]) setPackageHeight(parts[1]);
                    }}
                    placeholder="25 x 12"
                  />
                </div>
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
