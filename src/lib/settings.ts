import { connectToDatabase } from '@/lib/db/mongodb';
import { SiteSettings, ISiteSettingsDocument } from '@/models/SiteSettings.model';
import { SystemSettings, ISystemSettings } from '@/models/systemSettings.model';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/settings';

export { type ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/settings';

// Legacy URLs introduced during an earlier hardcoded replacement — strip if seeded automatically
const LEGACY_HARDCODED_URLS = new Set([
  'https://i.postimg.cc/wT3GQCv8/logo.png',
  'https://i.postimg.cc/ncMPGyz8/fav.png',
]);

function sanitizeLogoUrl(value?: string | null): string {
  const clean = (value || '').trim();
  if (!clean || LEGACY_HARDCODED_URLS.has(clean)) return '';
  return clean;
}

// In-memory cache flag to guarantee initialization check runs once per runtime lifecycle
let isSiteSettingsInitialized = false;

/**
 * Ensures a singleton SiteSettings document exists in MongoDB.
 */
export async function ensureSiteSettingsInitialized(): Promise<ISiteSettingsDocument> {
  await connectToDatabase();

  const existing = await SiteSettings.findOne({});
  if (existing) {
    isSiteSettingsInitialized = true;
    return existing;
  }

  const initial = await SiteSettings.findOneAndUpdate(
    {},
    {
      $setOnInsert: {
        platformMainLogo: '',
        platformFavicon: '',
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
 * Retrieves global platform branding settings from SystemSettings + SiteSettings.
 * Empty values signify fallback to default source-code logo/favicon.
 */
export async function getSiteSettings(): Promise<ISiteSettings> {
  try {
    await connectToDatabase();

    const [sysDoc, existingSiteDoc] = await Promise.all([
      SystemSettings.findOne({}).lean<ISystemSettings | null>(),
      SiteSettings.findOne({}).lean<ISiteSettingsDocument | null>(),
    ]);

    let siteDoc = existingSiteDoc;
    if (!siteDoc) {
      const initialized = await ensureSiteSettingsInitialized();
      siteDoc = initialized.toObject ? initialized.toObject() : initialized;
    }

    const platformMainLogo =
      sanitizeLogoUrl(sysDoc?.platformMainLogo) ||
      sanitizeLogoUrl(siteDoc?.platformMainLogo) ||
      sanitizeLogoUrl(siteDoc?.companyLogo) ||
      '';

    const platformFavicon =
      sanitizeLogoUrl(sysDoc?.platformFavicon) ||
      sanitizeLogoUrl(siteDoc?.platformFavicon) ||
      sanitizeLogoUrl(siteDoc?.favicon) ||
      '';

    return {
      platformMainLogo,
      platformFavicon,
      companyLogo: platformMainLogo,
      favicon: platformFavicon,
      siteName: siteDoc?.siteName?.trim() || DEFAULT_SITE_SETTINGS.siteName,
      siteDescription:
        siteDoc?.siteDescription?.trim() || DEFAULT_SITE_SETTINGS.siteDescription,
      updatedAt: sysDoc?.updatedAt || siteDoc?.updatedAt,
    };
  } catch (error) {
    console.error(
      'Failed to get site settings from database, safely falling back to defaults:',
      error
    );
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Updates global visual identity and site branding across SystemSettings & SiteSettings.
 */
export async function updateSiteSettings(
  data: Partial<ISiteSettings>,
  updatedBy?: string
): Promise<ISiteSettings> {
  await connectToDatabase();

  await ensureSiteSettingsInitialized();

  const rawNextLogo =
    data.platformMainLogo !== undefined ? data.platformMainLogo : data.companyLogo;
  const rawNextFavicon =
    data.platformFavicon !== undefined ? data.platformFavicon : data.favicon;

  const nextLogo =
    rawNextLogo !== undefined ? rawNextLogo.trim() : undefined;
  const nextFavicon =
    rawNextFavicon !== undefined ? rawNextFavicon.trim() : undefined;

  // 1. Persist into SystemSettings (`platformMainLogo` & `platformFavicon`)
  if (nextLogo !== undefined || nextFavicon !== undefined) {
    const sysSet: Record<string, string> = {};
    if (nextLogo !== undefined) sysSet.platformMainLogo = nextLogo;
    if (nextFavicon !== undefined) sysSet.platformFavicon = nextFavicon;

    await SystemSettings.findOneAndUpdate(
      {},
      { $set: sysSet },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 2. Sync SiteSettings singleton document
  let doc = await SiteSettings.findOne({});
  if (!doc) {
    doc = await SiteSettings.create({
      ...data,
      ...(nextLogo !== undefined && {
        platformMainLogo: nextLogo,
        companyLogo: nextLogo,
      }),
      ...(nextFavicon !== undefined && {
        platformFavicon: nextFavicon,
        favicon: nextFavicon,
      }),
      updatedBy,
    });
  } else {
    if (nextLogo !== undefined) {
      doc.platformMainLogo = nextLogo;
      doc.companyLogo = nextLogo;
    }
    if (nextFavicon !== undefined) {
      doc.platformFavicon = nextFavicon;
      doc.favicon = nextFavicon;
    }
    if (data.siteName !== undefined) doc.siteName = data.siteName;
    if (data.siteDescription !== undefined) doc.siteDescription = data.siteDescription;
    if (updatedBy) doc.updatedBy = updatedBy;
    await doc.save();
  }

  const finalLogo = sanitizeLogoUrl(doc.platformMainLogo || doc.companyLogo);
  const finalFavicon = sanitizeLogoUrl(doc.platformFavicon || doc.favicon);

  return {
    platformMainLogo: finalLogo,
    platformFavicon: finalFavicon,
    companyLogo: finalLogo,
    favicon: finalFavicon,
    siteName: doc.siteName?.trim() || DEFAULT_SITE_SETTINGS.siteName,
    siteDescription:
      doc.siteDescription?.trim() || DEFAULT_SITE_SETTINGS.siteDescription,
    updatedAt: doc.updatedAt,
  };
}
