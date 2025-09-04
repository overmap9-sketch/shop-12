import React from 'react';
import { PlaceholderPage } from '../../../src/pages/PlaceholderPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your purchase'
};

export default function Page() {
  return <PlaceholderPage title="Checkout" />;
}
