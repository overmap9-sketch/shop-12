SEO Guide for PaintHub

Table of Contents
1. Purpose and Scope
2. SEO Strategy Overview
3. Server vs Client Rendering Principles
4. Metadata and Open Graph
5. Structured Data (JSON-LD)
6. Sitemap and robots
7. URL structure and canonicalization
8. On-page content and semantic HTML
9. Images and media
10. Performance and Core Web Vitals
11. Technical implementation (files, code examples)
12. Testing and verification
13. Deployment notes and environment
14. Appendix: common pitfalls and fixes

1. Purpose and Scope
This document describes the Search Engine Optimization approach for the PaintHub e-commerce project. It explains the architecture, trade-offs between Server Components and Client Components (Next.js app router), and detailed implementation steps to ensure pages are indexable, fast, and maintainable.

2. SEO Strategy Overview
- Render SEO-critical content (home, category, product pages, important marketing pages) on the server to produce crawlable HTML.
- Keep interactive parts (filters, client-side search, modals, Stripe flows) as client components to reduce JS executed on first paint.
- Provide correct metadata (title, description, canonical), Open Graph tags, and JSON-LD product schema for product pages.
- Publish a sitemap.xml and robots.txt exposing the main pages and product listings.
- Improve Core Web Vitals by optimizing images, deferring non-critical JS, and minimizing main-thread work.

3. Server vs Client Rendering Principles
- Server Components: use them for pages where initial HTML content is important. Examples: product listing, product detail, category pages.
- Client Components: UI widgets that require browser APIs or interactivity (shopping cart, payment, search boxes, filters).
- Pattern: Server page generates metadata and initial HTML; it mounts small client components for interactivity. This preserves SEO while enabling dynamic UX.

4. Metadata and Open Graph
- Use next/app-router generateMetadata API in server components for dynamic SEO meta tags.
- Files:
  - front/src/app/layout.tsx — global metadata defaults
  - front/src/app/(shop)/product/[id]/page.tsx — generateMetadata for product pages (implemented)
- Example (product page): set title to product.title, description to product.description, openGraph images to product.images[0], and canonical alternate.

5. Structured Data (JSON-LD)
- Add Product schema (schema.org) as application/ld+json script on product pages.
- Include fields: name, image, description, sku, brand, offers (price, priceCurrency, availability).
- Implementation: currently injected in front/src/views/product/ProductDetail.tsx via renderJsonLd(); prefer server-side injection in future.

6. Sitemap and robots
- Sitemap generator: front/src/app/sitemap.ts — includes home, catalog, categories, and product pages read from server/data/products.json at build time.
- Robots: front/src/app/robots.ts configured to allow crawling and exclude /admin.

7. URL structure and canonicalization
- Product URLs: /product/:slug (slug derived from products.json 'slug' field).
- Use canonical link rel on product pages to avoid duplicates; injected in ProductDetail via client-side effect — for full SSR prefer adding canonical in server page head.

8. On-page content and semantic HTML
- Use proper headings (h1 for product title), alt attributes on images, meaningful link text, and breadcrumbs.
- Example: ProductDetail component uses h1 for product.title and ProductBreadcrumb component for navigation.

9. Images and media
- Use explicit width/height attributes where possible to avoid layout shifts.
- Use loading="lazy" for offscreen images; consider Next.js Image optimization for production.
- Provide descriptive alt text.

10. Performance and Core Web Vitals
- Defer non-essential scripts (e.g., analytics) and use preconnect for third-party domains (CDNs, Stripe).
- Lazy-load heavy widgets and use code-splitting (dynamic imports) for non-critical UI.

11. Technical implementation (files and examples)
- key files:
  - front/src/app/layout.tsx — global metadata and Theme
  - front/src/app/(shop)/product/[id]/page.tsx — server component, generateMetadata
  - front/src/views/product/ProductDetail.tsx — client product detail + JSON-LD
  - front/src/app/sitemap.ts — sitemap generator reading server/data/products.json
  - front/src/app/robots.ts — robots rules
  - front/src/app/(shop)/checkout/* — checkout pages refactored to client components for CSR flows
- Example generateMetadata implementation is in front/src/app/(shop)/product/[id]/page.tsx

12. Testing and verification
- Manual: view source of product pages in production build to ensure meta tags present.
- Tools: use Google Rich Results Test for JSON-LD, Lighthouse for performance, and Fetch as Google in Search Console.

13. Deployment notes and environment
- PUBLIC_ORIGIN env var should be set to canonical site url (e.g., https://www.paint-hub.example) to produce correct metadata and sitemap links.
- Ensure robots and sitemap are reachable at /robots.txt and /sitemap.xml.

14. Appendix: common pitfalls
- Using client-only hooks (useSearchParams from next/navigation) in server components leads to CSR bailout and build errors. Fix: move to client components or wrap in Suspense boundary.
- Hooks order change bugs: always call hooks unconditionally at top level of components.

Contact
For any questions about SEO changes or further improvements (structured data expansion, hreflang for multi-language sites, dynamic sitemap incremental generation), reply in this thread.
