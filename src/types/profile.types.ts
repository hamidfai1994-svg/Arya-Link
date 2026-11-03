export type LinkModuleType = 
  // Social Networks & Platforms (14+ items)
  | 'whatsapp_direct'
  | 'telegram_channel'
  | 'instagram_profile'
  | 'linkedin_profile'
  | 'twitter_x'
  | 'pinterest'
  | 'facebook'
  | 'dribbble'
  | 'behance'
  | 'youtube_channel'
  | 'clubhouse'
  | 'patreon'
  | 'twitch'
  | 'github'
  | 'aparat_channel'
  | 'tiktok'

  // Audio & Podcasts (7 items)
  | 'apple_music'
  | 'youtube_music'
  | 'castbox'
  | 'radio_javan'
  | 'spotify_podcaster'
  | 'spotify'
  | 'soundcloud'

  // Direct Messengers (6 items)
  | 'skype'
  | 'wechat'
  | 'messenger'
  | 'signal'
  
  // Text & Layout
  | 'simple_text'
  | 'divider_heading'
  | 'spacer_divider'
  | 'faq_accordion'
  | 'container_group'
  
  // Communication
  | 'phone_call'
  | 'email_direct'
  | 'lead_capture_form'
  | 'contact_form'
  | 'video_meeting'
  
  // Media & Files
  | 'single_image'
  | 'image_gallery'
  | 'image_slider'
  | 'youtube_embed'
  | 'aparat_embed'
  | 'music_player'
  | 'pdf_catalog'
  
  // Commercial & Sales
  | 'standard_link'
  | 'product_card'
  | 'sale_checkout'
  | 'donation_hesabpay'
  | 'countdown_timer'
  
  // Location & Navigation
  | 'location_hours'
  | 'map_navigation'
  | 'business_hours'
  
  // Interactive
  | 'profile_search';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface BusinessHourDay {
  dayIndex: number;  // 0: شنبه, 1: یکشنبه, 2: دوشنبه, 3: سه‌شنبه, 4: چهارشنبه, 5: پنجشنبه, 6: جمعه
  dayName: string;   // 'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'
  isOpen: boolean;   // true: روز کاری, false: روز تعطیل
  openTime: string;  // "08:00"
  closeTime: string; // "17:00"
}

export type ButtonAnimationType = 
  | 'none'
  | 'shake_x'
  | 'wobble'
  | 'buzz'
  | 'tada'
  | 'heart'
  | 'pulse'
  | 'shake_y';

export type ButtonAnimationTrigger = 'infinite' | 'hover';

export type ButtonShapeType =
  | 'sharp'          // مربع تیز
  | 'soft'           // لبه‌گرد ملایم
  | 'pill'           // کاملاً گرد
  | 'leaf'           // گوشه‌های نامتقارن (برگ)
  | 'cut_corners'    // گوشه بریده (چمفر)
  | 'ticket'         // بلیط / تیکت
  | 'hexagon'        // شش‌ضلعی
  | 'parallelogram_l'// متوازی‌الاضلاع چپ
  | 'parallelogram_r';// متوازی‌الاضلاع راست

export type ButtonSizeType = 'sm' | 'md' | 'lg';
export type ButtonBorderWidthType = 'none' | 'thin' | 'medium' | 'thick';

export interface ModuleAdvancedSettings {
  scheduling?: {
    enabled: boolean;
    days: number[]; // 0: Sun, 1: Mon, ..., 6: Sat
    startTime: string; // "08:00"
    endTime: string;   // "18:00"
  };
  monetization?: {
    isLocked: boolean;
    price: number;
    currency: 'AFN' | 'USD';
    unlockNote?: string;
  };
  customStyling?: {
    customBgColor?: string;
    customTextColor?: string;
    customBorderColor?: string;
    isHighlighted?: boolean;
    buttonAnimation?: ButtonAnimationType;
    animationTrigger?: ButtonAnimationTrigger;
    animationSpeed?: number; // In seconds, e.g. 1.6
    buttonShape?: ButtonShapeType | 'inherit';
    buttonSize?: ButtonSizeType;
    borderWidth?: ButtonBorderWidthType;
    borderStyle?: 'none' | 'solid' | 'dashed';
    shadowStyle?: 'none' | 'sm' | 'md' | 'glow';
    borderRadius?: string;
  };
  openInNewTab?: boolean;
  isHidden?: boolean;
  buttonAnimation?: ButtonAnimationType;
  animationTrigger?: ButtonAnimationTrigger;
  animationSpeed?: number;
  isCompactIcon?: boolean; // حالت نمایش فشرده (فقط آیکون) برای شبکه‌های اجتماعی
}

export interface ModuleMetadata {
  // Social, Messengers & Handles
  phoneNumber?: string;
  prefilledMessage?: string;
  username?: string;
  targetId?: string;
  channelUsername?: string;
  instagramUsername?: string;
  linkedinUsername?: string;
  smartDeepLink?: string;
  
  // Text & Layout
  simpleTextContent?: string;
  textAlign?: 'right' | 'center' | 'left';
  dividerTitle?: string;
  dividerStyle?: 'solid_thin' | 'solid_thick' | 'dashed' | 'dotted' | 'double';
  dividerPadding?: 'sm' | 'md' | 'lg';
  spacerHeight?: number; // 16, 24, 32, 48
  searchPlaceholder?: string;
  containerLayout?: 'vertical' | 'horizontal_compact';
  containerDescription?: string;
  
