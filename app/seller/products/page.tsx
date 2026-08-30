"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, ArrowLeft, MoreHorizontal, Edit, Trash2, CheckCircle2, Box, Download, Link2 } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SellerProductsPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);

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
              CATALOG & SKU MANAGEMENT
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
                {products.map((p) => {
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
                        <button
                          onClick={() => alert("Product edit mode triggered.")}
                          className="text-zinc-400 hover:text-white"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
