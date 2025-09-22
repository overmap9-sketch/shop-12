Checkout → Order flow TODO

Status: in_progress

Goal
Implement reliable Checkout → Order lifecycle for Stripe integration so the backend reliably knows whether payment succeeded or failed, the cart is preserved on failures, and Admin Panel shows payment status.

Current facts (repo-specific)
- create-checkout-session exists at POST /api/payments/create-checkout-session (server/src/modules/payments/payments.controller.ts) and already saves an order with sessionId and status 'pending' — PARTIALLY DONE
- Webhook endpoint exists at POST /api/payments/webhook (server/src/modules/payments/payments.controller.ts) but signature verification and idempotency are incomplete — PENDING
- Frontend CheckoutButton posts items to create-checkout-session and redirects using stripe.redirectToCheckout (front/src/components/CheckoutButton.tsx) — DONE
- main.ts already configures raw body middleware for /api/payments/webhook — DONE

Tasks (concrete, repo-linked)
1) Create order before redirecting to Stripe (server + front)
   - Ensure create-checkout-session always inserts an Order record with: sessionId, status: 'pending', items (id, title, unitPrice, quantity), total, dateCreated — CURRENT: implemented in controller insert (server/src/modules/payments/payments.controller.ts lines ~51-59) — DONE
   - Acceptance: DB contains order record for every created session; order.total equals server-computed total. — DONE

2) Webhook: verify payment result and update order atomically
   - Require STRIPE_WEBHOOK_SECRET in production and use stripe.webhooks.constructEvent on raw body (server/src/modules/payments/payments.controller.ts lines ~73-80) — PENDING
   - Implement idempotency: store event.id in 'stripe_events' collection and ignore duplicates — PENDING
   - On checkout.session.completed: find order by sessionId, set status='paid', dateModified, store payment info (amount_received, currency, payment_intent) — PENDING
   - On payment failed/cancelled events: set status='failed' or 'cancelled' with reason; do NOT clear user's cart — PENDING
   - Acceptance: After Stripe test payment, order.status becomes 'paid' in DB and Admin Panel shows payment details; failed payments set appropriate status without clearing cart.

3) Frontend UX for result pages
   - success_url should be `${PUBLIC_ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}` (already used) — DONE
   - On success page: fetch order by session_id (backend endpoint e.g. GET /api/orders/by-session/:sessionId) and show status; if status still 'pending', show pending message and poll/refresh later or inform user email will follow — PENDING (backend endpoint missing)
   - On cancel/failure: redirect to `${PUBLIC_ORIGIN}/checkout/cancel` or show payment-failed page with repeat-payment button and order summary (items, quantities, total) — PENDING

4) Retry flow
   - Implement endpoint to create a new Checkout Session for an existing order (POST /api/orders/:orderId/retry-session) that preserves order items and metadata and returns new session.id — PENDING
   - Acceptance: user clicks retry -> new session created -> redirect to Stripe; order remains in DB with status 'pending' or 'retried' metadata.

5) Admin Panel display
   - Ensure Admin Orders list (front admin Orders view) displays order.status, sessionId, items, total, payment info, event history — PARTIALLY DONE (Orders admin exists; ensure fields persisted and surfaced) — PENDING (frontend mapping)

6) Tests & Verification
   - Use Stripe CLI to forward signed events and test both success and failure scenarios; verify idempotency by re-sending same event results only one state change — PENDING (deferred now)

Work completed now by me
- Created this todos file with concrete repo-linked tasks and acceptance criteria.

Implementation log (technical steps, files, progress)

Phase 0 — Preparations (complete)
- Verified raw body middleware exists in server/main.ts to allow stripe.webhooks.constructEvent to validate signatures. (file: server/src/main.ts) — DONE
- Confirmed frontend creates checkout session and redirects (file: front/src/components/CheckoutButton.tsx) — DONE

