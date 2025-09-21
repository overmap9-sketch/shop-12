Stripe integration guide for PaintHub

Purpose
- Add payments using Stripe (sandbox during development, live in production).

High-level options
- Stripe Checkout (recommended, fastest): redirect users to Stripe-hosted checkout page. Backend creates a Checkout Session; frontend redirects using stripe.js and publishable key.
- PaymentIntents + Stripe Elements: embed card form into site, more control, higher scope for PCI compliance.

Required env vars
- server/.env
  - STRIPE_SECRET_KEY=sk_test_...
  - STRIPE_WEBHOOK_SECRET=whsec_... (for webhook verification)
- front/.env.local
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

Backend (NestJS) integration (recommended endpoints)
1) POST /api/payments/create-checkout-session
   - Body: { items: [{ productId, quantity }], successUrl, cancelUrl, metadata?: {} }
   - Action: read product prices from DB, create Stripe Checkout session with line_items (price_data: currency, unit_amount), mode: 'payment', success_url, cancel_url
   - Return: { url: session.url } or { id: session.id }

2) POST /api/payments/webhook
   - Used to receive events (checkout.session.completed) to mark orders as paid
   - Must verify signature with STRIPE_WEBHOOK_SECRET

Frontend (Next.js) integration (recommended flow)
- Provide a Checkout button that posts cart items to /api/payments/create-checkout-session
- Backend responds with session.url or session.id
- Use stripe-js on client:
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  await stripe.redirectToCheckout({ sessionId: session.id });

Security & testing
- Do NOT commit secret keys. Use environment variables (server/.env local file for local dev) or CI secret settings for production.
- For webhook testing use Stripe CLI (`stripe listen --forward-to localhost:4000/api/payments/webhook`) or the dashboard webhooks tester.
- In dev use sandbox keys, verify signature header `stripe-signature` when handling webhooks.

Order lifecycle and idempotency
- Create an Order record in DB when a Checkout Session is created (status: pending) with sessionId saved.
- On webhook `checkout.session.completed`, mark order as paid and fulfill goods.
- Use idempotency keys for API calls that create or mutate orders.

Production checklist
- Switch to live keys
- Configure HTTPS and correct webhook endpoint URL
- Set strong secrets, rotate keys
- Verify webhook retries and idempotency
- Ensure taxes/shipping calculation is done server-side

MCP suggestions
Available integrations you can use with this project (recommendations):
- Neon: managed Postgres (useful if you migrate from JSON to Postgres)
- Netlify: host the frontend (static or Next.js), and manage deploys
- Zapier: automate notifications (new order -> Slack, email, etc.)
- Figma: design to code plugin for building UI (Builder.io Figma plugin)
- Supabase: alternative backend/auth and realtime
- Builder CMS: content management
- Linear: issue tracking
- Notion: documentation
- Sentry: error monitoring
- Context7: live docs for libraries
- Semgrep: static security scans
- Prisma Postgres: ORM option for Postgres

Next steps I can take (if you confirm)
1) Set env variables in the environment using the keys you provided (use DevServerControl set_env_variable). I will NOT write keys to repository files.
2) Implement backend payments module with endpoint(s) and optional webhook handler.
3) Implement frontend checkout button and redirection to Stripe Checkout.
4) Test flow in sandbox and mark todos as completed.

If you want me to proceed, confirm: "set env vars and implement" and provide:  
- STRIPE_PUBLISHABLE_KEY (pk_test_...)
- STRIPE_SECRET_KEY (sk_test_...)
- (optional) STRIPE_WEBHOOK_SECRET if you already created webhook endpoint in Stripe dashboard
