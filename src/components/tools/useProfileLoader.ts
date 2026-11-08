'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface UserLoadedProfile {
  displayName: string;
  headline: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  location: string;
  avatarUrl: string;
  links: Array<{
    title: string;
    url: string;
    type?: string;
  }>;
}

export function useProfileLoader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const loadProfile = async (
    onSuccess: (profile: UserLoadedProfile) => void
  ) => {
    if (status !== 'authenticated' || !session?.user) {
      toast.info(
        language === 'en'
          ? 'Please log in first to load your profile information.'
          : language === 'ps'
          ? 'مهرباني وکړئ لومړی خپل حساب ته ننوځئ ترڅو ستاسو معلومات راوغوښتل شي.'
          : 'لطفاً ابتدا وارد حساب کاربری خود شوید تا اطلاعات پروفایل شما فراخوانی شود.',
        {
          action: {
            label: language === 'en' ? 'Log In' : language === 'ps' ? 'ننوتل' : 'ورود',
            onClick: () => router.push('/login'),
          },
        }
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/profile');
      const json = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message || 'Failed to fetch profile');
      }

      const p = json.data;
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aryalink.com';
      const profileUrl = p.alias ? `${origin}/${p.alias}` : (p.links?.[0]?.url || '');

      const loaded: UserLoadedProfile = {
        displayName: p.displayName || session.user.name || '',
        headline: p.headline || '',
        company: p.company || '',
        phone: p.phone || p.whatsapp || '',
        email: session.user.email || p.email || '',
        website: profileUrl,
        location: p.location || '',
        avatarUrl: p.avatarUrl || session.user.image || '',
        links: Array.isArray(p.links) ? p.links : [],
      };

      onSuccess(loaded);
      toast.success(
        language === 'en'
          ? 'Your profile information was loaded successfully!'
          : language === 'ps'
          ? 'ستاسو د پروفایل معلومات په بریا سره اضافه شول!'
          : 'اطلاعات پروفایل شما با موفقیت فراخوانی شد!'
      );
    } catch (err: any) {
      console.error('Failed to load profile for tools:', err);
      // Fallback with session info
      const fallback: UserLoadedProfile = {
        displayName: session.user.name || '',
        headline: '',
        company: '',
        phone: '',
        email: session.user.email || '',
        website: '',
        location: '',
        avatarUrl: session.user.image || '',
        links: [],
      };
      onSuccess(fallback);
      toast.success(
        language === 'en'
          ? 'Basic profile information loaded from your session.'
          : language === 'ps'
          ? 'د کاروونکي لومړني معلومات ځای پر ځای شول.'
          : 'اطلاعات کاربری پایه از سشن شما بارگذاری شد.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadProfile,
    isLoading,
    isLoggedIn: status === 'authenticated' && !!session?.user,
  };
}

