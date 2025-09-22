"use client";
import React, { Suspense } from 'react';
import ClientSuccess from '../ClientSuccess';

/**
 * useSearchParams is used in ClientSuccess; wrap in Suspense to avoid
 * CSR-bailout during prerender and align with Next.js app router requirements.
 */
export default function Page() {
  return (
    <Suspense fallback={<div className="p-6" aria-busy="true">Loading…</div>}>
      <ClientSuccess />
    </Suspense>
  );
}
