import { NextRequest, NextResponse } from 'next/server';
import type { Category } from '../../../src/entities';
import { db } from '../_db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const list = db.getCategories();
  let res: Category[] = [...list];
  const parentId = params.get('parentId');
  const isActive = params.get('isActive');
  if (parentId !== null) res = res.filter(c => String(c.parentId||'') === String(parentId||''));
  if (isActive !== null) res = res.filter(c => String(c.isActive) === String(isActive));
  res.sort((a,b)=>a.sortOrder-b.sortOrder);
  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = db.addCategory(body);
  return NextResponse.json(created);
}
