'use client';

import React, { Suspense } from 'react';
import { NfcOrderStudio } from '@/components/order-studio/NfcOrderStudio';

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100svh-80px)] bg-[#080d19] flex items-center justify-center">
          <div className="w-9 h-9 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NfcOrderStudio />
    </Suspense>
  );
}
