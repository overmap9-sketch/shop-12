"use client";
import React from 'react';
import { Categories } from '../../../src/app-pages/categories/Categories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Shop by categories and discover new products'
};

export default function Page() {
  return <Categories />;
}
