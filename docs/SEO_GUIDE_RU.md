Руководство по SEO для PaintHub — Расширенные инструкции (RU)

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
