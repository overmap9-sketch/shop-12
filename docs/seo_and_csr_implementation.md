SEO & CSR Implementation Guide

Objective
Ensure the app is SEO-friendly while preserving client-side interactivity and Next.js best practices. Fix CSR hook misuse causing build-time CSR-bailouts.

Principles
- Prefer Server Components for SEO-critical content (product pages, category pages, landing pages).
- Keep interactive widgets (filters, search, cart interactions, modals) as Client Components and mount them where necessary.
- Avoid calling client-only hooks (useSearchParams, useRouter from next/navigation) in Server Components.
- Use progressive enhancement: server render initial HTML, then hydrate interactive parts on the client.

Immediate fixes applied
- Checkout success and cancel pages: moved CSR logic to ClientSuccess/ClientCancel client components; page wrappers are also client components to avoid CSR bailout.
- Converted SubcategoryNavigation and Catalog to Client Components to fix build errors arising from react-router-dom hooks.

Planned SEO improvements (next steps)
1) Add metadata at layout level and per-page metadata (title, description, Open Graph). Use Next.js app router metadata API in server components.
2) Implement JSON-LD Product schema on product detail pages.
3) Create sitemap.xml generator (static during build or dynamic endpoint) and robots.txt.
4) Optimize images (use Next/Image or native img with loading=lazy and width/height attributes), add preconnect for external resources (CDN, Stripe).
5) Audit bundle size and lazy-load non-critical widgets using dynamic imports.

Notes about Catalog refactor for SEO
- Current quick fix made Catalog a Client Component; for better SEO, refactor to:
  - Server Catalog page: fetch products server-side and render static HTML for SEO and initial load.
  - Client Controls: filters, pagination and search as a client component that updates the UI via fetch calls or client-side router state.

If you approve, I will proceed to implement metadata, JSON-LD, sitemap, and refactor Catalog to a server-rendered page with client controls in the next iteration.
