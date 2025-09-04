import React from 'react';
import { PlaceholderPage } from '../../../src/pages/PlaceholderPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Analytics',
  description: 'Analytics overview'
};

export default function Page() {
  return <PlaceholderPage title="Analytics" />;
}
