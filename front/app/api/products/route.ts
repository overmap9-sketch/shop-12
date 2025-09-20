import { NextRequest, NextResponse } from 'next/server';
import type { Product } from '../../../src/entities';
import { db } from '../_db';

export const runtime = 'nodejs';

function filterProducts(list: Product[], query: URLSearchParams) {
  let res = [...list];
  const q = query.get('q') || '';
  const category = query.get('category') || '';
  const subcategory = query.get('subcategory') || '';
  const isFeatured = query.get('isFeatured');
  const isNew = query.get('isNew');
  const isOnSale = query.get('isOnSale');
  const sortField = query.get('sortField') as keyof Product | null;
  const sortOrder = (query.get('sortOrder') || 'asc').toLowerCase();

  if (q) {
    const s = q.toLowerCase();
    res = res.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.tags?.some(t=>t.toLowerCase().includes(s)));
  }
  if (category) res = res.filter(p => p.category === category);
  if (subcategory) res = res.filter(p => p.subcategory === subcategory);
  if (isFeatured !== null && isFeatured !== undefined) res = res.filter(p => String(p.isFeatured) === String(isFeatured));
  if (isNew !== null && isNew !== undefined) res = res.filter(p => String(p.isNew) === String(isNew));
  if (isOnSale !== null && isOnSale !== undefined) res = res.filter(p => String(p.isOnSale) === String(isOnSale));

  if (sortField) {
    res.sort((a: any, b: any) => a[sortField] < b[sortField] ? (sortOrder==='asc'?-1:1) : a[sortField] > b[sortField] ? (sortOrder==='asc'?1:-1) : 0);
  }

  return res;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get('page') || '1');
  const limit = Number(params.get('limit') || '12');
  const list = filterProducts(db.getProducts(), params);
  const total = list.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const products = list.slice(start, end);
  return NextResponse.json({ products, total, page, limit, hasMore: end < total });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = db.addProduct(body);
  return NextResponse.json(created);
}
