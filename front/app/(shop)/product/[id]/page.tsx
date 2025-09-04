import React from 'react';
import { ProductDetail } from '../../../../src/pages/product/ProductDetail';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Details',
  description: 'View product details, specifications, and reviews'
};

export default function Page() {
  return <ProductDetail />;
}
