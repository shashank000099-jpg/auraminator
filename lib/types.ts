export type UserRole = 'buyer' | 'seller' | 'admin';
export type VerificationStatus = 'draft' | 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended';
export type ProductType = 'digital_file' | 'digital_link' | 'physical' | 'service';
export type ProductStatus = 'draft' | 'pending_review' | 'published' | 'flagged' | 'suspended';
export type VariantStatus = 'active' | 'inactive' | 'out_of_stock';
export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned';
export type TrackingStatus = 'created' | 'pickup_scheduled' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'rto_initiated' | 'rto_delivered';
export type ReturnStatus = 'requested' | 'approved' | 'pickup_scheduled' | 'received_inspection' | 'refund_approved' | 'rejected' | 'completed';
export type LedgerEntryType = 'credit_escrow' | 'escrow_release' | 'debit_payout' | 'debit_refund' | 'platform_fee';
export type BalanceType = 'pending' | 'available';
export type PayoutStatus = 'processing' | 'completed' | 'failed' | 'reversed';
export type DisputeStatus = 'opened' | 'seller_pending' | 'under_review' | 'resolved_refunded' | 'resolved_rejected';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerOnboarding {
  id: string;
  seller_id: string;
  legal_business_name: string;
  tax_identifier?: string;
  document_urls: string[];
  verification_status: VerificationStatus;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface SellerPayoutAccount {
  id: string;
  seller_id: string;
  gateway_account_id: string;
  settlement_bank_details: {
    account_number?: string;
    ifsc_code?: string;
    beneficiary_name?: string;
    bank_name?: string;
  };
  is_active: boolean;
  created_at: string;
}

export interface Storefront {
  id: string;
  seller_id: string;
  headline?: string;
  banner_url?: string;
  custom_theme: {
    accent?: string;
    bg?: string;
  };
  social_links: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  featured_product_ids: string[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  title: string;
  price: number;
  inventory_count: number;
  weight_in_grams?: number;
  attributes: Record<string, string>;
  status: VariantStatus;
  created_at: string;
}

export interface DigitalAsset {
  id: string;
  product_id: string;
  r2_asset_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  version: number;
  is_current: boolean;
  created_at: string;
}

export interface ExternalVaultLink {
  id: string;
  product_id: string;
  provider: 'notion' | 'google_drive' | 'canva' | 'figma' | string;
  destination_url: string;
  access_instructions?: string;
  status: 'active' | 'disabled';
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id?: string;
  title: string;
  slug: string;
  description?: string;
  product_type: ProductType;
  base_price: number;
  platform_fee_percent: number;
  thumbnail_url: string;
  media_gallery: string[];
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
  digital_assets?: DigitalAsset[];
  external_vault_links?: ExternalVaultLink[];
  seller?: Profile;
  category?: Category;
}

export interface Entitlement {
  id: string;
  buyer_id: string;
  order_id: string;
  order_item_id: string;
  product_id: string;
  access_type: 'digital_file' | 'digital_link';
  status: 'active' | 'revoked' | 'expired';
  download_count: number;
  max_downloads: number;
  last_accessed_at?: string;
  created_at: string;
  products?: Product;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  created_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  user_id?: string;
  anonymous_session_id?: string;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface OrderShippingAddress {
  id: string;
  order_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  seller_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  platform_fee: number;
  seller_share: number;
  product_type: ProductType;
  fulfillment_status: FulfillmentStatus;
  created_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  total_platform_cut: number;
  total_seller_net: number;
  payment_status: PaymentStatus;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  coupon_code?: string;
  discount_amount: number;
  created_at: string;
  order_items?: OrderItem[];
  shipping_address?: OrderShippingAddress;
  buyer?: Profile;
}

export interface Shipment {
  id: string;
  order_id: string;
  seller_id: string;
  shiprocket_shipment_id?: string;
  shiprocket_order_id?: string;
  awb_code?: string;
  courier_name?: string;
  shipping_label_url?: string;
  manifest_url?: string;
  tracking_status: TrackingStatus;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  status: string;
  location?: string;
  timestamp: string;
  raw_payload?: Record<string, any>;
}

export interface LedgerEntry {
  id: string;
  seller_id: string;
  order_id?: string;
  order_item_id?: string;
  entry_type: LedgerEntryType;
  amount: number;
  balance_type: BalanceType;
  description: string;
  created_at: string;
}

export interface Payout {
  id: string;
  seller_id: string;
  amount: number;
  gateway_payout_id?: string;
  status: PayoutStatus;
  failure_reason?: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  order_item_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  buyer_evidence: string[];
  seller_response?: string;
  seller_evidence: string[];
  status: DisputeStatus;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  comment?: string;
  is_verified_purchase: boolean;
  created_at: string;
  buyer?: Profile;
}
