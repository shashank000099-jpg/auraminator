"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-mono">
      <div className="max-w-md w-full rounded-xl border border-border bg-surface p-6 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold uppercase text-white">System Anomaly Detected</h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          An unexpected error occurred during execution. Double-entry escrow ledger remains secured.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="primary" size="md" onClick={() => reset()} className="flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
          <Link href="/">
            <Button variant="outline" size="md" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
