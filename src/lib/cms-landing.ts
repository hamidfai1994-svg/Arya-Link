import { connectToDatabase } from '@/lib/db/mongodb';
import { LandingCms, ILandingCmsDocument, INITIAL_LANDING_CMS } from '@/models/LandingCms.model';

export { INITIAL_LANDING_CMS, type ILandingCmsDocument } from '@/models/LandingCms.model';

/**
 * Ensures singleton LandingCms document exists in MongoDB.
 * If none exists, creates it with INITIAL_LANDING_CMS defaults.
 */
export async function ensureLandingCmsInitialized(): Promise<ILandingCmsDocument> {
  await connectToDatabase();

  const existing = await LandingCms.findOne({});
  if (existing) {
    return existing;
  }

  const initial = await LandingCms.findOneAndUpdate(
    {},
    {
      $setOnInsert: {
        general: INITIAL_LANDING_CMS.general,
        hero: INITIAL_LANDING_CMS.hero,
        plans: INITIAL_LANDING_CMS.plans,
        materials: INITIAL_LANDING_CMS.materials,
        testimonials: INITIAL_LANDING_CMS.testimonials,
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
 * Retrieves the global Landing CMS configuration.
 * Returns INITIAL_LANDING_CMS fallback if database query fails.
 */
export async function getLandingCms() {
  try {
    await connectToDatabase();
    let doc = await LandingCms.findOne({}).lean<ILandingCmsDocument | null>();

    if (!doc) {
      const initialized = await ensureLandingCmsInitialized();
      doc = initialized.toObject ? initialized.toObject() : initialized;
    }

    return {
      general: doc?.general || INITIAL_LANDING_CMS.general,
      hero: doc?.hero || INITIAL_LANDING_CMS.hero,
      plans: doc?.plans && doc.plans.length > 0 ? doc.plans : INITIAL_LANDING_CMS.plans,
      materials: doc?.materials && doc.materials.length > 0 ? doc.materials : INITIAL_LANDING_CMS.materials,
      testimonials: doc?.testimonials && doc.testimonials.length > 0 ? doc.testimonials : INITIAL_LANDING_CMS.testimonials,
      updatedAt: doc?.updatedAt || new Date(),
    };
  } catch (error) {
    console.error('Failed to get landing CMS from database, safely falling back to defaults:', error);
    return {
      ...INITIAL_LANDING_CMS,
      updatedAt: new Date(),
    };
  }
}

/**
 * Updates sections of the Landing CMS configuration.
 */
export async function updateLandingCms(
  data: Partial<typeof INITIAL_LANDING_CMS>,
  updatedBy?: string
) {
  await connectToDatabase();
  await ensureLandingCmsInitialized();

  let doc = await LandingCms.findOne({});
  if (!doc) {
    doc = await LandingCms.create({
      ...INITIAL_LANDING_CMS,
      ...data,
      updatedBy,
    });
  } else {
    if (data.general) doc.general = { ...doc.general, ...data.general };
    if (data.hero) doc.hero = { ...doc.hero, ...data.hero };
    if (data.plans) doc.plans = data.plans;
    if (data.materials) doc.materials = data.materials;
    if (data.testimonials) doc.testimonials = data.testimonials;
    if (updatedBy) doc.updatedBy = updatedBy;
    await doc.save();
  }

  return {
    general: doc.general,
    hero: doc.hero,
    plans: doc.plans,
    materials: doc.materials,
    testimonials: doc.testimonials,
    updatedAt: doc.updatedAt,
  };
}

