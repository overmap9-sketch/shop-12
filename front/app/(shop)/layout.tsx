"use client";
import React from 'react';
import { Header } from '../../src/widgets/header/Header';
import { Footer } from '../../src/widgets/footer/Footer';
import { Toaster } from '../../src/components/ui/toaster';
import { AppInit } from '../AppInit';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppInit />
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
