"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white font-mono min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl border border-white/10 bg-zinc-950 p-6 text-center space-y-4">
          <h2 className="text-xl font-bold uppercase text-white">Critical System Exception</h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            The platform encountered a global boundary fault.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200"
            >
              Reset Session
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
