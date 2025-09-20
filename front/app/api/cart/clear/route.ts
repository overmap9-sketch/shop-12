import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../_db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const userId = body.userId || 'guest';
  const cart = db.clearCart(userId);
  return NextResponse.json(cart);
}
