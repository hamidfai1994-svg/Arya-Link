'use client';

import { useEffect, useState } from 'react';

export default function AdminTWA() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      tg.ready();
      tg.expand();
      fetch('/api/twa/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData, type: 'admin' }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setAuthStatus('success');
          else setAuthStatus('error');
        })
        .catch(() => setAuthStatus('error'));
    } else {
      setAuthStatus('error');
    }
  }, []);

  if (authStatus === 'loading') {
    return <div className="p-4 text-center">در حال تایید هویت امن...</div>;
  }
  if (authStatus === 'error') {
    return (
      <div className="p-4 text-center text-red-500">
        دسترسی غیرمجاز. فقط از داخل ربات تلگرام باز کنید.
      </div>
    );
  }

  return (
    <div className="p-4 font-sans" dir="rtl">
      <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--tg-theme-button-color, #0ea5e9)' }}>
        مرکز فرماندهی آریا لینک
      </h1>
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))' }}
      >
        <p>خوش آمدید سوپر ادمین!</p>
      </div>
    </div>
  );
}

