import React from 'react';
import type { Metadata } from 'next';
import { Cart } from '../../../views/cart/Cart';

export const metadata: Metadata = {
  title: 'Cart · PaintHub',
  description: 'Review items in your cart and proceed to secure checkout.',
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: false }
};

export default function Page() {
  return <Cart />;
}
