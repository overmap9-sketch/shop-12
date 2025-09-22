SEO Guide for PaintHub — Extended Instructions

Additions: build instructions, JSON-LD verification, testing, release checklist, CI example

Build & verification (local)
1. Install and build
   - Install dependencies: npm ci
   - Clean build artifacts: rm -rf .next
   - Build production: npm run build
2. If build fails with CSR bailout messages (useSearchParams should be wrapped in Suspense):
   - Find file with useSearchParams from next/navigation or react-router hooks and ensure it has "use client" at top OR move that logic into a client-only subcomponent.
   - For Next.js app router pages, avoid calling next/navigation APIs inside Server Components.
3. If React Hooks order errors appear, ensure all hooks are called unconditionally at top of component.

Verifying metadata and JSON-LD
1. Product pages
   - After build, open produced page source (view-source:https://your-site/product/<slug>) and verify:
     - <title> is present and correct
     - <meta name="description"> set correctly
     - Open Graph tags (og:title, og:description, og:image) present
     - <link rel="canonical"> present and points to canonical URL
     - <script type="application/ld+json"> contains Product schema with name, image, offers
2. Use Google Rich Results Test (https://search.google.com/test/rich-results) to validate JSON-LD.
3. Use Lighthouse in Chrome DevTools to check SEO and performance.

Testing
1. Manual tests
   - Verify product pages render metadata server-side (view-source shows title/meta).
   - Use curl to fetch HTML to ensure crawlers get full content: curl -sL https://your-site/product/<slug> | grep "<title>"
2. Automated tests
   - Add a step in CI that runs next build and also runs a headless Lighthouse or Pa11y tests for accessibility.

Release checklist (minimum)
- [ ] RUN: npm ci && rm -rf .next && npm run build (must succeed)
- [ ] VERIFY: sitemap.xml contains product URLs and is reachable
- [ ] VERIFY: robots.txt is present and correct
- [ ] VERIFY: sample product page metadata + JSON-LD via Rich Results Test
- [ ] VERIFY: critical pages pass Lighthouse (score thresholds configurable)
- [ ] SET: PUBLIC_ORIGIN env var in deployment to canonical domain

CI/CD example (GitHub Actions) (snippet)
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

Notes: run a static server (next start or serve the build) before running Lighthouse step; ensure PUBLIC_ORIGIN is set during build.

JSON-LD best-practices
- Provide full offers object (price, priceCurrency, availability, url).
- Avoid duplicating structured data across different entities incorrectly (use Product->offers relationship)
- Use canonical URLs in offers.url

Troubleshooting common errors
- "useSearchParams() should be wrapped in a suspense boundary": convert file to client or move hook to a client child component; do not call next/navigation in server components.
- "Rendered more hooks than during the previous render": ensure hooks order is stable and unconditional.
- "<Html> should not be imported outside of pages/_document": do not import or indirectly reference Next's Document/Html contexts from pages/components. Avoid server-side packages that rely on next/document APIs.

Support
If you want, I can add a GitHub Actions workflow YAML to .github/workflows/build_and_seo.yml and a lighthouserc.json sample. Reply if you want me to add those files now.
