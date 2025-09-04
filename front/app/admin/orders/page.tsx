import React from 'react';
import { AdminOrders } from '../../../src/app-pages/admin/Orders';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Orders',
  description: 'Manage orders'
};

export default function Page() {
  return <AdminOrders />;
}
