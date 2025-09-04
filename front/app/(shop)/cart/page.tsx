import React from 'react';
import { Cart } from '../../../src/pages/cart/Cart';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Your shopping cart'
};

export default function Page() {
  return <Cart />;
}
