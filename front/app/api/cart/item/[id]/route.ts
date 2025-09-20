import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../_db';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const userId = body.userId || 'guest';
  const quantity = Number(body.quantity);
  try {
    const cart = db.updateCartItem(userId, params.id, quantity);
    return NextResponse.json(cart);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Error' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.nextUrl.searchParams.get('userId') || 'guest';
  try {
    const cart = db.updateCartItem(userId, params.id, 0);
    return NextResponse.json(cart);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Error' }, { status: 400 });
  }
}
