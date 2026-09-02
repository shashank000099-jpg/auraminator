"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Sparkles, ArrowRight, ShieldCheck, Briefcase, Box, Code2, Globe } from "lucide-react";
import { Product, JobPosting } from "@/lib/types";
import { formatINR } from "@/lib/utils";

interface MobileSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchDrawer({ isOpen, onClose }: MobileSearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";

      // Fetch live products and jobs
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.products) setProducts(data.products);
        })
        .catch(() => {});

      fetch("/api/jobs")
        .then((res) => res.json())
        .then((data) => {
          if (data.jobs) setJobs(data.jobs);
        })
        .catch(() => {});
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter products & jobs based on query and active filter
  const cleanQ = query.toLowerCase().trim();

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "saas" && ["saas", "app", "website"].includes(p.product_type)) ||
      (activeCategory === "streetwear" && p.product_type === "physical") ||
      (activeCategory === "source_code" && p.product_type === "source_code") ||
      (activeCategory === "services" && p.product_type === "service");

    const matchesQuery =
      !cleanQ ||
      p.title.toLowerCase().includes(cleanQ) ||
      (p.description ? p.description.toLowerCase().includes(cleanQ) : false) ||
      p.product_type.toLowerCase().includes(cleanQ);

    return matchesCategory && matchesQuery;
  });

  const filteredJobs =
    activeCategory === "all" || activeCategory === "jobs"
      ? jobs.filter(
          (j) =>
            !cleanQ ||
            j.title.toLowerCase().includes(cleanQ) ||
            j.company_name.toLowerCase().includes(cleanQ) ||
            j.location.toLowerCase().includes(cleanQ)
        )
      : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md md:hidden animate-in fade-in duration-200">
      {/* Tap backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Modal */}
      <div className="relative z-10 w-full rounded-t-3xl border-t border-white/20 bg-zinc-950 p-5 shadow-2xl max-h-[88vh] flex flex-col space-y-4 animate-in slide-in-from-bottom duration-200 pb-safe">
        {/* Grab Handle */}
        <div className="mx-auto h-1 w-10 rounded-full bg-zinc-700" />

        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SaaS, Apps, 500 GSM Streetwear, Jobs..."
            className="w-full rounded-2xl border border-white/15 bg-black py-3 pl-10 pr-10 text-xs font-mono text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 p-1 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="absolute right-3 p-1 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-[11px] font-mono">
          {[
            { id: "all", label: "ALL" },
            { id: "saas", label: "⚡ SAAS & APPS" },
            { id: "streetwear", label: "👕 STREETWEAR" },
            { id: "source_code", label: "💻 CODE IP" },
            { id: "jobs", label: "💼 JOBS" },
            { id: "services", label: "🛠️ SERVICES" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === cat.id
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold"
                  : "border-white/10 bg-surface text-zinc-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[50vh]">
          {/* Products & Assets */}
          {filteredProducts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">
                Verified Drops &amp; Assets ({filteredProducts.length})
              </span>
              <div className="space-y-1.5">
                {filteredProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 p-2.5 transition active:scale-[0.98] hover:border-white/30"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface">
                      <Image
                        src={prod.thumbnail_url}
                        alt={prod.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-white font-bold truncate">
                        {prod.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-zinc-400">
                        <span className="text-emerald-400 font-bold">{formatINR(prod.base_price)}</span>
                        <span>•</span>
                        <span className="uppercase text-zinc-500">{prod.product_type.replace("_", " ")}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Careers & Jobs */}
          {filteredJobs.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">
                Open Career Roles ({filteredJobs.length})
              </span>
              <div className="space-y-1.5">
                {filteredJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 p-2.5 transition active:scale-[0.98] hover:border-white/30"
                  >
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-white font-bold truncate">
                        {job.title}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400 truncate">
                        {job.company_name} • {job.location}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      APPLY
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length === 0 && filteredJobs.length === 0 && (
            <div className="text-center py-8 text-zinc-500 font-mono text-xs space-y-1">
              <p>No verified assets matching "{query}"</p>
              <p className="text-[10px] text-zinc-600">Try searching for "Next.js", "500 GSM", or "SaaS"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
