import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ClientSuccess from '../ClientSuccess';

/**
 * SEO: noindex the transactional success page; provide canonical.
 * UX: wrap ClientSuccess (uses useSearchParams) in Suspense to satisfy app router requirements.
 */
export const metadata: Metadata = {
  title: 'Checkout Success · PaintHub',
  description: 'Order confirmation and payment status after checkout.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/checkout/success' },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6" aria-busy="true">Loading…</div>}>
      <ClientSuccess />
    </Suspense>
  );
}
