Auth & Checkout Guards

Status: in_progress
Owner: lennon06@inbox.ru

Goals
- Stop infinite reload when JWT expires on Admin pages
- Serve NotFound for unauthorized/non-admin users on admin routes
- Gate checkout: require auth; redirect to login with returnTo; after login, return to intended page
- SEO/a11y preserved; Suspense rules for useSearchParams applied

Tasks
- [x] Admin layout: bypass guard on /admin/login; avoid redirect loops
  - File: front/src/app/admin/layout.tsx
- [x] Admin guard: render NotFound for unauthorized/non-admin instead of navigating
  - File: front/src/app/admin/layout.tsx (AdminAuthGuard)
- [x] Checkout button: require auth, redirect to /login with returnTo=current URL
  - File: front/src/components/CheckoutButton.tsx
- [x] Login: support returnTo from query/localStorage and redirect accordingly; wrap in Suspense
  - Files: front/src/views/auth/Login.tsx, front/src/app/(shop)/login/page.tsx
- [ ] Docs: add short section to front/README.md about admin/checkout guards
- [ ] Optional: server-side 401 handling doc and token expiry notes in docs/

Notes
- Router shim ensures useSearchParams is client-safe; login page wrapped in Suspense.
- NotFound UI: front/src/views/NotFound.tsx used to avoid SSR-only notFound().
