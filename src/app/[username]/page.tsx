import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { User } from '@/models/User.model';
import { Organization } from '@/models/Organization.model';
import mongoose from 'mongoose';
import { PublicProfileClient } from '@/components/profile/PublicProfileClient';
import { CreditCard, ArrowRight, ShieldAlert, Sparkles, Home, UserCheck } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import { getSiteSettings } from '@/lib/settings';
import { getBaseUrl } from '@/lib/base-url';
import { createProfileViewNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ username: string }>;
}

// 1. Dynamic SEO Metadata Generation (Open Graph & Twitter Cards)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanAlias = decodeURIComponent(username || '').toLowerCase().trim();
  const baseUrl = getBaseUrl();
  const fullProfileUrl = `${baseUrl}/${cleanAlias}`;

  const toAbsoluteImageUrl = (rawUrl?: string | null): string => {
    const clean = (rawUrl || '').trim();
    if (!clean || clean.startsWith('data:')) return '';
    if (/^https?:\/\//i.test(clean)) return clean;
    return `${baseUrl}${clean.startsWith('/') ? '' : '/'}${clean}`;
  };

  try {
    await connectToDatabase();
    const profile = await Profile.findOne({
      alias: cleanAlias,
      isActive: { $ne: false },
    }).lean();

    if (!profile) {
      return {
        title: 'کارت ویزیت یافت نشد | آریا لینک',
        description: 'کارت ویزیت هوشمند و راهکارهای ارتباطی آریا لینک',
      };
    }

    let ownerUser: any = null;
    if (profile.userId && mongoose.isValidObjectId(String(profile.userId))) {
      ownerUser = await User.findById(profile.userId)
        .select('name occupation isActive')
        .lean()
        .catch(() => null);
    }

    if (ownerUser && ownerUser.isActive === false) {
      return {
        title: 'کارت ویزیت غیرفعال است | آریا لینک',
        description: 'کارت ویزیت هوشمند و راهکارهای ارتباطی آریا لینک',
      };
    }

    const displayName =
      getLocalizedText(profile.displayName, 'da', '')?.trim() ||
      ownerUser?.name?.trim() ||
      cleanAlias;
    const jobTitle =
      getLocalizedText(profile.headline, 'da', '')?.trim() ||
      ownerUser?.occupation?.trim() ||
      '';

    const title = profile.seoTitle?.trim()
      ? profile.seoTitle.trim()
      : jobTitle
        ? `${displayName} | ${jobTitle}`
        : `${displayName} | آریا لینک`;

    const bioText =
      profile.seoDescription?.trim() ||
      getLocalizedText(profile.bio, 'da', '')?.trim() ||
      '';
    const description =
      bioText || 'کارت ویزیت هوشمند و راهکارهای ارتباطی آریا لینک';

    const siteSettings = await getSiteSettings();
    const fallbackLogo =
      toAbsoluteImageUrl(siteSettings?.platformMainLogo) ||
      toAbsoluteImageUrl(siteSettings?.companyLogo) ||
      toAbsoluteImageUrl(siteSettings?.platformFavicon) ||
      toAbsoluteImageUrl(siteSettings?.favicon) ||
      `${baseUrl}/favicon.ico`;

    const profileImage = toAbsoluteImageUrl(profile.avatarUrl) || fallbackLogo;
    const images = [{ url: profileImage, alt: displayName }];

    const robots = profile.noIndex ? { index: false, follow: false } : undefined;

    return {
      metadataBase: new URL(baseUrl),
      title,
      description,
      robots,
      openGraph: {
        title,
        description,
        url: fullProfileUrl,
        images,
        type: 'profile',
        siteName: 'Arya Link',
        locale: profile.profileLanguage === 'en' ? 'en_US' : 'fa_AF',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [profileImage],
      },
    };
  } catch (error) {
    console.error('Error in generateMetadata for profile:', error);
    return {
      title: 'کارت ویزیت هوشمند | آریا لینک',
      description: 'کارت ویزیت هوشمند و راهکارهای ارتباطی آریا لینک',
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

  // Increment profile views count asynchronously & create throttled bell notification
  try {
    await Profile.updateOne({ _id: profile._id }, { $inc: { viewsCount: 1 } });
    if (profile.userId) {
      const profileTitle = getLocalizedText(profile.displayName, 'da', cleanAlias);
      createProfileViewNotification(profile.userId, cleanAlias, profileTitle).catch(() => { });
    }
  } catch (e) {
    console.error('Error incrementing profile viewsCount:', e);
  }

  // Load owner user's financial settings and organization membership
  let ownerFinancialSettings = profile.financialSettings;
  let ownerUser: any = null;
  if (profile.userId && mongoose.isValidObjectId(String(profile.userId))) {
    try {
      ownerUser = await User.findById(profile.userId)
        .select('financialSettings organizationId orgRole isActive')
        .lean();
    } catch (uErr) {
      console.warn('Could not load owner user settings by userId:', uErr);
    }
  }
  const ownerEmailFallback = (profile as any).userEmail || profile.email;
  if (!ownerUser && typeof ownerEmailFallback === 'string' && ownerEmailFallback.trim()) {
    try {
      ownerUser = await User.findOne({ email: ownerEmailFallback.toLowerCase().trim() })
        .select('financialSettings organizationId orgRole isActive')
        .lean();
    } catch (uErr) {
      console.warn('Could not load owner user settings by email:', uErr);
    }
  }
  if (ownerUser && ownerUser.isActive === false) {
    return <NotFoundCard alias={cleanAlias} />;
  }
  if (
    ownerUser?.financialSettings &&
    !ownerFinancialSettings?.hesabPay?.accountNumber &&
    !ownerFinancialSettings?.hesabPay?.merchantId
  ) {
    ownerFinancialSettings = ownerUser.financialSettings;
  }

  // Load corporate organization branding when profile owner belongs to an organization
  let organizationBranding: {
    id: string;
    name: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    coverImage: string;
    companySlogan: string;
  } | null = null;

  const resolvedOrgId = ownerUser?.organizationId || profile.orgId;
  if (resolvedOrgId && mongoose.isValidObjectId(String(resolvedOrgId))) {
    try {
      const orgDoc = await Organization.findById(resolvedOrgId).lean();
      if (orgDoc) {
        const ob = orgDoc.branding || {};
        organizationBranding = {
          id: orgDoc._id.toString(),
          name: orgDoc.name || '',
          logoUrl: ob.logoUrl || '',
          primaryColor: ob.primaryColor || '#0ea5e9',
          secondaryColor: ob.secondaryColor || ob.accentColor || '#10b981',
          coverImage: ob.coverImage || '',
          companySlogan: ob.companySlogan || '',
        };
      }
    } catch (orgErr) {
      console.warn('Could not load organization branding for public profile:', orgErr);
    }
  }

  const rawThemeConfig = profile.themeConfig
    ? JSON.parse(JSON.stringify(profile.themeConfig))
    : undefined;

  const effectiveThemeConfig = organizationBranding
    ? {
      ...(rawThemeConfig || {}),
      preset:
        rawThemeConfig?.preset === 'minimal_light'
          ? 'dark_neon'
          : rawThemeConfig?.preset || 'dark_neon',
      backgroundType: 'gradient',
      bgGradientColors: [
        '#090d16',
        `${organizationBranding.primaryColor}38`,
        `${organizationBranding.secondaryColor}28`,
      ],
      backgroundColor: `linear-gradient(135deg, #090d16 0%, ${organizationBranding.primaryColor}26 50%, #0f172a 100%)`,
      primaryColor: organizationBranding.primaryColor,
      accentColor: organizationBranding.secondaryColor,
      buttonBgColor: organizationBranding.primaryColor,
      buttonBorderColor: organizationBranding.secondaryColor,
    }
    : rawThemeConfig;

  const effectiveCoverUrl = organizationBranding?.coverImage
    ? organizationBranding.coverImage
    : profile.coverUrl || '';

  // Safe serialization of owner financial settings (SECRET API KEY MUST BE EXCLUDED!)
  const sanitizedFinancialSettings = ownerFinancialSettings?.hesabPay
    ? {
      hesabPay: {
        isActive: ownerFinancialSettings.hesabPay.isActive !== false,
        isApiEnabled: Boolean(ownerFinancialSettings.hesabPay.isApiEnabled),
        merchantId: ownerFinancialSettings.hesabPay.merchantId || '',
        accountNumber: ownerFinancialSettings.hesabPay.accountNumber || '',
        accountName: ownerFinancialSettings.hesabPay.accountName || '',
      },
    }
    : null;

  // Serialize profile object to ensure safe transfer to client component
  const serializedProfile = {
    id: profile._id.toString(),
    alias: profile.alias,
    displayName: profile.displayName || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    translations: (profile as any).translations || {},
    avatarUrl: profile.avatarUrl || '',
    coverUrl: effectiveCoverUrl,
    headerLayout: profile.headerLayout || 'curve',
    phone: profile.phone || '',
    whatsapp: profile.whatsapp || '',
    email: profile.email || '',
    location: profile.location || '',
    directModeEnabled: Boolean(profile.directModeEnabled),
    directModeUrl: profile.directModeUrl || '',
    themeConfig: effectiveThemeConfig,
    organizationBranding,
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
      expiresAt: l.expiresAt ? (l.expiresAt instanceof Date ? l.expiresAt.toISOString() : String(l.expiresAt)) : (l.advancedSettings?.expiresAt ? String(l.advancedSettings.expiresAt) : null),
      maxClicks: typeof l.maxClicks === 'number' ? l.maxClicks : (typeof l.advancedSettings?.maxClicks === 'number' ? l.advancedSettings.maxClicks : null),
      hasPassword: Boolean(l.passwordHash || l.advancedSettings?.passwordHash),
    })),
    profileType: profile.profileType || 'personal',
    isVerified: Boolean(profile.isVerified),
    verificationStatus: profile.verificationStatus || 'unverified',
    profileLanguage: profile.profileLanguage || 'dari',
    hideBranding: Boolean(profile.hideBranding),
    passwordProtection: profile.passwordProtection
      ? JSON.parse(JSON.stringify(profile.passwordProtection))
      : undefined,
    financialSettings: sanitizedFinancialSettings,
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
            کارت هوشمندی با نام <span className="text-cyan-400 font-sans" dir="ltr">@{alias}</span> وجود ندارد
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
        <span className="font-sans font-semibold text-slate-400">Arya Link</span>
      </div>
    </div>
  );
}
