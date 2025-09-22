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
    const dataPath = path.resolve(process.cwd(), 'server', 'data', 'products.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      const products = JSON.parse(raw) as any[];
      for (const p of products) {
        if (p && (p.status === 'published' || !p.status)) {
          const slug = p.slug || p.id;
          items.push({ url: `${base}/product/${slug}`, changeFrequency: 'monthly', priority: 0.7 });
        }
      }
    }
  } catch (e) {
    // ignore sitemap generation errors
    // eslint-disable-next-line no-console
    console.warn('sitemap generation error', e);
  }

  return items;
}
