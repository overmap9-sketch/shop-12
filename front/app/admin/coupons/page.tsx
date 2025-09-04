import React from 'react';
import { AdminCoupons } from '../../../src/pages/admin/Coupons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Coupons',
  description: 'Manage coupons'
};

export default function Page() {
  return <AdminCoupons />;
}
