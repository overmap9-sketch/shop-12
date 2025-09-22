Checkout → Order flow — Implementation and Operations

Overview
This document describes the implementation plan, APIs, persistence, and operational steps for the Checkout → Order lifecycle integrated with Stripe. The current codebase stores data in JSON files under server/data/*. The design keeps business logic in server services and UI in frontend pages/components to maintain separation of concerns and enable migration to Sequelize/Postgres in the future.

Goals
- Securely verify Stripe webhook signatures using STRIPE_WEBHOOK_SECRET.
- Implement idempotent webhook processing using an event-store.
- Ensure orders are created before redirecting to Stripe and preserve orders on failure.
- Provide backend endpoints for frontend success/cancel pages and retry flow.
- Surface payment info in the Admin Orders UI.

Server-side design decisions
- Keep controllers thin: validate request, parse body, delegate business logic to services.
- Implement PaymentsService that handles order state transitions and Stripe session creation for both initial checkout and retry.
- Persist processed Stripe event ids in server/data/stripe_events.json to ensure idempotency when using file-based storage. Later this becomes a table 'stripe_events' with unique event_id constraint.
- Use existing JSON persistence layer (server/src/persistence/json-db.service.ts) to read/write orders and the event store. When moving to Postgres/Sequelize, move logic into repositories/ORM models.

API Endpoints (to be implemented or verified)
- POST /api/payments/create-checkout-session
  - Creates an Order (status='pending') and a Stripe Checkout Session. Saves sessionId in order.
- POST /api/payments/webhook
  - Validates signature with STRIPE_WEBHOOK_SECRET and processes events idempotently.
- GET /api/orders/by-session/:sessionId
  - Returns order details by Stripe session id (for success page).
- POST /api/orders/:orderId/retry-session
  - Create a new Stripe session for an existing order and return session id.

Idempotency & signature verification
- Use stripe.webhooks.constructEvent(rawBody, signatureHeader, STRIPE_WEBHOOK_SECRET). If verification fails, return 400.
- Check event.id in stripe_events storage; if exists, return 200 without reprocessing.
- Upon successful processing, append event.id to stripe_events.json.

Frontend changes
- Success page: read session_id query param, call GET /api/orders/by-session/:sessionId, display current order.status and payment details. If 'pending', show polling UI.
- Cancel page: show order summary and retry button that POST to /api/orders/:orderId/retry-session and redirect to returned session url.
- CheckoutButton component: on create-checkout-session response use returned session.id and redirect to Stripe. For retry flow, re-use same logic with new session id.

Admin
- Update Admin Orders list/detail to include order.payment fields (sessionId, payment status, amount, event history). This is purely frontend mapping; backend must ensure these fields are stored in orders JSON.

Migration notes (to Postgres + Sequelize)
- Create tables: orders, order_items, stripe_events, payments (or integrate into orders).
- Add unique constraint on stripe_events.event_id to enforce idempotency at DB level.
- Move JSON persistence service to Sequelize repository layer; keep service interfaces the same to minimize refactor surface area.

Testing & verification
- Manual testing using Stripe CLI is recommended to forward events to the webhook endpoint. For automated tests, plan E2E/integration tests later.

Operational notes
- Ensure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set in environment for production.
- Logs should capture event processing results and errors but avoid logging full raw bodies in production.

Contact
- For questions about implementation details, reply to this ticket.
