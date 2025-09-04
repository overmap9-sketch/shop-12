import React from 'react';
import { AdminShipping } from '../../../src/pages/admin/Shipping';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Shipping',
  description: 'Shipping methods and rates'
};

export default function Page() {
  return <AdminShipping />;
}
