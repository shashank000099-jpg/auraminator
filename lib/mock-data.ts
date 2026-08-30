import { Product } from "./types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    seller_id: "seller-001",
    title: "VORTEX 500 GSM Heavyweight Modular Hoodie",
    slug: "vortex-heavyweight-modular-hoodie",
    description: "Architectural cut-and-sew heavyweight luxury hoodie in Pitch Black. Hand-distressed 500 GSM loopback French Terry with modular magnetic stash pockets and matte monochrome hardware.",
    product_type: "physical",
    base_price: 3499,
    platform_fee_percent: 5.0,
    thumbnail_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
    media_gallery: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "published",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: {
      id: "seller-001",
      full_name: "KAIZEN STUDIOS",
      username: "kaizen",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      is_verified: true,
      role: "seller",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    variants: [
      { id: "var-001-m", product_id: "prod-001", sku: "VTX-HD-BLK-M", title: "Pitch Black / M", price: 3499, inventory_count: 14, attributes: { size: "M", color: "Pitch Black" }, status: "active", created_at: new Date().toISOString() },
      { id: "var-001-l", product_id: "prod-001", sku: "VTX-HD-BLK-L", title: "Pitch Black / L", price: 3499, inventory_count: 8, attributes: { size: "L", color: "Pitch Black" }, status: "active", created_at: new Date().toISOString() },
      { id: "var-001-xl", product_id: "prod-001", sku: "VTX-HD-BLK-XL", title: "Pitch Black / XL", price: 3499, inventory_count: 3, attributes: { size: "XL", color: "Pitch Black" }, status: "active", created_at: new Date().toISOString() },
    ],
  },
  {
    id: "prod-002",
    seller_id: "seller-002",
    title: "NEO-BRUTALISM 3D UI & Shader Tokens Vault",
    slug: "neo-brutalism-3d-ui-tokens",
    description: "Comprehensive 3D motion shader library, WebGL tokens, React Three Fiber physics rigs, and 120+ pre-baked vector glyphs ready for immediate production deployment.",
    product_type: "digital_file",
    base_price: 1299,
    platform_fee_percent: 5.0,
    thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    media_gallery: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "published",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: {
      id: "seller-002",
      full_name: "GLYPH LABS",
      username: "glyphlabs",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      is_verified: true,
      role: "seller",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    digital_assets: [
      { id: "asset-002", product_id: "prod-002", r2_asset_key: "sellers/glyph/shader-tokens-v2.zip", file_name: "shader-tokens-v2.zip", file_size_bytes: 48920110, mime_type: "application/zip", version: 2, is_current: true, created_at: new Date().toISOString() }
    ],
  },
  {
    id: "prod-003",
    seller_id: "seller-003",
    title: "SYNAPSE OS • Notion Executive Operating System",
    slug: "synapse-os-notion-operating-system",
    description: "The autonomous operating system for creator enterprises, multi-brand studios, and angel syndicates. Pre-built with P&L trackers, deal flow pipelines, and client portals.",
    product_type: "digital_link",
    base_price: 899,
    platform_fee_percent: 5.0,
    thumbnail_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    media_gallery: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "published",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: {
      id: "seller-003",
      full_name: "AESTHETE SYSTEM",
      username: "aesthete",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      is_verified: true,
      role: "seller",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    external_vault_links: [
      { id: "link-003", product_id: "prod-003", provider: "notion", destination_url: "https://notion.so/synapse-os-vault-master", access_instructions: "Duplicate template directly into your private Notion workspace.", status: "active", created_at: new Date().toISOString() }
    ],
  },
  {
    id: "prod-004",
    seller_id: "seller-001",
    title: "MONOLITH Acid-Wash Cyber Cargo Pants",
    slug: "monolith-acid-wash-cyber-cargo",
    description: "Tactical ripstop cargo pants featuring waterproof YKK zippers, detachable utility straps, custom gunmetal buckles, and reinforced knee articulation.",
    product_type: "physical",
    base_price: 4199,
    platform_fee_percent: 5.0,
    thumbnail_url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80",
    media_gallery: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "published",
    created_at: new Date(Date.now() - 28800000).toISOString(),
    updated_at: new Date().toISOString(),
    seller: {
      id: "seller-001",
      full_name: "KAIZEN STUDIOS",
      username: "kaizen",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      is_verified: true,
      role: "seller",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    variants: [
      { id: "var-004-30", product_id: "prod-004", sku: "MNL-CRG-30", title: "Charcoal / 30", price: 4199, inventory_count: 5, attributes: { size: "30", color: "Charcoal" }, status: "active", created_at: new Date().toISOString() },
      { id: "var-004-32", product_id: "prod-004", sku: "MNL-CRG-32", title: "Charcoal / 32", price: 4199, inventory_count: 11, attributes: { size: "32", color: "Charcoal" }, status: "active", created_at: new Date().toISOString() },
      { id: "var-004-34", product_id: "prod-004", sku: "MNL-CRG-34", title: "Charcoal / 34", price: 4199, inventory_count: 6, attributes: { size: "34", color: "Charcoal" }, status: "active", created_at: new Date().toISOString() },
    ],
  },
];
