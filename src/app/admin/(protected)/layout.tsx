import React from 'react';
import { requireAdmin } from '@/lib/auth/session';
import AdminShell from '@/components/admin/AdminShell';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
