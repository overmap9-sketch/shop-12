"use client";
import React from 'react';
import { Login } from '../../../views/auth/Login';

import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6" aria-busy>Loading…</div>}>
      <Login />
    </Suspense>
  );
}
