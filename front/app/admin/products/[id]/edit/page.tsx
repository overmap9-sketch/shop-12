import React from 'react';
import { ProductForm as AdminProductForm } from '../../../../../src/app-pages/admin/ProductForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Edit Product',
  description: 'Edit product details'
};

export default function Page() {
  return <AdminProductForm />;
}
