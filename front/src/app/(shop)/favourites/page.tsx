"use client";
import React from 'react';
import type { Metadata } from 'next';
import { Favourites } from '../../../views/favourites/Favourites';

export const metadata: Metadata = {
  title: 'Favourites · PaintHub',
  description: 'Your saved products.',
  alternates: { canonical: '/favourites' },
  robots: { index: false, follow: false }
};

export default function Page() {
  return <Favourites />;
}
