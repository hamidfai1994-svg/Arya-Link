'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Save,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  HelpCircle,
  Smartphone,
  Sliders,
  Building2,
  Share2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  Zap,
  Home,
  Layout,
  BookOpen,
  FileText,
  Globe,
  Settings,
  ShieldCheck,
  Users,
  BarChart3,
  Search,
  Award,
  Bot,
  CreditCard,
  Cloud,
  HardDrive,
  Key,
  Lock,
  Eye,
  EyeOff,
  BellRing,
  Send,
  MessageCircle,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Tag as PricingTagIcon,
  Layers as FeaturesLayersIcon,
  Scale as LegalScaleIcon,
  PhoneCall as ContactPhoneIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FileUploader } from '@/components/ui/file-uploader';
import { MultilingualInput } from '@/components/admin/MultilingualInput';
import { MultilingualTextarea } from '@/components/admin/MultilingualTextarea';
import { AiFieldRefineButton } from '@/components/admin/MultilingualFieldShell';
import { CollapsibleSection } from '@/components/admin/CollapsibleSection';
import { SortableList, SortableItem, DragHandle } from '@/components/admin/SortableContainer';
import { useBranding } from '@/lib/branding/BrandingContext';
import { SiteLogo } from '@/components/SiteLogo';
import { TelegramConnectCard } from '@/components/common/TelegramConnectCard';
import { toast } from 'sonner';
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_PRICING_CONTENT,
  DEFAULT_FEATURES_CONTENT,
  DEFAULT_HOW_IT_WORKS_CONTENT,
  DEFAULT_FINAL_CTA_CONTENT,
  DEFAULT_LEGAL_CONTENT,
  DEFAULT_CONTACT_US_CONTENT,
  ITrilingualString,
  ISiteContentHero,
  ISiteContentNfcConcept,
  ISiteContentSlider,
  ISiteContentAboutUs,
  ISiteContentTeamMember,
  ISiteContentPartner,
  ISiteContentBlogCms,
  ISiteContentSeo,
  ISiteContentPricing,
  ISiteContentFeatures,
  ISiteContentHowItWorks,
  ISiteContentFinalCta,
  ISiteContentLegal,
  ISiteContentContactUs,
  ISiteContentFaq,
  ISiteContentFooter,
} from '@/models/SiteContent.model';

// Category types for the sticky inner sidebar (4 standard categories)
type SystemCategory = 'landing' | 'pages' | 'branding_seo' | 'infra_api';

// Sub-tabs for each category
type LandingSubTab = 'hero' | 'sliders' | 'nfcConcept' | 'stats' | 'trustedBy' | 'pricing_plans' | 'features_steps';
type PagesSubTab = 'aboutUs' | 'faq' | 'blog' | 'legal_terms' | 'contact_info';
type BrandingSeoSubTab = 'general_info' | 'social_networks' | 'footer_legal' | 'seo_metadata';
type InfraApiSubTab = 'ai_keys' | 'cloud_upload' | 'security_captcha' | 'payment_gateways' | 'telegram_bots';

interface ISystemSettingsState {
  telegramSupportChatId: string;
  telegramInsightsChatId: string;
  telegramBotsActive: boolean;
  notifyNewUsers: boolean;
  notifyOrders: boolean;
  notifySupportTickets: boolean;
  notifySystemAlerts: boolean;
  platformMainLogo: string;
  platformFavicon: string;
  aiSettings: {
    groqApiKey: string;
    groqModelName: string;
    cloudflareAccountId: string;
    cloudflareApiToken: string;
    cloudflareModelName: string;
    isFallbackActive: boolean;
  };
  cloudStorageSettings: {
    cloudinaryCloudName: string;
    cloudinaryApiKey: string;
    cloudinaryApiSecret: string;
    imageKitPublicKey: string;
    imageKitPrivateKey: string;
    imageKitUrlEndpoint: string;
    primaryStorage: 'cloudinary' | 'imagekit' | 'local';
  };
  securitySettings: {
    turnstileSiteKey: string;
    turnstileSecretKey: string;
    captchaEnabled: boolean;
    ipRateLimitingEnabled: boolean;
  };
  paymentSettings: {
    hesabPayMerchantId: string;
    hesabPayApiKey: string;
    hesabPayApiSecret: string;
    hesabPayEndpoint: string;
    hesabPaySandbox: boolean;
    hesabPayActive: boolean;
  };
}

const DEFAULT_SYSTEM_SETTINGS: ISystemSettingsState = {
  telegramSupportChatId: '',
  telegramInsightsChatId: '',
  telegramBotsActive: false,
  notifyNewUsers: true,
  notifyOrders: true,
  notifySupportTickets: true,
  notifySystemAlerts: false,
  platformMainLogo: '',
  platformFavicon: '',
  aiSettings: {
    groqApiKey: '',
    groqModelName: 'llama-3.3-70b-versatile',
    cloudflareAccountId: '',
    cloudflareApiToken: '',
    cloudflareModelName: '@cf/meta/llama-3-8b-instruct',
    isFallbackActive: true,
  },
  cloudStorageSettings: {
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    imageKitPublicKey: '',
    imageKitPrivateKey: '',
    imageKitUrlEndpoint: '',
    primaryStorage: 'local',
  },
  securitySettings: {
    turnstileSiteKey: '',
    turnstileSecretKey: '',
    captchaEnabled: false,
    ipRateLimitingEnabled: true,
  },
  paymentSettings: {
    hesabPayMerchantId: '',
    hesabPayApiKey: '',
    hesabPayApiSecret: '',
    hesabPayEndpoint: 'https://api.hesabpay.af/v1',
    hesabPaySandbox: true,
    hesabPayActive: false,
  },
};

function toTrilingual(val: any): ITrilingualString {
  if (!val) return { fa: '', en: '', ps: '' };
  if (typeof val === 'string') return { fa: val, en: val, ps: val };
  return {
    fa: val.fa || val.da || '',
    en: val.en || '',
    ps: val.ps || '',
  };
}

