import type { SupportedLanguage } from '@/lib/i18n/types';
import type { IOrderCardBgConfig, IOrderCardDesign } from '@/models/Order.model';

export type CardOrientation = 'vertical' | 'horizontal';
export type CardTemplateId = 'arya-svg' | 'axis-metal' | 'minimal' | 'executive';
export type CardMaterialId = string;
export type BadgeMode = 'none' | 'filled' | 'outline';
export type TipShape = 'slash' | 'square' | 'diamond' | 'triangle' | 'circle';
export type ColorStudioTab = 'solid' | 'custom' | 'grad' | 'customGrad';
export type ArtworkFit = 'cover' | 'contain';
export type CardSide = 'front' | 'back';

export type BgConfig = IOrderCardBgConfig;

export interface CardColors {
  company: string;
  slogan: string;
  sloganBadge: string;
  frontLine1: string;
  frontLine2: string;
  tipShape: string;
  name: string;
  role: string;
  roleBadge: string;
  backLine1: string;
  backLine2: string;
  nfc: string;
  qr: string;
}

export interface TemplateOption {
  id: CardTemplateId;
  name: Record<SupportedLanguage, string>;
  desc: Record<SupportedLanguage, string>;
}

export interface MaterialOption {
  id: CardMaterialId;
  name: Record<SupportedLanguage, string>;
  price: number;
  isAvailable: boolean;
  metalness: number;
  roughness: number;
  clearcoat: number;
  envMapIntensity: number;
  brushed: boolean;
}

export interface SolidPreset {
  id: string;
  color: string;
  accent: string;
  name: Record<SupportedLanguage, string>;
}

export interface GradientPreset {
  id: string;
  type: 'linear' | 'radial';
  c1: string;
  c2: string;
  angle: number;
  accent: string;
  name: Record<SupportedLanguage, string>;
}

export interface QtyTier {
  qty: number;
  disc: number;
}

export interface UserProfileLinkOption {
  id: string;
  title: string;
  titleRaw?: any;
  url: string;
  moduleType: string;
}

export interface UserProfileOption {
  id: string;
  alias: string;
  displayName: string;
  headline: string;
  bio?: string;
  occupation?: string;
  companyName?: string;
  avatarUrl: string;
  isCorporate?: boolean;
  links?: UserProfileLinkOption[];
  translations?: Record<string, any>;
}

export interface CardDesignState {
  orientation: CardOrientation;
  template: CardTemplateId;
  materialId: CardMaterialId;
  frontBg: BgConfig;
  backBg: BgConfig;
  syncBackBg: boolean;
  fullFrontDataUrl: string | null;
  fullFrontFit: ArtworkFit;
  fullBackDataUrl: string | null;
  fullBackFit: ArtworkFit;
  company: string;
  slogan: string;
  name: string;
  role: string;
  username: string;
  customQrUrl: string;
  sloganBadgeMode: BadgeMode;
  roleBadgeMode: BadgeMode;
  tipShape: TipShape;
  colors: CardColors;
  customLogoDataUrl: string | null;
  showQr: boolean;
  showNfc: boolean;
  linkedProfileId: string | null;
  linkedProfileAlias: string | null;
  linkedLinkId: string | null;
  linkedLinkTitle: string | null;
  bindingMode: 'profile' | 'manual';
}

export interface ShippingFormState {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  streetAddress: string;
  notes: string;
}

export interface OrderConfirmationState {
  orderNumber: string;
  totalPrice: number;
  customerName: string;
  province: string;
  quantity: number;
  frontPreviewUrl?: string;
  backPreviewUrl?: string;
  paymentMethod?: string;
}

export interface LoadedCardImages {
  siteLogoImg: HTMLImageElement | null;
  customLogoImg: HTMLImageElement | null;
  fullFrontImg: HTMLImageElement | null;
  fullBackImg: HTMLImageElement | null;
}

export const CARD_D = 0.024;
export const HW = 1200;
export const HH = 756;
export const VW = 756;
export const VH = 1200;

export const STUDIO_DRAFT_STORAGE_KEY = 'aryalink_nfc_studio_draft_v4';

