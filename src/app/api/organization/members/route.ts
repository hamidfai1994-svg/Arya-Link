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

    // Enforce license quota
    if (org.usedLicenses >= org.totalLicenses) {
      return NextResponse.json(
        {
          success: false,
          error:
            'ظرفیت جوازهای (لایسنس‌های) سازمان شما تکمیل شده است. لطفاً بسته سازمانی خود را ارتقا دهید.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const rawEmail = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const headline = typeof body.headline === 'string' ? body.headline.trim() : '';
    const rawPassword = typeof body.password === 'string' ? body.password.trim() : '';

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'لطفاً نام و تخلص کارمند را وارد نمایید.' },
        { status: 400 }
      );
    }

    if (!rawEmail && !phone) {
      return NextResponse.json(
        { success: false, error: 'وارد کردن ایمیل آدرس یا شماره تماس کارمند الزامی است.' },
        { status: 400 }
      );
    }

    // Generate valid placeholder corporate email when only phone is provided
    const cleanPhoneDigits = phone.replace(/[^0-9]/g, '');
    const resolvedEmail =
      rawEmail || `staff_${cleanPhoneDigits || Date.now()}@aryalink.af`;

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
        String(existingUser.organizationId) === org._id.toString()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'این کارمند قبلاً در سازمان شما ثبت شده است.',
          },
          { status: 400 }
        );
      }
    }

    let memberUser = existingUser;
    if (!memberUser) {
      const passwordToHash = rawPassword || 'AryaCorp123!';
      const hashedPassword = await bcrypt.hash(passwordToHash, 10);

      memberUser = await User.create({
        name,
        email: resolvedEmail,
        password: hashedPassword,
        phone,
        occupation: headline || 'کارمند سازمان',
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
      memberUser.organizationId = org._id;
      memberUser.orgRole = 'member';
      memberUser.accountType = 'corporate';
      if (memberUser.planType === 'free') {
        memberUser.planType = 'pro';
        memberUser.subscriptionPlan = 'pro';
      }
      if (phone && !memberUser.phone) {
        memberUser.phone = phone;
      }
      if (headline && !memberUser.occupation) {
        memberUser.occupation = headline;
      }
      await memberUser.save();
    }

    // Generate unique mini-site alias and create subordinate corporate profile
    const aliasSeed = rawEmail ? rawEmail.split('@')[0] : name;
    const uniqueAlias = await generateUniqueAlias(aliasSeed);

    const branding = org.branding || {};
    const employeeProfile = await Profile.create({
      userId: memberUser._id,
      orgId: org._id,
      alias: uniqueAlias,
      displayName: name,
      headline: headline || `${org.name} — عضو تیم`,
      bio:
        branding.companySlogan ||
        `عضو رسمی تیم ${org.name} در پلتفرم کارت هوشمند آریا لینک.`,
      avatarUrl: branding.logoUrl || '',
      email: rawEmail || '',
      phone: phone || '',
      whatsapp: phone || '',
      location: 'افغانستان',
      directModeEnabled: false,
      hideBranding: false,
      seoTitle: `${name} | ${org.name}`,
      seoDescription: `کارت ویزیت دیجیتال رسمی ${name} از مجموعه ${org.name}`,
      themeConfig: {
        preset: 'corporate_pro',
        primaryColor: branding.primaryColor || '#0ea5e9',
        accentColor: branding.accentColor || '#10b981',
        backgroundColor:
          branding.backgroundColor ||
          'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
        cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
        textColor: '#ffffff',
        borderRadius: 'rounded-2xl',
      },
      links: [],
      isActive: true,
    });

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
        { success: false, error: 'مدیر سازمان نمی‌تواند حساب خود را حذف کند.' },
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

    targetUser.organizationId = null;
    targetUser.orgRole = null;
    await targetUser.save();

    // Detach and deactivate corporate profiles belonging to this employee under this org
    await Profile.updateMany(
      {
        userId: targetUser._id,
        $or: [{ orgId: org._id }, { orgId: org._id.toString() }],
      },
      {
        $set: { isActive: false, orgId: null },
      }
    );

    org.usedLicenses = Math.max(0, (org.usedLicenses || 0) - 1);
    await org.save();

    return NextResponse.json({
      success: true,
      message: 'کارمند از لیست سازمان خارج شد و جواز مربوطه آزاد گردید.',
      usedLicenses: org.usedLicenses,
      totalLicenses: org.totalLicenses,
    });
  } catch (error) {
    console.error('Error in DELETE /api/organization/members:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف کارمند از سازمان.' },
      { status: 500 }
    );
  }
}
