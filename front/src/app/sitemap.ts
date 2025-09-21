import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://example.com';
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/catalog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/categories`, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
