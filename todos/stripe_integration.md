Stripe integration TODO

Status: in_progress

Overview
- Integrate Stripe Checkout / PaymentIntents to accept payments from the Next.js frontend and NestJS backend.

Tasks
1. Create todos and documentation (this file + docs/STRIPE_INTEGRATION.md) — DONE
2. Add server env variables (STRIPE_SECRET_KEY) and front env (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) — PENDING
3. Backend: implement payments module
   - payments.module.ts, payments.service.ts, payments.controller.ts
   - Endpoint POST /api/payments/create-checkout-session
   - (Optional) Webhook endpoint POST /api/payments/webhook to handle checkout.session.completed — PENDING
4. Frontend: implement Checkout flow
   - Add Checkout button component that calls backend to create session and redirects using stripe.js — PENDING
   - Add admin order webhook testing utilities — PENDING
5. Security & configuration
   - Use env vars for keys, do NOT commit secrets — PENDING
   - Use webhook signing secret for webhook verification — PENDING
6. Test in Stripe sandbox (publishable + secret keys) and verify successful payment flow — PENDING
7. Production checklist
   - Use live keys, HTTPS, webhook endpoint with correct signing secret, ensure idempotency and retry logic — PENDING

Notes / Decisions
- Prefer Stripe Checkout for quick integration (less PCI burden). Use PaymentIntents + Elements if you need in-site card forms.
- Webhooks are recommended to reliably mark orders paid on the backend.

What I did now
- Created this todos file and docs/STRIPE_INTEGRATION.md (documentation). Status updated here.

Next actions I can take for you
- (A) Set environment variables using the platform and add backend + frontend code to create checkout sessions and redirect users to Stripe Checkout. I will NOT store your secret keys in the repo; they will be set via environment variables.
- (B) Implement webhook endpoint and test it in the Stripe dashboard using the CLI or webhook forwarding service.

To proceed choose: "Implement now" or "Only document". If implement now, please confirm you want me to set STRIPE keys as environment variables in this environment (I will use DevServerControl to set them).
