'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Only render marketing Navbar & Footer for public marketing routes
  const isMarketingPage =
    pathname === '/' ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/about');

  if (!isMarketingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
export default PublicShell;
