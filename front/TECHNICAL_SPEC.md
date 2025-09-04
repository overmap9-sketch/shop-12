# Полная техническая документация — PaintHub e‑commerce

Ниже представлена полная документация проекта с разделами: Архитектура, API, Функции, Интеграции, Конфигурации. Диаграммы приложены (SVG) рядом с документом: ./architecture.svg и ./entities.svg.

- Диаграмма архитектуры: ./architecture.svg
- ER диаграмма сущностей: ./entities.svg

## Архитектура

- Клиентское приложение: React + TypeScript, SPA.
- Стили: Tailwind CSS + shadcn/ui.
- Роутинг: React Router v6 (App.tsx).
- Состояние: Redux Toolkit (app/store.ts, features/*Slice.ts).
- Локализация: i18next (shared/config/i18n.ts) — en, es.
- Темизация: shared/themes (ThemeProvider, SimpleThemeProvider, *.css).
- Данные: симулированный бэкенд через слой shared/api/* поверх localStorage (shared/lib/storage.ts).
- RBAC/ACL: shared/lib/permissions.ts.
- Логи аудита: shared/api/audit.ts.
- Инициализация мок‑данных: shared/lib/mockData.ts (+ mockDataEnhanced.ts).

Маршруты (App.tsx):
- Публичные: /, /catalog, /categories, /product/:slug, /cart, /favourites, /checkout, /profile, /orders, /login, /register.
- Админ: /admin/login, /admin, /admin/products, /admin/categories, /admin/users, /admin/orders, /admin/analytics, /admin/settings, /admin/contacts, /admin/shipping, /admin/coupons, /admin/bulk-update, а также формы /admin/products/new, /admin/products/:id/edit, /admin/categories/new, /admin/categories/:id/edit.
- Доступ в админку: components/admin/ProtectedAdminRoute.tsx (роль != user).

Слои:
- widgets/*, pages/* — представление и композиция.
- entities/* — типы доменных моделей.
- features/* — слайсы состояния (auth, cart, catalog, currency и т.д.).
- shared/api/* — «API» (CRUD, фильтры, пагинация, сортировка) с записью в localStorage + Audit.
- shared/lib/* — утилиты, permissions, storage, mock‑инициализация.

См. диаграммы: architecture.svg (потоки данных) и entities.svg (ER связи).

## API

Примечание: API реализовано как классы/методы поверх localStorage (без HTTP). Ниже спецификация методов и контрактов. При миграции на реальный бэкенд их удобно транслировать в REST/GraphQL.

1) ProductsAPI (shared/api/products.ts)
- getProducts(params: ProductSearchParams): ProductsResponse
  Параметры: query, filters (ProductFilter), sort {field,order}, page, limit. Возвращает products[], total, page, limit, hasMore.
- getProduct(id: string): Product | null
- getProductBySlug(slug: string): Product | null
- getFeaturedProducts(limit=8): Product[]
- getNewProducts(limit=8): Product[]
- getSaleProducts(limit=8): Product[]
- getRelatedProducts(productId: string, limit=4): Product[]
- createProduct(product: Omit<Product,'id'|'dateAdded'|'dateModified'>): Product
- updateProduct(id: string, updates: Partial<Product>): Product | null
- deleteProduct(id: string): boolean
- bulkUpdate(options): number — массовые операции цен/скл��да/флагов с фильтрами
- Фильтрация: ProductFilter (+ paint‑специфика: colorFamily, colorHex, finish/sheen, base, application, volume, lowVOC)

2) CategoriesAPI (shared/api/categories.ts)
- getCategories(filters: { parentId?, isActive?, hasProducts? }): Category[] (сортировка по sortOrder)
- getCategory(id): Category | null
- getCategoryBySlug(slug): Category | null
- getCategoryTree(): CategoryTree[] — иерархия активных категорий
- getMainCategories(limit=8): Category[]
- getSubcategories(parentId): Category[]
- createCategory(data): Category
- updateCategory(id, patch): Category | null
- deleteCategory(id): boolean (валидирует отсутствие детей/товаров)
- updateProductCounts(): void — пересчет productCount по товарам

3) CartAPI (shared/api/cart.ts)
- getCart(): Cart — подтягивает актуальные продукты и пересчитывает суммы
- addToCart({ productId, quantity }): Cart — валидирует stock
- updateCartItem({ itemId, quantity }): Cart — 0 удаляет позицию
- removeFromCart(itemId): Cart
- clearCart(): Cart
- getCartSummary(): { itemCount, subtotal, tax, shipping, discount, total, currency }
- Бизнес‑��равила: tax=8%, shipping=10 при subtotal<100 иначе 0.

4) CouponsAPI (shared/api/coupons.ts)
- list(): Coupon[] (инициализирует WELCOME10)
- getByCode(code): Coupon | null
- create(data): Coupon
- update(id, patch): Coupon | null
- delete(id): boolean
- validate(code, items: CartItem[], subtotal): { valid, reason?, coupon?, discount?, freeShipping? }
- AppliesTo: all | categories | products, плюс minSubtotal, maxDiscount, expiresAt, limits.

5) SettingsAPI (shared/api/settings.ts)
- getSettings(): AdminSettings (banners, contacts, shipping)
- saveSettings(settings): void (audit)
- addBanner(partial): BannerSettings
- updateBanner(id, patch): BannerSettings | null
- deleteBanner(id): void
- setContacts(contacts): void
- setShipping(shipping): void
- uploadImage(file): Promise<string> (через ImageUploadAPI)

6) AuditAPI (shared/api/audit.ts)
- list({ limit? }): AuditLog[] (сорт. по timestamp desc)
- record({ action, entity, entityId?, before?, after?, metadata?, user? }): AuditLog — сохраняет до 500 последних

Типы данных: см. entities/*.

Таблица основных сущностей:

| Сущность     | Ключевые поля                                                                 |
|--------------|--------------------------------------------------------------------------------|
| Product      | id, slug, title, price, currency, images[], category, tags[], rating, stock, status, features[], specifications{} (вкл. paint поля), флаги isNew/isFeatured/isOnSale, dateAdded/dateModified |
| Category     | id, slug, name, parentId?, productCount, isActive, sortOrder                   |
| Cart         | id, items[], subtotal, tax, shipping, discount, total, currency               |
| CartItem     | id, productId, product, quantity, price, dateAdded                            |
| Order        | id, userId, orderNumber, status, items[], суммы, адреса, платеж/доставка      |
| User         | id, email, role, preferences, addresses[], verified флаги                     |
| Coupon       | id, code, type, value, appliesTo, активность, лимиты                          |
| AdminSettings| banners[], contacts, shipping (zones/methods)                                  |
| AuditLog     | id, timestamp, userId/email, action, entity, before/after, metadata           |

REST‑контракты (для будущего бэкенда, соответствуют текущим методам):
- GET /api/products?query&filters&sort&page&limit -> { products,total,page,limit,hasMore }
- GET /api/products/:id -> Product; GET /api/products/slug/:slug -> Product
- POST /api/products -> Product; PATCH /api/products/:id -> Product; DELETE /api/products/:id
- GET /api/categories?parentId&isActive&hasProducts -> Category[]; GET /api/categories/tree -> CategoryTree[]; POST/PATCH/DELETE аналогично
- GET /api/cart -> Cart; POST /api/cart/items -> Cart; PATCH /api/cart/items/:itemId -> Cart; DELETE /api/cart/items/:itemId -> Cart; DELETE /api/cart -> Cart; GET /api/cart/summary -> CartSummary
- GET /api/coupons?code=... -> Coupon | 404; POST/PATCH/DELETE /api/coupons
- GET/PUT /api/settings; POST /api/settings/banners; PATCH/DELETE /api/settings/banners/:id
- GET /api/audit?limit -> AuditLog[]; POST /api/audit -> AuditLog

## Функции

Витрина:
- Каталог: список с пагинацией, сортировкой, фильтрами (цена, бренд, рейтинг, наличие, теги; paint: цвет/hex, финиш/шайн, база, назначение, объем, Low VOC). Источник: ProductsAPI.applyFilters.
- Карточка товара: изображения, бренд, рейтинг, цена, быстрая спецификация, кнопка "Добавить в корзину" закреплена снизу карточки (shared/ui/ProductCard.tsx), состояние "Нет в наличии".
- Поиск: параметр query в getProducts.
- Избранное: pages/favourites/*, features/favouritesSlice.ts.
- Корзина: добавление/удаление/количество/пересчет сумм; бесплатная доставка от $100.
- Валюта: features/currency/*, хранение выбранной валюты в localStorage, mock курсы.
- Локализация: en/es, автоопределение, кэш в localStorage.
- Темы: default, dark, ocean.

Профиль/Аутенфикация:
- Login/Register: features/auth/authSlice.ts (mock пользователи, хранение token и user в localStorage).
- Profile: редактирование базовых полей и предпочтений.

Админ‑панель (/admin):
- Доступ: роль != user; роли и права: shared/lib/permissions.ts (owner, admin, manager, editor, viewer, user).
- Разделы: Dashboard (метрики + Audit), Products (CRUD, фильтры, статусы, bulk через API), Categories (CRUD, древо), Users (заглушка/вью), Orders (список/фильтры/статусы — mock), Settings (баннеры/контакты/доставка), Coupons (CRUD/валидация), BulkUpdate.
- Аудит: запись create/update/delete/bulk в AuditAPI, отображение на Dashboard.

## Интеграции

Текущих внешних интеграций оплаты/CRM нет (данные — localStorage). Рекомендуемые MCP‑интеграции Builder.io (подключаются через [Open MCP popover](#open-mcp-popover)):
- Neon — БД/Postgres, серверлес. Полезно для реального хранения товаров/заказов/пользователей. [Connect to Neon](#open-mcp-popover)
- Netlify — хостинг и CI/CD, деплой SPA. [Connect to Netlify](#open-mcp-popover)
- Zapier — автоматизации: уведомления о заказах, синк с Google Sheets/CRM. [Connect to Zapier](#open-mcp-popover)
- Figma — генерация компонентов/верстки из дизайнов. Плагин: https://www.figma.com/community/plugin/747985167520967365/builder-io-ai-powered-figma-to-code-react-vue-tailwind-more
- Builder CMS — контент (баннеры/страницы/блог). [Connect to Builder.io](#open-mcp-popover)
- Linear — тикеты/планирование задач. [Connect to Linear](#open-mcp-popover)
- Notion — документация/знания, импорт/экспорт. [Connect to Notion](#open-mcp-popover)
- Supabase — БД + аутентификация + realtime. [Connect to Supabase](#open-mcp-popover)
- Sentry — мониторинг ошибок фронтенда. [Connect to Sentry](#open-mcp-popover)
- Context7 — быстрый доступ к документации библиотек.
- Semgrep — статический анализ/безопасность.
- Prisma Postgres — ORM/схемы поверх Postgres. [Connect to Prisma](#open-mcp-popover)

Платежи/CRM/Маркетинг (варианты):
- Stripe/PayPal/YooKassa — оплата; заменить Cart/Order flow и добавить платежный вебхук.
- HubSpot/Zoho/Bitrix24 — CRM, синхронизация клиентов/заказов.
- Mailchimp/SendGrid — маркетинговые рассылки.

## Конфигурации

- Tailwind: tailwind.config.js — темы, цветовая палитра, префиксы классов shadcn/ui.
- Vite: vite.config.ts — сборка SPA, алиасы путей.
- i18n: shared/config/i18n.ts — ресурсы, детектор языка (localStorage, navigator, htmlTag), fallback='en'.
- Темы: shared/themes/{default.css,dark.css,ocean.css}, ThemeProvider/SimpleThemeProvider.
- Permissions: shared/lib/permissions.ts — роли и права. Ключевые права: admin.access, products.* (read/create/update/delete/bulkUpdate), categories.*, orders.read/update, users.read/update/delete, settings.update, coupons.*
- Storage keys: shared/lib/storage.ts — константы STORAGE_KEYS.* (PRODUCTS, CATEGORIES, CART, USER, AUTH_TOKEN, SETTINGS, COUPONS, AUDIT_LOGS и др.).

RBAC таблица (основное):

| Роль   | Права (основные)                                                                                 |
|--------|---------------------------------------------------------------------------------------------------|
| owner  | все admin.access + products.*, categories.*, orders.read/update, users.*, settings.update, coupons.* |
| admin  | то же что owner                                                                                  |
| manager| admin.access + products.read/create/update/bulkUpdate, categories.read/create/update, orders.read/update, users.read, settings.update, coupons.read/create/update |
| editor | admin.access + products.read/create/update, categories.read/update, orders.read, coupons.read/update |
| viewer | admin.access + products.read, categories.read, orders.read, users.read, coupons.read              |
| user   | нет админ‑прав                                                                                   |

Безопасность/Авторизация:
- Mock‑аутентификация (features/auth/authSlice.ts), хранение токена и пользователя в localStorage.
- Guard админки по роли (ProtectedAdminRoute), проверка isAdminRole.
- Рекомендуется при переходе на реальный бэкенд: JWT с refresh, httpOnly cookies, CORS, CSRF, rate‑limit, password policies, 2FA.

Деплой/CI/CD/Версионирование/Тестирование:
- В репо нет настроек CI/CD. Рекомендуется Netlify MCP — автодеплой из ветки, превью‑окружения.
- Версионирование: SemVer, релизы по Conventional Commits.
- Тестирование: unit (Vitest/Jest), компонентные (React Testing Library), e2e (Playwright). В проекте есть пример теста: lib/utils.spec.ts.
- Логи/мониторинг: Sentry MCP.

Диаграммы
- Архитектура: ./architecture.svg
- ER/модели: ./entities.svg

Примечание: текуща�� реализация — фронтенд‑персистентность. Для продакшена подключите БД (Neon/Supabase), платежи, аутентификацию и выделенный бэкенд по указанным REST контрактам.
