import React from 'react';
import { Login } from '../../../src/pages/auth/Login';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Access your account'
};

export default function Page() {
  return <Login />;
}
