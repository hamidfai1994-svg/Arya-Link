import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { buildUserIsolationQuery, isValidUserSession } from '@/lib/db/data-isolation';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Helper to generate a clean, unique alias like hamidfasihi_123
async function generateUniqueAlias(rawName: string): Promise<string> {
  let cleanName = rawName
    .toLowerCase()
    .replace(/\s+/g, '') // remove all whitespace
    .replace(/[^a-z0-9_]/g, '') // keep only english alphanumeric & underscore
    .trim();

  if (!cleanName || cleanName.length < 2) {
    cleanName = 'user';
  }

  let alias = `${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
  while (await Profile.findOne({ alias })) {
    alias = `${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
  }
  return alias;
}

// GET: Retrieve all profiles strictly belonging to the authenticated user (User Data Isolation)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Strict user isolation filter: only profiles belonging to this session's userId or email
    const userQuery = buildUserIsolationQuery(session!.user);

    let profiles = await Profile.find(userQuery)
      .sort({ createdAt: 1 })
      .lean();

    // Auto-provisioning: If authenticated user has 0 profiles in DB, create their personal profile
    if (profiles.length === 0) {
      const uniqueAlias = await generateUniqueAlias(session!.user.name || 'user');
      const newPersonalProfile = await Profile.create({
        userId: session!.user.id,
        email: session!.user.email || '',
        userEmail: session!.user.email || '',
        alias: uniqueAlias,
        displayName: session!.user.name || 'کاربر آریا لینک',
        headline: 'پروفایل شخصی',
        bio: 'به کارت دیجیتال هوشمند من در آریا لینک خوش آمدید.',
        avatarUrl: session!.user.image || '',
        phone: '',
        whatsapp: '',
        location: 'افغانستان',
        directModeEnabled: false,
        hideBranding: false,
        seoTitle: `${session!.user.name || 'کاربر'} | کارت دیجیتال آریا لینک`,
        seoDescription: 'صفحه اختصاصی ارتباطات و لینک‌های هوشمند',
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

      profiles = [newPersonalProfile.toObject()];
    }

    const formattedList = profiles.map((p: any) => ({
      id: p._id.toString(),
      alias: p.alias,
      displayName: p.displayName,
      headline: p.headline || '',
      avatarUrl: p.avatarUrl || '',
      roleType: p.roleType || 'personal',
      isActive: p.isActive !== false,
      isVerified: !!p.isVerified,
      verificationStatus: p.verificationStatus || 'unverified',
      viewsCount: p.viewsCount || 0,
      leadsCount: p.leadsCount || 0,
      linksCount: Array.isArray(p.links) ? p.links.length : 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedList,
    });
  } catch (error: any) {
    console.error('Error fetching profiles list:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در دریافت لیست پروفایل‌ها از پایگاه داده.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// POST: Create a new profile for the authenticated user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const currentUserId = session!.user.id;
    const currentUserEmail = session!.user.email || '';
    await connectToDatabase();

    const body = await req.json();
    const { action, sourceProfileId, alias, displayName, roleType, headline } = body;

    // Handle Duplicate Profile Request
    if (action === 'duplicate' && sourceProfileId) {
      const userQuery = buildUserIsolationQuery(session!.user);
      const source = await Profile.findOne({ ...userQuery, _id: sourceProfileId }).lean();
      if (!source) {
        return NextResponse.json(
          { success: false, message: 'کارت مورد نظر جهت کپی یافت نشد.' },
          { status: 404 }
        );
      }

      const cloneAlias = await generateUniqueAlias(`${source.alias}_copy`);
      const clonedLinks = Array.isArray(source.links)
        ? source.links.map((link: any) => ({
            ...link,
            id: `mod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            clickCount: 0,
          }))
        : [];

      const duplicatedProfile = await Profile.create({
        userId: currentUserId,
        email: currentUserEmail,
        userEmail: currentUserEmail,
        alias: cloneAlias,
        displayName: `${source.displayName} (کپی)`,
        headline: source.headline || '',
        bio: source.bio || '',
        avatarUrl: source.avatarUrl || '',
        coverUrl: source.coverUrl || '',
        headerLayout: source.headerLayout || 'curve',
        phone: source.phone || '',
        whatsapp: source.whatsapp || '',
        location: source.location || '',
        directModeEnabled: false,
        directModeUrl: source.directModeUrl || '',
        themeConfig: source.themeConfig || {},
        links: clonedLinks,
        profileType: (source as any).profileType || 'personal',
        hideBranding: source.hideBranding || false,
        seoTitle: source.seoTitle ? `${source.seoTitle} (کپی)` : '',
        seoDescription: source.seoDescription || '',
        isActive: true,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'کارت با موفقیت کپی (Duplicate) شد.',
          data: {
            id: duplicatedProfile._id.toString(),
            alias: duplicatedProfile.alias,
            displayName: duplicatedProfile.displayName,
            headline: duplicatedProfile.headline,
            avatarUrl: duplicatedProfile.avatarUrl,
            roleType: ((duplicatedProfile as any).profileType || 'personal') as any,
            isActive: true,
          },
        },
        { status: 201 }
      );
    }

    if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
      return NextResponse.json(
        { success: false, message: 'نام نمایشی پروفایل الزامی است.' },
        { status: 400 }
      );
    }

    let cleanAlias = '';
    if (alias && typeof alias === 'string' && alias.trim()) {
      cleanAlias = alias.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();
    }

    if (!cleanAlias) {
      cleanAlias = await generateUniqueAlias(displayName);
    }

    // Check if alias is taken by another profile across database
    const existing = await Profile.findOne({ alias: cleanAlias });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'این شناسه آدرس قبلاً ثبت شده است. لطفاً شناسه دیگری انتخاب کنید.',
        },
        { status: 409 }
      );
    }

    const newProfile = await Profile.create({
      userId: currentUserId,
      email: currentUserEmail,
      userEmail: currentUserEmail,
      alias: cleanAlias,
      displayName: displayName.trim(),
      headline: headline || (roleType === 'business' ? 'پروفایل کاری و تجاری' : 'پروفایل شخصی'),
      bio: 'به کارت دیجیتال هوشمند جدید من در آریا لینک خوش آمدید.',
      avatarUrl: '',
      phone: '',
      whatsapp: '',
      location: 'افغانستان',
      directModeEnabled: false,
      hideBranding: false,
      seoTitle: `${displayName.trim()} | کارت دیجیتال آریا لینک`,
      seoDescription: `صفحه اختصاصی ${displayName.trim()}`,
      themeConfig: {
        preset: roleType === 'business' ? 'emerald_luxury' : 'dark_neon',
        primaryColor: roleType === 'business' ? '#059669' : '#0ea5e9',
        accentColor: roleType === 'business' ? '#10b981' : '#06b6d4',
        backgroundColor: roleType === 'business'
          ? 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)'
          : 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
        cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
        textColor: '#ffffff',
        borderRadius: 'rounded-2xl',
      },
      links: [],
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'پروفایل جدید با موفقیت ساخته شد.',
        data: {
          id: newProfile._id.toString(),
          alias: newProfile.alias,
          displayName: newProfile.displayName,
          headline: newProfile.headline,
          avatarUrl: newProfile.avatarUrl,
          roleType: roleType || 'personal',
          isActive: true,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در ایجاد پروفایل جدید.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove an extra profile belonging strictly to the authenticated user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const profileId = searchParams.get('id');

    if (!profileId) {
      return NextResponse.json(
        { success: false, message: 'شناسه پروفایل جهت حذف الزامی است.' },
        { status: 400 }
      );
    }

    const userQuery = buildUserIsolationQuery(session!.user);

    // Check count of user profiles
    const totalProfiles = await Profile.countDocuments(userQuery);
    if (totalProfiles <= 1) {
      return NextResponse.json(
        { success: false, message: 'حداقل یک پروفایل اصلی باید در حساب کاربری باقی بماند.' },
        { status: 400 }
      );
    }

    const deleteQuery: any = {
      _id: mongoose.isValidObjectId(profileId) ? new mongoose.Types.ObjectId(profileId) : profileId,
      ...userQuery,
    };

    const deletedDoc = await Profile.findOneAndDelete(deleteQuery);
    if (!deletedDoc) {
      return NextResponse.json(
        { success: false, message: 'پروفایل مورد نظر یافت نشد یا متعلق به شما نیست.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'پروفایل با موفقیت حذف شد.',
      deletedId: profileId,
    });
  } catch (error: any) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در حذف پروفایل.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
