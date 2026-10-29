'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { UserProfileSummary } from '@/types/profile.types';
import {
  ChevronDown,
  Plus,
  Check,
  User,
  Building2,
  Sparkles,
  ExternalLink,
  Layers,
  X,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const ProfileSwitcher: React.FC = () => {
  const {
    profile,
    profilesList,
    activeProfileId,
    fetchProfilesList,
    switchProfile,
    createProfile,
    deleteProfile,
    cleanupProfiles,
  } = useEditorStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // New profile form state
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newRoleType, setNewRoleType] = useState<'personal' | 'business' | 'creator'>('business');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch real profiles from MongoDB on mount
  useEffect(() => {
    fetchProfilesList();
  }, [fetchProfilesList]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeProfile: UserProfileSummary = profilesList.find((p) => p.id === activeProfileId) || profilesList[0] || {
    id: profile.id || 'default',
    alias: profile.alias || 'پروفایل من',
    displayName: profile.displayName || 'کارت هوشمند',
    headline: profile.headline,
    avatarUrl: profile.avatarUrl,
    roleType: 'personal',
    isActive: true,
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) {
      setErrorMsg('لطفاً نام نمایشی پروفایل را وارد نمایید.');
      return;
    }

    const cleanAlias = newAlias.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();
    if (!cleanAlias) {
      setErrorMsg('لطفاً یک شناسه آدرس انگلیسی معتبر وارد فرمایید.');
      return;
    }

    if (profilesList.some((p) => p.alias.toLowerCase() === cleanAlias)) {
      setErrorMsg('این شناسه آدرس قبلاً ثبت شده است. لطفاً شناسه دیگری انتخاب کنید.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    const created = await createProfile({
      alias: cleanAlias,
      displayName: newDisplayName.trim(),
      roleType: newRoleType,
    });
    setIsSubmitting(false);

    if (created) {
      setNewDisplayName('');
      setNewAlias('');
      setErrorMsg('');
      setIsCreateModalOpen(false);
      setIsOpen(false);
    } else {
      setErrorMsg('خطا در ساخت پروفایل. لطفاً شناسه آدرس دیگری انتخاب کنید.');
    }
  };

  const getRoleBadge = (roleType?: 'personal' | 'business' | 'creator') => {
    switch (roleType) {
      case 'business':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5" />
            سازمانی
          </span>
        );
      case 'creator':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            تولیدکننده
          </span>
        );
      case 'personal':
      default:
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 flex items-center gap-1">
            <User className="w-2.5 h-2.5" />
            شخصی
          </span>
        );
    }
  };

  return (
    <div className="relative font-sans select-none" ref={dropdownRef} dir="rtl">
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all text-right group max-w-[220px]"
        title="جابجایی بین پروفایل‌ها"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
          {activeProfile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeProfile.avatarUrl} alt={activeProfile.displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{activeProfile.displayName.charAt(0) || 'A'}</span>
          )}
        </div>

        <div className="min-w-0 flex-1 truncate">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
              {activeProfile.displayName}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              <span>پروفایل‌های شما</span>
            </div>
            <span className="text-[10px] font-outfit px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              {profilesList.length} پروفایل
            </span>
          </div>

          {/* Profiles List */}
          <div className="p-2 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
            {profilesList.map((p) => {
              const isSelected = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between gap-2.5 transition-all group ${isSelected
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      switchProfile(p.id);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2.5 overflow-hidden flex-1 text-right"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0 overflow-hidden">
                      {p.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.avatarUrl} alt={p.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{p.displayName.charAt(0) || 'A'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs truncate block">{p.displayName}</span>
                        {getRoleBadge(p.roleType)}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {isSelected ? (
                      <Check className="w-4 h-4 text-cyan-500 shrink-0" />
                    ) : (
                      profilesList.length > 1 && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`آیا از حذف این پروفایل (${p.alias}) اطمینان دارید؟`)) {
                              const ok = await deleteProfile(p.id);
                              if (ok) {
                                toast.success('پروفایل با موفقیت حذف شد.');
                              } else {
                                toast.error('خطا در حذف پروفایل.');
                              }
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-70 group-hover:opacity-100"
                          title="حذف این پروفایل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 space-y-1.5">
            {profilesList.length > 1 && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('آیا مایلید تمام پروفایل‌های تکراری حذف شوند و فقط پروفایل اصلی شما باقی بماند؟')) {
                    const ok = await cleanupProfiles();
                    if (ok) {
                      toast.success('پروفایل‌های تکراری با موفقیت حذف شدند.');
                      setIsOpen(false);
                    }
                  }
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3 h-3" />
                <span>پاکسازی پروفایل‌های تکراری</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setIsCreateModalOpen(true);
                setIsOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ساخت پروفایل جدید</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal for Creating New Profile */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl font-sans"
          dir="rtl"
        >
          <DialogHeader className="text-right pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>مدیریت چند پروفایل (Multi-profile SaaS)</span>
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              ساخت پروفایل دیجیتال جدید
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              یک آدرس و هویت جدید برای کسب‌وکار، برند شخصی یا نمایندگی خود ایجاد نمایید.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNew} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                نام نمایشی پروفایل (شخص یا شرکت)
              </label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="مثال: شرکت بازرگانی آریا یا دکتر علی رحیمی"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:font-sans placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Unique Alias / URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                شناسه آدرس اختصاصی (Alias)
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 overflow-hidden focus-within:border-cyan-500">
                <span className="px-3 py-2 text-xs font-outfit text-slate-400 border-l border-slate-200 dark:border-slate-700 select-none bg-slate-100 dark:bg-slate-800" dir="ltr">
                  aryal.ink/
                </span>
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="my-business"
                  className="w-full bg-transparent border-0 py-2 px-3 text-xs font-outfit text-slate-900 dark:text-white focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                فقط از حروف کوچک انگلیسی، اعداد و خط فاصله استفاده کنید.
              </p>
            </div>

            {/* Profile Role / Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                نوع و کاربرد این پروفایل
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'business', label: 'سازمانی / شرکتی', icon: Building2 },
                  { id: 'personal', label: 'کارت شخصی', icon: User },
                  { id: 'creator', label: 'تولیدکننده محتوا', icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = newRoleType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewRoleType(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال ساخت پروفایل...</span>
                  </>
                ) : (
                  <span>ایجاد و فعال‌سازی پروفایل</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSwitcher;
