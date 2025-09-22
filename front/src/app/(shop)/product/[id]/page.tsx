import React from 'react';
import path from 'path';
import fs from 'fs';
import { Metadata } from 'next';
import ProductDetail from '../../../../views/product/ProductDetail';

interface PageProps { params: { id: string } }

function readProducts() {
  const candidates = [
    path.resolve(process.cwd(), '../server/data/products.json'),
    path.resolve(process.cwd(), 'server/data/products.json'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        return JSON.parse(raw) as any[];
      }
    } catch {}
  }
  return [] as any[];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = params.id;
  try {
    const products = readProducts();
    const product = products.find(p => p.id === id || p.slug === id);
    if (!product) return {};
    return {
      title: product.title,
      description: product.description,
      openGraph: {
        title: product.title,
        description: product.description,
        images: product.images && product.images.length ? [{ url: product.images[0] }] : [],
      },
      alternates: { canonical: `/product/${product.slug || product.id}` }
    } as Metadata;
  } catch (e) {
    return {};
  }
}

export default async function Page({ params }: PageProps) {
  const products = readProducts();
  const product = products.find(p => p.id === params.id || p.slug === params.id);
  const origin = (process.env.PUBLIC_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
  const jsonLd = product ? {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.images || [],
    description: product.description,
    sku: product.sku || product.id,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${origin}/product/${product.slug || product.id}`,
      priceCurrency: product.currency || 'USD',
      price: (product.price || 0).toString(),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ProductDetail serverId={params.id} />
    </>
  );
}
