import React from 'react';
import { AdminUsers } from '../../../src/pages/admin/Users';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Users',
  description: 'Manage users'
};

export default function Page() {
  return <AdminUsers />;
}
