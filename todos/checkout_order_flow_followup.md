Checkout → Order Flow — Follow-up Tasks

Status: in_progress
Owner: lennon06@inbox.ru

Context
See todos/checkout_order_flow.md and docs/checkout_order_flow_implementation.md. This follow-up focuses on Stripe setup docs, backend resilience, and UX polish for success/cancel pages.

Checklist (repo-linked)
- [x] Documentation: Add detailed Stripe integration + webhook guide
  - File: docs/stripe_integration_and_webhooks.md
- [x] README (short): Add Stripe setup notes (front + server)
  - Files: front/README.md, server/README.md
- [x] Backend resilience: Do not crash on Stripe key errors; add global handlers
  - Files: server/src/modules/payments/payments.controller.ts (validate key; handled errors)
  - Files: server/src/main.ts (unhandledRejection/uncaughtException logging)
- [x] Frontend UX: Improve /checkout/success and /checkout/cancel layout (card, centered, a11y)
  - Files: front/src/app/(shop)/checkout/ClientSuccess.tsx, ClientCancel.tsx
- [x] Environment configured with Stripe keys (user provided)
  - server/.env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PUBLIC_ORIGIN
  - front/.env.local: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, PUBLIC_ORIGIN
- [in_progress] Webhook end-to-end verification (manual, no e2e tests):
  - ISSUE FOUND: Stripe CLI is forwarding to /stripe/webhook (404). Our endpoint is /api/payments/webhook. Fix: `stripe listen --forward-to http://localhost:4000/api/payments/webhook`.
  - If CLI runs on another machine, forward to the server's reachable address: `--forward-to http://<SERVER_IP>:4000/api/payments/webhook`.
  - Events required: checkout.session.completed (required), checkout.session.expired, payment_intent.payment_failed.
  - After fix, initiate test payment; verify order.status becomes 'paid' and idempotency works
- [ ] Admin UI: Ensure Orders view surfaces payment info/events clearly (pending refinement)

Notes
- CSR bailout protection remains enforced: client pages wrapped in Suspense; metadata includes noindex.
- Payment endpoints return clear 400 when STRIPE_SECRET_KEY is missing instead of throwing internal errors.

How to proceed
1) Configure env vars (front + server) per docs/stripe_integration_and_webhooks.md.
2) Test a payment in Stripe test mode; verify order status on success page and in Admin.
3) Update this file by marking items completed as you validate in your environment.
