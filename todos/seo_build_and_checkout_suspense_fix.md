# Task: SEO hardening and build fix for checkout pages

## Goals
- Ensure Next.js build passes without CSR-bailout errors.
- Improve SEO/a11y for checkout pages (success/cancel) and mark as noindex.
- Verify env variables are documented and present.

## Tasks
- [x] Read front/README.md and server/README.md; review run instructions and env templates (front/env.local.example, server/.env.example)
- [x] Audit checkout pages for useSearchParams; wrap with Suspense boundary to satisfy Next App Router
- [x] Add SEO metadata (title, description, robots noindex, canonical) to /checkout/success and /checkout/cancel
- [x] Grep repository for useSearchParams usage and confirm no SSR build issues elsewhere
- [ ] Build locally to confirm no warnings/errors related to Suspense (CI step)
- [ ] Optional: document Next.js hook + Suspense requirement in docs/ or README if needed

## Notes
- ClientSuccess and ClientCancel now render under Suspense; fallback includes aria-busy for a11y.
- Added metadata exports to prevent indexing transactional pages and improve canonical signals.
- Stripe keys: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (front), STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET (server) are present in examples.

## Next steps
- Run a full build and validate LCP/CLS regressions are absent; add skeletons where necessary in critical pages.
- Expand sitemap/robots if needed using PUBLIC_ORIGIN.
