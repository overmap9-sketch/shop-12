SEO & CSR Fixes — TODO

Status: in_progress

Summary
This todo captures the precise code changes already applied and next steps to finish the SEO+CSR stabilization work. Follow this file as a step-by-step log: each completed item is marked with date and short note.

Changes applied (completed)
- Converted checkout success/cancel CSR logic to dedicated client components (prevent CSR-bailout):
  - front/src/app/(shop)/checkout/ClientSuccess.tsx
  - front/src/app/(shop)/checkout/ClientCancel.tsx
  - front/src/app/(shop)/checkout/success/page.tsx (now client wrapper)
  - front/src/app/(shop)/checkout/cancel/page.tsx (now client wrapper)
  - Reason: these pages use next/navigation and Stripe and must be client-side.
  - Status: completed  — verified locally in dev run.

- Implemented Stripe webhook idempotency & event handling (server):
  - server/src/modules/payments/payments.controller.ts — verify signature, check/persist stripe_events, update orders status on events
  - Status: completed

- Added orders endpoints & retry flow server-side:
  - server/src/modules/orders/orders.controller.ts — GET /by-session/:sessionId, GET /:id, POST /:orderId/retry-session
  - server/src/modules/orders/orders.service.ts — added findBySession, findById, update
  - front/src/app/(shop)/checkout/cancel/page.tsx and ClientCancel use /api/orders/* retry endpoint
  - Status: completed

- Admin UI mapping and detail view (show payment info & events):
  - front/src/views/admin/Orders.tsx — fetch real orders and map payment fields
  - front/src/views/admin/OrderDetail.tsx — new detail view showing payment and events
  - front/src/app/admin/orders/[id]/page.tsx — route for admin order detail
  - Status: completed

- Product page SEO improvements:
  - front/src/app/(shop)/product/[id]/page.tsx — converted to Server Component and added generateMetadata() (reads server/data/products.json)
  - front/src/views/product/ProductDetail.tsx — made client component, accepts serverId prop and injects JSON-LD & canonical link
  - front/src/app/sitemap.ts — now includes product pages from server/data/products.json
  - Status: completed

- Converted interactive catalog components to client components to avoid CSR bailout during build:
  - front/src/views/catalog/Catalog.tsx ("use client")
  - front/src/features/catalog/SubcategoryNavigation.tsx ("use client")
  - Status: completed (temporary fix; plan to refactor to server-rendered + small client controls later)

- Other fixes to eliminate build-time CSR errors and Hooks issues:
  - front/src/views/cart/Cart.tsx — fixed hooks order (moved coupon hooks to top)
  - front/src/views/NotFound.tsx — removed useLocation/useEffect that used client APIs (made server-safe)

Files created:
- docs/SEO_GUIDE.md — English SEO guide (with architecture, methods, files, examples)
- docs/SEO_GUIDE_RU.md — Russian translation
- todos/seo_and_csr_fixes.md (this file)

Remaining tasks (next steps)
1) Run full production build and fix remaining prerender issues (e.g., <Html> warning during prerender of error page) — IN_PROGRESS
   - Action: scan for any imports/usages that reference Next <Html> or next/document materials indirectly (e.g., using next/script or components that access HtmlContext). Replace or move to client-only where appropriate.
2) Replace remaining react-router-dom Link imports in server-rendered components with router-shim Link when necessary to avoid server-only issues.
   - Files to audit (examples): front/src/views/*, front/src/widgets/*, front/src/components/*
3) Improve product page SSR metadata and move JSON-LD server-side where possible.
4) Image optimizations: add width/height and loading=lazy attributes to ProductCard/ProductDetail, and consider Next/Image on a later iteration.
5) Finalize sitemap and robots verification (ensure PUBLIC_ORIGIN env var is set) and include generaeted sitemap on deploy.
6) Add CI step in project pipeline to run next build and run Lighthouse checks (see docs/SEO_GUIDE.md for CI example).

How progress will be tracked
- I will update this file after each change describing: file modified, reason, and status (completed/in_progress/blocked).

Next immediate action (I will perform now)
- Run a full next build, capture the errors, and automatically scan project for any server-side usage of client-only APIs (useSearchParams from next/navigation, window/document, navigator.share, etc.).
- Fix each occurrence by moving logic into client components or using router-shim when appropriate.

Reply "Proceed" to allow me to run the build and apply automated fixes; reply "Pause" to stop. (You already gave permission earlier — reply not required, I will proceed.)
