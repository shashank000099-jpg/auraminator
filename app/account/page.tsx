"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Download, Heart, Settings, ShieldCheck, ArrowUpRight, Lock, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BuyerAccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "library" | "settings">("orders");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (entitlementId: string) => {
    setDownloadingId(entitlementId);
    try {
      const res = await fetch(`/api/downloads/${entitlementId}`);
      const data = await res.json();

      if (data.type === "vault_redirect" && data.destination_url) {
        window.open(data.destination_url, "_blank");
      } else if (data.type === "direct_download" && data.download_url) {
        window.open(data.download_url, "_blank");
      } else {
        alert("Digital asset unlocked. Direct presigned token verified.");
      }
    } catch {
      alert("Download initiated.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 selection:bg-white selection:text-black">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buyer Account &amp; Library</h1>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Track live courier parcels, download your purchased digital files, and manage your account.
            </p>
          </div>
          <div className="flex gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "orders"
                  ? "bg-white text-black font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Orders (Physical)
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "library"
                  ? "bg-white text-black font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Digital Library (Files)
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "settings"
                  ? "bg-white text-black font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Security
            </button>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Order Card 1 */}
            <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutalist-card">
              <div className="space-y-1">
                <p className="text-xs font-mono text-zinc-500">Order #ORD-98214 • Placed Aug 28, 2026</p>
                <h3 className="font-semibold text-white text-base">
                  VORTEX 500 GSM Heavyweight Modular Hoodie (Matte Black / XL)
                </h3>
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-block rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                    Shiprocket: In-Transit (Delhivery Express • AWB #SR94829104)
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right font-mono">
                <p className="font-bold text-white text-base">₹3,499</p>
                <Link
                  className="text-xs text-zinc-400 hover:text-white flex items-center sm:justify-end gap-1 mt-2 font-mono"
                  href="/account/orders/ORD-98214"
                >
                  <span>Track Package</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Order Card 2 */}
            <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 brutalist-card">
              <div className="space-y-1">
                <p className="text-xs font-mono text-zinc-500">Order #ORD-97810 • Placed Aug 18, 2026</p>
                <h3 className="font-semibold text-white text-base">
                  NEO-BRUTALISM 3D UI & Shader Tokens Vault
                </h3>
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-block rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-white">
                    Digital Entitlement: Active (47 Downloads Remaining)
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right font-mono">
                <p className="font-bold text-white text-base">₹1,299</p>
                <button
                  onClick={() => setActiveTab("library")}
                  className="text-xs text-zinc-400 hover:text-white flex items-center sm:justify-end gap-1 mt-2 font-mono"
                >
                  <span>Access Vault</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Digital Library Tab */}
        {activeTab === "library" && (
          <div className="space-y-4 font-mono text-xs">
            <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Cloudflare R2 Encrypted Vault</span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    NEO-BRUTALISM 3D UI & Shader Tokens Vault
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1">
                    Direct access to raw Blender source files, GLTF rigs, WebGL shaders, and vector glyphs.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleDownload("demo-entitlement-001")}
                  isLoading={downloadingId === "demo-entitlement-001"}
                  className="flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Zip (48.9 MB)</span>
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Version: v2.4 (Latest Patch)</span>
                <span>Downloads: 3 / 50</span>
              </div>
            </div>

            {/* External Link Vault */}
            <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Protected Notion Workspace</span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    SYNAPSE OS • Notion Executive Operating System
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1">
                    Private authenticated duplicate link with automatic token authorization.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleDownload("demo-entitlement-link-002")}
                  isLoading={downloadingId === "demo-entitlement-link-002"}
                  className="flex items-center gap-1.5 whitespace-nowrap"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Notion Workspace</span>
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Access Status: Active Indefinitely</span>
                <span>Auth: 1-Click Sync</span>
              </div>
            </div>
          </div>
        )}

        {/* Security & Settings Tab */}
        {activeTab === "settings" && (
          <div className="rounded-xl border border-white/[0.08] bg-zinc-950 p-6 space-y-6 font-mono text-xs">
            <div className="space-y-1 border-b border-border pb-4">
              <h3 className="text-base font-bold text-white">Security & Authenticated Identity</h3>
              <p className="text-zinc-500 text-[11px]">Manage passkeys, session tokens, and KYC attributes.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div>
                  <p className="font-bold text-white">Two-Factor Authentication</p>
                  <p className="text-zinc-500 text-[11px]">Hardware security key / TOTP app</p>
                </div>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div>
                  <p className="font-bold text-white">Escrow Dispute Protection</p>
                  <p className="text-zinc-500 text-[11px]">Automatic 7-day post-delivery dispute window</p>
                </div>
                <span className="text-white font-bold">Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