  // Communication
  emailAddress?: string;
  emailSubject?: string;
  recipientEmail?: string;
  faqItems?: FAQItem[];
  meetingPlatform?: 'google_meet' | 'zoom' | 'teams';
  meetingUrl?: string;
  
  // Location & Navigation
  address?: string;
  workingHours?: string;
  mapEmbedUrl?: string;
  mapLink?: string;
  wazeLink?: string;
  businessHours?: BusinessHourDay[];
  
  // PDF
  catalogFileUrl?: string;
  catalogButtonText?: string;
  
  // Media
  youtubeUrl?: string;
  youtubeVideoId?: string;
  aparatVideoId?: string;
  aparatUrl?: string;
  musicUrl?: string;
  musicPlatform?: 'spotify' | 'soundcloud' | 'direct_audio';
  singleImageUrl?: string;
  singleImageCaption?: string;
  singleImageLink?: string;
  imageUrls?: string[];
  
  // Commercial & Sales
  productTitle?: string;
  productPrice?: number;
  productCurrency?: string;
  productImage?: string;
  productBuyUrl?: string;
  checkoutItemName?: string;
  checkoutAmount?: number;
  donationTargetAmount?: number;
  donationDescription?: string;
  countdownTargetDate?: string;
  countdownTitle?: string;
  
  // Payment
  paymentAccount?: string;
  paymentAmount?: string;
  paymentCurrency?: string;
  
  // Lead Capture
  leadHeadline?: string;
  requireEmail?: boolean;
  requireNote?: boolean;
  
  // Generic
  [key: string]: any;
}

export interface ProfileLinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  moduleType: LinkModuleType;
  isActive: boolean;
  isPinned: boolean;
  order: number;
  clickCount?: number;
  parentId?: string | null; // For nested container/group items
  metadata?: ModuleMetadata;
  advancedSettings?: ModuleAdvancedSettings;
}

export interface ProfileThemeConfig {
  preset: 'dark_neon' | 'glass_morphism' | 'emerald_luxury' | 'royal_gold' | 'minimal_light';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBlur: string;
  textColor: string;
  borderRadius: string;
  backgroundType?: 'solid' | 'gradient' | 'pattern' | 'image';
  bgSolidColor?: string;
  bgGradientColors?: string[];
  bgGradientType?: 'linear' | 'radial';
  bgPatternId?: string;
  bgPatternOpacity?: number;
  bgImageUrl?: string;
  bgImageOpacity?: number;
  bgGradientPosition?: number; // 0 to 100%
  bgPatternSize?: number;      // 10 to 100px
  buttonBorderStyle?: 'none' | 'solid' | 'dashed';
  buttonShadowStyle?: 'none' | 'sm' | 'md' | 'glow';
  fontFa?: 'vazirmatn' | 'yekan_bakh' | 'shabnam' | 'sahel' | 'dana';
  fontEn?: 'inter' | 'roboto' | 'poppins' | 'outfit' | 'plus_jakarta' | 'playfair';
  fontSizeDari?: number;   // In px, e.g. 15 (range 12 - 24)
  fontSizePashto?: number; // In px, e.g. 15 (range 12 - 24)
  fontSizeEn?: number;     // In px, e.g. 14 (range 12 - 24)
  // Stage 57 Global Button Styling:
  buttonShape?: ButtonShapeType;
  buttonSize?: ButtonSizeType;
  buttonBorderWidth?: ButtonBorderWidthType;
  buttonBorderColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  compactSocialIcons?: boolean;
}

export type HeaderLayoutType = 'curve' | 'gradient_mask' | 'minimal';

export type ProfileLanguage = 'dari' | 'pashto' | 'en';
export type AppLanguage = ProfileLanguage;

export type ProfileType = 'personal' | 'business';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface VerificationData {
  whatsappNumber?: string;
  selfieWithIdUrl?: string; // سلفی چهره همراه با کارت شناسایی/تذکره/پاسپورت
  idCardFrontUrl?: string;  // عکس روی کارت شناسایی
  idCardBackUrl?: string;   // عکس پشت کارت شناسایی
  businessLicenseUrl?: string; // جواز تجاری شرکت (ویژه business)
  notes?: string;
  submittedAt?: string;
}

export interface PasswordProtectionConfig {
  enabled: boolean;
  password?: string;
  hint?: string;
}

export interface ProfileData {
  id: string;
  alias: string;
  displayName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  headerLayout?: HeaderLayoutType;
  phone?: string;
  whatsapp?: string;
  email?: string;
  location?: string;
  directModeEnabled: boolean;
  directModeUrl?: string;
  themeConfig: ProfileThemeConfig;
  links: ProfileLinkItem[];
  
  // Profile Language (Global)
  profileLanguage?: ProfileLanguage;

  // KYC & Verification
  profileType?: ProfileType;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  verificationData?: VerificationData;

  // Pro Features & Settings Modal
  seoTitle?: string;
  seoDescription?: string;
  noIndex?: boolean;
  passwordProtection?: PasswordProtectionConfig;
  hideBranding?: boolean;
  selectedTemplateId?: string;
}

export interface UserProfileSummary {
  id: string;
  alias: string;
  displayName: string;
  headline?: string;
  roleType: 'personal' | 'business' | 'creator';
  avatarUrl?: string;
  isActive: boolean;
  isVerified?: boolean;
}
