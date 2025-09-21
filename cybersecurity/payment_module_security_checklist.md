Чеклист безопасности — Stripe интеграция (конкретно для этого репозитория)

Файлы/эндпоинты, которые нужно защитить
- POST /api/payments/create-checkout-session — server/src/modules/payments/payments.controller.ts (метод createCheckoutSession)
- POST /api/payments/webhook — server/src/modules/payments/payments.controller.ts (метод webhook)

1) Secrets
- STRIPE_SECRET_KEY: проверено — используется в server/src/modules/payments/payments.service.ts (constructor) и payments.controller.ts (lines ~10-12). Действие: хранить в production secrets manager.
- STRIPE_WEBHOOK_SECRET: текущий код допускает fallback если не задан (unsafe). Действие: в production обязать переменную; отклонять вебхуки без подписей.

2) Webhook signature verification
- Acceptance: server/src/modules/payments/payments.controller.ts должен использовать this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret). main.ts уже использует express.raw для пути /api/payments/webhook — подтвердить.

3) Idempotency
- Acceptance: существует коллекция 'stripe_events' (json DB) с записью event.id после успешной обработки; повторный event.id игнорируется. Файл: server/src/modules/payments/payments.controller.ts — добавить проверку через this.db.all('stripe_events').

4) Server-side pricing and validation
- Acceptance: итоговая сумма и line_items формируются исключительно с использованием server/data/products.json (в коде уже реализовано: this.db.findById('products', id)). Добавить schema validation для тела запроса.

5) Redirect origin allowlist
- Acceptance: success_url / cancel_url либо строятся только из PUBLIC_ORIGIN (recommended) либо проверяются на соответствие allowlist.

6) Rate limiting / WAF
- Acceptance: middleware или gateway возвращает 429 при превышении порога для create-checkout-session и webhook.

7) Logging & monitoring
- Acceptance: ло��и содержат session.id (при создании) и event.id (при обработке вебхуков); ошибки отправляются в Sentry (или аналог).

8) CI security
- Acceptance: Semgrep и npm audit/Snyk запущены в CI; сборка блокируется при критических уязвимостях.

9) Operational
- Acceptance: Runbook для инцидентов платежей (webhook signature errors, duplicate events, reconciliation) доступен в репозитории или внутр. docs.

Порядок работ для соответствия:
1. Настроить STRIPE_WEBHOOK_SECRET в production; запретить fallback в коде.
2. Реализовать идемпотентность (stripe_events) и проверить с помощью Stripe CLI.
3. Добавить schema validation для create-checkout-session.
4. Ограничить redirect URL и включить HTTPS (PUBLIC_ORIGIN).
5. Добавить rate limiting и WAF/слой API Gateway.
6. Интегрировать Sentry и настроить CI сканы.
