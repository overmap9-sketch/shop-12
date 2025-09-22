import path from 'path';
import fs from 'fs';
import React from 'react';
import { Product } from '../../../entities';
import { ProductGridServer } from '../../../widgets/product-grid/ProductGridServer';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const ClientCatalogShell = dynamic(() => import('./shell').then(m => m.ClientCatalogShell), { ssr: false });

function readJson<T = any>(candidates: string[]): T | null {
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        return JSON.parse(raw) as T;
      }
    } catch {}
  }
  return null;
}

export const metadata: Metadata = {
  title: 'Product Catalog · PaintHub',
  description: 'Discover our amazing collection of products',
  alternates: { canonical: '/catalog' },
  robots: { index: true, follow: true }
};

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const baseCandidates = [
    path.resolve(process.cwd(), '../server/data'),
    path.resolve(process.cwd(), 'server/data'),
  ];
  const getPath = (name: string) => baseCandidates.map((b) => path.join(b, name));
  const products = (readJson<Product[]>(getPath('products.json')) || []).filter(Boolean);
  const categories = readJson<any[]>(getPath('categories.json')) || [];

  const q = (searchParams?.q as string) || '';
  const category = (searchParams?.category as string) || '';
  const subcategory = (searchParams?.subcategory as string) || '';
  const page = Number(searchParams?.page || 1) || 1;
  const limit = Number(searchParams?.limit || 12) || 12;
  const sort = (searchParams?.sort as string) || '';

  let filtered = products.filter((p) => (
    (!q || p.title.toLowerCase().includes(q.toLowerCase())) &&
    (!category || p.category === category) &&
    (!subcategory || p.subcategory === subcategory)
  ));

  if (sort === 'price_asc') filtered = filtered.slice().sort((a,b)=> (a.price||0)-(b.price||0));
  if (sort === 'price_desc') filtered = filtered.slice().sort((a,b)=> (b.price||0)-(a.price||0));
  if (sort === 'new') filtered = filtered.slice().sort((a,b)=> (b.isNew?1:0)-(a.isNew?1:0));

  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const pageItems = filtered.slice(start, end);

  const currentCategory = categories.find((c)=> c.slug === (subcategory || category)) || categories.find((c)=> c.slug === category);
  const title = currentCategory?.name || 'Product Catalog';
  const description = currentCategory?.description || 'Discover our amazing collection of products';

  const origin = (process.env.PUBLIC_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
  const listJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: pageItems.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${origin}/product/${(p as any).slug || (p as any).id}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </header>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
        <section id="ssr-catalog" aria-label="Product results">
          <ProductGridServer products={pageItems as any} columns={3} />
        </section>
        <ClientCatalogShell initial={{
          q,
          category,
          subcategory,
          page,
          limit,
          sort
        }} />
      </div>
    </div>
  );
}
