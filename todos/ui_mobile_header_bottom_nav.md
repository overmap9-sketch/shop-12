Mobile Header & Bottom Navigation

Status: in_progress
Owner: lennon06@inbox.ru

Goals
- Replace Login/Register with account icon that opens /login when unauthenticated; logout should redirect to home
- On mobile: move top bar controls (currency, language, theme) into burger menu; keep logo + search visible; place burger to the right of search
- Implement mobile Bottom Navigation (Home, Catalog, Favourites, Cart, Account) fixed at the bottom; ensure page content has bottom padding to avoid overlap
- Maintain SEO/a11y; avoid CLS by reserving bottom nav height

Tasks
- [x] Hide top bar on mobile; expose controls in a mobile menu (burger)
  - File: front/src/widgets/header/Header.tsx
- [x] Replace Login/Register with account icon → /login (if unauthenticated); ensure logout navigates home
  - File: front/src/widgets/header/Header.tsx
- [x] Add burger button next to search on mobile; implement mobile menu panel with Currency/Language/Theme controls
  - File: front/src/widgets/header/Header.tsx
- [x] Create BottomNav component (md:hidden) with 5 actions and badges
  - File: front/src/widgets/bottom-nav/BottomNav.tsx
- [x] Add BottomNav to shop layout and add bottom padding to main on mobile
  - File: front/src/app/(shop)/layout.tsx
- [ ] README note about mobile bottom nav and header changes (optional brief)

Notes
- a11y: buttons/links have aria-label and aria-current where applicable
- CLS: main has pb-16 on mobile to account for fixed bottom nav height
