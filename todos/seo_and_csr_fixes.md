SEO & CSR Fixes — TODO

Status: in_progress

Goal
Make the front-end build stable for production while keeping the app SEO-friendly. Fix CSR-only hooks (useSearchParams / next/navigation / react-router hooks) usage inside Server Components, and adopt a pattern that preserves server-rendered content for SEO-critical pages.

Tasks (high level)
1) Audit codebase for client-only hooks (useSearchParams from next/navigation and react-router-dom) — IN PROGRESS
2) For each file using client-only hooks:
   - If the component is purely interactive UI and not SEO-critical, add "use client" and keep it client-only.
   - If the component must be server-rendered for SEO, refactor to split: Server wrapper renders static content and a small Client component handles interactivity.
3) Ensure checkout success/cancel pages are client components (they use Stripe and client hooks) — DONE for success/cancel pages (ClientSuccess/ClientCancel created).
4) Update catalog/category/product pages to maintain server-rendered SEO content where possible and move only interactive pieces to client components — PARTIAL (catalog converted to client to fix build; future work: split server/client for better SEO).
5) Add metadata (title, description, canonical, open graph) to top-level layouts and per-page metadata for product/category pages — PENDING
6) Add JSON-LD for Product schema on product pages — PENDING
7) Generate sitemap.xml and robots.txt (static or dynamic) — PENDING
8) Minimize client-side bundle by lazy-loading non-critical widgets and images (loading="lazy") — PENDING

Concrete steps I will perform now (and mark as completed when done):
- Create this todos file and docs entry describing the plan — DONE
- Scan front/src for useSearchParams occurrences and convert offending files to client components where safe — IN_PROGRESS
- Update SubcategoryNavigation and Catalog components to be client components (temporary fix to unblock build) — IN_PROGRESS

How I will report progress
- I will update this file after each change with what files were modified and whether the task is completed.

Next immediate action (executing now)
- Convert SubcategoryNavigation.tsx and Catalog.tsx to client components so they no longer cause CSR bailout during Next.js build. Then re-run build in CI (you will run locally) and report results.

If you want stricter SEO (server-rendered catalog pages), I will later refactor Catalog into a Server Component that renders initial product listing and mount a smaller client component for filters/pagination. This is a larger change and will be scheduled after the immediate fixes succeed.
