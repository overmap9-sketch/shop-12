"use client";
import React, { Suspense } from 'react';
import ClientCancel from '../ClientCancel';

/**
 * useSearchParams is used in ClientCancel; wrap in Suspense to comply with
 * Next.js app router streaming/prerender safeguards.
 */
export default function Page() {
  return (
    <Suspense fallback={<div className="p-6" aria-busy="true">Loading…</div>}>
      <ClientCancel />
    </Suspense>
  );
}
