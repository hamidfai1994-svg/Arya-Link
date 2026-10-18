import { connectToDatabase } from '@/lib/db/mongodb';
import { SiteSettings, ISiteSettingsDocument } from '@/models/SiteSettings.model';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/settings';

export { type ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/settings';

// In-memory cache flag to guarantee initialization check runs once per runtime lifecycle
let isSiteSettingsInitialized = false;

/**
 * Ensures a singleton SiteSettings document exists in MongoDB.
 * If no document exists in the collection, an initial document is created automatically.
 * Uses atomic upsert/check logic to prevent duplicate records.
 */
export async function ensureSiteSettingsInitialized(): Promise<ISiteSettingsDocument> {
  await connectToDatabase();

  // 1. Check if document already exists
  const existing = await SiteSettings.findOne({});
  if (existing) {
    isSiteSettingsInitialized = true;
    return existing;
  }

  // 2. If no document exists, atomically create the initial default document
  const initial = await SiteSettings.findOneAndUpdate(
    {},
    {
      $setOnInsert: {
        companyLogo: '',
        favicon: '',
        siteName: DEFAULT_SITE_SETTINGS.siteName,
        siteDescription: DEFAULT_SITE_SETTINGS.siteDescription,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  isSiteSettingsInitialized = true;
  return initial;
}

/**
 * Retrieves the global site branding and asset settings.
 * Automatically initializes default settings in the database if missing.
 */
export async function getSiteSettings(): Promise<ISiteSettings> {
  try {
    await connectToDatabase();

    // Fast check: find document
    let doc = await SiteSettings.findOne({}).lean<ISiteSettingsDocument | null>();

    // If not found, run singleton initialization
    if (!doc) {
      const initialized = await ensureSiteSettingsInitialized();
      doc = initialized.toObject ? initialized.toObject() : initialized;
    }

    return {
      companyLogo: doc?.companyLogo ?? DEFAULT_SITE_SETTINGS.companyLogo,
      favicon: doc?.favicon ?? DEFAULT_SITE_SETTINGS.favicon,
      siteName: doc?.siteName ?? DEFAULT_SITE_SETTINGS.siteName,
      siteDescription: doc?.siteDescription ?? DEFAULT_SITE_SETTINGS.siteDescription,
      updatedAt: doc?.updatedAt,
    };
  } catch (error) {
    console.error('Failed to get site settings from database, safely falling back to defaults:', error);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Updates the global site settings document (Singleton pattern).
 */
export async function updateSiteSettings(
  data: Partial<ISiteSettings>,
  updatedBy?: string
): Promise<ISiteSettings> {
  await connectToDatabase();

  // Ensure document exists first
  await ensureSiteSettingsInitialized();

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
