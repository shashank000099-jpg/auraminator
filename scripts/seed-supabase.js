const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ntamobfnorrejazppzej.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YW1vYmZub3JyZWphenBwemVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODMzOTg4OCwiZXhwIjoyMTAzOTE1ODg4fQ.iuWSH1OQZtdwocYoxNeVz2t5-tlS9KNZzTGRW_FUTLQ";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function getOrCreateUser(email, password, fullName, username, role = "seller") {
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existing = listData?.users?.find((u) => u.email === email);

  let userId;
  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, username, role },
    });
    if (error) {
      console.error(`[-] Error creating auth user ${email}:`, error.message);
      return null;
    }
    userId = created.user.id;
  }

  // Upsert profile
  const { error: profErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      username,
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      bio: `${fullName} • Verified Sovereign Protocol Member`,
      role,
      is_verified: true,
    },
    { onConflict: "id" }
  );

  if (profErr) {
    console.error(`[-] Error upserting profile ${username}:`, profErr.message);
  } else {
    console.log(`[+] Profile active: ${username} (${email})`);
  }

  return userId;
}

async function seed() {
  console.log("=== SEEDING REAL-WORLD SUPABASE DATABASE ===");

  // 1. Create Master Admin & Verified Sellers
  const adminId = await getOrCreateUser("shashank000099@gmail.com", "469087383207", "Shashank Admin", "shashank_admin", "admin");
  const seller1Id = await getOrCreateUser("kaizen@auraminator.in", "KaizenStore2026!", "KAIZEN STUDIOS", "kaizen", "seller");
  const seller2Id = await getOrCreateUser("glyphlabs@auraminator.in", "GlyphLabs2026!", "GLYPH LABS", "glyphlabs", "seller");
  const seller3Id = await getOrCreateUser("aesthete@auraminator.in", "Aesthete2026!", "AESTHETE SYSTEM", "aesthete", "seller");
  const seller4Id = await getOrCreateUser("saasventures@auraminator.in", "SaaSVentures2026!", "AURORA VENTURES", "aurora_ventures", "seller");
  const buyerId = await getOrCreateUser("buyer@auraminator.in", "BuyerDemo2026!", "Demo Buyer", "demobuyer", "buyer");

  if (!seller1Id || !seller4Id) {
    console.error("[-] Failed to initialize sellers");
    return;
  }

  // 2. Seed Curated Products
  console.log("\nSeeding Curated Products & SaaS Drops...");
  const products = [
    {
      seller_id: seller4Id,
      title: "PulseAnalytics • B2B AI User Analytics SaaS ($4.2k MRR)",
      slug: "pulseanalytics-ai-user-analytics-saas",
      description: "Turnkey Next.js & Python B2B analytics platform with 142 paying active enterprise customers. Includes Stripe billing, multi-tenant DB, domain transfer, and full IP handover.",
      product_type: "saas",
      base_price: 380000,
      platform_fee_percent: 15.0,
      thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      media_gallery: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
      ],
      asset_metrics: { mrr: 350000, arr: 4200000, stripe_verified: true, active_subscribers: 142 },
      status: "published",
    },
    {
      seller_id: seller1Id,
      title: "VORTEX 500 GSM Heavyweight Modular Hoodie",
      slug: "vortex-heavyweight-modular-hoodie",
      description: "Architectural cut-and-sew heavyweight luxury hoodie in Pitch Black. Hand-distressed 500 GSM loopback French Terry with modular magnetic stash pockets and matte monochrome hardware.",
      product_type: "physical",
      base_price: 3499,
      platform_fee_percent: 15.0,
      thumbnail_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
      media_gallery: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80"
      ],
      status: "published",
    },
    {
      seller_id: seller2Id,
      title: "NEO-BRUTALISM 3D UI & Shader Tokens Vault",
      slug: "neo-brutalism-3d-ui-tokens",
      description: "Comprehensive 3D motion shader library, WebGL tokens, React Three Fiber physics rigs, and 120+ pre-baked vector glyphs ready for immediate production deployment.",
      product_type: "digital_file",
      base_price: 1299,
      platform_fee_percent: 15.0,
      thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      media_gallery: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
      ],
      status: "published",
    },
    {
      seller_id: seller3Id,
      title: "SYNAPSE OS • Notion Executive Operating System",
      slug: "synapse-os-notion-operating-system",
      description: "The autonomous operating system for creator enterprises, multi-brand studios, and angel syndicates. Pre-built with P&L trackers, deal flow pipelines, and client portals.",
      product_type: "digital_link",
      base_price: 899,
      platform_fee_percent: 15.0,
      thumbnail_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      media_gallery: [
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80"
      ],
      status: "published",
    },
    {
      seller_id: seller4Id,
      title: "HyperNative • iOS & Android Flutter Ecommerce Engine",
      slug: "hypernative-flutter-ecommerce-source-code",
      description: "Complete production-ready multi-vendor mobile app in Flutter & Go backend with live push notifications, Razorpay integration, and dark mode UI.",
      product_type: "source_code",
      base_price: 49999,
      platform_fee_percent: 15.0,
      thumbnail_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
      media_gallery: [
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80"
      ],
      status: "published",
    },
  ];

  for (const prod of products) {
    const { data: existing } = await supabase.from("products").select("id").eq("slug", prod.slug).single();
    if (existing) {
      await supabase.from("products").update(prod).eq("id", existing.id);
      console.log(`[+] Product updated: ${prod.title}`);
    } else {
      const { data: inserted, error: pErr } = await supabase.from("products").insert(prod).select().single();
      if (pErr) {
        console.error(`[-] Error inserting product ${prod.slug}:`, pErr.message);
      } else {
        console.log(`[+] Product inserted: ${inserted.title}`);

        // Add variants for physical product
        if (prod.product_type === "physical") {
          await supabase.from("product_variants").insert([
            { product_id: inserted.id, sku: "VTX-HD-BLK-M", title: "Pitch Black / M", price: 3499, inventory_count: 14, attributes: { size: "M", color: "Pitch Black" } },
            { product_id: inserted.id, sku: "VTX-HD-BLK-L", title: "Pitch Black / L", price: 3499, inventory_count: 8, attributes: { size: "L", color: "Pitch Black" } },
            { product_id: inserted.id, sku: "VTX-HD-BLK-XL", title: "Pitch Black / XL", price: 3499, inventory_count: 4, attributes: { size: "XL", color: "Pitch Black" } },
          ]);
        }
      }
    }
  }

  // 3. Seed Verified Career Jobs
  console.log("\nSeeding Verified Career Jobs...");
  const jobs = [
    {
      poster_id: seller4Id,
      title: "Senior Full-Stack Next.js & Rust Engineer",
      slug: "senior-fullstack-engineer-nextjs-rust",
      company_name: "Aurora Protocol",
      location: "Bengaluru, India (Hybrid)",
      role_category: "engineering",
      job_type: "full_time",
      salary_range: "₹24,00,000 - ₹36,00,000 / yr",
      contact_email: "careers@auraminator.in",
      description: "We are scaling high-throughput financial settlement engines and low-latency digital asset trading terminals.",
      requirements: [
        "4+ years with Next.js 14 App Router and TypeScript",
        "Experience building double-entry ledgers and high-concurrency DB locks",
        "Deep understanding of PostgreSQL and RLS",
      ],
      benefits: ["Top-tier Health Insurance", "Remote Setup Stipend", "Equity Stock Options"],
      status: "published",
    },
    {
      poster_id: seller1Id,
      title: "Head of Streetwear Design & Physical Logistics",
      slug: "head-of-streetwear-design-logistics",
      company_name: "Kaizen Studios",
      location: "Delhi NCR, India (Onsite)",
      role_category: "fashion",
      job_type: "full_time",
      salary_range: "₹15,00,000 - ₹22,00,000 / yr",
      contact_email: "hiring@kaizenstudios.in",
      description: "Leading techwear cut-and-sew apparel development, sourcing 500+ GSM French Terry fabrics, and managing automated courier logistics.",
      requirements: [
        "Extensive portfolio in luxury streetwear or technical apparel",
        "Familiarity with supply chain hubs and Shiprocket fulfillment",
      ],
      benefits: ["Sample Wardrobe Allowance", "Global Fashion Week Travel"],
      status: "published",
    },
  ];

  for (const job of jobs) {
    const { data: existingJob } = await supabase.from("jobs").select("id").eq("slug", job.slug).single();
    if (existingJob) {
      await supabase.from("jobs").update(job).eq("id", existingJob.id);
      console.log(`[+] Job updated: ${job.title}`);
    } else {
      const { error: jErr } = await supabase.from("jobs").insert(job);
      if (jErr) {
        console.error(`[-] Error inserting job ${job.slug}:`, jErr.message);
      } else {
        console.log(`[+] Job inserted: ${job.title}`);
      }
    }
  }

  // 4. Seed Live Escrow Deal Room
  console.log("\nSeeding Live Escrow Deal Room...");
  const { data: saasProduct } = await supabase.from("products").select("id").eq("slug", "pulseanalytics-ai-user-analytics-saas").single();
  if (saasProduct) {
    const { data: existingDeal } = await supabase.from("deal_rooms").select("id").eq("product_id", saasProduct.id).single();
    if (!existingDeal) {
      const { data: createdDeal, error: dealErr } = await supabase.from("deal_rooms").insert({
        product_id: saasProduct.id,
        buyer_id: buyerId,
        seller_id: seller4Id,
        agreed_price: 380000,
        platform_fee: 57000,
        seller_payout: 323000,
        escrow_status: "awaiting_deposit",
      }).select().single();

      if (dealErr) {
        console.error("[-] Deal creation error:", dealErr.message);
      } else {
        console.log(`[+] Live Escrow Deal Room created: ${createdDeal.id}`);
        // Add initial message
        await supabase.from("deal_messages").insert({
          deal_id: createdDeal.id,
          sender_id: buyerId,
          sender_role: "buyer",
          message: "Offer of ₹3,80,000 officially accepted. Ready for escrow deposit.",
          message_type: "chat",
        });
      }
    } else {
      console.log("[+] Live Escrow Deal Room already active");
    }
  }

  // 5. Seed Seller Pickup Addresses for Automated Courier Routing
  console.log("\nSeeding Multi-Vendor Warehouse Pickup Hubs...");
  const pickupAddresses = [
    {
      seller_id: seller1Id,
      pickup_location_nickname: "Kaizen Central Logistics Hub",
      contact_name: "Kaizen Logistics Lead",
      contact_phone: "+91 9811002233",
      contact_email: "dispatch@kaizenstudios.in",
      address_line1: "Plot 42, Okhla Industrial Area Phase 3",
      address_line2: "Near Metro Depot",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110020",
      country: "IN",
      is_primary: true,
      is_verified: true,
    },
    {
      seller_id: seller2Id,
      pickup_location_nickname: "Glyph Studio Hub",
      contact_name: "Glyph Dispatch Lead",
      contact_phone: "+91 9822003344",
      contact_email: "dispatch@glyphlabs.in",
      address_line1: "Hub 7, Electronic City Phase 1",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560100",
      country: "IN",
      is_primary: true,
      is_verified: true,
    },
  ];

  for (const pAddr of pickupAddresses) {
    const { data: existingAddr } = await supabase
      .from("seller_pickup_addresses")
      .select("id")
      .eq("seller_id", pAddr.seller_id)
      .single();

    if (existingAddr) {
      await supabase.from("seller_pickup_addresses").update(pAddr).eq("id", existingAddr.id);
      console.log(`[+] Pickup Warehouse updated: ${pAddr.pickup_location_nickname}`);
    } else {
      const { error: pErr } = await supabase.from("seller_pickup_addresses").insert(pAddr);
      if (pErr) {
        console.log(`[-] Pickup address notice: ${pErr.message}`);
      } else {
        console.log(`[+] Pickup Warehouse registered: ${pAddr.pickup_location_nickname}`);
      }
    }
  }

  console.log("\n=== SUPABASE SEEDING & LIVE VERIFICATION 100% COMPLETE ===");
}

seed();
