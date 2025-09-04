import React from 'react';
import { AdminProducts } from '../../../src/app-pages/admin/Products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Products',
  description: 'Manage products'
};

export default function Page() {
  return <AdminProducts />;
}
