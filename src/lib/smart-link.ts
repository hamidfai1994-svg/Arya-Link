/**
 * Smart Link & Deep Link Generator
 * Transforms raw inputs (phone, username, handle, ID) into proper native app deep links and web fallback URLs.
 * Also provides text formatters to clean technical protocols (tel:, mailto:, etc.) from live previews and UI.
 */

export interface SmartLinkResult {
  webUrl: string;
  deepLink: string;
}

/**
 * Strips technical URI schemes and code prefixes so numbers/links show cleanly in UI and LivePreview.
 * Example: "tel:+93799123456" => "+93799123456"
 * Example: "mailto:info@aryalink.com" => "info@aryalink.com"
 * Example: "https://x.com/aryalink" => "aryalink" (or domain path)
 */
export function formatDisplayValue(value: string): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();

  // Strip common protocols and deep-link schemes
  const cleaned = trimmed
    .replace(/^tel:/i, '')
    .replace(/^mailto:/i, '')
    .replace(/^whatsapp:\/\/send\?phone=/i, '')
    .replace(/^sgnl:\/\/signal\.me\/#p\//i, '')
    .replace(/^tg:\/\/resolve\?domain=/i, '')
    .replace(/^skype:([^?]+)\?chat/i, '$1')
    .replace(/^skype:/i, '')
    .replace(/^weixin:\/\/dl\/chat\?/i, '')
    .replace(/^fb-messenger:\/\/user-thread\//i, '')
    .replace(/^fb:\/\/profile\//i, '')
    .replace(/^twitter:\/\/user\?screen_name=/i, '')
    .replace(/^pinterest:\/\/user\//i, '')
    .replace(/^vnd\.youtube:\/\/www\.youtube\.com\/@/i, '')
    .replace(/^clubhouse:\/\/user\//i, '')
    .replace(/^linkedin:\/\/profile\//i, '')
    .replace(/^twitch:\/\/stream\//i, '')
    .replace(/^instagram:\/\/user\?username=/i, '')
    .replace(/^snssdk1233:\/\/user\/profile\//i, '')
    .replace(/^rj:\/\/podcast\//i, '')
    .replace(/^spotify:(artist|user|track):/i, '')
    .replace(/^soundcloud:\/\/users\//i, '')
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/\/$/, '');

  return cleaned;
}

/**
 * Returns the best link (preferring native deep-link scheme on mobile or web fallback)
 */
export function getSmartLink(type: string, value: string, options?: { preferDeepLink?: boolean }): string {
  if (!value || typeof value !== 'string') return '#';
  const val = value.trim();
  if (!val) return '#';

  const cleanHandle = val.replace(/^@/, '').trim();
  const digitsOnly = val.replace(/[^0-9+]/g, '').replace(/^\+/, '');

  switch (type) {
    // ------------------------------------------------------------------------
    // 1. Social Networks & Platforms (14)
    // ------------------------------------------------------------------------
    case 'twitter_x':
    case 'twitter':
    case 'x': {
      if (val.startsWith('twitter://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `twitter://user?screen_name=${cleanHandle}`;
      return `https://x.com/${cleanHandle}`;
    }

    case 'pinterest': {
      if (val.startsWith('pinterest://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `pinterest://user/${cleanHandle}`;
      return `https://pinterest.com/${cleanHandle}`;
    }

    case 'facebook': {
      if (val.startsWith('fb://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      // If purely numeric ID, use fb://profile/[ID]
      if (/^\d+$/.test(cleanHandle) && options?.preferDeepLink) {
        return `fb://profile/${cleanHandle}`;
      }
      return `https://facebook.com/${cleanHandle}`;
    }

    case 'dribbble': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://dribbble.com/${cleanHandle}`;
    }

    case 'behance': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://behance.net/${cleanHandle}`;
    }

    case 'youtube_channel':
    case 'youtube': {
      if (val.startsWith('vnd.youtube://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `vnd.youtube://www.youtube.com/@${cleanHandle}`;
      return `https://youtube.com/@${cleanHandle}`;
    }

    case 'clubhouse': {
      if (val.startsWith('clubhouse://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `clubhouse://user/${cleanHandle}`;
      return `https://clubhouse.com/@${cleanHandle}`;
    }

    case 'patreon': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://patreon.com/${cleanHandle}`;
    }

    case 'linkedin':
    case 'linkedin_profile': {
      if (val.startsWith('linkedin://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `linkedin://profile/${cleanHandle}`;
      return `https://linkedin.com/in/${cleanHandle}`;
    }

    case 'twitch': {
      if (val.startsWith('twitch://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `twitch://stream/${cleanHandle}`;
      return `https://twitch.tv/${cleanHandle}`;
    }

    case 'github': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://github.com/${cleanHandle}`;
    }

    case 'instagram':
    case 'instagram_profile': {
      if (val.startsWith('instagram://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `instagram://user?username=${cleanHandle}`;
      return `https://instagram.com/${cleanHandle}`;
    }

    case 'aparat_channel':
    case 'aparat': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://aparat.com/${cleanHandle}`;
    }

    case 'tiktok': {
      if (val.startsWith('snssdk1233://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `snssdk1233://user/profile/${cleanHandle}`;
      return `https://tiktok.com/@${cleanHandle}`;
    }

    // ------------------------------------------------------------------------
    // 2. Audio & Podcasts Platforms (7)
    // ------------------------------------------------------------------------
    case 'apple_music':
    case 'itunes': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://music.apple.com/${val}`;
    }

    case 'youtube_music': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://music.youtube.com/${val}`;
    }

    case 'castbox': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const cleanId = cleanHandle.replace(/^ch\//, '');
      return `https://castbox.fm/ch/${cleanId}`;
    }

    case 'radio_javan': {
      if (val.startsWith('rj://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `rj://podcast/${cleanHandle}`;
      return `https://play.radiojavan.com/podcast/${cleanHandle}`;
    }

    case 'spotify_podcaster': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://podcasters.spotify.com/${cleanHandle}`;
    }

    case 'spotify': {
      if (val.startsWith('spotify:')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (val.includes(':')) {
        return `spotify:${val}`;
      }
      return `https://open.spotify.com/${cleanHandle}`;
    }

    case 'soundcloud': {
      if (val.startsWith('soundcloud://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (/^\d+$/.test(cleanHandle) && options?.preferDeepLink) {
        return `soundcloud://users/${cleanHandle}`;
      }
      return `https://soundcloud.com/${cleanHandle}`;
    }

    // ------------------------------------------------------------------------
    // 3. Direct Messengers (6)
    // ------------------------------------------------------------------------
    case 'telegram':
    case 'telegram_channel': {
      if (val.startsWith('tg://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `tg://resolve?domain=${cleanHandle}`;
      return `https://t.me/${cleanHandle}`;
    }

    case 'skype': {
      if (val.startsWith('skype:')) return val;
      return `skype:${cleanHandle}?chat`;
    }

    case 'wechat': {
      if (val.startsWith('weixin://')) return val;
      return `weixin://dl/chat?${cleanHandle}`;
    }

    case 'messenger': {
      if (val.startsWith('fb-messenger://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `fb-messenger://user-thread/${cleanHandle}`;
      return `https://m.me/${cleanHandle}`;
    }

    case 'whatsapp':
    case 'whatsapp_direct': {
      if (val.startsWith('whatsapp://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `whatsapp://send?phone=${digitsOnly}`;
      return `https://wa.me/${digitsOnly}`;
    }

    case 'signal': {
      if (val.startsWith('sgnl://')) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (options?.preferDeepLink) return `sgnl://signal.me/#p/${digitsOnly}`;
      return `https://signal.me/#p/${digitsOnly}`;
    }

    // ------------------------------------------------------------------------
    // Standard Fallbacks
    // ------------------------------------------------------------------------
    case 'phone':
    case 'phone_call': {
      if (val.startsWith('tel:')) return val;
      return `tel:${val}`;
    }

    case 'email':
    case 'email_direct': {
      if (val.startsWith('mailto:')) return val;
      return `mailto:${val}`;
    }

    default: {
      if (
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('tel:') ||
        val.startsWith('mailto:') ||
        val.startsWith('whatsapp:') ||
        val.startsWith('tg:') ||
        val.startsWith('skype:')
      ) {
        return val;
      }
      return `https://${val}`;
    }
  }
}
