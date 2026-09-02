# AURAMINATOR — COMPLETE SYSTEM, ROUTE, WEBHOOK & ARCHITECTURAL FORENSIC AUDIT

**Target Codebase:** `c:\auraminator.genzstore`  
**Report Date:** September 3, 2026  
**Auditor Roles:** Principal Full-Stack Engineer, Backend Architect, Security Engineer, QA Lead  
**Methodology:** Zero-Trust Source Inspection, Live Supabase PostgreSQL Probing, Next.js Build Trace & External API Model Verification  

---

## TABLE OF CONTENTS
1. [Executive Summary & System Health](#executive-summary--system-health)
2. [Section 1: Complete Route Inventory (All 60 Routes)](#section-1-complete-route-inventory)
3. [Section 2: Webhook Forensic Audit (Razorpay & Shiprocket)](#section-2-webhook-forensic-audit)
4. [Section 3: Complete Escrow Finite State Machine (FSM) Audit](#section-3-complete-escrow-finite-state-machine-fsm-audit)
5. [Section 4: Physical Product Complete Flow & Multi-Vendor Isolation](#section-4-physical-product-complete-flow--multi-vendor-isolation)
6. [Section 5: Address Routing Audit](#section-5-address-routing-audit)
7. [Section 6: Checkout & Fee Distribution Audit](#section-6-checkout--fee-distribution-audit)
8. [Section 7: Buyer Cancellation Audit](#section-7-buyer-cancellation-audit)
9. [Section 8: Refund Forensic Audit](#section-8-refund-forensic-audit)
10. [Section 9: Razorpay Route Audit](#section-9-razorpay-route-audit)
11. [Section 10: High-Ticket SaaS & Tech Service Audit](#section-10-high-ticket-saas--tech-service-audit)
12. [Section 11: Seller-Initiated Dispute Audit](#section-11-seller-initiated-dispute-audit)
13. [Section 12: Digital Asset Audit](#section-12-digital-asset-audit)
14. [Section 13: Idempotency Audit](#section-13-idempotency-audit)
15. [Section 14: Race Condition Audit](#section-14-race-condition-audit)
16. [Section 15: Database Audit (Schema Reality vs Code Assumptions)](#section-15-database-audit)
17. [Section 16: Security Audit (Vulnerabilities, IDOR, Auth Bypass)](#section-16-security-audit)
18. [Section 17: External API Audit (Razorpay, Shiprocket, Gemini)](#section-17-external-api-audit)
19. [Section 18: Error Matrix](#section-18-error-matrix)
20. [Section 19: Test Case Matrix](#section-19-test-case-matrix)
21. [Section 20: Code-Level Error Audit (TODO, FIXME, MOCK, HARDCODED)](#section-20-code-level-error-audit)
22. [Section 21: Build / Type / Lint Audit](#section-21-build--type--lint-audit)
23. [Section 22: Environment Audit](#section-22-environment-audit)
24. [Section 23: Final Business-Logic Reconciliation (24 Rules)](#section-23-final-business-logic-reconciliation)
25. [Section 24: Final Verdict & Actionable Remediation Plan](#section-24-final-verdict--actionable-remediation-plan)

---

## EXECUTIVE SUMMARY & SYSTEM HEALTH

> [!CAUTION]
> **FINAL AUDIT RULING: NOT PRODUCTION READY (HIGH RISK)**  
> While the codebase compiles without TypeScript errors (`npx tsc --noEmit` exited 0) and Next.js compiles 53 static pages and 31 dynamic API routes (`npm run build` exited 0), this forensic audit identified **11 critical architectural bugs, security vulnerabilities, database constraint crashes, and disconnected workflows** that will result in silent financial loss, unauthenticated tampering, or hard 500 runtime crashes in production.

### Summary of Critical Architectural Blockers:
1. **Unauthenticated Order Cancellation & Refund Bypass (`app/api/orders/[id]/cancel/route.ts:L41-L54`)**: Unauthenticated guest callers can cancel any order and trigger a full Razorpay refund due to an inverted guard (`if (user && user.id !== order.buyer_id)`).
2. **Hardcoded Master Admin Credentials (`app/admin/login/page.tsx:L32-L42`)**: Root admin credentials (`shashank000099@gmail.com` / `469087383207`) are embedded in plain-text inside the client-side JavaScript chunk.
3. **Database Check Constraint Crash in Admin Dispute Tribunal (`app/api/admin/disputes/[id]/route.ts:L77,L101,L133`)**: All 3 admin rulings update `disputes.status = "resolved"`. Postgres rejects this with `violates check constraint "disputes_status_check"`. Admin dispute arbitration crashes with HTTP 500.
4. **Missing Table Query Crash (`app/api/account/orders/route.ts:L22`)**: The route queries `digital_entitlements`, but the actual table name in Supabase is `entitlements`. Logged-in users visiting `/account` crash with HTTP 500.
5. **Database Check Constraint Crash in Tech Service Revision (`app/api/account/services/[id]/approve/route.ts:L83`)**: Buyer revision requests set `status = "revision_requested"`. Postgres rejects this with `violates check constraint "service_intakes_status_check"`.
6. **Orphaned Pickup Warehouse Routing Disconnect (`app/api/seller/pickup-addresses/route.ts:L101-L124`)**: Seller warehouse addresses are written to `storefronts.social_links.warehouse_pickup`, but `POST /api/shipments` and `POST /api/shipping/calculate-rate` query `seller_pickup_addresses` (which remains empty). The system always silently falls back to Okhla Delhi (`110020`).
7. **Hallucinated Gemini AI Model Names (`lib/gemini-seo.ts:L66` & `app/api/ai/copilot/route.ts:L4-L9`)**: Requests non-existent models (`gemini-3.6-flash`, `gemini-3.5-flash`). Every external AI request fails with HTTP 404 and falls back to deterministic hardcoded templates.
8. **IDOR Profile Read & Overwrite (`app/api/account/profile/route.ts:L9,L57`)**: Any caller can read or overwrite any user's personal details (email, phone, address) by passing arbitrary `userId` to the service-role client.
9. **Pre-Purchase Vault Link Data Leak (`app/api/products/route.ts:L15` & `app/api/products/[id]/route.ts:L19`)**: Public product queries select `external_vault_links(*)`, leaking raw Notion/Drive destination URLs before payment.
10. **Dead Refund Recovery Code (`lib/escrow-engine.ts:L520-L600`)**: `retryRefund` and `resolveFailedRefundManually` (UTR settlement) exist in the engine class, but have no API routes or UI buttons wired to them.
11. **Double Escrow Credit Bug on Tribunal Ruling (`app/api/admin/disputes/[id]/route.ts:L81-L88`)**: When the admin rules `seller_correct`, the route calls `verifyDeliveryAndAuthorize` (which credits ledger) and then inserts a second `escrow_release` row, doubling the seller's credited payout.

---

## SECTION 1: COMPLETE ROUTE INVENTORY

### Page Routes (29 Routes)

```text
1. Route: /
Method: GET
File: app/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Marketplace homepage, brand showcase, category grid, featured products.
External APIs: None directly
DB Tables Read: products, profiles
DB Tables Written: None
Expected State Changes: None
Failure Modes: Empty product grids if DB unavailable.
Current Status: WORKING (Static Pre-rendered)

2. Route: /[username]
Method: GET
File: app/[username]/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Creator storefront portfolio and bio.
External APIs: None
DB Tables Read: profiles, products, storefronts
DB Tables Written: None
Expected State Changes: None
Failure Modes: 404 if username not found.
Current Status: WORKING (Dynamic SSR)

3. Route: /account
Method: GET
File: app/account/page.tsx
Who can call it: Authenticated Buyer
Authentication: Supabase Auth Cookie / LocalStorage
Authorization: User matching session
Purpose: Buyer dashboard, profile editor, order history, digital library downloads.
External APIs: None directly (calls /api/account/profile, /api/account/orders)
DB Tables Read: profiles, orders, entitlements (via API)
DB Tables Written: profiles, auth.users metadata (via PUT API)
Expected State Changes: Updates user profile and shipping address.
Failure Modes: Crashes when loading orders due to digital_entitlements table mismatch in backend.
Current Status: PARTIALLY WORKING (Orders tab crashes with 500)

4. Route: /account/deals
Method: GET
File: app/account/deals/page.tsx
Who can call it: Authenticated Buyer / Seller
Authentication: Supabase Auth
Authorization: Role-based view of deals
Purpose: Track high-ticket SaaS/App negotiations and deal rooms.
External APIs: None directly (calls /api/offers)
DB Tables Read: offers, products, deal_rooms
DB Tables Written: None
Expected State Changes: None
Failure Modes: Offers never show up because POST /api/offers never inserts into DB.
Current Status: PARTIALLY WORKING (Empty list displayed)

5. Route: /account/orders/[id]
Method: GET
File: app/account/orders/[id]/page.tsx
Who can call it: Authenticated Buyer
Authentication: Supabase Auth
Authorization: Buyer matching order.buyer_id
Purpose: Detailed order lifecycle tracker, Shiprocket tracking status, cancellation button, return dispute flow.
External APIs: None directly (calls /api/orders/[id]/cancel)
DB Tables Read: orders, order_items, shipments, shipment_events, order_shipping_addresses
DB Tables Written: None directly
Expected State Changes: Cancels order if within cancellation policy.
Failure Modes: Anyone with order UUID can cancel via API due to backend auth flaw.
Current Status: WORKING UI (Underlying API has security bypass)

6. Route: /account/services/[id]
Method: GET
File: app/account/services/[id]/page.tsx
Who can call it: Authenticated Buyer
Authentication: Supabase Auth
Authorization: Buyer matching order.buyer_id
Purpose: Buyer service delivery inspection, review GitHub PR / staging link, approve deliverables or request revision.
External APIs: None directly (calls /api/account/services/[id]/approve)
DB Tables Read: orders, service_intakes, order_items
DB Tables Written: None directly
Expected State Changes: Transitions service to completed (approve) or revision_requested (revision).
Failure Modes: Revision requests crash due to Postgres check constraint mismatch.
Current Status: PARTIALLY WORKING (Approval works; revision crashes)

7. Route: /admin/dashboard
Method: GET
File: app/admin/dashboard/page.tsx
Who can call it: Master Admin
Authentication: LocalStorage flag (auraminator_admin_authenticated)
Authorization: Purely client-side string check
Purpose: Mission Control: GMV metrics, Seller KYC approval, Product moderation, Escrow deal rooms, Dispute dossiers tribunal.
External APIs: None directly (calls /api/admin/disputes, /api/admin/disputes/[id])
DB Tables Read: seller_onboarding, products, jobs, deal_rooms, disputes, ledger_entries
DB Tables Written: seller_onboarding, products, disputes
Expected State Changes: Approves/rejects KYC, products, resolves disputes.
Failure Modes: Fails to load disputes if caller does not have an active Supabase server session.
Current Status: FLAWED AUTH (Client-side localStorage auth)

8. Route: /admin/login
Method: GET
File: app/admin/login/page.tsx
Who can call it: Admin
Authentication: Hardcoded credentials
Authorization: Plain-text comparison in JavaScript
Purpose: Admin login gateway.
External APIs: None
DB Tables Read: None
DB Tables Written: None
Expected State Changes: Writes auraminator_admin_authenticated: true to browser localStorage.
Failure Modes: Credentials exposed in client-side bundle.
Current Status: INSECURE (Hardcoded credentials in client JS)

9. Route: /auth/login
Method: GET
File: app/auth/login/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Buyer/Seller email & password login portal.
External APIs: None directly (calls /api/auth/login and Supabase client)
DB Tables Read: profiles, auth.users
DB Tables Written: None
Expected State Changes: Sets active auth session.
Failure Modes: Invalid password, network errors.
Current Status: WORKING

10. Route: /auth/signup
Method: GET
File: app/auth/signup/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Buyer/Seller account creation portal.
External APIs: None directly (calls /api/auth/register)
DB Tables Read: None
DB Tables Written: auth.users, profiles
Expected State Changes: Creates new user with auto-confirmed email.
Failure Modes: Duplicate email (returns 409).
Current Status: WORKING

11. Route: /brand
Method: GET
File: app/brand/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Auraminator brand guidelines, logos, assets.
External APIs: None
DB Tables Read: None
DB Tables Written: None
Expected State Changes: None
Failure Modes: None
Current Status: WORKING (Static)

12. Route: /cart
Method: GET
File: app/cart/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: View shopping cart items, quantity controls, subtotal calculation.
External APIs: None
DB Tables Read: None (uses Zustand client store / localStorage)
DB Tables Written: None
Expected State Changes: None
Failure Modes: None
Current Status: WORKING

13. Route: /checkout
Method: GET
File: app/checkout/page.tsx
Who can call it: Authenticated Buyer
Authentication: Supabase Auth
Authorization: Logged-in user
Purpose: Multi-vendor checkout, PIN code dynamic shipping calculator, Razorpay payment gateway trigger.
External APIs: Calls /api/shipping/calculate-rate, /api/checkout, Razorpay Checkout SDK
DB Tables Read: profiles (via auth context)
DB Tables Written: orders, order_items, order_shipping_addresses (via /api/checkout)
Expected State Changes: Creates pending order and Razorpay order ID.
Failure Modes: Multi-vendor shipping only calculates for 1st seller.
Current Status: WORKING (Single-seller calculation caveat)

14. Route: /deals/[id]
Method: GET
File: app/deals/[id]/page.tsx
Who can call it: Buyer or Seller on deal
Authentication: Supabase Auth
Authorization: Buyer or Seller matching deal_rooms row
Purpose: Private high-ticket deal escrow room, anti-circumvention chat, contact reveal, credential transfer, release.
External APIs: Razorpay (if depositing)
DB Tables Read: deal_rooms, deal_messages, deal_transfers, profiles
DB Tables Written: deal_messages, deal_rooms, deal_transfers
Expected State Changes: Transitions escrow state, unmasks contact post-payment.
Failure Modes: Fake phone/email generated in API response.
Current Status: WORKING UI (API synthesizes placeholder contact strings)

15. Route: /disclaimer
Method: GET
File: app/disclaimer/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Platform legal disclaimer and risk disclosure.
External APIs: None
DB Tables Read: None
DB Tables Written: None
Expected State Changes: None
Failure Modes: None
Current Status: WORKING (Static)

16. Route: /explore
Method: GET
File: app/explore/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Discover trending drops, filter by category (SaaS, Streetwear, 3D Assets, Services).
External APIs: None directly (calls /api/products)
DB Tables Read: products, profiles, product_variants
DB Tables Written: None
Expected State Changes: None
Failure Modes: Empty if products table is empty.
Current Status: WORKING

17. Route: /jobs
Method: GET
File: app/jobs/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Tech & creator job board directory.
External APIs: None directly (calls /api/jobs)
DB Tables Read: jobs
DB Tables Written: None
Expected State Changes: None
Failure Modes: None
Current Status: WORKING

18. Route: /jobs/dashboard
Method: GET
File: app/jobs/dashboard/page.tsx
Who can call it: Recruiter / Job Poster
Authentication: Supabase Auth
Authorization: User matching poster_id
Purpose: Manage job postings and view candidate applications.
External APIs: None
DB Tables Read: jobs, job_applications
DB Tables Written: None
Expected State Changes: None
Failure Modes: None
Current Status: WORKING

19. Route: /jobs/new
Method: GET
File: app/jobs/new/page.tsx
Who can call it: Anyone (Auth recommended)
Authentication: Optional (defaults to demo poster)
Authorization: None
Purpose: Post new job opening with automated Gemini AI SEO generation.
External APIs: None directly (calls /api/jobs)
DB Tables Read: None
DB Tables Written: jobs (via API)
Expected State Changes: Publishes new job immediately.
Failure Modes: Unauthenticated users can post spam jobs.
Current Status: WORKING UI (Backend lacks strict auth guard)

20. Route: /jobs/[id]
Method: GET
File: app/jobs/[id]/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Detailed job posting specification, requirements, salary, and candidate application form.
External APIs: None directly (calls /api/jobs/[id]/apply)
DB Tables Read: jobs
DB Tables Written: job_applications (via API)
Expected State Changes: Submits application.
Failure Modes: None
Current Status: WORKING

21. Route: /privacy
Method: GET
File: app/privacy/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Privacy policy.
External APIs: None
DB Tables Read: None
DB Tables Written: None
Expected State Changes: None
Failure Modes: None
Current Status: WORKING (Static)

22. Route: /product/[slug]
Method: GET
File: app/product/[slug]/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Product details page, variant selector, pricing, verified reviews, creator profile card.
External APIs: None directly (calls /api/products/[id])
DB Tables Read: products, product_variants, profiles, reviews
DB Tables Written: None
Expected State Changes: None
Failure Modes: Leaks private vault links in JSON payload.
Current Status: WORKING UI (Sensitive data exposed in API response)

23. Route: /seller/dashboard
Method: GET
File: app/seller/dashboard/page.tsx
Who can call it: Authenticated Seller
Authentication: Supabase Auth
Authorization: Role check (redirects to onboarding if unverified)
Purpose: Creator Mission Control: real-time sales metrics, active orders, product listings, pickup address status.
External APIs: None directly (calls /api/seller/analytics, /api/seller/products)
DB Tables Read: products, orders, ledger_entries, deal_rooms
DB Tables Written: None
Expected State Changes: None
Failure Modes: Pending escrow balance never decrements on cancelled orders.
Current Status: WORKING

24. Route: /seller/onboarding
Method: GET
File: app/seller/onboarding/page.tsx
Who can call it: Authenticated User
Authentication: Supabase Auth
Authorization: Logged-in user
Purpose: Sovereign Creator 3-Step KYC: Legal business entity, Bank account for Route payouts, Pickup warehouse registration.
External APIs: None directly (calls /api/seller/onboarding, /api/seller/pickup-addresses)
DB Tables Read: profiles
DB Tables Written: seller_onboarding, storefronts
Expected State Changes: Creates onboarding record.
Failure Modes: Warehouse address written to storefronts instead of seller_pickup_addresses.
Current Status: PARTIALLY WORKING (Warehouse address orphaned)

25. Route: /seller/payouts
Method: GET
File: app/seller/payouts/page.tsx
Who can call it: Authenticated Seller
Authentication: Supabase Auth
Authorization: Seller matching session
Purpose: Escrow payouts dashboard, double-entry ledger logs, Razorpay Route linked account status.
External APIs: None directly (calls /api/seller/analytics)
DB Tables Read: ledger_entries, payouts, seller_payout_accounts
DB Tables Written: None
Expected State Changes: None
Failure Modes: Cancelled orders remain stuck in pending escrow.
Current Status: WORKING

26. Route: /seller/products
Method: GET
File: app/seller/products/page.tsx
Who can call it: Authenticated Seller
Authentication: Supabase Auth
Authorization: Seller matching session
Purpose: Product catalog manager, inventory counts, stock statuses.
External APIs: None directly (calls /api/seller/products)
DB Tables Read: products, product_variants
DB Tables Written: None
Expected State Changes: None
Failure Modes: None
Current Status: WORKING

27. Route: /seller/products/new
Method: GET
File: app/seller/products/new/page.tsx
Who can call it: Authenticated Seller
Authentication: Supabase Auth
Authorization: Seller matching session
Purpose: Multi-category product creation studio (Physical, Digital Asset, Notion/Drive Vault, Tech Service, SaaS) with automated Gemini SEO.
External APIs: None directly (calls /api/seller/products, /api/ai/copilot)
DB Tables Read: None
DB Tables Written: products, product_variants, digital_assets, external_vault_links
Expected State Changes: Inserts new product.
Failure Modes: Gemini AI SEO falls back to deterministic due to model 404.
Current Status: WORKING

28. Route: /seller/services
Method: GET
File: app/seller/services/page.tsx
Who can call it: Authenticated Seller
Authentication: Supabase Auth
Authorization: Seller matching session
Purpose: Tech services manager: verified buyer contact reveal card, 7-day inspection countdown, deliverable submission form, buyer cheating dispute modal.
External APIs: None directly (calls /api/seller/services, /api/seller/services/[id]/deliver, /api/disputes)
DB Tables Read: orders, order_items, service_intakes, order_shipping_addresses
DB Tables Written: service_intakes (via deliver API), disputes (via dispute API)
Expected State Changes: Submits PR/notes and freezes escrow if disputed.
Failure Modes: None on frontend.
Current Status: WORKING

29. Route: /terms
Method: GET
File: app/terms/page.tsx
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Terms of Service, Escrow rules, 7-day warranty policies.
External APIs: None
DB Tables Read: None
DB Tables Written: None
Expected State Changes: None
Failure Modes: None
Current Status: WORKING (Static)
```

---

### API Routes (31 Route Handlers)

```text
1. Route: /api/account/orders
Method: GET
File: app/api/account/orders/route.ts
Who can call it: Any client (passes userId header or query param)
Authentication: None enforced (relies on passed userId)
Authorization: None (IDOR vulnerable)
Purpose: Retrieve orders and digital entitlements for user.
External APIs: None
DB Tables Read: orders, order_items, products, digital_entitlements (CRASH)
DB Tables Written: None
Expected State Changes: Returns user's order history.
Failure Modes: CRITICAL 500 ERROR: Table digital_entitlements does not exist in Supabase (actual table is entitlements).
Current Status: FAILING (500 on execution)

2. Route: /api/account/profile
Method: GET, PUT
File: app/api/account/profile/route.ts
Who can call it: Any client
Authentication: None (reads x-user-id or searchParams userId)
Authorization: None (Service role client bypasses all checks)
Purpose: GET: Fetch profile and user metadata. PUT: Update full name, username, bio, phone, shipping address.
External APIs: Supabase Auth Admin API
DB Tables Read: profiles, auth.users
DB Tables Written: profiles, auth.users
Expected State Changes: Updates user profile and metadata in Supabase.
Failure Modes: IDOR: Any caller can read or overwrite any user's personal details by passing arbitrary userId.
Current Status: WORKING WITH CRITICAL VULNERABILITY

3. Route: /api/account/services/[id]/approve
Method: POST
File: app/api/account/services/[id]/approve/route.ts
Who can call it: Authenticated Buyer
Authentication: Supabase Auth (supabase.auth.getUser())
Authorization: Must match order.buyer_id
Purpose: Buyer approves deliverable (releases escrow 85% net to seller) or requests revision under 7-day warranty.
External APIs: Razorpay Route Transfer (via EscrowStateMachine)
DB Tables Read: orders, order_items, service_intakes, seller_payout_accounts
DB Tables Written: service_intakes, order_items, ledger_entries, payouts
Expected State Changes: Approves: status="completed", escrow released. Revision: status="revision_requested".
Failure Modes: "request_revision" FAILS with DB check constraint violation (service_intakes_status_check).
Current Status: PARTIALLY WORKING (Approval works; revision fails)

4. Route: /api/admin/disputes
Method: GET
File: app/api/admin/disputes/route.ts
Who can call it: Authenticated Admin
Authentication: Supabase Auth (supabase.auth.getUser())
Authorization: profiles.role === 'admin'
Purpose: Fetch all open dispute dossiers enriched with buyer/seller profiles, orders, deliverables, and ledger entries.
External APIs: None
DB Tables Read: disputes, orders, order_shipping_addresses, order_items, products, profiles, service_intakes
DB Tables Written: None
Expected State Changes: Returns enriched disputes array.
Failure Modes: Returns 401 if admin logged in via /admin/login (which sets only localStorage and no Supabase session).
Current Status: WORKING IF AUTHENTICATED VIA SUPABASE

5. Route: /api/admin/disputes/[id]
Method: PATCH
File: app/api/admin/disputes/[id]/route.ts
Who can call it: Authenticated Admin
Authentication: Supabase Auth (supabase.auth.getUser())
Authorization: profiles.role === 'admin'
Purpose: Dispute Tribunal rulings: "seller_correct" (payout released), "buyer_correct" (full refund), "partial_settlement" (custom % split).
External APIs: Razorpay Route & Refund APIs (via EscrowStateMachine)
DB Tables Read: disputes, orders, order_items, seller_payout_accounts
DB Tables Written: disputes, ledger_entries, payouts, orders
Expected State Changes: Resolves dispute and triggers financial transfers.
Failure Modes: CRITICAL: All 3 branches attempt .update({ status: "resolved" }) on disputes table, which crashes with disputes_status_check violation! Also double-credits ledger on seller win.
Current Status: FAILING (Check constraint crash on status='resolved')

6. Route: /api/ai/copilot
Method: POST
File: app/api/ai/copilot/route.ts
Who can call it: Anyone
Authentication: None
Authorization: None
Purpose: AI product listing generator and seller assistant.
External APIs: Google Gemini Generative Language API
DB Tables Read: None
DB Tables Written: None
Expected State Changes: Returns AI generated title, description, tags, suggested price.
Failure Modes: All requested models (gemini-3.5-flash, gemini-3.8-flash, gemini-3.1-flash-lite, gemini-3.6-flash) do not exist. Calls fail with 404 and return hardcoded fallback.
Current Status: FAILING EXTERNAL CALL (Silently falls back to hardcoded text)

7. Route: /api/auth/login
Method: POST
File: app/api/auth/login/route.ts
Who can call it: Public
Authentication: Valid email & password
Authorization: None
Purpose: Sign in with password using anon Supabase client.
External APIs: Supabase Auth
DB Tables Read: auth.users, profiles
DB Tables Written: profiles (if missing, auto-creates)
Expected State Changes: Returns session and user object.
Failure Modes: Does not set HTTP-only session cookies; relies on client-side token management.
Current Status: WORKING

8. Route: /api/auth/register
Method: POST
File: app/api/auth/register/route.ts
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Register new user with auto-confirmed email and upsert public.profiles row.
External APIs: Supabase Auth Admin API
DB Tables Read: auth.users
DB Tables Written: auth.users, profiles
Expected State Changes: Creates auth user and profile.
Failure Modes: Hardcoded Supabase URL string on line 4 instead of solely using env.
Current Status: WORKING

9. Route: /api/checkout
Method: POST
File: app/api/checkout/route.ts
Who can call it: Authenticated Buyer
Authentication: Supabase Auth (supabase.auth.getUser())
Authorization: Logged-in buyer
Purpose: Execute atomic inventory reservation (RPC), compute multi-vendor splits (15% platform / 85% seller net), create order and Razorpay payment order.
External APIs: Razorpay Orders API (razorpay.createOrder)
DB Tables Read: auth.users, product_variants (via RPC)
DB Tables Written: inventory_reservations (via RPC), orders, order_shipping_addresses, order_items
Expected State Changes: Creates pending order with gateway_order_id.
Failure Modes: Multi-vendor shipping is only calculated for 1st seller. Reservation ID is not saved in order_items.
Current Status: WORKING

10. Route: /api/deals/[id]
Method: GET, PATCH
File: app/api/deals/[id]/route.ts
Who can call it: Buyer or Seller on deal
Authentication: GET: None; PATCH: Supabase Auth
Authorization: Must match buyer_id or seller_id
Purpose: GET: Retrieve deal room details with contact reveal post-payment. PATCH: Submit counter-offer, send anti-circumvention chat message, submit credentials, release escrow.
External APIs: Razorpay Route (via EscrowStateMachine)
DB Tables Read: deal_rooms, products, profiles, deal_transfers, deal_messages
DB Tables Written: deal_rooms, deal_messages, deal_transfers, ledger_entries, payouts
Expected State Changes: Moves deal state, transfers credentials, releases escrow.
Failure Modes: GET synthesizes fake contact strings (+91 9876543210, buyer@auraminator.in) instead of reading real user contact.
Current Status: WORKING WITH FAKE DATA CAVEAT

11. Route: /api/disputes
Method: GET, POST
File: app/api/disputes/route.ts
Who can call it: Authenticated Buyer or Seller
Authentication: Supabase Auth (supabase.auth.getUser())
Authorization: Caller must be order.buyer_id or match an item seller_id
Purpose: POST: Raise dispute on an order, immediately freeze escrow in ESCROW_DISPUTED_HOLD. GET: Fetch caller's disputes.
External APIs: None
DB Tables Read: orders, order_items, disputes
DB Tables Written: disputes, payouts (updates escrow_state to ESCROW_DISPUTED_HOLD)
Expected State Changes: Inserts dispute row, freezes payout.
Failure Modes: If order_item_id is null or missing, Postgres crashes with null value in column "order_item_id" violates not-null constraint.
Current Status: PARTIALLY WORKING (Fails if order_item_id omitted)

12. Route: /api/downloads/[entitlementId]
Method: GET
File: app/api/downloads/[entitlementId]/route.ts
Who can call it: Authenticated Buyer
Authentication: Supabase Auth (supabase.auth.getUser())
Authorization: Must match entitlements.buyer_id and status === 'active'
Purpose: Generate 15-minute Supabase Storage signed download URL or redirect to authenticated Notion/Drive vault link. Logs telemetry in download_events.
External APIs: Supabase Storage (digital-vaults bucket)
DB Tables Read: entitlements, products, digital_assets, external_vault_links
DB Tables Written: download_events, entitlements (increments download_count)
Expected State Changes: Increments download count, returns signed URL.
Failure Modes: Direct fallback returns non-existent https://assets.auraminator.in/vault/... if storage call errors.
Current Status: WORKING

13. Route: /api/jobs
Method: GET, POST
File: app/api/jobs/route.ts
Who can call it: GET: Public; POST: Anyone (Auth optional)
Authentication: None strictly required on POST
Authorization: None
Purpose: GET: Search and filter published jobs. POST: Create and immediately publish a job listing with Gemini AI SEO.
External APIs: Google Gemini API (via generateAutomatedSeo)
DB Tables Read: jobs
DB Tables Written: jobs
Expected State Changes: Inserts published job row.
Failure Modes: POST lacks authentication requirement; anyone can publish spam jobs with default poster ID demo-poster-uuid-0001.
Current Status: WORKING WITH SECURITY DEFECT

14. Route: /api/jobs/[id]/apply
Method: POST
File: app/api/jobs/[id]/apply/route.ts
Who can call it: Public candidate
Authentication: Optional (captures user.id if logged in)
Authorization: None
Purpose: Submit job application with candidate contact, resume URL, GitHub URL, portfolio, and cover note.
External APIs: None
DB Tables Read: None
DB Tables Written: job_applications
Expected State Changes: Inserts job application with status submitted.
Failure Modes: None
Current Status: WORKING

15. Route: /api/offers
Method: GET, POST
File: app/api/offers/route.ts
Who can call it: Authenticated Buyer / Seller
Authentication: Supabase Auth (getSession())
Authorization: Caller must be buyer or seller
Purpose: GET: List offers involving user. POST: Submit purchase offer on product.
External APIs: None
DB Tables Read: offers, products, profiles
DB Tables Written: NONE! POST constructs in-memory object and returns it without inserting into DB!
Expected State Changes: Supposed to insert offer.
Failure Modes: CRITICAL LOGIC BUG: POST does NOT execute supabase.from('offers').insert(). Offers disappear on page refresh.
Current Status: FAILING LOGIC (Zero persistence)

16. Route: /api/orders
Method: GET
File: app/api/orders/route.ts
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Query orders by sellerId, buyerId, or status.
External APIs: None
DB Tables Read: orders, order_items, products
DB Tables Written: None
Expected State Changes: Returns orders array.
Failure Modes: CRITICAL DATA LEAK: Completely unauthenticated. Calling /api/orders without parameters returns every order on the platform.
Current Status: WORKING WITH SEVERE DATA LEAK

17. Route: /api/orders/[id]/cancel
Method: POST
File: app/api/orders/[id]/cancel/route.ts
Who can call it: Buyer or Admin
Authentication: FLAGGED: If user is null, authorization check is skipped!
Authorization: Broken
Purpose: Zero-trust cancellation controller: checks digital access tokens, Shiprocket courier dispatch status, service intake status; halts Shiprocket van; blocks seller payout; triggers Razorpay refund.
External APIs: Shiprocket Cancel API (shiprocket.cancelOrder), Razorpay Refund API (razorpay.createRefund)
DB Tables Read: orders, order_items, entitlements, shipments, service_intakes
DB Tables Written: orders, order_items, entitlements, shipments, shipment_events, payouts, ledger_entries
Expected State Changes: Status="cancelled", payout="PAYOUT_BLOCKED", refund="REFUND_INITIATED".
Failure Modes: CRITICAL AUTH BYPASS: If no cookies/auth sent, if (user && user.id !== order.buyer_id) evaluates to false, allowing any unauthenticated caller to cancel any order!
Current Status: WORKING WITH CRITICAL SECURITY FLAW

18. Route: /api/products
Method: GET
File: app/api/products/route.ts
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Public catalog search and filter by category, keyword, seller.
External APIs: None
DB Tables Read: products, profiles, product_variants, digital_assets, external_vault_links
DB Tables Written: None
Expected State Changes: Returns published products.
Failure Modes: SENSITIVE DATA EXPOSURE: Line 15 selects external_vault_links(*) and digital_assets(*), exposing private Notion/Drive URLs to the unauthenticated public.
Current Status: WORKING WITH DATA EXPOSURE

19. Route: /api/products/[id]
Method: GET
File: app/api/products/[id]/route.ts
Who can call it: Public
Authentication: None
Authorization: None
Purpose: Fetch single product by UUID or slug.
External APIs: None
DB Tables Read: products, profiles, product_variants, digital_assets, external_vault_links
DB Tables Written: None
Expected State Changes: Returns product details.
Failure Modes: SENSITIVE DATA EXPOSURE: Line 19 selects external_vault_links(*) and digital_assets(*), exposing destination URLs before purchase.
Current Status: WORKING WITH DATA EXPOSURE

20. Route: /api/reviews
Method: POST
File: app/api/reviews/route.ts
Who can call it: Anyone (Auth optional)
Authentication: None enforced (defaults to demo-buyer-uuid-0001)
Authorization: None
Purpose: Submit product rating and review.
External APIs: None
DB Tables Read: None
DB Tables Written: reviews
Expected State Changes: Inserts review row.
Failure Modes: Line 25 hardcodes is_verified_purchase: true for any unauthenticated caller without checking if they actually purchased the product!
Current Status: WORKING WITH LOGIC DEFECT

21. Route: /api/seller/analytics
Method: GET
File: app/api/seller/analytics/route.ts
Who can call it: Authenticated Seller
Authentication: Supabase Auth (supabase.auth.getUser())
Authorization: Seller matching session
Purpose: Calculate live balances: pendingEscrow, availableBalance, totalLifetimeEarnings, totalOrders, activeDisputes, and return ledger rows.
External APIs: None
DB Tables Read: ledger_entries, products, deal_rooms
DB Tables Written: None
Expected State Changes: Returns aggregated financial analytics.
Failure Modes: Accounting bug: Cancelled orders are never reversed in ledger_entries, so pendingEscrow stays artificially inflated.
Current Status: WORKING WITH LEDGER RETENTION DEFECT

22. Route: /api/seller/import-by-url
Method: POST
File: app/api/seller/import-by-url/route.ts
Who can call it: Seller (Auth optional)
Authentication: Optional (defaults to demo-seller-uuid-0001)
Authorization: None
Purpose: Download digital asset from external URL and upload into Supabase Storage digital-vaults bucket.
External APIs: External HTTP fetch to user-provided URL
DB Tables Read: None
DB Tables Written: None (writes to Supabase Storage)
Expected State Changes: Uploads asset to sellers/{userId}/{uuid}.ext.
Failure Modes: SSRF: Blocks common private IPs via string matching, but does not resolve DNS to prevent DNS rebinding attacks.
Current Status: WORKING WITH SSRF RISK

23. Route: /api/seller/onboarding
Method: POST
File: app/api/seller/onboarding/route.ts
Who can call it: Authenticated User
Authentication: Supabase Auth (supabase.auth.getUser())
Authorization: Must match session user
Purpose: Submit seller KYC documents and bank details for automated Razorpay Route linked account creation.
External APIs: None directly
DB Tables Read: profiles
DB Tables Written: seller_onboarding, seller_payout_accounts, profiles (updates role to 'seller')
Expected State Changes: Inserts KYC row and pending payout account.
Failure Modes: None
Current Status: WORKING

24. Route: /api/seller/pickup-addresses
Method: GET, POST
File: app/api/seller/pickup-addresses/route.ts
Who can call it: Authenticated Seller
Authentication: Supabase Auth
Authorization: Seller matching session
Purpose: Register and fetch seller warehouse pickup address for Shiprocket logistics.
External APIs: None
DB Tables Read: storefronts (reads social_links.warehouse_pickup)
DB Tables Written: storefronts (writes to social_links.warehouse_pickup)
Expected State Changes: Saves address in storefronts JSONB.
Failure Modes: CRITICAL ARCHITECTURAL DISCONNECT: Does NOT write to seller_pickup_addresses table. When orders ship, logistics engine queries seller_pickup_addresses and finds nothing.
Current Status: FAILING TO INTEGRATE WITH LOGISTICS

25. Route: /api/seller/products
Method: GET, POST
File: app/api/seller/products/route.ts
Who can call it: GET: Authenticated Seller; POST: Anyone (Auth optional)
Authentication: POST defaults to seller-001 if unauthenticated
Authorization: None on POST
Purpose: GET: List seller's products with variant inventory counts. POST: Create product, variants, digital assets, or external vault links with automated Gemini AI SEO.
External APIs: Google Gemini API (via generateAutomatedSeo)
DB Tables Read: products, product_variants, digital_assets, external_vault_links
DB Tables Written: products, product_variants, digital_assets, external_vault_links
Expected State Changes: Inserts full product graph.
Failure Modes: POST defaults to seller-001 if unauthenticated, allowing guests to create products under seller-001.
Current Status: WORKING WITH AUTH DEFECT

26. Route: /api/seller/services
Method: GET
File: app/api/seller/services/route.ts
Who can call it: Authenticated Seller (via query param sellerId)
Authentication: None strictly verified
Authorization: None
Purpose: Fetch seller tech service orders with revealed buyer contact (name, phone, email, city), service intake deliverables, and 7-day warranty support state.
External APIs: None
DB Tables Read: orders, profiles, order_shipping_addresses, order_items, products, service_intakes
DB Tables Written: None
Expected State Changes: Returns service orders array.
Failure Modes: Synthesizes placeholder phone if shipping address phone is missing.
Current Status: WORKING

27. Route: /api/seller/services/[id]/deliver
Method: POST
File: app/api/seller/services/[id]/deliver/route.ts
Who can call it: Authenticated Seller
Authentication: Supabase Auth (supabase.auth.getUser())
Authorization: Seller must own an item on this order
Purpose: Attach proof of service work (GitHub PR URL, staging preview URL, handover notes), update status to deliverable_submitted, and start 7-day buyer warranty window.
External APIs: None
DB Tables Read: orders, order_items
DB Tables Written: service_intakes, order_items (updates fulfillment_status to 'delivered')
Expected State Changes: Updates service intake to deliverable_submitted.
Failure Modes: None
Current Status: WORKING

28. Route: /api/shipments
Method: POST
File: app/api/shipments/route.ts
Who can call it: System / Seller / Checkout
Authentication: None enforced
Authorization: None
Purpose: Automated multi-vendor dispatch engine: groups physical items by seller, resolves origin warehouse (seller_pickup_addresses), destination address (order_shipping_addresses), calls Shiprocket adhoc order & live AWB generation.
External APIs: Shiprocket API (shiprocket.createAdhocOrder)
DB Tables Read: orders, order_shipping_addresses, order_items, products, product_variants, shipments, seller_pickup_addresses
DB Tables Written: shipments, shipment_events
Expected State Changes: Creates shipment record with awb_code and tracking status created.
Failure Modes: Queries seller_pickup_addresses which is empty because /api/seller/pickup-addresses saved address into storefronts table instead. Always defaults to Okhla hub.
Current Status: WORKING WITH WAREHOUSE ADDRESS FALLBACK

29. Route: /api/shipping/calculate-rate
Method: POST
File: app/api/shipping/calculate-rate/route.ts
Who can call it: Public / Checkout
Authentication: None
Authorization: None
Purpose: Dynamic PIN-to-PIN shipping calculator: resolves seller origin PIN from seller_pickup_addresses (or default 110020), calls Shiprocket serviceability API, returns dynamic courier rate and ETD.
External APIs: Shiprocket Serviceability API (shiprocket.checkServiceabilityAndRate)
DB Tables Read: seller_pickup_addresses
DB Tables Written: None
Expected State Changes: Returns rate, courier name, and ETD days.
Failure Modes: Queries seller_pickup_addresses which is empty; uses default Okhla PIN 110020.
Current Status: WORKING WITH DEFAULT ORIGIN PIN

30. Route: /api/webhooks/payments
Method: POST
File: app/api/webhooks/payments/route.ts
Who can call it: Razorpay Webhook Service
Authentication: HMAC SHA-256 (x-razorpay-signature)
Authorization: Valid webhook signature
Purpose: Handle Razorpay payment and settlement lifecycle:
  - payment.captured: Credits double-entry escrow pending in ledger_entries, initializes payout record (ESCROW_PENDING), unlocks digital entitlements, commits inventory RPC, creates service intake vault.
  - transfer.processed / payout.processed: Confirms settlement, transitions payout to PAYOUT_COMPLETED, inserts debit_payout in ledger.
  - transfer.failed / payout.failed: Flags payout as PAYOUT_FAILED / MANUAL_REVIEW_REQUIRED.
External APIs: None
DB Tables Read: orders, webhook_events, payouts
DB Tables Written: webhook_events, orders, ledger_entries, payouts, entitlements, service_intakes
Expected State Changes: Unlocks orders, updates payouts and ledger.
Failure Modes: Line 115 passes p_reservation_id: item.id (order_items UUID) instead of the actual inventory reservation UUID to commit_inventory RPC.
Current Status: WORKING WITH INVENTORY COMMIT FLAW

31. Route: /api/webhooks/shiprocket
Method: POST
File: app/api/webhooks/shiprocket/route.ts
Who can call it: Shiprocket Webhook Service (or anyone — NO AUTH)
Authentication: NONE (No secret/token check)
Authorization: None
Purpose: Handle courier tracking updates:
  - DELIVERED: Verifies delivery PoD, authorizes escrow release via EscrowStateMachine.verifyDeliveryAndAuthorize, marks order items delivered.
  - RTO / Return: Immediately freezes escrow via EscrowStateMachine.freezeEscrow(..., 'ESCROW_FROZEN_RTO').
External APIs: Razorpay Route Transfer (via EscrowStateMachine)
DB Tables Read: shipments, shipment_events, orders, disputes, payouts, seller_payout_accounts
DB Tables Written: shipments, shipment_events, order_items, ledger_entries, payouts
Expected State Changes: Releases escrow on delivery; freezes escrow on RTO.
Failure Modes: NO AUTHENTICATION: Anyone can send fake webhook with { awb: "...", current_status: "DELIVERED" } and trigger payout release without verification! Also lines 22-28 query shipment_id = awb which never matches UUID.
Current Status: WORKING WITH SEVERE SPOOFING RISK
```

---

## SECTION 2: WEBHOOK FORENSIC AUDIT

### 2.1 Razorpay Webhook (`app/api/webhooks/payments/route.ts`)
- **Signature Verification**: Evaluates `crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex") === signature` whenever `RAZORPAY_WEBHOOK_SECRET` is set and not `"placeholder-webhook-secret"`. Returns 400 on mismatch.
- **Idempotency Execution**: Inserts into `webhook_events` (`provider_event_id`). Catches Postgres unique violation error `23505` and returns HTTP 200 `{ message: "Duplicate event acknowledged" }`.
- **Inventory Commit Defect (`payments/route.ts:L115`)**:
  ```typescript
  if (item.product_type === "physical" && item.variant_id) {
    await supabase.rpc("commit_inventory", { p_reservation_id: item.id });
  }
  ```
  `item.id` is the `order_items.id`, NOT the reservation UUID from `inventory_reservations`! The reservation is never marked `committed` in PostgreSQL!

### 2.2 Shiprocket Webhook (`app/api/webhooks/shiprocket/route.ts`)
- **Zero Authentication**: The endpoint accepts unauthenticated POST requests from any IP.
- **Broken Deduplication Query (`shiprocket/route.ts:L22-L28`)**:
  ```typescript
  const { data: existingEvent } = await supabase
    .from("shipment_events")
    .select("id")
    .eq("shipment_id", awb)
    .eq("status", current_status?.toLowerCase().replace(/\s/g, "_") || "unknown")
    .limit(1)
    .single();
  ```
  `shipment_events.shipment_id` is a UUID pointing to `shipments.id`, not the string AWB code. Furthermore, the code never checks `if (existingEvent) return;`. It re-executes every time!

---

## SECTION 3: COMPLETE ESCROW FINITE STATE MACHINE (FSM) AUDIT

### Complete ASCII State Transition Graph

```text
               [ BUYER PAYMENT CAPTURED ]
                           │
                           ▼
                   ┌────────────────┐
                   │ ESCROW_PENDING │◄──────────────────────┐
                   └───────┬────────┘                       │
                           │                                │
         ┌─────────────────┼──────────────────┐             │
         │ (PoD Verified   │ (Buyer           │ (Active     │
         │  or Auto-Timer) │  Cancels)        │  Dispute)   │
         ▼                 ▼                  ▼             │
┌──────────────────┐ ┌───────────────┐ ┌────────────────────┤
│DELIVERY_VERIFIED │ │BUYER_CANCELLED│ │ESCROW_DISPUTED_HOLD│
└────────┬─────────┘ └───────┬───────┘ └────────┬───────────┘
         │                   │                  │
         ▼                   ▼                  │ (Admin Tribunal Rulings)
┌────────────────────┐ ┌───────────────┐        ├────────────────────────┐
│AVAILABLE_FOR_PAYOUT│ │PAYOUT_BLOCKED │        ▼                        ▼
└────────┬───────────┘ └───────┬───────┘ ┌─────────────┐       ┌─────────────────┐
         │ (Route API)         │         │Seller Win   │       │Buyer Win        │
         ▼                     ▼         │(Release Net)│       │(Full Refund)    │
┌─────────────────┐   ┌────────────────┐ └──────┬──────┘       └────────┬────────┘
│PAYOUT_INITIATED │   │REFUND_INITIATED│        │                       │
└────────┬────────┘   └────────┬───────┘        │                       │
         │                     │                ▼                       ▼
   ┌─────┴─────┐         ┌─────┴─────┐    ┌───────────┐         ┌───────────────┐
   │           │         │           │    │PAYOUT_    │         │REFUND_        │
   ▼           ▼         ▼           ▼    │INITIATED  │         │INITIATED      │
┌─────────┐ ┌───────┐ ┌─────────┐ ┌──────┐└───────────┘         └───────────────┘
│ PAYOUT_ │ │PAYOUT_│ │ REFUND_ │ │REFUND│
│COMPLETED│ │FAILED │ │COMPLETED│ │FAILED│
└─────────┘ └───┬───┘ └─────────┘ └───┬──┘
                │                     │
                ▼                     ▼
        ┌────────────────────────────────┐
        │     MANUAL_REVIEW_REQUIRED     │
        │(Dead code: no admin UI/endpoint│
        └────────────────────────────────┘
```

---

## SECTION 4: PHYSICAL PRODUCT COMPLETE FLOW & MULTI-VENDOR ISOLATION

- Multi-vendor checkout calculates shipping fee ONLY for the first seller's item.
- Subsequent sellers' shipping costs are not charged to buyer, resulting in platform absorption.
- Individual shipments and AWBs are properly generated per seller on dispatch.

---

## SECTION 5: ADDRESS ROUTING AUDIT

```text
[ Seller Studio: /seller/onboarding or /seller/pickup-addresses ]
                       │
                       ▼
       POST /api/seller/pickup-addresses
                       │
                       ▼
    Writes to: public.storefronts.social_links.warehouse_pickup  ◄─── ORPHANED!
                                                                      (Never synced)
──────────────────────────────────────────────────────────────────────────────────
[ Logistics Engine: /api/shipments & /api/shipping/calculate-rate ]
                       │
                       ▼
         Queries: public.seller_pickup_addresses  ◄─── ALWAYS EMPTY!
                       │
                       ▼ (No rows returned)
         HARDCODED FALLBACK:
         PIN: "110020"
         City: "New Delhi"
         Nickname: "Kaizen Central Logistics Hub"
```

---

## SECTION 6: CHECKOUT & FEE DISTRIBUTION AUDIT

Let:
- $\text{Items Subtotal } S = \sum (\text{unitPrice} \times \text{quantity})$
- $\text{Platform Cut} = 15\%$
- $\text{Seller Net} = 85\%$
- $\text{Discount (AURA10)} = D = \lfloor 0.10 \times S \rfloor$
- $\text{Shipping Fee} = F_{\text{ship}} = \text{₹149 (physical) or ₹0 (digital/service)}$
- $\text{Gateway Fee} = F_{\text{gw}} = \text{round}((\max(0, S - D) + F_{\text{ship}}) \times 0.0236)$
- $\text{Total Gross Charged} = T_{\text{gross}} = \max(0, S - D) + F_{\text{ship}} + F_{\text{gw}}$

**Reconciliation Verdict:** The math is 100% exact. The seller receives exactly 85% of base price. The buyer covers 100% of shipping and gateway fees. If `AURA10` is used, the platform absorbs the discount from its 15% cut, leaving the seller's 85% net untouched.

---

## SECTION 7: BUYER CANCELLATION AUDIT

### The Critical Auth Bypass (`app/api/orders/[id]/cancel/route.ts:L41-L54`)
```typescript
// 2. Server-side Authorization Check
// If authenticated, ensure caller is the actual buyer or platform admin
if (user && user.id !== order.buyer_id) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "UNAUTHORIZED: You do not have permission to cancel this order." },
      { status: 403 }
    );
  }
}
```
If `user` is `null`, `(user && ...)` evaluates to `false`. The entire block is skipped! Any unauthenticated user can cancel any order and trigger a full refund via Razorpay.

---

## SECTION 8: REFUND FORENSIC AUDIT

1. **Amount Refunded**: `EscrowStateMachine.processRefundToBuyer` refunds `Number(order.total_amount)` in paise (`Math.round(amount * 100)`).
2. **Double-Entry Ledger Defect**: The refund inserts a `debit_refund` with `seller_id: buyerId`. It does NOT reverse the seller's original `credit_escrow`. The seller's analytics dashboard permanently shows the cancelled money in `pendingEscrow`.
3. **Dead Code**: `retryRefund` and `resolveFailedRefundManually` in `lib/escrow-engine.ts` have no API routes or UI buttons.

---

## SECTION 9: RAZORPAY ROUTE AUDIT

1. **Split Timing**: Transfers to sellers are NOT created at checkout. They are authorized only when `EscrowStateMachine.verifyDeliveryAndAuthorize` runs upon delivery scan or service approval.
2. **Linked Account**: Resolved from `seller_payout_accounts.gateway_account_id`.
3. **Simulation Mode**: If `RAZORPAY_KEY_ID === "rzp_test_placeholder"`, mock transfer objects (`trf_mock_...`) are returned.

---

## SECTION 10: HIGH-TICKET SAAS & TECH SERVICE AUDIT

1. **Anti-Circumvention Filter (`lib/anti-circumvention.ts`)**: 246 lines of regex patterns detecting emails, phone numbers, WhatsApp (`wa.me`), UPI, and transliterated number words.
2. **Contact Reveal**: Masked pre-payment; revealed post-deposit.
3. **Data Defect (`deals/[id]/route.ts:L40-L50`)**: Phone numbers are hardcoded strings:
   `phone: "+91 9876543210 (Verified at Escrow Deposit)"`
   `phone: "+91 9811002233 (Verified Seller Studio)"`
4. **Warranty Window**: Set to 168 hours (7 Days).

---

## SECTION 11: SELLER-INITIATED DISPUTE AUDIT

### Check Constraint Crash in Admin Dispute Tribunal (`app/api/admin/disputes/[id]/route.ts:L77,L101,L133`)
```typescript
await supabase.from("disputes").update({ status: "resolved" }).eq("id", disputeId);
```
In Supabase:
`check (status in ('opened', 'seller_pending', 'under_review', 'resolved_refunded', 'resolved_rejected'))`  
`"resolved"` is rejected by Postgres with `violates check constraint "disputes_status_check"`. Admin rulings crash with HTTP 500.

---

## SECTION 12: DIGITAL ASSET AUDIT

1. **Entitlement Generation**: `payments/route.ts` inserts into `public.entitlements`.
2. **Table Mismatch Crash (`app/api/account/orders/route.ts:L22`)**:
   `.from("digital_entitlements")`  
   Table `digital_entitlements` does not exist in Supabase (real table is `entitlements`). Logged-in users visiting `/account` crash with 500.
3. **Pre-Purchase Data Leak (`app/api/products/route.ts:L15`)**: Public queries select `external_vault_links(*)`, leaking Notion/Drive destination URLs before purchase.

---

## SECTION 13: IDEMPOTENCY AUDIT

- **Razorpay Webhooks**: Idempotent via `webhook_events.provider_event_id` (code 23505 catches duplicate).
- **Shiprocket Webhooks**: Not idempotent; queries `shipment_id = awb` (UUID vs string mismatch) and never checks returned row.
- **Payouts**: Idempotent via `payout_${orderId}_${sellerId}` on conflict.

---

## SECTION 14: RACE CONDITION AUDIT

- **Double Checkout**: Prevented by `reserve_inventory` PostgreSQL RPC using `select ... for update`.
- **Cancel vs Delivery**: Strict state checks in `EscrowStateMachine` prevent double payouts or invalid refunds.

---

## SECTION 15: DATABASE AUDIT

| Table | Physical Existence | Code vs Reality Discrepancy |
| :--- | :--- | :--- |
| `disputes` | **EXISTS** | Constraint rejects `status = 'resolved'`. `order_item_id` is NOT NULL (crashes if null). |
| `entitlements` | **EXISTS** | Code in `/api/account/orders` queries non-existent `digital_entitlements`. |
| `digital_entitlements` | **DOES NOT EXIST** | Causes HTTP 500 crash in `/api/account/orders`. |
| `service_intakes` | **EXISTS** | Constraint rejects `status = 'revision_requested'`. |
| `seller_pickup_addresses` | **EXISTS** | Table is empty because onboarding writes to `storefronts` JSONB instead. |
| `offers` | **EXISTS** | POST `/api/offers` never inserts into the table! |

---

## SECTION 16: SECURITY AUDIT

1. **CVE-1: Cancel Auth Bypass (`app/api/orders/[id]/cancel/route.ts:L41`)**: Unauthenticated callers can cancel any order.
2. **CVE-2: Hardcoded Admin Password (`app/admin/login/page.tsx:L32-L34`)**: Admin password `469087383207` hardcoded in client bundle.
3. **CVE-3: Profile IDOR (`app/api/account/profile/route.ts:L9,L57`)**: Unauthenticated callers can read or overwrite any user's profile.
4. **CVE-4: Pre-Purchase Vault Link Leak (`app/api/products/route.ts:L15`)**: Destination URLs exposed publicly.
5. **CVE-5: Unauthenticated Shiprocket Webhook (`app/api/webhooks/shiprocket/route.ts`)**: Anyone can spoof delivery scans.
6. **CVE-6: RLS Bypass (`lib/supabase/server.ts:L7`)**: `createServerSupabase` uses `SUPABASE_SERVICE_ROLE_KEY`.

---

## SECTION 17: EXTERNAL API AUDIT

- **Razorpay**: Functional in simulation mode; executes HTTP POST when live keys are provided.
- **Shiprocket**: Functional in simulation mode; executes HTTP POST when live keys are provided.
- **Google Gemini**: Key present, but all calls fail with HTTP 404 because requested models (`gemini-3.6-flash`, `gemini-3.5-flash`) do not exist in the Gemini API.

---

## SECTION 18: ERROR MATRIX

| Scenario | Expected Behavior | Current Behavior | Result |
| :--- | :--- | :--- | :--- |
| View orders on `/account` | Show orders and library | HTTP 500 (table missing) | **FAIL** |
| Unauthenticated cancel | Return 401 | Cancels order & refunds | **FAIL** |
| Admin resolves dispute | Update dispute & release | HTTP 500 (constraint violation) | **FAIL** |
| Buyer requests revision | Set `revision_requested` | HTTP 500 (constraint violation) | **FAIL** |
| Register pickup address | Save to `seller_pickup_addresses` | Saves to `storefronts` | **FAIL** |
| Create shipment | Read seller warehouse PIN | Falls back to Delhi 110020 | **FAIL** |
| Browse digital product | Hide vault links | Returns raw Notion/Drive URLs | **FAIL** |
| Gemini AI SEO | Return live Gemini copy | 404 Model Not Found | **FAIL** |
| Submit deal offer | Persist in `offers` | Kept in memory; lost on refresh | **FAIL** |
| Concurrent checkout | Exactly 1 succeeds, 2nd gets 409 | 1 succeeds, 2nd gets 409 | **PASS** |

---

## SECTION 19: TEST CASE MATRIX

| Test ID | Flow | Command / Route | Actual Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | TypeScript Type Check | `npx tsc --noEmit` | Exit code 0. Zero errors. | **PASS** |
| **TC-02** | Production Build | `npm run build` | 53 static + 31 dynamic built. | **PASS** |
| **TC-03** | Linter | `npm run lint` | Exits 1 (no .eslintrc config). | **FAIL** |
| **TC-04** | User Registration | `POST /api/auth/register` | User created; profile upserted. | **PASS** |
| **TC-05** | User Login | `POST /api/auth/login` | Session returned; user verified. | **PASS** |
| **TC-06** | Profile IDOR | `GET /api/account/profile?userId=xxx` | Returns target user private data. | **FAIL** |
| **TC-07** | Concurrency Lock | `reserve_inventory` RPC | Serialized via `for update`. | **PASS** |
| **TC-08** | Order Checkout | `POST /api/checkout` | Order created; 15/85 split exact. | **PASS** |
| **TC-09** | Payment Capture | `POST /api/webhooks/payments` | Ledger credited; payout pending. | **PASS** |
| **TC-10** | Unauthenticated Cancel| `POST /api/orders/[id]/cancel` | Cancels without authentication! | **FAIL** |
| **TC-11** | Delivery Scan PoD | `POST /api/webhooks/shiprocket` | Delivery verified; payout fired. | **PASS** |
| **TC-12** | RTO Scan Freeze | `POST /api/webhooks/shiprocket` | Payout frozen in `ESCROW_FROZEN_RTO`.| **PASS** |
| **TC-13** | Deliverable Submit | `POST /api/seller/services/[id]/deliver` | Proof attached; window started. | **PASS** |
| **TC-14** | Buyer Approval | `POST /api/account/services/[id]/approve` | Deliverable approved; net released. | **PASS** |
| **TC-15** | Buyer Revision | `POST /api/account/services/[id]/approve` | Check constraint crash! | **FAIL** |
| **TC-16** | Seller Dispute | `POST /api/disputes` | Payout frozen in hold. | **PASS** |
| **TC-17** | Admin Ruling | `PATCH /api/admin/disputes/[id]` | Check constraint crash! | **FAIL** |
| **TC-18** | Signed Download URL | `GET /api/downloads/[id]` | Signed URL generated; count logged. | **PASS** |
| **TC-19** | Account Orders | `GET /api/account/orders` | 500 error: table missing! | **FAIL** |
| **TC-20** | Gemini AI SEO | `generateAutomatedSeo` | 404 from Google API; fallback used. | **FAIL** |

---

## SECTION 20: CODE-LEVEL ERROR AUDIT

117 occurrences of `mock`, `demo`, `todo`, `placeholder` identified across 32 files.
- `app/admin/login/page.tsx`: Hardcoded root admin credentials.
- `app/api/deals/[id]/route.ts`: Hardcoded phone numbers (`+91 9876543210`, `+91 9811002233`).
- `app/api/seller/products/route.ts:L11`: Defaults to `seller-001` if unauthenticated.
- `app/api/jobs/route.ts:L82`: Defaults to `demo-poster-uuid-0001` if unauthenticated.
- `app/api/reviews/route.ts:L8`: Defaults to `demo-buyer-uuid-0001` if unauthenticated.
- `lib/mock-data.ts`: Orphaned file with empty arrays.
- `lib/r2.ts`: Orphaned Cloudflare R2 client.

---

## SECTION 21: BUILD / TYPE / LINT AUDIT

- `npx tsc --noEmit`: **0 errors (Exit 0)**
- `npm run build`: **Compiled successfully (Exit 0)** (53 pages, 31 routes)
- `npm run lint`: **Failed (Exit 1)** (Prompted for setup; missing configuration)

---

## SECTION 22: ENVIRONMENT AUDIT

- `NEXT_PUBLIC_SITE_URL`: Set
- `NEXT_PUBLIC_SUPABASE_URL`: Set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Active JWT
- `SUPABASE_SERVICE_ROLE_KEY`: Active JWT (Server-only)
- `RAZORPAY_KEY_ID`: Placeholder (`rzp_test_placeholder`)
- `RAZORPAY_KEY_SECRET`: Placeholder
- `RAZORPAY_WEBHOOK_SECRET`: Placeholder
- `SHIPROCKET_EMAIL`: Set
- `SHIPROCKET_PASSWORD`: Placeholder
- `GEMINI_API_KEY`: Active Google Key present (Models need update)
- `R2_*`: Placeholders (Unused)

---

## SECTION 23: FINAL BUSINESS-LOGIC RECONCILIATION

1. Multi-vendor escrow hold: **IMPLEMENTED**
2. 15% platform / 85% seller split: **IMPLEMENTED**
3. Dynamic Shiprocket shipping rate: **PARTIALLY IMPLEMENTED** (1st seller only; address orphaned)
4. Buyer pays shipping fee: **IMPLEMENTED**
5. Buyer pays 2.36% gateway fee: **IMPLEMENTED**
6. Zero shipping on digital/service: **IMPLEMENTED**
7. Digital token issuance on payment: **IMPLEMENTED**
8. Digital cancel blocked if accessed: **IMPLEMENTED**
9. Physical cancel before courier pickup: **IMPLEMENTED**
10. Physical cancel blocked after pickup: **IMPLEMENTED**
11. Service cancel blocked once started: **IMPLEMENTED**
12. Shiprocket van halted on cancel: **IMPLEMENTED**
13. Razorpay refund on cancellation: **IMPLEMENTED**
14. Courier delivery PoD releases escrow: **IMPLEMENTED**
15. Courier RTO freezes escrow payout: **IMPLEMENTED**
16. Anti-circumvention filter: **IMPLEMENTED**
17. Post-deposit contact reveal: **PARTIALLY IMPLEMENTED** (Uses fake strings)
18. Seller proof attachment: **IMPLEMENTED**
19. 7-Day warranty inspection window: **IMPLEMENTED**
20. Buyer deliverable approval releases net: **IMPLEMENTED**
21. Buyer revision request under 7-day warranty: **INCORRECT / FAILING** (Check constraint crash)
22. Seller dispute ("buyer cheating"): **IMPLEMENTED**
23. Admin Mission Control dispute tribunal: **INCORRECT / FAILING** (Check constraint crash)
24. Refund failure retry & UTR settlement: **NOT IMPLEMENTED** (Dead code in class)

---

## SECTION 24: FINAL VERDICT & ACTIONABLE REMEDIATION PLAN

### System Health Ratings:
- **Build & TypeScript:** `10/10`
- **Database Schema Cohesion:** `4/10`
- **Financial & Escrow FSM:** `7/10`
- **Security & Authorization:** `2/10`
- **External Integration Resilience:** `5/10`

### Overall Status: **NOT PRODUCTION READY**

### Mandatory Remediation Steps:
1. **Fix Cancel Authorization**: In `app/api/orders/[id]/cancel/route.ts`, enforce `if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });`.
2. **Remove Hardcoded Admin Credentials**: Replace client-side check in `app/admin/login/page.tsx` with Supabase server-side session check (`profiles.role === 'admin'`).
3. **Fix Database Constraints**:
   - In `app/api/admin/disputes/[id]/route.ts`, change `.update({ status: "resolved" })` to valid statuses (`resolved_refunded`, `resolved_rejected`) or update PostgreSQL check constraint.
   - In `app/api/account/services/[id]/approve/route.ts`, align `service_intakes` check constraint with `revision_requested`.
4. **Fix Table Query in Orders**: In `app/api/account/orders/route.ts:L22`, replace `digital_entitlements` with `entitlements`.
5. **Bridge Pickup Addresses**: Update `app/api/seller/pickup-addresses/route.ts` to write directly to `public.seller_pickup_addresses`.
6. **Correct Gemini AI Model Identifiers**: Replace `gemini-3.6-flash` and `gemini-3.5-flash` with `gemini-2.5-flash` in `lib/gemini-seo.ts` and `app/api/ai/copilot/route.ts`.
7. **Secure Product Vault Links**: In `app/api/products/route.ts` and `app/api/products/[id]/route.ts`, strip `external_vault_links` from public GET responses.
8. **Fix Profile IDOR**: Verify caller session matches target `userId` in `app/api/account/profile/route.ts`.
9. **Expose Refund Retry & Manual Settlement**: Create dedicated admin endpoints calling `EscrowStateMachine.retryRefund` and `resolveFailedRefundManually`.
