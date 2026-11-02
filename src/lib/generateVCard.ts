import { ProfileData, ProfileLinkItem } from '@/types/profile.types';
import { getSmartLink, formatDisplayValue } from '@/lib/smart-link';

/**
 * Converts Persian (Farsi/Dari) and Arabic digits to standard ASCII English digits (0-9).
 * قانون خط قرمز اعداد: تمامی شماره‌ها باید منحصراً با ارقام انگلیسی در فایل درج شوند.
 */
export function convertToEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰٠]/g, '0')
    .replace(/[۱١]/g, '1')
    .replace(/[۲٢]/g, '2')
    .replace(/[۳٣]/g, '3')
    .replace(/[۴٤]/g, '4')
    .replace(/[۵٥]/g, '5')
    .replace(/[۶٦]/g, '6')
    .replace(/[۷٧]/g, '7')
    .replace(/[۸٨]/g, '8')
    .replace(/[۹٩]/g, '9');
}

/**
 * Sanitizes and normalizes phone numbers to standard international or clean digits format.
 * Strips out spaces, parentheses, dashes, and extra characters while preserving leading '+'.
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';

  // 1. Convert Persian/Arabic digits to English digits
  const englishStr = convertToEnglishDigits(rawPhone.trim());

  // 2. Remove 'tel:' protocol if present
  let cleaned = englishStr.replace(/^tel:/i, '').trim();

  // 3. Normalize international '00' prefix to '+'
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // 4. Check if number starts with '+'
  const hasPlus = cleaned.startsWith('+');

  // 5. Strip all non-numeric characters except leading plus
  const digitsOnly = cleaned.replace(/[^0-9]/g, '');

  if (!digitsOnly) return '';
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Escapes special characters for vCard 3.0 fields according to RFC 2426 / RFC 4868.
 * Special characters like backslashes, semicolons, commas, and newlines must be escaped.
 */
export function escapeVCardValue(value: string): string {
  if (!value) return '';
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
    .trim();
}

/**
 * Splits a full name into First Name and Last Name for vCard 'N' property.
 */
