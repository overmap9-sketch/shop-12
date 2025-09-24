# Mobile Pages Adaptation (Favourites, Cart, Catalog)

This document describes the UX, a11y, SEO, and performance improvements applied to the primary shopping pages for a better mobile experience.

## Goals
- Ensure Bottom Navigation never covers content (safe-area handling)
- Improve accessibility (ARIA, headings, focusability)
- Reduce CLS/LCP issues (reserved sizes, lazy images)
- Preserve clean separations (ui/model/api) and follow SOLID/DRY/KISS/YAGNI

## Key Changes

### Layout
- Shop layout: `pb-safe-bottom` utility added to `<main>` for mobile, paired with BottomNav `h-16` and safe-area padding.
- Global utilities (`front/src/global.css`):
  - `.pb-safe-bottom`: adds bottom padding with `--bn-h` and `env(safe-area-inset-bottom)`.
  - `.bottom-nav-safe-area`: ensures BottomNav respects device safe area (iOS).

### Header
- Logo hidden on mobile and displayed inside the burger slide-over menu.
- Desktop actions mirror BottomNav (Favourites, Cart, Account) with badges and a11y labels.

### Favourites (`front/src/views/favourites/Favourites.tsx`)
- Added `pb-safe-bottom` to the page container.
- View toggle buttons now have `aria-pressed` and meet ≥44px touch targets.
- Controls stack on small screens; ProductGrid remains responsive (1/2/3/4 columns by breakpoints).

### Cart (`front/src/views/cart/Cart.tsx`)
- Added `pb-safe-bottom` and made order summary sticky only on `lg+`.
- Increased tap targets for quantity controls and added `aria-label`s.
- Product images load with `loading="lazy"` and `decoding="async"`; their container has fixed size to avoid CLS.

### Catalog (`front/src/views/catalog/Catalog.tsx` + `CatalogControls.tsx`)
- Added `pb-safe-bottom` to the page container.
- Mobile filters and subcategory nav visible under main header (`lg:hidden`).
- View mode buttons include `aria-pressed`/labels; `ProductGrid` uses skeletons while loading.

## A11y & SEO
- Each page has a single `<h1>` heading.
- Interactive controls labeled with `aria-label`, active state with `aria-current` or `aria-pressed` where applicable.
- Reserved sizes for media to minimize layout shifts.

## Notes for Future Work
- Consider collapsing mobile filters into an accordion for very small screens.
- Explore preloading key LCP images and adding `priority` flags on critical assets.
- Add E2E tests for mobile breakpoints to prevent regressions.
