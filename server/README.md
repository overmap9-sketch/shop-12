# Backend (NestJS) — Storage-switchable API

This backend provides a simple e‑commerce API (products, categories, cart, favourites, orders) and supports two storage drivers:
- JSON files on disk (default)
- PostgreSQL via Sequelize (JSONB documents table)

## Features

- Products: list with filtering/sorting/pagination, get, create, update, delete
- Categories: list by parent/active, nested tree, get, create, update, delete
- Cart: per-user cart with add/update/remove/clear and totals (tax/shipping)
- Favourites: per-user favourites add/remove/clear/list
- Orders: create/list per user
- CORS, global validation pipe, versioned API prefix (/api)

## Quick start (JSON storage)

1) Install dependencies

```
cd server
npm install
```

2) Run in dev

```
npm run start:dev
```

3) Build and run

```
npm run build
npm start
```

Environment variables (optional):
- PORT: default 4000
- CORS_ORIGIN: default "*"
- DATA_DIR: folder for JSON data files (default: ./data)
- STORAGE_DRIVER: set to "json" (default)

## Switch to PostgreSQL (Sequelize)

Requirements: a Postgres database and connection string.

1) Provide env vars:
- STORAGE_DRIVER=sequelize (or "postgres")
- DATABASE_URL=postgres://user:password@host:5432/dbname

2) Install deps (first time only):

```
cd server
npm install
```

3) Run

```
npm run start:dev
```

The backend will connect to Postgres, create the table "documents" if not present, and store entities as JSONB documents with fields:
- id (uuid), collection (text), data (jsonb), dateCreated (timestamp), dateModified (timestamp)

## How storage selection works

- The app uses a DataStore abstraction (`DATA_STORE` provider) with methods: all, saveAll, findById, insert, update, remove.
- `JsonDbService` implements this over local JSON files.
- `SqlDbService` implements this over Postgres (Sequelize).
- `DataStoreModule` reads `STORAGE_DRIVER` and binds the provider to the chosen implementation.

## API Endpoints (prefix /api)

- GET /products — query: q, category, subcategory, isFeatured, isNew, isOnSale, sortField, sortOrder, page, limit
- GET /products/:id
- POST /products
- PATCH /products/:id
- DELETE /products/:id

- GET /categories — query: parentId, isActive
- GET /categories/tree
- GET /categories/:id
- POST /categories
- PATCH /categories/:id
- DELETE /categories/:id

- GET /cart?userId=...
- POST /cart/add — body: { userId?, productId, quantity }
- PATCH /cart/item/:id — body: { userId?, quantity }
- DELETE /cart/item/:id?userId=...
- POST /cart/clear — body: { userId? }

- GET /favourites?userId=...
- POST /favourites/:productId?userId=...
- DELETE /favourites/:productId?userId=...
- POST /favourites/clear?userId=...

- GET /orders?userId=...
- POST /orders — body: { userId?, items, total, ... }

Notes:
- userId defaults to "guest" if omitted.
- Tax/shipping are computed in the cart service (8% tax; free shipping >= 100, else 10).

## Configuration Reference

- PORT: number (default 4000)
- CORS_ORIGIN: string or array (default *)
- STORAGE_DRIVER: json | sequelize | postgres (default json)
- DATA_DIR: path for json driver (default ./data)
- DATABASE_URL: postgres connection string for sequelize driver

## Troubleshooting

- Cannot connect to Postgres: ensure DATABASE_URL is correct and database is reachable.
- Using JSON storage accidentally: set STORAGE_DRIVER=sequelize and restart.
- Permissions / data folder: set DATA_DIR to a writable location when using json driver.
- Typescript build: run `npm run build` before `npm start`.

## Configuration & Auth

See docs/CONFIGURATION.md for full env reference and storage switching.

Key envs (server/.env):
- PORT, CORS_ORIGIN
- STORAGE_DRIVER=json|sequelize, DATA_DIR, UPLOAD_DIR
- JWT_SECRET, JWT_EXPIRES_IN, ALLOW_MOCK_TOKENS
- ADMIN_EMAIL, ADMIN_PASSWORD (admin is seeded on first run)
- DATABASE_URL (when using sequelize)

Auth endpoints:
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me (JWT required)

## Environment variables (server/.env)
Copy `server/.env.example` → `server/.env` and set values:

Core
- PORT — порт сервера (по умолчанию 4000)
- CORS_ORIGIN — разрешённый origin фронтенда (например, http://localhost:3000)

Storage & uploads
- STORAGE_DRIVER — json | sequelize | postgres
- DATA_DIR — каталог данных для json-драйвера
- UPLOAD_DIR — директория для загрузок, раздаётся как /uploads
- UPLOAD_MAX_FILE_SIZE — макс. размер файла (байты)
- UPLOAD_ALLOWED_MIME — допустимые mime-типы, через запятую (например, image/*)

Auth
- JWT_SECRET — секрет подписи JWT (укажите надёжное значение в продакшене)
- JWT_EXPIRES_IN — срок жизни токена (секунды или строка формата 1h/7d)
- ALLOW_MOCK_TOKENS — разрешить mock-токены в dev (true/false)
- ADMIN_EMAIL / ADMIN_PASSWORD — учётка администратора при первом запуске

PostgreSQL (если STORAGE_DRIVER=sequelize|postgres)
- DATABASE_URL — строка подключения (postgres://user:password@host:5432/db)
- SEQUELIZE_LOGGING — логирование SQL (true/false)

Public origin
- PUBLIC_ORIGIN — публичный origin (используется в редиректах/ссылках, платежах)

Stripe
- STRIPE_SECRET_KEY — секретный ключ (sk_test_... в dev)
- STRIPE_WEBHOOK_SECRET — секрет подписи webhook (whsec_...)
