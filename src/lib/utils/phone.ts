/**
 * Phone and Messenger Link Utilities with Strict Sanitization and Validation
 */

/**
 * Validates that a phone string only contains digits and an optional leading '+', up to 20 characters.
 */
export function isValidPhoneNumber(value?: string | null): boolean {
  if (!value) return true; // optional fields are valid when empty
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^\+?[0-9]{1,19}$/.test(trimmed);
}

/**
 * Filters raw user input in real-time:
 * Allows only digits and at most one leading '+', restricted to max characters (default 20).
 */
export function sanitizePhoneInput(rawInput: string, maxLen: number = 20): string {
  if (!rawInput) return '';
  let str = rawInput.trim();

  // Preserve optional leading '+' if user typed it first
  const startsWithPlus = str.startsWith('+');
  // Strip everything except digits
  let digits = str.replace(/[^0-9]/g, '');

  let result = startsWithPlus ? '+' + digits : digits;
  if (result.length > maxLen) {
    result = result.substring(0, maxLen);
  }
  return result;
}

/**
 * Sanitizes phone numbers for WhatsApp:
 * 1. Removes all spaces, parentheses, hyphens, slashes, and irrelevant text.
 * 2. If a full WhatsApp link or URL was passed, extracts the actual phone number before any query parameters.
 * 3. Ensures the number contains only digits (stripping leading '+' and '00' for wa.me URL standard).
 * 4. Caps length at maximum 18 characters to prevent corrupted data concatenation.
 */
export function sanitizeWhatsAppNumber(rawInput?: string | null): string {
  if (!rawInput || typeof rawInput !== 'string') return '';
  let input = rawInput.trim();
  if (!input) return '';

  // 1. If an existing wa.me or whatsapp:// URL was provided, isolate the phone number component
  if (input.includes('wa.me/')) {
    input = input.split('wa.me/')[1]?.split(/[?#]/)[0] || '';
  } else if (input.includes('phone=')) {
    input = input.split('phone=')[1]?.split(/[&#]/)[0] || '';
  } else if (input.includes('whatsapp:')) {
    input = input.replace(/^whatsapp:/i, '').split(/[?#]/)[0] || '';
  } else {
    input = input.split(/[?#]/)[0];
  }

  // 2. Remove spaces, parentheses, dashes, dots, and common separator characters
  let cleaned = input.replace(/[\s\(\)\-\.\/]/g, '');

  // 3. Keep only digits and optional leading '+'
  const hasPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/[^0-9]/g, '');
  if (hasPlus) {
    cleaned = '+' + cleaned;
  }

  // 4. Strip leading '+' or '00' for clean wa.me path
  let finalDigits = cleaned.replace(/^\+/, '').replace(/^00/, '');

  // 5. Restrict length to maximum 18 characters to prevent attaching unrelated strings
  if (finalDigits.length > 18) {
    finalDigits = finalDigits.substring(0, 18);
  }

  return finalDigits;
}

/**
 * Builds a clean, standard WhatsApp link: https://wa.me/NUMBER or https://wa.me/NUMBER?text=MESSAGE
 */
export function buildWhatsAppLink(
  rawInput?: string | null,
  prefilledText?: string | null
): string {
  const cleanNumber = sanitizeWhatsAppNumber(rawInput);
  if (!cleanNumber) return '#';

  const baseUrl = `https://wa.me/${cleanNumber}`;
  if (prefilledText && typeof prefilledText === 'string' && prefilledText.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(prefilledText.trim())}`;
  }
  return baseUrl;
}

export const getWhatsAppLink = (phone: string, defaultCountryCode = '93'): string => {
  if (!phone) return '#';
  let cleanPhone = sanitizeWhatsAppNumber(phone);
  if (!cleanPhone) return '#';
  if (cleanPhone.startsWith('0')) {
    cleanPhone = defaultCountryCode + cleanPhone.substring(1);
  }
  return `https://wa.me/${cleanPhone}`;
};

export const getTelegramLink = (phone: string, defaultCountryCode = '93'): string => {
  if (!phone) return '#';
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.substring(2);
  else if (cleanPhone.startsWith('0')) cleanPhone = defaultCountryCode + cleanPhone.substring(1);
  if (cleanPhone.length > 18) cleanPhone = cleanPhone.substring(0, 18);
  return `https://t.me/+${cleanPhone}`;
};
