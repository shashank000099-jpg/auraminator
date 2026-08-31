"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Link2,
  Box,
  Star,
  ShoppingBag,
  ArrowRight,
  Share2,
  Clock,
  Sparkles,
} from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Product, ProductVariant } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "vortex-heavyweight-hoodie";

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "security">("details");

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.thumbnail_url);
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
        }
      })
      .catch(() => {
        const mock = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
        if (mock) {
          setProduct(mock as any);
          setSelectedImage(mock.thumbnail_url);
          if (mock.variants && mock.variants.length > 0) {
            setSelectedVariant(mock.variants[0] as any);
          }
        }
      });
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
          <span>INITIALIZING SECURE DROP VAULT...</span>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const currentInventory = selectedVariant ? selectedVariant.inventory_count : 15;

  const handleClaim = () => {
    addItem(product, selectedVariant || undefined, 1);
    openCart();
  };

  const handleInstantBuy = () => {
    addItem(product, selectedVariant || undefined, 1);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Top Breadcrumb & Share */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Link href="/explore" className="hover:text-white transition-colors">
              DROPS
            </Link>
            <span>/</span>
            <span className="text-zinc-300 uppercase">{product.product_type.replace("_", " ")}</span>
            <span>/</span>
            <span className="text-white line-clamp-1">{product.title}</span>
          </div>
          <button
            onClick={() => {
              if (navigator.share) navigator.share({ title: product.title, url: window.location.href });
            }}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>SHARE</span>
          </button>
        </div>

        {/* Main Product Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Column 1: Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-zinc-950">
              <Image
                src={selectedImage || product.thumbnail_url}
                alt={product.title}
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 text-xs font-mono text-white">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>VERIFIED AUTHENTIC</span>
              </div>
            </div>

            {/* Thumbnail carousel */}
            {product.media_gallery && product.media_gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.media_gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                      selectedImage === img ? "border-white" : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Buy Box & Options (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Creator badge */}
            {product.seller && (
              <Link
                href={`/${product.seller.username || "kaizen"}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono text-zinc-300 hover:border-white/40 transition-colors"
              >
                <div className="h-4 w-4 rounded-full bg-zinc-700 overflow-hidden relative">
                  {product.seller.avatar_url && (
                    <Image src={product.seller.avatar_url} alt={product.seller.full_name} fill className="object-cover" />
                  )}
                </div>
                <span>{product.seller.full_name || product.seller.username}</span>
                {product.seller.is_verified && <CheckCircle2 className="h-3 w-3 text-white" />}
              </Link>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                {product.title}
              </h1>
              <div className="mt-3 flex items-baseline gap-4 font-mono">
                <span className="text-3xl font-bold text-white">{formatINR(currentPrice)}</span>
                <span className="text-xs text-zinc-500 uppercase">Inclusive of all taxes</span>
              </div>
            </div>

            <p className="text-sm text-zinc-400 font-sans leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selector (if physical or options exist) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 border-t border-border pt-4 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 uppercase">Select Variant / Size</span>
                  {currentInventory <= 5 ? (
                    <span className="text-red-400 text-[11px] font-bold animate-pulse">
                      Only {currentInventory} units remaining
                    </span>
                  ) : (
                    <span className="text-emerald-400 text-[11px]">In Stock ({currentInventory} available)</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`rounded-lg border p-2.5 text-center transition-all ${
                        selectedVariant?.id === variant.id
                          ? "border-white bg-white text-black font-bold"
                          : "border-border bg-surface text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      <div>{variant.title}</div>
                      <div className="text-[10px] opacity-75">{formatINR(variant.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Type & Delivery Cue Banner */}
            <div className="rounded-lg border border-white/10 bg-surface-elevated p-3 text-xs font-mono">
              {product.product_type === "physical" ? (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Box className="h-4 w-4 text-emerald-400" />
                  <span>Physical Streetwear • Ships in 24-48 hrs with tracked courier</span>
                </div>
              ) : product.product_type === "digital_file" ? (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Digital Vault • Instant file download available immediately in your library</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Link2 className="h-4 w-4 text-emerald-400" />
                  <span>Protected Workspace • 1-Click Notion workspace duplication</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2 font-mono">
              <Button
                variant="primary"
                size="lg"
                onClick={handleInstantBuy}
                className="w-full flex items-center justify-between"
              >
                <span>INSTANT SECURE CHECKOUT</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleClaim}
                className="w-full flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>ADD TO CART RESERVATION</span>
              </Button>
            </div>

            {/* Trust & Guarantee Box */}
            <div className="rounded-xl border border-border bg-surface p-4 space-y-2.5 font-mono text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-bold">Auraminator 100% Buyer Escrow Protection</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-400 font-sans">
                <li>• <strong>Money Held in Escrow:</strong> The creator is only paid after your delivery or download is confirmed.</li>
                <li>• <strong>Instant Digital Delivery:</strong> Access files immediately in your account after payment.</li>
                <li>• <strong>Tracked Physical Shipping:</strong> Real-time Shiprocket courier updates straight to WhatsApp &amp; SMS.</li>
                <li>• <strong>7-Day Dispute Protection:</strong> If anything is damaged or missing, freeze payment and request a refund.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabs for Deep Specs, Security, & Verified Reviews */}
        <div className="border-t border-border pt-8 space-y-6">
          <div className="flex gap-4 border-b border-border pb-3 font-mono text-xs">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === "details" ? "border-white text-white font-bold" : "border-transparent text-zinc-500 hover:text-white"
              }`}
            >
              SPECIFICATIONS & SPECS
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === "reviews" ? "border-white text-white font-bold" : "border-transparent text-zinc-500 hover:text-white"
              }`}
            >
              VERIFIED REVIEWS (4.9 ★)
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === "security" ? "border-white text-white font-bold" : "border-transparent text-zinc-500 hover:text-white"
              }`}
            >
              ESCROW & VAULT ARCHITECTURE
            </button>
          </div>

          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-zinc-400">
              <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
                <p className="font-bold text-white uppercase text-sm">Artifact Specifications</p>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Asset Classification</span>
                    <span className="text-white">{product.product_type.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Platform Protocol Fee</span>
                    <span className="text-white">5.00% (Settled via Razorpay Route)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-500">Fulfillment SLA</span>
                    <span className="text-white">Instant (Digital) / 48 Hrs (Apparel)</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
                <p className="font-bold text-white uppercase text-sm">Creator Rights & Licensing</p>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Grants standard commercial license for digital assets. For physical garments, authentic authenticity certificates and encrypted QR wash labels are embedded directly into the fabric.
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex text-white">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-white" />
                      ))}
                    </div>
                    <span className="font-bold text-white">Rohit M.</span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Verified Buyer
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">Aug 24, 2026</span>
                </div>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  Incredible craftsmanship on the fabric. The 500 GSM loopback cotton has actual weight and the cut is exactly what was shown in the drop teasers. Delhivery shipping took only 2 days to Bangalore.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex text-white">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-white" />
                      ))}
                    </div>
                    <span className="font-bold text-white">Dev K.</span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Verified Buyer
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">Aug 18, 2026</span>
                </div>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  Instant presigned token download worked seamlessly. The 3D shader files and Figma tokens integrated cleanly into our design system without any format issues.
                </p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-xl border border-border bg-surface p-6 font-mono text-xs text-zinc-400 space-y-3">
              <p className="font-bold text-white uppercase text-sm">Zero-Trust Vault & Escrow Architecture</p>
              <p className="font-sans text-xs leading-relaxed">
                When an order is placed on Auraminator, funds are cryptographically tagged and held in escrow via Razorpay Route split ledgers. Digital downloads generate ephemeral signed URLs via Cloudflare R2 that expire in 15 minutes, preventing link scraping and hotlinking. Physical orders require AWB delivery confirmation from Shiprocket before funds move from `pending` to `available` seller balance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
