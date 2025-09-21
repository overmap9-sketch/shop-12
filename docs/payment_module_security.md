Безопасность модуля оплаты — конкретно для текущей реализации (Stripe)

Объём
Этот документ даёт конкретные, применимые к текущему репозиторию инструкции и патч‑фрагменты для приведения Stripe‑интеграции в состояние production‑ready.
Файлы с интеграцией в проекте (точные пути)
- Backend (NestJS): server/src/modules/payments/payments.controller.ts
- Backend (service): server/src/modules/payments/payments.service.ts
- Raw body middleware: server/src/main.ts (app.use('/api/payments/webhook', express.raw({ type: 'application/json' })))
- Frontend (Checkout): front/src/components/CheckoutButton.tsx
- Документация/тесты: research/STRIPE_WEBHOOKS.md, docs/STRIPE_INTEGRATION.md

Кратко о текущем состоянии (фиксированные факты)
- Checkout Session создаётся в server/src/modules/payments/payments.controller.ts и сохраняется как запись order с полем sessionId и status: 'pending'. (см. lines ~42-59).
- Вебхук реализован в server/src/modules/payments/payments.controller.ts, но при отсутствии STRIPE_WEBHOOK_SECRET код падает back to unsafe fallback: парсит JSON без верификации подписи (lines ~73-80, 75-76).
- main.ts уже добавляет raw middleware для пути /api/payments/webhook (server/src/main.ts line ~23).
- Фронтенд делает POST /api/payments/create-checkout-session в front/src/components/CheckoutButton.tsx и затем вызывает stripe.redirectToCheckout с sessionId (lines ~7-24).

Конкретные требования для production (и как их реализовать в коде)
1) Обязательная проверка подписи вебхуков
- Что менять: заменить текущую ветку, допускающую fallback, на поведение, которое всегда требует STRIPE_WEBHOOK_SECRET в окружении и возвращает 400 при его отсутствии.
- Где: server/src/modules/payments/payments.controller.ts (метод webhook)
- Пример патча (заменяет текущий try/catch блок signature verification):

```ts
// server/src/modules/payments/payments.controller.ts (внутри webhook handler)
const sig = req.headers['stripe-signature'] as string | undefined;
const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not configured');
  return res.status(500).send('Webhook not configured');
}
let event: Stripe.Event;
try {
  const raw = (req as any).rawBody || req.body; // main.ts must set raw body middleware for this route
  if (!sig || !raw) throw new Error('Missing signature or raw body');
  event = this.stripe.webhooks.constructEvent(raw, sig, webhookSecret);
} catch (err: any) {
  console.error('Webhook signature verification failed:', err?.message || err);
  return res.status(400).send(`Webhook Error: ${err?.message || err}`);
}
```

- Приём валидации: принять только после добавления STRIPE_WEBHOOK_SECRET в production secrets и теста через Stripe CLI:
  - `stripe listen --forward-to https://<prod>/api/payments/webhook` и подтверждение, что `stripe.webhooks.constructEvent` проходит.

2) Идемпотентная обработка вебхуков (пока в коде отсутствует)
- Что менять: перед применением изменений по event (checkout.session.completed) проверять, обработан ли уже event.id, и сохранять event.id после успешной обработки.
- Где: server/src/modules/payments/payments.controller.ts (в webhook handler), дополнительная коллекция/таблица 'stripe_events' в DataStore.
- Пример фрагмента (вставить сразу после верификации event):

```ts
// Простая идемпотентность с т��кущим DataStore (в проекте используется json DB api)
// 1) Проверяем, не обработан-ли event
const processed = (await this.db.all<any>('stripe_events')).find(e => e.id === event.id);
if (processed) {
  console.log('Webhook event already processed', event.id);
  return res.json({ received: true });
}

// 2) Обрабатываем event (пример для checkout.session.completed)
if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session;
  const sessionId = session.id;
  const orders = await this.db.all<any>('orders');
  const order = orders.find(o => o.sessionId === sessionId);
  if (order && order.status !== 'paid') {
    await this.db.update('orders', order.id, { status: 'paid', dateModified: new Date().toISOString() } as any);
  }
}

// 3) Сохраняем запись о событии как обработанном
await this.db.insert('stripe_events', { id: event.id, type: event.type, processedAt: new Date().toISOString(), raw: JSON.stringify(event).slice(0, 2000) } as any);
```

- Acceptance criteria: после отправки тестового `checkout.session.completed` через Stripe CLI в DB должна появиться запись в `stripe_events` с event.id и статусом обработки; order.status меняется на 'paid' ровно один раз.

3) Надёжная проверка целостности данных при создании сессии
- Что менять: убедиться, что createCheckoutSession не доверяет входным thành предметам (items) и всегда вычисляет итог на сервере по ID товаров из базы, что уже реализовано (см. lines ~23-38 и вычисление totalAmount).
- Рекомендация: добавить строгую валидацию тела запроса (schema). Используйте class-validator/Zod. Минимальная проверка в текущих методах:
  - items — массив объектов с productId:string и quantity:number > 0
  - successUrl и cancelUrl — если передаются, проверить, что они используют PUBLIC_ORIGIN или являются подпадающими под allowlist

- Acceptance criteria: malformed requests отклоняются с 400, итоговая сумма в создаваемом заказе совпадает с суммой, рассчитанной по данным из server/data/products.json.

4) Проверка соответствия origin/redirect (защита open redirect)
- Где: server/src/modules/payments/payments.controller.ts (переменная origin вычисляется через PUBLIC_ORIGIN). Рекомендуется игнорировать переданные successUrl/cancelUrl либо валидировать их строго против PUBLIC_ORIGIN.

Пример замены:
```ts
const origin = (this.config.get('PUBLIC_ORIGIN') || 'http://localhost:3000').replace(/\/$/, '');
const allowedSuccessUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
const allowedCancelUrl = `${origin}/checkout/cancel`;
// передавать только allowed urls в Stripe session
```

5) Логи, мониторинг и утилиты для отладки
- Где: payments.controller.ts и payments.service.ts — улучшить структурированные логи (correlation id при create-checkout-session и webhook), не логировать секреты.
- Acceptance criteria: при каждом запросе create-checkout-session в логах есть session.id, а при вебхуке — event.id.

6) Ограничение доступа и rate‑limit
- Что: добавить rate limiting middleware на маршруты POST /api/payments/create-checkout-session и POST /api/payments/webhook.
- Где: можно добавить глобально или в модуле (server/src/modules/payments/payments.module.ts) либо через API Gateway/WAF.
- Acceptance criteria: повторный поток запросов (> X/s) получает 429.

7) Конфигурация продакшен‑окружения
- Env vars to set in production: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PUBLIC_ORIGIN (https://...), NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (frontend env)
- Не хранить секреты в репозитории; использовать секретный менеджер хостинга.

8) Тесты и CI
- Добавить интеграционные тесты, которые используют Stripe CLI для forwarding и проверяют, что webhook обрабатывается и создаётся запись в stripe_events.
- CI: Semgrep + npm audit в pipeline.

Если хотите, могу подготовить патч‑фрагменты кода (PR) для:
- принудительного требование STRIPE_WEBHOOK_SECRET + проверка подписи;
- запись event.id в stripe_events и идемпотентную обработку;
- валидацию входа create-checkout-session;
- basic rate limiting middleware.
