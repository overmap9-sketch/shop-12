import React from 'react';
import { AdminCategories } from '../../../src/app-pages/admin/Categories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Categories',
  description: 'Manage categories'
};

export default function Page() {
  return <AdminCategories />;
}
