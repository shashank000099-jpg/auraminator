create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. AUTH, IDENTITY & SELLER ONBOARDING
-- ==========================================
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  username text unique not null,
  avatar_url text default '',
  bio text default '',
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seller_onboarding (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade unique,
  legal_business_name text not null,
  tax_identifier text, -- Tax ID / Business Reg ID
  document_urls text[] default array[]::text[],
  verification_status text not null default 'pending' check (verification_status in ('draft', 'pending', 'under_review', 'verified', 'rejected', 'suspended')),
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.seller_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade unique,
  gateway_account_id text not null,
  settlement_bank_details jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.storefronts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade unique,
  headline text default '',
  banner_url text default '',
  custom_theme jsonb default '{"accent": "#ffffff", "bg": "#000000"}'::jsonb,
  social_links jsonb default '{}'::jsonb,
  featured_product_ids uuid[] default array[]::uuid[],
  created_at timestamptz not null default now()
);

-- ==========================================
-- 2. TAXONOMY, CATALOG & VARIANTS
-- ==========================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text default '',
  parent_id uuid references public.categories(id) on delete set null
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text not null,
  description text default '',
  product_type text not null check (product_type in ('digital_file', 'digital_link', 'physical', 'service')),
  base_price numeric(10,2) not null check (base_price >= 0),
  platform_fee_percent numeric(4,2) not null default 5.00,
  thumbnail_url text not null,
  media_gallery text[] default array[]::text[],
  status text not null default 'published' check (status in ('draft', 'pending_review', 'published', 'flagged', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  title text not null, -- e.g. "Matte Black / XL"
  price numeric(10,2) not null check (price >= 0),
  inventory_count int not null default 0 check (inventory_count >= 0),
  weight_in_grams numeric(8,2) default null,
  attributes jsonb not null default '{}'::jsonb, -- {"color": "black", "size": "XL"}
  status text not null default 'active' check (status in ('active', 'inactive', 'out_of_stock')),
  created_at timestamptz not null default now()
);

-- ==========================================
-- 3. DIGITAL ASSET MANAGEMENT & VAULT
-- ==========================================
create table if not exists public.digital_assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  r2_asset_key text not null,
  file_name text not null,
  file_size_bytes bigint not null,
  mime_type text not null,
  version int not null default 1,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.external_vault_links (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  provider text not null default 'notion', -- 'google_drive', 'notion', 'canva', 'figma'
  destination_url text not null, -- Raw protected URL
  access_instructions text default '',
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid not null,
  order_item_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  access_type text not null check (access_type in ('digital_file', 'digital_link')),
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  download_count int not null default 0,
  max_downloads int default 50,
  last_accessed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(buyer_id, product_id)
);

create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references public.entitlements(id) on delete cascade,
  ip_address text,
  user_agent text,
  downloaded_at timestamptz not null default now()
);

-- ==========================================
-- 4. CONCURRENCY & INVENTORY RESERVATION
-- ==========================================
create table if not exists public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  reserved_quantity int not null check (reserved_quantity > 0),
  session_or_user_id text not null,
  status text not null default 'active' check (status in ('active', 'committed', 'released')),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  created_at timestamptz not null default now()
);

-- ==========================================
-- 5. CARTS, COMMERCE & ORDERS
-- ==========================================
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  anonymous_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(cart_id, product_id, variant_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id),
  total_amount numeric(10,2) not null,
  total_platform_cut numeric(10,2) not null,
  total_seller_net numeric(10,2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'captured', 'failed', 'refunded', 'partially_refunded')),
  gateway_order_id text unique,
  gateway_payment_id text,
  coupon_code text default null,
  discount_amount numeric(10,2) not null default 0.00,
  created_at timestamptz not null default now()
);

create table if not exists public.order_shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade unique,
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text default '',
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'IN',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  seller_id uuid not null references public.profiles(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  subtotal numeric(10,2) not null,
  platform_fee numeric(10,2) not null,
  seller_share numeric(10,2) not null,
  product_type text not null check (product_type in ('digital_file', 'digital_link', 'physical', 'service')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'shipped', 'delivered', 'completed', 'cancelled', 'returned')),
  created_at timestamptz not null default now()
);

