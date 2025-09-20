import { NextRequest, NextResponse } from 'next/server';
import { db } from '../_db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'guest';
  const cart = db.ensureCart(userId);
  return NextResponse.json(cart);
}
