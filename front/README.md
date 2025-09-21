# PaintHub Frontend (Next.js)

This document covers how to run the frontend, how to run frontend and backend together (proxy), the main modules, project architecture, and the data flow/state management.

## Quick Start (Frontend Only)

1. cd front
2. npm install
3. cp .env.example .env.local
4. Set NEXT_PUBLIC_API_ORIGIN to your backend origin (e.g., http://localhost:4000)
5. npm run dev (defaults to PORT=3000)
6. Open http://localhost:3000

Common checks:
- If API calls fail, verify NEXT_PUBLIC_API_ORIGIN and that the backend is running
- For external previews (e.g., Builder.io), add the preview origin to NEXT_PUBLIC_ALLOWED_DEV_ORIGINS
- /uploads proxy relies on NEXT_PUBLIC_API_ORIGIN (backend must serve /uploads statically)

## Quick Start (Frontend + Backend Together)

Single command (from repo root):

sh
sh -c "cd server && npm run build && node dist/main.js & cd front && npm run dev"

Two terminals:
- Terminal A (backend)
  - cd server && npm install && npm run build && npm start  # http://localhost:4000
- Terminal B (frontend)
  - cd front && npm install && npm run dev                  # http://localhost:3000

### Proxy model (Next.js rewrites)
- Defined in front/next.config.mjs
- Rewrites forward:
  - /api/:path*    -> ${NEXT_PUBLIC_API_ORIGIN}/api/:path*
  - /uploads/:path*-> ${NEXT_PUBLIC_API_ORIGIN}/uploads/:path*
- Keep NEXT_PUBLIC_API_ORIGIN aligned with your backend host/port
- allowedDevOrigins can be configured via NEXT_PUBLIC_ALLOWED_DEV_ORIGINS

## Environment Variables (Frontend)
Create front/.env.local from .env.example.

- NEXT_PUBLIC_API_ORIGIN=http://localhost:4000
  - Backend origin used by rewrites for /api and /uploads
- PORT=3000
  - Frontend dev server port for next dev
- NEXT_PUBLIC_ALLOWED_DEV_ORIGINS=http://localhost:3000
  - Comma-separated origins allowed for dev previews
- NEXT_TELEMETRY_DISABLED=1
  - Optional: disable Next.js telemetry locally

Notes:
- Backend port is configured on the server side (server/.env or environment), default 4000 in this repo.

## Architecture Overview

- Next.js (App Router), TypeScript, Tailwind CSS
- Redux Toolkit for state management
- i18next for localization
- Domain-oriented folders in front/src:
  - app/           -> AppProvider, store, hooks
  - app-pages/     -> Page-level React components (Admin, Auth, etc.)
  - features/      -> Redux slices (auth, cart, catalog, currency, theme)
  - shared/api/    -> API layer (axios instance + domain clients)
  - shared/themes/ -> Theme providers and CSS variables
  - components/    -> Reusable UI components
  - widgets/       -> Composite UI blocks (header, footer, product grid, etc.)

Routing
- Next.js routes live in front/app/* and render components from front/src/app-pages
- react-router-dom references are shimmed to Next navigation (see next.config.mjs) during migration

## Data Flow (Redux Toolkit)

1. UI dispatches an action/async thunk (e.g., login, fetch products)
2. Thunks call API clients from front/src/shared/api via axios instance (shared/config/api.ts)
   - Request interceptor attaches Authorization from localStorage (ecommerce_auth_token, auth_token, or admin-token)
   - Base path is /api; Next.js rewrites proxy it to NEXT_PUBLIC_API_ORIGIN
3. Reducers update slices upon success/failure
4. Components subscribe via selectors (useAppSelector)

Slices
- features/auth/authSlice.ts
- features/catalog/catalogSlice.ts
- features/cart/cartSlice.ts
- features/currency/currencySlice.ts
- features/theme-switcher/themeSlice.ts

API Layer
- shared/config/api.ts -> axios instance
- shared/api/products.ts, categories.ts -> domain calls
- shared/api/images.ts -> multipart uploads to /api/files/images and /api/files/images/many

## Modules (Frontend)

Auth
- Pages: src/app-pages/auth
- Token persisted to localStorage; axios reads it automatically
- In dev, backend can accept mock_* tokens when ALLOW_MOCK_TOKENS=true

Products (Admin)
- Form: src/app-pages/admin/ProductForm.tsx
- ImageUploader supports drag & drop and URL add
- Upload uses /api/files/images; saved publicPath populates product.images

Categories (Admin)
- Form: src/app-pages/admin/CategoryForm.tsx
- Single image upload; saved to category.image

Internationalization
- src/shared/config/i18n.ts and src/shared/locales/{en,es}/translation.json

Theming
- src/shared/themes/ThemeProvider.tsx and theme CSS files

## Troubleshooting

- 401 on uploads: ensure a token exists with files:upload permission (or admin role)
- CORS/preview warnings: add preview origin to NEXT_PUBLIC_ALLOWED_DEV_ORIGINS
- Uploads not visible: verify backend serves /uploads and rewrites include it
- API 404: check NEXT_PUBLIC_API_ORIGIN and backend /api routes
