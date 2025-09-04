import React from 'react';
import { Favourites } from '../../../src/pages/favourites/Favourites';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favourites',
  description: 'Your saved products'
};

export default function Page() {
  return <Favourites />;
}
