"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Link2,
  Box,
  Download,
  Code2,
  Truck,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AICopilotModal } from "@/components/ai-copilot-modal";
import { formatINR } from "@/lib/utils";

export default function NewProductDropPage() {
  const router = useRouter();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Product Fields
  const [title, setTitle] = useState("Emergency Full-Stack Debug & Bug Fix Sprint (24h SLA)");
  const [productType, setProductType] = useState<"physical" | "digital_file" | "digital_link" | "service">("service");
  const [basePrice, setBasePrice] = useState("4999");
  const [description, setDescription] = useState(
    "Instant emergency debugging for production web apps. We identify memory leaks, fix broken Next.js / React / Node.js API routes, resolve SSR hydration mismatches, and submit clean GitHub PRs within 24 hours."
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
  );

  // Service Specific Fields
  const [serviceSlaDays, setServiceSlaDays] = useState("1");
  const [techStackTags, setTechStackTags] = useState("Next.js, Supabase, Node.js, Cloudflare");

  // Physical Specific Fields
  const [fabricGsm, setFabricGsm] = useState("500 GSM French Terry");
  const [itemWeightGrams, setItemWeightGrams] = useState("850");

  // SSRF URL Ingestion State
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importedAssetKey, setImportedAssetKey] = useState<string | null>(null);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceNum = parseFloat(basePrice) || 0;
  const platformFee = priceNum * 0.15; // 15% platform fee
  const sellerNetPayout = priceNum * 0.85; // 85% creator payout

  const handleSsrfImport = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/seller/import-by-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: importUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "SSRF import failed");

      setImportedAssetKey(data.assetKey);
      alert(`Asset ingested safely into Cloudflare R2 Vault: ${data.assetKey}`);
    } catch (err: any) {
      alert(`Ingestion error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

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
        media_gallery: [thumbnailUrl],
        variants:
          productType === "physical"
            ? [
                { sku: `SKU-${Date.now()}-M`, title: "Pitch Black / M", price: priceNum, inventory_count: 20 },
                { sku: `SKU-${Date.now()}-L`, title: "Pitch Black / L", price: priceNum, inventory_count: 15 },
                { sku: `SKU-${Date.now()}-XL`, title: "Pitch Black / XL", price: priceNum, inventory_count: 10 },
              ]
            : [],
        digital_asset:
          productType === "digital_file"
            ? {
                r2_asset_key: importedAssetKey || `sellers/kaizen/drop-asset-${Date.now()}.zip`,
                file_name: "drop-artifact-vault.zip",
                file_size_bytes: 48920110,
                mime_type: "application/zip",
              }
            : null,
        vault_link:
          productType === "digital_link"
            ? {
                provider: "notion",
                destination_url: "https://notion.so/auraminator-workspace-link",
                access_instructions: "Authenticate and duplicate to your personal Notion.",
              }
            : null,
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
              PUBLISH NEW PRODUCT / TECH SERVICE
            </h1>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setIsCopilotOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>AI DROP ARCHITECT</span>
          </Button>
        </div>

        {/* Drop Form */}
        <form onSubmit={handleSubmitDrop} className="rounded-xl border border-border bg-surface p-6 space-y-6">
          {/* Classification Selection */}
          <div className="space-y-2">
            <label className="block text-xs uppercase text-zinc-400 font-bold">1. Select Drop Classification</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { id: "service", label: "Online Tech Service (Code/Debug)", icon: Code2 },
                { id: "physical", label: "Streetwear / Cut-and-Sew Apparel", icon: Box },
                { id: "digital_file", label: "R2 Digital Asset Vault (ZIP/3D)", icon: Download },
                { id: "digital_link", label: "Protected Notion / Figma Link", icon: Link2 },
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
                  label="Title (Service or Product Name)"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="List Price (INR ₹)"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
            </div>

            {/* Real-time Commission Breakdown Card */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-emerald-400 font-bold block">✓ Net Creator Escrow Payout (85%)</span>
                <span className="text-xl font-bold text-white mt-0.5 block">{formatINR(sellerNetPayout)}</span>
                <span className="text-[10px] text-zinc-500">Credited automatically upon verified completion</span>
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                <span className="text-zinc-500 block text-[10px]">Platform Fee (15%)</span>
                <span className="text-zinc-300 font-bold">{formatINR(platformFee)}</span>
                <span className="text-[10px] text-zinc-500 block">Includes Razorpay + Escrow infrastructure</span>
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

            <Input
              label="Thumbnail Media URL"
              required
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
          </div>

          {/* Conditional Sub-settings for Service vs Physical */}
          {productType === "service" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>Tech Service SLA &amp; Intake Configuration</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Delivery SLA (Turnaround in Days)"
                  value={serviceSlaDays}
                  onChange={(e) => setServiceSlaDays(e.target.value)}
                  helperText="Client gets a countdown timer. 72h auto-clearance upon deliverable submission."
                />
                <Input
                  label="Supported Tech Stack (Comma separated)"
                  value={techStackTags}
                  onChange={(e) => setTechStackTags(e.target.value)}
                  placeholder="e.g. Next.js, Node.js, Supabase, Solidity, AWS"
                />
              </div>
            </div>
          )}

          {productType === "physical" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Box className="h-4 w-4 text-emerald-400" />
                <span>Physical Apparel &amp; Shiprocket Logistics Specs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Fabric & Density Specs"
                  value={fabricGsm}
                  onChange={(e) => setFabricGsm(e.target.value)}
                  placeholder="e.g. 500 GSM Loopback French Terry"
                />
                <Input
                  label="Package Weight in Grams"
                  value={itemWeightGrams}
                  onChange={(e) => setItemWeightGrams(e.target.value)}
                  helperText="Used for automated 1-click Shiprocket courier rate computation."
                />
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full">
            PUBLISH DROP WITH ESCROW PROTECTION (15% FEE)
          </Button>
        </form>
      </div>

      <AICopilotModal isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}