export default function AdminSystemControlPage() {
  const { settings: brandingContext, refreshSettings: refreshBranding, updateSettings: updateBrandingSettings } = useBranding();

  // Navigation State
  const [activeCategory, setActiveCategory] = useState<SystemCategory>('landing');
  const [landingTab, setLandingTab] = useState<LandingSubTab>('hero');
  const [pagesTab, setPagesTab] = useState<PagesSubTab>('aboutUs');
  const [brandingSeoTab, setBrandingSeoTab] = useState<BrandingSeoSubTab>('general_info');
  const [infraApiTab, setInfraApiTab] = useState<InfraApiSubTab>('ai_keys');

  // Loading, Translating & Action State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [translatingSection, setTranslatingSection] = useState<string | null>(null);
  const [showSecretKeys, setShowSecretKeys] = useState<{ [key: string]: boolean }>({});

  // CMS Content State
  const [hero, setHero] = useState<ISiteContentHero>(DEFAULT_SITE_CONTENT.hero);
  const [nfcConcept, setNfcConcept] = useState<ISiteContentNfcConcept>(DEFAULT_SITE_CONTENT.nfcConcept);
  const [sliders, setSliders] = useState<ISiteContentSlider[]>(DEFAULT_SITE_CONTENT.sliders);
  const [aboutUs, setAboutUs] = useState<ISiteContentAboutUs>(DEFAULT_SITE_CONTENT.aboutUs);
  const [team, setTeam] = useState<ISiteContentTeamMember[]>(DEFAULT_SITE_CONTENT.team || []);
  const [partners, setPartners] = useState<ISiteContentPartner[]>(DEFAULT_SITE_CONTENT.partners || []);
  const [blogCms, setBlogCms] = useState<ISiteContentBlogCms>(DEFAULT_SITE_CONTENT.blogCms || ({} as any));
  const [seo, setSeo] = useState<ISiteContentSeo>(DEFAULT_SITE_CONTENT.seo || ({} as any));
  const [pricing, setPricing] = useState<ISiteContentPricing>(DEFAULT_PRICING_CONTENT);
  const [features, setFeatures] = useState<ISiteContentFeatures>(DEFAULT_FEATURES_CONTENT);
  const [howItWorks, setHowItWorks] = useState<ISiteContentHowItWorks>(DEFAULT_HOW_IT_WORKS_CONTENT);
  const [finalCta, setFinalCta] = useState<ISiteContentFinalCta>(DEFAULT_FINAL_CTA_CONTENT);
  const [legal, setLegal] = useState<ISiteContentLegal>(DEFAULT_LEGAL_CONTENT);
  const [contactUs, setContactUs] = useState<ISiteContentContactUs>(DEFAULT_CONTACT_US_CONTENT);
  const [faq, setFaq] = useState<ISiteContentFaq[]>(DEFAULT_SITE_CONTENT.faq);
  const [footer, setFooter] = useState<ISiteContentFooter>(DEFAULT_SITE_CONTENT.footer);

  // Platform & Infrastructure State
  const [systemSettings, setSystemSettings] = useState<ISystemSettingsState>(DEFAULT_SYSTEM_SETTINGS);
  const [siteName, setSiteName] = useState('Arya Link');
  const [siteDescription, setSiteDescription] = useState('پیشرفته‌ترین پلتفرم هویت دیجیتال و کارت لمسی NFC در افغانستان');

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (brandingContext) {
      if (brandingContext.siteName) setSiteName(brandingContext.siteName);
      if (brandingContext.siteDescription) setSiteDescription(brandingContext.siteDescription);
      if (brandingContext.platformMainLogo || brandingContext.companyLogo) {
        setSystemSettings((prev) => ({
          ...prev,
          platformMainLogo: brandingContext.platformMainLogo || brandingContext.companyLogo || '',
        }));
      }
      if (brandingContext.platformFavicon || brandingContext.favicon) {
        setSystemSettings((prev) => ({
          ...prev,
          platformFavicon: brandingContext.platformFavicon || brandingContext.favicon || '',
        }));
      }
    }
  }, [brandingContext]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [cmsRes, systemRes] = await Promise.all([
        fetch('/api/cms/content', { cache: 'no-store' }),
        fetch('/api/admin/settings/system', { cache: 'no-store' }),
      ]);

      const cmsJson = await cmsRes.json();
      if (cmsJson.success && cmsJson.data) {
        if (cmsJson.data.hero) setHero(cmsJson.data.hero);
        if (cmsJson.data.nfcConcept) setNfcConcept(cmsJson.data.nfcConcept);
        if (Array.isArray(cmsJson.data.sliders)) setSliders(cmsJson.data.sliders);
        if (cmsJson.data.aboutUs) setAboutUs(cmsJson.data.aboutUs);
        if (Array.isArray(cmsJson.data.team)) setTeam(cmsJson.data.team);
        if (Array.isArray(cmsJson.data.partners)) setPartners(cmsJson.data.partners);
        if (cmsJson.data.blogCms) setBlogCms(cmsJson.data.blogCms);
        if (cmsJson.data.seo) setSeo(cmsJson.data.seo);
        if (cmsJson.data.pricing) setPricing(cmsJson.data.pricing);
        if (cmsJson.data.features) setFeatures(cmsJson.data.features);
        if (cmsJson.data.howItWorks) setHowItWorks(cmsJson.data.howItWorks);
        if (cmsJson.data.finalCta) setFinalCta(cmsJson.data.finalCta);
        if (cmsJson.data.legal) setLegal(cmsJson.data.legal);
        if (cmsJson.data.contactUs) setContactUs(cmsJson.data.contactUs);
        if (Array.isArray(cmsJson.data.faq)) setFaq(cmsJson.data.faq);
        if (cmsJson.data.footer) setFooter(cmsJson.data.footer);
      }

      const systemJson = await systemRes.json();
      if (systemJson.success && systemJson.data) {
        setSystemSettings({
          telegramSupportChatId: systemJson.data.telegramSupportChatId || '',
          telegramInsightsChatId: systemJson.data.telegramInsightsChatId || '',
          telegramBotsActive: Boolean(systemJson.data.telegramBotsActive),
          notifyNewUsers: systemJson.data.notifyNewUsers ?? true,
          notifyOrders: systemJson.data.notifyOrders ?? true,
          notifySupportTickets: systemJson.data.notifySupportTickets ?? true,
          notifySystemAlerts: systemJson.data.notifySystemAlerts ?? false,
          platformMainLogo: systemJson.data.platformMainLogo || '',
          platformFavicon: systemJson.data.platformFavicon || '',
          aiSettings: {
            groqApiKey: systemJson.data.aiSettings?.groqApiKey || '',
            groqModelName: systemJson.data.aiSettings?.groqModelName || 'llama-3.3-70b-versatile',
            cloudflareAccountId: systemJson.data.aiSettings?.cloudflareAccountId || '',
            cloudflareApiToken: systemJson.data.aiSettings?.cloudflareApiToken || '',
            cloudflareModelName: systemJson.data.aiSettings?.cloudflareModelName || '@cf/meta/llama-3-8b-instruct',
            isFallbackActive: systemJson.data.aiSettings?.isFallbackActive ?? true,
          },
          cloudStorageSettings: {
            cloudinaryCloudName: systemJson.data.cloudStorageSettings?.cloudinaryCloudName || '',
            cloudinaryApiKey: systemJson.data.cloudStorageSettings?.cloudinaryApiKey || '',
            cloudinaryApiSecret: systemJson.data.cloudStorageSettings?.cloudinaryApiSecret || '',
            imageKitPublicKey: systemJson.data.cloudStorageSettings?.imageKitPublicKey || '',
            imageKitPrivateKey: systemJson.data.cloudStorageSettings?.imageKitPrivateKey || '',
            imageKitUrlEndpoint: systemJson.data.cloudStorageSettings?.imageKitUrlEndpoint || '',
            primaryStorage: systemJson.data.cloudStorageSettings?.primaryStorage || 'local',
          },
          securitySettings: {
            turnstileSiteKey: systemJson.data.securitySettings?.turnstileSiteKey || '',
            turnstileSecretKey: systemJson.data.securitySettings?.turnstileSecretKey || '',
            captchaEnabled: Boolean(systemJson.data.securitySettings?.captchaEnabled),
            ipRateLimitingEnabled: systemJson.data.securitySettings?.ipRateLimitingEnabled ?? true,
          },
          paymentSettings: {
            hesabPayMerchantId: systemJson.data.paymentSettings?.hesabPayMerchantId || '',
            hesabPayApiKey: systemJson.data.paymentSettings?.hesabPayApiKey || '',
            hesabPayApiSecret: systemJson.data.paymentSettings?.hesabPayApiSecret || '',
            hesabPayEndpoint: systemJson.data.paymentSettings?.hesabPayEndpoint || 'https://api.hesabpay.af/v1',
            hesabPaySandbox: systemJson.data.paymentSettings?.hesabPaySandbox ?? true,
            hesabPayActive: Boolean(systemJson.data.paymentSettings?.hesabPayActive),
          },
        });
      }
    } catch (err) {
      console.error('Error fetching system & CMS content:', err);
      toast.error('خطا در بارگذاری معلومات مرکز کنترل سیستم.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const toastId = toast.loading('در حال ذخیره‌سازی تنظیمات مرکز کنترل...');
    try {
      const cmsPayload = {
        hero,
        nfcConcept,
        sliders,
        aboutUs,
        team,
        partners,
        blogCms,
        seo,
        pricing,
        features,
        howItWorks,
        finalCta,
        legal,
        contactUs,
        faq,
        footer,
      };

      const systemPayload = {
        ...systemSettings,
        platformMainLogo: systemSettings.platformMainLogo.trim(),
        platformFavicon: systemSettings.platformFavicon.trim(),
      };

      const [cmsRes, systemRes] = await Promise.all([
        fetch('/api/cms/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cmsPayload),
        }),
        fetch('/api/admin/settings/system', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(systemPayload),
        }),
      ]);

      const cmsJson = await cmsRes.json();
      const systemJson = await systemRes.json();

      // Also sync branding context
      await updateBrandingSettings({
        platformMainLogo: systemSettings.platformMainLogo.trim(),
        platformFavicon: systemSettings.platformFavicon.trim(),
        companyLogo: systemSettings.platformMainLogo.trim(),
        favicon: systemSettings.platformFavicon.trim(),
        siteName: siteName.trim(),
        siteDescription: siteDescription.trim(),
      });
      await refreshBranding();

      if (cmsJson.success && systemJson.success) {
        toast.success('تمامی تنظیمات محتوا، برندینگ و زیرساخت با موفقیت ثبت گردید.', { id: toastId });
      } else {
        toast.warning('برخی از اطلاعات با اخطار ذخیره شدند.', {
          description: cmsJson.message || systemJson.message,
          id: toastId,
        });
      }
    } catch (err) {
      console.error('Save error in system control:', err);
      toast.error('خطای شبکه در هنگام ذخیره‌سازی معلومات.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Section-Level Batch AI Translation helper
   * Translates all Dari (`fa`) text fields in a section to English (`en`) and Pashto (`ps`) in ONE click.
   */
  const handleBatchTranslate = async (
    sectionId: string,
    fields: Record<string, string>,
    onSuccess: (enMap: Record<string, string>, psMap: Record<string, string>) => void
  ) => {
    const hasText = Object.values(fields).some((t) => t && t.trim());
    if (!hasText) {
      toast.error('هیچ متن دری در این بخش برای ترجمه درج نشده است.');
      return;
    }
    setTranslatingSection(sectionId);
    const toastId = toast.loading('در حال ترجمه خودکار تمام فیلدهای این بخش به انگلیسی و پشتو...');
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields,
          sourceLang: 'da',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'خطا در ترجمه هوشمند بخش.', { id: toastId });
        return;
      }
      onSuccess(data.en || {}, data.ps || {});
      toast.success('ترجمه خودکار کلیه فیلدهای این بخش به انگلیسی و پشتو تکمیل شد!', { id: toastId });
    } catch {
      toast.error('ارتباط با سرور ترجمه برقرار نشد.', { id: toastId });
    } finally {
      setTranslatingSection(null);
    }
  };

  const toggleSecret = (field: string) => {
    setShowSecretKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Sliders Handlers
  const handleAddSlider = () => {
    const newSlide: ISiteContentSlider = {
      id: `slider-${Date.now()}`,
      imageUrl: '',
      badge: { fa: 'اسلایدر جدید', en: 'New Slide', ps: 'نوی سلایډر' },
      title: { fa: 'عنوان اسلاید نو', en: 'Slide Title', ps: 'د سلایډ عنوان' },
      subtitle: { fa: 'توضیحات اسلاید را اینجا بنویسید...', en: 'Slide description...', ps: 'د سلایډ توضیحات...' },
      buttonText: { fa: 'مشاهده خدمات', en: 'Learn More', ps: 'نور معلومات' },
      buttonLink: '/services',
      order: sliders.length + 1,
      isActive: true,
    };
    setSliders([...sliders, newSlide]);
  };

  const handleRemoveSlider = (id: string) => {
    setSliders(sliders.filter((s) => s.id !== id));
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    const newFaqItem: ISiteContentFaq = {
      id: `faq-${Date.now()}`,
      question: {
        fa: 'پرسش جدید شما؟',
        en: 'Your new question here?',
        ps: 'ستاسو نوې پوښتنه دلته؟',
      },
      answer: {
        fa: 'پاسخ کامل پرسش را در این قسمت درج فرمایید...',
        en: 'Write the complete answer here...',
        ps: 'د پوښتنې بشپړ ځواب دلته ولیکئ...',
      },
      order: faq.length + 1,
      isActive: true,
    };
    setFaq([...faq, newFaqItem]);
  };

  const handleRemoveFaq = (id: string) => {
    setFaq(faq.filter((f) => f.id !== id));
  };

  // Team Handlers
  const handleAddTeamMember = () => {
    const newMember: ISiteContentTeamMember = {
      id: `team-${Date.now()}`,
      name: { fa: 'نام عضو تیم', en: 'New Member', ps: 'د ټیم نوی غړی' },
      role: { fa: 'سمت سازمانی', en: 'Role / Position', ps: 'دندې عنوان' },
      bio: { fa: 'شرح تخصص و تجارب کاری...', en: 'Bio description...', ps: 'لنډه پېژندنه...' },
      avatarUrl: '',
      order: team.length + 1,
    };
    setTeam([...team, newMember]);
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeam(team.filter((m) => m.id !== id));
  };

  // Partners Handlers
  const handleAddPartner = () => {
    const newPartner: ISiteContentPartner = {
      id: `partner-${Date.now()}`,
      name: { fa: 'نام سازمان یا شریک تجاری', en: 'Partner Name', ps: 'د شریک نوم' },
      badge: { fa: 'شریک رسمی', en: 'Official Partner', ps: 'رسمي ملګری' },
      logoUrl: '',
      order: partners.length + 1,
    };
    setPartners([...partners, newPartner]);
  };

  const handleRemovePartner = (id: string) => {
    setPartners(partners.filter((p) => p.id !== id));
  };

  // Stats Handlers
  const handleAddStat = () => {
    const currentStats = aboutUs.stats || [];
    const newStat = {
      id: `stat-${Date.now()}`,
      value: { fa: '+1,000', en: '+1,000', ps: '+۱،۰۰۰' },
      label: { fa: 'کاربران فعال', en: 'Active Users', ps: 'فعال کاروونکي' },
    };
    setAboutUs({
      ...aboutUs,
      stats: [...currentStats, newStat as any],
    });
  };

  const handleRemoveStat = (index: number) => {
    const currentStats = [...(aboutUs.stats || [])];
    currentStats.splice(index, 1);
    setAboutUs({ ...aboutUs, stats: currentStats });
  };

  // Quick Links Handlers
  const handleAddQuickLink = () => {
    const currentLinks = footer.quickLinks || [];
    setFooter({
      ...footer,
      quickLinks: [
        ...currentLinks,
        {
          id: `link-${Date.now()}`,
          label: { fa: 'پیوند جدید', en: 'New Link', ps: 'نوی لینک' },
          url: '/',
        } as any,
      ],
    });
  };

  const handleRemoveQuickLink = (index: number) => {
    const currentLinks = [...(footer.quickLinks || [])];
    currentLinks.splice(index, 1);
    setFooter({ ...footer, quickLinks: currentLinks });
  };

  // Sidebar Categories Navigation Definitions
  const sidebarCategories = [
    {
      id: 'landing' as SystemCategory,
      title: 'محتوای لندینگ پیج',
      subtitle: 'هیرو، اسلایدرها، کارت هوشمند، آمار و همکاران',
      icon: Layout,
      badge: '۵ فرم کشویی',
    },
    {
      id: 'pages' as SystemCategory,
      title: 'محتوای صفحات',
      subtitle: 'درباره ما، سوالات متداول (FAQ) و وبلاگ',
      icon: BookOpen,
      badge: '۳ فرم کشویی',
    },
    {
      id: 'branding_seo' as SystemCategory,
      title: 'برندینگ و سئو',
      subtitle: 'لوگو، ارتباطات، فوتر حقوقی و متادیتا',
      icon: Palette,
      badge: '۴ فرم کشویی',
    },
    {
      id: 'infra_api' as SystemCategory,
      title: 'زیرساخت و APIها',
      subtitle: 'هوش مصنوعی، فضای ابری، کپچا و درگاه پرداخت',
      icon: SlidersHorizontal,
      badge: '۵ فرم کشویی',
    },
  ];

  // Helper arrays for Drag & Drop with stable IDs
  const statsSortable = (aboutUs.stats || []).map((s: any, idx) => ({
    ...s,
    id: s.id || `stat-${idx}`,
  }));

  const quickLinksSortable = (footer.quickLinks || []).map((l: any, idx) => ({
    ...l,
    id: l.id || `qlink-${idx}`,
  }));

  return (
    <div className="space-y-6 pb-24 select-none font-sans" dir="rtl">
      {/* ========================================================
          TOP HEADER CARD (System Overview & Quick Actions)
      ======================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" className="font-sans text-[11px]">
              مرکز کنترل یکپارچه • Unified System Control v4.0
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              [Accordion UX • Batch AI Translate • Drag & Drop]
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            مرکز کنترل سیستم و مدیریت یکپارچه پلتفرم
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            مدیریت کشویی محتوای لندینگ، سئو، زیرساخت، ترجمه خودکار متمرکز بخش‌ها، اصلاح فیلدها با AI و جابجایی ترتیبی با کشیدن و رها کردن (Drag & Drop).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-11 px-4 rounded-2xl border-border bg-card text-xs flex items-center gap-1.5 hover:bg-muted"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-500" />
              <span>پیش‌نمایش لندینگ</span>
            </Button>
          </Link>

          <Button
            onClick={fetchAllData}
            variant="outline"
            size="sm"
            disabled={isLoading || isSaving}
            className="h-11 px-4 rounded-2xl border-border bg-card text-xs flex items-center gap-1.5 hover:bg-muted"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
            <span>بازخوانی</span>
          </Button>

          <Button
            onClick={handleSaveAll}
            disabled={isSaving || isLoading}
            className="h-11 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>در حال ثبت...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ذخیره کلیه تغییرات</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ========================================================
          TWO-COLUMN WORKSPACE: STICKY INNER SIDEBAR + FORMS
      ======================================================== */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* --------------------------------------------------------
            STICKY INNER SIDEBAR (Secondary Sidebar)
        -------------------------------------------------------- */}
        <aside className="w-full lg:w-80 shrink-0 rounded-3xl bg-card border border-border p-3 space-y-2 shadow-sm sticky top-0 h-screen overflow-y-auto border-l border-border">
          <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 mb-2 flex items-center justify-between">
            <span>بخش‌های مرکز کنترل</span>
            <Badge variant="outline" className="text-[10px]">
              ۴ دسته اصلی
            </Badge>
          </div>

          {sidebarCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-right transition-all cursor-pointer ${isActive
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-muted text-cyan-500'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{cat.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {cat.badge}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-slate-900/80 font-medium' : 'text-muted-foreground'
                      }`}
                  >
                    {cat.subtitle}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="pt-4 border-t border-border/60 mt-4 px-2 space-y-2 text-[11px] text-muted-foreground leading-relaxed">
            <div>💡 تمامی فرم‌ها به صورت کشویی (Accordion) و در حالت پیش‌فرض بسته هستند. روی هر بخش کلیک فرمایید تا باز شود.</div>
            <div>✨ دکمه «ترجمه خودکار» در بالای هر بخش، تمام فیلدها را یکجا ترجمه می‌کند.</div>
          </div>
        </aside>

        {/* --------------------------------------------------------
            MAIN WORK AREA (Sticky Tabs + Form Panels)
        -------------------------------------------------------- */}
        <main className="flex-1 min-w-0 w-full space-y-6">

          {/* ========================================================
              CATEGORY 1: محتوای لندینگ پیج (Landing Page Content)
          ======================================================== */}
          {activeCategory === 'landing' && (
            <>
              {/* Sticky Tabs List */}
              <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border pb-2 pt-4 flex flex-wrap gap-1.5 p-1.5 rounded-2xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setLandingTab('hero')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${landingTab === 'hero'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>هیرو سکشن (Hero)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLandingTab('sliders')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${landingTab === 'sliders'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>اسلایدرهای متحرک</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLandingTab('nfcConcept')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${landingTab === 'nfcConcept'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>کارت ویزیت هوشمند (NFC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLandingTab('stats')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${landingTab === 'stats'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>آمار و ارقام انیمیشنی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLandingTab('trustedBy')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${landingTab === 'trustedBy'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>لوگوی شرکا و همکاران</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLandingTab('pricing_plans')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${landingTab === 'pricing_plans'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <PricingTagIcon className="w-3.5 h-3.5" />
                  <span>پلن‌های قیمت‌گذاری و CTA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLandingTab('features_steps')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${landingTab === 'features_steps'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <FeaturesLayersIcon className="w-3.5 h-3.5" />
                  <span>امکانات و گام‌های شروع</span>
                </button>
              </div>

              {/* Form Container with pt-4 scroll-mt-20 */}
              <div className="pt-4 scroll-mt-20 space-y-6">
                {/* 1.1 HERO SECTION TAB (Accordion Form - Default Closed) */}
                {landingTab === 'hero' && (
                  <CollapsibleSection
                    title="بخش هیرو لندینگ‌پیج (Hero Section)"
                    subtitle="تیتر اول، کلمات هایلایت، توضیحات، نشان اعتماد و دکمه‌های اقدام به صورت سه‌زبانه"
                    icon={Sparkles}
                    badge="هیرو سکشن"
                    defaultOpen={false}
                    isTranslating={translatingSection === 'hero'}
                    onBatchTranslate={() =>
                      handleBatchTranslate(
                        'hero',
                        {
                          badge: hero.badge.fa,
                          titlePart1: hero.titlePart1.fa,
                          titleHighlight: hero.titleHighlight.fa,
                          titlePart2: hero.titlePart2.fa,
                          subtitle: hero.subtitle.fa,
                          primaryCta: hero.primaryCta.fa,
                          secondaryCta: hero.secondaryCta.fa,
                        },
                        (en, ps) => {
                          setHero((prev) => ({
                            ...prev,
                            badge: { ...prev.badge, en: en.badge || prev.badge.en, ps: ps.badge || prev.badge.ps },
                            titlePart1: { ...prev.titlePart1, en: en.titlePart1 || prev.titlePart1.en, ps: ps.titlePart1 || prev.titlePart1.ps },
                            titleHighlight: { ...prev.titleHighlight, en: en.titleHighlight || prev.titleHighlight.en, ps: ps.titleHighlight || prev.titleHighlight.ps },
                            titlePart2: { ...prev.titlePart2, en: en.titlePart2 || prev.titlePart2.en, ps: ps.titlePart2 || prev.titlePart2.ps },
                            subtitle: { ...prev.subtitle, en: en.subtitle || prev.subtitle.en, ps: ps.subtitle || prev.subtitle.ps },
                            primaryCta: { ...prev.primaryCta, en: en.primaryCta || prev.primaryCta.en, ps: ps.primaryCta || prev.primaryCta.ps },
                            secondaryCta: { ...prev.secondaryCta, en: en.secondaryCta || prev.secondaryCta.en, ps: ps.secondaryCta || prev.secondaryCta.ps },
                          }));
                        }
                      )
                    }
                  >
                    <div className="space-y-4">
                      <MultilingualInput
                        label="نشانگر برتر (Top Badge)"
                        value={hero.badge}
                        onChange={(val) => setHero({ ...hero, badge: toTrilingual(val) })}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MultilingualInput
                          label="عنوان (بخش ۱)"
                          value={hero.titlePart1}
                          onChange={(val) => setHero({ ...hero, titlePart1: toTrilingual(val) })}
                        />
                        <MultilingualInput
                          label="کلمه هایلایت (گرادیانت رنگی)"
                          value={hero.titleHighlight}
                          onChange={(val) => setHero({ ...hero, titleHighlight: toTrilingual(val) })}
                        />
                        <MultilingualInput
                          label="عنوان (بخش ۲)"
                          value={hero.titlePart2}
                          onChange={(val) => setHero({ ...hero, titlePart2: toTrilingual(val) })}
                        />
                      </div>

                      <MultilingualTextarea
                        label="توضیحات تکمیلی زیر عنوان"
                        value={hero.subtitle}
                        onChange={(val) => setHero({ ...hero, subtitle: toTrilingual(val) })}
                        rows={3}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 p-4 rounded-2xl bg-muted/40 border border-border">
                          <MultilingualInput
                            label="متن دکمه اصلی (Primary CTA)"
                            value={hero.primaryCta}
                            onChange={(val) => setHero({ ...hero, primaryCta: toTrilingual(val) })}
                          />
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">
                              لینک دکمه اصلی (URL)
                            </label>
                            <Input
                              value={hero.primaryCtaLink || '/auth/register'}
                              onChange={(e) => setHero({ ...hero, primaryCtaLink: e.target.value })}
                              placeholder="/auth/register"
                              className="rounded-xl font-mono text-xs"
                              dir="ltr"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 p-4 rounded-2xl bg-muted/40 border border-border">
                          <MultilingualInput
                            label="متن دکمه دوم (Secondary CTA)"
                            value={hero.secondaryCta}
                            onChange={(val) => setHero({ ...hero, secondaryCta: toTrilingual(val) })}
                          />
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">
                              لینک دکمه دوم (URL)
                            </label>
                            <Input
                              value={hero.secondaryCtaLink || '#demo'}
                              onChange={(e) => setHero({ ...hero, secondaryCtaLink: e.target.value })}
                              placeholder="#demo"
                              className="rounded-xl font-mono text-xs"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            نوع رسانه نمایشی (Media Type)
                          </label>
                          <select
                            value={hero.mediaType}
                            onChange={(e: any) => setHero({ ...hero, mediaType: e.target.value })}
                            className="w-full h-11 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="phone_mockup">شبیه‌ساز سه‌بعدی گوشی و کارت لمسی</option>
                            <option value="image">تصویر بنر هیرو</option>
                            <option value="video">ویدیو تیزر معرفی</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            آدرس یا آپلود فایل مدیا
                          </label>
                          <FileUploader
                            value={hero.mediaUrl || ''}
                            onChange={(url) => setHero({ ...hero, mediaUrl: url })}
                            folder="covers"
                          />
                        </div>
                      </div>

                      {/* Trust Badges */}
                      <div className="space-y-3 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            نشان‌های اعتماد (Trust Badges زیر دکمه‌ها)
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const current = hero.trustBadges || [];
                              setHero({
                                ...hero,
                                trustBadges: [
                                  ...current,
                                  { fa: 'نشان اعتماد نو', en: 'New Trust Badge', ps: 'د باور نوی نښان' },
                                ],
                              });
                            }}
                            className="h-8 text-xs rounded-xl"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1 text-cyan-500" />
                            افزودن نشان
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {(hero.trustBadges || []).map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="flex-1">
                                <MultilingualInput
                                  label={`نشان اعتماد ${idx + 1}`}
                                  value={badge}
                                  onChange={(val) => {
                                    const updated = [...(hero.trustBadges || [])];
                                    updated[idx] = toTrilingual(val);
                                    setHero({ ...hero, trustBadges: updated });
                                  }}
                                  compact
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = [...(hero.trustBadges || [])];
                                  updated.splice(idx, 1);
                                  setHero({ ...hero, trustBadges: updated });
                                }}
                                className="h-9 w-9 p-0 text-rose-500 hover:bg-rose-500/10 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* 1.2 SLIDERS TAB (Sortable List + Accordions) */}
                {landingTab === 'sliders' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-card border border-border">
                      <div>
                        <h2 className="text-sm font-bold text-foreground">مدیریت اسلایدرهای متحرک لندینگ</h2>
                        <p className="text-xs text-muted-foreground">
                          اسلایدها را با کشیدن آیکون دستگیره (Drag Handle) مرتب نمایید و با کلیک روی هر اسلاید آن را باز فرمایید.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddSlider}
                        className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-2xl h-10 px-4"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        افزودن اسلاید نو
                      </Button>
                    </div>

                    <SortableList
                      items={sliders}
                      onReorder={(reordered) => setSliders(reordered)}
                    >
                      {sliders.map((slide, idx) => (
                        <SortableItem key={slide.id || idx} id={slide.id || `slide-${idx}`}>
                          {({ dragHandleProps }) => (
                            <CollapsibleSection
                              title={`اسلاید #${idx + 1}: ${slide.title?.fa || 'بدون عنوان'}`}
                              subtitle={slide.subtitle?.fa || 'توضیحات اسلاید'}
                              icon={Sliders}
                              badge={slide.isActive ? 'فعال' : 'غیرفعال'}
                              defaultOpen={false}
                              isTranslating={translatingSection === `slide-${idx}`}
                              onBatchTranslate={() =>
                                handleBatchTranslate(
                                  `slide-${idx}`,
                                  {
                                    badge: slide.badge.fa,
                                    title: slide.title.fa,
                                    subtitle: slide.subtitle.fa,
                                    buttonText: slide.buttonText.fa,
                                  },
                                  (en, ps) => {
                                    const updated = [...sliders];
                                    updated[idx] = {
                                      ...updated[idx],
                                      badge: { ...updated[idx].badge, en: en.badge || updated[idx].badge.en, ps: ps.badge || updated[idx].badge.ps },
                                      title: { ...updated[idx].title, en: en.title || updated[idx].title.en, ps: ps.title || updated[idx].title.ps },
                                      subtitle: { ...updated[idx].subtitle, en: en.subtitle || updated[idx].subtitle.en, ps: ps.subtitle || updated[idx].subtitle.ps },
                                      buttonText: { ...updated[idx].buttonText, en: en.buttonText || updated[idx].buttonText.en, ps: ps.buttonText || updated[idx].buttonText.ps },
                                    };
                                    setSliders(updated);
                                  }
                                )
                              }
                              headerActions={
                                <div className="flex items-center gap-2">
                                  <DragHandle dragHandleProps={dragHandleProps} />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSlider(slide.id)}
                                    className="text-rose-500 hover:bg-rose-500/10 h-8 px-2 rounded-xl text-xs"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              }
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-border">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={slide.isActive}
                                      onCheckedChange={(checked) => {
                                        const updated = [...sliders];
                                        updated[idx].isActive = checked;
                                        setSliders(updated);
                                      }}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {slide.isActive ? 'فعال در نمایش سایت' : 'غیرفعال'}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-bold text-foreground block mb-1">
                                      تصویر اسلاید
                                    </label>
                                    <FileUploader
                                      value={slide.imageUrl}
                                      onChange={(url) => {
                                        const updated = [...sliders];
                                        updated[idx].imageUrl = url;
                                        setSliders(updated);
                                      }}
                                      folder="covers"
                                    />
                                  </div>

                                  <div className="space-y-3">
                                    <MultilingualInput
                                      label="نشانک / برچسب اسلاید"
                                      value={slide.badge}
                                      onChange={(val) => {
                                        const updated = [...sliders];
                                        updated[idx].badge = toTrilingual(val);
                                        setSliders(updated);
                                      }}
                                      compact
                                    />
                                    <MultilingualInput
                                      label="عنوان اسلاید"
                                      value={slide.title}
                                      onChange={(val) => {
                                        const updated = [...sliders];
                                        updated[idx].title = toTrilingual(val);
                                        setSliders(updated);
                                      }}
                                      compact
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-xs font-bold text-foreground block mb-1">
                                          لینک دکمه (URL)
                                        </label>
                                        <Input
                                          value={slide.buttonLink || '/services'}
                                          onChange={(e) => {
                                            const updated = [...sliders];
                                            updated[idx].buttonLink = e.target.value;
                                            setSliders(updated);
                                          }}
                                          className="font-mono text-xs rounded-xl"
                                          dir="ltr"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-bold text-foreground block mb-1">
                                          ترتیب نمایش (Order)
                                        </label>
                                        <Input
                                          type="number"
                                          value={slide.order || idx + 1}
                                          onChange={(e) => {
                                            const updated = [...sliders];
                                            updated[idx].order = Number(e.target.value);
                                            setSliders(updated);
                                          }}
                                          className="text-xs rounded-xl"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <MultilingualTextarea
                                  label="توضیحات اسلاید"
                                  value={slide.subtitle}
                                  onChange={(val) => {
                                    const updated = [...sliders];
                                    updated[idx].subtitle = toTrilingual(val);
                                    setSliders(updated);
                                  }}
                                  rows={2}
                                />

                                <MultilingualInput
                                  label="متن دکمه اقدام اسلاید"
                                  value={slide.buttonText}
                                  onChange={(val) => {
                                    const updated = [...sliders];
                                    updated[idx].buttonText = toTrilingual(val);
                                    setSliders(updated);
                                  }}
                                  compact
                                />
                              </div>
                            </CollapsibleSection>
                          )}
                        </SortableItem>
                      ))}
                    </SortableList>

                    {sliders.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs">
                        هیچ اسلایدی ثبت نشده است. با زدن دکمه «افزودن اسلاید نو» آغاز نمایید.
                      </div>
                    )}
                  </div>
                )}

                {/* 1.3 NFC CONCEPT TAB (Accordion Form - Default Closed) */}
                {landingTab === 'nfcConcept' && (
                  <CollapsibleSection
                    title="کارت ویزیت هوشمند (NFC Concept)"
                    subtitle="تنظیمات تیترها و متون نمایشی شبیه‌ساز لمس کارت هوشمند با موبایل"
                    icon={Smartphone}
                    badge="شبیه‌ساز لمس NFC"
                    defaultOpen={false}
                    isTranslating={translatingSection === 'nfcConcept'}
                    onBatchTranslate={() =>
                      handleBatchTranslate(
                        'nfcConcept',
                        {
                          badge: nfcConcept.badge.fa,
                          title: nfcConcept.title.fa,
                          subtitle: nfcConcept.subtitle.fa,
                          phoneNotificationTitle: nfcConcept.phoneNotificationTitle.fa,
                          phoneNotificationDesc: nfcConcept.phoneNotificationDesc.fa,
                          phoneProfileName: nfcConcept.phoneProfileName.fa,
                          phoneProfileTitle: nfcConcept.phoneProfileTitle.fa,
                          phoneProfileBio: nfcConcept.phoneProfileBio.fa,
                          ctaText: nfcConcept.ctaText.fa,
                          footnote: nfcConcept.footnote.fa,
                        },
                        (en, ps) => {
                          setNfcConcept((prev) => ({
                            ...prev,
                            badge: { ...prev.badge, en: en.badge || prev.badge.en, ps: ps.badge || prev.badge.ps },
                            title: { ...prev.title, en: en.title || prev.title.en, ps: ps.title || prev.title.ps },
                            subtitle: { ...prev.subtitle, en: en.subtitle || prev.subtitle.en, ps: ps.subtitle || prev.subtitle.ps },
                            phoneNotificationTitle: { ...prev.phoneNotificationTitle, en: en.phoneNotificationTitle || prev.phoneNotificationTitle.en, ps: ps.phoneNotificationTitle || prev.phoneNotificationTitle.ps },
                            phoneNotificationDesc: { ...prev.phoneNotificationDesc, en: en.phoneNotificationDesc || prev.phoneNotificationDesc.en, ps: ps.phoneNotificationDesc || prev.phoneNotificationDesc.ps },
                            phoneProfileName: { ...prev.phoneProfileName, en: en.phoneProfileName || prev.phoneProfileName.en, ps: ps.phoneProfileName || prev.phoneProfileName.ps },
                            phoneProfileTitle: { ...prev.phoneProfileTitle, en: en.phoneProfileTitle || prev.phoneProfileTitle.en, ps: ps.phoneProfileTitle || prev.phoneProfileTitle.ps },
                            phoneProfileBio: { ...prev.phoneProfileBio, en: en.phoneProfileBio || prev.phoneProfileBio.en, ps: ps.phoneProfileBio || prev.phoneProfileBio.ps },
                            ctaText: { ...prev.ctaText, en: en.ctaText || prev.ctaText.en, ps: ps.ctaText || prev.ctaText.ps },
                            footnote: { ...prev.footnote, en: en.footnote || prev.footnote.en, ps: ps.footnote || prev.footnote.ps },
                          }));
                        }
                      )
                    }
                  >
                    <div className="space-y-4">
                      <MultilingualInput
                        label="نشانگر بخش (Badge)"
                        value={nfcConcept.badge}
                        onChange={(val) => setNfcConcept({ ...nfcConcept, badge: toTrilingual(val) })}
                      />
                      <MultilingualInput
                        label="عنوان اصلی بخش"
                        value={nfcConcept.title}
                        onChange={(val) => setNfcConcept({ ...nfcConcept, title: toTrilingual(val) })}
                      />
                      <MultilingualTextarea
                        label="زیرعنوان و توضیحات بخش"
                        value={nfcConcept.subtitle}
                        onChange={(val) => setNfcConcept({ ...nfcConcept, subtitle: toTrilingual(val) })}
                        rows={2}
                      />

                      <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
                        <div className="text-xs font-bold text-foreground">متون پیش‌نمایش در شبیه‌ساز گوشی</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <MultilingualInput
                            label="تیتر اعلان گوشی (Notification Title)"
                            value={nfcConcept.phoneNotificationTitle}
                            onChange={(val) => setNfcConcept({ ...nfcConcept, phoneNotificationTitle: toTrilingual(val) })}
                            compact
                          />
                          <MultilingualInput
                            label="متن اعلان گوشی (Notification Desc)"
                            value={nfcConcept.phoneNotificationDesc}
                            onChange={(val) => setNfcConcept({ ...nfcConcept, phoneNotificationDesc: toTrilingual(val) })}
                            compact
                          />
                          <MultilingualInput
                            label="نام پروفایل تستی (Profile Name)"
                            value={nfcConcept.phoneProfileName}
                            onChange={(val) => setNfcConcept({ ...nfcConcept, phoneProfileName: toTrilingual(val) })}
                            compact
                          />
                          <MultilingualInput
                            label="سمت شغلی پروفایل (Profile Title)"
                            value={nfcConcept.phoneProfileTitle}
                            onChange={(val) => setNfcConcept({ ...nfcConcept, phoneProfileTitle: toTrilingual(val) })}
                            compact
                          />
                        </div>
                        <MultilingualInput
                          label="بیوگرافی کوتاه در پروفایل شبیه‌ساز"
                          value={nfcConcept.phoneProfileBio}
                          onChange={(val) => setNfcConcept({ ...nfcConcept, phoneProfileBio: toTrilingual(val) })}
                          compact
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MultilingualInput
                          label="متن دکمه اقدام نهایی (CTA Text)"
                          value={nfcConcept.ctaText}
                          onChange={(val) => setNfcConcept({ ...nfcConcept, ctaText: toTrilingual(val) })}
                        />
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            لینک دکمه اقدام (URL)
                          </label>
                          <Input
                            value={nfcConcept.ctaLink || '/auth/register'}
                            onChange={(e) => setNfcConcept({ ...nfcConcept, ctaLink: e.target.value })}
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <MultilingualInput
                        label="پاورقی یا یادداشت بخش (Footnote)"
                        value={nfcConcept.footnote}
                        onChange={(val) => setNfcConcept({ ...nfcConcept, footnote: toTrilingual(val) })}
                      />
                    </div>
                  </CollapsibleSection>
                )}

                {/* 1.4 STATS TAB (Sortable List + Accordion) */}
                {landingTab === 'stats' && (
                  <CollapsibleSection
                    title="آمار و ارقام انیمیشنی لندینگ‌پیج"
                    subtitle="تعداد کاربران، کارت‌های صادر شده و تراکنش‌ها با امکان جابجایی ترتیبی"
                    icon={BarChart3}
                    badge={`${(aboutUs.stats || []).length} آمار`}
                    defaultOpen={false}
                    headerActions={
                      <Button
                        type="button"
                        onClick={handleAddStat}
                        className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl h-9 px-3"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        افزودن آمار نو
                      </Button>
                    }
                  >
                    <SortableList
                      items={statsSortable}
                      onReorder={(reordered) => setAboutUs({ ...aboutUs, stats: reordered as any })}
                    >
                      {statsSortable.map((stat, idx) => (
                        <SortableItem key={stat.id} id={stat.id}>
                          {({ dragHandleProps }) => (
                            <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
                              <DragHandle dragHandleProps={dragHandleProps} />
                              <div className="w-full sm:w-1/3">
                                <MultilingualInput
                                  label={`مقدار عددی #${idx + 1}`}
                                  value={stat.value}
                                  onChange={(val) => {
                                    const updated = [...(aboutUs.stats || [])];
                                    updated[idx].value = toTrilingual(val);
                                    setAboutUs({ ...aboutUs, stats: updated });
                                  }}
                                  compact
                                />
                              </div>
                              <div className="flex-1 w-full">
                                <MultilingualInput
                                  label={`برچسب آمار #${idx + 1}`}
                                  value={stat.label}
                                  onChange={(val) => {
                                    const updated = [...(aboutUs.stats || [])];
                                    updated[idx].label = toTrilingual(val);
                                    setAboutUs({ ...aboutUs, stats: updated });
                                  }}
                                  compact
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveStat(idx)}
                                className="text-rose-500 hover:bg-rose-500/10 h-9 w-9 p-0 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </SortableItem>
                      ))}
                    </SortableList>
                  </CollapsibleSection>
                )}

                {/* 1.5 TRUSTED BY / PARTNERS TAB (Sortable List + Accordion) */}
                {landingTab === 'trustedBy' && (
                  <CollapsibleSection
                    title="لوگوی شرکا، سازمان‌ها و همکاران"
                    subtitle="برندهای معتبر مورد اعتماد با امکان تغییر ترتیب با کشیدن و رها کردن"
                    icon={Award}
                    badge={`${partners.length} شریک تجاری`}
                    defaultOpen={false}
                    headerActions={
                      <Button
                        type="button"
                        onClick={handleAddPartner}
                        className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl h-9 px-3"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        افزودن همکار نو
                      </Button>
                    }
                  >
                    <SortableList
                      items={partners}
                      onReorder={(reordered) => setPartners(reordered)}
                    >
                      {partners.map((partner, idx) => (
                        <SortableItem key={partner.id || idx} id={partner.id || `partner-${idx}`}>
                          {({ dragHandleProps }) => (
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <DragHandle dragHandleProps={dragHandleProps} />
                                  <Badge variant="outline" className="text-xs">
                                    شریک تجاری #{idx + 1}
                                  </Badge>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemovePartner(partner.id)}
                                  className="text-rose-500 hover:bg-rose-500/10 h-7 px-2 rounded-xl text-xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                                  حذف
                                </Button>
                              </div>

                              <MultilingualInput
                                label="نام سازمان یا برند"
                                value={partner.name}
                                onChange={(val) => {
                                  const updated = [...partners];
                                  updated[idx].name = toTrilingual(val);
                                  setPartners(updated);
                                }}
                                compact
                              />

                              <div>
                                <label className="text-xs font-bold text-foreground block mb-1">
                                  لوگوی سازمان
                                </label>
                                <FileUploader
                                  value={partner.logoUrl || ''}
                                  onChange={(url) => {
                                    const updated = [...partners];
                                    updated[idx].logoUrl = url;
                                    setPartners(updated);
                                  }}
                                  folder="branding"
                                />
                              </div>
                            </div>
                          )}
                        </SortableItem>
                      ))}
                    </SortableList>
                  </CollapsibleSection>
                )}

                {/* 1.6 PRICING PLANS & FINAL CTA TAB */}
                {landingTab === 'pricing_plans' && (
                  <div className="space-y-6">
                    <CollapsibleSection
                      title="بخش تعرفه‌ها و پلن‌های اشتراک (Pricing Section)"
                      subtitle="عنوان بخش، برچسب‌های ماهانه/سالانه، قیمت و امکانات پلن‌ها به سه زبان"
                      icon={PricingTagIcon}
                      badge={`${(pricing.plans || []).length} پلن`}
                      defaultOpen={true}
                      isTranslating={translatingSection === 'pricing'}
                      onBatchTranslate={() =>
                        handleBatchTranslate(
                          'pricing',
                          {
                            badge: pricing.badge.fa,
                            title: pricing.title.fa,
                            subtitle: pricing.subtitle.fa,
                            monthlyLabel: pricing.monthlyLabel.fa,
                            annualLabel: pricing.annualLabel.fa,
                            annualSaveBadge: pricing.annualSaveBadge.fa,
                          },
                          (en, ps) => {
                            setPricing((prev) => ({
                              ...prev,
                              badge: { ...prev.badge, en: en.badge || prev.badge.en, ps: ps.badge || prev.badge.ps },
                              title: { ...prev.title, en: en.title || prev.title.en, ps: ps.title || prev.title.ps },
                              subtitle: { ...prev.subtitle, en: en.subtitle || prev.subtitle.en, ps: ps.subtitle || prev.subtitle.ps },
                              monthlyLabel: { ...prev.monthlyLabel, en: en.monthlyLabel || prev.monthlyLabel.en, ps: ps.monthlyLabel || prev.monthlyLabel.ps },
                              annualLabel: { ...prev.annualLabel, en: en.annualLabel || prev.annualLabel.en, ps: ps.annualLabel || prev.annualLabel.ps },
                              annualSaveBadge: { ...prev.annualSaveBadge, en: en.annualSaveBadge || prev.annualSaveBadge.en, ps: ps.annualSaveBadge || prev.annualSaveBadge.ps },
                            }));
                          }
                        )
                      }
                      headerActions={
                        <Button
                          type="button"
                          onClick={() =>
                            setPricing((prev) => ({
                              ...prev,
                              plans: [
                                ...(prev.plans || []),
                                {
                                  id: `plan-${Date.now()}`,
                                  key: `custom_${Date.now()}`,
                                  name: { fa: 'پلن جدید', en: 'New Plan', ps: 'نوی پلان' },
                                  tagline: { fa: 'توضیح کوتاه پلن', en: 'Short plan tagline', ps: 'د پلان لنډه تشریح' },
                                  badge: { fa: 'پیشنهادی', en: 'Featured', ps: 'وړاندیز شوی' },
                                  monthlyPrice: 990,
                                  annualPrice: 790,
                                  currency: { fa: 'افغانی', en: 'AFN', ps: 'افغانۍ' },
                                  periodMonthlyLabel: { fa: '/ ماهانه', en: '/ mo', ps: '/ میاشتنی' },
                                  periodAnnualLabel: { fa: '/ ماهانه (سالانه)', en: '/ mo (annual)', ps: '/ میاشتنی (کلنی)' },
                                  ctaText: { fa: 'انتخاب پلن', en: 'Choose Plan', ps: 'پلان وټاکئ' },
                                  ctaLink: '/register',
                                  isPopular: false,
                                  isActive: true,
                                  features: [{ fa: 'ویژگی نمونه', en: 'Sample feature', ps: 'بېلګه ځانګړنه' }],
                                },
                              ],
                            }))
                          }
                          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl h-9 px-3"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          افزودن پلن جدید
                        </Button>
                      }
                    >
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <MultilingualInput
                            label="نشانگر بالای بخش تعرفه"
                            value={pricing.badge}
                            onChange={(val) => setPricing({ ...pricing, badge: toTrilingual(val) })}
                          />
                          <MultilingualInput
                            label="تیتر اصلی بخش تعرفه"
                            value={pricing.title}
                            onChange={(val) => setPricing({ ...pricing, title: toTrilingual(val) })}
                          />
                        </div>
                        <MultilingualTextarea
                          label="توضیحات زیر عنوان تعرفه"
                          value={pricing.subtitle}
                          onChange={(val) => setPricing({ ...pricing, subtitle: toTrilingual(val) })}
                          rows={2}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <MultilingualInput
                            label="برچسب پرداخت ماهانه"
                            value={pricing.monthlyLabel}
                            onChange={(val) => setPricing({ ...pricing, monthlyLabel: toTrilingual(val) })}
                            compact
                          />
                          <MultilingualInput
                            label="برچسب پرداخت سالانه"
                            value={pricing.annualLabel}
                            onChange={(val) => setPricing({ ...pricing, annualLabel: toTrilingual(val) })}
                            compact
                          />
                          <MultilingualInput
                            label="نشان تخفیف سالانه"
                            value={pricing.annualSaveBadge}
                            onChange={(val) => setPricing({ ...pricing, annualSaveBadge: toTrilingual(val) })}
                            compact
                          />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                          {(pricing.plans || []).map((plan, pIdx) => (
                            <div key={plan.id || pIdx} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-black text-cyan-500">
                                  پلن #{pIdx + 1}: {plan.name?.fa}
                                </span>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                    <Switch
                                      checked={Boolean(plan.isPopular)}
                                      onCheckedChange={(checked) => {
                                        const next = [...pricing.plans];
                                        next[pIdx] = { ...next[pIdx], isPopular: checked };
                                        setPricing({ ...pricing, plans: next });
                                      }}
                                    />
                                    <span>محبوب (Popular)</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                    <Switch
                                      checked={plan.isActive !== false}
                                      onCheckedChange={(checked) => {
                                        const next = [...pricing.plans];
                                        next[pIdx] = { ...next[pIdx], isActive: checked };
                                        setPricing({ ...pricing, plans: next });
                                      }}
                                    />
                                    <span>فعال</span>
                                  </label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const next = pricing.plans.filter((_, i) => i !== pIdx);
                                      setPricing({ ...pricing, plans: next });
                                    }}
                                    className="text-rose-500 hover:bg-rose-500/10 h-8 w-8 p-0 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <MultilingualInput
                                  label="نام پلن"
                                  value={plan.name}
                                  onChange={(val) => {
                                    const next = [...pricing.plans];
                                    next[pIdx] = { ...next[pIdx], name: toTrilingual(val) };
                                    setPricing({ ...pricing, plans: next });
                                  }}
                                  compact
                                />
                                <MultilingualInput
                                  label="نشان ویژه روی کارت پلن"
                                  value={plan.badge}
                                  onChange={(val) => {
                                    const next = [...pricing.plans];
                                    next[pIdx] = { ...next[pIdx], badge: toTrilingual(val) };
                                    setPricing({ ...pricing, plans: next });
                                  }}
                                  compact
                                />
                              </div>

                              <MultilingualInput
                                label="توضیح کوتاه پلن"
                                value={plan.tagline}
                                onChange={(val) => {
                                  const next = [...pricing.plans];
                                  next[pIdx] = { ...next[pIdx], tagline: toTrilingual(val) };
                                  setPricing({ ...pricing, plans: next });
                                }}
                                compact
                              />

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="text-[11px] font-bold block mb-1">قیمت ماهانه</label>
                                  <Input
                                    type="number"
                                    value={plan.monthlyPrice}
                                    onChange={(e) => {
                                      const next = [...pricing.plans];
                                      next[pIdx] = { ...next[pIdx], monthlyPrice: Number(e.target.value) || 0 };
                                      setPricing({ ...pricing, plans: next });
                                    }}
                                    dir="ltr"
                                    className="rounded-xl text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-bold block mb-1">قیمت سالانه</label>
                                  <Input
                                    type="number"
                                    value={plan.annualPrice}
                                    onChange={(e) => {
                                      const next = [...pricing.plans];
                                      next[pIdx] = { ...next[pIdx], annualPrice: Number(e.target.value) || 0 };
                                      setPricing({ ...pricing, plans: next });
                                    }}
                                    dir="ltr"
                                    className="rounded-xl text-xs font-mono"
                                  />
                                </div>
                                <MultilingualInput
                                  label="واحد پول"
                                  value={plan.currency}
                                  onChange={(val) => {
                                    const next = [...pricing.plans];
                                    next[pIdx] = { ...next[pIdx], currency: toTrilingual(val) };
                                    setPricing({ ...pricing, plans: next });
                                  }}
                                  compact
                                />
                                <div>
                                  <label className="text-[11px] font-bold block mb-1">لینک دکمه (URL)</label>
                                  <Input
                                    value={plan.ctaLink}
                                    onChange={(e) => {
                                      const next = [...pricing.plans];
                                      next[pIdx] = { ...next[pIdx], ctaLink: e.target.value };
                                      setPricing({ ...pricing, plans: next });
                                    }}
                                    dir="ltr"
                                    className="rounded-xl text-xs font-mono"
                                  />
                                </div>
                              </div>

                              <MultilingualInput
                                label="متن دکمه اقدام"
                                value={plan.ctaText}
                                onChange={(val) => {
                                  const next = [...pricing.plans];
                                  next[pIdx] = { ...next[pIdx], ctaText: toTrilingual(val) };
                                  setPricing({ ...pricing, plans: next });
                                }}
                                compact
                              />

                              {/* Features inside Plan */}
                              <div className="space-y-2 pt-2 border-t border-border/60">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-foreground">ویژگی‌های پلن</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [...pricing.plans];
                                      next[pIdx] = {
                                        ...next[pIdx],
                                        features: [...(next[pIdx].features || []), { fa: 'ویژگی نو', en: 'New Feature', ps: 'نوې ځانګړنه' }],
                                      };
                                      setPricing({ ...pricing, plans: next });
                                    }}
                                    className="h-7 px-2.5 text-[11px] rounded-lg"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    افزودن ویژگی
                                  </Button>
                                </div>
                                {(plan.features || []).map((feat, fIdx) => (
                                  <div key={fIdx} className="flex items-start gap-2">
                                    <div className="flex-1">
                                      <MultilingualInput
                                        label={`ویژگی #${fIdx + 1}`}
                                        value={feat}
                                        onChange={(val) => {
                                          const next = [...pricing.plans];
                                          const nextFeats = [...next[pIdx].features];
                                          nextFeats[fIdx] = toTrilingual(val);
                                          next[pIdx] = { ...next[pIdx], features: nextFeats };
                                          setPricing({ ...pricing, plans: next });
                                        }}
                                        compact
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const next = [...pricing.plans];
                                        next[pIdx] = {
                                          ...next[pIdx],
                                          features: next[pIdx].features.filter((_, i) => i !== fIdx),
                                        };
                                        setPricing({ ...pricing, plans: next });
                                      }}
                                      className="mt-6 text-rose-500 hover:bg-rose-500/10 h-8 w-8 p-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="بنر دعوت به اقدام نهایی صفحه اصلی (Final Conversion CTA)"
                      subtitle="متن تشویقی پایان صفحه اصلی همراه با دکمه‌های سه‌زبانه"
                      icon={Sparkles}
                      badge="بنر نهایی"
                      defaultOpen={false}
                      isTranslating={translatingSection === 'finalCta'}
                      onBatchTranslate={() =>
                        handleBatchTranslate(
                          'finalCta',
                          {
                            badge: finalCta.badge.fa,
                            title: finalCta.title.fa,
                            subtitle: finalCta.subtitle.fa,
                            primaryCtaText: finalCta.primaryCtaText.fa,
                            secondaryCtaText: finalCta.secondaryCtaText.fa,
                          },
                          (en, ps) => {
                            setFinalCta((prev) => ({
                              ...prev,
                              badge: { ...prev.badge, en: en.badge || prev.badge.en, ps: ps.badge || prev.badge.ps },
                              title: { ...prev.title, en: en.title || prev.title.en, ps: ps.title || prev.title.ps },
                              subtitle: { ...prev.subtitle, en: en.subtitle || prev.subtitle.en, ps: ps.subtitle || prev.subtitle.ps },
                              primaryCtaText: { ...prev.primaryCtaText, en: en.primaryCtaText || prev.primaryCtaText.en, ps: ps.primaryCtaText || prev.primaryCtaText.ps },
                              secondaryCtaText: { ...prev.secondaryCtaText, en: en.secondaryCtaText || prev.secondaryCtaText.en, ps: ps.secondaryCtaText || prev.secondaryCtaText.ps },
                            }));
                          }
                        )
                      }
                    >
                      <div className="space-y-4">
                        <MultilingualInput
                          label="نشانگر بالای بنر"
                          value={finalCta.badge}
                          onChange={(val) => setFinalCta({ ...finalCta, badge: toTrilingual(val) })}
                        />
                        <MultilingualInput
                          label="تیتر اصلی بنر"
                          value={finalCta.title}
                          onChange={(val) => setFinalCta({ ...finalCta, title: toTrilingual(val) })}
                        />
                        <MultilingualTextarea
                          label="توضیحات بنر"
                          value={finalCta.subtitle}
                          onChange={(val) => setFinalCta({ ...finalCta, subtitle: toTrilingual(val) })}
                          rows={2}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border">
                            <MultilingualInput
                              label="متن دکمه اصلی"
                              value={finalCta.primaryCtaText}
                              onChange={(val) => setFinalCta({ ...finalCta, primaryCtaText: toTrilingual(val) })}
                              compact
                            />
                            <Input
                              value={finalCta.primaryCtaLink}
                              onChange={(e) => setFinalCta({ ...finalCta, primaryCtaLink: e.target.value })}
                              dir="ltr"
                              className="rounded-xl text-xs font-mono"
                            />
                          </div>
                          <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border">
                            <MultilingualInput
                              label="متن دکمه فرعی"
                              value={finalCta.secondaryCtaText}
                              onChange={(val) => setFinalCta({ ...finalCta, secondaryCtaText: toTrilingual(val) })}
                              compact
                            />
                            <Input
                              value={finalCta.secondaryCtaLink}
                              onChange={(e) => setFinalCta({ ...finalCta, secondaryCtaLink: e.target.value })}
                              dir="ltr"
                              className="rounded-xl text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>
                  </div>
                )}

                {/* 1.7 FEATURES BENTO & HOW IT WORKS STEPS TAB */}
                {landingTab === 'features_steps' && (
                  <div className="space-y-6">
                    <CollapsibleSection
                      title="بخش امکانات و قابلیت‌ها (Bento Grid Features)"
                      subtitle="تیتر و ۵ کارت اصلی امکانات صفحه نخست به سه زبان"
                      icon={FeaturesLayersIcon}
                      badge={`${(features.items || []).length} قابلیت`}
                      defaultOpen={true}
                      isTranslating={translatingSection === 'features'}
                      onBatchTranslate={() =>
                        handleBatchTranslate(
                          'features',
                          {
                            badge: features.badge.fa,
                            title: features.title.fa,
                            subtitle: features.subtitle.fa,
                          },
                          (en, ps) => {
                            setFeatures((prev) => ({
                              ...prev,
                              badge: { ...prev.badge, en: en.badge || prev.badge.en, ps: ps.badge || prev.badge.ps },
                              title: { ...prev.title, en: en.title || prev.title.en, ps: ps.title || prev.title.ps },
                              subtitle: { ...prev.subtitle, en: en.subtitle || prev.subtitle.en, ps: ps.subtitle || prev.subtitle.ps },
                            }));
                          }
                        )
                      }
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <MultilingualInput
                            label="نشانگر بالای بخش امکانات"
                            value={features.badge}
                            onChange={(val) => setFeatures({ ...features, badge: toTrilingual(val) })}
                          />
                          <MultilingualInput
                            label="تیتر اصلی امکانات"
                            value={features.title}
                            onChange={(val) => setFeatures({ ...features, title: toTrilingual(val) })}
                          />
                        </div>
                        <MultilingualTextarea
                          label="توضیحات بخش امکانات"
                          value={features.subtitle}
                          onChange={(val) => setFeatures({ ...features, subtitle: toTrilingual(val) })}
                          rows={2}
                        />
                        <div className="space-y-3 pt-3 border-t border-border">
                          {(features.items || []).map((item, idx) => (
                            <div key={item.id || idx} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                              <span className="text-xs font-black text-cyan-500">کارت #{idx + 1} ({item.key})</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <MultilingualInput
                                  label="برچسب کارت"
                                  value={item.badge}
                                  onChange={(val) => {
                                    const next = [...features.items];
                                    next[idx] = { ...next[idx], badge: toTrilingual(val) };
                                    setFeatures({ ...features, items: next });
                                  }}
                                  compact
                                />
                                <MultilingualInput
                                  label="عنوان قابلیت"
                                  value={item.title}
                                  onChange={(val) => {
                                    const next = [...features.items];
                                    next[idx] = { ...next[idx], title: toTrilingual(val) };
                                    setFeatures({ ...features, items: next });
                                  }}
                                  compact
                                />
                              </div>
                              <MultilingualTextarea
                                label="توضیح قابلیت"
                                value={item.desc}
                                onChange={(val) => {
                                  const next = [...features.items];
                                  next[idx] = { ...next[idx], desc: toTrilingual(val) };
                                  setFeatures({ ...features, items: next });
                                }}
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="نحوه کارکرد در ۳ گام (How It Works)"
                      subtitle="عنوان و ۳ مرحله شروع سریع در صفحه اصلی"
                      icon={Sparkles}
                      badge={`${(howItWorks.steps || []).length} گام`}
                      defaultOpen={false}
                      isTranslating={translatingSection === 'howItWorks'}
                      onBatchTranslate={() =>
                        handleBatchTranslate(
                          'howItWorks',
                          {
                            badge: howItWorks.badge.fa,
                            title: howItWorks.title.fa,
                            subtitle: howItWorks.subtitle.fa,
                            footerNote: howItWorks.footerNote.fa,
                          },
                          (en, ps) => {
                            setHowItWorks((prev) => ({
                              ...prev,
                              badge: { ...prev.badge, en: en.badge || prev.badge.en, ps: ps.badge || prev.badge.ps },
                              title: { ...prev.title, en: en.title || prev.title.en, ps: ps.title || prev.title.ps },
                              subtitle: { ...prev.subtitle, en: en.subtitle || prev.subtitle.en, ps: ps.subtitle || prev.subtitle.ps },
                              footerNote: { ...prev.footerNote, en: en.footerNote || prev.footerNote.en, ps: ps.footerNote || prev.footerNote.ps },
                            }));
                          }
                        )
                      }
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <MultilingualInput
                            label="نشانگر بالای بخش"
                            value={howItWorks.badge}
                            onChange={(val) => setHowItWorks({ ...howItWorks, badge: toTrilingual(val) })}
                          />
                          <MultilingualInput
                            label="عنوان اصلی بخش"
                            value={howItWorks.title}
                            onChange={(val) => setHowItWorks({ ...howItWorks, title: toTrilingual(val) })}
                          />
                        </div>
                        <MultilingualTextarea
                          label="زیرعنوان بخش"
                          value={howItWorks.subtitle}
                          onChange={(val) => setHowItWorks({ ...howItWorks, subtitle: toTrilingual(val) })}
                          rows={2}
                        />
                        <MultilingualInput
                          label="یادداشت پایینی کارت‌ها (Footer Note)"
                          value={howItWorks.footerNote}
                          onChange={(val) => setHowItWorks({ ...howItWorks, footerNote: toTrilingual(val) })}
                        />
                        <div className="space-y-3 pt-3 border-t border-border">
                          {(howItWorks.steps || []).map((st, idx) => (
                            <div key={st.id || idx} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                              <span className="text-xs font-black text-cyan-500">مرحله {st.num}</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <MultilingualInput
                                  label="نشان مرحله"
                                  value={st.badge}
                                  onChange={(val) => {
                                    const next = [...howItWorks.steps];
                                    next[idx] = { ...next[idx], badge: toTrilingual(val) };
                                    setHowItWorks({ ...howItWorks, steps: next });
                                  }}
                                  compact
                                />
                                <MultilingualInput
                                  label="عنوان مرحله"
                                  value={st.title}
                                  onChange={(val) => {
                                    const next = [...howItWorks.steps];
                                    next[idx] = { ...next[idx], title: toTrilingual(val) };
                                    setHowItWorks({ ...howItWorks, steps: next });
                                  }}
                                  compact
                                />
                              </div>
                              <MultilingualTextarea
                                label="توضیح مرحله"
                                value={st.desc}
                                onChange={(val) => {
                                  const next = [...howItWorks.steps];
                                  next[idx] = { ...next[idx], desc: toTrilingual(val) };
                                  setHowItWorks({ ...howItWorks, steps: next });
                                }}
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleSection>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================
              CATEGORY 2: محتوای صفحات (Pages Content)
          ======================================================== */}
          {activeCategory === 'pages' && (
            <>
              {/* Sticky Tabs List */}
              <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border pb-2 pt-4 flex flex-wrap gap-1.5 p-1.5 rounded-2xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setPagesTab('aboutUs')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${pagesTab === 'aboutUs'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>درباره ما و اعضای تیم</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPagesTab('faq')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${pagesTab === 'faq'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>سوالات متداول (FAQ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPagesTab('blog')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${pagesTab === 'blog'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>هدر و معرفی وبلاگ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPagesTab('legal_terms')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${pagesTab === 'legal_terms'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <LegalScaleIcon className="w-3.5 h-3.5" />
                  <span>قوانین و حریم خصوصی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPagesTab('contact_info')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${pagesTab === 'contact_info'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <ContactPhoneIcon className="w-3.5 h-3.5" />
                  <span>صفحه تماس با ما</span>
                </button>
              </div>

              {/* Form Container with pt-4 scroll-mt-20 */}
              <div className="pt-4 scroll-mt-20 space-y-6">
                {/* 2.4 LEGAL: TERMS OF SERVICE & PRIVACY POLICY */}
                {pagesTab === 'legal_terms' && (
                  <div className="space-y-6">
                    <CollapsibleSection
                      title="قوانین و مقررات استفاده (Terms of Service)"
                      subtitle="عنوان، معرفی و بندهای حقوقی صفحه /terms به سه زبان"
                      icon={LegalScaleIcon}
                      badge={`${(legal.termsSections || []).length} بند`}
                      defaultOpen={true}
                      isTranslating={translatingSection === 'legalTerms'}
                      onBatchTranslate={() =>
                        handleBatchTranslate(
                          'legalTerms',
                          {
                            termsBadge: legal.termsBadge.fa,
                            termsTitle: legal.termsTitle.fa,
                            termsUpdatedAt: legal.termsUpdatedAt.fa,
                            termsIntro: legal.termsIntro.fa,
                          },
                          (en, ps) => {
                            setLegal((prev) => ({
                              ...prev,
                              termsBadge: { ...prev.termsBadge, en: en.termsBadge || prev.termsBadge.en, ps: ps.termsBadge || prev.termsBadge.ps },
                              termsTitle: { ...prev.termsTitle, en: en.termsTitle || prev.termsTitle.en, ps: ps.termsTitle || prev.termsTitle.ps },
                              termsUpdatedAt: { ...prev.termsUpdatedAt, en: en.termsUpdatedAt || prev.termsUpdatedAt.en, ps: ps.termsUpdatedAt || prev.termsUpdatedAt.ps },
                              termsIntro: { ...prev.termsIntro, en: en.termsIntro || prev.termsIntro.en, ps: ps.termsIntro || prev.termsIntro.ps },
                            }));
                          }
                        )
                      }
                      headerActions={
                        <Button
                          type="button"
                          onClick={() =>
                            setLegal((prev) => ({
                              ...prev,
                              termsSections: [
                                ...(prev.termsSections || []),
                                {
                                  id: `term-${Date.now()}`,
                                  title: { fa: 'بند جدید مقررات', en: 'New Terms Clause', ps: 'د اصولو نوې ماده' },
                                  content: { fa: 'شرح کامل این بند حقوقی...', en: 'Full legal details for this clause...', ps: 'د دې مادې بشپړ شرح...' },
                                },
                              ],
                            }))
                          }
                          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl h-9 px-3"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          افزودن بند جدید
                        </Button>
                      }
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <MultilingualInput
                            label="نشانگر صفحه قوانین"
                            value={legal.termsBadge}
                            onChange={(val) => setLegal({ ...legal, termsBadge: toTrilingual(val) })}
                          />
                          <MultilingualInput
                            label="تاریخ آخرین به‌روزرسانی"
                            value={legal.termsUpdatedAt}
                            onChange={(val) => setLegal({ ...legal, termsUpdatedAt: toTrilingual(val) })}
                          />
                        </div>
                        <MultilingualInput
                          label="عنوان اصلی صفحه قوانین"
                          value={legal.termsTitle}
                          onChange={(val) => setLegal({ ...legal, termsTitle: toTrilingual(val) })}
                        />
                        <MultilingualTextarea
                          label="مقدمه قوانین و مقررات"
                          value={legal.termsIntro}
                          onChange={(val) => setLegal({ ...legal, termsIntro: toTrilingual(val) })}
                          rows={2}
                        />
                        <div className="space-y-3 pt-3 border-t border-border">
                          {(legal.termsSections || []).map((sec, idx) => (
                            <div key={sec.id || idx} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-cyan-500">ماده #{idx + 1}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setLegal({
                                      ...legal,
                                      termsSections: legal.termsSections.filter((_, i) => i !== idx),
                                    })
                                  }
                                  className="text-rose-500 hover:bg-rose-500/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <MultilingualInput
                                label="عنوان بند"
                                value={sec.title}
                                onChange={(val) => {
                                  const next = [...legal.termsSections];
                                  next[idx] = { ...next[idx], title: toTrilingual(val) };
                                  setLegal({ ...legal, termsSections: next });
                                }}
                                compact
                              />
                              <MultilingualTextarea
                                label="متن بند"
                                value={sec.content}
                                onChange={(val) => {
                                  const next = [...legal.termsSections];
                                  next[idx] = { ...next[idx], content: toTrilingual(val) };
                                  setLegal({ ...legal, termsSections: next });
                                }}
                                rows={3}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="سیاست حفظ حریم خصوصی (Privacy Policy)"
                      subtitle="عنوان، معرفی و بندهای حریم خصوصی صفحه /privacy به سه زبان"
                      icon={LegalScaleIcon}
                      badge={`${(legal.privacySections || []).length} بند`}
                      defaultOpen={false}
                      isTranslating={translatingSection === 'legalPrivacy'}
                      onBatchTranslate={() =>
                        handleBatchTranslate(
                          'legalPrivacy',
                          {
                            privacyBadge: legal.privacyBadge.fa,
                            privacyTitle: legal.privacyTitle.fa,
                            privacyUpdatedAt: legal.privacyUpdatedAt.fa,
                            privacyIntro: legal.privacyIntro.fa,
                          },
                          (en, ps) => {
                            setLegal((prev) => ({
                              ...prev,
                              privacyBadge: { ...prev.privacyBadge, en: en.privacyBadge || prev.privacyBadge.en, ps: ps.privacyBadge || prev.privacyBadge.ps },
                              privacyTitle: { ...prev.privacyTitle, en: en.privacyTitle || prev.privacyTitle.en, ps: ps.privacyTitle || prev.privacyTitle.ps },
                              privacyUpdatedAt: { ...prev.privacyUpdatedAt, en: en.privacyUpdatedAt || prev.privacyUpdatedAt.en, ps: ps.privacyUpdatedAt || prev.privacyUpdatedAt.ps },
                              privacyIntro: { ...prev.privacyIntro, en: en.privacyIntro || prev.privacyIntro.en, ps: ps.privacyIntro || prev.privacyIntro.ps },
                            }));
                          }
                        )
                      }
                      headerActions={
                        <Button
                          type="button"
                          onClick={() =>
                            setLegal((prev) => ({
                              ...prev,
                              privacySections: [
                                ...(prev.privacySections || []),
                                {
                                  id: `priv-${Date.now()}`,
                                  title: { fa: 'بند جدید حریم خصوصی', en: 'New Privacy Clause', ps: 'د محرمیت نوې ماده' },
                                  content: { fa: 'توضیحات این بند...', en: 'Details for this clause...', ps: 'د دې مادې تشریح...' },
                                },
                              ],
                            }))
                          }
                          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl h-9 px-3"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          افزودن بند جدید
                        </Button>
                      }
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <MultilingualInput
                            label="نشانگر صفحه حریم خصوصی"
                            value={legal.privacyBadge}
                            onChange={(val) => setLegal({ ...legal, privacyBadge: toTrilingual(val) })}
                          />
                          <MultilingualInput
                            label="تاریخ آخرین به‌روزرسانی"
                            value={legal.privacyUpdatedAt}
                            onChange={(val) => setLegal({ ...legal, privacyUpdatedAt: toTrilingual(val) })}
                          />
                        </div>
                        <MultilingualInput
                          label="عنوان اصلی حریم خصوصی"
                          value={legal.privacyTitle}
                          onChange={(val) => setLegal({ ...legal, privacyTitle: toTrilingual(val) })}
                        />
                        <MultilingualTextarea
                          label="مقدمه حریم خصوصی"
                          value={legal.privacyIntro}
                          onChange={(val) => setLegal({ ...legal, privacyIntro: toTrilingual(val) })}
                          rows={2}
                        />
                        <div className="space-y-3 pt-3 border-t border-border">
                          {(legal.privacySections || []).map((sec, idx) => (
                            <div key={sec.id || idx} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-emerald-500">ماده #{idx + 1}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setLegal({
                                      ...legal,
                                      privacySections: legal.privacySections.filter((_, i) => i !== idx),
                                    })
                                  }
                                  className="text-rose-500 hover:bg-rose-500/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <MultilingualInput
                                label="عنوان بند"
                                value={sec.title}
                                onChange={(val) => {
                                  const next = [...legal.privacySections];
                                  next[idx] = { ...next[idx], title: toTrilingual(val) };
                                  setLegal({ ...legal, privacySections: next });
                                }}
                                compact
                              />
                              <MultilingualTextarea
                                label="متن بند"
                                value={sec.content}
                                onChange={(val) => {
                                  const next = [...legal.privacySections];
                                  next[idx] = { ...next[idx], content: toTrilingual(val) };
                                  setLegal({ ...legal, privacySections: next });
                                }}
                                rows={3}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleSection>
                  </div>
                )}

                {/* 2.5 CONTACT US INFO TAB */}
                {pagesTab === 'contact_info' && (
                  <CollapsibleSection
                    title="مدیریت صفحه تماس با ما (Contact Us)"
                    subtitle="آدرس دفتر، ساعات کاری، ایمیل، نمبر تماس، واتساپ و تلگرام رسمی پشتیبانی"
                    icon={ContactPhoneIcon}
                    badge="تماس با ما"
                    defaultOpen={true}
                    isTranslating={translatingSection === 'contactUs'}
                    onBatchTranslate={() =>
                      handleBatchTranslate(
                        'contactUs',
                        {
                          badge: contactUs.badge.fa,
                          title: contactUs.title.fa,
                          subtitle: contactUs.subtitle.fa,
                          officeTitle: contactUs.officeTitle.fa,
                          officeAddress: contactUs.officeAddress.fa,
                          workingHoursLabel: contactUs.workingHoursLabel.fa,
                          workingHours: contactUs.workingHours.fa,
                        },
                        (en, ps) => {
                          setContactUs((prev) => ({
                            ...prev,
                            badge: { ...prev.badge, en: en.badge || prev.badge.en, ps: ps.badge || prev.badge.ps },
                            title: { ...prev.title, en: en.title || prev.title.en, ps: ps.title || prev.title.ps },
                            subtitle: { ...prev.subtitle, en: en.subtitle || prev.subtitle.en, ps: ps.subtitle || prev.subtitle.ps },
                            officeTitle: { ...prev.officeTitle, en: en.officeTitle || prev.officeTitle.en, ps: ps.officeTitle || prev.officeTitle.ps },
                            officeAddress: { ...prev.officeAddress, en: en.officeAddress || prev.officeAddress.en, ps: ps.officeAddress || prev.officeAddress.ps },
                            workingHoursLabel: { ...prev.workingHoursLabel, en: en.workingHoursLabel || prev.workingHoursLabel.en, ps: ps.workingHoursLabel || prev.workingHoursLabel.ps },
                            workingHours: { ...prev.workingHours, en: en.workingHours || prev.workingHours.en, ps: ps.workingHours || prev.workingHours.ps },
                          }));
                        }
                      )
                    }
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MultilingualInput
                          label="نشانگر بالای صفحه تماس"
                          value={contactUs.badge}
                          onChange={(val) => setContactUs({ ...contactUs, badge: toTrilingual(val) })}
                        />
                        <MultilingualInput
                          label="تیتر اصلی تماس با ما"
                          value={contactUs.title}
                          onChange={(val) => setContactUs({ ...contactUs, title: toTrilingual(val) })}
                        />
                      </div>
                      <MultilingualTextarea
                        label="زیرعنوان تماس با ما"
                        value={contactUs.subtitle}
                        onChange={(val) => setContactUs({ ...contactUs, subtitle: toTrilingual(val) })}
                        rows={2}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MultilingualInput
                          label="عنوان دفتر مرکزی"
                          value={contactUs.officeTitle}
                          onChange={(val) => setContactUs({ ...contactUs, officeTitle: toTrilingual(val) })}
                        />
                        <MultilingualInput
                          label="آدرس دقیق دفتر"
                          value={contactUs.officeAddress}
                          onChange={(val) => setContactUs({ ...contactUs, officeAddress: toTrilingual(val) })}
                        />
                        <MultilingualInput
                          label="برچسب ساعات کاری"
                          value={contactUs.workingHoursLabel}
                          onChange={(val) => setContactUs({ ...contactUs, workingHoursLabel: toTrilingual(val) })}
                        />
                        <MultilingualInput
                          label="ساعات کاری پشتیبانی"
                          value={contactUs.workingHours}
                          onChange={(val) => setContactUs({ ...contactUs, workingHours: toTrilingual(val) })}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border">
                        <div>
                          <label className="text-xs font-bold block mb-1">ایمیل پشتیبانی</label>
                          <Input
                            value={contactUs.supportEmail}
                            onChange={(e) => setContactUs({ ...contactUs, supportEmail: e.target.value })}
                            dir="ltr"
                            className="rounded-xl text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold block mb-1">نمبر تماس رسمی</label>
                          <Input
                            value={contactUs.supportPhone}
                            onChange={(e) => setContactUs({ ...contactUs, supportPhone: e.target.value })}
                            dir="ltr"
                            className="rounded-xl text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold block mb-1">نمبر واتساپ</label>
                          <Input
                            value={contactUs.whatsappNumber}
                            onChange={(e) => setContactUs({ ...contactUs, whatsappNumber: e.target.value })}
                            dir="ltr"
                            className="rounded-xl text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold block mb-1">آیدی تلگرام</label>
                          <Input
                            value={contactUs.telegramHandle}
                            onChange={(e) => setContactUs({ ...contactUs, telegramHandle: e.target.value })}
                            dir="ltr"
                            className="rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* 2.1 ABOUT US TAB (Accordion Form - Default Closed) */}
                {pagesTab === 'aboutUs' && (
                  <div className="space-y-6">
                    <CollapsibleSection
                      title="داستان برند، مأموریت و چشم‌انداز (About Us)"
                      subtitle="متون داستان شکل‌گیری، آرمان‌ها و اهداف سازمانی آریا لینک"
                      icon={Building2}
                      badge="صفحه درباره ما"
                      defaultOpen={false}
                      isTranslating={translatingSection === 'aboutUs'}
                      onBatchTranslate={() =>
                        handleBatchTranslate(
                          'aboutUs',
                          {
                            badge: aboutUs.badge.fa,
                            title: aboutUs.title.fa,
                            slogan: aboutUs.slogan.fa,
                            storyTitle: aboutUs.storyTitle.fa,
                            story: aboutUs.story.fa,
                            missionTitle: aboutUs.missionTitle.fa,
                            mission: aboutUs.mission.fa,
                            visionTitle: aboutUs.visionTitle.fa,
                            vision: aboutUs.vision.fa,
                          },
                          (en, ps) => {
                            setAboutUs((prev) => ({
                              ...prev,
                              badge: { ...prev.badge, en: en.badge || prev.badge.en, ps: ps.badge || prev.badge.ps },
                              title: { ...prev.title, en: en.title || prev.title.en, ps: ps.title || prev.title.ps },
                              slogan: { ...prev.slogan, en: en.slogan || prev.slogan.en, ps: ps.slogan || prev.slogan.ps },
                              storyTitle: { ...prev.storyTitle, en: en.storyTitle || prev.storyTitle.en, ps: ps.storyTitle || prev.storyTitle.ps },
                              story: { ...prev.story, en: en.story || prev.story.en, ps: ps.story || prev.story.ps },
                              missionTitle: { ...prev.missionTitle, en: en.missionTitle || prev.missionTitle.en, ps: ps.missionTitle || prev.missionTitle.ps },
                              mission: { ...prev.mission, en: en.mission || prev.mission.en, ps: ps.mission || prev.mission.ps },
                              visionTitle: { ...prev.visionTitle, en: en.visionTitle || prev.visionTitle.en, ps: ps.visionTitle || prev.visionTitle.ps },
                              vision: { ...prev.vision, en: en.vision || prev.vision.en, ps: ps.vision || prev.vision.ps },
                            }));
                          }
                        )
                      }
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <MultilingualInput
                            label="نشانک صفحه (Badge)"
                            value={aboutUs.badge}
                            onChange={(val) => setAboutUs({ ...aboutUs, badge: toTrilingual(val) })}
                          />
                          <MultilingualInput
                            label="عنوان اصلی"
                            value={aboutUs.title}
                            onChange={(val) => setAboutUs({ ...aboutUs, title: toTrilingual(val) })}
                          />
                          <MultilingualInput
                            label="شعار سازمانی"
                            value={aboutUs.slogan}
                            onChange={(val) => setAboutUs({ ...aboutUs, slogan: toTrilingual(val) })}
                          />
                        </div>

                        {/* Story */}
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                          <MultilingualInput
                            label="عنوان داستان ما"
                            value={aboutUs.storyTitle}
                            onChange={(val) => setAboutUs({ ...aboutUs, storyTitle: toTrilingual(val) })}
                            compact
                          />
                          <MultilingualTextarea
                            label="شرح کامل داستان برند"
                            value={aboutUs.story}
                            onChange={(val) => setAboutUs({ ...aboutUs, story: toTrilingual(val) })}
                            rows={3}
                          />
                        </div>

                        {/* Mission & Vision */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                            <MultilingualInput
                              label="عنوان مأموریت سازمانی"
                              value={aboutUs.missionTitle}
                              onChange={(val) => setAboutUs({ ...aboutUs, missionTitle: toTrilingual(val) })}
                              compact
                            />
                            <MultilingualTextarea
                              label="شرح مأموریت"
                              value={aboutUs.mission}
                              onChange={(val) => setAboutUs({ ...aboutUs, mission: toTrilingual(val) })}
                              rows={3}
                            />
                          </div>

                          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                            <MultilingualInput
                              label="عنوان چشم‌انداز آینده"
                              value={aboutUs.visionTitle}
                              onChange={(val) => setAboutUs({ ...aboutUs, visionTitle: toTrilingual(val) })}
                              compact
                            />
                            <MultilingualTextarea
                              label="شرح چشم‌انداز"
                              value={aboutUs.vision}
                              onChange={(val) => setAboutUs({ ...aboutUs, vision: toTrilingual(val) })}
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>

                    {/* Team Members with Drag & Drop */}
                    <CollapsibleSection
                      title="کادر رهبری و اعضای تیم (Team Members)"
                      subtitle="معرفی اشخاص کلیدی با امکان مرتب‌سازی ترتیبی با کشیدن و رها کردن"
                      icon={Users}
                      badge={`${team.length} عضو`}
                      defaultOpen={false}
                      headerActions={
                        <Button
                          type="button"
                          onClick={handleAddTeamMember}
                          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl h-9 px-3"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          افزودن عضو نو
                        </Button>
                      }
                    >
                      <SortableList
                        items={team}
                        onReorder={(reordered) => setTeam(reordered)}
                      >
                        {team.map((member, idx) => (
                          <SortableItem key={member.id || idx} id={member.id || `team-${idx}`}>
                            {({ dragHandleProps }) => (
                              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <DragHandle dragHandleProps={dragHandleProps} />
                                    <Badge variant="outline" className="text-xs">
                                      عضو #{idx + 1}: {member.name?.fa || 'بدون نام'}
                                    </Badge>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveTeamMember(member.id)}
                                    className="text-rose-500 hover:bg-rose-500/10 h-7 px-2 rounded-xl text-xs"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    حذف
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <MultilingualInput
                                    label="نام و تخلص"
                                    value={member.name}
                                    onChange={(val) => {
                                      const updated = [...team];
                                      updated[idx].name = toTrilingual(val);
                                      setTeam(updated);
                                    }}
                                    compact
                                  />
                                  <MultilingualInput
                                    label="عنوان سمت"
                                    value={member.role}
                                    onChange={(val) => {
                                      const updated = [...team];
                                      updated[idx].role = toTrilingual(val);
                                      setTeam(updated);
                                    }}
                                    compact
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-bold text-foreground block mb-1">
                                    تصویر چهره / پرتره
                                  </label>
                                  <FileUploader
                                    value={member.avatarUrl || ''}
                                    onChange={(url) => {
                                      const updated = [...team];
                                      updated[idx].avatarUrl = url;
                                      setTeam(updated);
                                    }}
                                    folder="avatars"
                                  />
                                </div>
                              </div>
                            )}
                          </SortableItem>
                        ))}
                      </SortableList>
                    </CollapsibleSection>
                  </div>
                )}

                {/* 2.2 FAQ TAB (Sortable List + Accordions) */}
                {pagesTab === 'faq' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-card border border-border">
                      <div>
                        <h2 className="text-sm font-bold text-foreground">پرسش‌های متداول پلتفرم (FAQ)</h2>
                        <p className="text-xs text-muted-foreground">
                          پرسش‌ها به صورت کشویی هستند. برای تغییر اولویت نمایش، دستگیره درگ را بکشید.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddFaq}
                        className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-2xl h-10 px-4"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        افزودن پرسش نو
                      </Button>
                    </div>

                    <SortableList
                      items={faq}
                      onReorder={(reordered) => setFaq(reordered)}
                    >
                      {faq.map((item, idx) => (
                        <SortableItem key={item.id || idx} id={item.id || `faq-${idx}`}>
                          {({ dragHandleProps }) => (
                            <CollapsibleSection
                              title={`پرسش #${idx + 1}: ${item.question?.fa || 'بدون متن'}`}
                              subtitle={item.answer?.fa ? `${item.answer.fa.slice(0, 60)}...` : 'بدون پاسخ'}
                              icon={HelpCircle}
                              badge={item.isActive !== false ? 'فعال' : 'غیرفعال'}
                              defaultOpen={false}
                              isTranslating={translatingSection === `faq-${idx}`}
                              onBatchTranslate={() =>
                                handleBatchTranslate(
                                  `faq-${idx}`,
                                  {
                                    question: item.question.fa,
                                    answer: item.answer.fa,
                                  },
                                  (en, ps) => {
                                    const updated = [...faq];
                                    updated[idx] = {
                                      ...updated[idx],
                                      question: { ...updated[idx].question, en: en.question || updated[idx].question.en, ps: ps.question || updated[idx].question.ps },
                                      answer: { ...updated[idx].answer, en: en.answer || updated[idx].answer.en, ps: ps.answer || updated[idx].answer.ps },
                                    };
                                    setFaq(updated);
                                  }
                                )
                              }
                              headerActions={
                                <div className="flex items-center gap-2">
                                  <DragHandle dragHandleProps={dragHandleProps} />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFaq(item.id)}
                                    className="text-rose-500 hover:bg-rose-500/10 h-8 px-2 rounded-xl text-xs"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              }
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-border">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={item.isActive !== false}
                                      onCheckedChange={(checked) => {
                                        const updated = [...faq];
                                        updated[idx].isActive = checked;
                                        setFaq(updated);
                                      }}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {item.isActive !== false ? 'فعال در نمایش سایت' : 'غیرفعال'}
                                    </span>
                                  </div>
                                </div>

                                <MultilingualInput
                                  label="متن پرسش"
                                  value={item.question}
                                  onChange={(val) => {
                                    const updated = [...faq];
                                    updated[idx].question = toTrilingual(val);
                                    setFaq(updated);
                                  }}
                                />

                                <MultilingualTextarea
                                  label="پاسخ کامل"
                                  value={item.answer}
                                  onChange={(val) => {
                                    const updated = [...faq];
                                    updated[idx].answer = toTrilingual(val);
                                    setFaq(updated);
                                  }}
                                  rows={3}
                                />
                              </div>
                            </CollapsibleSection>
                          )}
                        </SortableItem>
                      ))}
                    </SortableList>
                  </div>
                )}

                {/* 2.3 BLOG TAB (Accordion Form - Default Closed) */}
                {pagesTab === 'blog' && (
                  <CollapsibleSection
                    title="هدر و معرفی وبلاگ پلتفرم"
                    subtitle="تیتر، نشان و راهنمای خوانندگان در صفحه وبلاگ با ترجمه یکپارچه"
                    icon={BookOpen}
                    badge="وبلاگ"
                    defaultOpen={false}
                    isTranslating={translatingSection === 'blog'}
                    onBatchTranslate={() =>
                      handleBatchTranslate(
                        'blog',
                        {
                          badge: blogCms.badge?.fa || '',
                          title: blogCms.title?.fa || '',
                          subtitle: blogCms.subtitle?.fa || '',
                        },
                        (en, ps) => {
                          setBlogCms((prev) => ({
                            ...prev,
                            badge: { ...prev.badge, en: en.badge || prev.badge?.en || '', ps: ps.badge || prev.badge?.ps || '' },
                            title: { ...prev.title, en: en.title || prev.title?.en || '', ps: ps.title || prev.title?.ps || '' },
                            subtitle: { ...prev.subtitle, en: en.subtitle || prev.subtitle?.en || '', ps: ps.subtitle || prev.subtitle?.ps || '' },
                          }));
                        }
                      )
                    }
                    headerActions={
                      <Link href="/admin/cms/blog">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 rounded-xl border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>مدیریت نوشته‌ها</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    }
                  >
                    <div className="space-y-4">
                      <MultilingualInput
                        label="نشانک بالای وبلاگ (Badge)"
                        value={blogCms.badge || { fa: 'وبلاگ آریا لینک', en: 'Arya Link Blog', ps: 'د آریا لینک وېبلاګ' }}
                        onChange={(val) => setBlogCms({ ...blogCms, badge: toTrilingual(val) })}
                      />
                      <MultilingualInput
                        label="عنوان اصلی وبلاگ"
                        value={blogCms.title || { fa: 'تازه ترین مقالات و اخبار تکنولوژی', en: 'Latest Articles & Tech News', ps: 'تازه لیکنې او تخنیکي خبرونه' }}
                        onChange={(val) => setBlogCms({ ...blogCms, title: toTrilingual(val) })}
                      />
                      <MultilingualTextarea
                        label="توضیحات و راهنمای خوانندگان"
                        value={blogCms.subtitle || { fa: 'آموزش‌های کاربردی در زمینه کارت ویزیت هوشمند، شبکه‌سازی سازمانی و هویت دیجیتال.', en: 'Practical guides on smart business cards and digital identity.', ps: 'د سمارټ وېزټ کارتونو او ډیجیټل هویت په اړه لارښوونې.' }}
                        onChange={(val) => setBlogCms({ ...blogCms, subtitle: toTrilingual(val) })}
                        rows={3}
                      />
                    </div>
                  </CollapsibleSection>
                )}
              </div>
            </>
          )}

          {/* ========================================================
              CATEGORY 3: برندینگ و سئو (Branding & SEO)
          ======================================================== */}
          {activeCategory === 'branding_seo' && (
            <>
              {/* Sticky Tabs List */}
              <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border pb-2 pt-4 flex flex-wrap gap-1.5 p-1.5 rounded-2xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setBrandingSeoTab('general_info')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${brandingSeoTab === 'general_info'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>اطلاعات عمومی و لوگوها</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrandingSeoTab('social_networks')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${brandingSeoTab === 'social_networks'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>شبکه‌های ارتباطی و تماس</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrandingSeoTab('footer_legal')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${brandingSeoTab === 'footer_legal'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>فوتر و متن‌های حقوقی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrandingSeoTab('seo_metadata')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${brandingSeoTab === 'seo_metadata'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>سئو و متادیتا (SEO)</span>
                </button>
              </div>

              {/* Form Container with pt-4 scroll-mt-20 */}
              <div className="pt-4 scroll-mt-20 space-y-6">
                {/* 3.1 GENERAL BRANDING & LOGOS (Accordion Form - Default Closed) */}
                {brandingSeoTab === 'general_info' && (
                  <CollapsibleSection
                    title="هویت بصری، لوگوها و نام تجاری"
                    subtitle="آپلود لوگوی رسمی پلتفرم، فاوآیکون تب مرورگر و نام برند آریا لینک"
                    icon={Palette}
                    badge="هویت بصری"
                    defaultOpen={false}
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Platform Logo */}
                        <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border border-border">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-foreground">
                              لوگوی اصلی پلتفرم (Platform Main Logo)
                            </label>
                            {systemSettings.platformMainLogo && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSystemSettings({ ...systemSettings, platformMainLogo: '' })}
                                className="text-xs text-rose-500 hover:bg-rose-500/10 h-7 px-2 rounded-xl"
                              >
                                حذف لوگو
                              </Button>
                            )}
                          </div>
                          <FileUploader
                            value={systemSettings.platformMainLogo}
                            onChange={(url) => setSystemSettings({ ...systemSettings, platformMainLogo: url })}
                            folder="branding"
                          />
                        </div>

                        {/* Favicon */}
                        <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border border-border">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-foreground">
                              فاوآیکون تب مرورگر (Favicon)
                            </label>
                            {systemSettings.platformFavicon && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSystemSettings({ ...systemSettings, platformFavicon: '' })}
                                className="text-xs text-rose-500 hover:bg-rose-500/10 h-7 px-2 rounded-xl"
                              >
                                حذف فاوآیکون
                              </Button>
                            )}
                          </div>
                          <FileUploader
                            value={systemSettings.platformFavicon}
                            onChange={(url) => setSystemSettings({ ...systemSettings, platformFavicon: url })}
                            folder="branding"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-foreground">نام برند تجاری (Site Name)</label>
                            <AiFieldRefineButton
                              currentText={siteName}
                              fieldLabel="نام برند تجاری"
                              lang="da"
                              onApply={(val) => setSiteName(val)}
                              compact
                            />
                          </div>
                          <Input
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value)}
                            className="rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-foreground">شعار برند پلتفرم</label>
                            <AiFieldRefineButton
                              currentText={siteDescription}
                              fieldLabel="شعار برند"
                              lang="da"
                              onApply={(val) => setSiteDescription(val)}
                              compact
                            />
                          </div>
                          <Input
                            value={siteDescription}
                            onChange={(e) => setSiteDescription(e.target.value)}
                            className="rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* 3.2 SOCIAL NETWORKS & CONTACT (Accordion Form - Default Closed) */}
                {brandingSeoTab === 'social_networks' && (
                  <CollapsibleSection
                    title="راه‌های ارتباطی و شبکه‌های اجتماعی"
                    subtitle="پیوندهای شبکه‌های اجتماعی، شماره تماس، ایمیل و نشانی دفتر با ترجمه یکپارچه"
                    icon={Share2}
                    badge="ارتباطات"
                    defaultOpen={false}
                    isTranslating={translatingSection === 'social_networks'}
                    onBatchTranslate={() =>
                      handleBatchTranslate(
                        'social_networks',
                        {
                          address: footer.address.fa,
                          workingHours: footer.workingHours.fa,
                        },
                        (en, ps) => {
                          setFooter((prev) => ({
                            ...prev,
                            address: { ...prev.address, en: en.address || prev.address.en, ps: ps.address || prev.address.ps },
                            workingHours: { ...prev.workingHours, en: en.workingHours || prev.workingHours.en, ps: ps.workingHours || prev.workingHours.ps },
                          }));
                        }
                      )
                    }
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            اینستاگرام (Instagram URL)
                          </label>
                          <Input
                            value={footer.socialLinks?.instagram || ''}
                            onChange={(e) =>
                              setFooter({
                                ...footer,
                                socialLinks: { ...footer.socialLinks, instagram: e.target.value },
                              })
                            }
                            placeholder="https://instagram.com/aryalink"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            تلگرام (Telegram URL)
                          </label>
                          <Input
                            value={footer.socialLinks?.telegram || ''}
                            onChange={(e) =>
                              setFooter({
                                ...footer,
                                socialLinks: { ...footer.socialLinks, telegram: e.target.value },
                              })
                            }
                            placeholder="https://t.me/aryalink"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            واتساپ پشتیبانی (WhatsApp URL یا شماره)
                          </label>
                          <Input
                            value={footer.socialLinks?.whatsapp || ''}
                            onChange={(e) =>
                              setFooter({
                                ...footer,
                                socialLinks: { ...footer.socialLinks, whatsapp: e.target.value },
                              })
                            }
                            placeholder="https://wa.me/93700000000"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            لینکدین سازمانی (LinkedIn URL)
                          </label>
                          <Input
                            value={footer.socialLinks?.linkedin || ''}
                            onChange={(e) =>
                              setFooter({
                                ...footer,
                                socialLinks: { ...footer.socialLinks, linkedin: e.target.value },
                              })
                            }
                            placeholder="https://linkedin.com/company/aryalink"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            توییتر / اکس (Twitter / X)
                          </label>
                          <Input
                            value={footer.socialLinks?.twitter || ''}
                            onChange={(e) =>
                              setFooter({
                                ...footer,
                                socialLinks: { ...footer.socialLinks, twitter: e.target.value },
                              })
                            }
                            placeholder="https://x.com/aryalink"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            شماره تماس رسمی (تک‌زبانه)
                          </label>
                          <Input
                            value={footer.phone || ''}
                            onChange={(e) => setFooter({ ...footer, phone: e.target.value })}
                            placeholder="+93 70 000 0000"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-foreground block mb-1">
                            ایمیل رسمی پشتیبانی (تک‌زبانه)
                          </label>
                          <Input
                            value={footer.email || ''}
                            onChange={(e) => setFooter({ ...footer, email: e.target.value })}
                            placeholder="support@aryalink.af"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-2 border-t border-border">
                        <MultilingualInput
                          label="نشانی فیزیکی دفتر مرکزی"
                          value={footer.address}
                          onChange={(val) => setFooter({ ...footer, address: toTrilingual(val) })}
                        />
                        <MultilingualInput
                          label="ساعات کاری و پاسخگویی پشتیبانی"
                          value={footer.workingHours}
                          onChange={(val) => setFooter({ ...footer, workingHours: toTrilingual(val) })}
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* 3.3 FOOTER & LEGAL (Accordion Form - Default Closed) */}
                {brandingSeoTab === 'footer_legal' && (
                  <CollapsibleSection
                    title="فوتر و متن‌های حقوقی"
                    subtitle="بیوگرافی انتهای صفحات، حق کپی‌رایت، وضعیت پلتفرم و پیوندهای سریع فوتر"
                    icon={FileText}
                    badge="متون حقوقی فوتر"
                    defaultOpen={false}
                    isTranslating={translatingSection === 'footer_legal'}
                    onBatchTranslate={() =>
                      handleBatchTranslate(
                        'footer_legal',
                        {
                          desc: footer.desc.fa,
                          copyrightText: footer.copyrightText.fa,
                          statusBadgeText: footer.statusBadgeText.fa,
                        },
                        (en, ps) => {
                          setFooter((prev) => ({
                            ...prev,
                            desc: { ...prev.desc, en: en.desc || prev.desc.en, ps: ps.desc || prev.desc.ps },
                            copyrightText: { ...prev.copyrightText, en: en.copyrightText || prev.copyrightText.en, ps: ps.copyrightText || prev.copyrightText.ps },
                            statusBadgeText: { ...prev.statusBadgeText, en: en.statusBadgeText || prev.statusBadgeText.en, ps: ps.statusBadgeText || prev.statusBadgeText.ps },
                          }));
                        }
                      )
                    }
                  >
                    <div className="space-y-4">
                      <MultilingualTextarea
                        label="شرح و بیوگرافی فوتر"
                        value={footer.desc}
                        onChange={(val) => setFooter({ ...footer, desc: toTrilingual(val) })}
                        rows={3}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MultilingualInput
                          label="متن حق نشر و کپی‌رایت"
                          value={footer.copyrightText}
                          onChange={(val) => setFooter({ ...footer, copyrightText: toTrilingual(val) })}
                        />
                        <MultilingualInput
                          label="نشان وضعیت سرور در فوتر"
                          value={footer.statusBadgeText}
                          onChange={(val) => setFooter({ ...footer, statusBadgeText: toTrilingual(val) })}
                        />
                      </div>

                      {/* Quick Links with Drag & Drop */}
                      <div className="pt-4 border-t border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            پیوندهای سریع فوتر (با امکان درگ و تغییر ترتیب)
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddQuickLink}
                            className="h-8 text-xs rounded-xl"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1 text-cyan-500" />
                            افزودن لینک
                          </Button>
                        </div>

                        <SortableList
                          items={quickLinksSortable}
                          onReorder={(reordered) => setFooter({ ...footer, quickLinks: reordered as any })}
                        >
                          {quickLinksSortable.map((link, idx) => (
                            <SortableItem key={link.id} id={link.id}>
                              {({ dragHandleProps }) => (
                                <div className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-2xl bg-muted/30 border border-border">
                                  <DragHandle dragHandleProps={dragHandleProps} />
                                  <div className="flex-1 w-full">
                                    <MultilingualInput
                                      label={`عنوان لینک #${idx + 1}`}
                                      value={link.label}
                                      onChange={(val) => {
                                        const updated = [...(footer.quickLinks || [])];
                                        updated[idx].label = toTrilingual(val);
                                        setFooter({ ...footer, quickLinks: updated });
                                      }}
                                      compact
                                    />
                                  </div>
                                  <div className="w-full sm:w-1/3">
                                    <label className="text-xs font-bold text-foreground block mb-1">
                                      آدرس مقصد (URL)
                                    </label>
                                    <Input
                                      value={link.url}
                                      onChange={(e) => {
                                        const updated = [...(footer.quickLinks || [])];
                                        updated[idx].url = e.target.value;
                                        setFooter({ ...footer, quickLinks: updated });
                                      }}
                                      className="font-mono text-xs rounded-xl"
                                      dir="ltr"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveQuickLink(idx)}
                                    className="text-rose-500 hover:bg-rose-500/10 h-9 w-9 p-0 rounded-xl"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </SortableItem>
                          ))}
                        </SortableList>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* 3.4 SEO & METADATA (Accordion Form - Default Closed) */}
                {brandingSeoTab === 'seo_metadata' && (
                  <CollapsibleSection
                    title="سئو و متادیتا (SEO & Meta Tags)"
                    subtitle="بهینه‌سازی گوگل و پیش‌نمایش کارت اشتراک با ترجمه خودکار متمرکز"
                    icon={Search}
                    badge="موتورهای جستجو"
                    defaultOpen={false}
                    isTranslating={translatingSection === 'seo'}
                    onBatchTranslate={() =>
                      handleBatchTranslate(
                        'seo',
                        {
                          metaTitle: seo.metaTitle?.fa || '',
                          metaDescription: seo.metaDescription?.fa || '',
                          metaKeywords: seo.metaKeywords?.fa || '',
                        },
                        (en, ps) => {
                          setSeo((prev) => ({
                            ...prev,
                            metaTitle: { ...prev.metaTitle, en: en.metaTitle || prev.metaTitle?.en || '', ps: ps.metaTitle || prev.metaTitle?.ps || '' },
                            metaDescription: { ...prev.metaDescription, en: en.metaDescription || prev.metaDescription?.en || '', ps: ps.metaDescription || prev.metaDescription?.ps || '' },
                            metaKeywords: { ...prev.metaKeywords, en: en.metaKeywords || prev.metaKeywords?.en || '', ps: ps.metaKeywords || prev.metaKeywords?.ps || '' },
                          }));
                        }
                      )
                    }
                  >
                    <div className="space-y-4">
                      <MultilingualInput
                        label="عنوان متا (Meta Title)"
                        value={seo.metaTitle || { fa: 'آریا لینک | پیشرفته ترین هویت دیجیتال در افغانستان', en: 'Arya Link | Advanced Digital Identity', ps: 'آریا لینک | په افغانستان کې ترټولو پرمختللی ډیجیټل هویت' }}
                        onChange={(val) => setSeo({ ...seo, metaTitle: toTrilingual(val) })}
                      />

                      <MultilingualTextarea
                        label="توضیحات متا (Meta Description)"
                        value={seo.metaDescription || { fa: 'کارت ویزیت هوشمند NFC، طراحی لندینگ‌پیج شخصی و درگاه لینک‌بایو برای اشخاص، متخصصین و سازمان‌ها در افغانستان.', en: 'NFC smart business cards and bio-links for professionals in Afghanistan.', ps: 'د NFC سمارټ وېزټ کارتونه او په افغانستان کې د اشخاصو او شرکتونو لپاره ډیجیټل حل لارې.' }}
                        onChange={(val) => setSeo({ ...seo, metaDescription: toTrilingual(val) })}
                        rows={3}
                      />

                      <MultilingualInput
                        label="کلمات کلیدی متا (Meta Keywords - جدا شده با کاما)"
                        value={seo.metaKeywords || { fa: 'کارت ویزیت هوشمند, بیولینک افغانستان, ان اف سی, هویت دیجیتال', en: 'smart business card, biolink afghanistan, nfc, digital identity', ps: 'سمارټ ویزټ کارت, بیولینک افغانستان, ډیجیټل هویت' }}
                        onChange={(val) => setSeo({ ...seo, metaKeywords: toTrilingual(val) })}
                      />

                      <div>
                        <label className="text-xs font-bold text-foreground block mb-1">
                          تصویر اشتراک‌گذاری در شبکه‌های اجتماعی (OpenGraph Banner 1200x630)
                        </label>
                        <FileUploader
                          value={seo.ogImage || ''}
                          onChange={(url) => setSeo({ ...seo, ogImage: url })}
                          folder="covers"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                )}
              </div>
            </>
          )}

          {/* ========================================================
              CATEGORY 4: زیرساخت و APIها (Infrastructure & APIs)
          ======================================================== */}
          {activeCategory === 'infra_api' && (
            <>
              {/* Sticky Tabs List */}
              <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border pb-2 pt-4 flex flex-wrap gap-1.5 p-1.5 rounded-2xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setInfraApiTab('ai_keys')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${infraApiTab === 'ai_keys'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>هوش مصنوعی (Groq / Cloudflare)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInfraApiTab('cloud_upload')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${infraApiTab === 'cloud_upload'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>فضای ذخیره‌سازی ابری</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInfraApiTab('security_captcha')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${infraApiTab === 'security_captcha'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>امنیت، کپچا و Rate Limit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInfraApiTab('payment_gateways')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${infraApiTab === 'payment_gateways'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>درگاه پرداخت (HesabPay)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInfraApiTab('telegram_bots')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${infraApiTab === 'telegram_bots'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ربات‌های تلگرام و وب‌هوک</span>
                </button>
              </div>

              {/* Form Container with pt-4 scroll-mt-20 */}
              <div className="pt-4 scroll-mt-20 space-y-6">
                {/* 4.1 AI KEYS (Accordion Form - Default Closed) */}
                {infraApiTab === 'ai_keys' && (
                  <CollapsibleSection
                    title="کلیدهای هوش مصنوعی (Groq AI و Cloudflare کمکی)"
                    subtitle="سیستم کشف خودکار مدل‌های زنده و سوییچ Fallback در هنگام قطعی سرویس"
                    icon={Bot}
                    badge="Dual AI Engine"
                    defaultOpen={false}
                  >
                    <div className="space-y-4">
                      {/* Groq Settings */}
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            موتور اصلی: Groq AI (Ultra Fast)
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Auto Model Discovery Enabled
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">
                              کلید ارتباطی (GROQ API Key)
                            </label>
                            <div className="relative">
                              <Input
                                type={showSecretKeys['groqKey'] ? 'text' : 'password'}
                                value={systemSettings.aiSettings.groqApiKey}
                                onChange={(e) =>
                                  setSystemSettings({
                                    ...systemSettings,
                                    aiSettings: { ...systemSettings.aiSettings, groqApiKey: e.target.value },
                                  })
                                }
                                placeholder="gsk_..."
                                className="font-mono text-xs rounded-xl pr-3 pl-10"
                                dir="ltr"
                              />
                              <button
                                type="button"
                                onClick={() => toggleSecret('groqKey')}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showSecretKeys['groqKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">
                              نام مدل Groq (یا مدل خودکار)
                            </label>
                            <Input
                              value={systemSettings.aiSettings.groqModelName}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  aiSettings: { ...systemSettings.aiSettings, groqModelName: e.target.value },
                                })
                              }
                              placeholder="llama-3.3-70b-versatile"
                              className="font-mono text-xs rounded-xl"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cloudflare Fallback Settings */}
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground flex items-center gap-2">
                            <Cloud className="w-4 h-4 text-cyan-500" />
                            موتور جایگزین کمکی: Cloudflare Workers AI
                          </span>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={systemSettings.aiSettings.isFallbackActive}
                              onCheckedChange={(checked) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  aiSettings: { ...systemSettings.aiSettings, isFallbackActive: checked },
                                })
                              }
                            />
                            <span className="text-xs text-muted-foreground">
                              {systemSettings.aiSettings.isFallbackActive ? 'سوییچ کمکی فعال' : 'غیرفعال'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">
                              شناسه حساب کلودفلر (Account ID)
                            </label>
                            <Input
                              value={systemSettings.aiSettings.cloudflareAccountId}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  aiSettings: { ...systemSettings.aiSettings, cloudflareAccountId: e.target.value },
                                })
                              }
                              placeholder="e.g. 9b8a7c6..."
                              className="font-mono text-xs rounded-xl"
                              dir="ltr"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">
                              توکن دسترسی (API Token)
                            </label>
                            <div className="relative">
                              <Input
                                type={showSecretKeys['cfToken'] ? 'text' : 'password'}
                                value={systemSettings.aiSettings.cloudflareApiToken}
                                onChange={(e) =>
                                  setSystemSettings({
                                    ...systemSettings,
                                    aiSettings: { ...systemSettings.aiSettings, cloudflareApiToken: e.target.value },
                                  })
                                }
                                placeholder="Bearer token..."
                                className="font-mono text-xs rounded-xl pr-3 pl-10"
                                dir="ltr"
                              />
                              <button
                                type="button"
                                onClick={() => toggleSecret('cfToken')}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showSecretKeys['cfToken'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">
                              نام مدل کلودفلر
                            </label>
                            <Input
                              value={systemSettings.aiSettings.cloudflareModelName}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  aiSettings: { ...systemSettings.aiSettings, cloudflareModelName: e.target.value },
                                })
                              }
                              placeholder="@cf/meta/llama-3-8b-instruct"
                              className="font-mono text-xs rounded-xl"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* 4.2 CLOUD UPLOAD (Accordion Form - Default Closed) */}
                {infraApiTab === 'cloud_upload' && (
                  <CollapsibleSection
                    title="فضای ذخیره‌سازی ابری فایل‌ها و تصاویر"
                    subtitle="تنظیمات سرویس‌دهنده آپلود چندرسانه‌ای: Cloudinary، ImageKit یا سرور محلی"
                    icon={Cloud}
                    badge="Media Storage"
                    defaultOpen={false}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-foreground block mb-1">
                          سرویس‌دهنده اصلی ذخیره‌سازی مدیا
                        </label>
                        <select
                          value={systemSettings.cloudStorageSettings.primaryStorage}
                          onChange={(e: any) =>
                            setSystemSettings({
                              ...systemSettings,
                              cloudStorageSettings: {
                                ...systemSettings.cloudStorageSettings,
                                primaryStorage: e.target.value,
                              },
                            })
                          }
                          className="w-full h-11 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="local">سرور محلی پروژه (Local Storage - uploads/)</option>
                          <option value="cloudinary">کلودیناری ابری (Cloudinary CDN)</option>
                          <option value="imagekit">ایمیج‌کیت ابری (ImageKit CDN)</option>
                        </select>
                      </div>

                      {/* Cloudinary credentials */}
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
                        <div className="text-xs font-bold text-foreground">تنظیمات Cloudinary (اختیاری)</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">Cloud Name</label>
                            <Input
                              value={systemSettings.cloudStorageSettings.cloudinaryCloudName}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  cloudStorageSettings: {
                                    ...systemSettings.cloudStorageSettings,
                                    cloudinaryCloudName: e.target.value,
                                  },
                                })
                              }
                              placeholder="my-cloud-name"
                              className="font-mono text-xs rounded-xl"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">API Key</label>
                            <Input
                              value={systemSettings.cloudStorageSettings.cloudinaryApiKey}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  cloudStorageSettings: {
                                    ...systemSettings.cloudStorageSettings,
                                    cloudinaryApiKey: e.target.value,
                                  },
                                })
                              }
                              placeholder="1234567890..."
                              className="font-mono text-xs rounded-xl"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">API Secret</label>
                            <Input
                              type="password"
                              value={systemSettings.cloudStorageSettings.cloudinaryApiSecret}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  cloudStorageSettings: {
                                    ...systemSettings.cloudStorageSettings,
                                    cloudinaryApiSecret: e.target.value,
                                  },
                                })
                              }
                              placeholder="••••••••••••"
                              className="font-mono text-xs rounded-xl"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>

                      {/* ImageKit credentials */}
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
                        <div className="text-xs font-bold text-foreground">تنظیمات ImageKit (اختیاری)</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">Public Key</label>
                            <Input
                              value={systemSettings.cloudStorageSettings.imageKitPublicKey}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  cloudStorageSettings: {
                                    ...systemSettings.cloudStorageSettings,
                                    imageKitPublicKey: e.target.value,
                                  },
                                })
                              }
                              placeholder="public_..."
                              className="font-mono text-xs rounded-xl"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">Private Key</label>
                            <Input
                              type="password"
                              value={systemSettings.cloudStorageSettings.imageKitPrivateKey}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  cloudStorageSettings: {
                                    ...systemSettings.cloudStorageSettings,
                                    imageKitPrivateKey: e.target.value,
                                  },
                                })
                              }
                              placeholder="private_..."
                              className="font-mono text-xs rounded-xl"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground block mb-1">URL Endpoint</label>
                            <Input
                              value={systemSettings.cloudStorageSettings.imageKitUrlEndpoint}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  cloudStorageSettings: {
                                    ...systemSettings.cloudStorageSettings,
                                    imageKitUrlEndpoint: e.target.value,
                                  },
                                })
                              }
                              placeholder="https://ik.imagekit.io/..."
                              className="font-mono text-xs rounded-xl"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* 4.3 SECURITY & CAPTCHA (Accordion Form - Default Closed) */}
                {infraApiTab === 'security_captcha' && (
                  <CollapsibleSection
                    title="امنیت، کپچای نامرئی و مهار حملات (Turnstile & Rate Limit)"
                    subtitle="محافظت از فرم‌های ثبت‌نام، ورود OTP و مهار حملات بروت‌فورس"
                    icon={ShieldCheck}
                    badge="امنیت سیستم"
                    defaultOpen={false}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
                        <div>
                          <div className="text-xs font-bold text-foreground">فعال‌سازی کپچای هوشمند (Cloudflare Turnstile)</div>
                          <div className="text-[11px] text-muted-foreground">
                            بررسی خودکار و بدون مزاحمت انسان بودن کاربر در صفحات ورود و سفارشات.
                          </div>
                        </div>
                        <Switch
                          checked={systemSettings.securitySettings.captchaEnabled}
                          onCheckedChange={(checked) =>
                            setSystemSettings({
                              ...systemSettings,
                              securitySettings: { ...systemSettings.securitySettings, captchaEnabled: checked },
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            کلید عمومی سایت (Turnstile Site Key)
                          </label>
                          <Input
                            value={systemSettings.securitySettings.turnstileSiteKey}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                securitySettings: { ...systemSettings.securitySettings, turnstileSiteKey: e.target.value },
                              })
                            }
                            placeholder="0x4AAAAAA..."
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            کلید محرمانه سمت سرور (Turnstile Secret Key)
                          </label>
                          <div className="relative">
                            <Input
                              type={showSecretKeys['turnstileSecret'] ? 'text' : 'password'}
                              value={systemSettings.securitySettings.turnstileSecretKey}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  securitySettings: { ...systemSettings.securitySettings, turnstileSecretKey: e.target.value },
                                })
                              }
                              placeholder="0x4AAAAAA..."
                              className="font-mono text-xs rounded-xl pr-3 pl-10"
                              dir="ltr"
                            />
                            <button
                              type="button"
                              onClick={() => toggleSecret('turnstileSecret')}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showSecretKeys['turnstileSecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
                        <div>
                          <div className="text-xs font-bold text-foreground">محدودکننده نرخ درخواست آی‌پی (IP Rate Limiting)</div>
                          <div className="text-[11px] text-muted-foreground">
                            جلوگیری از ارسال اسپم و سوءاستفاده از اندپوینت‌های پیامکی و اعتبارسنجی.
                          </div>
                        </div>
                        <Switch
                          checked={systemSettings.securitySettings.ipRateLimitingEnabled}
                          onCheckedChange={(checked) =>
                            setSystemSettings({
                              ...systemSettings,
                              securitySettings: { ...systemSettings.securitySettings, ipRateLimitingEnabled: checked },
                            })
                          }
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* 4.4 PAYMENT GATEWAYS (Accordion Form - Default Closed) */}
                {infraApiTab === 'payment_gateways' && (
                  <CollapsibleSection
                    title="درگاه پرداخت دیجیتال حساب‌پی افغانستان (HesabPay)"
                    subtitle="تنظیمات پذیرندگی مستقیم حساب‌پی برای تسویه آنلاین سفارشات و پلن‌ها"
                    icon={CreditCard}
                    badge="درگاه ملی افغانستان"
                    defaultOpen={false}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
                        <div>
                          <div className="text-xs font-bold text-foreground">فعال‌سازی درگاه پرداخت حساب‌پی در سایت</div>
                          <div className="text-[11px] text-muted-foreground">
                            نمایش گزینه پرداخت آنی با حساب‌پی در مرحله نهایی خرید سبد.
                          </div>
                        </div>
                        <Switch
                          checked={systemSettings.paymentSettings.hesabPayActive}
                          onCheckedChange={(checked) =>
                            setSystemSettings({
                              ...systemSettings,
                              paymentSettings: { ...systemSettings.paymentSettings, hesabPayActive: checked },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
                        <div>
                          <div className="text-xs font-bold text-foreground">حالت شبیه‌ساز تستی (Sandbox Mode)</div>
                          <div className="text-[11px] text-muted-foreground">
                            برای آزمایش پرداخت بدون جابجایی وجه واقعی، این گزینه را فعال نگه دارید.
                          </div>
                        </div>
                        <Switch
                          checked={systemSettings.paymentSettings.hesabPaySandbox}
                          onCheckedChange={(checked) =>
                            setSystemSettings({
                              ...systemSettings,
                              paymentSettings: { ...systemSettings.paymentSettings, hesabPaySandbox: checked },
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            شناسه پذیرنده (Merchant ID)
                          </label>
                          <Input
                            value={systemSettings.paymentSettings.hesabPayMerchantId}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                paymentSettings: { ...systemSettings.paymentSettings, hesabPayMerchantId: e.target.value },
                              })
                            }
                            placeholder="hp_m_..."
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            آدرس اندپوینت سرور حساب‌پی (Endpoint URL)
                          </label>
                          <Input
                            value={systemSettings.paymentSettings.hesabPayEndpoint}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                paymentSettings: { ...systemSettings.paymentSettings, hesabPayEndpoint: e.target.value },
                              })
                            }
                            placeholder="https://api.hesabpay.af/v1"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            کلید ارتباطی (API Key)
                          </label>
                          <Input
                            value={systemSettings.paymentSettings.hesabPayApiKey}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                paymentSettings: { ...systemSettings.paymentSettings, hesabPayApiKey: e.target.value },
                              })
                            }
                            placeholder="hp_k_..."
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            کلید محرمانه (API Secret)
                          </label>
                          <div className="relative">
                            <Input
                              type={showSecretKeys['hesabPaySecret'] ? 'text' : 'password'}
                              value={systemSettings.paymentSettings.hesabPayApiSecret}
                              onChange={(e) =>
                                setSystemSettings({
                                  ...systemSettings,
                                  paymentSettings: { ...systemSettings.paymentSettings, hesabPayApiSecret: e.target.value },
                                })
                              }
                              placeholder="••••••••••••"
                              className="font-mono text-xs rounded-xl pr-3 pl-10"
                              dir="ltr"
                            />
                            <button
                              type="button"
                              onClick={() => toggleSecret('hesabPaySecret')}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showSecretKeys['hesabPaySecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* 4.5 TELEGRAM BOTS (Accordion Form - Default Closed) */}
                {infraApiTab === 'telegram_bots' && (
                  <div className="space-y-6">
                    <TelegramConnectCard
                      mode="admin"
                      onBoundSuccess={(chatId) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          telegramInsightsChatId: chatId,
                          telegramSupportChatId: prev.telegramSupportChatId || chatId,
                          telegramBotsActive: true,
                        }))
                      }
                    />
                    <CollapsibleSection
                      title="ربات‌های تلگرام و وب‌هوک اعلان‌های پلتفرم"
                      subtitle="اتصال به ربات پشتیبانی و ربات گزارشات مدیریتی جهت دریافت آنی رخدادها"
                      icon={Send}
                      badge="وب‌هوک تلگرام"
                      defaultOpen={false}
                    >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
                        <div>
                          <div className="text-xs font-bold text-foreground">فعال‌سازی ارسال اعلان به تلگرام</div>
                          <div className="text-[11px] text-muted-foreground">
                            ربات رسمی تلگرام پیام‌ها را بلافاصله به گروه‌ها یا کانال‌های مشخص‌شده ارسال می‌کند.
                          </div>
                        </div>
                        <Switch
                          checked={systemSettings.telegramBotsActive}
                          onCheckedChange={(checked) =>
                            setSystemSettings({ ...systemSettings, telegramBotsActive: checked })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            آیدی عددی چت پشتیبانی (Support Chat ID)
                          </label>
                          <Input
                            value={systemSettings.telegramSupportChatId}
                            onChange={(e) =>
                              setSystemSettings({ ...systemSettings, telegramSupportChatId: e.target.value })
                            }
                            placeholder="-1001234567890"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            آیدی عددی چت گزارشات و امنیت (Insights Chat ID)
                          </label>
                          <Input
                            value={systemSettings.telegramInsightsChatId}
                            onChange={(e) =>
                              setSystemSettings({ ...systemSettings, telegramInsightsChatId: e.target.value })
                            }
                            placeholder="-1009876543210"
                            className="font-mono text-xs rounded-xl"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
                          <span className="text-xs text-foreground">اعلان ثبت‌نام کاربر جدید</span>
                          <Switch
                            checked={systemSettings.notifyNewUsers}
                            onCheckedChange={(checked) =>
                              setSystemSettings({ ...systemSettings, notifyNewUsers: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
                          <span className="text-xs text-foreground">اعلان ثبت سفارش جدید</span>
                          <Switch
                            checked={systemSettings.notifyOrders}
                            onCheckedChange={(checked) =>
                              setSystemSettings({ ...systemSettings, notifyOrders: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
                          <span className="text-xs text-foreground">اعلان تیکت پشتیبانی جدید</span>
                          <Switch
                            checked={systemSettings.notifySupportTickets}
                            onCheckedChange={(checked) =>
                              setSystemSettings({ ...systemSettings, notifySupportTickets: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
                          <span className="text-xs text-foreground">هشدارهای امنیتی و سیستمی</span>
                          <Switch
                            checked={systemSettings.notifySystemAlerts}
                            onCheckedChange={(checked) =>
                              setSystemSettings({ ...systemSettings, notifySystemAlerts: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================
              BOTTOM STICKY ACTION BAR
          ======================================================== */}
          <div className="sticky bottom-0 z-30 bg-background/95 backdrop-blur border-t border-border p-4 shadow-2xl flex items-center justify-between gap-4 rounded-b-3xl">
            <div className="flex items-center gap-3">
              <Link href="/" target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-xl border-border bg-card text-xs flex items-center gap-1.5 hover:bg-muted"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="hidden sm:inline">مشاهده زنده لندینگ‌پیج</span>
                  <span className="sm:hidden">پیش‌نمایش</span>
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchAllData}
                disabled={isLoading || isSaving}
                className="h-10 px-4 rounded-xl border-border bg-card text-xs flex items-center gap-1.5 hover:bg-muted"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>بازخوانی</span>
              </Button>
            </div>

            <Button
              onClick={handleSaveAll}
              disabled={isSaving || isLoading}
              className="h-11 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره‌سازی...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>ذخیره کلیه تغییرات پلتفرم</span>
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
