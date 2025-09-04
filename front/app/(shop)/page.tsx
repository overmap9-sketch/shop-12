"use client";
import React from 'react';
import { Home } from '../../src/app-pages/home/Home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'PaintHub home page with featured products and categories'
};

export default function Page() {
  return <Home />;
}
