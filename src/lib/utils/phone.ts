/**
 * Phone and Messenger Link Utilities
 */

export const getWhatsAppLink = (phone: string, defaultCountryCode = '93'): string => {
  if (!phone) return '#';
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.substring(2);
  else if (cleanPhone.startsWith('0')) cleanPhone = defaultCountryCode + cleanPhone.substring(1);
  return `https://wa.me/${cleanPhone}`;
};

export const getTelegramLink = (phone: string, defaultCountryCode = '93'): string => {
  if (!phone) return '#';
  let cleanPhone = phone.replace(/\D/g, ''); 
  if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.substring(2);
  else if (cleanPhone.startsWith('0')) cleanPhone = defaultCountryCode + cleanPhone.substring(1);
  return `https://t.me/+${cleanPhone}`;
};

