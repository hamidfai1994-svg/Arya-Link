import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const role = (session?.user?.role || '').toLowerCase();
  const allowedRoles = ['admin', 'superadmin', 'financial_admin', 'content_editor'];

  // Strict server-side RBAC access guard
  if (!session || !allowedRoles.includes(role)) {
    redirect('/dashboard?error=admin_only');
  }

  return <AdminShell>{children}</AdminShell>;
}
