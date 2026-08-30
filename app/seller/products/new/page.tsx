"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Upload, ShieldCheck, CheckCircle2, Lock, Link2, Box, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AICopilotModal } from "@/components/ai-copilot-modal";

export default function NewProductDropPage() {
  const router = useRouter();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Product Fields
  const [title, setTitle] = useState("VORTEX 500 GSM Heavyweight Modular Hoodie");
  const [productType, setProductType] = useState<"physical" | "digital_file" | "digital_link" | "service">("physical");
  const [basePrice, setBasePrice] = useState("3499");
  const [description, setDescription] = useState(
    "Architectural cut-and-sew heavyweight luxury hoodie in Pitch Black. Hand-distressed 500 GSM loopback French Terry with modular magnetic stash pockets and matte monochrome hardware."
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80"
  );

  // SSRF URL Ingestion State
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importedAssetKey, setImportedAssetKey] = useState<string | null>(null);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        base_price: basePrice,
        thumbnail_url: thumbnailUrl,
        media_gallery: [thumbnailUrl],
        variants:
          productType === "physical"
            ? [
                { sku: `SKU-${Date.now()}-M`, title: "Pitch Black / M", price: basePrice, inventory_count: 20 },
                { sku: `SKU-${Date.now()}-L`, title: "Pitch Black / L", price: basePrice, inventory_count: 15 },
                { sku: `SKU-${Date.now()}-XL`, title: "Pitch Black / XL", price: basePrice, inventory_count: 10 },
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
      router.push("/seller/products");
    } catch (err: any) {
      alert(`Drop creation notice: ${err.message}`);
      router.push("/seller/products");
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
              PUBLISH EXCLUSIVE DROP
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
            <label className="block text-xs uppercase text-zinc-400">1. Select Drop Classification</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { id: "physical", label: "Streetwear / Cut-and-Sew", icon: Box },
                { id: "digital_file", label: "R2 Digital Asset Vault", icon: Download },
                { id: "digital_link", label: "Protected Notion Link", icon: Link2 },
                { id: "service", label: "Strategy Sprint", icon: ShieldCheck },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setProductType(t.id as any)}
                    className={`rounded-lg border p-3 text-left transition-all space-y-1 ${
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
              2. Title & Pricing Architecture
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Drop Title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Base Price (INR ₹)"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase text-zinc-400">Description & Technical Narrative</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
              />
            </div>

            <Input
              label="Cover Thumbnail Image URL"
              required
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
          </div>

          {/* Zero-Trust SSRF-Safe Ingestion Pipeline */}
          {productType === "digital_file" && (
            <div className="rounded-xl border border-white/10 bg-surface-elevated p-5 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase">Zero-Trust SSRF-Safe URL Ingestion Pipeline</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Automatically imports remote files up to 50MB directly into Cloudflare R2 with private IP loopback prevention.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="https://storage.googleapis.com/assets/sample-drop.zip"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleSsrfImport}
                  isLoading={isImporting}
                  className="whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  IMPORT TO R2
                </Button>
              </div>

              {importedAssetKey && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>R2 Vault Key: {importedAssetKey}</span>
                </div>
              )}
            </div>
          )}

          {/* Submission Button */}
          <div className="pt-4 border-t border-border flex justify-end">
            <Button variant="primary" size="lg" type="submit" isLoading={isSubmitting}>
              PUBLISH DROP TO MARKETPLACE
            </Button>
          </div>
        </form>
      </div>

      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onApplyListing={(data) => {
          if (data.title) setTitle(data.title);
          if (data.description) setDescription(data.description);
          if (data.suggested_price) setBasePrice(String(data.suggested_price));
        }}
      />
    </div>
  );
}
