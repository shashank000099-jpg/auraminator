"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, ArrowLeft, MoreHorizontal, Edit, Trash2, CheckCircle2, Box, Download, Link2 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { useAuth } from "@/lib/context/auth-context";

export default function SellerProductsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch("/api/seller/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            setProducts(data.products);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <span>LOADING PRODUCTS...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center font-mono">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-surface p-8 text-center space-y-6 brutalist-card">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Box className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">
              AUTHENTICATION REQUIRED
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Sign in to manage and edit your published drop inventory.
            </p>
          </div>
          <Link href="/auth/login?redirect=/seller/products">
            <Button variant="primary" size="lg" className="w-full font-mono">
              SIGN IN AS SELLER
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/seller/dashboard" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Studio Dashboard</span>
            </Link>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white mt-2">
              CATALOG &amp; SKU MANAGEMENT
            </h1>
          </div>

          <Link href="/seller/products/new">
            <Button variant="primary" size="md" className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>PUBLISH NEW DROP</span>
            </Button>
          </Link>
        </div>

        {/* Product Table */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-elevated text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Artifact / Title</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Live Inventory</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500 space-y-2">
                      <Box className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                      <p className="font-bold text-white uppercase text-xs">No Drops Published Yet</p>
                      <p className="text-[11px] text-zinc-500 font-sans">
                        List your first cut-and-sew garment, digital asset vault, or turnkey software to start selling.
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const totalStock = p.variants
                      ? p.variants.reduce((acc, v) => acc + v.inventory_count, 0)
                      : 100;

                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-12 rounded overflow-hidden bg-zinc-900 flex-shrink-0">
                              <Image src={p.thumbnail_url} alt={p.title} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-white line-clamp-1">{p.title}</p>
                              <p className="text-[10px] text-zinc-500">{p.slug}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-zinc-300">
                            {p.product_type === "physical" && <Box className="h-3 w-3" />}
                            {p.product_type === "digital_file" && <Download className="h-3 w-3" />}
                            {p.product_type === "digital_link" && <Link2 className="h-3 w-3" />}
                            <span className="uppercase text-[10px]">{p.product_type.replace("_", " ")}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-white">{formatINR(p.base_price)}</td>

                        <td className="py-3 px-4">
                          {p.product_type === "physical" ? (
                            <span className="text-emerald-400 font-bold">{totalStock} Units</span>
                          ) : (
                            <span className="text-zinc-500">Unlimited (R2 Vault)</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 uppercase font-bold">
                            ● Published
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/product/${p.slug}`}
                            className="text-zinc-400 hover:text-white underline underline-offset-4 text-[11px] mr-3"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
