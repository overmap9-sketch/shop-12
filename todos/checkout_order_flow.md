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
   - Use Stripe CLI to forward signed events and test both success and failure scenarios; verify idempotency by re-sending same event results only one state change — PENDING

Work completed now by me
- Created this todos file with concrete repo-linked tasks and acceptance criteria.

Next actions I can implement for you (choose any combination)
A) Make STRIPE_WEBHOOK_SECRET required and implement signature verification + idempotency in server/src/modules/payments/payments.controller.ts
B) Add GET /api/orders/by-session/:sessionId and POST /api/orders/:orderId/retry-session endpoints and update frontend success/cancel pages to call them
C) Update Admin Orders view to show payment fields (sessionId, payment status, amount, event history)
D) Add automated integration test using Stripe CLI to validate webhook handling (success + failure + duplicate event)

Reply which tasks to execute (A/B/C/D) or "only document" to stop here.
