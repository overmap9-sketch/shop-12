import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../_db';

export const runtime = 'nodejs';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const item = db.getProduct(params.id);
  if (!item) return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const patch = await req.json();
  const updated = db.updateProduct(params.id, patch);
  if (!updated) return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ok = db.removeProduct(params.id);
  if (!ok) return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