-- ==========================================
-- 6. SHIPPING, LOGISTICS & REVERSE PIPELINE
-- ==========================================
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  shiprocket_shipment_id text,
  shiprocket_order_id text,
  awb_code text unique,
  courier_name text,
  shipping_label_url text,
  manifest_url text,
  tracking_status text not null default 'created' check (tracking_status in ('created', 'pickup_scheduled', 'in_transit', 'out_for_delivery', 'delivered', 'rto_initiated', 'rto_delivered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text not null,
  location text default '',
  timestamp timestamptz not null default now(),
  raw_payload jsonb default '{}'::jsonb
);

create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  order_item_id uuid not null references public.order_items(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  reason text not null,
  evidence_images text[] default array[]::text[],
  status text not null default 'requested' check (status in ('requested', 'approved', 'pickup_scheduled', 'received_inspection', 'refund_approved', 'rejected', 'completed')),
  shiprocket_return_awb text,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 6B. HASSLE-FREE TECH SERVICES & INTAKE VAULT
-- ==========================================
create table if not exists public.service_intakes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  repo_url text,
  tech_stack text[] default array[]::text[],
  requirements text not null,
  environment_secrets text,
  delivery_sla_days int not null default 3,
  status text not null default 'intake_pending' check (status in ('intake_pending', 'in_progress', 'deliverable_submitted', 'completed', 'disputed')),
  github_pr_url text,
  preview_url text,
  handover_notes text,
  submitted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_milestones (
  id uuid primary key default gen_random_uuid(),
  service_intake_id uuid not null references public.service_intakes(id) on delete cascade,
  title text not null,
  description text,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 7. DOUBLE-ENTRY LEDGER & SETTLEMENTS
-- ==========================================
create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  order_id uuid references public.orders(id),
  order_item_id uuid references public.order_items(id),
  entry_type text not null check (entry_type in ('credit_escrow', 'escrow_release', 'debit_payout', 'debit_refund', 'platform_fee')),
  amount numeric(10,2) not null,
  balance_type text not null check (balance_type in ('pending', 'available')),
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  amount numeric(10,2) not null check (amount > 0),
  gateway_payout_id text,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed', 'reversed')),
  failure_reason text,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 8. DISPUTES, MODERATION & FRAUD
-- ==========================================
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  order_item_id uuid not null references public.order_items(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  reason text not null,
  buyer_evidence text[] default array[]::text[],
  seller_response text,
  seller_evidence text[] default array[]::text[],
  status text not null default 'opened' check (status in ('opened', 'seller_pending', 'under_review', 'resolved_refunded', 'resolved_rejected')),
  resolution_notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.fraud_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  ip_address text not null,
  risk_score int not null default 0,
  trigger_rule text not null,
  payload jsonb default '{}'::jsonb,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 9. SOCIAL COMMERCE, REVIEWS & COMMS
-- ==========================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id),
  rating int not null check (rating >= 1 and rating <= 5),
  comment text default '',
  is_verified_purchase boolean not null default true,
  created_at timestamptz not null default now(),
  unique(product_id, buyer_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(buyer_id, seller_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  message_text text not null,
  attachments text[] default array[]::text[],
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  event_type text not null,
  payload jsonb default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  email_order_updates boolean not null default true,
  email_marketing boolean not null default false,
  in_app_drops boolean not null default true
);

-- ==========================================
-- 10. AUDIT, WEBHOOKS & TELEMETRY
-- ==========================================
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'processed' check (status in ('received', 'processed', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  session_id text not null,
  event_type text not null, -- 'product_view', 'add_to_cart', 'checkout_start', 'purchase'
  product_id uuid references public.products(id) on delete cascade,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity text not null,
  entity_id text not null,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 11. ATOMIC INVENTORY CONCURRENCY RPCs
-- ==========================================
create or replace function public.reserve_inventory(
  p_variant_id uuid,
  p_quantity int,
  p_session_id text
) returns jsonb as $$
declare
  v_available int;
  v_reservation_id uuid;
begin
  select inventory_count into v_available
  from public.product_variants
  where id = p_variant_id for update;

  if v_available is null or v_available < p_quantity then
    return jsonb_build_object('success', false, 'message', 'Insufficient inventory available');
  end if;

  update public.product_variants
  set inventory_count = inventory_count - p_quantity
  where id = p_variant_id;

  insert into public.inventory_reservations (variant_id, reserved_quantity, session_or_user_id, status)
  values (p_variant_id, p_quantity, p_session_id, 'active')
  returning id into v_reservation_id;

  return jsonb_build_object('success', true, 'reservation_id', v_reservation_id);
end;
$$ language plpgsql security definer;

create or replace function public.commit_inventory(p_reservation_id uuid) returns void as $$
begin
  update public.inventory_reservations
  set status = 'committed'
  where id = p_reservation_id and status = 'active';
end;
$$ language plpgsql security definer;

create or replace function public.release_inventory(p_reservation_id uuid) returns void as $$
declare
  v_variant_id uuid;
  v_qty int;
begin
  update public.inventory_reservations
  set status = 'released'
  where id = p_reservation_id and status = 'active'
  returning variant_id, reserved_quantity into v_variant_id, v_qty;

  if v_variant_id is not null then
    update public.product_variants
    set inventory_count = inventory_count + v_qty
    where id = v_variant_id;
  end if;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
alter table public.profiles enable row level security;
alter table public.seller_onboarding enable row level security;
alter table public.seller_payout_accounts enable row level security;
alter table public.storefronts enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.digital_assets enable row level security;
alter table public.external_vault_links enable row level security;
alter table public.entitlements enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_shipping_addresses enable row level security;
alter table public.shipments enable row level security;
alter table public.returns enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.payouts enable row level security;
alter table public.disputes enable row level security;
alter table public.reviews enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles: Public read" on public.profiles for select using (true);
create policy "Profiles: Self update" on public.profiles for update using (auth.uid() = id);

create policy "Seller Onboarding: Owner read/write" on public.seller_onboarding for all using (auth.uid() = seller_id);
create policy "Payout Accounts: Owner read/write" on public.seller_payout_accounts for all using (auth.uid() = seller_id);
create policy "Storefronts: Public read" on public.storefronts for select using (true);
create policy "Storefronts: Owner edit" on public.storefronts for all using (auth.uid() = seller_id);

create policy "Products: Public read published" on public.products for select using (status = 'published');
create policy "Products: Seller full control" on public.products for all using (auth.uid() = seller_id);

create policy "Variants: Public read" on public.product_variants for select using (true);
create policy "Variants: Seller full control" on public.product_variants for all using (
  product_id in (select id from public.products where seller_id = auth.uid())
);

create policy "Entitlements: Buyer own access" on public.entitlements for select using (auth.uid() = buyer_id and status = 'active');

create policy "Carts: User access" on public.carts for all using (auth.uid() = user_id);
create policy "Cart Items: Owner access" on public.cart_items for all using (
  cart_id in (select id from public.carts where user_id = auth.uid())
);

create policy "Orders: Buyer view" on public.orders for select using (auth.uid() = buyer_id);
create policy "Order Items: Buyer and Seller view" on public.order_items for select using (
  auth.uid() = seller_id or order_id in (select id from public.orders where buyer_id = auth.uid())
);
create policy "Order Addresses: Buyer view" on public.order_shipping_addresses for select using (
  order_id in (select id from public.orders where buyer_id = auth.uid())
);

create policy "Ledger: Seller view own" on public.ledger_entries for select using (auth.uid() = seller_id);
create policy "Payouts: Seller view own" on public.payouts for select using (auth.uid() = seller_id);
create policy "Disputes: Involving parties view" on public.disputes for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Enforce Verified-Purchase Check on Reviews
create policy "Reviews: Public read" on public.reviews for select using (true);
create policy "Reviews: Verified Buyer Insert" on public.reviews for insert with check (
  auth.uid() = buyer_id and exists (
    select 1 from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.buyer_id = auth.uid()
    and oi.product_id = product_id
    and o.payment_status = 'captured'
  )
);

-- ==========================================
-- 13. FREE CREATOR & TECH JOB BOARD
-- ==========================================
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid references public.profiles(id),
  company_name text not null,
  company_logo text,
  title text not null,
  slug text not null unique,
  role_category text not null check (role_category in ('engineering', 'design', 'fashion', 'marketing', 'ai_ml', 'web3', 'operations')),
  job_type text not null check (job_type in ('full_time', 'part_time', 'contract', 'freelance', 'internship')),
  location text not null default 'Remote',
  salary_range text not null,
  description text not null,
  requirements text[] default array[]::text[],
  benefits text[] default array[]::text[],
  contact_email text not null,
  status text not null default 'published' check (status in ('draft', 'published', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid references public.profiles(id),
  full_name text not null,
  email text not null,
  phone text,
  portfolio_url text,
  github_url text,
  resume_url text not null,
  cover_note text not null,
  expected_salary text,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;

create policy "Jobs: Public view published" on public.jobs for select using (status = 'published');
create policy "Jobs: Poster manage own" on public.jobs for all using (auth.uid() = poster_id);
create policy "Applications: Applicant view own" on public.job_applications for select using (auth.uid() = applicant_id);
create policy "Applications: Public insert" on public.job_applications for insert with check (true);
create policy "Applications: Recruiter manage job candidates" on public.job_applications for select using (
  job_id in (select id from public.jobs where poster_id = auth.uid())
);

