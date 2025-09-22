# Stripe Integration and Webhooks — Implementation Guide

This guide explains how to set up Stripe for this project (frontend + backend), obtain the webhook signing secret, and verify end-to-end payment flows.

## Overview
- Frontend uses Stripe Checkout redirect via `POST /api/payments/create-checkout-session`.
- Backend (NestJS) creates a Checkout Session, persists a pending order, and receives webhook events at `POST /api/payments/webhook`.
- Webhook processing updates the order status to `paid` (or `failed/cancelled`).

## Prerequisites
- Stripe account: https://dashboard.stripe.com
- Test mode enabled for development

## Environment variables
Frontend (front/.env.local):
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
- PUBLIC_ORIGIN=https://your-site.example

Backend (server/.env):
- STRIPE_SECRET_KEY=sk_test_...
- STRIPE_WEBHOOK_SECRET=whsec_...
- PUBLIC_ORIGIN=https://your-site.example
- CORS_ORIGIN=https://your-site.example (or http://localhost:3000 in dev)

Never commit real secrets.

## Obtain API keys
1) In Stripe Dashboard → Developers → API keys
2) Copy Publishable key → set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
3) Copy Secret key → set STRIPE_SECRET_KEY

## Create Webhook endpoint and get signing secret
Option A — Dashboard (hosted/dev server):
1) Dashboard → Developers → Webhooks → Add endpoint
2) Endpoint URL: https://your-site.example/api/payments/webhook
3) Select events to send: at minimum `checkout.session.completed`, optionally `checkout.session.expired`, `payment_intent.payment_failed`
4) After creating, click Reveal → copy Signing secret (starts with whsec_) → set STRIPE_WEBHOOK_SECRET on the server

Option B — Stripe CLI (local development):
1) Install: https://stripe.com/docs/stripe-cli
2) Login: `stripe login`
3) Forward events: `stripe listen --forward-to localhost:4000/api/payments/webhook`
4) CLI prints a Webhook signing secret (whsec_...) → set STRIPE_WEBHOOK_SECRET to match the CLI session

## Backend endpoints
- POST /api/payments/create-checkout-session
  - Body: `{ items: [{ productId, quantity }], successUrl?, cancelUrl?, metadata? }`
  - Returns `{ id, url }` (Checkout Session)
  - On success, an order with `status = 'pending'` is inserted
- POST /api/payments/webhook
  - Validates signature with STRIPE_WEBHOOK_SECRET
  - Idempotency with `stripe_events` store
  - Updates `orders` on relevant event types
- GET /api/orders/by-session/:sessionId → returns order by session id
- POST /api/orders/:orderId/retry-session → creates a new Checkout Session for an existing order

## Frontend flow
- Use CheckoutButton to call create-checkout-session and redirect using Stripe.js
- Result pages:
  - Success: `/checkout/success?session_id=cs_test_...` — fetch order by session and show status; poll while pending
  - Cancel: `/checkout/cancel?session_id=...` — show order summary and provide Retry button

## Local test checklist
- Configure `.env` files (front + server) with test keys
- Start backend and frontend
- Initiate checkout from the cart
- Use test card 4242 4242 4242 4242 to complete payment
- Verify Admin Orders displays updated status and payment info

## Troubleshooting
- 400 "Stripe is not configured": set STRIPE_SECRET_KEY on server
- Webhook signature verification failed: ensure STRIPE_WEBHOOK_SECRET matches your endpoint/CLI listen session
- Orders not updating: confirm webhook is reaching your server (check logs), and `app.use('/api/payments/webhook', express.raw(...))` is applied in main.ts

## Security notes
- Keep secrets out of version control
- Use separate keys for dev and production
- Validate event types; ignore duplicates (idempotency)
