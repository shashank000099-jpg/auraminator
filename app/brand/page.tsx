"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, Copy, Check, ArrowLeft, Sparkles, ShieldCheck, Layers } from "lucide-react";
import { AuraminatorIcon, AuraminatorLogo, AuraminatorSeal, AuraminatorWatermark } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

export default function BrandKitPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySvg = async (id: string, path: string) => {
    try {
      const res = await fetch(path);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert("SVG copied to clipboard.");
    }
  };

  const handleDownloadPng = (svgUrl: string, filename: string, width = 2000, height = 600) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    img.src = svgUrl;
  };

  const brandAssets = [
    {
      id: "full-logo",
      title: "Primary Full Logo (Dark Surface)",
      description: "Default brand asset for headers, landing pages, and dark brutalist backgrounds.",
      svgPath: "/brand/auraminator-logo-full.svg",
      filename: "auraminator-logo-full",
      dimensions: "1000 × 300 px (Vector Scalable)",
      preview: (
        <div className="flex items-center justify-center p-8 bg-black rounded-lg border border-border">
          <AuraminatorLogo size="lg" showTagline />
        </div>
      ),
    },
    {
      id: "transparent-logo",
      title: "Full Transparent Logo (Merchandise & Apparel)",
      description: "High-contrast transparent vector mark for embroidery, screen printing, and packaging.",
      svgPath: "/brand/auraminator-logo-transparent.svg",
      filename: "auraminator-logo-transparent",
      dimensions: "1000 × 300 px (Transparent Vector)",
      preview: (
        <div className="flex items-center justify-center p-8 bg-surface-elevated rounded-lg border border-white/10">
          <AuraminatorLogo size="lg" />
        </div>
      ),
    },
    {
      id: "icon-glyph",
      title: "Monolith Faceted Glyph Icon",
      description: "Square app icon, browser favicon, social avatar, and cryptographic seal.",
      svgPath: "/brand/auraminator-icon.svg",
      filename: "auraminator-icon-glyph",
      dimensions: "500 × 500 px (Square Vector)",
      preview: (
        <div className="flex items-center justify-center p-8 bg-black rounded-lg border border-border">
          <AuraminatorIcon size={72} />
        </div>
      ),
    },
    {
      id: "seal-badge",
      title: "Verified Escrow Protocol Seal",
      description: "Circular seal stamp for checkout authentication, invoices, and verified drop tags.",
      svgPath: "/brand/auraminator-seal-badge.svg",
      filename: "auraminator-escrow-seal",
      dimensions: "500 × 500 px (Circular Vector)",
      preview: (
        <div className="flex items-center justify-center p-8 bg-black rounded-lg border border-border">
          <AuraminatorSeal size={84} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black relative overflow-hidden">
      <AuraminatorWatermark size={600} className="-top-32 -right-32" />

      <div className="mx-auto max-w-6xl space-y-10 relative z-10">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link href="/" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Marketplace</span>
            </Link>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white mt-1">
              BRAND ASSETS & LOGO DOWNLOAD VAULT
            </h1>
            <p className="text-xs text-zinc-500 font-sans">
              Official vector SVGs, high-resolution raster PNGs, and design tokens for AURAMINATOR.IN.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface border border-border px-3 py-1.5 text-xs text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Official Release 2026</span>
            </span>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {brandAssets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between space-y-5 brutalist-card"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-bold text-white text-sm uppercase">{asset.title}</h3>
                  <span className="text-[10px] text-zinc-500">{asset.dimensions}</span>
                </div>

                {/* Preview Box */}
                {asset.preview}

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {asset.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex flex-wrap items-center gap-2">
                {/* Direct SVG Download Link */}
                <a
                  href={asset.svgPath}
                  download={`${asset.filename}.svg`}
                  className="flex-1"
                >
                  <Button variant="primary" size="sm" className="w-full flex items-center justify-center gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    <span>Download SVG</span>
                  </Button>
                </a>

                {/* PNG Download Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownloadPng(
                      asset.svgPath,
                      `${asset.filename}.png`,
                      asset.id.includes("icon") || asset.id.includes("seal") ? 1000 : 2000,
                      asset.id.includes("icon") || asset.id.includes("seal") ? 1000 : 600
                    )
                  }
                  className="flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>High-Res PNG</span>
                </Button>

                {/* Copy SVG Raw Code */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopySvg(asset.id, asset.svgPath)}
                  className="flex items-center gap-1 text-zinc-400 hover:text-white"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy SVG</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Color Palette & Tokens */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase text-white tracking-wider border-b border-border pb-3">
            Monochrome Brutalist Color Tokens
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg border border-white/10 bg-black p-4 space-y-2">
              <div className="h-8 w-full rounded bg-black border border-white/20" />
              <p className="font-bold text-white">Pitch Black</p>
              <p className="text-[11px] text-zinc-500">#000000 (Base Canvas)</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-4 space-y-2">
              <div className="h-8 w-full rounded bg-[#0A0A0A] border border-white/20" />
              <p className="font-bold text-white">Sub-surface</p>
              <p className="text-[11px] text-zinc-500">#0A0A0A (Elevated Surface)</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-surface p-4 space-y-2">
              <div className="h-8 w-full rounded bg-[#FFFFFF]" />
              <p className="font-bold text-white">Pure White</p>
              <p className="text-[11px] text-zinc-500">#FFFFFF (Typography & High Key)</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-surface p-4 space-y-2">
              <div className="h-8 w-full rounded bg-[#71717A]" />
              <p className="font-bold text-white">Muted Slate</p>
              <p className="text-[11px] text-zinc-500">#71717A (Accents & Borders)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