export const TEMPLATES: TemplateOption[] = [
  {
    id: 'arya-svg',
    name: { da: 'امضای آریا (SVG)', ps: 'د آریا لاسلیک', en: 'Arya Signature' },
    desc: {
      da: 'دو خط بالا/پایین + شکل نوک + محور QR',
      ps: 'پورته/لاندې کرښه + شکل + QR',
      en: 'Edge lines, tip shape & QR axis',
    },
  },
  {
    id: 'axis-metal',
    name: { da: 'محور متالیک (SVG)', ps: 'متالیک محور', en: 'Metallic Axis' },
    desc: {
      da: 'خط مرکزی ظریف + آیکون دایره‌ای NFC',
      ps: 'نازکه کرښه + NFC نښه',
      en: 'Fine center axis & NFC emblem',
    },
  },
  {
    id: 'minimal',
    name: { da: 'مینیمال مدرن', ps: 'ساده عصري', en: 'Modern Minimal' },
    desc: {
      da: 'قاب حاشیه ظریف و فضای خلوت لوکس',
      ps: 'ساده او پاک جوړښت',
      en: 'Clean frame editorial style',
    },
  },
  {
    id: 'executive',
    name: { da: 'شرکتی / سازمانی', ps: 'رسمي / شرکتي', en: 'Executive Bar' },
    desc: {
      da: 'نوار کناری رنگی + خط جداکننده رسمی',
      ps: 'رسمي رنګه پټه',
      en: 'Side accent bar & rule',
    },
  },
];

export const DEFAULT_MATERIALS: MaterialOption[] = [
  {
    id: 'pvc-matte',
    name: { da: 'PVC مات ضدخش', ps: 'مات PVC', en: 'Matte PVC' },
    price: 650,
    isAvailable: true,
    metalness: 0.12,
    roughness: 0.56,
    clearcoat: 0.18,
    envMapIntensity: 0.15,
    brushed: false,
  },
  {
    id: 'pvc-gloss',
    name: { da: 'PVC براق ساتن', ps: 'براق PVC', en: 'Gloss Satin PVC' },
    price: 750,
    isAvailable: true,
    metalness: 0.22,
    roughness: 0.24,
    clearcoat: 0.85,
    envMapIntensity: 0.35,
    brushed: false,
  },
  {
    id: 'metal',
    name: { da: 'فلزی برس‌خورده', ps: 'فلزي پریمیوم', en: 'Brushed Metal' },
    price: 1450,
    isAvailable: true,
    metalness: 0.84,
    roughness: 0.26,
    clearcoat: 0.55,
    envMapIntensity: 0.55,
    brushed: true,
  },
];

export const DEFAULT_QTY_TIERS: QtyTier[] = [
  { qty: 1, disc: 0 },
  { qty: 3, disc: 10 },
  { qty: 5, disc: 15 },
  { qty: 10, disc: 20 },
];

export const SOLID_PRESETS: SolidPreset[] = [
  { id: 'navy', color: '#0c3d5d', accent: '#eeb61e', name: { da: 'سرمه‌ای', ps: 'تور شین', en: 'Navy' } },
  { id: 'teal', color: '#1a89ae', accent: '#eeb61e', name: { da: 'فیروزه‌ای', ps: 'فیروزه‌يي', en: 'Teal' } },
  { id: 'green', color: '#17ac63', accent: '#eeb61e', name: { da: 'زمردی', ps: 'شنه', en: 'Emerald' } },
  { id: 'yellow', color: '#fdd700', accent: '#c52126', name: { da: 'زرد آفتابی', ps: 'ژیړ', en: 'Sun Yellow' } },
  { id: 'orange', color: '#f8a71a', accent: '#0c3d5d', name: { da: 'کهربایی', ps: 'نارنجي', en: 'Amber' } },
  { id: 'red', color: '#c52126', accent: '#eeb61e', name: { da: 'یاقوتی', ps: 'سور', en: 'Crimson' } },
  { id: 'white', color: '#f7f9fd', accent: '#1a89ae', name: { da: 'سفید خالص', ps: 'سپین', en: 'Pure White' } },
  { id: 'carbon', color: '#14171f', accent: '#38bdf8', name: { da: 'مشکی کربن', ps: 'تور کاربن', en: 'Carbon' } },
];

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'cosmic-navy',
    type: 'radial',
    c1: '#1d2a62',
    c2: '#04122d',
    angle: 135,
    accent: '#eeb61e',
    name: { da: 'سرمه‌ای کیهانی', ps: 'تور شین', en: 'Cosmic Navy' },
  },
  {
    id: 'silver-metal',
    type: 'linear',
    c1: '#828599',
    c2: '#fafcff',
    angle: 125,
    accent: '#0c3d5d',
    name: { da: 'متالیک نقره‌ای', ps: 'سپین زر', en: 'Silver Foil' },
  },
  {
    id: 'royal-gold',
    type: 'linear',
    c1: '#f0cf82',
    c2: '#9a7026',
    angle: 135,
    accent: '#17120a',
    name: { da: 'طلایی رویال', ps: 'طلایي', en: 'Royal Gold' },
  },
  {
    id: 'ocean-arya',
    type: 'linear',
    c1: '#1a89ae',
    c2: '#0c3d5d',
    angle: 145,
    accent: '#eeb61e',
    name: { da: 'اقیانوس آریا', ps: 'آریا سمندر', en: 'Arya Ocean' },
  },
  {
    id: 'obsidian',
    type: 'linear',
    c1: '#283044',
    c2: '#090b10',
    angle: 140,
    accent: '#38bdf8',
    name: { da: 'اوبسیدین', ps: 'تور تیاره', en: 'Obsidian' },
  },
  {
    id: 'sunset-ruby',
    type: 'linear',
    c1: '#c52126',
    c2: '#f8a71a',
    angle: 135,
    accent: '#ffffff',
    name: { da: 'غروب یاقوتی', ps: 'یاقوتي', en: 'Ruby Sunset' },
  },
  {
    id: 'emerald-deep',
    type: 'linear',
    c1: '#17ac63',
    c2: '#0a4f34',
    angle: 150,
    accent: '#fdd700',
    name: { da: 'زمرد عمیق', ps: 'تیاره شین', en: 'Deep Emerald' },
  },
  {
    id: 'pearl-silk',
    type: 'linear',
    c1: '#ffffff',
    c2: '#dce2f0',
    angle: 135,
    accent: '#1a89ae',
    name: { da: 'ابریشم مروارید', ps: 'مروارید', en: 'Pearl Silk' },
  },
];

