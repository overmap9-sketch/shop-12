# Mobile Header & Bottom Navigation

Status: in_progress
Owner: lennon06@inbox.ru

## Goals
- Replace Login/Register with account icon that opens /login when unauthenticated; logout should redirect to home
- On mobile: move top bar controls (currency, language, theme) into burger menu; keep logo + search visible; place burger to the right of search
- Implement mobile Bottom Navigation (Home, Catalog, Favourites, Cart, Account) fixed at the bottom; ensure page content has bottom padding to avoid overlap
- Maintain SEO/a11y; avoid CLS by reserving bottom nav height

---

## Plan (detailed subtasks)

### Phase 1 — Analysis & Planning
- [x] Read front/README.md and server/README.md
- [x] Audit current Header and BottomNav implementations, Shop layout usage

### Phase 2 — Header (mobile-first)
- [x] Hide top bar on mobile; expose controls in a mobile menu (burger)
- [x] Add burger button next to search on mobile (md:hidden)
- [x] Implement slide-over mobile menu with Currency/Language/Theme
- [x] Add a11y (aria-label, aria-expanded, aria-controls; role="dialog"; close on backdrop)
- [x] Keep desktop nav/actions intact; hide desktop nav on mobile
- [x] Replace Login/Register with account icon on desktop; on mobile use BottomNav for account access

Files: front/src/widgets/header/Header.tsx

### Phase 3 — Bottom Navigation
- [x] Ensure BottomNav shows 5 items with badges (fav, cart)
- [x] Add BottomNav to (shop) layout
- [x] Add bottom padding to main on mobile to prevent overlap (CLS-safe)
- [x] Ensure a11y (role="navigation", aria-label, aria-current)

Files: front/src/widgets/bottom-nav/BottomNav.tsx, front/src/app/(shop)/layout.tsx

### Phase 4 — SEO & Performance
- [x] Avoid CLS by reserving height (pb-16)
- [x] Keep semantic tags and labels for assistive tech
- [x] Ensure no blocking of LCP elements; keep logo+search visible on mobile

### Phase 5 — Documentation
- [x] Add README note about mobile bottom nav and header changes

---

## Verification checklist
- [ ] Open mobile viewport: burger opens settings; backdrop closes it; focus remains operable
- [ ] BottomNav visible only on mobile; badges update from store
- [ ] Content is not overlapped by BottomNav; no layout shift on navigation
- [ ] Keyboard and screen-reader navigation work (aria semantics)

---

## Change log
- 2025-09-24: Implemented mobile slide-over menu, integrated BottomNav into layout, added pb-16, updated README.
