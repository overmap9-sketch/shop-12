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

Update — 2025-09-22
Reviewed: front/README.md, server/README.md, docs/seo_and_csr_implementation.md, front/src/app/layout.tsx, robots.ts, sitemap.ts.
Findings:
- metadataBase and robots sitemap currently use https://example.com; should derive from PUBLIC_ORIGIN for correct canonical/sitemap in all envs.
- ProductDetail injects canonical on the client. Prefer server-side canonical and JSON-LD via generateMetadata on product page.
- Sitemap already reads server/data/products.json; keep silent failure but prefer env-based base URL.
- A11y: broad usage of aria- attributes across UI is good; continue audit as components evolve.
- Performance: ensure images have width/height and loading="lazy"; consider next/image later; add skeletons for product grids; prioritize LCP hero image on home.

Planned actions (next steps):
1) Use PUBLIC_ORIGIN in app layout metadataBase and robots sitemap; keep alternates canonical relative to metadataBase.
2) Move product JSON-LD + canonical fully into product/[id]/page.tsx generateMetadata (server-side) and remove client-side canonical injection.
3) Refactor Catalog to server-render initial list and move controls (filters/sort/pagination) to a small client component; support query params for shareable URLs.
4) Add image lazy-loading and skeletons to ProductCard/ProductGrid; audit CLS with fixed dimensions.
5) Add preconnect/preload for critical assets (e.g., fonts, hero image) to improve LCP on landing.

Next immediate action (queued)
- Run a full next build, capture any prerender/CSR bailout warnings, and scan for server usage of client-only APIs; then implement item (1) above.

Update — 2025-09-22
- front/.env.example updated with PUBLIC_ORIGIN, PORT, and detailed comments; documented in front/README.md.
- server/.env.example enhanced with comments and keys; documented in server/README.md.
- front metadataBase and robots sitemap now derive from PUBLIC_ORIGIN to ensure correct canonical/sitemap in all environments.
- Product page: moved canonical and JSON-LD to server-side. Implemented server-rendered Product JSON-LD via page component; removed client canonical mutation.
- Improved CLS/LCP: ProductCard images use decoding="async"; ProductDetail main image uses fetchpriority="high" and eager loading; thumbnails lazy-load.
- Sitemap: more robust product loading (tries ../server/data and server/data).

