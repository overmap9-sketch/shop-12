"use client";
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

const Catalog = dynamic(() => import('../../../views/catalog/Catalog').then(m => m.Catalog), {
  ssr: false,
  loading: () => null,
});

export function ClientCatalogShell() {
  useEffect(() => {
    const el = document.getElementById('ssr-catalog');
    if (el) el.style.display = 'none';
  }, []);
  return <Catalog />;
}
