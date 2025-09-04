# Полная функциональная спецификация — PaintHub e‑commerce

Документ описывает все пользовательские и административные возможности, поведение, ограничения и граничные случаи.

Содержание
- Обзор ролей и доступов
- Витрина (покупатель)
  - Главная страница, навигация, поиск
  - Каталог: сортировка, фильтры, пагинация, представления
  - Карточка товара и детали
  - Избранное
  - Корзина, расчеты, доставка
  - Валюта, языки, темы
  - Профиль, аутентификация
  - Оформление заказа (состояние)
- Админ‑панель
  - Дашборд и аудит
  - Товары: CRUD, статусы, флаги, массовые операции
  - Категории: иерархия, CRUD
  - Заказы: список и статусы (mock)
  - Пользоват��ли: список и статусы (mock)
  - Купоны: создание/управление/валидация
  - Настройки: баннеры, контакты, доставка
- Уведомления (тосты) и сообщения об ошибках
- Нефункциональные требования и ограничения текущей реализации

## Обзор ролей и доступов
- Покупатель (не авторизован / авторизован): доступ ко всем публичным страницам.
- Администраторские роли (owner, admin, manager, editor, viewer): доступ к /admin с правами по permissions (см. shared/lib/permissions.ts). В пользовательском UI правовые ограничения не применяются.

Ключевые проверки
- Доступ в админку: только isAuthenticated && role != 'user'.
- Действия с ограничением прав в админке отображают предупреждение «Permission Denied» (NotificationService.permissionDenied()).

## Витрина (покупатель)

### Главная, навигация, поиск
- Header (widgets/header/Header.tsx): логотип «PaintHub», поиск, навигация, ссылки в корзину/избранное/профиль.
- Hero‑слайдер (widgets/hero-slider/HeroSlider.tsx): промо‑слайды с CTA на нужные разделы каталога.
- Категории (widgets/category-grid/CategoryGrid.tsx): отрисовка основных категорий.
- Поиск
  - Поле поиска в каталоге и SearchInput (shared/ui/SearchInput.tsx) с debounce, клавишами Enter/Escape и списком подсказок (опционально).
  - ProductsAPI.getProducts поддерживает query (по title, description, tags, brand, category).

### Каталог
- Страница: pages/catalog/Catalog.tsx
- Состояние и запросы: features/catalog/catalogSlice.ts + ProductsAPI.getProducts
- Представления: grid и list (переключаемые)
- Сортировка: { field: price|rating|dateAdded|title, order: asc|desc }
- Пагинация: limit (по умолчанию 12), currentPage, hasMore
- Фильтры (pages/catalog/CatalogFilters.tsx, ProductFilter)
  - Общие: category, subcategory, priceMin/priceMax, rating, brand, tags, isOnSale, isNew, isFeatured, inStock, status
  - Специфичные для лакокрасочных материалов (через specifications):
    - colorFamily, colorHex
    - finish, sheen
    - base
    - application (Interior/Exterior/Interior-Exterior)
    - volume (1 qt, 1 gal, 5 gal)
    - lowVOC (<= 50 g/L или тег low‑voc)
- Навигация по подкатегориям: SubcategoryNavigation с генерацией URL параметров category/subcategory и хлебными крошками.
- Пустые состояния: информативные сообщения и кнопка «Clear Filters».

### Карточка товара и детали
- Карточка (shared/ui/ProductCard.tsx)
  - Галерея: смена картинки по наведению/движению курсора, индикаторы, lazy loading.
  - Бейджи: New, Sale (считает процент скидки), Featured; статус «Out of Stock»
  - Быстрые спецификации для краски: Color, Finish, Volume (если заданы).
  - Кнопка «Add to Cart» зафиксирована внизу карточки; недоступна при stock=0.
  - Быстрое избранное (сердце) — при включенном showQuickActions.
- Детальная страница (pages/product/ProductDetail.tsx) — карточка товара с подробностями (см. код страницы для состава блока, если требуется).

