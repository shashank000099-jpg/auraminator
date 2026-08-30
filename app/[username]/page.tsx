"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { CheckCircle2, Globe, Twitter, Instagram, ShieldCheck, Sparkles } from "lucide-react";
import { Product } from "@/lib/types";

export default function CreatorStorefrontPage() {
  const params = useParams();
  const username = params.username as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [sellerName, setSellerName] = useState("KAIZEN STUDIOS");

  useEffect(() => {
    fetch(`/api/products?seller=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setSellerName(data.products[0]?.seller?.full_name || username.toUpperCase());
        } else {
          // Fallback matching products
          const matched = MOCK_PRODUCTS.filter(
            (p) => p.seller?.username.toLowerCase() === username.toLowerCase()
          );
          setProducts(matched.length > 0 ? matched : MOCK_PRODUCTS.slice(0, 3));
          if (matched.length > 0) {
            setSellerName(matched[0].seller?.full_name || username.toUpperCase());
          }
        }
      })
      .catch(() => {
        setProducts(MOCK_PRODUCTS.slice(0, 3));
      });
  }, [username]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 1. Storefront Banner */}
      <div className="relative h-48 sm:h-64 w-full bg-zinc-900 overflow-hidden border-b border-border">
        <Image
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80"
          alt="Creator Banner"
          fill
          className="object-cover object-center opacity-40 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* 2. Creator Profile Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            <div className="relative h-28 w-28 rounded-2xl border-2 border-white/20 bg-zinc-950 overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt={sellerName}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                  {sellerName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-white text-black px-2 py-0.5 text-[10px] font-mono font-bold">
                  <CheckCircle2 className="h-3 w-3" /> VERIFIED SELLER
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400">@{username} • Independent Creator Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-zinc-300 hover:text-white hover:border-white/40 transition-colors">
              <Twitter className="h-3.5 w-3.5" />
              <span>@kaizen_drop</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-zinc-300 hover:text-white hover:border-white/40 transition-colors">
              <Globe className="h-3.5 w-3.5" />
              <span>kaizen.studio</span>
            </button>
          </div>
        </div>

        {/* Bio & Philosophy */}
        <div className="max-w-3xl font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed border-b border-border pb-8">
          Architectural cut-and-sew heavyweight garments and brutalist digital design tokens. All releases are manufactured in numbered capsule runs with direct escrow verification and custom packaging.
        </div>

        {/* Drops Grid */}
        <div className="space-y-6 pb-20">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-white font-bold uppercase tracking-wider">ACTIVE RELEASES ({products.length})</span>
            <span className="text-zinc-500">100% ESCROW PROTECTED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
