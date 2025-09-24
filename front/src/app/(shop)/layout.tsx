"use client";
import React from 'react';
import { Header } from '../../widgets/header/Header';
import { Footer } from '../../widgets/footer/Footer';
import { Toaster } from '../../components/ui/toaster';
import { AppInit } from '../AppInit';
import { BottomNav } from '../../widgets/bottom-nav/BottomNav';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppInit />
      <Header />
      {/* Reserve space for fixed BottomNav on mobile to avoid CLS/overlap */}
      <main className="flex-1 pb-safe-bottom md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <Toaster />
    </div>
  );
}
