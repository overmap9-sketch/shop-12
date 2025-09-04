"use client";
import React from 'react';
import { CategoryForm as AdminCategoryForm } from '../../../../../src/app-pages/admin/CategoryForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin · Edit Category',
  description: 'Edit category'
};

export default function Page() {
  return <AdminCategoryForm />;
}
