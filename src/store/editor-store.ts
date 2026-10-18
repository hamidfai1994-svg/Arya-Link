import { create } from 'zustand';
import {
  ProfileData,
  ProfileLinkItem,
  ProfileThemeConfig,
  LinkModuleType,
  ModuleMetadata,
  ModuleAdvancedSettings,
  UserProfileSummary,
  HeaderLayoutType,
  ProfileLanguage,
  ProfileType,
  VerificationStatus,
  VerificationData,
} from '@/types/profile.types';

export interface EditorState {
  profile: ProfileData;
  selectedDeviceId: 'iphone' | 'android' | 'tablet';
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;

  // Multi-Profile Support
  profilesList: UserProfileSummary[];
  activeProfileId: string;
  profilesCache: Record<string, ProfileData>;
  fetchProfilesList: () => Promise<UserProfileSummary[]>;
  switchProfile: (profileId: string) => Promise<void>;
  createProfile: (data: { alias: string; displayName: string; roleType: 'personal' | 'business' | 'creator'; headline?: string }) => Promise<UserProfileSummary | null>;
  deleteProfile: (profileId: string) => Promise<boolean>;
  cleanupProfiles: () => Promise<boolean>;

  // Profile Actions
  updateBasicInfo: (fields: Partial<Pick<ProfileData, 'displayName' | 'headline' | 'bio' | 'avatarUrl' | 'coverUrl' | 'headerLayout' | 'alias' | 'phone' | 'whatsapp' | 'email' | 'location'>>) => void;
  setHeaderLayout: (layout: HeaderLayoutType) => void;
  setProfileLanguage: (lang: ProfileLanguage) => void;
  updateTheme: (fields: Partial<ProfileThemeConfig>) => void;
  setThemePreset: (preset: ProfileThemeConfig['preset']) => void;
  toggleDirectMode: (enabled?: boolean, url?: string) => void;
  updateProSettings: (fields: Partial<Pick<ProfileData, 'seoTitle' | 'seoDescription' | 'hideBranding' | 'selectedTemplateId'>>) => void;

  // KYC Verification Actions
  setProfileType: (type: ProfileType) => void;
  updateVerificationData: (data: Partial<VerificationData>) => void;
  submitVerification: () => Promise<boolean>;
  toggleVerifiedBadge: (isVerified?: boolean) => void;

  // Link & Module Actions
  addModule: (moduleType: LinkModuleType) => void;
  addLink: (newLink?: Partial<Omit<ProfileLinkItem, 'id' | 'order'>>) => void;
  updateLink: (id: string, updates: Partial<ProfileLinkItem>) => void;
  updateLinkMetadata: (id: string, metadata: Partial<ModuleMetadata>) => void;
  updateLinkAdvancedSettings: (id: string, settings: Partial<ModuleAdvancedSettings>) => void;
  removeLink: (id: string) => void;
  reorderLinks: (reorderedList: ProfileLinkItem[]) => void;
  moveLinkUp: (index: number) => void;
  moveLinkDown: (index: number) => void;

  // Async API Actions
  fetchProfileData: (aliasOrId?: string) => Promise<boolean>;
  saveProfileData: () => Promise<{ success: boolean; message: string; data?: ProfileData }>;

  // Device Preview Controls
  setDevice: (device: 'iphone' | 'android' | 'tablet') => void;
  setIsSaving: (isSaving: boolean) => void;
  resetState: (initialData?: ProfileData) => void;
}

const defaultTheme: ProfileThemeConfig = {
  preset: 'dark_neon',
  primaryColor: '#0ea5e9',
  accentColor: '#06b6d4',
  backgroundColor: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
  cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
  textColor: '#ffffff',
  borderRadius: 'rounded-2xl',
};

const emptyProfile: ProfileData = {
  id: '',
  alias: '',
  displayName: '',
  headline: '',
  bio: '',
  avatarUrl: '',
  coverUrl: '',
  headerLayout: 'curve',
  phone: '',
  whatsapp: '',
  email: '',
  location: '',
  directModeEnabled: false,
  directModeUrl: '',
  themeConfig: defaultTheme,
  links: [],
  profileType: 'personal',
  isVerified: false,
  verificationStatus: 'unverified',
  verificationData: {
    whatsappNumber: '',
    selfieWithIdUrl: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    businessLicenseUrl: '',
    notes: '',
  },
  profileLanguage: 'dari',
  seoTitle: '',
  seoDescription: '',
  hideBranding: false,
};

