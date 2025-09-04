import React from 'react';
import { Register } from '../../../src/app-pages/auth/Register';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account'
};

export default function Page() {
  return <Register />;
}
