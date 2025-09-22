SEO & CSR Fixes — TODO

Status: in_progress

Goal
Make the front-end build stable for production while keeping the app SEO-friendly. Fix CSR-only hooks (useSearchParams / next/navigation / react-router hooks) usage inside Server Components, and adopt a pattern that preserves server-rendered content for SEO-critical pages.

Tasks (high level)
1) Audit codebase for client-only hooks (useSearchParams from next/navigation and react-router-dom) — IN PROGRESS (found and converted several files)
2) For each file using client-only hooks:
   - If the component is purely interactive UI and not SEO-critical, add "use client" and keep it client-only. — APPLIED to Catalog, SubcategoryNavigation
   - If the component must be server-rendered for SEO, refactor to split: Server wrapper renders static content and a small Client component handles interactivity. — PLANNED for Product pages
3) Ensure checkout success/cancel pages are client components (they use Stripe and client hooks) — DONE
4) Update Catalog to server-rendered for SEO while keeping client controls (filters/pagination) — PENDING
5) Add metadata (title, description, canonical, open graph) to top-level layouts and per-page metadata for product/category pages — PARTIAL (root metadata present)
6) Add JSON-LD for Product schema on product pages — IN_PROGRESS (JSON-LD injected in ProductDetail client view)
7) Generate sitemap.xml and robots.txt (static or dynamic) — DONE (sitemap.ts and robots.ts present)
8) Optimize images and lazy-load non-critical widgets — PENDING

Concrete actions taken so far
- Created this todos file and docs entry describing the plan — DONE
- Scanned for useSearchParams and converted SubcategoryNavigation and Catalog to client components — DONE
- Created ClientSuccess/ClientCancel for checkout pages and converted pages to client components — DONE
- Injected JSON-LD schema into ProductDetail component (client-side injection) — IN_PROGRESS
- Verified sitemap.ts and robots.ts present — DONE

Next actions (to be executed now)
- Refactor product page to expose server-side metadata (generateMetadata) by converting page to Server Component and rendering ProductDetail as a client component. This allows server-rendered title/description/OG tags for SEO while keeping interactivity.
- Implement server-side fetch for product data during metadata generation using the public API or reading from available data store.
- After metadata change, run full build and check prerender errors.

If you approve, I will implement product page metadata and refactor page to server component now.
