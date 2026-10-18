/**
 * Smart Link Generator
 * Transforms raw inputs (phone, username, email, URL) into proper clickable links
 * Wa.me, Telegram, Instagram, Phone Call, Email, LinkedIn, etc.
 */
export function getSmartLink(type: string, value: string): string {
  if (!value || typeof value !== 'string') return '#';
  const val = value.trim();
  if (!val) return '#';

  switch (type) {
    case 'whatsapp':
    case 'whatsapp_direct': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const digits = val.replace(/[^0-9]/g, '');
      return `https://wa.me/${digits}`;
    }

    case 'telegram':
    case 'telegram_channel': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const cleanUser = val.replace('@', '').trim();
      return `https://t.me/${cleanUser}`;
    }

    case 'instagram':
    case 'instagram_profile': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const cleanUser = val.replace('@', '').trim();
      return `https://instagram.com/${cleanUser}`;
    }

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

    case 'linkedin':
    case 'linkedin_profile': {
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const cleanUser = val.replace('@', '').trim();
      return `https://linkedin.com/in/${cleanUser}`;
    }

    case 'youtube_embed':
    case 'aparat_embed':
    case 'pdf_catalog':
    case 'standard_link':
    default: {
      if (
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('tel:') ||
        val.startsWith('mailto:')
      ) {
        return val;
      }
      return `https://${val}`;
    }
  }
}
