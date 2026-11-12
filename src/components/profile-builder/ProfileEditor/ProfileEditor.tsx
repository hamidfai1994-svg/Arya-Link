'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditorStore } from '@/store/editor-store';
import { ProfileThemeConfig, HeaderLayoutType, ProfileLanguage, ProfileType, VerificationData, LinkModuleType, ProfileLinkItem } from '@/types/profile.types';
import { ModuleSelectorModal } from './ModuleSelectorModal';
import { SectionModulesList } from './SectionModulesList';
import { CrmLeadsTable } from './CrmLeadsTable';
import { CardOcrScannerModal, ScannedContactData } from '@/components/common/CardOcrScannerModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileUploader } from '@/components/ui/file-uploader';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { PhoneInput } from '@/components/ui/phone-input';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { PRESET_PATTERNS, PRESET_IMAGES } from '@/lib/backgrounds';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';
import {
  Plus,
  Check,
  Loader2,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  Globe,
  EyeOff,
  Crown,
  Link2,
  Copy,
  CheckCheck,
  ExternalLink,
  Search,
  LogOut,
  LayoutTemplate,
  BadgeCheck,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Building2,
  User,
  Users,
  Mail,
  Settings,
  X,
  Type,
  FolderPlus,
  ChevronDown,
  Undo2,
  Wand2,
  Scan,
  Upload,
  Clipboard,
} from 'lucide-react';

const DEFAULT_PRESET_COLORS = [
  '#0ea5e9', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#ec4899', '#f43f5e', '#10b981',
  '#f59e0b', '#ffffff', '#94a3b8', '#090d16',
];

interface ConfirmableColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  onLiveChange?: (color: string) => void;
  presetColors?: string[];
}

