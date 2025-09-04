import React from 'react';
import { Profile } from '../../../src/app-pages/profile/Profile';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your profile and preferences'
};

export default function Page() {
  return <Profile />;
}
