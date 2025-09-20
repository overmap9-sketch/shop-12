import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../_db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body.userId || 'guest';
  const productId = String(body.productId);
  const quantity = Number(body.quantity || 1);
  try {
    const cart = db.addToCart(userId, productId, quantity);
    return NextResponse.json(cart);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Error' }, { status: 400 });
  }
}
