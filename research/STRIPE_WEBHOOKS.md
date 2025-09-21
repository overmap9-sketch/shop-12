# Stripe Webhooks — зачем нужен STRIPE_WEBHOOK_SECRET и как правильно работать

Этот документ объясняет, зачем нужен STRIPE_WEBHOOK_SECRET, как его использовать, тонкости безопасности, тестирование в sandbox и production, а также примеры реализации и рекомендации для надёжной обработки событий Stripe (checkout.session.completed и другие).

---

## Кратко: что такое webhook и почему он нужен
- Webhook — это механизм, с помощью которого Stripe отправляет HTTP‑запросы на ваш сервер о событиях (оплата прошла, сессия завершена, возврат, dispute и т.д.).
- Webhook нужен, чтобы сервер надежно узнавал о сост��янии платежа (например, payment_intent.succeeded или checkout.session.completed) и выполнял серверную логику: пометить заказ как "оплачен", инициировать отгрузку, прислать email и т.д.

## STRIPE_WEBHOOK_SECRET — что это и зачем
- STRIPE_WEBHOOK_SECRET (значение вида `whsec_...`) — это секрет, который Stripe выдаёт при создании подписанного вебхука (в Dashboard или через CLI).
- Stripe использует этот секрет, чтобы подписывать тело каждого webhook‑запроса и добавлять подпись в заголовок `stripe-signature`.
- Ваш сервер должен проверить подпись (verify signature) при получении webhook, чтобы убедиться, что запрос действительно от Stripe и не поддельный. Без подписи любой злоумышленник мог бы отправлять фейковые уведомления и помечать заказы как оплаченные.

## Почему проверка подписи критична
- Без проверки подписи злоумышленник может вызвать события, инициирующие «фальшивую» оплату — серьёзный вектор атаки.
- Подпись гарантирует целостность данных и аутентичность источника.
- Подпись также помогает защититься от повторных попыток и от атак типа replay (в комбинации с проверкой idempotency и времени события).

## Тонкости: запрос с "raw body" и middleware
- Stripe требует, чтобы при верификации подписи вы использовали точный необработанный (raw) body запроса — иначе проверка подписи провалится (из‑за изменения whitespace/encoding при парсинге JSON).
- В Express / Nest с express нужно включить `express.raw({ type: 'application/json' })` для маршрута вебхука, или подключать raw middleware до JSON‑парсера для пути `/api/payments/webhook`.
- В Nest (как в нашем проекте) это можно сделать через `app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))` в `main.ts` — как уже реализовано в проекте.

## Пример проверки подписи (Node.js / Stripe SDK)
```ts
// Пример обработчика webhook (Express/Nest-friendly)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

// Вызов внутри контроллера:
const sig = req.headers['stripe-signature'] as string;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
let event: Stripe.Event;
try {
  if (!webhookSecret) throw new Error('Webhook secret is not configured');
  // req.body должен быть raw Buffer/string
  event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
} catch (err) {
  console.error('Webhook signature verification failed:', err.message);
  return res.status(400).send(`Webhook Error: ${err.message}`);
}

// Надёжно обрабатываем event.type
if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session;
  // Mark order paid by session.id
}
res.json({ received: true });
```

> Важно: `req.body` здесь — именно необработанный (raw) контент, не JSON‑объект.

## Тестирование в sandbox (локально)
- Способ 1 — Stripe Dashboard: можно вручную отправлять тестовые события через интерфейс webhooks.
- Способ 2 — Stripe CLI (рекомендуется):
  1. Установите Stripe CLI (https://stripe.com/docs/stripe-cli).
  2. Выполните `stripe listen --forward-to localhost:4000/api/payments/webhook` — CLI создаст временный webhook и выведет `webhook secret`.
  3. Выполните тестовый платёж или запустите `stripe trigger checkout.session.completed`.
  4. CLI шлёт реальные подписанные события на ваш локальный endpoint: подпись корректно проверится при наличии STRIPE_WEBHOOK_SECRET.

## Поведение при отсутствии STRIPE_WEBHOOK_SECRET (чего следует избегать)
- В нашем проекте мы добавили fallback: если STRIPE_WEBHOOK_SECRET не задан, код пытается парсить тело напрямую и не проверяет подпись. Это удобно для быстрой разработки, но небезопасно для публичных/production систем.
- Риск: уязвимость к поддельным событиям; не рекомендуется для публичного окружения.

## Idempotency и дублированные события
- Stripe может повторять отправку события, если сервер ответил ошибкой или неуспешно. Обработчик должен быть идемпотентным.
- Как сделать идемпотентным:
  - Используйте уникальный ключ (например `session.id` или `event.id`) и храните обработанные event IDs в БД/кэше; если событие уже обработано — игнорировать.
  - Для операций, которые изменяют состояние (создание заказа, пометка оплаты) — применяйте проверки на существующие заказы/статусы.

## Как привязать webhook к локальному заказу (recommended flow)
1. При создании Checkout Session сохраняйте заказ в вашей базе с полем `sessionId` и статус `pending`.
2. Когда Stripe пришлёт `checkout.session.completed`, найдите заказ по `sessionId` и пометьте как `paid`.
3. Эта модель защищает от race conditions и даёт явную связь session ↔ order.

## Безопасность и доступы
- STRIPE_SECRET_KEY — держите в секрете (на сервере). Никогда не выкладывайте его в клиентский код или репозиторий.
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — можно хранить в публичных фронтенд‑файлах (pk_), он не секретен.
- STRIPE_WEBHOOK_SECRET — тоже держите в секрете; храните в environment variables/secret manager.

## Советы для продакшн
- Настройте HTTPS на вашем сервере, используйте публичный endpoint (или через reverse proxy) для Stripe webhook.
- В Stripe Dashboard добавьте URL вашего продакшн webhook и сохраните `whsec_...` secret.
- Включите retry и логирование webhook событий — полезно для отладки.
- Обработку webhook выполняйте максимально быстро (асинхронная очередь/фоновые задачи): желательно получать событие, валидация и по��тавить задачу в очередь для долгой обработки.

## Полезные практики и примеры
- Сохраняйте `event.id` в таблице `stripe_events` с метаданными, статусом обработки и timestamp'ом.
- Для больших нагрузок используйте очередь (Bull, RabbitMQ) — вебхук ставит задачу в очередь, где воркеры делают долгую работу (отправки почты, генерация PDF, fulfilment).
- Для локальной разработки пользуйтесь Stripe CLI, оно даёт минимальные проблемы с NAT/брандмауэром.

## Пример конфигурации (server/.env)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # получаете из Stripe Dashboard или CLI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Вывод и рекомендации
- Для безопасности в production необходимо настроить STRIPE_WEBHOOK_SECRET и проверять подпись каждого входящего webhook.
- Для локальной разработки используйте Stripe CLI и временно установ��те webhook secret, чтобы тесты были максимально приближены к продакшену.
- Никогда не отключайте верификацию подписи на публично доступном сервере.

Если хотите, могу:
- Добавить в проект пример хранения event.id для идемпотентной обработки (server side).
- Настроить endpoint `/api/payments/webhook` так, чтобы он возвращал 200 только после успешного постановки таски в очередь и фиксировал event.id в orders/stripe_events.
- Установить STRIPE_WEBHOOK_SECRET в окружении (если пришлёте секрет или разрешите мне его добавить).
