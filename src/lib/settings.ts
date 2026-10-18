import { connectToDatabase } from '@/lib/db/mongodb';
import { SiteSettings, ISiteSettingsDocument } from '@/models/SiteSettings.model';

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

export async function getSiteSettings(): Promise<ISiteSettings> {
  try {
    await connectToDatabase();
    let doc = await SiteSettings.findOne({}).lean<ISiteSettingsDocument | null>();
    if (!doc) {
      const created = await SiteSettings.create({});
      doc = created.toObject();
    }
    return {
      companyLogo: doc.companyLogo || '',
      favicon: doc.favicon || '',
      siteName: doc.siteName || DEFAULT_SITE_SETTINGS.siteName,
      siteDescription: doc.siteDescription || DEFAULT_SITE_SETTINGS.siteDescription,
      updatedAt: doc.updatedAt,
    };
  } catch (error) {
    console.error('Failed to get site settings from database, using defaults:', error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function updateSiteSettings(
  data: Partial<ISiteSettings>,
  updatedBy?: string
): Promise<ISiteSettings> {
  await connectToDatabase();
  let doc = await SiteSettings.findOne({});
  if (!doc) {
    doc = await SiteSettings.create({ ...data, updatedBy });
  } else {
    if (data.companyLogo !== undefined) doc.companyLogo = data.companyLogo;
    if (data.favicon !== undefined) doc.favicon = data.favicon;
    if (data.siteName !== undefined) doc.siteName = data.siteName;
    if (data.siteDescription !== undefined) doc.siteDescription = data.siteDescription;
    if (updatedBy) doc.updatedBy = updatedBy;
    await doc.save();
  }

  return {
    companyLogo: doc.companyLogo || '',
    favicon: doc.favicon || '',
    siteName: doc.siteName || DEFAULT_SITE_SETTINGS.siteName,
    siteDescription: doc.siteDescription || DEFAULT_SITE_SETTINGS.siteDescription,
    updatedAt: doc.updatedAt,
  };
}
