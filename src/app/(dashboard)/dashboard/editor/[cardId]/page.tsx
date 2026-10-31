'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Layers,
  Sliders,
  BarChart3,
  ArrowRight,
  Smartphone,
  X,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Copy,
  Menu,
  Globe,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProfileEditor } from '@/components/profile-builder/ProfileEditor/ProfileEditor';
import { LivePreview } from '@/components/profile-builder/LivePreview/LivePreview';
import { CardSettingsPanel } from '@/components/dashboard/CardSettingsPanel';
import { CardAnalyticsPanel } from '@/components/dashboard/CardAnalyticsPanel';
import { useEditorStore } from '@/store/editor-store';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SiteLogo } from '@/components/SiteLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EditorTabType = 'modules' | 'settings' | 'analytics';

interface EditorSidebarItem {
  id: EditorTabType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const editorNavItems: EditorSidebarItem[] = [
  {
    id: 'modules',
    title: 'مدیریت ماژول‌ها',
    subtitle: 'افزودن شبکه‌های اجتماعی، متن و...',
    icon: Layers,
  },
  {
    id: 'settings',
    title: 'تنظیمات، سئو و وایت‌لیبل',
    subtitle: 'سئوی مختص همین لینک',
    icon: Sliders,
  },
  {
    id: 'analytics',
    title: 'آمار و تحلیل',
    subtitle: 'بازدیدهای همین لینک',
    icon: BarChart3,
  },
];

function IsolatedCardEditorInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawCardId = params?.cardId;
  const cardId = Array.isArray(rawCardId) ? rawCardId[0] : rawCardId || '';
  const returnTo = searchParams.get('returnTo');
  const initialTabParam = searchParams.get('tab') as EditorTabType | null;

  const [activeTab, setActiveTab] = useState<EditorTabType>(
    initialTabParam && ['modules', 'settings', 'analytics'].includes(initialTabParam)
      ? initialTabParam
      : 'modules'
  );
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { profile, isLoading, fetchProfileData } = useEditorStore();

  // Load this specific card's data on mount or when cardId changes
  useEffect(() => {
    if (cardId) {
      fetchProfileData(decodeURIComponent(cardId));
    }
  }, [cardId, fetchProfileData]);

  // Sync tab if query param changes
  useEffect(() => {
    if (initialTabParam && ['modules', 'settings', 'analytics'].includes(initialTabParam)) {
      setActiveTab(initialTabParam);
    }
  }, [initialTabParam]);

  const handleCopyCardUrl = () => {
    const alias = profile?.alias || cardId;
    const url = `${window.location.origin}/${alias}`;
    navigator.clipboard.writeText(url);
    toast.success('آدرس لینک کپی شد!', { description: url });
  };

