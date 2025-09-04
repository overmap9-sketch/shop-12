import React from 'react';
import { Cart } from '../../../src/app-pages/cart/Cart';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Your shopping cart'
};

export default function Page() {
  return <Cart />;
}
