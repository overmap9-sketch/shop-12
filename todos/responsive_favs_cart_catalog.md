# Mobile Adaptation: Favourites, Cart, Catalog

Status: in_progress
Owner: lennon.study@gmail.com

## Goals
- Optimize UI for mobile/tablet/desktop while preserving SEO and a11y.
- Ensure no content is overlapped by BottomNav; avoid CLS/LCP regressions.
- Keep architecture clean (model/ui/api separation), use existing slices/components.

## Subtasks

### Header update
- [x] Move logo into burger on mobile; hide logo in header on mobile
  - File: front/src/widgets/header/Header.tsx

### Favourites (front/src/views/favourites/Favourites.tsx)
- [ ] Verify controls stack on small screens (search/sort/view toggles) and touch targets ≥44px
- [ ] Ensure grid/list switches are reachable and labeled (aria-pressed)
- [ ] Confirm ProductGrid columns responsive (≥1 on xs, 2 on sm, 3 on lg)
- [ ] Add pb-safe-bottom to ensure spacing if page is used outside shop layout (defensive)

### Cart (front/src/views/cart/Cart.tsx)
- [x] Lazy-load item images (loading="lazy", decoding="async")
- [ ] Ensure summary section stacks under items on mobile; sticky only ≥lg
- [ ] Increase tap targets for qty controls on mobile; aria-labels
- [ ] Add pb-safe-bottom defensively

### Catalog (front/src/views/catalog/Catalog.tsx)
- [ ] Verify mobile filters/subcategory nav are visible and collapsible if needed
- [ ] Confirm ProductGrid columns responsive and skeletons used during loading
- [ ] Add pb-safe-bottom defensively

### A11y/SEO
- [ ] Ensure headings (h1) present and unique
- [ ] aria-labels on interactive controls; aria-current where relevant
- [ ] Avoid layout shifts by reserving sizes for media (width/height or fixed containers)

### Docs
- [ ] Add docs/ux/mobile-pages-adaptation.md with rationale and future iterations (optional)
- [ ] Update front/README.md if behavior materially changes

## Verification Checklist
- [ ] Mobile: no overflow, no content covered by BottomNav; smooth scrolling
- [ ] Tablet/desktop layouts unaffected
- [ ] Lighthouse: no major a11y or perf regressions
