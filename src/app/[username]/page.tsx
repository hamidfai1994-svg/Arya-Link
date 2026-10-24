import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { PublicProfileClient } from '@/components/profile/PublicProfileClient';
import { CreditCard, ArrowRight, ShieldAlert, Sparkles, Home, UserCheck } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ username: string }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanAlias = decodeURIComponent(username || '').toLowerCase().trim();

  try {
    await connectToDatabase();
    const profile = await Profile.findOne({
      alias: cleanAlias,
      isActive: { $ne: false },
    }).lean();

    if (!profile) {
      return {
        title: 'کارت ویزیت یافت نشد | Arya Link',
        description: 'کارت هوشمند مورد نظر در سامانه آریا لینک پیدا نشد.',
      };
    }

    const displayName = profile.displayName || cleanAlias;
    const title = profile.seoTitle || `${displayName} | کارت ویزیت هوشمند آریا لینک`;
    const description =
      profile.seoDescription ||
      profile.bio ||
      profile.headline ||
      `مشاهده اطلاعات تماس، شبکه‌های اجتماعی و راه‌های ارتباطی با ${displayName}`;
    const images = profile.avatarUrl ? [profile.avatarUrl] : ['/favicon.ico'];

    const robots = profile.noIndex ? { index: false, follow: false } : undefined;

    return {
      title,
      description,
      robots,
      openGraph: {
        title,
        description,
        images,
        type: 'profile',
        siteName: 'Arya Link',
        url: `https://aryal.ink/${cleanAlias}`,
        locale: profile.profileLanguage === 'en' ? 'en_US' : 'fa_AF',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images,
      },
    };
  } catch (error) {
    console.error('Error in generateMetadata for profile:', error);
    return {
      title: 'کارت ویزیت هوشمند | Arya Link',
    };
  }
}

// 2. Main Page Component
export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const cleanAlias = decodeURIComponent(username || '').toLowerCase().trim();

  // Reserved routes guard (avoid collision with any sub-paths)
  const reservedWords = [
    'api',
    'dashboard',
    'login',
    'register',
    'verify-otp',
    'forgot-password',
    'reset-password',
    'admin',
    'favicon.ico',
    '_next',
  ];
  if (reservedWords.includes(cleanAlias)) {
    return <NotFoundCard alias={cleanAlias} />;
  }

  let profile: any = null;
  try {
    await connectToDatabase();
    profile = await Profile.findOne({
      alias: cleanAlias,
      isActive: { $ne: false },
    }).lean();
  } catch (err) {
    console.error('Database connection error in PublicProfilePage:', err);
  }

  if (!profile) {
    return <NotFoundCard alias={cleanAlias} />;
  }

  // Direct Mode Support: If directModeEnabled is true and directModeUrl is set, redirect immediately
  if (profile.directModeEnabled && profile.directModeUrl && profile.directModeUrl.trim()) {
    let targetUrl = profile.directModeUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl) && !/^(tel:|mailto:|whatsapp:)/i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    // Increment view count before redirect
    try {
      await Profile.updateOne({ _id: profile._id }, { $inc: { viewsCount: 1 } });
    } catch (e) {
      console.error('Error incrementing view count in direct mode:', e);
    }
    redirect(targetUrl);
  }

  // Increment profile views count asynchronously
  try {
    await Profile.updateOne({ _id: profile._id }, { $inc: { viewsCount: 1 } });
  } catch (e) {
    console.error('Error incrementing profile viewsCount:', e);
  }

  // Serialize profile object to ensure safe transfer to client component
  const serializedProfile = {
    id: profile._id.toString(),
    alias: profile.alias,
    displayName: profile.displayName || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || '',
    coverUrl: profile.coverUrl || '',
    headerLayout: profile.headerLayout || 'curve',
    phone: profile.phone || '',
    whatsapp: profile.whatsapp || '',
    email: profile.email || '',
    location: profile.location || '',
    directModeEnabled: Boolean(profile.directModeEnabled),
    directModeUrl: profile.directModeUrl || '',
    themeConfig: profile.themeConfig ? JSON.parse(JSON.stringify(profile.themeConfig)) : undefined,
    links: (profile.links || []).map((l: any) => ({
      id: l.id || String(l._id || Math.random()),
      title: l.title || '',
      url: l.url || '',
      icon: l.icon || '',
      moduleType: l.moduleType,
      isActive: l.isActive !== false,
      isPinned: Boolean(l.isPinned),
      order: l.order || 0,
      clickCount: l.clickCount || 0,
      metadata: l.metadata ? JSON.parse(JSON.stringify(l.metadata)) : {},
      advancedSettings: l.advancedSettings ? JSON.parse(JSON.stringify(l.advancedSettings)) : {},
    })),
    profileType: profile.profileType || 'personal',
    isVerified: Boolean(profile.isVerified),
    verificationStatus: profile.verificationStatus || 'unverified',
    profileLanguage: profile.profileLanguage || 'dari',
    hideBranding: Boolean(profile.hideBranding),
    passwordProtection: profile.passwordProtection
      ? JSON.parse(JSON.stringify(profile.passwordProtection))
      : undefined,
    noIndex: Boolean(profile.noIndex),
  };

  return <PublicProfileClient profile={serializedProfile} />;
}

// 3. Aesthetic 404 "Card Not Found" UI
function NotFoundCard({ alias }: { alias: string }) {
  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between items-center p-4 selection:bg-cyan-500 selection:text-white"
    >
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Logo */}
      <div className="pt-8 text-center flex justify-center">
        <SiteLogo
          href="/"
          width={36}
          height={36}
          showText={true}
          textClassName="text-white text-base"
        />
      </div>

      {/* Main 404 Glass Card */}
      <div className="w-full max-w-md mx-auto my-auto p-6 md:p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-2xl bg-rose-500/15 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
          <CreditCard className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>کارت ویزیت یافت نشد</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight pt-1">
            کارت هوشمندی با نام <span className="text-cyan-400 font-outfit" dir="ltr">@{alias}</span> وجود ندارد
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-sans">
            ممکن است آدرس کارت تغییر کرده باشد، نام کاربری به درستی تایپ نشده باشد، یا صاحب این حساب آن را غیرفعال کرده باشد.
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          <Link
            href="/register"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <UserCheck className="w-4 h-4" />
            <span>ثبت نام و ساخت کارت هوشمند رایگان</span>
          </Link>

          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <span>ورود به پنل کاربری</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pb-6 text-center select-none text-[11px] text-slate-500">
        <span>طراحی شده با ⚡ </span>
        <span className="font-outfit font-semibold text-slate-400">Arya Link</span>
      </div>
    </div>
  );
}
