import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/admin/dashboard');
  }

  const role = (session?.user?.role || '').toLowerCase();
  const allowedRoles = ['admin', 'superadmin', 'financial_admin', 'content_editor'];

  // Strict server-side RBAC access guard: 403 Forbidden Screen for unauthorized regular users
  if (!allowedRoles.includes(role)) {
    return (
      <div
        className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-6 select-none"
        dir="rtl"
      >
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black font-sans uppercase tracking-widest text-rose-400">
              HTTP 403 - FORBIDDEN
            </span>
            <h1 className="text-xl font-black text-white">
              عدم دسترسی به پنل مدیریت ارشد
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              حساب کاربری شما دارای مجوزهای سطح مدیریت کل (Super Admin / Admin) نیست. این بخش صرفاً جهت نظارت و پیکربندی مدیران ارشد سیستم آریا لینک می‌باشد.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/dashboard" className="w-full">
              <Button className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2">
                <span>بازگشت به داشبورد کاربری من</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
