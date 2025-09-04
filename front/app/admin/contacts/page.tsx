"use client";
import React from 'react';
import { AdminContacts } from '../../../src/app-pages/admin/Contacts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Contacts',
  description: 'Contact settings'
};

export default function Page() {
  return <AdminContacts />;
}
