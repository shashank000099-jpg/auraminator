"use client";

import React, { useState } from "react";
import { Dialog } from "./ui/dialog";
import { Sparkles, Terminal, ArrowRight, Check, RefreshCw, BarChart2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { formatINR } from "@/lib/utils";

export function AICopilotModal({
  isOpen,
  onClose,
  onApplyListing,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApplyListing?: (data: any) => void;
}) {
  const [tab, setTab] = useState<"generate" | "diagnostics">("generate");
  const [prompt, setPrompt] = useState("");
  const [productType, setProductType] = useState<"digital_file" | "physical" | "digital_link" | "service">("digital_file");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);

  const handleGenerateListing = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_listing",
          payload: { rawPrompt: prompt, type: productType },
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Copilot error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seller_diagnostics",
        }),
      });
      const data = await res.json();
      setDiagnosticsResult(data);
    } catch (err) {
      console.error("Diagnostics error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-white text-base">AURAMINATOR AI COPILOT</h3>
            <p className="text-xs font-mono text-zinc-500">Autonomous drop optimization & seller intelligence</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 border-b border-border pb-2 font-mono text-xs">
          <button
            onClick={() => setTab("generate")}
            className={`px-3 py-1.5 rounded-md transition-colors ${tab === "generate" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"}`}
          >
            Listing Optimizer
          </button>
          <button
            onClick={() => {
              setTab("diagnostics");
              if (!diagnosticsResult) handleRunDiagnostics();
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${tab === "diagnostics" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"}`}
          >
            Store Diagnostics
          </button>
        </div>

        {/* Tab 1: Generate Listing */}
        {tab === "generate" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Product Concept / Drop Idea
              </label>
              <Input
                placeholder="e.g. Acid-wash tactical cargo or 3D shader pack"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Product Category & Format
              </label>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {[
                  { id: "digital_file", label: "Digital File (R2)" },
                  { id: "physical", label: "Physical Apparel" },
                  { id: "digital_link", label: "Notion/Vault Link" },
                  { id: "service", label: "Strategy Sprint" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setProductType(type.id as any)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${productType === type.id ? "border-white bg-white/10 text-white font-bold" : "border-border bg-surface text-zinc-400 hover:border-zinc-700"}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleGenerateListing}
              isLoading={isLoading}
              className="w-full"
            >
              Generate Optimized Drop Spec
            </Button>

            {result && (
              <div className="rounded-xl border border-white/20 bg-surface-elevated p-4 space-y-3 font-mono text-xs animate-in fade-in">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" /> High-Conversion Spec
                  </span>
                  <span className="text-zinc-400">
                    Suggested Price: <strong className="text-white">{formatINR(result.suggested_price)}</strong>
                  </span>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase">Title</p>
                  <p className="font-bold text-white text-sm">{result.title}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase">Description</p>
                  <p className="text-zinc-300 text-xs leading-relaxed font-sans">{result.description}</p>
                </div>
                {result.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.tags.map((t: string) => (
                      <span key={t} className="rounded bg-black border border-border px-2 py-0.5 text-[10px] text-zinc-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Diagnostics */}
        {tab === "diagnostics" && (
          <div className="space-y-4 font-mono text-xs">
            {isLoading ? (
              <div className="py-12 text-center text-zinc-400 space-y-2">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-white" />
                <p>Analyzing cross-channel telemetry & conversion graphs...</p>
              </div>
            ) : diagnosticsResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-surface-elevated p-3">
                    <p className="text-[10px] text-zinc-500">Store Health Index</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">{diagnosticsResult.healthScore} / 100</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-elevated p-3">
                    <p className="text-[10px] text-zinc-500">Projected Run Rate</p>
                    <p className="text-xl font-bold text-white mt-1">{formatINR(diagnosticsResult.projectedMonthlyGMV)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface-elevated p-4 space-y-3">
                  <div className="flex items-center gap-2 text-zinc-300 font-bold border-b border-border pb-2">
                    <BarChart2 className="h-4 w-4 text-white" />
                    <span>Algorithmic Optimization Recommendations</span>
                  </div>
                  <ul className="space-y-2 text-zinc-300 text-xs font-sans">
                    {diagnosticsResult.insights?.map((insight: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white font-mono font-bold">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Dialog>
  );
}