export const AFGHANISTAN_PROVINCES: string[] = [
  'کابل (Kabul)',
  'هرات (Herat)',
  'بلخ (Mazar-i-Sharif)',
  'ننگرهار (Jalalabad)',
  'قندهار (Kandahar)',
  'بامیان (Bamyan)',
  'بدخشان (Badakhshan)',
  'کندز (Kunduz)',
  'تخار (Takhar)',
  'بغلان (Baghlan)',
  'غزنی (Ghazni)',
  'پروان (Parwan)',
  'پنجشیر (Panjshir)',
  'کاپیسا (Kapisa)',
  'میدان وردک (Wardak)',
  'لوگر (Logar)',
  'خوست (Khost)',
  'پکتیا (Paktia)',
  'پکتیکا (Paktika)',
  'فاریاب (Faryab)',
  'جوزجان (Jawzjan)',
  'سرپل (Sar-e Pol)',
  'سمنگان (Samangan)',
  'غور (Ghor)',
  'بادغیس (Badghis)',
  'فراه (Farah)',
  'نیمروز (Nimruz)',
  'هلمند (Helmand)',
  'زابل (Zabul)',
  'ارزگان (Uruzgan)',
  'دایکندی (Daykundi)',
  'لغمان (Laghman)',
  'کنر (Kunar)',
  'نورستان (Nuristan)',
];

export function makeDefaultBg(color = '#f8a71a'): BgConfig {
  return {
    tab: 'solid',
    solidColor: color,
    gradType: 'linear',
    c1: '#1d2a62',
    c2: '#04122d',
    angle: 135,
  };
}

