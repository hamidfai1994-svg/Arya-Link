'use client';

import React, { Suspense } from 'react';
import { AuthPage } from '@/components/auth/AuthPage';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      }
    >
      <AuthPage initialMode="login" />
    </Suspense>
  );
}
