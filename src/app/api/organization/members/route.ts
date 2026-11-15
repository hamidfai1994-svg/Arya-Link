import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Organization } from '@/models/Organization.model';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';

export const dynamic = 'force-dynamic';

async function resolveOrgOwnerAndOrganization() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.email) {
    return { error: 'احراز هویت انجام نشده است.', status: 401 as const };
  }

  await connectToDatabase();

  let currentUser = null;
  if (session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
    currentUser = await User.findById(session.user.id);
  }
  if (!currentUser && session.user.email) {
    currentUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
  }

  if (!currentUser) {
    return { error: 'حساب کاربری یافت نشد.', status: 401 as const };
  }

  const userIdStr = currentUser._id.toString();
  let org = await Organization.findOne({
    $or: [{ ownerId: currentUser._id }, { ownerId: userIdStr }],
  });

  if (!org && currentUser.orgRole === 'owner' && currentUser.organizationId) {
    if (mongoose.Types.ObjectId.isValid(String(currentUser.organizationId))) {
      org = await Organization.findById(currentUser.organizationId);
    }
  }

  if (!org || (currentUser.orgRole !== 'owner' && String(org.ownerId) !== userIdStr)) {
    return { error: 'شما مجوز مدیریت اعضای سازمان را ندارید.', status: 403 as const };
  }

  return { currentUser, org };
}

