import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { buildUserIsolationQuery, isValidUserSession } from '@/lib/db/data-isolation';
import { syncAndCheckUserSubscription } from '@/lib/utils/subscription';
import { profileUpdateSchema } from '@/lib/validations/profile';
import { getJobTemplate, generateDefaultModulesForJob } from '@/lib/constants/jobTemplates';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET: Retrieve user's active profile (strictly isolated to authenticated user)
export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const alias = searchParams.get('alias');
    const id = searchParams.get('id');

    const userCondition = buildUserIsolationQuery(session!.user);

    let profile = null;

    if (id && mongoose.isValidObjectId(id)) {
      profile = await Profile.findOne({ _id: new mongoose.Types.ObjectId(id), ...userCondition }).lean();
    } else if (alias && mongoose.isValidObjectId(alias)) {
      profile = await Profile.findOne({ _id: new mongoose.Types.ObjectId(alias), ...userCondition }).lean();
    }

    if (!profile && alias && alias.trim()) {
      profile = await Profile.findOne({ alias: alias.toLowerCase().trim(), ...userCondition }).lean();
    }

    if (!profile && id && id.trim() && !mongoose.isValidObjectId(id)) {
      profile = await Profile.findOne({ alias: id.toLowerCase().trim(), ...userCondition }).lean();
    }

    // Fallback to any existing profile belonging strictly to this user
    if (!profile) {
      profile = await Profile.findOne(userCondition).sort({ createdAt: 1 }).lean();
    }

    // ONLY IF user has truly ZERO profiles in the entire database, create their one personal profile
    if (!profile) {
      const totalUserProfiles = await Profile.countDocuments(userCondition);
      if (totalUserProfiles === 0) {
        let cleanName = (session!.user.name || 'user')
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
          email: currentUserEmail,
          userEmail: currentUserEmail,
          alias: uniqueAlias,
          displayName: session!.user.name || 'کاربر آریا لینک',
          headline: 'پروفایل شخصی',
          bio: 'به کارت هوشمند دیجیتال من در آریا لینک خوش آمدید.',
          avatarUrl: session!.user.image || '',
          phone: '',
          whatsapp: '',
          location: 'افغانستان',
          directModeEnabled: false,
          hideBranding: false,
          seoTitle: `${session!.user.name || 'کاربر'} | کارت دیجیتال آریا لینک`,
          seoDescription: 'صفحه اختصاصی ارتباطات و اشتراک‌گذاری خدمات',
          themeConfig: {
            preset: 'dark_neon',
            primaryColor: '#0ea5e9',
            accentColor: '#06b6d4',
            backgroundColor: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
            cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
            textColor: '#ffffff',
            borderRadius: 'rounded-2xl',
            backgroundType: 'gradient',
            bgSolidColor: '#090d16',
            bgGradientColors: ['#090d16', '#0f172a', '#1e1b4b'],
            bgGradientType: 'linear',
            bgPatternId: 'circuit',
            bgPatternOpacity: 0.15,
            bgImageUrl: '',
            bgImageOpacity: 0.25,
            bgGradientPosition: 50,
            bgPatternSize: 24,
            buttonShape: 'soft',
            buttonSize: 'md',
            buttonBorderWidth: 'thin',
            buttonBorderStyle: 'solid',
            buttonShadowStyle: 'sm',
            buttonBgColor: '#0ea5e9',
            buttonTextColor: '#ffffff',
            buttonBorderColor: '#38bdf8',
          },
          links: generateDefaultModulesForJob('general'),
          occupation: 'عمومی / سایر مشاغل',
          jobCategory: 'general',
          isActive: true,
        });

        profile = newDoc.toObject();
      } else {
        profile = await Profile.findOne(userCondition).sort({ createdAt: 1 }).lean();
      }
    }

    const subInfo = await syncAndCheckUserSubscription(currentUserId);

    const formattedProfile = {
      ...profile,
      id: (profile as any)._id.toString(),
      planType: subInfo.planType,
      planExpiresAt: subInfo.planExpiresAt || null,
      features: subInfo.features || {},
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
        message: 'خطا در دریافت اطلاعات پروفایل از پایگاه داده.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// POST: Update existing profile or create a new profile for the authenticated user
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
      crmTelegramChatId,
      crmTelegramEnable,
      financialSettings,
      job,
      templateId,
      jobCategory,
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
        { success: false, message: 'آی دی اختصاصی آدرس (Alias) الزامی است.' },
        { status: 400 }
      );
    }

    const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();
    if (!cleanAlias) {
      return NextResponse.json(
        { success: false, message: 'آی دی آدرس باید فقط شامل حروف انگلیسی، اعداد، خط تیره یا زیرخط باشد.' },
        { status: 400 }
      );
    }

    // 2. Check Alias Uniqueness across all users (excluding current profile)
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

    const userCondition = buildUserIsolationQuery(session!.user);

    // 3. Update existing user's profile or Create New (strictly isolated to current user)
    let savedProfile = null;

    const updateSet: Record<string, any> = {
      alias: cleanAlias,
      displayName: displayName.trim(),
      headline: headline || '',
      bio: bio || '',
      avatarUrl: avatarUrl || '',
      coverUrl: coverUrl || '',
      headerLayout: headerLayout || 'curve',
      phone: phone || '',
      whatsapp: whatsapp || '',
      email: email || currentUserEmail,
      userEmail: currentUserEmail,
      location: location || '',
      directModeEnabled: !!directModeEnabled,
      directModeUrl: directModeUrl || '',
      ...(seoTitle !== undefined && { seoTitle }),
      ...(seoDescription !== undefined && { seoDescription }),
      ...(hideBranding !== undefined && { hideBranding }),
      ...(Array.isArray(links) && { links }),
      ...(profileType && { profileType }),
      ...(isVerified !== undefined && { isVerified }),
      ...(verificationStatus && { verificationStatus }),
      ...(verificationData && { verificationData }),
      ...(profileLanguage && { profileLanguage }),
      ...(crmTelegramChatId !== undefined && { crmTelegramChatId: typeof crmTelegramChatId === 'string' ? crmTelegramChatId.trim() : '' }),
      ...(crmTelegramEnable !== undefined && { crmTelegramEnable: Boolean(crmTelegramEnable) }),
      ...(financialSettings !== undefined && { financialSettings }),
    };

    if (themeConfig && typeof themeConfig === 'object') {
      updateSet.themeConfig = themeConfig;
      console.log('Incoming themeConfig in /api/profile:', themeConfig);
    }

    if (isObjectId) {
      savedProfile = await Profile.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), ...userCondition },
        { $set: updateSet },
        { new: true, runValidators: false, strict: false }
      ).lean();
    }

    // Fallback 1: match by alias for current user if not matched by ObjectId
    if (!savedProfile && cleanAlias) {
      savedProfile = await Profile.findOneAndUpdate(
        { alias: cleanAlias, ...userCondition },
        { $set: updateSet },
        { new: true, runValidators: false, strict: false }
      ).lean();
    }

    // Fallback 2: Direct ownership verification if strict userCondition had format mismatch
    if (!savedProfile && isObjectId) {
      const existingDoc = await Profile.findById(id).lean();
      if (existingDoc) {
        const docUserId = String(existingDoc.userId || '');
        const docEmail = String(existingDoc.email || existingDoc.userEmail || '').toLowerCase();
        const sessUserId = String(currentUserId || '');
        const sessEmail = String(currentUserEmail || '').toLowerCase();

        const isOwner =
          (sessUserId && docUserId === sessUserId) ||
          (sessEmail && docEmail === sessEmail);

        if (isOwner) {
          savedProfile = await Profile.findByIdAndUpdate(
            id,
            { $set: updateSet },
            { new: true, runValidators: false, strict: false }
          ).lean();
        }
      }
    }

    // Fallback 3: Alias ownership verification
    if (!savedProfile && cleanAlias) {
      const existingDoc = await Profile.findOne({ alias: cleanAlias }).lean();
      if (existingDoc) {
        const docUserId = String(existingDoc.userId || '');
        const docEmail = String(existingDoc.email || existingDoc.userEmail || '').toLowerCase();
        const sessUserId = String(currentUserId || '');
        const sessEmail = String(currentUserEmail || '').toLowerCase();

        const isOwner =
          (sessUserId && docUserId === sessUserId) ||
          (sessEmail && docEmail === sessEmail);

        if (isOwner) {
          savedProfile = await Profile.findByIdAndUpdate(
            existingDoc._id,
            { $set: updateSet },
            { new: true, runValidators: false, strict: false }
          ).lean();
        }
      }
    }

    if (savedProfile) {
      console.log('Successfully saved profile themeConfig in DB:', savedProfile.themeConfig);
    }

    if (!savedProfile) {
      // Check if alias already exists to prevent duplicate key crashes
      const aliasExists = await Profile.findOne({ alias: cleanAlias }).lean();
      if (aliasExists) {
        return NextResponse.json(
          {
            success: false,
            message: 'این نام کاربری (لینک پروفایل) قبلاً ثبت شده و متعلق به حساب شما نیست.',
          },
          { status: 409 }
        );
      }

      const newDoc = await Profile.create({
        userId: currentUserId,
        email: email || currentUserEmail,
        userEmail: currentUserEmail,
        alias: cleanAlias,
        displayName: displayName.trim(),
        headline: headline || '',
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        coverUrl: coverUrl || '',
        headerLayout: headerLayout || 'curve',
        phone: phone || '',
        whatsapp: whatsapp || '',
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
          backgroundType: 'gradient',
          bgSolidColor: '#090d16',
          bgGradientColors: ['#090d16', '#0f172a', '#1e1b4b'],
          bgGradientType: 'linear',
          bgPatternId: 'circuit',
          bgPatternOpacity: 0.15,
          bgImageUrl: '',
          bgImageOpacity: 0.25,
          bgGradientPosition: 50,
          bgPatternSize: 24,
          buttonShape: 'soft',
          buttonSize: 'md',
          buttonBorderWidth: 'thin',
          buttonBorderStyle: 'solid',
          buttonShadowStyle: 'sm',
          buttonBgColor: '#0ea5e9',
          buttonTextColor: '#ffffff',
          buttonBorderColor: '#38bdf8',
        },
        links: Array.isArray(links) && links.length > 0 ? links : generateDefaultModulesForJob(templateId || jobCategory || job || 'general'),
        occupation: (typeof job === 'string' && job.trim()) || (job || jobCategory || templateId ? getJobTemplate(templateId || jobCategory || job).title : ''),
        jobCategory: job || jobCategory || templateId ? getJobTemplate(templateId || jobCategory || job).id : '',
        seoTitle: seoTitle || '',
        seoDescription: seoDescription || '',
        hideBranding: !!hideBranding,
        crmTelegramChatId: typeof crmTelegramChatId === 'string' ? crmTelegramChatId.trim() : '',
        crmTelegramEnable: Boolean(crmTelegramEnable),
        isActive: true,
      });

      savedProfile = newDoc.toObject();
    }

    // Cache Invalidation for Public Profile (Mini-site)
    const targetAlias = savedProfile?.alias || cleanAlias;
    if (targetAlias) {
      try {
        revalidatePath(`/${targetAlias}`);
        revalidatePath(`/${targetAlias}`, 'page');
      } catch (e) {
        console.error('Cache revalidation failed:', e);
      }
    }

    const returnId = (savedProfile as any)?._id?.toString() || (savedProfile as any)?.id || id || '';

    return NextResponse.json({
      success: true,
      message: 'تغییرات پروفایل با موفقیت در پایگاه داده ذخیره و منتشر شد.',
      data: {
        ...(savedProfile || {}),
        id: returnId,
      },
    });
  } catch (error: any) {
    console.error('Error saving profile in /api/profile:', error);
    const detailedMessage =
      error?.message ||
      (typeof error === 'string' ? error : JSON.stringify(error)) ||
      'خطا در ذخیره‌سازی اطلاعات پروفایل در دیتابیس.';
    return NextResponse.json(
      {
        success: false,
        message: detailedMessage,
        error: detailedMessage,
      },
      { status: 500 }
    );
  }
}
