'use client';

import React from 'react';
import {
  WhatsAppIcon,
  TelegramIcon,
  InstagramIcon,
  LinkedInIcon,
  XTwitterIcon,
  PinterestIcon,
  FacebookIcon,
  DribbbleIcon,
  BehanceIcon,
  YouTubeIcon,
  ClubhouseIcon,
  PatreonIcon,
  TwitchIcon,
  GitHubIcon,
  AparatIcon,
  TikTokIcon,
  AppleMusicIcon,
  YouTubeMusicIcon,
  CastboxIcon,
  RadioJavanIcon,
  SpotifyIcon,
  SoundCloudIcon,
  SkypeIcon,
  WeChatIcon,
  MessengerIcon,
  SignalIcon,
} from '@/components/icons';
import {
  MapPin,
  FileText,
  Link2,
  Youtube,
  Image as ImageIcon,
  CreditCard,
  Search,
  Sparkles,
  Phone,
  Mail,
  HelpCircle,
  Music,
  ShoppingBag,
  HeartHandshake,
  Timer,
  Clock,
  Type,
  Minus,
  Navigation,
  Video,
  Layers,
  Sliders,
  DollarSign,
  FolderPlus,
} from 'lucide-react';

/**
 * Shared icon resolver for all modules registered in MODULE_REGISTRY.
 * Used by both User ModuleSelectorModal and Super Admin ModuleAccessManager.
 */
export function getModuleIcon(moduleType: string, sizeClass = 'w-5 h-5'): React.ReactNode {
  switch (moduleType) {
    // 1. Social
    case 'instagram_profile':
      return <InstagramIcon className={`${sizeClass} text-pink-500 fill-current`} />;
    case 'twitter_x':
      return <XTwitterIcon className={`${sizeClass} text-zinc-900 dark:text-zinc-100 fill-current`} />;
    case 'linkedin_profile':
      return <LinkedInIcon className={`${sizeClass} text-sky-600 fill-current`} />;
    case 'youtube_channel':
      return <YouTubeIcon className={`${sizeClass} text-red-600 fill-current`} />;
    case 'aparat_channel':
      return <AparatIcon className={`${sizeClass} text-rose-500 fill-current`} />;
    case 'tiktok':
      return <TikTokIcon className={`${sizeClass} text-black dark:text-white fill-current`} />;
    case 'facebook':
      return <FacebookIcon className={`${sizeClass} text-blue-600 fill-current`} />;
    case 'pinterest':
      return <PinterestIcon className={`${sizeClass} text-red-600 fill-current`} />;
    case 'github':
      return <GitHubIcon className={`${sizeClass} text-slate-900 dark:text-slate-100 fill-current`} />;
    case 'dribbble':
      return <DribbbleIcon className={`${sizeClass} text-pink-500 fill-current`} />;
    case 'behance':
      return <BehanceIcon className={`${sizeClass} text-blue-500 fill-current`} />;
    case 'twitch':
      return <TwitchIcon className={`${sizeClass} text-purple-600 fill-current`} />;
    case 'clubhouse':
      return <ClubhouseIcon className={`${sizeClass} text-amber-500 fill-current`} />;
    case 'patreon':
      return <PatreonIcon className={`${sizeClass} text-orange-500 fill-current`} />;

    // 2. Messengers
    case 'whatsapp_direct':
      return <WhatsAppIcon className={`${sizeClass} text-emerald-500 fill-current`} />;
    case 'telegram_channel':
      return <TelegramIcon className={`${sizeClass} text-sky-500 fill-current`} />;
    case 'messenger':
      return <MessengerIcon className={`${sizeClass} text-blue-500 fill-current`} />;
    case 'signal':
      return <SignalIcon className={`${sizeClass} text-blue-600 fill-current`} />;
    case 'skype':
      return <SkypeIcon className={`${sizeClass} text-sky-500 fill-current`} />;
    case 'wechat':
      return <WeChatIcon className={`${sizeClass} text-green-500 fill-current`} />;

    // 3. Audio & Podcasts
    case 'spotify':
      return <SpotifyIcon className={`${sizeClass} text-emerald-500 fill-current`} />;
    case 'apple_music':
      return <AppleMusicIcon className={`${sizeClass} text-rose-500 fill-current`} />;
    case 'youtube_music':
      return <YouTubeMusicIcon className={`${sizeClass} text-red-500 fill-current`} />;
    case 'soundcloud':
      return <SoundCloudIcon className={`${sizeClass} text-amber-500 fill-current`} />;
    case 'castbox':
      return <CastboxIcon className={`${sizeClass} text-orange-500 fill-current`} />;
    case 'radio_javan':
      return <RadioJavanIcon className={`${sizeClass} text-amber-400 fill-current`} />;
    case 'spotify_podcaster':
      return <SpotifyIcon className={`${sizeClass} text-purple-500 fill-current`} />;

    // 4. Communication
    case 'phone_call':
      return <Phone className={`${sizeClass} text-green-500`} />;
    case 'email_direct':
    case 'contact_form':
    case 'lead_capture_form':
      return <Mail className={`${sizeClass} text-amber-500`} />;
    case 'video_meeting':
      return <Video className={`${sizeClass} text-teal-500`} />;

    // 5. Media & Content
    case 'single_image':
      return <ImageIcon className={`${sizeClass} text-blue-500`} />;
    case 'image_gallery':
      return <Sparkles className={`${sizeClass} text-violet-500`} />;
    case 'image_slider':
      return <Sliders className={`${sizeClass} text-cyan-500`} />;
    case 'youtube_embed':
      return <Youtube className={`${sizeClass} text-red-500`} />;
    case 'aparat_embed':
      return <Youtube className={`${sizeClass} text-rose-500`} />;
    case 'music_player':
      return <Music className={`${sizeClass} text-emerald-500`} />;
    case 'pdf_catalog':
      return <FileText className={`${sizeClass} text-rose-500`} />;

    // 6. Commerce & Finance
    case 'standard_link':
      return <Link2 className={`${sizeClass} text-cyan-500`} />;
    case 'profile_search':
      return <Search className={`${sizeClass} text-indigo-500`} />;
    case 'product_card':
      return <ShoppingBag className={`${sizeClass} text-teal-500`} />;
    case 'sale_checkout':
      return <DollarSign className={`${sizeClass} text-emerald-500`} />;
    case 'payment':
      return <CreditCard className={`${sizeClass} text-emerald-500`} />;
    case 'donation_hesabpay':
      return <HeartHandshake className={`${sizeClass} text-rose-500`} />;
    case 'countdown_timer':
      return <Timer className={`${sizeClass} text-amber-500`} />;

    // 7. Location & Hours
    case 'location_hours':
      return <MapPin className={`${sizeClass} text-rose-500`} />;
    case 'map_navigation':
      return <Navigation className={`${sizeClass} text-sky-500`} />;
    case 'business_hours':
      return <Clock className={`${sizeClass} text-amber-500`} />;

    // 8. Text & Layout
    case 'container_group':
      return <FolderPlus className={`${sizeClass} text-cyan-400`} />;
    case 'simple_text':
      return <Type className={`${sizeClass} text-indigo-500`} />;
    case 'divider_heading':
      return <Minus className={`${sizeClass} text-slate-500`} />;
    case 'spacer_divider':
      return <Layers className={`${sizeClass} text-zinc-500`} />;
    case 'faq_accordion':
      return <HelpCircle className={`${sizeClass} text-purple-500`} />;

    default:
      return <Layers className={`${sizeClass} text-cyan-500`} />;
  }
}

