# Responsive adaptation: Catalog, Cart, Favourites (SEO, a11y, CLS/LCP)

Owner: overmap9@gmail.com (admin)
Status: In Progress
Last update: INITIAL

## Goals
- Make Catalog, Cart, Favourites fully responsive (mobile-first), with no overflow or horizontal scrolling.
- Maintain SEO and performance: avoid indexing personal pages, preserve SSR for catalog, keep CLS/LCP low (lazy images, skeletons, reserved space).
- Maintain accessibility: semantic HTML, aria attributes, keyboard focus, touch targets.
- Keep architecture separation: model (features/entities), ui (shared/components/widgets), api (shared/api). Follow SOLID, DRY, KISS, YAGNI.

## Tasks
1) Cart page responsive overhaul
- [ ] Stack line items on small screens (image, info, controls, price)
- [ ] Prevent overflow for quantity and price; ensure text wraps; set min-w-0 where needed
- [ ] Buttons are accessible and large enough for touch (>=44px)
- [ ] Verify lazy image loading and reserved aspect-ratio containers
- [ ] Test on iPhone SE/12/Pro Max widths and Android small/medium

2) Favourites responsive
- [ ] List view: stack on small screens; add min-w-0 to content; move price/actions under info
- [ ] Grid view: relies on ProductGrid/ProductCard responsive columns; verify
- [ ] Ensure images are lazy, have reserved space; avoid layout shifts

3) Catalog responsive & UX
- [ ] Verify ProductGridItem list view stacks on small screens; add min-w-0, text wrapping
- [ ] Controls bar wraps neatly on small screens; keep touch targets and labels
- [ ] Sidebar hidden on mobile; duplicated mobile controls OK

4) SEO updates
- [ ] Add robots: noindex, nofollow and canonical for /cart and /favourites
- [ ] Keep SSR list JSON-LD and metadata on /catalog

5) Performance (CLS/LCP)
- [ ] Use skeletons for loading states (already in place); ensure image containers reserve space
- [ ] Lazy-load images with decoding="async"; ensure important above-the-fold image usage is appropriate
- [ ] Validate BottomNav space reservation to avoid overlap/CLS

6) QA and regression checks
- [ ] Smoke test flows: add/remove in cart, favourites add/remove, catalog pagination/sort
- [ ] a11y: aria-labels on buttons, tab order, keyboard navigation
- [ ] RTL/localization spot-check

## Affected files
- front/src/views/cart/Cart.tsx
- front/src/views/favourites/FavouriteItem.tsx (list view)
- front/src/widgets/product-grid/ProductGridItem.tsx (list view)
- front/src/app/(shop)/cart/page.tsx (metadata noindex)
- front/src/app/(shop)/favourites/page.tsx (metadata noindex)

## Progress log
- [x] Read front/README.md and server/README.md for architecture, SEO, and run instructions
- [x] Audited current front for responsive issues; identified overflow in Cart and list views
- [ ] Implemented Cart mobile stacking and overflow fixes
- [ ] Implemented Favourites list/list view stacking and overflow fixes
- [ ] Implemented Catalog list view stacking and overflow fixes
- [ ] Added SEO metadata for Cart/Favourites
- [ ] Manual QA across mobile viewport sizes

## Notes
- Do not change API contracts; UI-only changes for responsiveness
- Keep SSR on Catalog page to retain SEO; use ClientCatalogShell for hydration and CSR controls
- Personal pages (cart, favourites) should not be indexed
