"use client";
import React from 'react';
import { AdminBulkUpdate } from '../../../src/app-pages/admin/BulkUpdate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Bulk Update',
  description: 'Bulk update products'
};

export default function Page() {
  return <AdminBulkUpdate />;
}
