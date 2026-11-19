'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ExternalLink,
  Globe,
  Link2,
  LogIn,
  Plus,
  Sparkles,
  User,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import type { SupportedLanguage } from '@/lib/i18n/types';
import { UserProfileLinkOption, UserProfileOption } from './types';

interface ProfileLinkBinderProps {
  isAuthenticated: boolean;
  isLoadingProfiles: boolean;
  profiles: UserProfileOption[];
  bindingMode: 'profile' | 'manual';
  linkedProfileId: string | null;
  linkedLinkId: string | null;
  onSelectProfile: (profile: UserProfileOption) => void;
  onSelectProfileLink: (profile: UserProfileOption, linkId: string | null) => void;
  onSelectManual: () => void;
  onCreateNewLink: () => void;
  onSignInForProfiles: () => void;
}

const RAW_URI_PATTERN = /^(https?:\/\/|mailto:|tel:|sms:|whatsapp:|tg:|#)/i;

/**
 * Produces a clean, human-readable label for a profile link option,
 * strictly removing raw URLs, mailto:, tel:, or hash prefixes from visible UI text.
 */
function getCleanLinkLabel(
  lnk: UserProfileLinkOption,
  language: SupportedLanguage,
  t: (key: string, fallback?: string) => string
): string {
  const localizedRaw = lnk.titleRaw
    ? getLocalizedText(lnk.titleRaw, language, '')
    : '';
  let candidate = (localizedRaw || lnk.title || '').trim();

  // Strip trailing "— https://...", "- mailto:...", "(tel:...)", or standalone URLs
  candidate = candidate
    .replace(/\s*[—–-]\s*(https?:\/\/|mailto:|tel:|#)\S*/gi, '')
    .replace(/\((https?:\/\/|mailto:|tel:|#)\S*\)/gi, '')
    .trim();

  if (candidate && !RAW_URI_PATTERN.test(candidate)) {
    return candidate;
  }

  // Friendly platform/module fallback when link had no human title
  const urlLower = (lnk.url || '').toLowerCase();
  const modLower = (lnk.moduleType || '').toLowerCase();

  if (urlLower.includes('t.me') || urlLower.includes('telegram') || modLower.includes('telegram')) {
    return t('orderStudio.linkTypeTelegram', 'تلگرام');
  }
  if (urlLower.includes('instagram.com') || modLower.includes('instagram')) {
    return t('orderStudio.linkTypeInstagram', 'اینستاگرام');
  }
  if (urlLower.includes('wa.me') || urlLower.includes('whatsapp') || modLower.includes('whatsapp')) {
    return t('orderStudio.linkTypeWhatsapp', 'واتساپ مستقیم');
  }
  if (urlLower.startsWith('tel:') || modLower.includes('phone') || modLower.includes('call')) {
    return t('orderStudio.linkTypePhone', 'تماس تلفنی');
  }
  if (urlLower.startsWith('mailto:') || modLower.includes('email')) {
    return t('orderStudio.linkTypeEmail', 'ایمیل');
  }
  if (urlLower.includes('linkedin.com') || modLower.includes('linkedin')) {
    return t('orderStudio.linkTypeLinkedin', 'لینکدین');
  }
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return t('orderStudio.linkTypeYoutube', 'یوتیوب');
  }
  if (urlLower.includes('facebook.com')) {
    return t('orderStudio.linkTypeFacebook', 'فیسبوک');
  }
  return t('orderStudio.linkFallbackLabel', 'لینک اختصاصی');
}

interface DestinationOption {
  id: string; // '__profile__' or link.id
  label: string;
  isRecommended?: boolean;
}

export function ProfileLinkBinder({
  isAuthenticated,
  isLoadingProfiles,
  profiles,
  bindingMode,
  linkedProfileId,
  linkedLinkId,
  onSelectProfile,
  onSelectProfileLink,
  onSelectManual,
  onCreateNewLink,
  onSignInForProfiles,
}: ProfileLinkBinderProps) {
  const { language, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedProfile = profiles.find((p) => p.id === linkedProfileId) || null;

  // Build clean, URL-free destination options list (Main Profile Page always first & recommended)
  const destinationOptions: DestinationOption[] = useMemo(() => {
    if (!selectedProfile) return [];
    const base: DestinationOption[] = [
      {
        id: '__profile__',
        label: t('orderStudio.fullProfileLink', 'صفحه اصلی پروفایل'),
        isRecommended: true,
      },
    ];
    const links = Array.isArray(selectedProfile.links) ? selectedProfile.links : [];
    for (const lnk of links) {
      if (!lnk.id) continue;
      // Ignore pure empty/placeholder hash links
      if (lnk.url.trim() === '#') continue;
      base.push({
        id: lnk.id,
        label: getCleanLinkLabel(lnk, language, t),
      });
    }
    return base;
  }, [selectedProfile, language, t]);

  const activeOptionId = linkedLinkId || '__profile__';
  const activeOption =
    destinationOptions.find((o) => o.id === activeOptionId) || destinationOptions[0] || null;

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  // Reset highlighted index when opening
  useEffect(() => {
    if (dropdownOpen) {
      const idx = destinationOptions.findIndex((o) => o.id === activeOptionId);
      setHighlightedIdx(idx >= 0 ? idx : 0);
    }
  }, [dropdownOpen, activeOptionId, destinationOptions]);

  const handleSelectOption = (opt: DestinationOption) => {
    if (!selectedProfile) return;
    onSelectProfileLink(selectedProfile, opt.id === '__profile__' ? null : opt.id);
    setDropdownOpen(false);
    triggerRef.current?.focus();
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev + 1) % Math.max(1, destinationOptions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx(
        (prev) => (prev - 1 + destinationOptions.length) % Math.max(1, destinationOptions.length)
      );
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = destinationOptions[highlightedIdx];
      if (target) handleSelectOption(target);
    }
  };

  return (
    <div className="sub-box">
      <div className="sub-box-head">
        <span className="flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
          <span>{t('orderStudio.bindTitle', 'اتصال به پروفایل / لینک‌های من')}</span>
        </span>
        {isAuthenticated && (
          <button
            type="button"
            onClick={onCreateNewLink}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
            <span>{t('orderStudio.createNewLink', 'ساخت لینک جدید')}</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        {t(
          'orderStudio.bindDesc',
          'با انتخاب هر پروفایل، نام، عنوان وظیفوی، نام برند و کد QR به‌صورت خودکار پر می‌شوند و همچنان می‌توانید متن چاپ‌شده روی کارت را جداگانه ویرایش کنید.'
        )}
      </p>

      {!isAuthenticated ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-2 text-[11px] text-slate-300 min-w-0">
            <User className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
            <span>
              {t(
                'orderStudio.guestBindHint',
                'برای اتصال مستقیم به پروفایل‌های داشبورد وارد حساب خود شوید یا به‌صورت دستی طراحی کنید.'
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={onSignInForProfiles}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('orderStudio.loginToConnect', 'ورود به حساب')}</span>
          </button>
        </div>
      ) : isLoadingProfiles ? (
        <div className="flex items-center gap-2 py-2 text-[11px] text-slate-400">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          <span>{t('orderStudio.loadingProfiles', 'در حال بارگذاری پروفایل‌های شما...')}</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Profile Cards + Manual Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profiles.map((profile) => {
              const isSelected = bindingMode === 'profile' && linkedProfileId === profile.id;
              const labelName =
                getLocalizedText(profile.translations?.[language]?.displayName, language) ||
                profile.displayName ||
                profile.alias;
              const labelRole =
                getLocalizedText(profile.translations?.[language]?.headline, language) ||
                profile.headline ||
                profile.occupation ||
                '';

              return (
                <button
                  key={profile.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setDropdownOpen(false);
                    onSelectProfile(profile);
                  }}
                  className={`p-2.5 rounded-xl border text-start transition-all flex items-center justify-between gap-2.5 cursor-pointer min-w-0 ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 text-white shadow-sm shadow-sky-500/20'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden border border-white/15">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={labelName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        labelName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{labelName}</div>
                      <div className="text-[10px] text-sky-300 truncate font-mono" dir="ltr">
                        aryal.ink/{profile.alias}
                      </div>
                      {labelRole && (
                        <div className="text-[10px] text-slate-400 truncate">{labelRole}</div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-sky-400 bg-sky-400 text-slate-950' : 'border-white/25'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" aria-hidden="true" />}
                  </div>
                </button>
              );
            })}

            {/* Manual Entry Option */}
            <button
              type="button"
              aria-pressed={bindingMode === 'manual'}
              onClick={() => {
                setDropdownOpen(false);
                onSelectManual();
              }}
              className={`p-2.5 rounded-xl border text-start transition-all flex items-center justify-between gap-2.5 cursor-pointer min-w-0 ${
                bindingMode === 'manual'
                  ? 'bg-amber-500/15 border-amber-400 text-white'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {t('orderStudio.manualEntry', 'ورود دستی معلومات')}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {t('orderStudio.manualEntrySub', 'نوشتن دلخواه نام، شرکت و لینک')}
                  </div>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  bindingMode === 'manual'
                    ? 'border-amber-400 bg-amber-400 text-slate-950'
                    : 'border-white/25'
                }`}
              >
                {bindingMode === 'manual' && (
                  <Check className="w-2.5 h-2.5 stroke-[3]" aria-hidden="true" />
                )}
              </div>
            </button>
          </div>

          {/* Custom Accessible Dark-Theme Select Dropdown for NFC & QR Scan Destination */}
          {bindingMode === 'profile' && selectedProfile && activeOption && (
            <div className="field pt-1 w-full max-w-full" ref={dropdownRef}>
              <div className="flex items-center justify-between gap-2">
                <span
                  id="studio-qr-dest-label"
                  className="text-[11.5px] font-semibold text-slate-300"
                >
                  {t('orderStudio.targetQrDestination', 'مقصد اسکن NFC و کد QR:')}
                </span>
                <a
                  href={`/${selectedProfile.alias}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-sky-400 hover:underline inline-flex items-center gap-0.5 shrink-0"
                >
                  <span>{t('orderStudio.previewProfile', 'مشاهده صفحه')}</span>
                  <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                </a>
              </div>

              <div className="relative w-full max-w-full" onKeyDown={handleDropdownKeyDown}>
                <button
                  ref={triggerRef}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                  aria-labelledby="studio-qr-dest-label"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="w-full max-w-full min-h-[42px] px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/15 focus-visible:border-sky-400 text-white text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">{activeOption.label}</span>
                    {activeOption.isRecommended && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                        {t('orderStudio.recommendedBadge', 'پیشنهاد شده')}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-sky-400' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {dropdownOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="studio-qr-dest-label"
                    className="absolute z-40 mt-1.5 inset-x-0 w-full max-w-full max-h-60 overflow-y-auto rounded-xl bg-[#0b1222]/98 backdrop-blur-xl border border-white/15 shadow-2xl p-1 space-y-0.5"
                  >
                    {destinationOptions.map((opt, idx) => {
                      const isSelected = opt.id === activeOptionId;
                      const isHighlighted = idx === highlightedIdx;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setHighlightedIdx(idx)}
                          onClick={() => handleSelectOption(opt)}
                          className={`w-full max-w-full px-3 py-2.5 rounded-lg text-start text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-sky-500/20 text-white font-bold'
                              : isHighlighted
                              ? 'bg-white/10 text-white'
                              : 'text-slate-200 hover:bg-white/[0.07]'
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                            <span className="truncate">{opt.label}</span>
                            {opt.isRecommended && (
                              <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                                {t('orderStudio.recommendedBadge', 'پیشنهاد شده')}
                              </span>
                            )}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileLinkBinder;
