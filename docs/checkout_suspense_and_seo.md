# Checkout pages: SEO and Next.js Suspense

Context: in the App Router, components using `useSearchParams()` must be rendered within a `Suspense` boundary when imported into a server component. Otherwise, builds may fail with the CSR bailout error.

What we implemented
- `/checkout/success` and `/checkout/cancel` pages are server components that render client components (`ClientSuccess`, `ClientCancel`) inside `<Suspense>` with an accessible fallback (`aria-busy="true"`).
- Transactional checkout pages are marked `noindex, nofollow` and have canonical paths to avoid polluting the index and to improve SEO signals.
- `PUBLIC_ORIGIN` is used across the app for canonical URLs and server-generated links; ensure it reflects your public site URL in production.

Environment variables
- Frontend: `PUBLIC_ORIGIN`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Backend: `PUBLIC_ORIGIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

Notes
- Keep metadata (title/description/robots/canonical) in server `page.tsx` files.
- If a server page imports any client component that calls `useSearchParams`, wrap that client component in `<Suspense>`.