async function generateUniqueAlias(seedName: string): Promise<string> {
  let clean = seedName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();

  if (!clean || clean.length < 2) {
    clean = 'staff';
  }

  let candidate = `${clean}-${Math.floor(100 + Math.random() * 900)}`;
  while (await Profile.findOne({ alias: candidate })) {
    candidate = `${clean}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return candidate;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await resolveOrgOwnerAndOrganization();
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { org } = authResult;

    // Enforce license quota strictly
    if ((org.usedLicenses || 0) >= (org.totalLicenses || 0)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'ظرفیت پکیج شما تکمیل شده است. برای افزودن کارمند جدید، پکیج خود را ارتقا دهید.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const rawEmail = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const headline =
      typeof body.headline === 'string'
        ? body.headline.trim()
        : typeof body.occupation === 'string'
          ? body.occupation.trim()
          : '';
    const rawPassword = typeof body.password === 'string' ? body.password.trim() : '';

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'لطفاً نام و تخلص کارمند را وارد نمایید.' },
        { status: 400 }
      );
    }

    if (!rawEmail) {
      return NextResponse.json(
        { success: false, error: 'لطفاً ایمیل کارمند را برای ورود به سیستم وارد نمایید.' },
        { status: 400 }
      );
    }

    const resolvedEmail = rawEmail;

    const existingUser = await User.findOne({ email: resolvedEmail });
    if (existingUser) {
      if (
        existingUser.organizationId &&
        String(existingUser.organizationId) !== org._id.toString()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'این کاربر هم‌اکنون عضو یک سازمان دیگر است.',
          },
          { status: 400 }
        );
      }

      if (
        existingUser.organizationId &&
        String(existingUser.organizationId) === org._id.toString() &&
        existingUser.isActive !== false
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'این کارمند قبلاً در سازمان شما ثبت و فعال شده است.',
          },
          { status: 400 }
        );
      }
    }

    const passwordToHash =
      rawPassword || `Arya#${Math.floor(100000 + Math.random() * 900000)}!`;
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    let memberUser = existingUser;
    if (!memberUser) {
      memberUser = await User.create({
        name,
        email: resolvedEmail,
        password: hashedPassword,
        phone,
        occupation: headline || 'عضو تیم',
        role: 'user',
        subscriptionPlan: 'pro',
        planType: 'pro',
        accountType: 'corporate',
        organizationId: org._id,
        orgRole: 'member',
        providers: [{ provider: 'credentials' }],
        isActive: true,
      });
    } else {
      memberUser.name = name;
      memberUser.organizationId = org._id;
      memberUser.orgRole = 'member';
      memberUser.accountType = 'corporate';
      memberUser.isActive = true;
      if (rawPassword) {
        memberUser.password = hashedPassword;
      }
      if (memberUser.planType === 'free') {
        memberUser.planType = 'pro';
        memberUser.subscriptionPlan = 'pro';
      }
      if (phone) {
        memberUser.phone = phone;
      }
      if (headline) {
        memberUser.occupation = headline;
      }
      await memberUser.save();
    }

    const branding = org.branding || {};
    const primaryColor = branding.primaryColor || '#0ea5e9';
    const secondaryColor = branding.secondaryColor || branding.accentColor || '#10b981';

    let employeeProfile = await Profile.findOne({ userId: memberUser._id });
    if (employeeProfile) {
      employeeProfile.orgId = org._id;
      employeeProfile.displayName = name;
      employeeProfile.headline = headline || `${org.name} — عضو تیم`;
      employeeProfile.email = resolvedEmail;
      if (phone) employeeProfile.phone = phone;
      if (branding.coverImage) employeeProfile.coverUrl = branding.coverImage;
      employeeProfile.isActive = true;
      const prevTheme =
        (employeeProfile.themeConfig as any)?.toObject?.() ||
        employeeProfile.themeConfig ||
        {};
      employeeProfile.themeConfig = {
        ...prevTheme,
        preset: 'dark_neon',
        primaryColor,
        accentColor: secondaryColor,
        buttonBgColor: primaryColor,
        buttonBorderColor: secondaryColor,
        backgroundType: 'gradient',
        bgGradientColors: ['#090d16', `${primaryColor}38`, `${secondaryColor}28`],
        backgroundColor:
          branding.backgroundColor ||
          `linear-gradient(135deg, #090d16 0%, ${primaryColor}26 50%, #0f172a 100%)`,
      };
      await employeeProfile.save();
    } else {
      // Generate unique mini-site alias and create subordinate corporate profile
      const aliasSeed = resolvedEmail.split('@')[0] || name;
      const uniqueAlias = await generateUniqueAlias(aliasSeed);

      employeeProfile = await Profile.create({
        userId: memberUser._id,
        orgId: org._id,
        alias: uniqueAlias,
        displayName: name,
        headline: headline || `${org.name} — عضو تیم`,
        bio:
          branding.companySlogan ||
          `عضو رسمی تیم ${org.name} در پلتفرم کارت هوشمند آریا لینک.`,
        avatarUrl: '',
        coverUrl: branding.coverImage || '',
        email: resolvedEmail,
        phone: phone || '',
        whatsapp: phone || '',
        location: 'افغانستان',
        directModeEnabled: false,
        hideBranding: false,
        seoTitle: `${name} | ${org.name}`,
        seoDescription: `کارت ویزیت دیجیتال رسمی ${name} از مجموعه ${org.name}`,
        themeConfig: {
          preset: 'dark_neon',
          primaryColor,
          accentColor: secondaryColor,
          buttonBgColor: primaryColor,
          buttonBorderColor: secondaryColor,
          backgroundType: 'gradient',
          bgGradientColors: ['#090d16', `${primaryColor}38`, `${secondaryColor}28`],
          backgroundColor:
            branding.backgroundColor ||
            `linear-gradient(135deg, #090d16 0%, ${primaryColor}26 50%, #0f172a 100%)`,
          cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
          textColor: '#ffffff',
          borderRadius: 'rounded-2xl',
        },
        links: [],
        isActive: true,
      });
    }

    org.usedLicenses = (org.usedLicenses || 0) + 1;
    await org.save();

    return NextResponse.json(
      {
        success: true,
        message: `کارمند جدید (${name}) با موفقیت اضافه شد و کارت دیجیتال وی ساخته شد.`,
        usedLicenses: org.usedLicenses,
        totalLicenses: org.totalLicenses,
        member: {
          _id: memberUser._id.toString(),
          name: memberUser.name,
          email: memberUser.email,
          phone: memberUser.phone || '',
          occupation: memberUser.occupation || '',
          orgRole: memberUser.orgRole || 'member',
          isActive: memberUser.isActive,
          createdAt: memberUser.createdAt,
          profile: {
            _id: employeeProfile._id.toString(),
            alias: employeeProfile.alias,
            displayName: employeeProfile.displayName,
            headline: employeeProfile.headline || '',
            avatarUrl: employeeProfile.avatarUrl || '',
            isActive: employeeProfile.isActive,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/organization/members:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در افزودن کارمند جدید به سازمان.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await resolveOrgOwnerAndOrganization();
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { currentUser, org } = authResult;
    const body = await req.json();
    const memberId = typeof body.memberId === 'string' ? body.memberId.trim() : '';
    const action = typeof body.action === 'string' ? body.action.trim() : 'update';

    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, error: 'شناسه کارمند نامعتبر است.' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(memberId);
    if (
      !targetUser ||
      String(targetUser.organizationId || '') !== org._id.toString()
    ) {
      return NextResponse.json(
        { success: false, error: 'این کارمند در سازمان شما یافت نشد.' },
        { status: 404 }
      );
    }

    if (action === 'deactivate') {
      if (memberId === currentUser._id.toString() || targetUser.orgRole === 'owner') {
        return NextResponse.json(
          { success: false, error: 'مدیر سازمان نمی‌تواند حساب خود را غیرفعال کند.' },
          { status: 400 }
        );
      }

      const wasActive = targetUser.isActive !== false;
      targetUser.isActive = false;
      await targetUser.save();

      await Profile.updateMany(
        { userId: targetUser._id },
        { $set: { isActive: false } }
      );

      if (wasActive) {
        org.usedLicenses = Math.max(0, (org.usedLicenses || 0) - 1);
        await org.save();
      }

      const updatedProfile = await Profile.findOne({ userId: targetUser._id })
        .select('alias displayName headline avatarUrl isActive')
        .lean();

      return NextResponse.json({
        success: true,
        message: 'اکانت کارمند مسدود شد، لینک مینی‌سایت وی از کار افتاد و ۱ جواز آزاد گردید.',
        usedLicenses: org.usedLicenses,
        totalLicenses: org.totalLicenses,
        member: {
          _id: targetUser._id.toString(),
          name: targetUser.name,
          email: targetUser.email,
          phone: targetUser.phone || '',
          occupation: targetUser.occupation || '',
          orgRole: targetUser.orgRole || 'member',
          isActive: false,
          createdAt: targetUser.createdAt,
          profile: updatedProfile
            ? {
                _id: updatedProfile._id.toString(),
                alias: updatedProfile.alias,
                displayName: updatedProfile.displayName,
                headline: updatedProfile.headline || '',
                avatarUrl: updatedProfile.avatarUrl || '',
                isActive: false,
              }
            : null,
        },
      });
    }

    if (action === 'reactivate') {
      const wasInactive = targetUser.isActive === false;
      if (wasInactive && (org.usedLicenses || 0) >= (org.totalLicenses || 0)) {
        return NextResponse.json(
          {
            success: false,
            error:
              'ظرفیت پکیج شما تکمیل شده است. برای افزودن کارمند جدید، پکیج خود را ارتقا دهید.',
          },
          { status: 403 }
        );
      }

      targetUser.isActive = true;
      await targetUser.save();

      await Profile.updateMany(
        { userId: targetUser._id },
        { $set: { isActive: true } }
      );

      if (wasInactive) {
        org.usedLicenses = (org.usedLicenses || 0) + 1;
        await org.save();
      }

      const updatedProfile = await Profile.findOne({ userId: targetUser._id })
        .select('alias displayName headline avatarUrl isActive')
        .lean();

      return NextResponse.json({
        success: true,
        message: 'دسترسی کارمند و لینک مینی‌سایت وی دوباره فعال شد.',
        usedLicenses: org.usedLicenses,
        totalLicenses: org.totalLicenses,
        member: {
          _id: targetUser._id.toString(),
          name: targetUser.name,
          email: targetUser.email,
          phone: targetUser.phone || '',
          occupation: targetUser.occupation || '',
          orgRole: targetUser.orgRole || 'member',
          isActive: true,
          createdAt: targetUser.createdAt,
          profile: updatedProfile
            ? {
                _id: updatedProfile._id.toString(),
                alias: updatedProfile.alias,
                displayName: updatedProfile.displayName,
                headline: updatedProfile.headline || '',
                avatarUrl: updatedProfile.avatarUrl || '',
                isActive: true,
              }
            : null,
        },
      });
    }

    // Default action: update employee name & job title (سِمت)
    const nextName = typeof body.name === 'string' ? body.name.trim() : '';
    const nextHeadline =
      typeof body.headline === 'string'
        ? body.headline.trim()
        : typeof body.occupation === 'string'
          ? body.occupation.trim()
          : '';

    if (!nextName) {
      return NextResponse.json(
        { success: false, error: 'لطفاً نام و تخلص کارمند را وارد نمایید.' },
        { status: 400 }
      );
    }

    targetUser.name = nextName;
    if (nextHeadline !== undefined) {
      targetUser.occupation = nextHeadline || 'عضو تیم';
    }
    await targetUser.save();

    await Profile.updateMany(
      { userId: targetUser._id },
      {
        $set: {
          displayName: nextName,
          headline: nextHeadline || `${org.name} — عضو تیم`,
        },
      }
    );

    const updatedProfile = await Profile.findOne({ userId: targetUser._id })
      .select('alias displayName headline avatarUrl isActive')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'مشخصات و سِمت شغلی کارمند با موفقیت بروزرسانی شد.',
      usedLicenses: org.usedLicenses,
      totalLicenses: org.totalLicenses,
      member: {
        _id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone || '',
        occupation: targetUser.occupation || '',
        orgRole: targetUser.orgRole || 'member',
        isActive: targetUser.isActive,
        createdAt: targetUser.createdAt,
        profile: updatedProfile
          ? {
              _id: updatedProfile._id.toString(),
              alias: updatedProfile.alias,
              displayName: updatedProfile.displayName,
              headline: updatedProfile.headline || '',
              avatarUrl: updatedProfile.avatarUrl || '',
              isActive: updatedProfile.isActive,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error in PATCH /api/organization/members:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ویرایش مشخصات کارمند.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await resolveOrgOwnerAndOrganization();
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { currentUser, org } = authResult;
    const { searchParams } = new URL(req.url);
    let memberId = searchParams.get('memberId');

    if (!memberId) {
      try {
        const body = await req.json();
        memberId = body?.memberId;
      } catch {
        // Ignore empty body
      }
    }

    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, error: 'شناسه کارمند نامعتبر است.' },
        { status: 400 }
      );
    }

    if (memberId === currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'مدیر سازمان نمی‌تواند حساب خود را حذف یا مسدود کند.' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(memberId);
    if (
      !targetUser ||
      String(targetUser.organizationId || '') !== org._id.toString()
    ) {
      return NextResponse.json(
        { success: false, error: 'این کارمند در سازمان شما یافت نشد.' },
        { status: 404 }
      );
    }

    const wasActive = targetUser.isActive !== false;

    // Block employee account & deactivate mini-site while freeing 1 organization license
    targetUser.isActive = false;
    await targetUser.save();

    await Profile.updateMany(
      { userId: targetUser._id },
      {
        $set: { isActive: false },
      }
    );

    if (wasActive) {
      org.usedLicenses = Math.max(0, (org.usedLicenses || 0) - 1);
      await org.save();
    }

    return NextResponse.json({
      success: true,
      message: 'اکانت کارمند غیرفعال شد، لینک مینی‌سایت وی مسدود گردید و ۱ جواز به ظرفیت سازمان بازگشت.',
      memberId: targetUser._id.toString(),
      isActive: false,
      usedLicenses: org.usedLicenses,
      totalLicenses: org.totalLicenses,
    });
  } catch (error) {
    console.error('Error in DELETE /api/organization/members:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در غیرفعال‌سازی کارمند سازمان.' },
      { status: 500 }
    );
  }
}
