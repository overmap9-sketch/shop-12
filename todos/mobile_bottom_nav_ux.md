# Mobile Bottom Navigation — UX/SEO/a11y plan

Status: in_progress
Owner: lennon.study@gmail.com

## Objectives
- Always show a fixed Bottom Navigation (Home, Catalog, Favourites, Cart, Account/Login) at the bottom on mobile (≤ md).
- Prevent content overlap (safe-area + reserved height) and avoid CLS.
- Keep architecture clean: separate model/ui/api where applicable; ensure a11y/SEO.

## Subtasks

### 1) Implementation (UI)
- [x] Create BottomNav component with 5 actions and dynamic badges (fav/cart)
  - File: front/src/widgets/bottom-nav/BottomNav.tsx
  - a11y: role="navigation", aria-label, aria-current; icons labeled
- [x] Fix BottomNav to viewport bottom and set explicit height
  - h-16, style --bn-h=64px; add bottom-nav-safe-area class for iOS insets
- [x] Add BottomNav into Shop layout
  - File: front/src/app/(shop)/layout.tsx
- [x] Add safe-area padding utility and apply to main content (mobile only)
  - File: front/src/global.css (.pb-safe-bottom, .bottom-nav-safe-area)
  - main: className="pb-safe-bottom md:pb-0"

### 2) Behavior (Model/API)
- [x] Account button routes to /profile when authenticated, /login otherwise
  - Source of truth: selectIsAuthenticated in features/auth/authSlice.ts
- [x] Badges read from Redux slices (cart/favourites)

### 3) A11y & SEO
- [x] aria-label for each action; aria-current on active route
- [x] Semantic nav/ul/li structure
- [x] Minimize CLS: reserved main padding and fixed nav height
- [x] Lazy-load heavy images elsewhere; BottomNav itself is lightweight

### 4) Documentation
- [x] Update front/README.md with Mobile UX notes
- [ ] Add docs/ux/mobile-bottom-nav.md with rationale and future improvements (optional)

## Verification Checklist
- [ ] On mobile (≤768px), BottomNav visible on all shop routes; hidden on admin routes
- [ ] Content never hidden behind nav; no layout shift when navigating
- [ ] Badges update when adding/removing items/favourites
- [ ] Screen reader announces labels; focus order logical

## Notes
- Admin layout intentionally omits BottomNav to reduce clutter for admin tasks.
- Consider adding haptic feedback and larger touch targets in a future iteration.
