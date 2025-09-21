Payment Module Security Alignment

This document maps the security checklist items to the current codebase status and recommended remediation steps.

1) Secrets and env
- Current status: STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY present in environment variables for dev. STRIPE_WEBHOOK_SECRET is not set in production env.
- Remediation: Set STRIPE_WEBHOOK_SECRET in production secrets manager; remove any secrets from code and history; enforce access controls.

2) Webhook verification
- Current status: Webhook endpoint exists (server/src/modules/payments/payments.controller.ts) with basic handling. Signature verification is noted as pending.
- Remediation: Implement signature verification using Stripe SDK (construct event from raw body and signature header), return 2xx only after successful verification and idempotent processing.

3) HTTPS & CORS
- Current status: Development PUBLIC_ORIGIN and NEXT_PUBLIC_API_ORIGIN are HTTP local addresses. Production must use HTTPS.
- Remediation: Configure production deployment to serve over HTTPS, enable HSTS, update PUBLIC_ORIGIN and NEXT_PUBLIC_API_ORIGIN to HTTPS, and restrict CORS to allowed origins.

4) Idempotency & duplicate handling
- Current status: Order update logic works but needs idempotency safeguards to avoid double-updating orders on multiple webhook deliveries.
- Remediation: Use idempotency keys, store processed event IDs (stripe event id) and ignore duplicates.

5) Rate limiting and WAF
- Current status: No rate limiting implemented at application level; no WAF configured.
- Remediation: Add rate limiting middleware for payment endpoints and configure a WAF or API gateway in front of the server in production.

6) Logging & monitoring
- Current status: Basic logging present; no centralized monitoring integrated (Sentry not configured).
- Remediation: Integrate Sentry or similar for error monitoring, and send relevant metrics to Prometheus/Grafana.

7) Input validation
- Current status: Some runtime checks exist, but strict schema validation is not enforced across payment endpoints.
- Remediation: Add schema validators (class-validator/Zod/Joi) to validate incoming requests and webhook payloads.

8) PCI scope
- Current status: Stripe Checkout is used which reduces PCI scope — GOOD.
- Remediation: Document remaining responsibilities for PCI and verify with Stripe guidance.

9) CI security checks
- Current status: No automated Semgrep/SAST configured.
- Remediation: Add Semgrep and dependency vulnerability scans to CI pipeline and block releases on critical failures.

10) Operational runbooks
- Current status: No runbook present.
- Remediation: Create an incident runbook describing steps to triage failed payments, webhook signature errors, and reconciliation.

Next recommended work order
1. Set STRIPE_WEBHOOK_SECRET in production secrets manager and implement webhook signature verification + idempotency.
2. Enforce HTTPS and restrict CORS.
3. Add rate limiting and WAF protections.
4. Integrate Sentry and configure alerting for payment flows.
5. Add CI security scans (Semgrep, dependency audits) and fix any critical issues before production.
