# CORS и прокси: как исправить "Failed to fetch" и варианты развёртывания

Этот файл объясняет причины ошибки "Failed to fetch" при загрузке продуктов, варианты её решения (dev и production), тонкие места и рекомендации на будущее.

## Почему возникает "Failed to fetch"
- Фронтенд делает запросы к API (в нашем проекте через API_BASE/`/api/*`).
- Браузер блокирует ответ, если CORS настроен неправильно: особенно опасна комбинация `Access-Control-Allow-Origin: *` и `Access-Control-Allow-Credentials: true` — браузер отвергнет такой ответ.
- В нашем коде фронт отправляет `credentials: 'include'`, поэтому бэкенд не может отвечать с `Access-Control-Allow-Origin: *` — нужно указать конкретный origin.

## Основные подходы для разработки (dev)

1) Настроить CORS на бэкенде (рекомендуемый и самый простой способ сейчас)
- Что делать:
  - В `server/.env` (или скопируйте `server/.env.example` → `server/.env`) установите:
    - `CORS_ORIGIN=http://localhost:3000`
  - Перезапустите бэкенд (`npm run start` / `npm run start:dev`).
- Почему работает:
  - Бэкенд будет отдавать `Access-Control-Allow-Origin: http://localhost:3000` и `Access-Control-Allow-Credentials: true`, браузер примет ответ с куки/credentials.
- Нюансы:
  - Не используйте `*` при включённых credentials.
  - Для предпросмотров (preview domains) добавьте их в `CORS_ORIGIN` (сервер может принимать список, либо перечислить домены в настройках). 

2) Варианты через прокси/реврайты (альтернативы)
- Next.js rewrites/proxy:
  - next.config.mjs может создать rewrite `/api/:path*` → `${NEXT_PUBLIC_API_ORIGIN}/api/:path*` когда `NEXT_PUBLIC_API_ORIGIN` задан.
  - Однако фронт также формирует `API_BASE` в `front/src/shared/api/http.ts`: если `NEXT_PUBLIC_API_ORIGIN` определён как реальный URL, фронт начнёт посылать запросы напрямую на этот URL (обходя прокси). Поэтому чистый прокси-воркаунд требует согласованных настроек.
- Reverse proxy (nginx / cloud load balancer):
  - В production лучше использовать reverse proxy и отдавать фронт и бэкенд под одним origin (например `example.com` и `example.com/api`). Тогда CORS не нужен.
  - Рекомендуется: фронт заботится о статике, а все API идут через тот же домен/поддомен.
- Разные подходы и их нюансы:
  - Установка `NEXT_PUBLIC_API_ORIGIN=internal` в кодовой базе переключит фронт на относительные `/api` запросы (API_BASE = `/api`), но next.config.mjs не создаст rewrite в таком случае — следите за тем, как именно формируется `API_BASE` и rewrites.
  - Прокси полезен, если вы хотите, чтобы браузер всегда обращался к тому же origin; но проще и быстрее для dev — настроить CORS на бэкенде.

## Production — что нужно сделать по‑настоящему
- Не доверяйте `*` и mock-опциям. В production:
  - Используйте HTTPS и корректные cookie/security flags.
  - Настройте бэкенд или reverse proxy так, чтобы фронтенд и API были под единым origin или корректно настроенным набором разрешённых origin.
  - Установите `JWT_SECRET`, отключите `ALLOW_MOCK_TOKENS`, задайте надёжный `ADMIN_PASSWORD`.
  - Используйте БД (Postgres + Sequelize) вместо JSON-файлов: `STORAGE_DRIVER=sequelize` и `DATABASE_URL`.
  - Настройте rate limiting, WAF, HTTPS и мониторинг (Sentry).

## Как переключиться прямо сейчас (рекомендуется)
1. В репозитории откройте `server/.env` (или создайте из `server/.env.example`).
2. Поставьте `CORS_ORIGIN=http://localhost:3000`.
3. Перезапустите бэкенд: `cd server && npm run start:dev`.
4. Убедитесь, что фронтенд использует `NEXT_PUBLIC_API_ORIGIN=http://localhost:4000` (в `front/.env.local`) — либо оставьте так, фронт будет обращаться по прямому URL и CORS будет корректен.

Это самый быстрый, безопасный и предсказуемый способ для разработки.

## Дополнительно — миграция на Postgres (кратко)
- Чтобы переключиться на Postgres:
  - В `server/.env`: `STORAGE_DRIVER=sequelize`, `DATABASE_URL=postgres://user:pass@host:5432/db`.
  - Перезапустите сервер; таблица `documents` будет создана автоматически.
- Для продакшна: поставьте надежную БД, резервное копирование и миграции схемы.

---

Если хотите — я могу автоматически обновить `server/.env.example` и добавить короткий раздел в README (сделано по запросу). Также могу помочь перезапусти��ь сервер с нужной переменной прямо сейчас.