Phase 1 — Webhook verification & idempotency (STARTING)
- Goal: Make webhook handling secure and idempotent using STRIPE_WEBHOOK_SECRET and a simple event-store.
- Files to change:
  - server/src/modules/payments/payments.controller.ts  (implement signature verification, idempotency, event handling)
  - server/src/persistence/data-store.ts or server/src/persistence/json-db.service.ts (add simple event store helpers to persist processed stripe event ids alongside JSON storage)
  - server/src/modules/payments/payments.service.ts (move business logic for order state updates into service layer for testability and separation from controller)
  - server/src/modules/orders/orders.service.ts (if exists; otherwise payments.service will update orders in storage)
- Concrete technical steps:
  1) Add STRIPE_WEBHOOK_SECRET env var check and early 400 if missing in production.
  2) In payments.controller webhook handler read raw body + signature header and call stripe.webhooks.constructEvent; on error log and return 400.
  3) Check event.id against event store (persisted JSON file 'stripe_events.json' in server/data/). If exists, respond 200 no-op.
  4) Process event types: 'checkout.session.completed' -> find order by sessionId -> set status='paid' and write payment info; 'checkout.session.expired' or payment_intent.payment_failed' -> set 'failed' or 'cancelled'.
  5) Persist event.id after successful processing to ensure idempotency.
  6) Write unit-like integration steps and logs into todos file as we implement.
- Acceptance Criteria (for this phase): server correctly verifies signature with STRIPE_WEBHOOK_SECRET, ignores duplicate event.id, updates order.status appropriately and persists event ids in server/data/stripe_events.json.

Phase 2 — Backend endpoints for success page & retry (pending)
- Files to change:
  - server/src/modules/orders/orders.controller.ts (add GET /api/orders/by-session/:sessionId)
  - server/src/modules/orders/orders.controller.ts (add POST /api/orders/:orderId/retry-session)
  - server/src/modules/payments/payments.service.ts (refactor createCheckoutSession logic to allow retry)
- Concrete technical steps:
  1) Implement GET /api/orders/by-session/:sessionId returning order with payment fields.
  2) Implement POST /api/orders/:orderId/retry-session that looks up order, creates a new Stripe session server-side using saved items, updates order with new sessionId (optionally add metadata 'previousSessionId'), and returns sessionId to frontend.

Phase 3 — Frontend success/cancel UX (pending)
- Files to change:
  - front/src/app/(shop)/checkout/page.tsx or front/src/app/(shop)/checkout/success/page.tsx (create success page that reads session_id query param, calls backend GET /api/orders/by-session/:sessionId and renders order status)
  - front/src/app/(shop)/checkout/cancel/page.tsx (create cancel page showing order summary and retry button which calls POST /api/orders/:orderId/retry-session)
  - front/src/components/CheckoutButton.tsx (ensure retry flow uses returned session id and redirects user)
- Concrete technical steps:
  1) Implement success page that polls if order.status=='pending' (with exponential backoff) for up to N seconds then shows fallback message.
  2) Implement cancel page with retry button that calls retry-session and redirects user to new Stripe session.

Phase 4 — Admin UI updates (pending)
- Files to change:
  - front/src/views/admin/Orders.tsx or corresponding front/src/app/(admin)/orders page to show sessionId, payment info and event history
- Concrete technical steps:
  1) Surface order.payment fields in the admin list and detail views.

Phase 5 — Documentation (in progress)
- Create docs/checkout_order_flow_implementation.md with architecture, API reference, deployment notes, and migration notes to Postgres + Sequelize.

Deferred: E2E tests (D)
- As requested, e2e tests and automated Stripe CLI integration tests are deferred for now; will be planned and documented in docs and todos for future execution.

Current status summary
- Phase 1 (Webhook verification & idempotency): in_progress — I will implement server changes next and update this file with exact changed files and commit notes.
- Phases 2-4: pending
- Documentation file created in docs/ (see docs/checkout_order_flow_implementation.md) — IN PROGRESS

Next immediate action (I will start now)
- Modify server/src/modules/payments/payments.controller.ts and server/src/modules/payments/payments.service.ts to implement signature verification, idempotency, and move business logic into service layer.
- Add simple event-store backed by server/data/stripe_events.json via persistence/json-db.service.ts or data-store.ts.

Reply "Proceed" to allow me to modify repository files and implement Phase 1 now, or reply with changes to scope.
