import React from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ActiveCardProvider } from '@/context/ActiveCardContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveCardProvider>
      <DashboardShell>{children}</DashboardShell>
    </ActiveCardProvider>
  );
}
