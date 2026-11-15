export interface ISiteSettings {
  platformMainLogo: string;
  platformFavicon: string;
  companyLogo: string;
  favicon: string;
  siteName: string;
  siteDescription: string;
  updatedAt?: string | Date;
}

export const DEFAULT_SITE_SETTINGS: ISiteSettings = {
  platformMainLogo: '',
  platformFavicon: '',
  companyLogo: '',
  favicon: '',
  siteName: 'Arya Link',
  siteDescription: 'پیشرفته‌ترین سیستم هویت دیجیتال، کارت ویزیت هوشمند NFC و درگاه لینک‌بایو در افغانستان',
};
