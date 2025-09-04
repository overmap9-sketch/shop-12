import React from 'react';
import { PlaceholderPage } from '../../../src/pages/PlaceholderPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Your order history'
};

export default function Page() {
  return <PlaceholderPage title="Order History" />;
}
