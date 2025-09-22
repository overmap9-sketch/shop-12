"use client";
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch } from '../../../core/hooks';
import { setSearchQuery, updateFilters, setSort, setCurrentPage } from '../../../features/catalog/catalogSlice';

const Catalog = dynamic(() => import('../../../views/catalog/Catalog').then(m => m.Catalog), {
  ssr: false,
  loading: () => null,
});

type Initial = {
  q?: string;
  category?: string;
  subcategory?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

function parseSort(s?: string) {
  if (!s) return undefined;
  if (s === 'price_asc') return { field: 'price', order: 'asc' } as const;
  if (s === 'price_desc') return { field: 'price', order: 'desc' } as const;
  if (s === 'new') return { field: 'dateAdded', order: 'desc' } as const;
  if (s === 'rating') return { field: 'rating', order: 'desc' } as const;
  return undefined;
}

export function ClientCatalogShell({ initial }: { initial?: Initial }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Hide SSR-only grid after hydration to avoid duplicate content
    const el = document.getElementById('ssr-catalog');
    if (el) el.style.display = 'none';
  }, []);

  useEffect(() => {
    if (!initial) return;
    if (initial.q) dispatch(setSearchQuery(initial.q));
    const f: any = {};
    if (initial.category) f.category = initial.category;
    if (initial.subcategory) f.subcategory = initial.subcategory;
    if (Object.keys(f).length) dispatch(updateFilters(f));
    const sort = parseSort(initial.sort);
    if (sort) dispatch(setSort(sort as any));
    if (initial.page && initial.page > 1) dispatch(setCurrentPage(initial.page));
  }, [dispatch, initial]);

  return <Catalog />;
}
