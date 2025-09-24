# Next.js App Router: useSearchParams, Suspense и SEO на транзакционных страницах

Эта памятка объясняет характерную ошибку сборки, её причины и надежные паттерны, чтобы больше не сталкиваться с CSR bailout / prerender ошибками при работе с `useSearchParams()`.

## Проблема
При сборке появляется ошибка:

- “useSearchParams() should be wrapped in a suspense boundary at page "/..."”
- “Error occurred prerendering page "/...". Export encountered an error ...”

Типичный кейс — страницы `/checkout/success` и `/checkout/cancel`.

## Причина
- `useSearchParams` из `next/navigation` — клиентский хук. Когда серверный компонент (страница/лейаут) рендерит компонент, который вызывает этот хук, Next.js требует явно обозначить границу перехода на клиент через `<Suspense>`.
- При статическом пререндеринге страницы, зависящие от `searchParams`, могут вызывать ошибки, если логика ожидает значения на клиенте (после редиректа, например из Stripe).

## Надёжные решения (паттерны)

1) Серверная страница + клиентский компонент под `<Suspense>` (рекомендуется)
- Страница (`page.tsx`) — серверный компонент: содержит `export const metadata`, SEO-мета, canonical и роботы.
- Клиентский компонент (`"use client"`) вызывает `useSearchParams`, получает `session_id` и т.п.
- На странице оборачиваем клиентский компонент в `<Suspense fallback=... aria-busy>`.

Пример:
```tsx
// app/(shop)/checkout/success/page.tsx (server component)
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ClientSuccess from '../ClientSuccess';

export const metadata: Metadata = {
  title: 'Checkout Success · PaintHub',
  description: 'Order confirmation and payment status after checkout.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/checkout/success' },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6" aria-busy>Loading…</div>}>
      <ClientSuccess />
    </Suspense>
  );
}
```
```tsx
// app/(shop)/checkout/ClientSuccess.tsx (client component)
"use client";
import { useSearchParams } from 'next/navigation';

export default function ClientSuccess() {
  const sp = useSearchParams();
  const sessionId = sp.get('session_id') || '';
  // ...fetch, render, skeletons
}
```

2) Парсинг query на сервере + передача в клиент (когда SSR уместен)
- Если нужно использовать значения query в SSR, читайте через аргумент страницы `Page({ searchParams })` и передавайте в клиент как пропсы. В клиенте избегайте повторного вызова `useSearchParams`.

```tsx
export default function Page({ searchParams }: { searchParams?: Record<string,string|string[]|undefined> }) {
  const page = Number(searchParams?.page || 1);
  return <ClientList initialPage={page} />;
}
```

3) Полностью клиентская страница (уступка SEO)
- Пометить страницу `"use client"` и не использовать `<Suspense>` на уровне страницы. Минус — потеря серверного рендера/метаданных. Для SEO-важных страниц не рекомендуется.

4) Управление стратегией рендера
- Если страница зависит от клиентских параметров и не должна пререндериться статически — используйте `export const dynamic = 'force-dynamic'` либо избегайте `next export` для таких страниц.

## SEO для транзакционных страниц (успех/отмена оплаты)
- Обязательно: `robots: { index: false, follow: false }` и `alternates.canonical` на путь страницы (без query).
- Семантика и a11y: skeleton/fallback с `aria-busy`, заголовки, правильные landmark-и.

## Частые анти-паттерны
- Вызов `useSearchParams` в серверном компоненте (включая косвенные импорты) — приводит к CSR bailout без явной границы Suspense.
- Динамические импорты без `ssr: false` там, где весь код — строго клиентский и зависит от `window` (иногда уместно `next/dynamic({ ssr: false })`).

## Чек-лист при добавлении страниц/компонентов
- Используете `useSearchParams`? Компонент должен быть client, а рендер — под `<Suspense>` из server-компонента.
- Нужен SSR и SEO? Читайте `searchParams` на сервере и передавайте пропсы в клиент.
- Транзакционные страницы? `noindex`, `canonical`, доступные skeleton-фоллбеки.
- Избегайте хардкода: public ссылки строить от `PUBLIC_ORIGIN`.

## Полезные env
- Front: `PUBLIC_ORIGIN`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Server: `PUBLIC_ORIGIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Готовый промпт д��я последующих задач
Используйте этот промпт в будущих запросах к ассистенту/генератору кода, чтобы избежать ошибок:

> Сгенерируй код для Next.js App Router (React 18) с обязательными правилами:
> 1) Любой код, где используется `useSearchParams` из `next/navigation`, размещай в клиентском компоненте и рендери ТОЛЬКО внутри `<Suspense>` из серверной страницы/лейаута, с доступным `fallback` (`aria-busy="true"`).
> 2) Если нужны значения query на сервере — используй сигнатуру `Page({ searchParams })` и передавай пропсы клиентам, не вызывая `useSearchParams` на сервере.
> 3) Транзакционные страницы (например, `/checkout/success`, `/checkout/cancel`) помечай `robots: noindex, nofollow` и добавляй `alternates.canonical` без query.
> 4) Не допускай CSR bailout / prerender ошибок. Для страниц, зависящих от query на клиенте, избегай статического экспорта или укажи `export const dynamic = 'force-dynamic'` при необходимости.
> 5) Соблюдай разделение Model/UI/API, a11y (aria‑атрибуты, семантика), оптимизацию LCP/CLS (skeletons, lazy images). Все публичные URL формируй от `PUBLIC_ORIGIN`, ключи держи в `.env` (без хардкода).

## Быстрые инструкции
- При появлении предупреждения «useSearchParams should be wrapped in a suspense boundary» — проверьте, что:
  - компонент с `useSearchParams` — client;
  - его рендер находится под `<Suspense>` в server-компоненте страницы;
  - транзакционные страницы имеют `noindex` и `canonical`.
- Для статических страниц читайте query через аргумент `searchParams` и избегайте клиентских хуков на сервере.
