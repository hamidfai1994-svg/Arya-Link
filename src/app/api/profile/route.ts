import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET: Retrieve user's active profile
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

    let profile = null;

    if (id && mongoose.isValidObjectId(id)) {
      profile = await Profile.findOne({ _id: new mongoose.Types.ObjectId(id), userId: currentUserId }).lean();
    } else if (alias && alias.trim()) {
      profile = await Profile.findOne({ alias: alias.toLowerCase().trim(), userId: currentUserId }).lean();
    }

    // Fallback to any existing profile belonging to this user
    if (!profile) {
      profile = await Profile.findOne({ userId: currentUserId }).sort({ createdAt: 1 }).lean();
    }

    // ONLY IF user has truly ZERO profiles in the entire database, create their one personal profile
    if (!profile) {
      const totalUserProfiles = await Profile.countDocuments({ userId: currentUserId });
      if (totalUserProfiles === 0) {
        let cleanName = (session.user.name || 'user')
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9_]/g, '')
          .trim();

        if (!cleanName || cleanName.length < 2) {
          cleanName = 'user';
        }

        let uniqueAlias = `${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
        while (await Profile.findOne({ alias: uniqueAlias })) {
          uniqueAlias = `${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
        }

        const newDoc = await Profile.create({
          userId: currentUserId,
          alias: uniqueAlias,
          displayName: session.user.name || 'کاربر آریا لینک',
          headline: 'پروفایل شخصی',
          bio: 'به کارت هوشمند دیجیتال من در آریا لینک خوش آمدید.',
          avatarUrl: session.user.image || '',
          email: session.user.email || '',
          phone: '',
          whatsapp: '',
          location: 'افغانستان',
          directModeEnabled: false,
          hideBranding: false,
          seoTitle: `${session.user.name || 'کاربر'} | کارت دیجیتال آریا لینک`,
          seoDescription: 'صفحه اختصاصی ارتباطات و اشتراک‌گذاری خدمات',
          themeConfig: {
            preset: 'dark_neon',
            primaryColor: '#0ea5e9',
            accentColor: '#06b6d4',
            backgroundColor: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
            cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
            textColor: '#ffffff',
            borderRadius: 'rounded-2xl',
          },
          links: [],
          isActive: true,
        });

        profile = newDoc.toObject();
      } else {
        profile = await Profile.findOne({ userId: currentUserId }).sort({ createdAt: 1 }).lean();
      }
    }

    const formattedProfile = {
      ...profile,
      id: (profile as any)._id.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedProfile,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در خواندن اطلاعات پروفایل از پایگاه داده.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// POST / PUT: Update or create profile belonging to the authenticated user
export async function POST(req: NextRequest) {
  return handleSaveProfile(req);
}

export async function PUT(req: NextRequest) {
  return handleSaveProfile(req);
}

async function handleSaveProfile(req: NextRequest) {
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
    const {
      id,
      alias,
      displayName,
      headline,
      bio,
      avatarUrl,
      coverUrl,
      headerLayout,
      phone,
      whatsapp,
      email,
      location,
      directModeEnabled,
      directModeUrl,
      themeConfig,
      seoTitle,
      seoDescription,
      hideBranding,
      links,
      profileType,
      isVerified,
      verificationStatus,
      verificationData,
      profileLanguage,
    } = body;

    // 1. Validation
    if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
      return NextResponse.json(
        { success: false, message: 'نام نمایشی پروفایل الزامی است.' },
        { status: 400 }
      );
    }

    if (!alias || typeof alias !== 'string' || !alias.trim()) {
      return NextResponse.json(
        { success: false, message: 'شناسه اختصاصی آدرس (Alias) الزامی است.' },
        { status: 400 }
      );
    }

    const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();
    if (!cleanAlias) {
      return NextResponse.json(
        { success: false, message: 'شناسه آدرس باید فقط شامل حروف انگلیسی، اعداد، خط تیره یا زیرخط باشد.' },
        { status: 400 }
      );
    }

    // 2. Check Alias Uniqueness across all users
    const isObjectId = id && mongoose.isValidObjectId(id);
    const aliasQuery: any = { alias: cleanAlias };
    if (isObjectId) {
      aliasQuery._id = { $ne: new mongoose.Types.ObjectId(id) };
    }

    const conflict = await Profile.findOne(aliasQuery).lean();
    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          message: 'این نام کاربری (لینک پروفایل) قبلاً ثبت شده است. لطفاً نام دیگری انتخاب نمایید.',
        },
        { status: 409 }
      );
    }

    // 3. Update existing user's profile or Create New
    let savedProfile = null;

    if (isObjectId) {
      savedProfile = await Profile.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), userId: currentUserId },
        {
          $set: {
            alias: cleanAlias,
            displayName: displayName.trim(),
            headline: headline || '',
            bio: bio || '',
            avatarUrl: avatarUrl || '',
            coverUrl: coverUrl || '',
            headerLayout: headerLayout || 'curve',
            phone: phone || '',
            whatsapp: whatsapp || '',
            email: email || '',
            location: location || '',
            directModeEnabled: !!directModeEnabled,
            directModeUrl: directModeUrl || '',
            ...(themeConfig && { themeConfig }),
            ...(seoTitle !== undefined && { seoTitle }),
            ...(seoDescription !== undefined && { seoDescription }),
            ...(hideBranding !== undefined && { hideBranding }),
            ...(Array.isArray(links) && { links }),
            ...(profileType && { profileType }),
            ...(isVerified !== undefined && { isVerified }),
            ...(verificationStatus && { verificationStatus }),
            ...(verificationData && { verificationData }),
            ...(profileLanguage && { profileLanguage }),
          },
        },
        { new: true, runValidators: true }
      ).lean();
    }

    if (!savedProfile) {
      const newDoc = await Profile.create({
        userId: currentUserId,
        alias: cleanAlias,
        displayName: displayName.trim(),
        headline: headline || '',
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        coverUrl: coverUrl || '',
        headerLayout: headerLayout || 'curve',
        phone: phone || '',
        whatsapp: whatsapp || '',
        email: email || '',
        location: location || '',
        directModeEnabled: !!directModeEnabled,
        directModeUrl: directModeUrl || '',
        profileType: profileType || 'personal',
        isVerified: !!isVerified,
        verificationStatus: verificationStatus || 'unverified',
        verificationData: verificationData || {},
        profileLanguage: profileLanguage || 'dari',
        themeConfig: themeConfig || {
          preset: 'dark_neon',
          primaryColor: '#0ea5e9',
          accentColor: '#06b6d4',
          backgroundColor: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
          cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
          textColor: '#ffffff',
          borderRadius: 'rounded-2xl',
        },
        links: Array.isArray(links) ? links : [],
        seoTitle: seoTitle || '',
        seoDescription: seoDescription || '',
        hideBranding: !!hideBranding,
        isActive: true,
      });

      savedProfile = newDoc.toObject();
    }

    return NextResponse.json({
      success: true,
      message: 'تغییرات پروفایل با موفقیت در پایگاه داده ذخیره و منتشر شد.',
      data: {
        ...savedProfile,
        id: (savedProfile as any)._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در ذخیره‌سازی اطلاعات پروفایل در دیتابیس.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
