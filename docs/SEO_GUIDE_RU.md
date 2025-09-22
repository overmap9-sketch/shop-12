Руководство по SEO для PaintHub — Расширенные инструкции (RU)

Руководство по SEO для PaintHub

Содержание
1. Цель и область применения
2. Обзор стратегии SEO
3. Принципы Server vs Client рендеринга
4. Мета-теги и Open Graph
5. Структурированные данные (JSON-LD)
6. Sitemap и robots
7. Структура URL и каноникализация
8. Контент на странице и семантическая HTML-разметка
9. Изображения и медиа
10. Производительность и Core Web Vitals
11. Техническая реализация (файлы, примеры)
12. Тестирование и проверка
13. Внедрение и окружение
14. Частые ошибки и их исправление

1. Цель и область применения
Документ описывает подход к SEO для проекта PaintHub: как доб��ться индексации страниц, обеспечить корректные мета-данные и структурированные данные, при этом сохранить интерактивность при помощи клиентских компонентов.

2. Обзор стратегии SEO
- Рендерить критичный для SEO контент (главная, категории, страницы товара) на сервере.
- Оставлять интерактивные элементы (фильтры, корзина, платежи) в клиентских компонентах.
- Добавлять динамические мета-теги и JSON-LD для продуктов.
- Генерировать sitemap.xml и robots.txt.

3. Server vs Client
- Server Components: для SEO-критичных страниц.
- Client Components: для элементов, требующих браузерных API или взаимодействия.
- Паттерн: сервер формирует HTML и мета-данные; небольшой клиентский код повышает интерактивность.

4. Мета-теги и Open Graph
- Используйте generateMetadata в app-router для динамических мета-тегов.
- Файлы: front/src/app/layout.tsx (глобальные метаданные), front/src/app/(shop)/product/[id]/page.tsx (динамические метаданные товара).

5. JSON-LD
- Внедрять Product schema на страницах товара: name, image, description, sku, brand, offers.
- Пример: front/src/views/product/ProductDetail.tsx включает JSON-LD.

6. Sitemap и robots
- Sitemap генерируется в front/src/app/sitemap.ts на этапе сборки, включает товары из server/data/products.json.
- Robots определён в front/src/app/robots.ts.

7. Каноникализация
- Добавляйте rel=canonical для страниц товара, избегайте дублирования контента.

8. Семантика
- H1 для заголовка товара, alt у изображений, человекочитаемые хлебные крошки.

9. Изображения
- Устанавливайте width/height, используйте loading="lazy" и Next.js Image для оптимизации.

10. Производительность
- Отложенная загрузка скриптов, preconnect для внешних ресурсов, ленивые виджеты.

11. Техническая реализация
- Список ключевых файлов и краткие инструкции по их назначению (см. англ. версию).

12. Тестирование
- Google Rich Results Test, Lighthouse, Search Console.

13. Окружение
- Установите PUBLIC_ORIGIN для корректных ссылок в sitemap и мета-тегах.

14. Частые ошибки
- Вызов клиентских хуков в серверных компонентах -> CSR bailout.
- Непоследовательный порядок хуков -> ошибки React.

Если нужно, могу добавить подробные примеры кода для каждого пункта и чек-лист при релизе.



Добавлено: инструкции по сборке, проверке JSON-LD, тестам, чек-листу релиза, пример CI

Сборка и проверка (локально)
1. Установка и сборка
   - Установить зависимости: npm ci
   - Очистить артефакты: rm -rf .next
   - Собрать продакшн: npm run build
2. Если сборка падает с ошибками CSR (useSearchParams...):
   - Найдите файл с useSearchParams (next/navigation) или react-router hooks и либо добавьте "use client" в начало файла, либо вынесите логику в клиентский дочерний компонент.
   - Для app-router Next.js избегайте вызова next/navigation внутри Server Components.
3. Если появляются ошибки порядка Hooks, убедитесь, что вызовы хуков находятся на верхнем уровне и выполняются всегда в одинаковом порядке.

Проверка метаданных и JSON-LD
1. Страницы товара
   - После сборки откройте исходный HTML страницы (view-source) и проверьте:
     - Наличие правильного <title>
     - Наличие <meta name="description">
     - Open Graph теги (og:title, og:description, og:image)
     - Наличие <link rel="canonical"> с корректным URL
     - Скрипт <script type="application/ld+json"> с Product schema
2. Используйте Google Rich Results Test для проверки JSON-LD.
3. Используйте Lighthouse для оценки SEO и производительности.

Тестирование
1. Ручные проверки
   - Убедиться что source HTML содержит metadata (view-source). Можно проверить curl: curl -sL https://your-site/product/<slug> | grep "<title>"
2. Автоматизация в CI
   - В CI добавьте шаги: npm run build �� затем headless Lighthouse (или treosh action).

Чек-лист релиза (минимум)
- [ ] npm ci && rm -rf .next && npm run build (успешно)
- [ ] sitemap.xml содержит ссылки на продукты
- [ ] robots.txt доступен и корректен
- [ ] Пример страницы товара проходит проверку JSON-LD
- [ ] Критичные страницы проходят порог Lighthouse (настройки порогов можно задать)
- [ ] PUBLIC_ORIGIN установлен для продакшн окружения

Пример CI (GitHub Actions)
- name: Build and SEO checks
  on: [push]
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Install
          run: npm ci
        - name: Build
          run: npm run build
        - name: Run Lighthouse CI
          uses: treosh/lighthouse-ci-action@v8
          with:
            urls: |
              http://localhost:8080/
              http://localhost:8080/product/paint-p1
            configPath: ./lighthouserc.json

JSON-LD best practices
- Полный offers объект: price, priceCurrency, availability, url.
- Сохраняйте канонические URL в offers.url
- Не дубл��руйте неверно сущности в structured data

Частые ошибки и их решения
- CSR bailout: useSearchParams() should be wrapped in a suspense boundary — вынесите hook в клиентский компонент.
- Hooks order error: убедитесь что хуки вызываются в одном и том же порядке.
- "<Html> should not be imported outside of pages/_document": избегайте использования internal next/document APIs или контекстов вне _document.

Если хотите, могу добавить workflow YAML и пример lighthouserc.json в репозиторий — скажите, нужно ли добавить их сейчас.
