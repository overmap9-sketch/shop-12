import React from 'react';
import path from 'path';
import fs from 'fs';
import { Metadata } from 'next';
import ProductDetail from '../../../../views/product/ProductDetail';

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = params.id;
  try {
    const dataPath = path.resolve(process.cwd(), '../server/data/products.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const products = JSON.parse(raw) as any[];
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
      alternates: { canonical: `/product/${product.id}` }
    } as Metadata;
  } catch (e) {
    return {};
  }
}

export default function Page({ params }: PageProps) {
  return <ProductDetail serverId={params.id} />;
}
