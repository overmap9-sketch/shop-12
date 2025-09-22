import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ClientCancel = dynamic(() => import('../cancel/ClientCancel'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ClientCancel />
    </Suspense>
  );
}
