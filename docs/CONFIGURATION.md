# Deployment & Configuration

This document explains how to run the app in production-like mode, configure environment variables, switch storage backends, and the authentication flow.

## Overview
- Frontend: Next.js (front/)
- Backend: NestJS (server/)
- Storage backends: JSON files (default) or PostgreSQL via Sequelize

## Environment Variables

Create .env files based on the provided templates:
- server/.env (see server/.env.example)
- front/.env.local (see front/.env.example)

### Server (.env)
- PORT: HTTP port (default 4000)
- CORS_ORIGIN: Allowed origins (string or *)
- STORAGE_DRIVER: json | sequelize (default json)
- DATA_DIR: JSON storage path relative to project root (default ./data)
- UPLOAD_DIR: Uploads directory relative to project root (default ./uploads)
- UPLOAD_MAX_FILE_SIZE: Max upload size in bytes (default 5MB)
- UPLOAD_ALLOWED_MIME: Comma-separated list of allowed mime patterns (e.g., image/*)
- JWT_SECRET: Secret for signing JWTs (REQUIRED in prod)
- JWT_EXPIRES_IN: Token lifetime in seconds (default 3600)
- ALLOW_MOCK_TOKENS: true/false (dev only; allows tokens starting with mock_)
- ADMIN_EMAIL / ADMIN_PASSWORD: Initial admin seeded on first run
- DATABASE_URL: Postgres connection string (required if STORAGE_DRIVER=sequelize)
- SEQUELIZE_LOGGING: true/false (optional)

### Frontend (.env.local)
- NEXT_PUBLIC_API_ORIGIN: Backend base URL (e.g., http://localhost:4000)
- NEXT_PUBLIC_ALLOWED_DEV_ORIGINS: Comma-separated dev origins for Next.js previews
- NEXT_TELEMETRY_DISABLED: 1 to disable Next telemetry

## Switching Storage Backends

1) JSON (default)
- In server/.env: STORAGE_DRIVER=json
- DATA_DIR points to ./data (ensure writable)

2) PostgreSQL (Sequelize)
- In server/.env: STORAGE_DRIVER=sequelize
- Set DATABASE_URL=postgres://user:pass@host:5432/db
- Optional: SEQUELIZE_LOGGING=false
- Restart server

No code changes required. The DataStoreModule binds the appropriate implementation using STORAGE_DRIVER.

## Auth Flow

- Login: POST /api/auth/login { email, password }
- Register: POST /api/auth/register { email, password, firstName, lastName }
- Current user: GET /api/auth/me (requires Authorization: Bearer <token>)

Tokens are standard JWT signed with JWT_SECRET. Frontend stores the token in localStorage (ecommerce_auth_token) and automatically sends Authorization on each request.

Admin seeding: On first run, if no users are present, the server creates an admin (ADMIN_EMAIL/ADMIN_PASSWORD). Change these in production and rotate JWT_SECRET.

## File Uploads

- POST /api/files/images (multipart/form-data, field: file)
- POST /api/files/images/many (field: files)
- Public files are served from /uploads/*

Paths are stored relative to the project and resolved portably across OSes.

## Frontend API Calls

The frontend uses NEXT_PUBLIC_API_ORIGIN to call the backend directly (not Next internal API routes). Set this to your backend origin.

## Production Checklist
- Set strong JWT_SECRET and long, random ADMIN_PASSWORD
- Choose STORAGE_DRIVER and configure DATABASE_URL for Postgres
- Configure CORS_ORIGIN
- Ensure DATA_DIR and UPLOAD_DIR are writable
- Disable ALLOW_MOCK_TOKENS in production
- Review rate limiting, HTTPS, and reverse proxy settings as needed