export function createInitialCardDesignState(): CardDesignState {
  return {
    orientation: 'vertical',
    template: 'arya-svg',
    materialId: 'pvc-matte',
    frontBg: {
      tab: 'grad',
      solidColor: '#0c3d5d',
      gradType: 'radial',
      c1: '#1d2a62',
      c2: '#04122d',
      angle: 135,
    },
    backBg: makeDefaultBg('#f8a71a'),
    syncBackBg: true,
    fullFrontDataUrl: null,
    fullFrontFit: 'cover',
    fullBackDataUrl: null,
    fullBackFit: 'cover',
    company: 'آریا لینک',
    slogan: 'کارت ویزیت هوشمند',
    name: 'فرهاد آریا',
    role: 'طراح محصول و وب',
    username: 'hamid',
    customQrUrl: '',
    sloganBadgeMode: 'filled',
    roleBadgeMode: 'none',
    tipShape: 'diamond',
    colors: {
      company: '#ffffff',
      slogan: '#0c3d5d',
      sloganBadge: '#eeb61e',
      frontLine1: '#ffffff',
      frontLine2: '#ffffff',
      tipShape: '#eeb61e',
      name: '#ffffff',
      role: '#e2e8f0',
      roleBadge: '#eeb61e',
      backLine1: '#ffffff',
      backLine2: '#ffffff',
      nfc: '#ffffff',
      qr: '#ffffff',
    },
    customLogoDataUrl: null,
    showQr: true,
    showNfc: true,
    linkedProfileId: null,
    linkedProfileAlias: null,
    linkedLinkId: null,
    linkedLinkTitle: null,
    bindingMode: 'manual',
  };
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = (hex || '#000000').replace('#', '');
  const expanded = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const n = parseInt(expanded, 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((raw) => {
    const v = raw / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isGradientMode(bg: BgConfig): boolean {
  return bg.tab === 'grad' || bg.tab === 'customGrad';
}

export function getEffectiveBg(state: CardDesignState, side: CardSide): BgConfig {
  return side === 'back' && !state.syncBackBg ? state.backBg : state.frontBg;
}

export function autoContrastInk(bg: BgConfig): string {
  const lum = isGradientMode(bg)
    ? (luminance(bg.c1) + luminance(bg.c2)) / 2
    : luminance(bg.solidColor);
  return lum > 0.46 ? '#0c3d5d' : '#ffffff';
}

export function resolveStageTint(bg: BgConfig): string {
  const primary = isGradientMode(bg) ? bg.c2 : bg.solidColor;
  const [r, g, b] = hexToRgb(primary);
  return `rgb(${Math.round(r * 0.18 + 8)}, ${Math.round(g * 0.18 + 10)}, ${Math.round(b * 0.18 + 16)})`;
}

export function computeSmartPaletteForSide(
  state: CardDesignState,
  side: CardSide,
  bg: BgConfig,
  accentHex: string
): CardColors {
  const ink = autoContrastInk(bg);
  const onAccent = luminance(accentHex) > 0.46 ? '#0c3d5d' : '#ffffff';
  const next: CardColors = { ...state.colors };

  if (side === 'front') {
    next.company = ink;
    next.frontLine1 = ink;
    next.frontLine2 = ink;
    next.tipShape = accentHex;
    next.sloganBadge = accentHex;
    next.slogan = state.sloganBadgeMode === 'filled' ? onAccent : ink;
  }
  if (side === 'back' || state.syncBackBg) {
    next.name = ink;
    next.roleBadge = accentHex;
    next.role = state.roleBadgeMode === 'filled' ? onAccent : ink;
    next.backLine1 = ink;
    next.backLine2 = ink;
    next.nfc = ink;
    next.qr = ink;
  }
  return next;
}

export function resolveQrTargetUrl(state: CardDesignState): string {
  const custom = (state.customQrUrl || '').trim();
  if (custom) {
    if (/^https?:\/\//i.test(custom)) return custom;
    return `https://${custom}`;
  }
  const cleanUser = (state.username || 'arya')
    .trim()
    .replace(/^https?:\/\/(www\.)?aryal(ink)?\.(me|ink)\//i, '')
    .replace(/\s+/g, '');
  return `https://aryal.ink/${cleanUser || 'arya'}`;
}

export function getDiscountPercentForQty(qty: number, tiers: QtyTier[] = DEFAULT_QTY_TIERS): number {
  const sorted = [...tiers].sort((a, b) => b.qty - a.qty);
  const match = sorted.find((t) => qty >= t.qty);
  return match ? match.disc : 0;
}

export function normalizeApiMaterials(rawList?: any[]): MaterialOption[] {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return DEFAULT_MATERIALS;
  }

  const mapped: MaterialOption[] = rawList
    .filter((item) => item && typeof item === 'object' && item.id)
    .map((item) => {
      const id = String(item.id).trim();
      const fallback = DEFAULT_MATERIALS.find((d) => d.id === id) || DEFAULT_MATERIALS[0];
      const rawPrice = Number(item.priceWithPrint ?? item.price);
      const price = Number.isFinite(rawPrice) && rawPrice >= 0 ? Math.round(rawPrice) : fallback.price;
      const defaultEnv = id === 'metal' || item.brushed ? 0.55 : id === 'pvc-gloss' ? 0.35 : 0.15;

      return {
        id,
        name: {
          da: String(item.name?.fa || item.name?.da || fallback.name.da).trim(),
          ps: String(item.name?.ps || item.name?.fa || fallback.name.ps).trim(),
          en: String(item.name?.en || item.name?.fa || fallback.name.en).trim(),
        },
        price,
        isAvailable: item.isAvailable !== false,
        metalness: Number.isFinite(Number(item.metalness)) ? Number(item.metalness) : fallback.metalness,
        roughness: Number.isFinite(Number(item.roughness)) ? Number(item.roughness) : fallback.roughness,
        clearcoat: Number.isFinite(Number(item.clearcoat)) ? Number(item.clearcoat) : fallback.clearcoat,
        envMapIntensity: Number.isFinite(Number(item.envMapIntensity))
          ? Number(item.envMapIntensity)
          : defaultEnv,
        brushed: typeof item.brushed === 'boolean' ? item.brushed : fallback.brushed,
      };
    });

  return mapped.length > 0 ? mapped : DEFAULT_MATERIALS;
}

export function mergeCmsMaterials(cmsMaterials?: any[]): MaterialOption[] {
  if (!Array.isArray(cmsMaterials) || cmsMaterials.length === 0) {
    return DEFAULT_MATERIALS;
  }

  const findPrice = (predicate: (m: any) => boolean): number | null => {
    const found = cmsMaterials.find(predicate);
    if (!found) return null;
    const p = Number(found.price);
    return Number.isFinite(p) && p > 0 ? p : null;
  };

  // Explicit studio material IDs take top priority if configured in CMS
  const exactPvcMatte = findPrice((m) => m.id === 'pvc-matte');
  const exactPvcGloss = findPrice((m) => m.id === 'pvc-gloss');
  const exactMetal = findPrice((m) => m.id === 'metal');

  // Otherwise fallback to standard LandingCms materials (mat-pvc / mat-black-metal) ONLY if customized,
  // or keep exact fallback 650 / 750 / 1450 when LandingCms has untouched legacy catalog entries
  const pvcCmsPrice = exactPvcMatte ?? findPrice((m) => m.id === 'mat-pvc' || m.materialType === 'pvc');
  const metalCmsPrice = exactMetal ?? findPrice((m) => m.id === 'mat-black-metal' || m.materialType === 'black_metal');

  // If CMS explicitly provides studio material IDs, use them directly; otherwise use CMS prices if present
  // and safely fallback to 650 / 750 / 1450 if missing.
  const mattePrice = pvcCmsPrice ?? DEFAULT_MATERIALS[0].price;
  const glossPrice = exactPvcGloss ?? (pvcCmsPrice ? pvcCmsPrice + 100 : DEFAULT_MATERIALS[1].price);
  const metalPrice = metalCmsPrice ?? DEFAULT_MATERIALS[2].price;

  return DEFAULT_MATERIALS.map((mat) => {
    if (mat.id === 'pvc-matte') return { ...mat, price: mattePrice };
    if (mat.id === 'pvc-gloss') return { ...mat, price: glossPrice };
    if (mat.id === 'metal') return { ...mat, price: metalPrice };
    return mat;
  });
}

export function buildOrderCardDesignPayload(
  state: CardDesignState,
  material: MaterialOption,
  discountPercent: number,
  cardLanguage: SupportedLanguage,
  urls: {
    frontPrintImageUrl?: string;
    backPrintImageUrl?: string;
    customLogoUrl?: string;
    customFrontArtworkUrl?: string;
    customBackArtworkUrl?: string;
  }
): IOrderCardDesign {
  return {
    orientation: state.orientation,
    template: state.template,
    materialId: material.id,
    materialName: material.name.da,
    frontBg: { ...state.frontBg },
    backBg: { ...state.backBg },
    syncBackBg: state.syncBackBg,
    company: state.company,
    slogan: state.slogan,
    name: state.name,
    role: state.role,
    username: state.username,
    qrUrl: resolveQrTargetUrl(state),
    sloganBadgeMode: state.sloganBadgeMode,
    roleBadgeMode: state.roleBadgeMode,
    tipShape: state.tipShape,
    colors: { ...state.colors },
    showQr: state.showQr,
    showNfc: state.showNfc,
    linkedProfileId: state.linkedProfileId,
    linkedProfileAlias: state.linkedProfileAlias,
    linkedLinkId: state.linkedLinkId,
    linkedLinkTitle: state.linkedLinkTitle,
    hasFullFrontArtwork: Boolean(state.fullFrontDataUrl),
    fullFrontFit: state.fullFrontFit,
    hasFullBackArtwork: Boolean(state.fullBackDataUrl),
    fullBackFit: state.fullBackFit,
    frontPrintImageUrl: urls.frontPrintImageUrl || '',
    backPrintImageUrl: urls.backPrintImageUrl || '',
    customLogoUrl: urls.customLogoUrl || '',
    customFrontArtworkUrl: urls.customFrontArtworkUrl || '',
    customBackArtworkUrl: urls.customBackArtworkUrl || '',
    discountPercent,
    cardLanguage,
  };
}
