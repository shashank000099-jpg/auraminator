"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Badge } from "./ui/badge";
import {
  ShoppingBag,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Download,
  Link2,
  Box,
  Handshake,
  Smartphone,
  Code2,
  Globe,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case "saas":
        return <Sparkles className="h-3 w-3 text-emerald-400" />;
      case "app":
        return <Smartphone className="h-3 w-3 text-emerald-400" />;
      case "source_code":
        return <Code2 className="h-3 w-3 text-emerald-400" />;
      case "social_account":
        return <Globe className="h-3 w-3 text-emerald-400" />;
      case "digital_file":
        return <Download className="h-3 w-3" />;
      case "digital_link":
        return <Link2 className="h-3 w-3" />;
      case "physical":
        return <Box className="h-3 w-3" />;
      default:
        return <ShieldCheck className="h-3 w-3" />;
    }
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case "saas":
        return "SaaS Platform";
      case "app":
        return "Mobile App";
      case "source_code":
        return "Source Code IP";
      case "social_account":
        return "Social Asset";
      case "digital_file":
        return "Digital Vault";
      case "digital_link":
        return "Notion/Workspace";
      case "physical":
        return "Cut-and-Sew";
      case "service":
        return "Tech Service";
      default:
        return type;
    }
  };

  const isNegotiableAsset = ["saas", "app", "website", "source_code", "social_account"].includes(product.product_type);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface brutalist-card text-white"
    >
      {/* Product Image Thumbnail */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-zinc-900">
        <Image
          src={product.thumbnail_url}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
            {getProductTypeIcon(product.product_type)}
            <span>{getProductTypeLabel(product.product_type)}</span>
          </span>

          {isNegotiableAsset && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-bold">
              <Handshake className="h-2.5 w-2.5" />
              <span>Make Offer</span>
            </span>
          )}
        </div>

        {/* Floating Verified Metrics */}
        {product.asset_metrics?.mrr && (
          <div className="absolute top-3 right-3 rounded bg-black/80 backdrop-blur-md border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-bold">
            ₹{product.asset_metrics.mrr.toLocaleString("en-IN")}/mo MRR
          </div>
        )}

        {product.asset_metrics?.followers_count && (
          <div className="absolute top-3 right-3 rounded bg-black/80 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-mono text-white font-bold">
            {(product.asset_metrics.followers_count / 1000).toFixed(0)}k Followers
          </div>
        )}

        {/* Verified Seller Badge */}
        {product.seller && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-mono">
            <span className="text-zinc-400 text-[11px]">by</span>
            <span className="font-semibold text-white tracking-tight">{product.seller.full_name || product.seller.username}</span>
            {product.seller.is_verified && (
              <CheckCircle2 className="h-3 w-3 text-white" />
            )}
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-zinc-200 transition-colors">
              {product.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between font-mono text-xs">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase">
              {isNegotiableAsset ? "Buy Now Price" : "Drop Price"}
            </p>
            <p className="font-bold text-white text-sm">{formatINR(product.base_price)}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/product/${product.slug}`}>
              <span className="inline-flex items-center gap-1 rounded border border-border bg-surface-elevated hover:bg-white hover:text-black px-2.5 py-1 text-[11px] font-mono transition-colors">
                <span>{isNegotiableAsset ? "Negotiate" : "View"}</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
