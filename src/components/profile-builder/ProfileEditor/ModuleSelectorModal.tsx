'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useEditorStore } from '@/store/editor-store';
import { useSubscription } from '@/hooks/useSubscription';
import { LinkModuleType } from '@/types/profile.types';
import { MODULE_REGISTRY, ModuleCategoryKey } from '@/lib/constants/moduleRegistry';
import { getModuleIcon } from '@/components/icons/moduleRegistryIcons';
import {
  Instagram,
  Send,
  MapPin,
  Search,
  Sparkles,
  Phone,
  Music,
  ShoppingBag,
  Type,
  Video,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X as CloseIcon,
  Crown,
  Lock,
  CheckCircle2,
  ArrowUpLeft,
} from 'lucide-react';

interface ModuleOption {
  type: LinkModuleType;
  title: string;
  category: ModuleCategoryKey;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  colorClass: string;
}

const SECTION_3_MODULES: ModuleOption[] = MODULE_REGISTRY.map((item) => ({
  type: item.moduleType,
  title: item.title,
  category: item.category,
  description: item.description,
  icon: getModuleIcon(item.moduleType),
  badge: item.badge,
  colorClass: item.colorClass,
}));

const CATEGORIES: {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { id: 'all', title: 'همه ماژول‌ها', description: 'مشاهده کل کاتالوگ ماژول‌ها', icon: Layers, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10' },
  { id: 'social', title: 'شبکه‌های اجتماعی', description: 'اینستاگرام، لینکدین، یوتیوب، توییتر، تیک‌تاک...', icon: Instagram, color: 'text-pink-600 dark:text-pink-400 bg-pink-500/10' },
  { id: 'messengers', title: 'پیام‌رسان‌ها', description: 'واتساپ، تلگرام، بله، ایتا، روبیکا، سیگنال...', icon: Send, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
  { id: 'communication', title: 'تماس و ارتباط', description: 'تماس مستقیم، ایمیل، پیامک، فرم تماس...', icon: Phone, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10' },
  { id: 'audio', title: 'صدا و پادکست', description: 'اسپاتیفای، کست‌باکس، ساندکلاد، رادیوجوان...', icon: Music, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  { id: 'commerce', title: 'فروش و درگاه مالی', description: 'شماره کارت، شبا، درگاه پرداخت، کاتالوگ و منو...', icon: ShoppingBag, color: 'text-green-600 dark:text-green-400 bg-green-500/10' },
  { id: 'media', title: 'رسانه و تصویر', description: 'ویدیو، کانال آپارات، تیزر، گالری تصاویر...', icon: Video, color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
  { id: 'location', title: 'آدرس و نقشه', description: 'لوکیشن گوگل، نشان، بلد، ویز، مسیریابی...', icon: MapPin, color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10' },
  { id: 'text', title: 'متن و چیدمان', description: 'توضیحات متنی، تیتر، خط جداکننده، FAQ...', icon: Type, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10' },
];

interface ModuleSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ModuleSelectorModal: React.FC<ModuleSelectorModalProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter();
  const { addModule } = useEditorStore();
  const { getModuleRequiredPlan, isModuleLockedForUser, refreshModuleAccess } = useSubscription();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'categories' | 'modules'>('categories');
  const [upgradeTargetModule, setUpgradeTargetModule] = useState<ModuleOption | null>(null);

  React.useEffect(() => {
    if (open) {
      setMobileView('categories');
      setSearchQuery('');
      setUpgradeTargetModule(null);
      refreshModuleAccess();
    }
  }, [open, refreshModuleAccess]);

  const handleSelectModule = (mod: ModuleOption) => {
    if (isModuleLockedForUser(mod.type)) {
      setUpgradeTargetModule(mod);
      return;
    }
    addModule(mod.type);
    onOpenChange(false);
  };

  const filteredModules = SECTION_3_MODULES.filter((mod) => {
    const matchesCategory = activeCategory === 'all' || mod.category === activeCategory;
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full h-[100dvh] max-h-none md:max-w-5xl md:h-[85vh] md:max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-slate-100 border-0 md:border md:border-slate-200/80 md:dark:border-slate-800/80 font-sans shadow-2xl rounded-none md:rounded-3xl [&>button]:left-4 [&>button]:right-auto"
        overlayClassName="backdrop-blur-md bg-black/60"
        dir="rtl"
      >
        {/* ===================== DESKTOP VIEW (md:flex) ===================== */}
        <div className="hidden md:flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
            <div>
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>کاتالوگ ماژول‌های هوشمند آریا لینک</span>
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                افزودن ماژول محتوایی به کارت دیجیتال
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ماژول مورد نظر خود را از دسته‌بندی‌های سمت راست انتخاب فرمایید تا فوراً به کارت اضافه شود.
              </DialogDescription>
            </div>

            {/* Desktop Search Bar */}
            <div className="relative w-80 shrink-0 ml-8">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو بین تمام ماژول‌ها..."
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder:font-sans placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* Desktop Body: Right Sidebar + Left Module Grid */}
          <div className="flex flex-1 overflow-hidden">
            {/* RIGHT SIDEBAR: Categories */}
            <div className="w-64 lg:w-72 border-l border-slate-200 dark:border-slate-800 p-3 space-y-1 overflow-y-auto custom-scrollbar bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                دسته‌بندی‌های ماژول
              </div>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = SECTION_3_MODULES.filter((m) => cat.id === 'all' || m.category === cat.id).length;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-right p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2.5 group ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                          isActive
                            ? 'bg-slate-950/15 text-slate-950'
                            : `${cat.color}`
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{cat.title}</span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* LEFT MAIN AREA: Module Grid */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/20 dark:bg-slate-950/30">
              <div className="px-5 py-3 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {searchQuery ? `نتایج جستجو برای "${searchQuery}"` : activeCategoryObj.title}
                </span>
                <span>{filteredModules.length} ماژول آماده انتخاب</span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {filteredModules.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    ماژولی با عبارت جستجو شده پیدا نشد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredModules.map((module) => {
                      const requiredPlan = getModuleRequiredPlan(module.type);
                      const isPremiumMod = requiredPlan !== 'free';
                      const isLockedForUser = isModuleLockedForUser(module.type);
                      return (
                        <button
                          key={module.type}
                          type="button"
                          onClick={() => handleSelectModule(module)}
                          className={`text-right p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 group hover:scale-[1.01] active:scale-[0.99] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm hover:shadow-md ${
                            isLockedForUser
                              ? requiredPlan === 'vip'
                                ? 'border-purple-500/30 hover:border-purple-500/60'
                                : 'border-amber-500/30 hover:border-amber-500/60'
                              : `border-slate-200 dark:border-slate-800 ${module.colorClass}`
                          }`}
                        >
                          <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            {module.icon}
                            {isLockedForUser && (
                              <span
                                className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
                                  requiredPlan === 'vip'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-amber-500 text-slate-950'
                                }`}
                              >
                                <Lock className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate flex items-center gap-1">
                                <span className="truncate">{module.title}</span>
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isPremiumMod && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 shadow-xs ${
                                      requiredPlan === 'vip'
                                        ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                        : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                    }`}
                                  >
                                    <Crown
                                      className={`w-3 h-3 ${
                                        requiredPlan === 'vip'
                                          ? 'text-purple-500 fill-purple-500'
                                          : 'text-amber-500 fill-amber-500'
                                      }`}
                                    />
                                    <span>{requiredPlan === 'vip' ? 'VIP' : 'PRO'}</span>
                                  </span>
                                )}
                                {!isPremiumMod && module.badge && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                                    {module.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                              {module.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===================== MOBILE FULL-SCREEN VIEW (md:hidden) ===================== */}
        <div className="flex md:hidden flex-col h-full overflow-hidden">
          {/* STEP 1: MOBILE CATEGORIES LIST */}
          {mobileView === 'categories' && !searchQuery && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Mobile Category Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">افزودن ماژول جدید</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">یک دسته‌بندی را انتخاب کنید</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Bar */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو بین تمام ماژول‌ها..."
                    className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Categories Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-950">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const count = SECTION_3_MODULES.filter((m) => cat.id === 'all' || m.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setMobileView('modules');
                      }}
                      className="w-full text-right p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3.5 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <div className={`p-2.5 rounded-xl ${cat.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{cat.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {count} ماژول
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{cat.description}</p>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: MOBILE MODULES OF SELECTED CATEGORY (OR SEARCH) */}
          {(mobileView === 'modules' || searchQuery) && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Back Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMobileView('categories');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>بازگشت</span>
                </button>

                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                  {searchQuery ? 'نتایج جستجو' : activeCategoryObj.title}
                </span>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Bar inside modules view */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در این بخش..."
                    className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Modules List for Mobile */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-950">
                {filteredModules.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    ماژولی پیدا نشد.
                  </div>
                ) : (
                  filteredModules.map((module) => {
                    const requiredPlan = getModuleRequiredPlan(module.type);
                    const isPremiumMod = requiredPlan !== 'free';
                    const isLockedForUser = isModuleLockedForUser(module.type);
                    const isVipMod = requiredPlan === 'vip';
                    return (
                      <button
                        key={module.type}
                        type="button"
                        onClick={() => handleSelectModule(module)}
                        className={`w-full text-right p-3.5 rounded-2xl border transition-all flex items-start gap-3 bg-white dark:bg-slate-900 shadow-sm active:scale-[0.98] ${
                          isLockedForUser
                            ? isVipMod
                              ? 'border-purple-500/30 hover:border-purple-500/60'
                              : 'border-amber-500/30 hover:border-amber-500/60'
                            : `border-slate-200 dark:border-slate-800 ${module.colorClass}`
                        }`}
                      >
                        <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                          {module.icon}
                          {isLockedForUser && (
                            <span
                              className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
                                isVipMod ? 'bg-purple-500 text-white' : 'bg-amber-500 text-slate-950'
                              }`}
                            >
                              <Lock className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {module.title}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {isPremiumMod && (
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 shadow-xs ${
                                    isVipMod
                                      ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                      : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  }`}
                                >
                                  <Crown
                                    className={`w-3 h-3 ${
                                      isVipMod ? 'text-purple-500 fill-purple-500' : 'text-amber-500 fill-amber-500'
                                    }`}
                                  />
                                  <span>{isVipMod ? 'VIP' : 'PRO'}</span>
                                </span>
                              )}
                              {!isPremiumMod && module.badge && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                                  {module.badge}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {module.description}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* ===================== UPGRADE TO PRO PAYWALL MODAL ===================== */}
    <Dialog
      open={Boolean(upgradeTargetModule)}
      onOpenChange={(isOpen) => {
        if (!isOpen) setUpgradeTargetModule(null);
      }}
    >
      <DialogContent
        className="max-w-md w-[92vw] rounded-3xl border border-amber-500/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 text-slate-900 dark:text-slate-100 shadow-2xl [&>button]:left-4 [&>button]:right-auto"
        overlayClassName="backdrop-blur-md bg-black/70"
        dir="rtl"
      >
        <DialogHeader className="text-center space-y-3 items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mx-auto">
            <Crown className="w-8 h-8 text-white fill-white" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              <span>امکانات ویژه آریا لینک</span>
            </span>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white pt-1">
              ارتقا به نسخه حرفه‌ای
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2 text-right">
          {upgradeTargetModule && (() => {
            const targetRequiredPlan = getModuleRequiredPlan(upgradeTargetModule.type);
            const targetIsVip = targetRequiredPlan === 'vip';
            return (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-500/20 shrink-0">
                  {upgradeTargetModule.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {upgradeTargetModule.title}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    {targetIsVip
                      ? 'مخصوص کاربران پلن ویژه (VIP)'
                      : 'مخصوص کاربران پلن حرفه‌ای (Pro) و ویژه (VIP)'}
                  </div>
                </div>
              </div>
            );
          })()}

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {upgradeTargetModule && getModuleRequiredPlan(upgradeTargetModule.type) === 'vip'
              ? 'برای استفاده از این قابلیت پیشرفته و امکانات ممتاز آریا لینک، حساب کاربری خود را به پلن ویژه (VIP) ارتقا دهید.'
              : 'برای استفاده از این قابلیت و امکانات نامحدود دیگر مانند دریافت مستقیم پول با حساب‌پی، گالری تصاویر و کاتالوگ حرفه‌ای، حساب کاربری خود را به پلن حرفه‌ای (Pro) ارتقا دهید.'}
          </p>

          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>درگاه پرداخت مستقیم حساب‌پی، حواله و بانک‌های افغانستان</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>فرم تماس آنلاین، کاتالوگ PDF، گالری و اسلایدر تصاویر</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ساخت چندین کارت دیجیتال، حذف برندینگ و آمار پیشرفته NFC</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setUpgradeTargetModule(null);
                onOpenChange(false);
                router.push('/dashboard/upgrade');
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>ارتقای حساب</span>
              <ArrowUpLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setUpgradeTargetModule(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs transition-colors cursor-pointer"
            >
              بعداً یادآوری کن
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
};

export default ModuleSelectorModal;