### Избранное
- Страницы: pages/favourites/*
- Действия: добавить/удалить из избранного из карточки или списка; локальное хранение (features/favouritesSlice.ts + STORAGE_KEYS.FAVOURITES).
- Уведомления: NotificationService.addToFavouritesSuccess/removeFromFavouritesSuccess/favouritesError.

### Корзина и расчеты
- Страница: pages/cart/Cart.tsx, виджеты ProductGridItem (list) и ProductCard (grid) вызывают addToCart.
- API: CartAPI
  - Пересчет на каждом изменении: subtotal=sum(price*qty), tax=8% от subtotal, shipping = 0 если subtotal>=100 иначе 10, total = subtotal + tax + shipping - discount.
  - Проверки склада: недостаток stock приводит к ошибке.
  - Операции: addToCart, updateCartItem (qty<=0 удаляет), removeFromCart, clearCart, getCartSummary.
- Уведомления: addToCartSuccess/cartError/updateCartSuccess/clearCartSuccess.

### Валюта, языки, темы
- Валюта: features/currency/*
  - Поддержка нескольких валют, выбранная валюта сохраняется в localStorage, есть мок‑обновление курсов.
  - Хук useProductPrice форматирует цену/скидку согласно selectedCurrency.
- Языки: en, es с автоопределением; ключи в shared/locales/*
- Темы: default, dark, ocean; переключение через ThemeProvider/ThemeSwitcher.

### Профиль, аутентификация
- Login/Register/Profile страницы присутствуют; логика аутентификации — mock (features/auth/authSlice.ts) с сохранением user/token в localStorage.
- Роли: у mock‑пользователей есть role (в частности admin) для доступа в /admin.
- Уведомления: loginSuccess/loginError/logoutSuccess/registerSuccess/registerError/profileUpdateSuccess/passwordChangeSuccess.

### Оформление заказа
- Страница /checkout — PlaceholderPage (не реализована). Логика Order и платежей отсутствует; реализуйте при интеграции платежей/бэкенда.

## Админ‑панель

Путь /admin защищён ProtectedAdminRoute. Разделы:

### Дашборд
- Статкарточки: количество товаров/категорий/заказов/пользователей/выручка (частично mock).
- Recent Activity: на основе AuditAPI.list(limit=10).
- Быстрые действия: ссылки на создание товара/категории, управление заказами/пользователями/аналитикой.

### Товары
- Список: фильтры (поиск по title/SKU, категория, статус), сортировки, бейджи (New/Featured/Sale), изменение статуса inline, просмотр на витрине.
- CRUD
  - Добавление/редактирование (pages/admin/ProductForm.tsx):
    - Базовые поля, цена/скидка/склад, категории/подкатегории, теги/фичи, specifications (в т.ч. paint‑поля), флаги isNew/isFeatured/isOnSale.
    - Автогенерация slug по title.
    - Валидации: обязательные поля, неотрицательные значения.
  - Удаление — подтверждение, затем ProductsAPI.deleteProduct.
- Массовые операции (pages/admin/BulkUpdate.tsx -> ProductsAPI.bulkUpdate):
  - Область действия: category/subcategory/status/isOnSale/inStock.
  - Изменение цены: set/increase/decrease (%/amount), опция записать originalPrice.
  - Изменение склада: set/increase/decrease.
  - Флаги: isOnSale/isFeatured/isNew.
  - Результат: число обновлённых записей, аудит изменений (metadata.bulk=true).

### Категории
- Иерархия: древо и список с подсчётом productCount, сортировкой по sortOrder.
- CRUD (pages/admin/CategoryForm.tsx):
  - Поля: name/slug/description/image/parentId/sortOrder/isActive, автогенерация slug.
  - Валидации: required, уникальность slug, sortOrder>=1.
  - Удаление: запрет при наличии дочерних или товаров в категории (исключения в API).

### Заказы (mock)
- Список с фильтрами/поиском/сортировкой, статусы: pending/confirmed/processing/shipped/delivered/cancelled/refunded.
- Быстрые действия для смены статуса.
- Метрики: общее число, выручка, средний чек.

### Пользователи (mock)
- Список с фильтрами (роль/status), поиском, сортировкой.
- Быстрые действия: активация/деактивация, удаление не‑admin.

### Купоны
- CRUD купонов (код, тип percentage/fixed, value, minSubtotal, maxDiscount, expiresAt, usageLimit, perUserLimit, appliesTo: all|categories|products, freeShipping, isActive).
- Таблица купонов с usage и статусом.
- Валидация (CouponsAPI.validate): проверка дат, лимитов, применимости к позициям корзины, расчёт скидки/ограничений.

### Настройки
- Баннеры: список, активность, placement (home/catalog/all), цвета фона, загрузка картинок desktop/mobile.
- Контакты: email, телефон, адрес, соцсети, автоответ (subject/message).
- Доставка: зоны (название, страны ISO), методы (rate, freeShippingThreshold, ETA, enabled), defaultMethodId, handlingFee.
- Все сохранения пишутся в аудит.

## Уведомления и ошибки
- NotificationService (shared/lib/notifications.ts) стандартизирует тосты: success/error/warning/info + дом��нные методы для входа, корзины, заказов, прав, валидаций и т.п.
- Ошибки API: возвращаются через reject/try‑catch, отображаются тостами или inline на формах.

## Нефункциональные требования и ограничения
- Источник данных — localStorage через shared/lib/storage.ts. Данные очищаются при чистке хранилища браузера.
- Инициализация мок‑данных — shared/lib/mockData*.ts.
- Производительность: список товаров пагинирован, фильтры применяются на клиенте.
- Безопасность: аутентификация и авторизация — mock; для продакшена требуется серверная аутентификация, защита токенов, бэкенд‑валидации и пр.
- Платежи/чекаут: не реализованы; предполагается интеграция (Stripe/PayPal и т.д.).

## Карта функционала (сводная таблица)

| Раздел | Возможности | Роль/Доступ | Источник/Компоненты |
|---|---|---|---|
| Главная | Хедер, поиск, слайдер, категории | Публично | widgets/header, hero-slider, category-grid |
| Каталог | Список, сортировка, фильтры (в т.ч. paint), пагинация, grid/list | Публично | pages/catalog, features/catalog, ProductsAPI |
| Товар | Карточка, бейджи, спец‑поля, кнопка Add to Cart | Публично | shared/ui/ProductCard |
| Поиск | Query по названию/описанию/тегам/бренду/категории | Публично | ProductsAPI.getProducts |
| Избранное | Добавить/удалить, страница избранного | Публично | features/favourites, pages/favourites |
| Корзина | Добавить/изменить/удалить/очистить, пересчёт total | Публично | CartAPI, pages/cart |
| Валюта | Выбор валюты, форматирование цен | Публично | features/currency, useProductPrice |
| Язык/Тема | en/es, default/dark/ocean | Публично | shared/config/i18n, themes/* |
| Профиль/Auth | Login/Register/Profile (mock) | Публично | features/auth, pages/auth/profile |
| Дашборд | Метрики, последние события (Audit) | Admin | pages/admin/Dashboard, AuditAPI |
| Товары | CRUD, статусы, флаги, bulk update | Admin | pages/admin/Products, ProductForm, BulkUpdate, ProductsAPI |
| Категории | Иерархия, CRUD, защита удаления | Admin | pages/admin/Categories, CategoryForm, CategoriesAPI |
| Заказы | Список/статусы (mock) | Admin | pages/admin/Orders |
| Пользователи | Список/статусы/удаление (mock) | Admin | pages/admin/Users |
| Купоны | CRUD, валидация | Admin | pages/admin/Coupons, CouponsAPI |
| Настройки | Баннеры/Контакты/Доставка | Admin | pages/admin/Settings, Contacts, Shipping, SettingsAPI |

Примечание: Раздел /checkout и реальные платежи/заказы не реализованы и требуют серверной интеграции.
