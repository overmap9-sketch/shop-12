import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ClientCancel from '../ClientCancel';

/**
 * SEO: noindex the transactional cancel page; provide canonical.
 * UX: wrap ClientCancel (uses useSearchParams) in Suspense to satisfy app router requirements.
 */
export const metadata: Metadata = {
  title: 'Checkout Cancelled · PaintHub',
  description: 'Payment was cancelled. You can retry checkout.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/checkout/cancel' },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6" aria-busy="true">Loading…</div>}>
      <ClientCancel />
    </Suspense>
  );
}
