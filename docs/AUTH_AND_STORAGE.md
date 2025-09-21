# Auth, Storage Switching, and Environment Configuration

This document consolidates how authentication works, how to switch storage backends, and which environment variables to set for production.

## Overview
- Frontend: Next.js app in `front/`
- Backend: NestJS app in `server/`
- Storage backends: JSON files (default) or PostgreSQL via Sequelize (JSONB documents table)

## Environment Variables

Create env files based on templates:
- Frontend: copy `front/.env.example` to `front/.env.local`
- Backend: copy `server/.env.example` to `server/.env`

### Backend (`server/.env`)
- PORT: HTTP port (default 4000)
- CORS_ORIGIN: Allowed origins (string or `*`)
- STORAGE_DRIVER: `json` | `sequelize` (default `json`)
- DATA_DIR: JSON storage path (default `./data`)
- UPLOAD_DIR: Uploads folder (default `./uploads`)
- UPLOAD_MAX_FILE_SIZE: Max upload size in bytes (default 5MB)
- UPLOAD_ALLOWED_MIME: Allowed mime patterns (e.g., `image/*`)
- JWT_SECRET: Secret for signing JWTs (REQUIRED in production)
- JWT_EXPIRES_IN: Token lifetime in seconds (default `3600`)
- ALLOW_MOCK_TOKENS: `true`/`false` (dev only)
- ADMIN_EMAIL / ADMIN_PASSWORD: Initial admin seeded on first run
- DATABASE_URL: Postgres connection string (required if `STORAGE_DRIVER=sequelize`)

### Frontend (`front/.env.local`)
- NEXT_PUBLIC_API_ORIGIN: Backend base URL (e.g., `http://localhost:4000`)
- NEXT_PUBLIC_ALLOWED_DEV_ORIGINS: Comma-separated dev origins (optional)
- NEXT_TELEMETRY_DISABLED: `1` to disable Next telemetry

## Switching Storage Backends

1) JSON (default)
- `STORAGE_DRIVER=json`
- Ensure `DATA_DIR` is writable

2) PostgreSQL (Sequelize)
- `STORAGE_DRIVER=sequelize`
- Set `DATABASE_URL=postgres://user:pass@host:5432/db`
- Restart the server; the `documents` table will be created automatically

No code changes required. `DataStoreModule` reads `STORAGE_DRIVER` and injects the appropriate implementation.

## Authentication

Endpoints (all prefixed with `/api`):
- POST `/auth/login` — body: `{ email, password }`
- POST `/auth/register` — body: `{ email, password, firstName, lastName }`
- GET `/auth/me` — requires `Authorization: Bearer <JWT>`

Notes:
- JWT is signed with `JWT_SECRET` and expires in `JWT_EXPIRES_IN` seconds.
- On first run, if no users exist, an admin is created using `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- Write operations for products and categories require JWT and permissions:
  - products: `products:create`, `products:update`, `products:delete`
  - categories: `categories:create`, `categories:update`, `categories:delete`
- File uploads require `files:upload`.

## Frontend Integration

- All API calls use `NEXT_PUBLIC_API_ORIGIN` (absolute) to reach the backend directly.
- Token is stored in localStorage under `ecommerce_auth_token` (also checked: `auth_token`, `admin-token`).
- Admin panel guards call `/auth/me` to verify session before rendering.
- Static files uploaded on the backend are served from `/uploads/*`.

## Production Checklist
- Set a strong `JWT_SECRET` and non-default `ADMIN_PASSWORD`
- Choose and configure storage: `STORAGE_DRIVER`+`DATABASE_URL` (for Postgres)
- Configure `CORS_ORIGIN`
- Ensure `DATA_DIR` and `UPLOAD_DIR` are writable
- Disable `ALLOW_MOCK_TOKENS` in production
- Configure `NEXT_PUBLIC_API_ORIGIN` on the frontend

See also: `docs/CONFIGURATION.md` for a broader configuration guide.
