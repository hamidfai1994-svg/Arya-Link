import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// PUT: Save and update the entire modules (links) array of a profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;
    await connectToDatabase();

    const body = await req.json();
    const { profileId, id, alias, modules, links } = body;

    const modulesArray = modules || links;

    // 1. Validate modules array
    if (!Array.isArray(modulesArray)) {
      return NextResponse.json(
        {
          success: false,
          message: 'فرمت ماژول‌های ارسالی نامعتبر است. ماژول‌ها باید به صورت یک آرایه ارسال شوند.',
        },
        { status: 400 }
      );
    }

    // 2. Identify target profile belonging to current user
    const targetId = profileId || id;
    const isObjectId = targetId && mongoose.isValidObjectId(targetId);

    const query: any = { userId: currentUserId };
    if (isObjectId) {
      query._id = new mongoose.Types.ObjectId(targetId);
    } else if (alias) {
      query.alias = alias.toLowerCase().trim();
    }

    // 3. Find and update profile links in database
    const updatedProfile = await Profile.findOneAndUpdate(
      query,
      {
        $set: {
          links: modulesArray.map((mod: any, index: number) => ({
            ...mod,
            order: typeof mod.order === 'number' ? mod.order : index,
          })),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProfile) {
      return NextResponse.json(
        {
          success: false,
          message: 'پروفایل مورد نظر برای ذخیره‌سازی ماژول‌ها یافت نشد یا دسترسی مجاز نیست.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تمامی ماژول‌های پروفایل با موفقیت در پایگاه داده ذخیره و همگام‌سازی شدند.',
        count: updatedProfile.links.length,
        data: updatedProfile.links,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving profile modules:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در ذخیره‌سازی ماژول‌های پروفایل در پایگاه داده.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve only the modules array for a profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const alias = searchParams.get('alias');
    const id = searchParams.get('id');

    const query: any = { userId: currentUserId };
    if (id && mongoose.isValidObjectId(id)) {
      query._id = new mongoose.Types.ObjectId(id);
    } else if (alias) {
      query.alias = alias.toLowerCase().trim();
    }

    const profile = await Profile.findOne(query, 'links displayName alias').lean();

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'پروفایل مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: profile.links || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error retrieving modules:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در دریافت ماژول‌های پروفایل.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
