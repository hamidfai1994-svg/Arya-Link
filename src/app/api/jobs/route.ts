import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Job } from '@/models/Job.model';
import {
  JOB_CATEGORIES,
  JOB_TEMPLATES,
  INITIAL_SEED_JOBS,
  normalizeTemplateId,
} from '@/lib/constants/jobTemplates';

export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs
 * Retrieves all categories, reference templates, and all jobs (with auto-seeding if empty).
 */
export async function GET() {
  try {
    await connectToDatabase();

    // Auto-seed initial jobs if collection is completely empty, or update if old legacy seed is present
    const totalCount = await Job.countDocuments();
    if (totalCount === 0) {
      try {
        await Job.insertMany(INITIAL_SEED_JOBS, { ordered: false });
      } catch (seedErr) {
        console.warn('Initial jobs seeding warning:', seedErr);
      }
    } else {
      // Check if old legacy seed jobs are present and need Afghan Dari update
      const legacySeedJob = await Job.findOne({ title: 'پزشک عمومی', isUserAdded: false }).lean();
      if (legacySeedJob) {
        try {
          await Job.deleteMany({ isUserAdded: false });
          await Job.insertMany(INITIAL_SEED_JOBS, { ordered: false });
        } catch (syncErr) {
          console.warn('Seed refresh warning:', syncErr);
        }
      }
    }

    const rawJobs = await Job.find().sort({ isUserAdded: 1, title: 1 }).lean();

    const formattedJobs = rawJobs.map((j: any) => ({
      id: j._id.toString(),
      title: j.title,
      categoryId: j.categoryId,
      templateId: normalizeTemplateId(j.templateId),
      isUserAdded: Boolean(j.isUserAdded),
      createdAt: j.createdAt,
    }));

    return NextResponse.json({
      success: true,
      categories: JOB_CATEGORIES,
      templates: JOB_TEMPLATES,
      jobs: formattedJobs,
    });
  } catch (error: any) {
    console.error('Error in GET /api/jobs:', error);
    // Fallback gracefully to memory seed if database query fails
    return NextResponse.json({
      success: true,
      fallback: true,
      categories: JOB_CATEGORIES,
      templates: JOB_TEMPLATES,
      jobs: INITIAL_SEED_JOBS.map((j, idx) => ({
        id: `seed_${idx}`,
        title: j.title,
        categoryId: j.categoryId,
        templateId: j.templateId,
        isUserAdded: false,
      })),
    });
  }
}

/**
 * POST /api/jobs
 * Registers a new user-added job into the central database.
 * Sets isUserAdded: true and links to the appropriate templateId (default: 'general').
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, categoryId, templateId } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'عنوان شغل باید حداقل شامل 2 کاراکتر معتبر باشد.' },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();

    // Validate category or fallback to 'other'
    const matchedCategory = JOB_CATEGORIES.find((c) => c.id === categoryId);
    const cleanCategoryId = matchedCategory ? matchedCategory.id : 'other';

    // Default templateId to category default or 'general'
    const cleanTemplateId = templateId
      ? normalizeTemplateId(templateId)
      : matchedCategory?.defaultTemplateId || 'general';

    await connectToDatabase();

    // Check if job already exists (case-insensitive regex)
    const escaped = cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingJob = await Job.findOne({
      title: { $regex: new RegExp(`^${escaped}$`, 'i') },
    }).lean();

    if (existingJob) {
      return NextResponse.json({
        success: true,
        message: 'این شغل قبلاً در سیستم ثبت شده است.',
        data: {
          id: (existingJob as any)._id.toString(),
          title: existingJob.title,
          categoryId: existingJob.categoryId,
          templateId: normalizeTemplateId(existingJob.templateId),
          isUserAdded: Boolean(existingJob.isUserAdded),
        },
      });
    }

    // Create new job
    const createdDoc = await Job.create({
      title: cleanTitle,
      categoryId: cleanCategoryId,
      templateId: cleanTemplateId,
      isUserAdded: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'شغل جدید با موفقیت ثبت شد و به سیستم اضافه گردید.',
        data: {
          id: createdDoc._id.toString(),
          title: createdDoc.title,
          categoryId: createdDoc.categoryId,
          templateId: cleanTemplateId,
          isUserAdded: true,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در ثبت شغل جدید در پایگاه داده.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

