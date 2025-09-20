import { NextResponse } from 'next/server';
import type { Category } from '../../../../src/entities';
import { db } from '../../_db';

export const runtime = 'nodejs';

export async function GET() {
  const list = db.getCategories();
  const byParent = (pid?: string) => list.filter((c) => c.parentId === pid).sort((a,b)=>a.sortOrder-b.sortOrder);
  const build = (pid?: string): any[] => byParent(pid).map((c: Category) => ({ ...c, children: build(c.id) }));
  return NextResponse.json(build(undefined));
}