  const renderSidebarContent = (onCloseMobile?: () => void) => (
    <aside className="w-72 h-full flex flex-col bg-card/85 dark:bg-slate-950/90 backdrop-blur-xl border-l border-border select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-border/80 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group"
          onClick={onCloseMobile}
        >
          <SiteLogo
            width={38}
            height={38}
            showText={true}
            showBadge={true}
            badgeText="EDITOR"
            subtitle="محیط ویرایشگر اختصاصی"
          />
        </Link>
        <ThemeToggle />
      </div>

      {/* Top Back to Main Dashboard Button */}
      <div className="p-3 border-b border-border/60">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-muted/60 hover:bg-cyan-500/10 text-foreground hover:text-cyan-600 dark:hover:text-cyan-400 border border-border hover:border-cyan-500/30 text-xs font-bold transition-all group"
        >
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-cyan-500 transition-transform group-hover:translate-x-1" />
            <span>بازگشت به داشبورد اصلی</span>
          </div>
        </Link>
      </div>

      {/* Selected Card Identity Box */}
      <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/25 space-y-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shrink-0 overflow-hidden shadow-md shadow-cyan-500/20">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.displayName?.charAt(0) || 'A'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 text-right">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 block">
              در حال ویرایش لینک:
            </span>
            <h2 className="text-xs font-extrabold text-foreground truncate">
              {profile?.displayName || 'کارت هوشمند'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={handleCopyCardUrl}
            className="flex-1 flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-background/80 hover:bg-background border border-border text-[11px] font-sans text-muted-foreground hover:text-foreground transition-colors truncate"
            dir="ltr"
            title="کپی آدرس لینک"
          >
            <span className="truncate">aryal.ink/{profile?.alias || '...'}</span>
            <Copy className="w-3 h-3 shrink-0 text-cyan-500" />
          </button>

          {profile?.alias && (
            <a
              href={`/${profile.alias}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-colors shrink-0"
              title="مشاهده نسخه زنده"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Dedicated Editor Navigation Tabs (Strictly 3 Items for this Card) */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          تنظیمات اختصاصی این لینک
        </div>

        {editorNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition-all group cursor-pointer text-right',
                isActive
                  ? 'bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-muted-foreground group-hover:text-cyan-500'
                  )}
                />
                <div className="text-right truncate">
                  <span className="block truncate">{item.title}</span>
                  <span
                    className={cn(
                      'text-[10px] block font-normal truncate opacity-85 mt-0.5',
                      isActive ? 'text-white/90' : 'text-muted-foreground'
                    )}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Back to Main Dashboard Footer */}
      <div className="p-4 border-t border-border">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/60"
        >
          <ArrowRight className="w-4 h-4 text-cyan-500" />
          <span>بازگشت به داشبورد اصلی</span>
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background text-foreground overflow-hidden font-sans" dir="rtl">
      {/* Desktop Dedicated Editor Sidebar */}
      <div className="hidden lg:block shrink-0 h-full z-30">
        {renderSidebarContent()}
      </div>

      {/* Mobile Top Header for Editor */}
      <header className="lg:hidden h-14 border-b border-border bg-card/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl border border-border bg-muted/50 text-foreground hover:bg-muted transition-colors"
            aria-label="منوی ویرایشگر"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-extrabold text-foreground truncate max-w-[150px]">
            {profile?.displayName || 'ویرایشگر لینک'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-[11px] font-bold border border-border"
          >
            <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
            <span>داشبورد</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" dir="rtl">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-right duration-200">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute left-3 top-4 p-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground z-20"
              aria-label="بستن منو"
            >
              <X className="w-4 h-4" />
            </button>
            {renderSidebarContent(() => setIsMobileSidebarOpen(false))}
          </div>
        </div>
      )}

      {/* Main Isolated Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Return to Order Wizard floating banner if returnTo param is present */}
        {returnTo && (
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold z-30 shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
              <span>در حال ایجاد یا ویرایش لینک جهت اتصال به کارت فیزیکی هوشمند NFC</span>
            </div>
            <Button
              size="sm"
              onClick={() => router.push(returnTo)}
              className="h-8 px-4 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 flex items-center gap-1.5 shadow-sm text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>تأیید و بازگشت به سفارش کارت</span>
            </Button>
          </div>
        )}

        {/* Loading state while switching card */}
        {isLoading && !profile?.id ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <span className="text-xs font-semibold">در حال بارگذاری محیط ویرایشگر لینک...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: مدیریت ماژول‌ها (Profile Editor + Live Phone Preview) */}
            {activeTab === 'modules' && (
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Right/Center Column: Module & Appearance Editor */}
                <div className="w-full lg:w-1/2 xl:w-7/12 h-full overflow-hidden border-b lg:border-b-0 lg:border-l border-border">
                  <ProfileEditor />
                </div>

                {/* Left Column: Real-time Live Phone Simulator (Taklink Inspired Layout) */}
                <div className="w-full lg:w-1/2 xl:w-5/12 h-full overflow-hidden hidden lg:block">
                  <LivePreview />
                </div>

                {/* Mobile Floating Action Button (FAB) for preview */}
                <button
                  type="button"
                  onClick={() => setIsMobilePreviewOpen(true)}
                  className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-2xl shadow-cyan-500/50 flex items-center gap-2 border border-white/20 active:scale-95 transition-all hover:brightness-110"
                  title="مشاهده پیش‌نمایش کارت"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>پیش‌نمایش زنده کارت</span>
                </button>

                {/* Mobile Fullscreen Live Preview Modal */}
                {isMobilePreviewOpen && (
                  <div
                    className="fixed inset-0 z-50 bg-background/95 dark:bg-slate-950/95 backdrop-blur-md flex flex-col lg:hidden animate-in fade-in duration-200"
                    dir="rtl"
                  >
                    <div className="p-3 px-4 border-b border-border bg-card/90 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                        <Smartphone className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                        <span>پیش‌نمایش زنده کارت هوشمند</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMobilePreviewOpen(false)}
                        className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-1.5 border border-border transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>بستن</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-2 flex items-center justify-center">
                      <div className="scale-[0.82] sm:scale-100 origin-center">
                        <LivePreview />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: تنظیمات، سئو و وایت‌لیبل (Isolated to this Card) */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                  <CardSettingsPanel cardId={profile?.id || cardId} />
                </div>
              </div>
            )}

            {/* TAB 3: آمار و تحلیل (Isolated to this Card) */}
            {activeTab === 'analytics' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                  <CardAnalyticsPanel cardId={profile?.id || cardId} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function IsolatedCardEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <IsolatedCardEditorInner />
    </Suspense>
  );
}
