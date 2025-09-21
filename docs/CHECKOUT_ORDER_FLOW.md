Checkout → Order flow (implementation notes for this repository)

Objective
Implement a robust checkout workflow so the backend reliably tracks order state (pending → paid/failed/cancelled), the cart is not cleared on failed payments, and Admin Panel shows payment status and history.

Files referenced
- server/src/modules/payments/payments.controller.ts (create-checkout-session, webhook)
- server/src/modules/payments/payments.service.ts
- server/src/main.ts (raw body middleware for webhook)
- front/src/components/CheckoutButton.tsx
- front/src/app/(shop)/checkout/page.tsx (checkout UI)
- front/src/app/(shop)/checkout/success/page.tsx (success page — create if missing)
- front/src/app/(shop)/checkout/cancel/page.tsx or payment-failed page (create if missing)
- front/src/views/admin/orders/Orders.tsx (admin orders UI)

Behavioral requirements (concrete)
1) Create order before redirecting to Stripe
- When frontend posts items to POST /api/payments/create-checkout-session, backend MUST:
  - Validate items schema (productId:string, quantity:number>0)
  - Recompute prices from DB (do not trust client totals)
  - Insert an Order record with fields: id, sessionId (from Stripe session), status: 'pending', items: [{productId, title, unitPrice, quantity}], total, dateCreated, metadata
  - Return session.id and session.url to client

2) Success / Cancel UX
- success_url: `${PUBLIC_ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  - On success page: call GET /api/orders/by-session/:sessionId to get order and payment status. If order.status === 'paid' show confirmation; if 'pending' show pending message and email confirmation info.
- cancel_url: `${PUBLIC_ORIGIN}/checkout/cancel` or payment-failed page
  - On payment-failed page show the saved order summary (items, quantity, prices) and a "Retry payment" button that calls POST /api/orders/:orderId/retry-session to generate a new Checkout Session for the same order.

3) Webhook processing
- POST /api/payments/webhook MUST:
  - Require STRIPE_WEBHOOK_SECRET in production and validate signature using stripe.webhooks.constructEvent on raw body
  - Implement idempotency by storing processed event.id in 'stripe_events' and ignoring duplicates
  - On checkout.session.completed: find order by sessionId, if found and status !== 'paid' then mark status='paid', store payment info (amount_received, currency, payment_intent), dateModified; enqueue any post-payment tasks (email, fulfillment)
  - On relevant failure events (payment_intent.payment_failed, charge.failed): find order and set status='failed' and store failure reason
  - Return 200 only after the event is accepted/queued for processing

4) Cart retention policy
- Do not clear user's cart on payment failure/cancel. Cart should be cleared only after order is confirmed paid and fulfillment initiated or user explicitly clears cart.
- If user retries payment, reuse saved order items for retry session.

5) Admin Panel
- Admin Orders view must show: order.id, sessionId, status (pending/paid/failed/cancelled), items, unit prices, total, created/modified timestamps, payment details (amount, currency, paymentIntent id), stripe_events history (event.id, type, timestamp)
- Provide action in Admin to retry payment (create retry session and return URL/sessionId) and to reconcile manually (mark paid)

6) API endpoints (suggested)
- POST /api/payments/create-checkout-session
  - Body: { items: [{ productId, quantity }], metadata?: {} }
  - Response: { id: session.id, url: session.url, orderId }
- POST /api/payments/webhook
  - Stripe webhook handler (signed)
- GET /api/orders/by-session/:sessionId
  - Returns order record and status
- POST /api/orders/:orderId/retry-session
  - Creates new Stripe session for existing order and returns new session id/url

7) Testing and verification
- Use Stripe CLI to forward webhooks and test both successful and failed payments. Verify order status transitions and that the cart remains intact on failure.
- Test duplicate event behavior by resending the same event id ��� DB should not double-apply status changes.

Acceptance criteria
- Orders with status 'pending' exist immediately after clicking Pay
- Successful Stripe test payment results in order.status === 'paid' and Admin UI reflects it
- Failed/cancelled payments result in order.status === 'failed' or 'cancelled' and cart not cleared
- Retry flow works: new session can be created for existing order and redirect to Stripe succeeds
- Webhook verification and idempotency implemented and tested via Stripe CLI

Next steps I can implement for you
- Implement required backend changes (webhook signature enforcement, idempotent event persistence, retry endpoint)
- Add frontend pages for success/cancel and wire retry flow
- Update Admin Orders UI to show payment fields and event history

If you want me to start implementing, tell me which of these to do first: A) webhook signature + idempotency, B) retry endpoint + success/cancel pages, C) Admin UI updates, D) full end-to-end tests with Stripe CLI.