function getDefaultModuleConfig(moduleType: LinkModuleType): { title: string; url: string; metadata: ModuleMetadata } {
  switch (moduleType) {
    // Social
    case 'whatsapp_direct':
      return {
        title: 'واتساپ',
        url: 'https://wa.me/93',
        metadata: {
          phoneNumber: '+93',
          prefilledMessage: 'سلام، از طریق کارت هوشمند شما پیام می‌دهم.',
        },
      };
    case 'instagram_profile':
      return {
        title: 'اینستاگرام',
        url: 'https://instagram.com/',
        metadata: {
          username: '',
        },
      };
    case 'linkedin_profile':
      return {
        title: 'لینکدین',
        url: 'https://linkedin.com/in/',
        metadata: {
          username: '',
        },
      };
    case 'telegram_channel':
      return {
        title: 'چت/کانال تلگرام',
        url: 'https://t.me/',
        metadata: {
          username: '',
        },
      };

    // Text & Layout
    case 'simple_text':
      return {
        title: 'معرفی و یادداشت',
        url: '#text',
        metadata: {
          simpleTextContent: 'به پروفایل دیجیتال من خوش آمدید. برای ارتباط یا سفارش، از لینک‌های زیر استفاده فرمایید.',
        },
      };
    case 'divider_heading':
      return {
        title: 'راه‌های ارتباطی و سفارش',
        url: '#heading',
        metadata: {
          dividerTitle: 'راه‌های ارتباطی و سفارش',
        },
      };

    // Communication
    case 'phone_call':
      return {
        title: 'تماس تلفنی مستقیم',
        url: 'tel:+93',
        metadata: {
          phoneNumber: '+93',
        },
      };
    case 'email_direct':
      return {
        title: 'ارسال ایمیل کاری',
        url: 'mailto:',
        metadata: {
          emailAddress: '',
          emailSubject: 'پیام از طریق کارت هوشمند',
        },
      };
    case 'faq_accordion':
      return {
        title: 'سوالات متداول (FAQ)',
        url: '#faq',
        metadata: {
          faqItems: [
            { id: '1', question: 'چگونه کارت NFC فعال می‌شود؟', answer: 'کافیست کارت را به پشت گوشی نزدیک کنید تا بلافاصله باز شود.' },
            { id: '2', question: 'آیا برای طرف مقابل نیازی به نصب اپلیکیشن است؟', answer: 'خیر، بدون نصب هیچ برنامه‌ای روی تمام گوشی‌های آیفون و اندروید باز می‌شود.' },
          ],
        },
      };
    case 'contact_form':
    case 'lead_capture_form':
      return {
        title: 'فرم تماس',
        url: '#contact-form',
        metadata: {
          leadHeadline: 'فرم تماس و پیام مستقیم',
          requireEmail: true,
          requireNote: true,
        },
      };

    // Media
    case 'youtube_embed':
      return {
        title: 'ویدیو در یوتیوب',
        url: 'https://youtube.com',
        metadata: {
          youtubeUrl: '',
          youtubeVideoId: '',
        },
      };
    case 'music_player':
      return {
        title: 'موسیقی و پادکست (Spotify / SoundCloud)',
        url: 'https://open.spotify.com',
        metadata: {
          musicUrl: '',
          musicPlatform: 'spotify',
        },
      };
    case 'single_image':
      return {
        title: 'تصویر تکی / بنر',
        url: '#image',
        metadata: {
          singleImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          singleImageCaption: 'بنر معرفی خدمات',
          singleImageLink: '',
        },
      };
    case 'image_gallery':
      return {
        title: 'گالری تصاویر نمونه کارها',
        url: '#gallery',
        metadata: {
          imageUrls: [
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1542744094-3a31727560fa?w=600&auto=format&fit=crop&q=80',
          ],
        },
      };

    // Location & Navigation
    case 'location_hours':
      return {
        title: 'موقعیت مکانی و ساعات کاری',
        url: '#location',
        metadata: {
          address: 'کابل، شهر نو، جاده شهید مزاری',
          workingHours: 'شنبه تا چهارشنبه: ۸:۰۰ الی ۱۶:۳۰',
          mapLink: '',
        },
      };
    case 'map_navigation':
      return {
        title: 'مسیریابی با نقشه (Waze / Google Maps)',
        url: 'https://maps.google.com',
        metadata: {
          googleMapsLink: 'https://maps.google.com',
          wazeLink: '',
        },
      };

    // Commercial & Sales
    case 'product_card':
      return {
        title: 'کارت هوشمند فلزی مشکی مات',
        url: '#product',
        metadata: {
          productTitle: 'کارت هوشمند NFC فلزی با حک لیزری',
          productPrice: 1500,
          productCurrency: 'AFN',
          productImage: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=80',
          productBuyUrl: 'https://aryal.ink/shop/metal-card',
        },
      };
    case 'donation_hesabpay':
      return {
        title: 'حمایت مالی / انعام (HesabPay)',
        url: 'https://hesabpay.af',
        metadata: {
          paymentAccount: '',
          paymentAmount: '100',
          paymentCurrency: 'AFN',
          donationDescription: 'حمایت از فعالیت‌ها و تولید محتوا',
        },
      };
    case 'spacer_divider':
      return {
        title: 'فاصله‌گذار عمودی',
        url: '#spacer',
        metadata: {
          spacerHeight: 24,
        },
      };

    case 'video_meeting':
      return {
        title: 'تماس تصویری و جلسه آنلاین (Google Meet / Zoom)',
        url: 'https://meet.google.com',
        metadata: {
          meetingPlatform: 'google_meet',
          meetingUrl: '',
        },
      };

    case 'image_slider':
      return {
        title: 'اسلایدر متحرک تصاویر',
        url: '#slider',
        metadata: {
          imageUrls: [
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1542744094-3a31727560fa?w=600&auto=format&fit=crop&q=80',
          ],
        },
      };

    case 'aparat_embed':
      return {
        title: 'ویدیو در آپارات (Aparat)',
        url: 'https://www.aparat.com',
        metadata: {
          aparatUrl: '',
          aparatVideoId: '',
        },
      };

    case 'sale_checkout':
      return {
        title: 'دکمه پرداخت آنلاین و فروش مستقیم',
        url: 'https://hesabpay.af',
        metadata: {
          checkoutItemName: 'رزرو مشاوره تخصصی',
          checkoutAmount: 500,
          paymentCurrency: 'AFN',
        },
      };

    case 'countdown_timer':
      return {
        title: 'شمارشگر تا رونمایی / رویداد',
        url: '#countdown',
        metadata: {
          countdownTitle: 'آغاز جشنواره فروش بهاره',
          countdownTargetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      };

    case 'pdf_catalog':
      return {
        title: 'کاتالوگ و لیست خدمات (PDF)',
        url: 'https://',
        metadata: {
          catalogFileUrl: '',
          catalogButtonText: 'مشاهده و دانلود PDF',
        },
      };

    // Interactive
    case 'profile_search':
      return {
        title: 'جستجو در لینک‌های پروفایل',
        url: '#search',
        metadata: {},
      };

    case 'standard_link':
    default:
      return {
        title: 'لینک جدید',
        url: 'https://',
        metadata: {},
      };
  }
}

export const useEditorStore = create<EditorState>((set, get) => ({
  profile: emptyProfile,
  selectedDeviceId: 'iphone',
  isDirty: false,
  isSaving: false,
  isLoading: false,
  lastSavedAt: null,
  saveError: null,

  // Multi-Profile State (Dynamic from MongoDB)
  profilesList: [],
  activeProfileId: '',
  profilesCache: {},

  fetchProfilesList: async () => {
    try {
      const res = await fetch('/api/profile/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return [];
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const list: UserProfileSummary[] = json.data;
        set({ profilesList: list });

        const currentActiveId = get().activeProfileId;
        const exists = list.some((p) => p.id === currentActiveId);

        if ((!currentActiveId || !exists) && list.length > 0) {
          const first = list[0];
          set({ activeProfileId: first.id });
          await get().fetchProfileData(first.alias);
        }
        return list;
      }
      return [];
    } catch (err) {
      console.error('fetchProfilesList error:', err);
      return [];
    }
  },

  switchProfile: async (profileId: string) => {
    if (profileId === get().activeProfileId) return;

    // 1. Cache current profile changes
    const current = get().profile;
    const currentId = get().activeProfileId;
    const updatedCache = {
      ...get().profilesCache,
      ...(currentId ? { [currentId]: current } : {}),
    };

    // 2. Check if target profile is in cache
    const cachedTarget = updatedCache[profileId];

    // 3. Mark active in list
    const updatedList = get().profilesList.map((p) => ({
      ...p,
      isActive: p.id === profileId,
    }));

    if (cachedTarget) {
      set({
        profile: cachedTarget,
        activeProfileId: profileId,
        profilesList: updatedList,
        profilesCache: updatedCache,
        isDirty: false,
      });
    } else {
      const targetSummary = get().profilesList.find((p) => p.id === profileId);
      set({
        activeProfileId: profileId,
        profilesList: updatedList,
        profilesCache: updatedCache,
        isDirty: false,
      });
      if (targetSummary?.alias) {
        await get().fetchProfileData(targetSummary.alias);
      }
    }
  },

  createProfile: async (data) => {
    try {
      const res = await fetch('/api/profile/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newSummary: UserProfileSummary = json.data;
        const updatedList = get().profilesList.map((p) => ({ ...p, isActive: false }));
        updatedList.push({ ...newSummary, isActive: true });

        set({
          profilesList: updatedList,
          activeProfileId: newSummary.id,
        });

        await get().fetchProfileData(newSummary.alias);
        return newSummary;
      }
      return null;
    } catch (err) {
      console.error('createProfile error:', err);
      return null;
    }
  },

  deleteProfile: async (profileId: string) => {
    try {
      const res = await fetch(`/api/profile/list?id=${encodeURIComponent(profileId)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        const remaining = get().profilesList.filter((p) => p.id !== profileId);
        set({ profilesList: remaining });
        if (get().activeProfileId === profileId && remaining.length > 0) {
          await get().switchProfile(remaining[0].id);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('deleteProfile error:', err);
      return false;
    }
  },

  cleanupProfiles: async () => {
    try {
      const res = await fetch('/api/profile/cleanup', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        await get().fetchProfilesList();
        return true;
      }
      return false;
    } catch (err) {
      console.error('cleanupProfiles error:', err);
      return false;
    }
  },

  updateBasicInfo: (fields) =>
    set((state) => {
      const updatedProfile = {
        ...state.profile,
        ...fields,
      };

      const updatedList = state.profilesList.map((p) =>
        p.id === state.activeProfileId
          ? {
            ...p,
            displayName: fields.displayName !== undefined ? fields.displayName : p.displayName,
            alias: fields.alias !== undefined ? fields.alias : p.alias,
            headline: fields.headline !== undefined ? fields.headline : p.headline,
          }
          : p
      );

      return {
        profile: updatedProfile,
        profilesList: updatedList,
        isDirty: true,
      };
    }),

  setHeaderLayout: (layout) =>
    set((state) => ({
      profile: {
        ...state.profile,
        headerLayout: layout,
      },
      isDirty: true,
    })),

  updateTheme: (fields) =>
    set((state) => ({
      profile: {
        ...state.profile,
        themeConfig: {
          ...state.profile.themeConfig,
          ...fields,
        },
      },
      isDirty: true,
    })),

  setThemePreset: (preset) =>
    set((state) => {
      let updatedTheme = { ...state.profile.themeConfig, preset };

      if (preset === 'dark_neon') {
        updatedTheme = {
          ...updatedTheme,
          primaryColor: '#0ea5e9',
          accentColor: '#38bdf8',
          backgroundColor: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
          cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
          textColor: '#ffffff',
        };
      } else if (preset === 'glass_morphism') {
        updatedTheme = {
          ...updatedTheme,
          primaryColor: '#8b5cf6',
          accentColor: '#c084fc',
          backgroundColor: 'linear-gradient(135deg, #180d2c 0%, #2e1065 50%, #0f172a 100%)',
          cardBlur: 'backdrop-blur-xl bg-white/15 border-white/30',
          textColor: '#ffffff',
        };
      } else if (preset === 'emerald_luxury') {
        updatedTheme = {
          ...updatedTheme,
          primaryColor: '#10b981',
          accentColor: '#34d399',
          backgroundColor: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
          cardBlur: 'backdrop-blur-md bg-emerald-950/40 border-emerald-500/30',
          textColor: '#ffffff',
        };
      } else if (preset === 'royal_gold') {
        updatedTheme = {
          ...updatedTheme,
          primaryColor: '#eab308',
          accentColor: '#facc15',
          backgroundColor: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #451a03 100%)',
          cardBlur: 'backdrop-blur-md bg-amber-950/30 border-amber-500/30',
          textColor: '#ffffff',
        };
      } else if (preset === 'minimal_light') {
        updatedTheme = {
          ...updatedTheme,
          primaryColor: '#0284c7',
          accentColor: '#0ea5e9',
          backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          cardBlur: 'backdrop-blur-md bg-white/95 border-slate-200 shadow-sm',
          textColor: '#0f172a',
        };
      }

      return {
        profile: {
          ...state.profile,
          themeConfig: updatedTheme,
        },
        isDirty: true,
      };
    }),

  toggleDirectMode: (enabled, url) =>
    set((state) => ({
      profile: {
        ...state.profile,
        directModeEnabled: enabled !== undefined ? enabled : !state.profile.directModeEnabled,
        directModeUrl: url !== undefined ? url : state.profile.directModeUrl,
      },
      isDirty: true,
    })),

  updateProSettings: (fields) =>
    set((state) => ({
      profile: {
        ...state.profile,
        ...fields,
      },
      isDirty: true,
    })),

  addModule: (moduleType) =>
    set((state) => {
      const defaults = getDefaultModuleConfig(moduleType);
      const newId = `module_${Date.now()}`;
      const newLink: ProfileLinkItem = {
        id: newId,
        title: defaults.title,
        url: defaults.url,
        moduleType,
        isActive: true,
        isPinned: false,
        order: state.profile.links.length,
        clickCount: 0,
        metadata: defaults.metadata,
        advancedSettings: {
          scheduling: {
            enabled: false,
            days: [0, 1, 2, 3, 4, 5, 6],
            startTime: '08:00',
            endTime: '20:00',
          },
          monetization: {
            isLocked: false,
            price: 50,
            currency: 'AFN',
            unlockNote: 'برای مشاهده محتوا یا لینک اختصاصی، پرداخت فرمایید.',
          },
          customStyling: {},
        },
      };

      return {
        profile: {
          ...state.profile,
          links: [newLink, ...state.profile.links],
        },
        isDirty: true,
      };
    }),

  addLink: (newLinkData) =>
    set((state) => {
      const newId = `link_${Date.now()}`;
      const newLink: ProfileLinkItem = {
        id: newId,
        title: newLinkData?.title || 'لینک جدید',
        url: newLinkData?.url || 'https://',
        moduleType: newLinkData?.moduleType || 'standard_link',
        isActive: true,
        isPinned: false,
        order: state.profile.links.length,
        clickCount: 0,
        metadata: {},
        ...newLinkData,
      };

      return {
        profile: {
          ...state.profile,
          links: [newLink, ...state.profile.links],
        },
        isDirty: true,
      };
    }),

  updateLink: (id, updates) =>
    set((state) => ({
      profile: {
        ...state.profile,
        links: state.profile.links.map((link) =>
          link.id === id ? { ...link, ...updates } : link
        ),
      },
      isDirty: true,
    })),

  updateLinkMetadata: (id, metadata) =>
    set((state) => ({
      profile: {
        ...state.profile,
        links: state.profile.links.map((link) =>
          link.id === id
            ? {
              ...link,
              metadata: {
                ...link.metadata,
                ...metadata,
              },
            }
            : link
        ),
      },
      isDirty: true,
    })),

  updateLinkAdvancedSettings: (id, settings) =>
    set((state) => ({
      profile: {
        ...state.profile,
        links: state.profile.links.map((link) =>
          link.id === id
            ? {
              ...link,
              advancedSettings: {
                ...link.advancedSettings,
                ...settings,
                scheduling: {
                  ...link.advancedSettings?.scheduling,
                  ...settings.scheduling,
                },
                monetization: {
                  ...link.advancedSettings?.monetization,
                  ...settings.monetization,
                },
                customStyling: {
                  ...link.advancedSettings?.customStyling,
                  ...settings.customStyling,
                },
              },
            }
            : link
        ),
      },
      isDirty: true,
    })),

  removeLink: (id) =>
    set((state) => ({
      profile: {
        ...state.profile,
        links: state.profile.links.filter((link) => link.id !== id),
      },
      isDirty: true,
    })),

  reorderLinks: (reorderedList) =>
    set((state) => ({
      profile: {
        ...state.profile,
        links: reorderedList.map((item, index) => ({ ...item, order: index })),
      },
      isDirty: true,
    })),

  moveLinkUp: (index) =>
    set((state) => {
      if (index <= 0) return state;
      const newLinks = [...state.profile.links];
      const temp = newLinks[index - 1];
      newLinks[index - 1] = newLinks[index];
      newLinks[index] = temp;
      return {
        profile: {
          ...state.profile,
          links: newLinks.map((item, idx) => ({ ...item, order: idx })),
        },
        isDirty: true,
      };
    }),

  moveLinkDown: (index) =>
    set((state) => {
      if (index >= state.profile.links.length - 1) return state;
      const newLinks = [...state.profile.links];
      const temp = newLinks[index + 1];
      newLinks[index + 1] = newLinks[index];
      newLinks[index] = temp;
      return {
        profile: {
          ...state.profile,
          links: newLinks.map((item, idx) => ({ ...item, order: idx })),
        },
        isDirty: true,
      };
    }),

  // Async API Actions
  fetchProfileData: async (aliasOrId?: string) => {
    set({ isLoading: true, saveError: null });
    try {
      const activeAlias = aliasOrId || get().profile.alias;
      const res = await fetch(`/api/profile?alias=${encodeURIComponent(activeAlias)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        set({ isLoading: false });
        return false;
      }

      const json = await res.json();
      if (json.success && json.data) {
        const dbData = json.data;
        const normalizedProfile: ProfileData = {
          id: dbData.id || dbData._id,
          alias: dbData.alias,
          displayName: dbData.displayName,
          headline: dbData.headline || '',
          bio: dbData.bio || '',
          avatarUrl: dbData.avatarUrl || '',
          coverUrl: dbData.coverUrl || '',
          headerLayout: dbData.headerLayout || 'curve',
          phone: dbData.phone || '',
          whatsapp: dbData.whatsapp || '',
          email: dbData.email || '',
          location: dbData.location || '',
          directModeEnabled: !!dbData.directModeEnabled,
          directModeUrl: dbData.directModeUrl || '',
          themeConfig: dbData.themeConfig || defaultTheme,
          links: Array.isArray(dbData.links) ? dbData.links : [],
          seoTitle: dbData.seoTitle || '',
          seoDescription: dbData.seoDescription || '',
          hideBranding: !!dbData.hideBranding,
          selectedTemplateId: dbData.selectedTemplateId || '',
          profileType: dbData.profileType || 'personal',
          isVerified: !!dbData.isVerified,
          verificationStatus: dbData.verificationStatus || 'unverified',
          verificationData: dbData.verificationData || {},
          profileLanguage: dbData.profileLanguage || 'dari',
        };

        const activeId = normalizedProfile.id;
        set((state) => ({
          profile: normalizedProfile,
          activeProfileId: activeId,
          profilesCache: {
            ...state.profilesCache,
            [activeId]: normalizedProfile,
          },
          profilesList: state.profilesList.map((p) =>
            p.id === activeId || p.alias === normalizedProfile.alias
              ? { ...p, id: activeId, displayName: normalizedProfile.displayName, alias: normalizedProfile.alias }
              : p
          ),
          isDirty: false,
          isLoading: false,
          saveError: null,
        }));
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (err: any) {
      console.error('fetchProfileData error:', err);
      set({ isLoading: false, saveError: err?.message || 'خطا در برقراری ارتباط' });
      return false;
    }
  },

  saveProfileData: async () => {
    set({ isSaving: true, saveError: null });
    const currentProfile = get().profile;

    try {
      // 1. Save base profile and settings via /api/profile
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProfile),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg = result.message || 'خطا در ذخیره‌سازی پروفایل در سرور.';
        set({ isSaving: false, saveError: errorMsg });
        return { success: false, message: errorMsg };
      }

      const savedData = result.data;
      const updatedId = savedData.id || savedData._id || currentProfile.id;

      // 2. Also ensure /api/profile/modules is synced
      try {
        await fetch('/api/profile/modules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: updatedId,
            alias: savedData.alias,
            modules: currentProfile.links,
          }),
        });
      } catch (modulesErr) {
        console.warn('Modules secondary sync warning:', modulesErr);
      }

      const updatedProfile: ProfileData = {
        ...currentProfile,
        id: updatedId,
        alias: savedData.alias || currentProfile.alias,
      };

      set((state) => ({
        profile: updatedProfile,
        activeProfileId: updatedId,
        profilesCache: {
          ...state.profilesCache,
          [updatedId]: updatedProfile,
        },
        profilesList: state.profilesList.map((p) =>
          p.id === state.activeProfileId || p.alias === updatedProfile.alias
            ? { ...p, id: updatedId, displayName: updatedProfile.displayName, alias: updatedProfile.alias }
            : p
        ),
        isDirty: false,
        isSaving: false,
        lastSavedAt: new Date(),
        saveError: null,
      }));

      return {
        success: true,
        message: result.message || 'تغییرات پروفایل با موفقیت منتشر و در پایگاه داده ذخیره شد.',
        data: updatedProfile,
      };
    } catch (err: any) {
      console.error('saveProfileData error:', err);
      const errMsg = err?.message || 'خطای شبکه در برقراری ارتباط با سرور.';
      set({ isSaving: false, saveError: errMsg });
      return { success: false, message: errMsg };
    }
  },

  // KYC Verification Actions
  setProfileType: (type: ProfileType) =>
    set((state) => ({
      profile: { ...state.profile, profileType: type },
      isDirty: true,
    })),

  updateVerificationData: (data: Partial<VerificationData>) =>
    set((state) => ({
      profile: {
        ...state.profile,
        verificationData: {
          ...state.profile.verificationData,
          ...data,
        },
      },
      isDirty: true,
    })),

  submitVerification: async () => {
    const { profile } = get();
    const ver = profile.verificationData || {};
    const updatedVer: VerificationData = {
      ...ver,
      submittedAt: new Date().toISOString(),
    };
    set((state) => ({
      profile: {
        ...state.profile,
        verificationStatus: 'pending',
        verificationData: updatedVer,
      },
      isDirty: true,
    }));
    await get().saveProfileData();
    return true;
  },

  toggleVerifiedBadge: (isVerified?: boolean) =>
    set((state) => {
      const nextVal = isVerified !== undefined ? isVerified : !state.profile.isVerified;
      return {
        profile: {
          ...state.profile,
          isVerified: nextVal,
          verificationStatus: nextVal ? 'verified' : 'unverified',
        },
        isDirty: true,
      };
    }),

  // Profile Language Action
  setProfileLanguage: (lang: ProfileLanguage) =>
    set((state) => ({
      profile: { ...state.profile, profileLanguage: lang },
      isDirty: true,
    })),

  setDevice: (device) => set({ selectedDeviceId: device }),
  setIsSaving: (isSaving) => set({ isSaving }),
  resetState: (initialData) =>
    set({
      profile: initialData || emptyProfile,
      isDirty: false,
      isSaving: false,
    }),
}));
