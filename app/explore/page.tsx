"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/types";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "all";

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(initialType);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.seller?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || p.product_type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.base_price - b.base_price;
      if (sortBy === "price_desc") return b.base_price - a.base_price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase">MARKETPLACE &amp; ASSET VAULT</h1>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Explore verified turnkey assets: SaaS platforms, mobile apps, source code repos, social accounts, luxury apparel, and tech services.
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-400 bg-surface px-3 py-1.5 rounded-lg border border-border">
            SHOWING <strong className="text-white">{filteredProducts.length}</strong> VERIFIED ASSETS
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by SaaS name, mobile app, source repo, YouTube/IG handle, or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-xs font-mono text-white placeholder:text-zinc-500 focus:border-white focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto font-mono text-xs overflow-x-auto scrollbar-none pb-2 md:pb-0">
            {/* Category pills */}
            {[
              { id: "all", label: "ALL ASSETS" },
              { id: "saas", label: "⚡ APPS & SAAS" },
              { id: "source_code", label: "💻 CODE IP" },
              { id: "social_account", label: "🌐 SOCIAL CHANNELS" },
              { id: "physical", label: "👕 STREETWEAR" },
              { id: "service", label: "🛠️ SERVICES" },
              { id: "digital_file", label: "💎 3D VAULTS" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  try {
                    if ("vibrate" in navigator) navigator.vibrate(10);
                  } catch {}
                  setSelectedType(type.id);
                }}
                className={`whitespace-nowrap rounded-xl border px-3.5 py-2 transition-all active:scale-95 ${
                  selectedType === type.id
                    ? "border-white bg-white text-black font-bold shadow-sm"
                    : "border-border bg-surface text-zinc-400 hover:text-white"
                }`}
              >
                {type.label}
              </button>
            ))}

            {/* Sort selection */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
            >
              <option value="newest">NEWEST DROPS</option>
              <option value="price_asc">PRICE: LOW TO HIGH</option>
              <option value="price_desc">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-3 font-mono border border-dashed border-border rounded-xl">
            <p className="text-sm text-zinc-400">NO DROPS FOUND MATCHING YOUR FILTERS</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
              }}
              className="text-xs text-white underline underline-offset-4"
            >
              Reset all search filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white p-8 font-mono text-xs flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
            <span>LOADING MARKETPLACE VAULT...</span>
          </div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
