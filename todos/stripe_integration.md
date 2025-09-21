Stripe integration TODO

Status: in_progress

Env variables set: STRIPE keys configured via environment (dev keys present in environment for testing)

Overview
- Integrate Stripe Checkout / PaymentIntents to accept payments from the Next.js frontend and NestJS backend. Harden the integration for production use with a security-first approach.

Tasks
1. Documentation and tracking
   - This file and docs/STRIPE_INTEGRATION.md, plus new docs/payment_module_security.md — UPDATED
2. Environment & secrets management
   - Ensure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set in production environment variables and never committed to source control — DONE (dev keys present); STRIPE_WEBHOOK_SECRET: PENDING (must be set in production env)
   - Configure automated key rotation and least-privilege access for any deployment systems — PENDING
3. Backend implementation
   - payments.module.ts, payments.service.ts, payments.controller.ts — DONE
   - Endpoint POST /api/payments/create-checkout-session — DONE
   - Webhook endpoint POST /api/payments/webhook — DONE (basic implementation). Must enable full signature verification using STRIPE_WEBHOOK_SECRET and implement idempotency handling — PENDING
   - Add strict input validation and whitelisting for all payment-related endpoints — PENDING
4. Frontend implementation
   - Checkout button and stripe.js redirect — DONE
   - Ensure no secret keys are present client-side; use NEXT_PUBLIC_* only for publishable key — DONE
   - Harden client-side flows to validate server responses before redirecting — PENDING
5. Security & production hardening (new, high priority)
   - Enforce HTTPS and HSTS in all environments that accept payments — PENDING
   - Enforce CORS rules to only allow trusted origins (frontend origin) — PENDING
   - Rate limiting for payment endpoints (create-checkout-session, webhook) — PENDING
   - Verify webhook signatures using Stripe SDK and STRIPE_WEBHOOK_SECRET — PENDING
   - Implement idempotency keys for server-side actions triggered by webhooks to avoid duplicate state changes — PENDING
   - Use structured logging (correlation IDs) and send errors to monitoring (Sentry) — PENDING
   - Monitor suspicious activity and configure alerts for failed payments, repeated webhook retries, and unexpected events — PENDING
   - Restrict access to Stripe keys (separate production keys, minimal access) and rotate keys regularly — PENDING
   - PCI guidance: use Stripe Checkout to minimize PCI scope; do not collect raw card data on your servers — DONE (Checkout used)
   - Ensure webhook endpoint is not publicly discoverable beyond necessary path and protect with IP allowlisting or WAF where possible — PENDING
   - Validate and sanitize any metadata or inputs persisted to order records to avoid injection/XSS in admin UIs — PENDING
6. Testing & verification
   - Test full payment flow in Stripe sandbox and verify webhook handling with the CLI and webhook forwarding — PENDING
   - Perform end-to-end tests that simulate network failures and webhook retries — PENDING
   - Run security scanning (SAST) and dependency vulnerability scans before production releases — PENDING
7. Operational readiness
   - Add observability: metrics, traces, and error dashboards for payment flows — PENDING
   - Create incident runbook for payment failures, webhook signature errors, and reconciliation mismatches — PENDING

Notes / Decisions
- Prefer Stripe Checkout to reduce PCI burden. PaymentIntents + Elements only if in-site card collection is required.
- Webhooks are required to reliably mark orders paid and should be verified and idempotent.

What I did now
- Updated todos file to include a security-focused production checklist and tasks. Created cybersecurity/ and docs/payment_module_security.md files.

Next actions I can take for you
- (A) Enable STRIPE_WEBHOOK_SECRET in production environment and implement strict signature verification in payments webhook handler.
- (B) Add idempotency handling and structured logging for webhook-initiated order updates.
- (C) Configure monitoring (Sentry) and automated security scans (Semgrep) prior to production release.

To proceed, tell me which of the next actions (A/B/C) you want me to implement now; I will then start the work and update the todo statuses accordingly.
