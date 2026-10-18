export interface ISiteSettings {
  companyLogo: string;
  favicon: string;
  siteName: string;
  siteDescription: string;
  updatedAt?: string | Date;
}

export const DEFAULT_SITE_SETTINGS: ISiteSettings = {
  companyLogo: '',
  favicon: '',
  siteName: 'Arya Link',
  siteDescription: 'پیشرفته‌ترین سامانه هویت دیجیتال، کارت ویزیت هوشمند NFC و درگاه لینک‌بایو در افغانستان',
};
