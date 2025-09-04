import React from 'react';
import { AdminSettings } from '../../../src/pages/admin/Settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Settings',
  description: 'Store settings'
};

export default function Page() {
  return <AdminSettings />;
}
