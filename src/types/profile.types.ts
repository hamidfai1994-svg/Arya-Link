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
  
  // Interactive
  | 'profile_search';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

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
    buttonAnimation?: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow';
    borderStyle?: 'none' | 'solid' | 'dashed';
    shadowStyle?: 'none' | 'sm' | 'md' | 'glow';
    borderRadius?: string;
  };
  openInNewTab?: boolean;
  isHidden?: boolean;
  buttonAnimation?: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow';
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
  backgroundType?: 'solid' | 'gradient' | 'pattern';
  buttonBorderStyle?: 'none' | 'solid' | 'dashed';
  buttonShadowStyle?: 'none' | 'sm' | 'md' | 'glow';
  fontFa?: 'vazirmatn' | 'yekan_bakh' | 'shabnam' | 'sahel';
  fontEn?: 'inter' | 'outfit' | 'plus_jakarta' | 'playfair';
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
