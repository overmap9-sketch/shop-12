import React from 'react';
import { AdminDashboard } from '../../src/pages/admin/Dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Dashboard',
  description: 'Overview of store metrics'
};

export default function Page() {
  return <AdminDashboard />;
}
