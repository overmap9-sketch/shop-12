# PaintHub — Frontend (Next.js)

Полноценный фронтенд e‑commerce (Next.js + TypeScript + Tailwind + Redux Toolkit) с административной панелью, загрузкой изображений и проксированием API к бэкенду.

## Содержание
- [Требования](#требования)
- [Быстрый старт (толь��о фр��нт)](#быстрый-ста��т-тольк��-фронт)
- [Быстрый старт (фронт + бэкенд вместе)](#быстрый-старт-фронт--бэкенд-вместе)
- [Переменные окружения](#переменные-окружения)
- [Скрипты npm](#скрипты-npm)
- [Архитектура проекта](#архитектура-проекта)
- [Потоки данных и стейт-менеджм��нт](#потоки-данных-и-стейт-менеджмент)
- [Работа с API и прокси](#работа-с-api-и-прокси)
- [Загрузка файлов/изо��ражений](#загрузка-файловизображений)
- [Модули фронтенда](#модули-фронтенда)
- [Локализация и темы](#локализация-��-темы)
- [Траблшутинг](#траблшутинг)

---

## Требования
- Node.js 18+ (рекомендовано 18/20/22)
- npm 9+

---

## Быстрый старт (только фронт)
1. Перейдите в каталог фронта:
   ```sh
   cd front
   ```
2. Установите зависимости:
   ```sh
   npm install
   ```
3. Скопируйте переменные окружения и при необходимости отредактируй��е:
   ```sh
   cp .env.example .env.local
   # Убедитесь, что NEXT_PUBLIC_API_ORIGIN указывает на работающий бэкенд
   ```
4. Запустите dev-сервер:
   ```sh
   npm run dev
   ```
5. Откройте http://localhost:3000

---

## Быстрый старт (фронт + бэкенд вместе)
В одном процессе (из корня репозитория):
```sh
sh -c "cd server && npm run build && node dist/main.js & cd front && npm run dev"
```
Либо в двух терминалах:
- Терминал А (бэк��нд):
  ```sh
  cd server
  npm install
  npm run build
  npm start   # http://localhost:4000
  ```
- Терминал Б (фронт):
  ```sh
  cd front
  npm install
  npm run dev # http://localhost:3000
  ```
Прокси: фронт проксирует запросы к бэкенду через Next.js rewrites (/api и /uploads) на адрес из `NEXT_PUBLIC_API_ORIGIN`.

---

## Переменные окружения
Файл-шаблон: `front/.env.example` (скопируйте в `.env.local`). Также доступен файл `front/env.local.example` с теми же ключами для удобства.

Доступные ключи:
- `NEXT_PUBLIC_API_ORIGIN` — адрес бэкенда (например, `http://localhost:4000`). Используется для п��оксирования `/api/*` и `/uploads/*`.
- `PORT` — порт dev-серв��ра Next.js (по умолчанию 3000).
- `NEXT_PUBLIC_ALLOWED_DEV_ORIGINS` — список доменов (через запятую), которым разрешён dev-доступ (например, дом��н предпросмотра).
- `NEXT_TELEMETRY_DISABLED` — опционально выключает телеметрию Next.js (`1` чтобы выключить).

> Примечание: порт бэкенда задаётся на стороне сервера (по умолчанию 4000). В фронте ��н не управляется, но должен совпадать с `NEXT_PUBLIC_API_ORIGIN`.

---

## Скрипты npm
В каталоге `front/` доступны:
- `npm run dev` — запуск Next.js dev-сервера
- `npm run build` — сборка
- `npm run start` — запуск собранного приложения
- `npm run lint` — линтинг исходников

---

## Архитектура проекта
Ключевые папки:
- `front/src/app/` — маршруты Next.js (App Router)
- `front/src/core/` — Redux store, AppProvider и хуки
- `front/src/views/` — страницы/виды (Admin, Auth и т.д.)
- `front/src/features/` — Redux-слайсы (auth, cart, catalog, currency, theme)
- `front/src/shared/api/` — API-слой (axios-инстанс и доменные клиенты)
- `front/src/shared/themes/` — темы и провайдеры
- `front/src/components/` — переиспользуемые UI-компоненты
- `front/src/widgets/` — составные UI-блоки (Header, Footer, Grids)

Маршрутизация:
- Страницы в `front/src/app/*` используют компоненты из `front/src/views/*`.
- `react-router-dom` замаплен на shim (см. `front/tsconfig.json`) дл�� плавной миграции.

---

## Потоки данных и стейт-менеджмент
Стек: Redux Toolkit + TypeScript
- Store: `front/src/core/store.ts`
- Слайсы: `features/*` (auth, cart, catalog, currency, theme)
- Паттерн:
  1. UI ��испатчит action/async thunk
  2. Thunk вызывает доменный API-клиент из `shared/api` (см. `shared/config/api.ts`)
     - Интерцептор добавляет `Authorization` из localStorage
     - Базовый URL — `/api`, проксируется в бэкенд через rewrites
  3. Reducer обновляет срез состояния
  4. Компоненты читают данные через selectors (`useAppSelector`)

Хранилище токена:
- localStorage: `ecommerce_auth_token` / `auth_token` / `admin-token`

---

## Работа с API и прокси
- Конфигурация прокси в `front/next.config.mjs`:
  - `/api/:path*`    → `${NEXT_PUBLIC_API_ORIGIN}/api/:path*`
  - `/uploads/:path*`→ `${NEXT_PUBLIC_API_ORIGIN}/uploads/:path*`
- `NEXT_PUBLIC_ALLOWED_DEV_ORIGINS` — список источников, разрешённых в dev-режиме.

HTTP-клиент:
- `front/src/shared/config/api.ts` — axios-инстанс с интерц��птором токена.

---

## Загрузка фа��лов/изображений
UI-компонент: `front/src/components/ui/ImageUploader.tsx`
API-клиент: `front/src/shared/api/images.ts`
- Одиночная загрузка: POST `/api/files/images` (multipart/form-data, поле `file`)
- Пакетная загрузка: POST `/api/files/images/many` (поле `files`)
- В ответе бэкенд возвращает метаданные файла, фронт сохран��ет `publicPath` как URL

Интеграции:
- Продукты (Admin): `front/src/views/admin/ProductForm.tsx` — массив изображений товара
- Категории (Admin): `front/src/views/admin/CategoryForm.tsx` — одино��ное изображение

Требования к доступу:
- Для загрузки необходим валидный токен (роль `admin` или разрешение `files:upload`).

---

## Модули фронтенда
- Auth: вход/регистрация, токен в localStorage, интерцептор подхватывает заголовок
- Products (Admin): формы добавления/редактирования, загрузка изображений, категории, атрибуты
- Categories (Admin): иерархия, изображение, с��ртировка
- Cart/Favourites: базовые операции корзины и избранного

---

## Локализация и темы
- i18n: `front/src/shared/config/i18n.ts`, ресурсы в `front/src/shared/locales/{en,es}`
- Темы: `front/src/shared/themes/*`, провайдер `ThemeProvider`

---

## Stripe (кратко)
- Настройте ключи в front/.env.local: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`, `PUBLIC_ORIGIN`.
- Бэкенд: `STRIPE_SECRET_KEY=sk_test_...`, `STRIPE_WEBHOOK_SECRET=whsec_...`, `PUBLIC_ORIGIN` в server/.env.
- Webhook: используйте точный путь `/api/payments/webhook`.
  - Stripe CLI (локально): `stripe listen --forward-to http://localhost:4000/api/payments/webhook`
  - С другой машины: `--forward-to http://<SERVER_IP>:4000/api/payments/webhook`
- Страница success показывает `pending`, пока вебхук не дойдёт до сервера.
- Подробнее: docs/stripe_integration_and_webhooks.md

## Auth & Checkout Guards (кратко)
- Админ-маршруты доступны только авторизованным администраторам; иначе показывается NotFound (без редирект-лупов).
- Страница /admin/login рендерится без админ‑лейаута, чтобы избежать циклов.
- Checkout требует авторизации: при отсутствии токена — редирект на /login?returnTo={текущий URL}, после входа выполняется возврат.
- Подробнее: todos/auth_and_checkout_guards.md

## Checkout: SEO и Suspense (Next.js)
- Страницы `/checkout/success` и `/checkout/cancel` — серверные и рендерят клиентские компоненты внутри `<Suspense>` с доступным `fallback` (aria-busy).
- Использование `useSearchParams()` в клиентских компонентах требует обёртки в `Suspense`, иначе при сборке возможен CSR bailout.
- Эти страницы помечены `robots: noindex, nofollow` и имеют ��анонические ссылки, чтобы не попадать в индекс.
- Важные env: `PUBLIC_ORIGIN`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## Траблшутинг
- 401 при загрузке/запросах: проверьте наличие токена и права `files:upload` (или роль admin)
- CORS/предпросмотр: добавьте домен пред��росмотра в `NEXT_PUBLIC_ALLOWED_DEV_ORIGINS`
- Не видно загруженные файлы: убедитесь, что ��экенд раздаёт `/uploads`, а фронт проксирует этот путь
- 404 от API: проверьте `NEXT_PUBLIC_API_ORIGIN` и доступность бэкенда `/api/*`

## Конфигурация
- Все запросы фронта направляются на `${NEXT_PUBLIC_API_ORIGIN}/api` (см. front/.env.example)
- Токен хранится в localStorage под ключом `ecommerce_auth_token`; фронт автоматически добавляет Authorization
- Проверка сессии выпол��ается запросом `GET /api/auth/me`

Подробнее: docs/CONFIGURATION.md

## Быстрое исправление "Failed to fetch" (CORS / прокси)

Если вы увидели в к��талоге ошибку "Error Loading Products / Failed to fetch", рекомендованный и быстрый фикс для разработки — настроить CORS на бэкенде под ваш фронтенд:

1) Скопируйте `server/.env.example` → `server/.env` и убедитесь, что там указано:

   CORS_ORIGIN=http://localhost:3000

2) Перезапустите бэкенд:

   cd server && npm run start:dev

Почему это работает: фронт отправляет запросы с credentials, поэтому бэкенду нужно отвечать конкретным Origin вместо `*` — браузер примет такой ответ и запросы перестанут блокироваться.

Альтернатива: в продакшне используйте единый origin (reverse proxy) или корректно перечисляйте разрешённые origin в конфигурации сервера.

См. также: docs/CORS_AND_PROXY.md

---

## Полный справочник переменных окружения (front/.env.local)
Скопируйте шаблон: `front/.env.example` → `front/.env.local` и укажите значения.

- PUBLIC_ORIGIN — базов��й origin сайта (каноникал, sitemap, Open Graph). Пример: http://localhost:3000 или https://shop.example.com
- PORT — порт dev-сервера Next.js (по умолчанию 3000)
- NEXT_PUBLIC_API_ORIGIN — origin бэкенда для прокси `/api` и `/uploads`. Пример: http://localhost:4000
- NEXT_PUBLIC_ALLOWED_DEV_ORIGINS — дополнительные origin через запятую, которым разрешён доступ в dev/preview
- NEXT_TELEMETRY_DISABLED — отключение телеметрии Next.js (1 — отключить)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — publishable ключ Stripe (pk_test_... в dev) для фронтенда

> Примечание: PUBLIC_ORIGIN также используется для генерации sitemap и канонических ссылок; убедитесь, что это корректный публичный URL в продакшене.

