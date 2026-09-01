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
  DollarSign,
  Handshake,
  Globe,
  Code2,
  Smartphone,
  Youtube,
  Instagram,
  Twitter,
  Server,
  Layers,
  X,
} from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Product, ProductVariant } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "vortex-heavyweight-modular-hoodie";

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "security">("details");

  // Make an Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [termsNote, setTermsNote] = useState<string>("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.thumbnail_url);
          setOfferAmount(Math.round(data.product.base_price * 0.9).toString());
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
          setOfferAmount(Math.round(mock.base_price * 0.9).toString());
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

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAmount || parseFloat(offerAmount) <= 0) return;

    setIsSubmittingOffer(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          offerAmount: parseFloat(offerAmount),
          termsNote,
        }),
      });
      const data = await res.json();
      if (data.dealUrl) {
        router.push(data.dealUrl);
      } else {
        router.push("/deals/deal-001");
      }
    } catch {
      router.push("/deals/deal-001");
    } finally {
      setIsSubmittingOffer(false);
      setIsOfferModalOpen(false);
    }
  };

  const isDigitalAssetOrSaaS = ["saas", "app", "website", "source_code", "social_account"].includes(product.product_type);

  const productSchemaJsonLd = {
    "@context": "https://schema.org",
    "@type": isDigitalAssetOrSaaS ? "SoftwareApplication" : "Product",
    name: product.title,
    description: product.description,
    image: [product.thumbnail_url],
    sku: `AURA-${product.id.slice(0, 8)}`,
    brand: {
      "@type": "Brand",
      name: "Auraminator",
    },
    offers: {
      "@type": "Offer",
      url: `https://auraminator.in/product/${product.slug}`,
      priceCurrency: "INR",
      price: currentPrice,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: product.seller?.username || "Auraminator Verified Creator",
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans selection:bg-white selection:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemaJsonLd) }}
      />
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <Link href="/explore" className="hover:text-white transition-colors">
            EXPLORE
          </Link>
          <span>/</span>
          <span className="uppercase text-zinc-300">{product.product_type.replace("_", " ")}</span>
          <span>/</span>
          <span className="text-zinc-500 truncate max-w-[200px]">{product.title}</span>
        </div>

        {/* Top Section: Media Gallery & Buy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Column 1: Media Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Display */}
            <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface brutalist-card">
              <Image
                src={selectedImage || product.thumbnail_url}
                alt={product.title}
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 text-xs font-mono text-white">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>
                  {isDigitalAssetOrSaaS ? "VERIFIED ESCROW ASSET" : "VERIFIED AUTHENTIC"}
                </span>
              </div>

              {product.asset_metrics?.mrr && (
                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 px-3 py-1 text-xs font-mono text-emerald-300 font-bold">
                  <span>₹{product.asset_metrics.mrr.toLocaleString("en-IN")}/mo MRR</span>
                </div>
              )}

              {product.asset_metrics?.followers_count && (
                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-mono text-white font-bold">
                  <span>{(product.asset_metrics.followers_count / 1000).toFixed(0)}k Followers</span>
                </div>
              )}
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
                <span className="text-xs text-zinc-500 uppercase">
                  {isDigitalAssetOrSaaS ? "Buy Now Price / Escrow" : "Inclusive of all taxes"}
                </span>
              </div>
            </div>

            <p className="text-sm text-zinc-400 font-sans leading-relaxed">
              {product.description}
            </p>

            {/* Asset Verified Metrics Highlights */}
            {product.asset_metrics && (
              <div className="rounded-xl border border-white/10 bg-surface-elevated p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-400 border-b border-white/10 pb-2">
                  <span className="uppercase font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Verified Asset Metrics</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    PROTECTED HANDOVER
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {product.asset_metrics.mrr && (
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                      <span className="text-zinc-500 block text-[10px]">MONTHLY REVENUE</span>
                      <span className="text-white font-bold">{formatINR(product.asset_metrics.mrr)}</span>
                    </div>
                  )}
                  {product.asset_metrics.net_profit_monthly && (
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                      <span className="text-zinc-500 block text-[10px]">NET PROFIT</span>
                      <span className="text-emerald-400 font-bold">{formatINR(product.asset_metrics.net_profit_monthly)}/mo</span>
                    </div>
                  )}
                  {product.asset_metrics.downloads_count && (
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                      <span className="text-zinc-500 block text-[10px]">APP DOWNLOADS</span>
                      <span className="text-white font-bold">{product.asset_metrics.downloads_count.toLocaleString("en-IN")}+</span>
                    </div>
                  )}
                  {product.asset_metrics.followers_count && (
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                      <span className="text-zinc-500 block text-[10px]">COMMUNITY REACH</span>
                      <span className="text-white font-bold">{product.asset_metrics.followers_count.toLocaleString("en-IN")} Subscribers</span>
                    </div>
                  )}
                  {product.asset_metrics.domain_name && (
                    <div className="bg-black/40 p-2 rounded border border-white/5 col-span-2">
                      <span className="text-zinc-500 block text-[10px]">PRIMARY DOMAIN INCLUDED</span>
                      <span className="text-white font-bold">{product.asset_metrics.domain_name} (EPP Auth Code Handover)</span>
                    </div>
                  )}
                </div>

                {product.asset_metrics.tech_stack && product.asset_metrics.tech_stack.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] text-zinc-500 block mb-1.5 uppercase">Tech Stack &amp; Infrastructure</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.asset_metrics.tech_stack.map((tech, idx) => (
                        <span key={idx} className="rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Variant Selector (if physical) */}
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
              ) : product.product_type === "saas" || product.product_type === "app" ? (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Handshake className="h-4 w-4 text-emerald-400" />
                  <span>Protected Deal Room • Escrow deposit, domain/code handover &amp; 48h inspection</span>
                </div>
              ) : product.product_type === "source_code" ? (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Code2 className="h-4 w-4 text-emerald-400" />
                  <span>Exclusive Source Code IP • Private GitHub organization transfer &amp; copyright release</span>
                </div>
              ) : product.product_type === "social_account" ? (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span>Social Account Handover • OGE / Brand Google Account transfer with escrow lock</span>
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

            {/* Action Buttons: Instant Buy + Make an Offer */}
            <div className="space-y-2.5 pt-2 font-mono">
              <Button
                variant="primary"
                size="lg"
                onClick={handleInstantBuy}
                className="w-full flex items-center justify-between"
              >
                <span>{isDigitalAssetOrSaaS ? "BUY NOW AT LIST PRICE" : "INSTANT SECURE CHECKOUT"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* MAKE AN OFFER BUTTON */}
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 py-3 text-xs font-mono font-bold text-emerald-400 transition-all group"
              >
                <Handshake className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>MAKE AN OFFER / NEGOTIATE PRICE</span>
              </button>

              {!isDigitalAssetOrSaaS && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClaim}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>ADD TO CART RESERVATION</span>
                </Button>
              )}
            </div>

            {/* Trust & Guarantee Box */}
            <div className="rounded-xl border border-border bg-surface p-4 space-y-2.5 font-mono text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-bold">Auraminator 100% Protected Escrow Guarantee</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-400 font-sans">
                <li>• <strong>Money Held in Escrow:</strong> Funds are locked in Auraminator Escrow and only released after you inspect and verify the asset handover.</li>
                <li>• <strong>Secure Transfer Room:</strong> Domain EPP codes, GitHub repo transfers, and admin credentials are submitted in an encrypted vault.</li>
                <li>• <strong>48-Hour Inspection Window:</strong> Full 48 hours to verify revenue, database control, and account standing before funds clear.</li>
                <li>• <strong>Compliance Arbitration:</strong> If the asset does not match specifications, escrow is frozen and arbitrated by our compliance tribunal.</li>
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
              SPECIFICATIONS &amp; TRANSFER ITEMS
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
              ESCROW &amp; HANDOVER ARCHITECTURE
            </button>
          </div>

          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
                <h3 className="font-bold text-white uppercase flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  <span>Transfer Deliverables Checklist</span>
                </h3>
                {product.asset_metrics?.transfer_items ? (
                  <ul className="space-y-2 text-zinc-300">
                    {product.asset_metrics.transfer_items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-400 font-sans">
                    Standard drop package with verified creator provenance and digital certificate of authenticity.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
                <h3 className="font-bold text-white uppercase flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Escrow &amp; Dispute Protection</span>
                </h3>
                <p className="text-zinc-400 font-sans leading-relaxed">
                  Both buyer and seller are protected by Auraminator&apos;s dual-sided escrow protocol. Funds are never transferred directly to the seller until the buyer confirms working credentials.
                </p>
                <div className="pt-2 text-[11px] text-zinc-500">
                  Platform Commission: 15% (Retained from final agreed deal price).
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-2xl font-extrabold text-white">4.9 / 5.0</span>
                  <p className="text-zinc-500 text-[11px]">Based on verified escrow completions</p>
                </div>
                <div className="flex text-emerald-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-emerald-400" />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-white font-bold block">“Smooth SaaS handover, domain EPP transferred in 2 hours.”</span>
                  <span className="text-zinc-500 text-[10px]">Verified Buyer (@dev_capital) • Aug 2026</span>
                </div>
                <div>
                  <span className="text-white font-bold block">“Escrow released immediately upon code review approval.”</span>
                  <span className="text-zinc-500 text-[10px]">Verified Buyer (@vortex_studio) • Jul 2026</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4 font-mono text-xs text-zinc-400 leading-relaxed font-sans">
              <h3 className="font-bold text-white uppercase font-mono">Protected Deal Protocol (Zero Off-Platform Leakage)</h3>
              <p>
                Auraminator handles all negotiations, counter-offers, payment deposits, and credential transfers inside an encrypted private Deal Room.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                <div className="border border-white/10 bg-black/40 p-3 rounded-lg">
                  <span className="text-white font-bold block">1. Make Offer</span>
                  <span className="text-[10px] text-zinc-500">Negotiate price &amp; terms in-app</span>
                </div>
                <div className="border border-white/10 bg-black/40 p-3 rounded-lg">
                  <span className="text-white font-bold block">2. Lock Escrow</span>
                  <span className="text-[10px] text-zinc-500">Buyer deposits agreed price</span>
                </div>
                <div className="border border-white/10 bg-black/40 p-3 rounded-lg">
                  <span className="text-white font-bold block">3. Transfer</span>
                  <span className="text-[10px] text-zinc-500">Domain / Repo / Account vault</span>
                </div>
                <div className="border border-white/10 bg-black/40 p-3 rounded-lg">
                  <span className="text-white font-bold block">4. Payout</span>
                  <span className="text-[10px] text-zinc-500">85% released after inspection</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAKE AN OFFER MODAL */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 brutalist-card relative">
            <button
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400 font-bold">
                <Handshake className="h-3 w-3" />
                <span>OFFICIAL ESCROW NEGOTIATION</span>
              </div>
              <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">
                MAKE AN OFFER FOR THIS ASSET
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                {product.title} (List Price: {formatINR(product.base_price)})
              </p>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                  Your Offer Amount (INR ₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 380000"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm font-mono text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  Suggested range: {formatINR(product.base_price * 0.8)} - {formatINR(product.base_price)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                  Deal Conditions / Notes to Seller
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Requesting 30 days tech transition support, full EPP domain code, and GitHub repo owner invite."
                  value={termsNote}
                  onChange={(e) => setTermsNote(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Real-time Escrow Split Calculation Card */}
              {parseFloat(offerAmount) > 0 && (
                <div className="rounded-lg border border-white/10 bg-surface-elevated p-3 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Offered Deal Value:</span>
                    <span className="text-white font-bold">{formatINR(parseFloat(offerAmount))}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Seller Payout upon Approval (85%):</span>
                    <span className="text-emerald-400 font-bold">{formatINR(parseFloat(offerAmount) * 0.85)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-[10px] border-t border-white/10 pt-1">
                    <span>Platform Commission (15%):</span>
                    <span>{formatINR(parseFloat(offerAmount) * 0.15)}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="w-1/2"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingOffer}
                  className="w-1/2 flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200"
                >
                  <span>SUBMIT OFFER</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
