import React from 'react';
import { Catalog } from '../../../src/pages/catalog/Catalog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse products by category, filters, and search'
};

export default function Page() {
  return <Catalog />;
}