const ConfirmableColorPicker: React.FC<ConfirmableColorPickerProps> = ({
  label,
  value,
  onChange,
  onLiveChange,
  presetColors = DEFAULT_PRESET_COLORS,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tempColor, setTempColor] = useState(value || '#0ea5e9');
  const initialColorRef = useRef<string>(value || '#0ea5e9');
  const prevIsOpenRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When popup opens (false -> true), snapshot the original saved value
  useEffect(() => {
    if (!prevIsOpenRef.current && isOpen) {
      initialColorRef.current = value || '#0ea5e9';
      setTempColor(value || '#0ea5e9');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  const handleOpen = () => {
    initialColorRef.current = value || '#0ea5e9';
    setTempColor(value || '#0ea5e9');
    setIsOpen(true);
  };

  const handleConfirm = () => {
    onChange(tempColor);
    initialColorRef.current = tempColor;
    setIsOpen(false);
  };

  const handleCancel = () => {
    const original = initialColorRef.current;
    setTempColor(original);
    onLiveChange?.(original);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleCancel();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative p-3 rounded-xl border border-border bg-muted/20 space-y-2 ${isOpen ? 'z-20 ring-1 ring-cyan-500/40 shadow-md' : 'z-10'}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-foreground">
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              handleOpen();
            } else {
              handleCancel();
            }
          }}
          className="text-[11px] font-semibold text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
        >
          {isOpen ? 'بستن' : 'تغییر رنگ'}
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleOpen}
          className="w-9 h-9 rounded-xl border border-border shadow-xs shrink-0 cursor-pointer flex items-center justify-center transition-transform active:scale-95 overflow-hidden"
          style={{ backgroundColor: value || '#0ea5e9' }}
          title="کلیک برای انتخاب رنگ"
        />
        <div
          onClick={handleOpen}
          className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-sans text-foreground flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition-colors uppercase select-none"
        >
          <span>{value || '#0ea5e9'}</span>
          <span className="w-2.5 h-2.5 rounded-full border border-border/40" style={{ backgroundColor: value || '#0ea5e9' }} />
        </div>
      </div>

      {isOpen && mounted && createPortal(
        <div
          ref={modalRef}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-card border border-border rounded-2xl p-4 shadow-2xl w-[90%] max-w-xs ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150 space-y-3.5 text-right"
          dir="rtl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-bold text-foreground">انتخاب {label}</span>
            <button
              type="button"
              onClick={handleCancel}
              className="w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-border shadow-xs shrink-0">
              <input
                type="color"
                value={tempColor}
                onChange={(e) => {
                  const newColor = e.target.value;
                  setTempColor(newColor);
                  onLiveChange?.(newColor);
                }}
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
              />
            </div>
            <input
              type="text"
              value={tempColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setTempColor(newColor);
                onLiveChange?.(newColor);
              }}
              placeholder="#000000"
              dir="ltr"
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-sans text-foreground focus:outline-none focus:border-cyan-500 uppercase font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground block font-medium">پالت‌های سریع:</span>
            <div className="flex flex-wrap gap-1.5">
              {presetColors.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    setTempColor(hex);
                    onLiveChange?.(hex);
                  }}
                  className={`w-6 h-6 rounded-lg border transition-transform active:scale-90 cursor-pointer ${tempColor.toLowerCase() === hex.toLowerCase()
                    ? 'ring-2 ring-cyan-500 scale-110 border-white'
                    : 'border-border/60 hover:scale-105'
                    }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>تایید رنگ</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="py-2 px-3.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold border border-border transition-all active:scale-95 cursor-pointer"
            >
              لغو
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const getFontFamilyStyle = (fontKey?: string) => {
  switch (fontKey) {
    case 'vazirmatn':
      return "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    case 'yekan_bakh':
      return "'Yekan Bakh', 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif";
    case 'shabnam':
      return "'Shabnam', 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif";
    case 'sahel':
      return "'Sahel', 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif";
    case 'dana':
      return "'Dana', 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif";
    case 'inter':
      return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    case 'roboto':
      return "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif";
    case 'poppins':
      return "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif";
    case 'outfit':
      return "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif";
    case 'plus_jakarta':
      return "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
    default:
      return fontKey ? `'${fontKey}', sans-serif` : 'inherit';
  }
};

export const ProfileEditor: React.FC = () => {
  const { data: session } = useSession();
  const {
    profile,
    isDirty,
    isSaving,
    isLoading,
    lastSavedAt,
    activeSubTab,
    setActiveSubTab,
    unreadLeadsCount,
    updateBasicInfo,
    setHeaderLayout,
    setProfileLanguage,
    updateTheme,
    setThemePreset,
    toggleDirectMode,
    updateProSettings,
    saveProfileData,
    fetchProfileData,
    fetchProfilesList,
    resetState,
    // KYC & Verification
    setProfileType,
    updateVerificationData,
    submitVerification,
    toggleVerifiedBadge,
    addModule,
    unconfirmedModuleId,
    activeModuleId,
  } = useEditorStore();

  const activeTab = activeSubTab;
  const setActiveTab = setActiveSubTab;
  const isLight = profile.themeConfig?.preset === 'minimal_light';

  // Auto-switch to 'content' tab when a module is activated from Live Preview
  useEffect(() => {
    if (activeModuleId && activeTab !== 'content') {
      setActiveTab('content');
    }
  }, [activeModuleId, activeTab, setActiveTab]);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [isProfileInfoExpanded, setIsProfileInfoExpanded] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // Business Card OCR Scanner States
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrInitialMode, setOcrInitialMode] = useState<'upload' | 'url' | 'clipboard' | 'camera'>('upload');
  const [pastedImageSrc, setPastedImageSrc] = useState<string | null>(null);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);
  const ocrDropdownRef = useRef<HTMLDivElement>(null);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);

  // Close OCR upload dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ocrDropdownRef.current && !ocrDropdownRef.current.contains(event.target as Node)) {
        setIsUploadDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Paste Support for Business Cards (Ctrl+V) when activeTab is 'content'
  useEffect(() => {
    if (activeTab !== 'content') return;

    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              if (base64) {
                setPastedImageSrc(base64);
                setOcrInitialMode('upload');
                setIsOcrOpen(true);
                toast.success('تصویر کارت ویزیت از کلیپ‌بورد دریافت شد و اسکن هوشمند آغاز گردید!');
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [activeTab]);

  const handleOcrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPastedImageSrc(base64);
        setOcrInitialMode('upload');
        setIsOcrOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOcrComplete = (scanned: ScannedContactData) => {
    const newModules: ProfileLinkItem[] = [];
    const timestamp = Date.now();
    let orderIndex = profile.links.length;

    const createModule = (
      moduleType: LinkModuleType,
      title: string,
      url: string,
      metadata: any
    ): ProfileLinkItem => ({
      id: `module_${timestamp}_${Math.random().toString(36).substring(2, 9)}`,
      title,
      url,
      moduleType,
      parentId: null,
      isActive: true,
      isPinned: false,
      order: orderIndex++,
      clickCount: 0,
      metadata,
      advancedSettings: {
        scheduling: { enabled: false, days: [0, 1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '20:00' },
        monetization: { isLocked: false, price: 50, currency: 'AFN', unlockNote: 'برای مشاهده محتوا پرداخت فرمایید.' },
        customStyling: {},
      },
    });

    const contactName = (scanned.basic_info?.name || scanned.name || '').trim();
    const companyName = (scanned.basic_info?.company || scanned.company || '').trim();
    const jobTitle = (scanned.basic_info?.job_title || scanned.job_title || '').trim();

    // 1. Process Dynamic Modules if available
    if (scanned.modules && scanned.modules.length > 0) {
      scanned.modules.forEach((mod) => {
        if (!mod.value || !mod.value.trim()) return;
        const val = mod.value.trim();
        const type = (mod.type || '').toLowerCase();
        const platform = (mod.platform || '').toLowerCase();

        if (type === 'phone' || type === 'telephone' || type === 'mobile') {
          const cleanPhone = val.replace(/\s+/g, '');
          const formattedTel = cleanPhone.startsWith('+')
            ? cleanPhone
            : cleanPhone.startsWith('00')
              ? `+${cleanPhone.slice(2)}`
              : `+${cleanPhone}`;
          newModules.push(
            createModule(
              'phone_call',
              contactName ? `تماس با ${contactName}` : 'تماس تلفنی مستقیم',
              `tel:${formattedTel}`,
              { phoneNumber: cleanPhone }
            )
          );
        } else if (type === 'fax') {
          const cleanFax = val.replace(/\s+/g, '');
          newModules.push(
            createModule(
              'phone_call',
              companyName ? `شماره فکس ${companyName}` : 'شماره فکس',
              `tel:${cleanFax}`,
              { phoneNumber: cleanFax }
            )
          );
        } else if (type === 'email') {
          newModules.push(
            createModule(
              'email_direct',
              contactName ? `ارسال ایمیل به ${contactName}` : 'ارسال ایمیل کاری',
              `mailto:${val}`,
              { emailAddress: val, emailSubject: 'پیام از طریق کارت هوشمند آریا لینک' }
            )
          );
        } else if (type === 'website' || type === 'url' || type === 'link') {
          const webUrl = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
          newModules.push(
            createModule(
              'standard_link',
              companyName ? `وب‌سایت رسمی ${companyName}` : 'وب‌سایت رسمی',
              webUrl,
              {}
            )
          );
        } else if (type === 'address' || type === 'location') {
          const mapQuery = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val)}`;
          newModules.push(
            createModule(
              'location_hours',
              'نشانی و آدرس دفتر',
              mapQuery,
              { address: val, mapLink: mapQuery }
            )
          );
        } else if (type === 'social') {
          const p = platform || (
            val.includes('instagram.com') ? 'instagram' :
              val.includes('t.me') || val.includes('telegram') ? 'telegram' :
                val.includes('wa.me') || val.includes('whatsapp') ? 'whatsapp' :
                  val.includes('linkedin.com') ? 'linkedin' :
                    val.includes('twitter.com') || val.includes('x.com') ? 'twitter' :
                      val.includes('facebook.com') ? 'facebook' :
                        val.includes('youtube.com') ? 'youtube' :
                          val.includes('aparat.com') ? 'aparat' :
                            val.includes('github.com') ? 'github' : ''
          );

          if (p === 'instagram') {
            const igHandle = val.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
            newModules.push(
              createModule('instagram_profile', 'صفحه اینستاگرام', `https://instagram.com/${igHandle}`, { username: igHandle })
            );
          } else if (p === 'telegram') {
            const tgHandle = val.replace(/^@/, '').replace(/^https?:\/\/(www\.)?t\.me\//, '').replace(/\/$/, '');
            newModules.push(
              createModule('telegram_channel', 'کانال یا ارتباط در تلگرام', `https://t.me/${tgHandle}`, { username: tgHandle })
            );
          } else if (p === 'whatsapp') {
            const rawWa = val.replace(/[^0-9]/g, '');
            newModules.push(
              createModule('whatsapp_direct', 'ارتباط در واتساپ', `https://wa.me/${rawWa}`, {
                phoneNumber: `+${rawWa}`,
                prefilledMessage: 'سلام، از طریق کارت هوشمند شما پیام می‌دهم.',
              })
            );
          } else if (p === 'linkedin') {
            const li = val.replace(/^@/, '');
            const liUrl = li.startsWith('http') ? li : `https://linkedin.com/in/${li}`;
            newModules.push(
              createModule('linkedin_profile', 'پروفایل لینکدین', liUrl, { username: li })
            );
          } else if (p === 'twitter' || p === 'x') {
            const tw = val.replace(/^@/, '').replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '').replace(/\/$/, '');
            newModules.push(
              createModule('twitter_x', 'صفحه توییتر / ایکس', `https://x.com/${tw}`, { username: tw })
            );
          } else if (p === 'facebook') {
            const fb = val.startsWith('http') ? val : `https://facebook.com/${val}`;
            newModules.push(
              createModule('facebook', 'صفحه فیسبوک', fb, { username: val })
            );
          } else if (p === 'youtube') {
            const yt = val.replace(/^@/, '').replace(/^https?:\/\/(www\.)?youtube\.com\/@?/, '').replace(/\/$/, '');
            newModules.push(
              createModule('youtube_channel', 'کانال یوتیوب', `https://youtube.com/@${yt}`, { username: yt })
            );
          } else if (p === 'aparat') {
            const ap = val.replace(/^@/, '').replace(/^https?:\/\/(www\.)?aparat\.com\//, '').replace(/\/$/, '');
            newModules.push(
              createModule('aparat_channel', 'کانال آپارات', `https://aparat.com/${ap}`, { username: ap })
            );
          } else if (p === 'github') {
            const gh = val.replace(/^@/, '').replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
            newModules.push(
              createModule('github', 'گیت‌هاب', `https://github.com/${gh}`, { username: gh })
            );
          } else {
            const linkUrl = val.startsWith('http') ? val : `https://${val}`;
            newModules.push(
              createModule('standard_link', mod.label || `شبکه اجتماعی ${platform || ''}`.trim(), linkUrl, {})
            );
          }
        } else {
          // Unknown / generic text / slogan / notes
          newModules.push(
            createModule(
              'simple_text',
              mod.label || 'اطلاعات تکمیلی کارت ویزیت',
              '#text',
              { simpleTextContent: val }
            )
          );
        }
      });
    } else {
      // 2. Fallback to legacy flat fields for backward compatibility
      if (scanned.phone && scanned.phone.trim()) {
        const cleanPhone = scanned.phone.trim().replace(/\s+/g, '');
        const formattedTel = cleanPhone.startsWith('+')
          ? cleanPhone
          : cleanPhone.startsWith('00')
            ? `+${cleanPhone.slice(2)}`
            : `+${cleanPhone}`;
        newModules.push(
          createModule(
            'phone_call',
            scanned.name ? `تماس با ${scanned.name}` : 'تماس تلفنی مستقیم',
            `tel:${formattedTel}`,
            { phoneNumber: cleanPhone }
          )
        );
      }

      if (scanned.email && scanned.email.trim()) {
        const cleanEmail = scanned.email.trim();
        newModules.push(
          createModule(
            'email_direct',
            'ارسال ایمیل کاری',
            `mailto:${cleanEmail}`,
            { emailAddress: cleanEmail, emailSubject: 'پیام از طریق کارت هوشمند آریا لینک' }
          )
        );
      }

      if (scanned.website && scanned.website.trim()) {
        const cleanWeb = scanned.website.trim();
        const webUrl = cleanWeb.startsWith('http://') || cleanWeb.startsWith('https://')
          ? cleanWeb
          : `https://${cleanWeb}`;
        newModules.push(
          createModule(
            'standard_link',
            scanned.company ? `وب‌سایت رسمی ${scanned.company}` : 'وب‌سایت رسمی',
            webUrl,
            {}
          )
        );
      }

      if (scanned.address && scanned.address.trim()) {
        const cleanAddr = scanned.address.trim();
        const mapQuery = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddr)}`;
        newModules.push(
          createModule(
            'location_hours',
            'نشانی و آدرس دفتر',
            mapQuery,
            { address: cleanAddr, mapLink: mapQuery }
          )
        );
      }

      if (scanned.socials) {
        if (scanned.socials.whatsapp && scanned.socials.whatsapp.trim()) {
          const rawWa = scanned.socials.whatsapp.trim().replace(/[^0-9]/g, '');
          newModules.push(
            createModule(
              'whatsapp_direct',
              'ارتباط در واتساپ',
              `https://wa.me/${rawWa}`,
              { phoneNumber: `+${rawWa}`, prefilledMessage: 'سلام، از طریق کارت هوشمند شما پیام می‌دهم.' }
            )
          );
        }

        if (scanned.socials.telegram && scanned.socials.telegram.trim()) {
          const tgHandle = scanned.socials.telegram.trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
          newModules.push(
            createModule(
              'telegram_channel',
              'کانال یا آیدی تلگرام',
              `https://t.me/${tgHandle}`,
              { username: tgHandle }
            )
          );
        }

        if (scanned.socials.instagram && scanned.socials.instagram.trim()) {
          const igHandle = scanned.socials.instagram.trim().replace(/^@/, '').replace(/^https?:\/\/instagram\.com\//, '');
          newModules.push(
            createModule(
              'instagram_profile',
              'صفحه اینستاگرام',
              `https://instagram.com/${igHandle}`,
              { username: igHandle }
            )
          );
        }

        if (scanned.socials.linkedin && scanned.socials.linkedin.trim()) {
          const li = scanned.socials.linkedin.trim();
          const liUrl = li.startsWith('http') ? li : `https://linkedin.com/in/${li.replace(/^@/, '')}`;
          newModules.push(
            createModule(
              'linkedin_profile',
              'پروفایل لینکدین',
              liUrl,
              { username: li }
            )
          );
        }

        if (scanned.socials.twitter && scanned.socials.twitter.trim()) {
          const tw = scanned.socials.twitter.trim().replace(/^@/, '').replace(/^https?:\/\/(twitter|x)\.com\//, '');
          newModules.push(
            createModule(
              'twitter_x',
              'صفحه توییتر / ایکس',
              `https://x.com/${tw}`,
              { username: tw }
            )
          );
        }

        if (scanned.socials.facebook && scanned.socials.facebook.trim()) {
          const fb = scanned.socials.facebook.trim();
          const fbUrl = fb.startsWith('http') ? fb : `https://facebook.com/${fb}`;
          newModules.push(
            createModule(
              'facebook',
              'صفحه فیسبوک',
              fbUrl,
              { username: fb }
            )
          );
        }
      }
    }

    // 3. Fallback if no specific modules were generated
    if (newModules.length === 0) {
      if (contactName || companyName || jobTitle) {
        newModules.push(
          createModule(
            'simple_text',
            'اطلاعات کارت ویزیت',
            '#text',
            { simpleTextContent: `${contactName} - ${jobTitle} (${companyName})`.trim() }
          )
        );
      }
    }

    // Auto-populate profile header if currently empty
    if (!profile.displayName && contactName) {
      updateBasicInfo({ displayName: contactName });
    }
    if (!profile.headline && (jobTitle || companyName)) {
      updateBasicInfo({ headline: [jobTitle, companyName].filter(Boolean).join(' | ') });
    }

    if (newModules.length > 0) {
      useEditorStore.setState((state) => ({
        profile: {
          ...state.profile,
          links: [...newModules, ...state.profile.links],
        },
        isDirty: true,
      }));
      toast.success(`${newModules.length} ماژول جدید با موفقیت از کارت ویزیت استخراج و افزوده شد!`);
    } else {
      toast.warning('اطلاعات قابل تبدیل به ماژول در تصویر کارت ویزیت یافت نشد.');
    }
  };

  // AI Assistant States (Google Gemini 1.5 Flash - Free Tier)
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isAiHeadlineMenuOpen, setIsAiHeadlineMenuOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const aiMenuRef = useRef<HTMLDivElement>(null);
  const aiHeadlineMenuRef = useRef<HTMLDivElement>(null);

  // Close AI dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
        setIsAiMenuOpen(false);
      }
      if (aiHeadlineMenuRef.current && !aiHeadlineMenuRef.current.contains(event.target as Node)) {
        setIsAiHeadlineMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Typewriter effect streaming/typing characters one by one
  const runTypewriter = (text: string, onUpdate: (chunk: string) => void) => {
    let index = 0;
    const intervalMs = 18;
    const timer = setInterval(() => {
      index++;
      onUpdate(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
        setIsAiGenerating(false);
      }
    }, intervalMs);
  };

  const handleAiAction = async (targetField: 'bio' | 'headline', action: 'generate_bio' | 'improve_text') => {
    setIsAiMenuOpen(false);
    setIsAiHeadlineMenuOpen(false);

    const currentText = targetField === 'bio' ? profile.bio : profile.headline;
    if (action === 'improve_text' && (!currentText || !currentText.trim())) {
      toast.error('لطفاً ابتدا متنی بنویسید تا هوش مصنوعی آن را اصلاح کند.');
      return;
    }

    setIsAiGenerating(true);
    toast.info('هوش مصنوعی در حال نگارش متن...', { duration: 2500 });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          action,
          displayName: profile.displayName,
          headline: profile.headline,
          currentText: currentText,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      const outputText = typeof data.data === 'string' ? data.data : (data.data?.text || data.text || '');
      if (data.success && outputText) {
        toast.success('متن هوش مصنوعی آماده شد!');
        runTypewriter(outputText, (chunk) => {
          if (targetField === 'bio') {
            updateBasicInfo({ bio: chunk });
          } else {
            updateBasicInfo({ headline: chunk });
          }
        });
      } else {
        setIsAiGenerating(false);
        toast.error(data.message || 'خطا در ارتباط با هوش مصنوعی.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setIsAiGenerating(false);
      if (err?.name === 'AbortError') {
        toast.error('پاسخ هوش مصنوعی بیش از حد (15 ثانیه) طول کشید. لطفاً دوباره تلاش کنید.');
      } else {
        toast.error('خطای ارتباط با سرور.');
      }
    }
  };

  // Theme snapshot for "لغو تغییرات"
  const themeSnapshotRef = useRef<ProfileThemeConfig | null>(null);

  useEffect(() => {
    if (activeTab === 'appearance') {
      if (!themeSnapshotRef.current && profile.themeConfig) {
        themeSnapshotRef.current = JSON.parse(JSON.stringify(profile.themeConfig));
      }
    } else {
      themeSnapshotRef.current = null;
    }
  }, [activeTab]);

  const handleCancelTheme = () => {
    if (themeSnapshotRef.current) {
      updateTheme(themeSnapshotRef.current);
      toast.info('تغییرات طراحی لغو شد و به حالت ذخیره‌شده بازگشت.');
    } else {
      toast.info('تغییری برای لغو وجود ندارد.');
    }
  };

  const handleSaveTheme = async () => {
    setIsSavingTheme(true);
    const toastId = toast.loading('در حال ذخیره تغییرات تم...');
    try {
      const res = await saveProfileData();
      if (res.success) {
        themeSnapshotRef.current = JSON.parse(JSON.stringify(profile.themeConfig));
        toast.success('تغییرات طراحی و تم با موفقیت ذخیره شد.', { id: toastId });
      } else {
        toast.error(res.message || 'خطا در ذخیره‌سازی تم.', { id: toastId });
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور هنگام ذخیره تم.', { id: toastId });
    } finally {
      setIsSavingTheme(false);
    }
  };

  // Local state for Typography Tab (Fonts & Font Sizes) to decouple from immediate auto-save
  const [localTypography, setLocalTypography] = useState({
    fontFa: profile.themeConfig?.fontFa || 'vazirmatn',
    fontEn: profile.themeConfig?.fontEn || 'inter',
    fontSizeDari: profile.themeConfig?.fontSizeDari || 15,
    fontSizePashto: profile.themeConfig?.fontSizePashto || 15,
    fontSizeEn: profile.themeConfig?.fontSizeEn || 14,
  });

  const typographySnapshotRef = useRef<typeof localTypography | null>(null);

  useEffect(() => {
    if (activeTab === 'fonts') {
      if (!typographySnapshotRef.current) {
        const current = {
          fontFa: profile.themeConfig?.fontFa || 'vazirmatn',
          fontEn: profile.themeConfig?.fontEn || 'inter',
          fontSizeDari: profile.themeConfig?.fontSizeDari || 15,
          fontSizePashto: profile.themeConfig?.fontSizePashto || 15,
          fontSizeEn: profile.themeConfig?.fontSizeEn || 14,
        };
        setLocalTypography(current);
        typographySnapshotRef.current = current;
      }
    } else {
      typographySnapshotRef.current = null;
    }
  }, [activeTab]);

  const handleUpdateTypography = (fields: Partial<typeof localTypography>) => {
    setLocalTypography((prev) => {
      const next = { ...prev, ...fields };
      return next;
    });
    // Real-time UI live preview without triggering auto-save or "در حال ذخیره..." badge
    updateTheme(fields, true);
  };

  const handleOpenAddModule = () => {
    if (unconfirmedModuleId) {
      toast.error('این بخش هنوز تایید نشده است. لطفاً ابتدا تغییرات را تایید یا لغو کنید.');
      return;
    }
    setIsModuleModalOpen(true);
  };

  // Snapshot for Profile Basic Info form so "انصراف" can revert
  const basicInfoSnapshotRef = useRef<any>(null);

  // Stage 59 Auto-save Optimization:
  // Aggressive debounced onChange auto-save is removed to prevent race conditions and sluggishness.
  // Changes in forms are saved strictly when user clicks "تایید" on that module.
  // Drag & Drop operations auto-save immediately on onDragEnd.

  // Smart Language Detection Warning (warns once per session)
  const hasWarnedRef = useRef(false);

  const checkLanguageMismatch = (text: string) => {
    if (!text || text.trim().length < 3 || hasWarnedRef.current) return;

    const currentLang = profile.profileLanguage || 'dari';
    const hasLatin = /[a-zA-Z]/.test(text);
    const hasPersoArabic = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);

    let isMismatch = false;
    let selectedLangName = 'دری';

    if (currentLang === 'dari') {
      selectedLangName = 'دری';
      if (hasLatin && !hasPersoArabic) {
        isMismatch = true;
      }
    } else if (currentLang === 'pashto') {
      selectedLangName = 'پښتو';
      if (hasLatin && !hasPersoArabic) {
        isMismatch = true;
      }
    } else if (currentLang === 'en') {
      selectedLangName = 'English';
      if (hasPersoArabic && !hasLatin) {
        isMismatch = true;
      }
    }

    if (isMismatch) {
      hasWarnedRef.current = true;
      toast.warning(`زبان پروفایل شما ${selectedLangName} است، اما به نظر می‌رسد اطلاعات را به زبان دیگری وارد کرده‌اید.`, {
        description: 'این صرفاً یک هشدار است و مانعی برای ذخیره یا تایپ اطلاعات شما نیست.',
        duration: 6000,
      });
    }
  };

  const handleSubmitKYCDocuments = async () => {
    setIsSubmittingKYC(true);
    const toastId = toast.loading('در حال بارگذاری و ثبت مدارک احراز هویت در دیتابیس...');
    try {
      await submitVerification();
      toast.success('مدارک شما با موفقیت ثبت شد و در صف بررسی ضدجعل قرار گرفت.', {
        id: toastId,
        description: 'نتیجه تایید تیک آبی پس از تطبیق تصویر با مدرک هویتی اعلام خواهد شد.',
        duration: 5000,
      });
    } catch (err) {
      toast.error('خطا در ثبت مدارک', { id: toastId });
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  const profileLang = profile.profileLanguage || 'dari';
  const isLangEn = profileLang === 'en';
  const isLangPs = profileLang === 'pashto';

  const t = {
    contentTab: isLangEn ? 'Content & Modules' : isLangPs ? 'منځپانګه او ماډلونه' : 'محتوا و ماژول‌ها',
    appearanceTab: isLangEn ? 'Design & Theme' : isLangPs ? 'ډیزاین او بڼه' : 'طراحی و تم',
    fontsTab: isLangEn ? 'Fonts' : isLangPs ? 'لیکبڼه' : 'تنظیمات فونت',
    settingsTab: isLangEn ? 'Settings & SEO' : isLangPs ? 'تنظیمات او SEO' : 'تنظیمات، سئو و وایت‌لیبل',
    basicInfo: isLangEn ? 'Profile Identity' : isLangPs ? 'د پروفایل پیژندنه' : 'اطلاعات شناسنامه‌ای پروفایل',
    displayName: isLangEn ? 'Full Name' : isLangPs ? 'بشپړ نوم' : 'نام و تخلص',
    displayNamePlaceholder: isLangEn ? 'e.g. Ahmad Niazi' : isLangPs ? 'مثال: احمد نیازی' : 'مثال: احمد نیازی',
    headline: isLangEn ? 'Job Title / Profession' : isLangPs ? 'دندې سرلیک / مسلک' : 'عنوان شغلی / تخصص',
    headlinePlaceholder: isLangEn ? 'e.g. Senior Marketing Director' : isLangPs ? 'مثال: د بازارموندنې مشر' : 'مثال: مدیر ارشد بازاریابی',
    bio: isLangEn ? 'Short Bio / About' : isLangPs ? 'لنډه پیژندنه' : 'بیوگرافی و معرفی کوتاه',
    bioPlaceholder: isLangEn ? 'Write about your background, company or services...' : isLangPs ? 'د خپلو خدماتو او تجربې په اړه ولیکئ...' : 'درباره خدمات، شرکت یا سوابق کاری خود بنویسید...',
    headerLayout: isLangEn ? 'Header Layout' : isLangPs ? 'د سرپاڼې بڼه' : 'حالت نمایش هدر و چیدمان پروفایل',
    profileSettingsBtn: isLangEn ? 'Profile Settings' : isLangPs ? 'د پروفایل تنظیمات' : 'تنظیمات پروفایل',
    crmTab: isLangEn ? 'Contacts' : isLangPs ? 'مخاطبین' : 'مخاطبین',
  };

  // Only fetch profiles list if no profile is loaded yet
  useEffect(() => {
    if (!profile.id && !profile.alias) {
      fetchProfilesList();
    }
  }, [profile.id, profile.alias, fetchProfilesList]);

  const handleCopyLink = () => {
    const fullUrl = `https://aryal.ink/${profile.alias}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedAlias(true);
    toast.success('لینک پروفایل در کلیپ‌بورد کپی شد!', {
      description: fullUrl,
      duration: 2500,
    });
    setTimeout(() => setCopiedAlias(false), 2000);
  };

  return (
    <div
      className={`flex flex-col h-full bg-card text-foreground border-l border-border w-full shadow-2xl overflow-hidden font-sans transition-all duration-200 ${activeTab === 'crm' ? 'max-w-none' : 'max-w-2xl mx-auto'
        }`}
      dir="rtl"
    >
      {/* Editor Header (Cleaned up, single source of truth for URL in sidebar, no auto-save badge) */}
      <header className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-20 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20 font-sans shrink-0 overflow-hidden">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{profile.displayName?.charAt(0) || 'A'}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-foreground truncate">
                {profile.displayName || 'کارت هوشمند'}
              </span>
              {isSaving && (
                <span className="text-[10px] text-cyan-500 flex items-center gap-1 font-medium animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>در حال ذخیره...</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {profile.headline || 'ویرایشگر کارت دیجیتال و مینی‌سایت'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Link Settings Gear Icon Button */}
          <button
            type="button"
            onClick={() => setIsProfileSettingsOpen(true)}
            className="h-9 px-3 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer text-xs font-semibold"
            title="تنظیمات اختصاصی این لینک"
            aria-label="تنظیمات لینک"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تنظیمات لینک</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs - 4 Builder Sub-Tabs */}
      <div className="flex border-b border-border bg-muted/40 p-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'content'
            ? 'bg-card text-foreground shadow-sm font-bold border border-border'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t.contentTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'appearance'
            ? 'bg-card text-foreground shadow-sm font-bold border border-border'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{t.appearanceTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('fonts')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'fonts'
            ? 'bg-card text-foreground shadow-sm font-bold border border-border text-cyan-600 dark:text-cyan-400'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>{t.fontsTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('crm')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'crm'
            ? 'bg-card text-foreground shadow-sm font-bold border border-border text-cyan-600 dark:text-cyan-400'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="truncate">{t.crmTab}</span>
          {unreadLeadsCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
          )}
        </button>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {/* TAB 1: CONTENT & MODULES */}
        {activeTab === 'content' && (
          <>
            {/* Basic Info & Profile Identity Section (Collapsible with Save & Cancel) */}
            <section className="bg-muted/30 border border-border rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden border border-border bg-card flex items-center justify-center shrink-0 shadow-sm">
                    {profile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-foreground">
                      {profile.displayName || 'نام و هویت تنظیم نشده'}
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {profile.headline || 'عنوان یا تخصص شغلی وارد نشده است'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isProfileInfoExpanded) {
                      basicInfoSnapshotRef.current = JSON.parse(JSON.stringify(profile));
                    }
                    setIsProfileInfoExpanded(!isProfileInfoExpanded);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${isProfileInfoExpanded
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                    : 'bg-card hover:bg-muted border-border text-foreground'
                    }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{isProfileInfoExpanded ? 'بستن فرم' : 'ویرایش اطلاعات پروفایل'}</span>
                </button>
              </div>

              {isProfileInfoExpanded && (
                <div className="pt-3 border-t border-border/80 space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t.displayName}</label>
                      <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => updateBasicInfo({ displayName: e.target.value })}
                        onBlur={(e) => checkLanguageMismatch(e.target.value)}
                        placeholder={t.displayNamePlaceholder}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-muted-foreground">{t.headline}</label>
                        <div className="relative">
                          <button
                            type="button"
                            disabled={isAiGenerating}
                            onClick={() => setIsAiHeadlineMenuOpen(!isAiHeadlineMenuOpen)}
                            className="px-2 py-0.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 text-[10px] font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            title="اصلاح هوشمند عنوان با AI"
                          >
                            <Wand2 className="w-3 h-3 text-cyan-400" />
                            <span>پیشنهاد AI</span>
                          </button>

                          {isAiHeadlineMenuOpen && (
                            <div
                              ref={aiHeadlineMenuRef}
                              className="absolute left-0 top-full mt-1 w-56 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-2xl z-50 p-1 space-y-1 animate-in fade-in"
                            >
                              <button
                                type="button"
                                onClick={() => handleAiAction('headline', 'improve_text')}
                                className="w-full text-right p-2 rounded-lg hover:bg-white/5 text-xs text-slate-200 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>اصلاح و ارتقای نگارش عنوان</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={profile.headline}
                        onChange={(e) => updateBasicInfo({ headline: e.target.value })}
                        onBlur={(e) => checkLanguageMismatch(e.target.value)}
                        placeholder={t.headlinePlaceholder}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Direct Contact: Phone & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">شماره تماس مستقیم</label>
                      <PhoneInput
                        value={profile.phone || ''}
                        onChange={(val) => updateBasicInfo({ phone: val })}
                        placeholder="799 123 456"
                        defaultCountry="AF"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">آدرس ایمیل مستقیم</label>
                      <input
                        type="email"
                        value={profile.email || ''}
                        onChange={(e) => updateBasicInfo({ email: e.target.value })}
                        placeholder="you@domain.com"
                        dir="ltr"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-sans text-left"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-muted-foreground">{t.bio}</label>
                      <div className="relative">
                        <button
                          type="button"
                          disabled={isAiGenerating}
                          onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/15 to-cyan-500/15 hover:from-purple-500/25 hover:to-cyan-500/25 border border-purple-500/30 text-purple-400 hover:text-purple-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          title="دستیار هوش مصنوعی"
                        >
                          {isAiGenerating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                          )}
                          <span>دستیار هوش مصنوعی</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {isAiMenuOpen && (
                          <div
                            ref={aiMenuRef}
                            className="absolute left-0 top-full mt-1.5 w-64 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in"
                          >
                            <button
                              type="button"
                              onClick={() => handleAiAction('bio', 'generate_bio')}
                              className="w-full text-right p-2 rounded-xl hover:bg-white/5 text-xs text-slate-200 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>نوشتن بیوگرافی حرفه‌ای بر اساس عنوان شغلی</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAiAction('bio', 'improve_text')}
                              className="w-full text-right p-2 rounded-xl hover:bg-white/5 text-xs text-slate-200 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Wand2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>اصلاح نگارش متن فعلی</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={profile.bio}
                      onChange={(e) => updateBasicInfo({ bio: e.target.value })}
                      onBlur={(e) => checkLanguageMismatch(e.target.value)}
                      placeholder={t.bioPlaceholder}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none font-sans"
                    />
                  </div>

                  {/* Header Layout Selector */}
                  <div className="pt-2 border-t border-border/80">
                    <label className="block text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                      <LayoutTemplate className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{t.headerLayout}</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Mode 1: Curve */}
                      <button
                        type="button"
                        onClick={() => setHeaderLayout('curve')}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${(profile.headerLayout || 'curve') === 'curve'
                          ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/30'
                          : 'bg-card border-border hover:border-cyan-500/40'
                          }`}
                      >
                        <div className="w-full h-12 rounded-xl bg-slate-900/40 mb-2 relative overflow-hidden flex items-end justify-center">
                          <div
                            className="w-full h-9 bg-gradient-to-r from-blue-600 to-cyan-500 absolute top-0 left-0"
                            style={{ clipPath: 'ellipse(85% 100% at 50% 0%)' }}
                          />
                          <div className="w-6 h-6 rounded-full bg-cyan-400 border-2 border-background relative z-10 -bottom-1 shadow-sm" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">1. منحنی</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                            کاور بالا با لبه قوسی و آواتار دایره‌ای در مرکز روی خط تقاطع
                          </p>
                        </div>
                        {(profile.headerLayout || 'curve') === 'curve' && (
                          <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        )}
                      </button>

                      {/* Mode 2: Gradient Mask */}
                      <button
                        type="button"
                        onClick={() => setHeaderLayout('gradient_mask')}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${profile.headerLayout === 'gradient_mask'
                          ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/30'
                          : 'bg-card border-border hover:border-cyan-500/40'
                          }`}
                      >
                        <div className="w-full h-12 rounded-xl bg-gradient-to-l from-indigo-600 via-cyan-600 to-transparent mb-2 relative p-1.5 flex items-center justify-end">
                          <div className="w-7 h-7 rounded-lg bg-cyan-400 border border-white/50 shadow-sm" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">2. ماسک گرادیانت</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                            کاور مستطیلی محو شونده با آواتار گوشه‌گرد و نام در کنار آن
                          </p>
                        </div>
                        {profile.headerLayout === 'gradient_mask' && (
                          <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        )}
                      </button>

                      {/* Mode 3: Minimal */}
                      <button
                        type="button"
                        onClick={() => setHeaderLayout('minimal')}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${profile.headerLayout === 'minimal'
                          ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/30'
                          : 'bg-card border-border hover:border-cyan-500/40'
                          }`}
                      >
                        <div className="w-full h-12 rounded-xl bg-muted/40 mb-2 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md ring-2 ring-cyan-400/40" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">3. مینیمال</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                            بدون تصویر کاور، فقط عکس پروفایل بزرگ در مرکز
                          </p>
                        </div>
                        {profile.headerLayout === 'minimal' && (
                          <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Uploaders for Avatar & Cover */}
                  <div className={`pt-2 ${profile.headerLayout === 'minimal' ? 'w-full' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
                    <FileUploader
                      value={profile.avatarUrl}
                      onChange={(url) => updateBasicInfo({ avatarUrl: url })}
                      fileType="image"
                      folder="avatars"
                      label="تصویر پروفایل / آواتار"
                      description="فرمت‌های JPG، PNG، WEBP (فشرده‌سازی خودکار تا 2 مگابایت)"
                      maxSizeMB={2}
                      aspectRatio="square"
                      className="w-full"
                    />

                    {profile.headerLayout !== 'minimal' && (
                      <FileUploader
                        value={profile.coverUrl || ''}
                        onChange={(url) => updateBasicInfo({ coverUrl: url })}
                        fileType="image"
                        folder="covers"
                        label="تصویر کاور هدر"
                        description="تصویر بنر بالای پروفایل (حداکثر 2 مگابایت با بهینه‌سازی خودکار)"
                        maxSizeMB={2}
                        aspectRatio="banner"
                        className="w-full"
                      />
                    )}
                  </div>

                  {/* Action Buttons for Profile Info: ذخیره و تایید (سبز) و انصراف (خاکستری/قرمز) */}
                  <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (basicInfoSnapshotRef.current) {
                          resetState(basicInfoSnapshotRef.current);
                        }
                        setIsProfileInfoExpanded(false);
                        toast.info('تغییرات پروفایل نادیده گرفته شد.');
                      }}
                      className="px-4 py-2 rounded-xl bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>انصراف</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const res = await saveProfileData();
                        if (res.success) {
                          toast.success('تنظیمات پروفایل با موفقیت ذخیره شد.');
                          setIsProfileInfoExpanded(false);
                        } else {
                          toast.error(res.message || 'خطا در ذخیره‌سازی.');
                        }
                      }}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>ذخیره و تایید</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Modules List & Add Button */}
            <section className="bg-muted/30 border border-border rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Scan Business Card Button & Dropdown */}
                  <div className="relative" ref={ocrDropdownRef}>
                    <div className="flex items-center rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-slate-900 text-cyan-300 shadow-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setPastedImageSrc(null);
                          setOcrInitialMode('upload');
                          setIsOcrOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/20 transition-all cursor-pointer"
                        title="اسکن هوشمند کارت ویزیت و تبدیل به ماژول (کلید میانبر Ctrl+V)"
                      >
                        <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>اسکن کارت ویزیت</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsUploadDropdownOpen(!isUploadDropdownOpen)}
                        className="px-2 py-1.5 border-r border-cyan-500/30 hover:bg-cyan-500/25 transition-all text-cyan-300 cursor-pointer"
                        title="روش‌های مختلف آپلود عکس"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isUploadDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Upload Dropdown Menu */}
                    {isUploadDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-64 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUploadDropdownOpen(false);
                            ocrFileInputRef.current?.click();
                          }}
                          className="w-full text-right p-2.5 rounded-xl hover:bg-cyan-500/10 text-xs text-slate-200 hover:text-cyan-300 transition-colors flex items-center gap-2.5 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <span className="font-semibold block">1. آپلود از دستگاه</span>
                            <span className="text-[10px] text-slate-400 block font-normal">انتخاب تصویر از گالری/کامپیوتر</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUploadDropdownOpen(false);
                            setPastedImageSrc(null);
                            setOcrInitialMode('url');
                            setIsOcrOpen(true);
                          }}
                          className="w-full text-right p-2.5 rounded-xl hover:bg-purple-500/10 text-xs text-slate-200 hover:text-purple-300 transition-colors flex items-center gap-2.5 cursor-pointer"
                        >
                          <Link2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <div>
                            <span className="font-semibold block">2. جایگذاری لینک عکس</span>
                            <span className="text-[10px] text-slate-400 block font-normal">ورود URL اینترنتی تصویر</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUploadDropdownOpen(false);
                            setPastedImageSrc(null);
                            setOcrInitialMode('clipboard');
                            setIsOcrOpen(true);
                          }}
                          className="w-full text-right p-2.5 rounded-xl hover:bg-emerald-500/10 text-xs text-slate-200 hover:text-emerald-300 transition-colors flex items-center gap-2.5 cursor-pointer"
                        >
                          <Clipboard className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-semibold block">3. خواندن از کلیپ‌بورد</span>
                            <span className="text-[10px] text-slate-400 block font-normal">استخراج مستقیم تصویر کپی‌شده</span>
                          </div>
                        </button>
                      </div>
                    )}

                    <input
                      ref={ocrFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleOcrFileSelect}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (unconfirmedModuleId) {
                        toast.error('این بخش هنوز تایید نشده است. لطفاً ابتدا تغییرات را تایید یا لغو کنید.');
                        return;
                      }
                      addModule('container_group');
                      toast.success('گروه / کانتینر جدید افزوده شد.');
                    }}
                    className="px-3.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-cyan-500/40 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="افزودن کانتینر برای گروه‌بندی ماژول‌ها"
                  >
                    <FolderPlus className="w-4 h-4 text-cyan-500" />
                    <span>افزودن گروه / کانتینر</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddModule}
                    className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن ماژول هوشمند</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Section Modules List */}
              <SectionModulesList />

              {profile.links.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs space-y-2">
                  <p>هنوز ماژولی به کارت خود اضافه نکرده‌اید.</p>
                  <button
                    type="button"
                    onClick={handleOpenAddModule}
                    className="inline-flex items-center gap-1 text-cyan-500 font-bold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    انتخاب اولین ماژول از کاتالوگ
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {/* TAB 2: APPEARANCE & CUSTOMIZATION (ACCORDION) */}
        {activeTab === 'appearance' && (
          <section className="space-y-4">
            {/* Header Action Bar with Manual Save Button */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-500" />
                  طراحی، رنگ‌ها و تم اختصاصی
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  قالب، نوع پس‌زمینه، استایل دکمه‌ها و پالت رنگی کارت خود را تنظیم نمایید.
                </p>
              </div>


            </div>

            <Accordion type="single" collapsible defaultValue="templates" className="space-y-3">
              {/* 1. قالب‌ها (Templates) */}
              <AccordionItem value="templates" className="border border-border rounded-2xl bg-card">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">قالب‌های از پیش آماده</span>
                      <span className="text-[10px] text-muted-foreground block">انتخاب طرح‌های رنگی آماده و مدرن</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {[
                      { id: 'dark_neon', title: 'نئون تاریک', tag: 'رایگان', bg: 'from-slate-950 via-slate-900 to-indigo-950', ring: 'ring-cyan-500', isLight: false },
                      { id: 'glass_morphism', title: 'شیشه‌ای لوکس', tag: 'PRO', bg: 'from-purple-950 via-violet-900 to-slate-950', ring: 'ring-violet-500', isLight: false },
                      { id: 'emerald_luxury', title: 'زمردی شاهانه', tag: 'PRO', bg: 'from-emerald-950 via-teal-900 to-slate-950', ring: 'ring-emerald-500', isLight: false },
                      { id: 'royal_gold', title: 'طلایی لوکس', tag: 'PRO', bg: 'from-amber-950 via-stone-900 to-black', ring: 'ring-amber-500', isLight: false },
                      { id: 'minimal_light', title: 'مینیمال روشن', tag: 'رایگان', bg: 'from-slate-100 via-white to-slate-200', ring: 'ring-sky-500', isLight: true },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setThemePreset(theme.id as ProfileThemeConfig['preset'])}
                        className={`p-3 rounded-2xl border text-right transition-all bg-gradient-to-br ${theme.bg} ${profile.themeConfig.preset === theme.id
                          ? `border-cyan-400 ring-2 ${theme.ring} shadow-lg shadow-cyan-500/10`
                          : 'border-border/80 hover:border-border opacity-70 hover:opacity-100'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold block ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>
                            {theme.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${theme.tag === 'PRO' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {theme.tag}
                          </span>
                        </div>
                        <span className={`text-[10px] block mt-1 ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {profile.themeConfig.preset === theme.id ? '✓ قالب فعال' : 'انتخاب'}
                        </span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. پس‌زمینه (Background - Stage 4) */}
              <AccordionItem value="background" className="border border-border rounded-2xl bg-card">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">پس‌زمینه کارت</span>
                      <span className="text-[10px] text-muted-foreground block">نوع پس‌زمینه (تک‌رنگ، گرادیانت، پترن، تصویر)</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1 space-y-4 overflow-visible">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      حالت پس‌زمینه
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'solid', label: 'تک‌رنگ' },
                        { id: 'gradient', label: 'گرادیانت' },
                        { id: 'pattern', label: 'پترن' },
                        { id: 'image', label: 'تصویر' },
                      ].map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => {
                            let newBg = profile.themeConfig.backgroundColor;
                            const isLgt = profile.themeConfig.preset === 'minimal_light';
                            if (bg.id === 'solid') {
                              newBg = profile.themeConfig.bgSolidColor || (isLgt ? '#f8fafc' : '#090d16');
                            } else if (bg.id === 'gradient') {
                              const cols = profile.themeConfig.bgGradientColors || (isLgt ? ['#f8fafc', '#f1f5f9', '#e2e8f0'] : ['#090d16', '#0f172a', '#1e1b4b']);
                              newBg = `linear-gradient(135deg, ${cols.join(', ')})`;
                            } else if (bg.id === 'pattern' || bg.id === 'image') {
                              newBg = profile.themeConfig.bgSolidColor || (isLgt ? '#f1f5f9' : '#090d16');
                            }
                            updateTheme({ backgroundType: bg.id as any, backgroundColor: newBg });
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${(profile.themeConfig.backgroundType || 'gradient') === bg.id
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                            }`}
                        >
                          {bg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1. SOLID MODE CONTROLS */}
                  {(profile.themeConfig.backgroundType === 'solid') && (
                    <div className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-3">
                      <ConfirmableColorPicker
                        label="رنگ پس‌زمینه یکدست"
                        value={profile.themeConfig.bgSolidColor || (profile.themeConfig.preset === 'minimal_light' ? '#f8fafc' : '#090d16')}
                        onChange={(col) => updateTheme({ bgSolidColor: col, backgroundColor: col })}
                        onLiveChange={(col) => updateTheme({ bgSolidColor: col, backgroundColor: col })}
                      />
                      <span className="text-[11px] text-muted-foreground block">
                        رنگ یکدست و مینیمال برای ایجاد ظاهری ساده و خوانا در تمام دستگاه‌ها.
                      </span>
                    </div>
                  )}

                  {/* 2. GRADIENT MODE CONTROLS */}
                  {((profile.themeConfig.backgroundType || 'gradient') === 'gradient') && (
                    <div className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-4">
                      {/* Linear / Radial Mode Toggle */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">نوع گرادیانت</label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextType = (profile.themeConfig.bgGradientType || 'linear') === 'radial' ? 'linear' : 'radial';
                            const cols = profile.themeConfig.bgGradientColors || ['#090d16', '#0f172a', '#1e1b4b'];
                            const newBg = nextType === 'radial'
                              ? `radial-gradient(circle at center, ${cols.join(', ')})`
                              : `linear-gradient(135deg, ${cols.join(', ')})`;
                            updateTheme({ bgGradientType: nextType, backgroundColor: newBg });
                          }}
                          className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                          <span>
                            {(profile.themeConfig.bgGradientType || 'linear') === 'radial' ? 'شعاعی' : 'خطی'}
                          </span>
                        </button>
                      </div>

                      {/* 2 Color Pickers for Gradient */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ConfirmableColorPicker
                          label="رنگ اول گرادیانت"
                          value={profile.themeConfig.bgGradientColors?.[0] || '#090d16'}
                          onChange={(col) => {
                            const cur = [...(profile.themeConfig.bgGradientColors || ['#090d16', '#0f172a', '#1e1b4b'])];
                            cur[0] = col;
                            const gradType = profile.themeConfig.bgGradientType || 'linear';
                            const newBg = gradType === 'radial'
                              ? `radial-gradient(circle at center, ${cur.join(', ')})`
                              : `linear-gradient(135deg, ${cur.join(', ')})`;
                            updateTheme({ bgGradientColors: cur, backgroundColor: newBg });
                          }}
                          onLiveChange={(col) => {
                            const cur = [...(profile.themeConfig.bgGradientColors || ['#090d16', '#0f172a', '#1e1b4b'])];
                            cur[0] = col;
                            const gradType = profile.themeConfig.bgGradientType || 'linear';
                            const newBg = gradType === 'radial'
                              ? `radial-gradient(circle at center, ${cur.join(', ')})`
                              : `linear-gradient(135deg, ${cur.join(', ')})`;
                            updateTheme({ bgGradientColors: cur, backgroundColor: newBg });
                          }}
                        />
                        <ConfirmableColorPicker
                          label="رنگ دوم گرادیانت"
                          value={profile.themeConfig.bgGradientColors?.[1] || '#1e1b4b'}
                          onChange={(col) => {
                            const cur = [...(profile.themeConfig.bgGradientColors || ['#090d16', '#0f172a', '#1e1b4b'])];
                            cur[1] = col;
                            const gradType = profile.themeConfig.bgGradientType || 'linear';
                            const newBg = gradType === 'radial'
                              ? `radial-gradient(circle at center, ${cur.join(', ')})`
                              : `linear-gradient(135deg, ${cur.join(', ')})`;
                            updateTheme({ bgGradientColors: cur, backgroundColor: newBg });
                          }}
                          onLiveChange={(col) => {
                            const cur = [...(profile.themeConfig.bgGradientColors || ['#090d16', '#0f172a', '#1e1b4b'])];
                            cur[1] = col;
                            const gradType = profile.themeConfig.bgGradientType || 'linear';
                            const newBg = gradType === 'radial'
                              ? `radial-gradient(circle at center, ${cur.join(', ')})`
                              : `linear-gradient(135deg, ${cur.join(', ')})`;
                            updateTheme({ bgGradientColors: cur, backgroundColor: newBg });
                          }}
                        />
                      </div>

                      {/* 4 Quick Ready-Made Multi-Color Gradient Presets */}
                      <div className="space-y-2 pt-1 border-t border-border">
                        <span className="text-xs font-bold text-foreground block">گرادیانت‌های آماده پیشنهادی:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'deep_neon', label: 'شب نئونی', colors: ['#090d16', '#0f172a', '#1e1b4b'] },
                            { id: 'cyber_emerald', label: 'زمرد سایبر', colors: ['#022c22', '#064e3b', '#0891b2'] },
                            { id: 'luxury_purple', label: 'بنفش لوکس', colors: ['#1e1b4b', '#312e81', '#4c1d95'] },
                            { id: 'golden_sunset', label: 'طلایی گرم', colors: ['#451a03', '#78350f', '#b45309'] },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                const gradType = profile.themeConfig.bgGradientType || 'linear';
                                const newBg = gradType === 'radial'
                                  ? `radial-gradient(circle at center, ${item.colors.join(', ')})`
                                  : `linear-gradient(135deg, ${item.colors.join(', ')})`;
                                updateTheme({ bgGradientColors: item.colors, backgroundColor: newBg });
                              }}
                              className="p-2.5 rounded-xl border border-border text-center transition-all hover:scale-105 active:scale-95 shadow-sm text-white flex flex-col items-center gap-1.5 cursor-pointer"
                              style={{
                                background: `linear-gradient(135deg, ${item.colors.join(', ')})`,
                              }}
                            >
                              <span className="text-[11px] font-bold drop-shadow-sm">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Gradient Stop / Dominance Slider */}
                      <div className="space-y-1.5 pt-1 border-t border-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">میزان رنگ غالب:</span>
                          <span className="font-sans font-bold text-cyan-500">
                            {profile.themeConfig.bgGradientPosition ?? 50}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={profile.themeConfig.bgGradientPosition ?? 50}
                          onChange={(e) => updateTheme({ bgGradientPosition: parseInt(e.target.value, 10) })}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. PATTERN MODE CONTROLS */}
                  {(profile.themeConfig.backgroundType === 'pattern') && (
                    <div className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-4">
                      {/* Grid of Preset Patterns */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground block">انتخاب الگوی پترن</label>
                          <span className="text-[10px] text-muted-foreground font-sans">
                            {PRESET_PATTERNS.length} الگوی متنوع
                          </span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar p-1">
                          {PRESET_PATTERNS.map((pattern) => {
                            const isSelected = (profile.themeConfig.bgPatternId || 'dots') === pattern.id;
                            return (
                              <button
                                key={pattern.id}
                                type="button"
                                title={pattern.name}
                                onClick={() => updateTheme({ bgPatternId: pattern.id })}
                                className={`w-full aspect-square rounded-xl border-2 transition-all overflow-hidden cursor-pointer ${isSelected
                                  ? 'border-cyan-500 ring-4 ring-cyan-500/20 shadow-md shadow-cyan-500/30 scale-105'
                                  : 'border-border/60 hover:border-cyan-500/50 hover:scale-105'
                                  }`}
                                style={{
                                  backgroundImage: pattern.cssFunc(isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)', 16),
                                  backgroundSize: '16px 16px',
                                  backgroundColor: isLight ? '#f1f5f9' : '#0f172a',
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Pattern Opacity Slider */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">شفافیت پترن:</span>
                          <span className="font-sans font-bold text-cyan-500">
                            {Math.round((profile.themeConfig.bgPatternOpacity ?? 0.15) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={profile.themeConfig.bgPatternOpacity ?? 0.15}
                          onChange={(e) => updateTheme({ bgPatternOpacity: parseFloat(e.target.value) })}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      {/* Pattern Size Slider */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">اندازه پترن:</span>
                          <span className="font-sans font-bold text-cyan-500">
                            {profile.themeConfig.bgPatternSize ?? 24}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="2"
                          value={profile.themeConfig.bgPatternSize ?? 24}
                          onChange={(e) => updateTheme({ bgPatternSize: parseInt(e.target.value, 10) })}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      {/* Base Background Color for Pattern */}
                      <ConfirmableColorPicker
                        label="رنگ پس‌زمینه زیرین پترن"
                        value={profile.themeConfig.bgSolidColor || '#090d16'}
                        onChange={(col) => updateTheme({ bgSolidColor: col, backgroundColor: col })}
                        onLiveChange={(col) => updateTheme({ bgSolidColor: col, backgroundColor: col })}
                      />
                    </div>
                  )}

                  {/* 4. IMAGE MODE CONTROLS */}
                  {(profile.themeConfig.backgroundType === 'image') && (
                    <div className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-4">
                      {/* FileUploader Component */}
                      <FileUploader
                        value={profile.themeConfig.bgImageUrl || ''}
                        onChange={(url) => updateTheme({ bgImageUrl: url })}
                        fileType="image"
                        folder="branding"
                        label="تصویر اختصاصی پس‌زمینه کارت"
                        description="تصویر دلخواه خود را آپلود کنید یا آدرس آن را وارد نمایید (حداکثر 2MB)."
                        aspectRatio="free"
                      />

                      {/* Ready-made Industry Themed Images */}
                      <div className="space-y-2 pt-1 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground block">تصاویر حرفه‌ای مشاغل:</span>
                          <span className="text-[10px] text-muted-foreground font-sans">
                            {PRESET_IMAGES.length} تصویر باکیفیت
                          </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                          {PRESET_IMAGES.map((item) => {
                            const isSelected = profile.themeConfig.bgImageUrl === item.url;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => updateTheme({ bgImageUrl: item.url })}
                                className={`relative h-20 rounded-xl overflow-hidden border transition-all hover:scale-105 active:scale-95 shadow-sm group cursor-pointer ${isSelected ? 'ring-2 ring-cyan-500 border-white' : 'border-border'
                                  }`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                                <div className={`absolute inset-0 transition-colors flex flex-col justify-end p-1.5 ${isSelected ? 'bg-cyan-950/60' : 'bg-black/50 group-hover:bg-black/30'}`}>
                                  <span className="text-[10px] font-bold text-white text-right truncate drop-shadow-md">{item.title}</span>
                                  <span className="text-[8px] text-cyan-300 font-medium text-right truncate drop-shadow-xs">{item.category}</span>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-xs">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Image Opacity Slider */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">شفافیت تصویر پس‌زمینه:</span>
                          <span className="font-sans font-bold text-cyan-500">
                            {Math.round((profile.themeConfig.bgImageOpacity ?? 0.25) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={profile.themeConfig.bgImageOpacity ?? 0.25}
                          onChange={(e) => updateTheme({ bgImageOpacity: parseFloat(e.target.value) })}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      {/* Base Solid Color under Image */}
                      <ConfirmableColorPicker
                        label="رنگ پس‌زمینه زیرین تصویر"
                        value={profile.themeConfig.bgSolidColor || '#090d16'}
                        onChange={(col) => updateTheme({ bgSolidColor: col, backgroundColor: col })}
                        onLiveChange={(col) => updateTheme({ bgSolidColor: col, backgroundColor: col })}
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* 3. دکمه‌ها (Buttons) */}
              <AccordionItem value="buttons" className="border border-border rounded-2xl bg-card">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">دکمه‌ها و عناصر تعاملی</span>
                      <span className="text-[10px] text-muted-foreground block">تنظیم شکل حاشیه، اندازه، رنگ‌ها و ضخامت دکمه‌ها</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1 space-y-4 overflow-visible">
                  {/* 1. شکل حاشیه دکمه (8 انواع مختلف انحنا و شکل) */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2 flex items-center justify-between">
                      <span>شکل حاشیه دکمه</span>
                      <span className="text-[10px] text-muted-foreground font-sans">8 Shapes</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        {
                          id: 'sharp',
                          label: 'تیز',
                          renderIcon: () => <div className="w-7 h-4 border-2 border-current rounded-none" />,
                        },
                        {
                          id: 'soft',
                          label: 'لبه‌گرد',
                          renderIcon: () => <div className="w-7 h-4 border-2 border-current rounded-[3px]" />,
                        },
                        {
                          id: 'pill',
                          label: 'کپسولی',
                          renderIcon: () => <div className="w-7 h-4 border-2 border-current rounded-full" />,
                        },
                        {
                          id: 'leaf',
                          label: 'برگ',
                          renderIcon: () => <div className="w-7 h-4 border-2 border-current rounded-tr-lg rounded-bl-lg rounded-tl-none rounded-br-none" />,
                        },
                        {
                          id: 'cut_corners',
                          label: 'پخ‌خورده',
                          renderIcon: () => <div className="w-7 h-4 border border-current btn-shape-cut_corners bg-current/25" />,
                        },
                        {
                          id: 'ticket',
                          label: 'تیکت',
                          renderIcon: () => <div className="w-7 h-4 border border-current btn-shape-ticket bg-current/25" />,
                        },
                        {
                          id: 'hexagon',
                          label: 'شش‌ضلعی',
                          renderIcon: () => <div className="w-7 h-4 border border-current btn-shape-hexagon bg-current/25" />,
                        },
                        {
                          id: 'parallelogram_l',
                          label: 'متوازی',
                          renderIcon: () => <div className="w-7 h-4 border border-current btn-shape-parallelogram_l bg-current/25" />,
                        },
                      ].map((item) => {
                        const isSelected = (profile.themeConfig.buttonShape || 'soft') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateTheme({ buttonShape: item.id as any })}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${isSelected
                              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-500 ring-2 ring-cyan-500/30 font-bold shadow-sm'
                              : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70'
                              }`}
                          >
                            <div className="h-5 flex items-center justify-center">{item.renderIcon()}</div>
                            <span className="text-[10px] leading-tight block truncate w-full text-center">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. اندازه دکمه (کوچک، متوسط، بزرگ) */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      اندازه دکمه
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'sm', label: 'کوچک' },
                        { id: 'md', label: 'متوسط' },
                        { id: 'lg', label: 'بزرگ' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateTheme({ buttonSize: s.id as any })}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${(profile.themeConfig.buttonSize || 'md') === s.id
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                            }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. رنگ متن دکمه (Confirmable Color Picker) */}
                  <ConfirmableColorPicker
                    label="رنگ متن دکمه"
                    value={profile.themeConfig.buttonTextColor || '#ffffff'}
                    onChange={(color) => updateTheme({ buttonTextColor: color })}
                    onLiveChange={(color) => updateTheme({ buttonTextColor: color })}
                  />

                  {/* 4. رنگ پس‌زمینه دکمه (Confirmable Color Picker) */}
                  <ConfirmableColorPicker
                    label="رنگ پس زمینه دکمه"
                    value={profile.themeConfig.buttonBgColor || '#0ea5e9'}
                    onChange={(color) => updateTheme({ buttonBgColor: color })}
                    onLiveChange={(color) => updateTheme({ buttonBgColor: color })}
                  />

                  {/* 5. رنگ حاشیه دکمه (Confirmable Color Picker) */}
                  <ConfirmableColorPicker
                    label="رنگ حاشیه دکمه"
                    value={profile.themeConfig.buttonBorderColor || '#38bdf8'}
                    onChange={(color) => updateTheme({ buttonBorderColor: color })}
                    onLiveChange={(color) => updateTheme({ buttonBorderColor: color })}
                  />

                  {/* 6. ضخامت حاشیه دکمه (هیچکدام، نازک، متوسط، ضخیم) */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      ضخامت حاشیه دکمه
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'thick', label: 'ضخیم' },
                        { id: 'medium', label: 'متوسط' },
                        { id: 'thin', label: 'نازک' },
                        { id: 'none', label: 'هیچکدام' },
                      ].map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => updateTheme({ buttonBorderWidth: w.id as any })}
                          className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${(profile.themeConfig.buttonBorderWidth || 'thin') === w.id
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                            }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7. نوع سایه دکمه‌ها */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      نوع سایه دکمه‌ها
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'none', label: 'بدون سایه' },
                        { id: 'sm', label: 'ملایم' },
                        { id: 'md', label: 'عمیق' },
                        { id: 'glow', label: 'نئونی' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateTheme({ buttonShadowStyle: s.id as any })}
                          className={`py-2 px-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${(profile.themeConfig.buttonShadowStyle || 'sm') === s.id
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                            }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. رنگ‌ها (Color Pickers) */}
              <AccordionItem value="colors" className="border border-border rounded-2xl bg-card">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">رنگ‌ها و گرادیانت</span>
                      <span className="text-[10px] text-muted-foreground block">انتخاب پالت رنگی اصلی و متون</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1 space-y-4 overflow-visible">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Primary Color (Confirmable) */}
                    <ConfirmableColorPicker
                      label="رنگ شروع گرادیانت"
                      value={profile.themeConfig.primaryColor || '#06b6d4'}
                      onChange={(color) => updateTheme({ primaryColor: color })}
                      onLiveChange={(color) => updateTheme({ primaryColor: color })}
                    />

                    {/* Accent Color (Confirmable) */}
                    <ConfirmableColorPicker
                      label="رنگ پایان گرادیانت"
                      value={profile.themeConfig.accentColor || '#3b82f6'}
                      onChange={(color) => updateTheme({ accentColor: color })}
                      onLiveChange={(color) => updateTheme({ accentColor: color })}
                    />
                  </div>

                  {/* Gradient Preview Bar */}
                  <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-medium">پیش‌نمایش گرادیانت دکمه:</span>
                    <div
                      className="h-8 flex-1 max-w-xs rounded-xl shadow-sm border border-white/20 flex items-center justify-center text-xs font-bold text-white transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${profile.themeConfig.primaryColor || '#06b6d4'}, ${profile.themeConfig.accentColor || '#3b82f6'})`,
                      }}
                    >
                      نمونه دکمه
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Bottom Action Bar for Tab 2 */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <span className="text-xs text-muted-foreground">
                پس از اعمال تنظیمات طراحی و رنگ‌ها، برای ماندگاری تغییرات کلیک کنید.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCancelTheme}
                  disabled={isSavingTheme}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-background hover:bg-muted border border-border text-muted-foreground hover:text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>لغو تغییرات</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveTheme}
                  disabled={isSavingTheme}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isSavingTheme ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>در حال ذخیره...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>تایید و ذخیره</span>
                    </>
                  )}
                </button>
              </div>
            </div>


          </section>
        )}

        {/* TAB 3: ADVANCED TYPOGRAPHY & FONT SETTINGS (Stage 60 Refactor) */}
        {activeTab === 'fonts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Intro Card */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Type className="w-4 h-4 text-cyan-500" />
                    تنظیمات پیشرفته تایپوگرافی و فونت‌ها
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    فونت و اندازه قلم را برای زبان‌های ملی (دری و پشتو) و زبان انگلیسی انتخاب و مقیاس‌بندی کنید.
                  </p>
                </div>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  پیش‌نمایش بلادرنگ
                </span>
              </div>
            </section>

            {/* 1. FONT SELECTION DROPDOWNS (Dari/Pashto & English) */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  انتخاب قلم و خانواده فونت
                </h3>
                <p className="text-xs text-muted-foreground">
                  فونت متون کارت خود را از میان فونت‌های استاندارد وب انتخاب نمایید.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dari & Pashto Dropdown */}
                <div className="p-4 rounded-2xl border border-border bg-card space-y-2.5">
                  <label className="block text-xs font-bold text-foreground">
                    فونت زبان‌های دری و پشتو
                  </label>
                  <div className="relative">
                    <select
                      value={localTypography.fontFa}
                      onChange={(e) => handleUpdateTypography({ fontFa: e.target.value as any })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 appearance-none font-sans font-medium cursor-pointer shadow-xs transition-colors"
                    >
                      <option value="vazirmatn">وزیرمتن — استاندارد و پیش‌فرض</option>
                      <option value="yekan_bakh">یکان‌بخ — مدرن و هندسی</option>
                      <option value="shabnam">شبنم — رسمی و دلنشین</option>
                      <option value="sahel">ساحل — کلاسیک و آرام</option>
                      <option value="dana">دانا — معاصر و پویا</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    اعمال خودکار بر روی تیترها، بیوگرافی و ماژول‌های دری و پشتو
                  </span>
                </div>

                {/* English Dropdown */}
                <div className="p-4 rounded-2xl border border-border bg-card space-y-2.5">
                  <label className="block text-xs font-bold text-foreground">
                    فونت زبان انگلیسی
                  </label>
                  <div className="relative">
                    <select
                      value={localTypography.fontEn}
                      onChange={(e) => handleUpdateTypography({ fontEn: e.target.value as any })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 appearance-none font-sans font-medium cursor-pointer shadow-xs transition-colors"
                      dir="ltr"
                    >
                      <option value="inter">Inter — Clean & Ultra-Legible (Default)</option>
                      <option value="roboto">Roboto — Modern Google Typography</option>
                      <option value="poppins">Poppins — Geometric & Friendly</option>
                      <option value="outfit">Outfit — Contemporary Brand Display</option>
                      <option value="plus_jakarta">Plus Jakarta Sans — Corporate Tech</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    اعمال بر روی نام‌های کاربری، آی دی‌ها و نمای انگلیسی کارت
                  </span>
                </div>
              </div>
            </section>

            {/* 2. THREE DISTINCT PREVIEW CONTAINERS WITH SLIDERS */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  کانتینرهای پیش‌نمایش مجزا و تنظیم اندازه قلم
                </h3>
                <p className="text-xs text-muted-foreground">
                  پیش‌نمایش زنده هر زبان به همراه اسلایدر اختصاصی برای تنظیم اندازه فونت:
                </p>
              </div>

              {/* Preview Container 1: Dari */}
              <div className="bg-muted/30 border border-border rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">🇦🇫</span>
                    <span className="text-xs font-bold text-foreground">1. کانتینر پیش‌نمایش متن دری</span>
                  </div>
                  <span className="text-[10px] font-sans font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {localTypography.fontFa}
                  </span>
                </div>

                {/* Real-time Render Box */}
                <div
                  className={`p-4 rounded-xl border border-border/80 bg-card shadow-xs space-y-1.5 transition-all font-${localTypography.fontFa}`}
                  data-font={localTypography.fontFa}
                  style={{
                    fontFamily: getFontFamilyStyle(localTypography.fontFa),
                    fontSize: `${localTypography.fontSizeDari}px`,
                  }}
                >
                  <h4
                    className="font-bold text-foreground leading-snug"
                    style={{
                      fontFamily: getFontFamilyStyle(localTypography.fontFa),
                      fontSize: `${Math.round(localTypography.fontSizeDari * 1.05)}px`,
                    }}
                  >
                    کارت هوشمند و لینک‌بایوی دیجیتال آریا لینک
                  </h4>
                  <p
                    className="text-muted-foreground leading-relaxed"
                    style={{
                      fontFamily: getFontFamilyStyle(localTypography.fontFa),
                      fontSize: `${localTypography.fontSizeDari}px`,
                    }}
                  >
                    طراحی مدرن، ارتباط مستقیم و انتقال بدون تماس اطلاعات و شبکه‌های اجتماعی با فناوری هوشمند NFC در سراسر افغانستان.
                  </p>
                </div>

                {/* Slider for Dari */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">اندازه قلم متن دری</span>
                    <span className="font-sans font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {localTypography.fontSizeDari}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={localTypography.fontSizeDari}
                    onChange={(e) => handleUpdateTypography({ fontSizeDari: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-sans">
                    <span>12px</span>
                    <span>15px (پیش‌فرض)</span>
                    <span>24px</span>
                  </div>
                </div>
              </div>

              {/* Preview Container 2: Pashto */}
              <div className="bg-muted/30 border border-border rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">🇦🇫</span>
                    <span className="text-xs font-bold text-foreground">2. کانتینر پیش‌نمایش متن پښتو</span>
                  </div>
                  <span className="text-[10px] font-sans font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {localTypography.fontFa}
                  </span>
                </div>

                {/* Real-time Render Box */}
                <div
                  className={`p-4 rounded-xl border border-border/80 bg-card shadow-xs space-y-1.5 transition-all font-${localTypography.fontFa}`}
                  data-font={localTypography.fontFa}
                  style={{
                    fontFamily: getFontFamilyStyle(localTypography.fontFa),
                    fontSize: `${localTypography.fontSizePashto}px`,
                  }}
                >
                  <h4
                    className="font-bold text-foreground leading-snug"
                    style={{
                      fontFamily: getFontFamilyStyle(localTypography.fontFa),
                      fontSize: `${Math.round(localTypography.fontSizePashto * 1.05)}px`,
                    }}
                  >
                    په آریا لینک کې ستاسو سمارټ ډیجیټل سوداګریز کارت
                  </h4>
                  <p
                    className="text-muted-foreground leading-relaxed"
                    style={{
                      fontFamily: getFontFamilyStyle(localTypography.fontFa),
                      fontSize: `${localTypography.fontSizePashto}px`,
                    }}
                  >
                    له خپلو پیرودونکو او سوداګریزو شریکانو سره د NFC ټیکنالوژۍ او QR کوډ له لارې چټکه او خوندی اړیکه ټینګه کړئ.
                  </p>
                </div>

                {/* Slider for Pashto */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">اندازه قلم متن پښتو</span>
                    <span className="font-sans font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {localTypography.fontSizePashto}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={localTypography.fontSizePashto}
                    onChange={(e) => handleUpdateTypography({ fontSizePashto: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-sans">
                    <span>12px</span>
                    <span>15px (پیش‌فرض)</span>
                    <span>24px</span>
                  </div>
                </div>
              </div>

              {/* Preview Container 3: English */}
              <div className="bg-muted/30 border border-border rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">🌐</span>
                    <span className="text-xs font-bold text-foreground">3. English Sample Text Container</span>
                  </div>
                  <span className="text-[10px] font-sans font-bold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    {localTypography.fontEn}
                  </span>
                </div>

                {/* Real-time Render Box */}
                <div
                  className={`p-4 rounded-xl border border-border/80 bg-card shadow-xs space-y-1.5 transition-all font-${localTypography.fontEn}`}
                  data-font={localTypography.fontEn}
                  style={{
                    fontFamily: getFontFamilyStyle(localTypography.fontEn),
                    fontSize: `${localTypography.fontSizeEn}px`,
                  }}
                  dir="ltr"
                >
                  <h4
                    className="font-bold text-foreground leading-snug"
                    style={{
                      fontFamily: getFontFamilyStyle(localTypography.fontEn),
                      fontSize: `${Math.round(localTypography.fontSizeEn * 1.05)}px`,
                    }}
                  >
                    AryaLink Smart Digital Business Card & Bio
                  </h4>
                  <p
                    className="text-muted-foreground leading-relaxed"
                    style={{
                      fontFamily: getFontFamilyStyle(localTypography.fontEn),
                      fontSize: `${localTypography.fontSizeEn}px`,
                    }}
                  >
                    Seamless contactless networking and instant social connectivity powered by high-speed NFC and dynamic QR technology.
                  </p>
                </div>

                {/* Slider for English */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">اندازه قلم انگلیسی</span>
                    <span className="font-sans font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {localTypography.fontSizeEn}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={localTypography.fontSizeEn}
                    onChange={(e) => handleUpdateTypography({ fontSizeEn: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-sans">
                    <span>12px</span>
                    <span>14px (Default)</span>
                    <span>24px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                تنظیمات تایپوگرافی کارت
              </span>
              <div className="flex items-center gap-2 mr-auto w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (typographySnapshotRef.current) {
                      setLocalTypography(typographySnapshotRef.current);
                      updateTheme(typographySnapshotRef.current, true);
                    }
                    setActiveTab('content');
                    toast.info('تغییرات فونت لغو شد و به تب محتوا بازگشتید.');
                  }}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>انصراف</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    updateTheme(localTypography, true);
                    const res = await saveProfileData();
                    if (res.success) {
                      typographySnapshotRef.current = { ...localTypography };
                      toast.success('تنظیمات فونت و اندازه قلم با موفقیت ذخیره شد.');
                      setActiveTab('content');
                    } else {
                      toast.error(res.message || 'خطا در ذخیره‌سازی.');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>ذخیره و تایید</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS, SEO & WHITE-LABEL */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* 1. PROFILE ALIAS & UNIQUE URL */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-cyan-500" />
                    آدرس یکتا و نام کاربری
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    نشانی اینترنتی اختصاصی کارت هوشمند و لینک‌بایوی شما
                  </p>
                </div>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                  دامنه aryal.ink
                </span>
              </div>

              <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    نام کاربری (لینک پروفایل)
                  </label>
                  <div className="flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:border-cyan-500" dir="ltr">
                    <span className="px-3 py-2 text-xs font-sans text-muted-foreground border-r border-border select-none bg-muted/50" dir="ltr">
                      aryal.ink/
                    </span>
                    <input
                      type="text"
                      value={profile.alias}
                      onChange={(e) => {
                        const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                        updateBasicInfo({ alias: clean });
                      }}
                      placeholder="username"
                      className="w-full bg-transparent border-0 py-2 px-3 text-xs font-sans text-foreground focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    این نام به عنوان آدرس QR Code و تپ NFC شما استفاده می‌شود.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 border border-border transition-all active:scale-95"
                  >
                    {copiedAlias ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">آدرس کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی لینک اختصاصی</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://aryal.ink/${profile.alias}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-colors"
                    title="مشاهده آدرس"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </section>

            {/* 2. WHITE-LABEL BRANDING */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    حذف برندینگ آریا لینک
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    سفارشی‌سازی کامل هویت بصری بدون نام آریا لینک
                  </p>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  ویژگی PRO
                </span>
              </div>

              <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">
                    پنهان کردن لوگوی آریا لینک در صفحه (ویژه کاربران Pro)
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    با فعال‌سازی این گزینه، فوتر «طراحی شده با Arya Link» از پایین کارت حذف خواهد شد.
                  </span>
                </div>
                <Switch
                  checked={Boolean(profile.hideBranding)}
                  onCheckedChange={(checked) => updateProSettings({ hideBranding: checked })}
                />
              </div>
            </section>

            {/* 3. SEO & SOCIAL SHARING */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  تنظیمات سئو و پیش‌نمایش اشتراک‌گذاری
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                متن‌هایی که در هنگام اشتراک‌گذاری کارت در واتساپ، تلگرام یا موتورهای جستجو دیده می‌شوند:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">عنوان سئو</label>
                  <input
                    type="text"
                    value={profile.seoTitle || ''}
                    onChange={(e) => updateProSettings({ seoTitle: e.target.value })}
                    placeholder="مثال: احمد نیازی | کارت ویزیت دیجیتال و بیو هوشمند"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">توضیحات سئو</label>
                  <textarea
                    rows={2}
                    value={profile.seoDescription || ''}
                    onChange={(e) => updateProSettings({ seoDescription: e.target.value })}
                    placeholder="توضیحات کوتاه درباره خدمات و راه ارتباطی با شما..."
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans resize-none"
                  />
                </div>

                {/* Google Search Result Preview Card */}
                <div className="p-3.5 rounded-2xl border border-border bg-card/60 space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                    <Search className="w-3 h-3 text-blue-500" />
                    <span>پیش‌نمایش در نتایج گوگل</span>
                  </div>
                  <div className="space-y-0.5 text-right font-sans pt-1">
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans" dir="ltr">
                      https://aryal.ink › {profile.alias}
                    </div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
                      {profile.seoTitle || `${profile.displayName} | کارت ویزیت هوشمند آریا لینک`}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {profile.seoDescription || profile.bio || 'صفحه اختصاصی ارتباط، شبکه‌های اجتماعی و سفارش خدمات با کارت هوشمند مبتنی بر NFC در سراسر افغانستان.'}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. DIRECT MODE */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div>
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  حالت مستقیم
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  با تپ کردن کارت NFC یا اسکن کد QR، صفحه پروفایل باز نشده و بازدیدکننده فوراً به آدرس مشخص‌شده هدایت می‌شود.
                </p>
              </div>

              <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground block">فعال‌سازی حالت مستقیم</span>
                  <span className="text-xs text-muted-foreground">
                    {profile.directModeEnabled ? 'فعال (هدایت سریع)' : 'غیرفعال (نمایش کارت دیجیتال)'}
                  </span>
                </div>
                <Switch
                  checked={Boolean(profile.directModeEnabled)}
                  onCheckedChange={() => toggleDirectMode()}
                />
              </div>

              {profile.directModeEnabled && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-cyan-500">نشانی مقصد هدایت مستقیم</label>
                  <input
                    type="url"
                    value={profile.directModeUrl || ''}
                    onChange={(e) => toggleDirectMode(true, e.target.value)}
                    placeholder="https://instagram.com/your_id یا https://wa.me/..."
                    className="w-full bg-background border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-400 font-sans text-left"
                    dir="ltr"
                  />
                </div>
              )}
            </section>

            {/* Bottom Confirm & Cancel Bar for Website Settings */}
            <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                تنظیمات وب‌سایت، سئو و هدایت مستقیم
              </span>
              <div className="flex items-center gap-2 mr-auto w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('content');
                    toast.info('به تب محتوا بازگشتید.');
                  }}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>انصراف</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const res = await saveProfileData();
                    if (res.success) {
                      toast.success('تنظیمات وب‌سایت با موفقیت ذخیره شد.');
                      setActiveTab('content');
                    } else {
                      toast.error(res.message || 'خطا در ذخیره‌سازی.');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>ذخیره و تایید</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MINI CRM & LEADS TABLE */}
        {activeTab === 'crm' && (
          <CrmLeadsTable profileAlias={profile.alias} />
        )}
      </div>

      {/* Profile Settings Modal (4 Tabs: عمومی، سئو، دسترسی، احراز هویت) */}
      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
      />

      {/* Module Selector Dialog Modal */}
      <ModuleSelectorModal
        open={isModuleModalOpen}
        onOpenChange={setIsModuleModalOpen}
      />

      {/* Card OCR Scanner Modal (Gemini Vision) */}
      <CardOcrScannerModal
        isOpen={isOcrOpen}
        onClose={() => {
          setIsOcrOpen(false);
          setPastedImageSrc(null);
        }}
        onScanComplete={handleOcrComplete}
        initialImageSrc={pastedImageSrc}
        initialMode={ocrInitialMode}
      />
    </div>
  );
};

export default ProfileEditor;
