Соответствие безопасности — сопоставление чеклистов с текущей реализацией

1) STRIPE_WEBHOOK_SECRET
- Текущее состояние: переменная поддерживается в коде, но при её отсутствии контроллер fallback'ится на небезопасный парсинг (server/src/modules/payments/payments.controller.ts lines ~73-80).
- Рекомендация: явно требовать STRIPE_WEBHOOK_SECRET для production. Если не задан — вернуть 500/ошибку и не обрабатывать вебхуки.
- Проверка: установить secret через окружение и выполнить `stripe listen --forward-to <prod-url>/api/payments/webhook` — webhook должен проходить проверку.

2) Webhook handler
- Текущее состояние: raw middleware есть в server/src/main.ts (строка app.use('/api/payments/webhook', express.raw({ type: 'application/json' })) ).
- Рекомендация: убедиться, что (req as any).rawBody заполняется и использовать именно его при верификации.

3) Idempotency
- Текущее состояние: порядок действий при checkout.session.completed меняет order.status без проверки обработанных event.id.
- Рекомендация: создать коллекцию/таблицу 'stripe_events' и записывать event.id при успешной обработке. Перед обработкой проверять наличие записи.

4) Создание сессии (create-checkout-session)
- Текущее состояние: сервер вычисляет line_items и totalAmount из базы (server/src/modules/payments/payments.controller.ts lines ~23-36). Это корректно.
- Рекомендация: добавить валидацию входа и проверить, что сохранённый order содержит sessionId и status: 'pending' перед возвратом session.id клиенту.

5) Frontend
- Текущее состояние: front/src/components/CheckoutButton.tsx вызывает POST /api/payments/create-checkout-session и использует loadStripe + redirectToCheckout (lines ~7-24).
- Рекомендация: после получения data.id приложение может показывать confirmation UI, но не полагаться на клиентскую редирекцию как единственный источник истины — сервер определяет оплату через webhook.

6) Rate limiting & WAF
- Текущее состояние: отсутствует.
- Рекомендация: добавить rate limiting на уровне приложения или перед сервером (NGINX, Cloudflare, API Gateway).

7) Monitoring
- Текущее состояние: базовые console.logs. Необходимо интегрировать Sentry/Prometheus.
- Рекомендация: добавлять context: sessionId/eventId в логи и отправлять ошибки в Sentry.

План работ (первоначальный приоритет)
1. STRIPE_WEBHOOK_SECRET обязательный + signature verification (payments.controller.webhook)
2. Idempotency (stripe_events) + tests через Stripe CLI
3. Enforce PUBLIC_ORIGIN https и redirect allowlist
4. Add rate limiting and basic monitoring

Если подтверждаете, начну с пункта 1 (реализация обязательной проверки подписи и отказа от fallback).
