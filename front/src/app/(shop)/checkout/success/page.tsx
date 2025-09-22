import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ClientSuccess = dynamic(() => import('./ClientSuccess'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ClientSuccess />
    </Suspense>
  );
}
