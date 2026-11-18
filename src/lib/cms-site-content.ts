import { connectToDatabase } from '@/lib/db/mongodb';
import {
  SiteContent,
  ISiteContentDocument,
  DEFAULT_SITE_CONTENT,
} from '@/models/SiteContent.model';

export { DEFAULT_SITE_CONTENT, type ISiteContentDocument } from '@/models/SiteContent.model';

/**
 * Ensures singleton SiteContent document exists in MongoDB.
 * If none exists, creates it with DEFAULT_SITE_CONTENT defaults.
 */
export async function ensureSiteContentInitialized(): Promise<ISiteContentDocument> {
  await connectToDatabase();

  const existing = await SiteContent.findOne({});
  if (existing) {
    return existing;
  }

  const initial = await SiteContent.findOneAndUpdate(
    {},
    {
      $setOnInsert: {
        hero: DEFAULT_SITE_CONTENT.hero,
        nfcConcept: DEFAULT_SITE_CONTENT.nfcConcept,
        sliders: DEFAULT_SITE_CONTENT.sliders,
        aboutUs: DEFAULT_SITE_CONTENT.aboutUs,
        team: DEFAULT_SITE_CONTENT.team,
        partners: DEFAULT_SITE_CONTENT.partners,
        blogCms: DEFAULT_SITE_CONTENT.blogCms,
        seo: DEFAULT_SITE_CONTENT.seo,
        faq: DEFAULT_SITE_CONTENT.faq,
        footer: DEFAULT_SITE_CONTENT.footer,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return initial;
}

/**
 * Retrieves the global SiteContent configuration.
 * Returns DEFAULT_SITE_CONTENT fallback if database query fails.
 */
export async function getSiteContent(): Promise<typeof DEFAULT_SITE_CONTENT & { updatedAt?: Date }> {
  try {
    await connectToDatabase();
    let doc = await SiteContent.findOne({}).lean<ISiteContentDocument | null>();

    if (!doc) {
      const initialized = await ensureSiteContentInitialized();
      doc = initialized.toObject ? initialized.toObject() : initialized;
    }

    return {
      hero: doc?.hero || DEFAULT_SITE_CONTENT.hero,
      nfcConcept: doc?.nfcConcept || DEFAULT_SITE_CONTENT.nfcConcept,
      sliders: doc?.sliders && doc.sliders.length > 0 ? doc.sliders : DEFAULT_SITE_CONTENT.sliders,
      aboutUs: doc?.aboutUs || DEFAULT_SITE_CONTENT.aboutUs,
      team: doc?.team && doc.team.length > 0 ? doc.team : DEFAULT_SITE_CONTENT.team,
      partners: doc?.partners && doc.partners.length > 0 ? doc.partners : DEFAULT_SITE_CONTENT.partners,
      blogCms: doc?.blogCms || DEFAULT_SITE_CONTENT.blogCms,
      seo: doc?.seo || DEFAULT_SITE_CONTENT.seo,
      faq: doc?.faq && doc.faq.length > 0 ? doc.faq : DEFAULT_SITE_CONTENT.faq,
      footer: doc?.footer || DEFAULT_SITE_CONTENT.footer,
      updatedAt: doc?.updatedAt || new Date(),
    };
  } catch (error) {
    console.error('Failed to get SiteContent from database, safely falling back to defaults:', error);
    return {
      ...DEFAULT_SITE_CONTENT,
      updatedAt: new Date(),
    };
  }
}

/**
 * Updates sections of the SiteContent configuration.
 */
export async function updateSiteContent(
  data: Partial<typeof DEFAULT_SITE_CONTENT>,
  updatedBy?: string
) {
  await connectToDatabase();
  await ensureSiteContentInitialized();

  let doc = await SiteContent.findOne({});
  if (!doc) {
    doc = await SiteContent.create({
      ...DEFAULT_SITE_CONTENT,
      ...data,
      updatedBy,
    });
  } else {
    if (data.hero) doc.hero = { ...doc.hero, ...data.hero };
    if (data.nfcConcept) doc.nfcConcept = { ...doc.nfcConcept, ...data.nfcConcept };
    if (data.sliders) doc.sliders = data.sliders;
    if (data.aboutUs) doc.aboutUs = { ...doc.aboutUs, ...data.aboutUs };
    if (data.team) doc.team = data.team;
    if (data.partners) doc.partners = data.partners;
    if (data.blogCms) doc.blogCms = { ...doc.blogCms, ...data.blogCms };
    if (data.seo) doc.seo = { ...doc.seo, ...data.seo };
    if (data.faq) doc.faq = data.faq;
    if (data.footer) doc.footer = { ...doc.footer, ...data.footer };
    if (updatedBy) doc.updatedBy = updatedBy;

    doc.markModified('hero');
    doc.markModified('nfcConcept');
    doc.markModified('sliders');
    doc.markModified('aboutUs');
    doc.markModified('team');
    doc.markModified('partners');
    doc.markModified('blogCms');
    doc.markModified('seo');
    doc.markModified('faq');
    doc.markModified('footer');

    await doc.save();
  }

  return doc.toObject ? doc.toObject() : doc;
}