function parseFirstAndLastName(fullName: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

/**
 * Extracts a clean email address from a string or mailto URI.
 */
function normalizeEmail(rawEmail: string): string {
  if (!rawEmail) return '';
  return rawEmail.trim().replace(/^mailto:/i, '').toLowerCase();
}

/**
 * Generates a standard vCard 3.0 formatted text string from Profile and Module data.
 * Fully compliant with UTF-8 encoding and RTL languages (Persian / Dari / Pashto).
 *
 * @param profile ProfileData object containing identity, bio, contact details
 * @param links Optional list of ProfileLinkItem modules (defaults to profile.links)
 * @returns Standard vCard 3.0 formatted string
 */
export function generateVCard(profile: ProfileData, links?: ProfileLinkItem[]): string {
  const activeLinks = (links || profile.links || []).filter((link) => link.isActive);

  const lines: string[] = [];

  // 1. vCard Header
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  lines.push('PRODID:-//AryaLink//Smart Digital Business Card Generator//FA');
  lines.push(`REV:${new Date().toISOString()}`);

  // 2. Full Name & Structured Name (with CHARSET=UTF-8)
  const displayName = profile.displayName?.trim() || profile.alias || 'مخاطب آریا لینک';
  const { firstName, lastName } = parseFirstAndLastName(displayName);

  lines.push(`FN;CHARSET=UTF-8:${escapeVCardValue(displayName)}`);
  lines.push(`N;CHARSET=UTF-8:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`);

  // 3. Job Title / Profession (Headline)
  if (profile.headline && profile.headline.trim()) {
    lines.push(`TITLE;CHARSET=UTF-8:${escapeVCardValue(profile.headline.trim())}`);
  }

  // 4. Organization / Company (for business profiles or company headlines)
  if (profile.profileType === 'business') {
    lines.push(`ORG;CHARSET=UTF-8:${escapeVCardValue(displayName)}`);
  }

  // 5. Notes / Bio
  if (profile.bio && profile.bio.trim()) {
    lines.push(`NOTE;CHARSET=UTF-8:${escapeVCardValue(profile.bio.trim())}`);
  }

  // 6. Phone Numbers (Normalized to English digits, deduplicated)
  const phoneNumbers = new Set<string>();

  // Profile-level main phone
  if (profile.phone) {
    const norm = normalizePhoneNumber(profile.phone);
    if (norm && !phoneNumbers.has(norm)) {
      phoneNumbers.add(norm);
      lines.push(`TEL;TYPE=WORK,VOICE:${norm}`);
    }
  }

  // Profile-level WhatsApp
  if (profile.whatsapp) {
    const norm = normalizePhoneNumber(profile.whatsapp);
    if (norm && !phoneNumbers.has(norm)) {
      phoneNumbers.add(norm);
      lines.push(`TEL;TYPE=CELL,VOICE:${norm}`);
    }
  }

  // Phone numbers from active modules
  activeLinks.forEach((link) => {
    if (link.moduleType === 'phone_call') {
      const raw = link.metadata?.phoneNumber || link.url || '';
      const norm = normalizePhoneNumber(raw);
      if (norm && !phoneNumbers.has(norm)) {
        phoneNumbers.add(norm);
        lines.push(`TEL;TYPE=WORK,VOICE:${norm}`);
      }
    } else if (link.moduleType === 'whatsapp_direct' || link.moduleType === 'signal') {
      const raw = link.metadata?.phoneNumber || link.url || '';
      const norm = normalizePhoneNumber(raw);
      if (norm && !phoneNumbers.has(norm)) {
        phoneNumbers.add(norm);
        lines.push(`TEL;TYPE=CELL,VOICE:${norm}`);
      }
    }
  });

  // 7. Emails (Deduplicated)
  const emails = new Set<string>();

  // Profile-level email
  if (profile.email) {
    const clean = normalizeEmail(profile.email);
    if (clean && !emails.has(clean)) {
      emails.add(clean);
      lines.push(`EMAIL;TYPE=WORK,INTERNET:${clean}`);
    }
  }

  // Email modules
  activeLinks.forEach((link) => {
    if (link.moduleType === 'email_direct') {
      const raw =
        link.metadata?.emailAddress ||
        link.metadata?.recipientEmail ||
        link.url ||
        '';
      const clean = normalizeEmail(raw);
      if (clean && !emails.has(clean)) {
        emails.add(clean);
        lines.push(`EMAIL;TYPE=WORK,INTERNET:${clean}`);
      }
    }
  });

  // 8. Physical Address / Location
  const address =
    profile.location ||
    activeLinks.find(
      (l) =>
        (l.moduleType === 'location_hours' || l.moduleType === 'map_navigation') &&
        l.metadata?.address
    )?.metadata?.address;

  if (address && address.trim()) {
    const escapedAddr = escapeVCardValue(address.trim());
    lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${escapedAddr};;;;`);
  }

  // 9. URLs (AryaLink card page, Websites, and Social Links)
  const urls = new Set<string>();

  // Primary AryaLink Profile URL
  if (profile.alias) {
    const profileUrl = `https://aryal.ink/${profile.alias.trim()}`;
    urls.add(profileUrl);
    lines.push(`URL;TYPE=WORK:${profileUrl}`);
  }

  // Modules URLs
  activeLinks.forEach((link) => {
    let targetUrl = '';

    // Standard website links
    if (link.moduleType === 'standard_link' && link.url && link.url !== '#') {
      targetUrl = link.url.trim();
    }
    // Social Networks & Messenger Platforms
    else if (
      [
        'instagram_profile',
        'linkedin_profile',
        'telegram_channel',
        'twitter_x',
        'facebook',
        'youtube_channel',
        'github',
        'tiktok',
        'aparat_channel',
        'pinterest',
        'dribbble',
        'behance',
        'twitch',
        'clubhouse',
        'patreon',
        'skype',
        'messenger',
      ].includes(link.moduleType)
    ) {
      const handle =
        link.metadata?.username ||
        link.metadata?.channelUsername ||
        link.metadata?.instagramUsername ||
        link.metadata?.linkedinUsername ||
        link.url;

      if (handle) {
        targetUrl = getSmartLink(link.moduleType, handle, { preferDeepLink: false });
      }
    }

    if (targetUrl && targetUrl !== '#' && !urls.has(targetUrl)) {
      urls.add(targetUrl);
      lines.push(`URL;TYPE=OTHER:${targetUrl}`);
    }
  });

  // 10. vCard End
  lines.push('END:VCARD');

  // Join lines with standard CRLF line breaks
  return lines.join('\r\n');
}

/**
 * Triggers an instant in-browser download of the generated vCard file (.vcf)
 * using a UTF-8 Blob and a temporary anchor link.
 *
 * @param profile ProfileData
 * @param links Optional ProfileLinkItem modules
 * @returns string The generated filename for confirmation/toast
 */
export function downloadVCard(profile: ProfileData, links?: ProfileLinkItem[]): string {
  // 1. Generate vCard 3.0 content string
  const vcardContent = generateVCard(profile, links);

  // 2. Prepend UTF-8 BOM (\uFEFF) to guarantee correct decoding on iOS and Android contacts apps
  const utf8Bom = '\uFEFF';
  const blob = new Blob([utf8Bom + vcardContent], {
    type: 'text/vcard;charset=utf-8',
  });

  // 3. Format safe filename (e.g. Hamid-Fasihi.vcf or AryaLink.vcf)
  const baseName = (profile.displayName || profile.alias || 'contact')
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '-');
  const filename = `${baseName || 'contact'}.vcf`;

  // 4. Download file using hidden <a> tag and URL.createObjectURL
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = objectUrl;
  anchor.setAttribute('download', filename);

  document.body.appendChild(anchor);
  anchor.click();

  // 5. Clean up DOM and memory
  document.body.removeChild(anchor);
  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1500);

  return filename;
}

