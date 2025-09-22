import type { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.PUBLIC_ORIGIN || 'https://example.com';
  const items: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/catalog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/categories`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  try {
    const candidates = [
      path.resolve(process.cwd(), '../server/data/products.json'),
      path.resolve(process.cwd(), 'server/data/products.json'),
    ];
    let products: any[] = [];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        products = JSON.parse(raw) as any[];
        break;
      }
    }
    for (const p of products) {
      if (p && (p.status === 'published' || !p.status)) {
        const slug = p.slug || p.id;
        items.push({ url: `${base}/product/${slug}`, changeFrequency: 'monthly', priority: 0.7 });
      }
    }
  } catch (e) {
    // ignore sitemap generation errors
    // eslint-disable-next-line no-console
    console.warn('sitemap generation error', e);
  }

  return items;
}
