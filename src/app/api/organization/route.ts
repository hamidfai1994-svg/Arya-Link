import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Organization } from '@/models/Organization.model';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';

export const dynamic = 'force-dynamic';

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.email) {
    return null;
  }

  await connectToDatabase();

  let user = null;
  if (session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
    user = await User.findById(session.user.id);
  }
  if (!user && session.user.email) {
    user = await User.findOne({ email: session.user.email.toLowerCase().trim() });
  }
  return user;
}

export async function GET() {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت انجام نشده است. لطفاً وارد حساب خود شوید.' },
        { status: 401 }
      );
    }

    const userIdStr = currentUser._id.toString();

    // Find organization owned by current user or linked when user has orgRole === 'owner'
    let org = await Organization.findOne({
      $or: [{ ownerId: currentUser._id }, { ownerId: userIdStr }],
    });

    if (!org && currentUser.orgRole === 'owner' && currentUser.organizationId) {
      if (mongoose.Types.ObjectId.isValid(String(currentUser.organizationId))) {
        org = await Organization.findById(currentUser.organizationId);
      }
    }

    if (!org || (currentUser.orgRole !== 'owner' && String(org.ownerId) !== userIdStr)) {
      return NextResponse.json({
        success: true,
        isOwner: false,
        orgRole: currentUser.orgRole || null,
        organization: null,
        members: [],
      });
    }

    // Keep user's owner link in sync
    if (
      currentUser.orgRole !== 'owner' ||
      String(currentUser.organizationId || '') !== org._id.toString()
    ) {
      currentUser.orgRole = 'owner';
      currentUser.organizationId = org._id;
      await currentUser.save();
    }

    const orgIdStr = org._id.toString();

    // Fetch all users attached to this organization
    const orgUsers = await User.find({
      $or: [{ organizationId: org._id }, { organizationId: orgIdStr }],
    })
      .select('name email phone occupation orgRole isActive createdAt avatar')
      .sort({ createdAt: -1 })
      .lean();

    const userIds = orgUsers.map((u: any) => u._id);
    const userIdStrings = orgUsers.map((u: any) => u._id.toString());

    // Fetch all subordinate profiles belonging to this organization or its members
    const orgProfiles = await Profile.find({
      $or: [
        { orgId: org._id },
        { orgId: orgIdStr },
        { userId: { $in: [...userIds, ...userIdStrings] } },
      ],
    })
      .select('userId orgId alias displayName headline avatarUrl email phone isActive createdAt')
      .lean();

    const profileByUserId = new Map<string, any>();
    for (const p of orgProfiles) {
      const uid = String(p.userId);
      // Prefer profile explicitly tagged with this orgId if user has multiple
      const existing = profileByUserId.get(uid);
      if (!existing || String(p.orgId || '') === orgIdStr) {
        profileByUserId.set(uid, p);
      }
    }

    const members = orgUsers.map((u: any) => {
      const p = profileByUserId.get(u._id.toString()) || null;
      return {
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone || p?.phone || '',
        occupation: u.occupation || p?.headline || '',
        orgRole: u.orgRole || 'member',
        isActive: u.isActive,
        createdAt: u.createdAt,
        profile: p
          ? {
              _id: p._id.toString(),
              alias: p.alias,
              displayName: p.displayName,
              headline: p.headline || '',
              avatarUrl: p.avatarUrl || '',
              isActive: p.isActive,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      isOwner: true,
      orgRole: 'owner',
      organization: {
        _id: org._id.toString(),
        name: org.name,
        ownerId: String(org.ownerId),
        totalLicenses: org.totalLicenses,
        usedLicenses: org.usedLicenses,
        branding: org.branding || {},
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      },
      members,
    });
  } catch (error) {
    console.error('Error in GET /api/organization:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات سازمان و اعضای تیم.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت انجام نشده است.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const totalLicenses =
      typeof body.totalLicenses === 'number' && body.totalLicenses > 0
        ? Math.floor(body.totalLicenses)
        : 50;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'نام شرکت یا سازمان الزامی است.' },
        { status: 400 }
      );
    }

    const userIdStr = currentUser._id.toString();
    let existingOrg = await Organization.findOne({
      $or: [{ ownerId: currentUser._id }, { ownerId: userIdStr }],
    });

    const brandingPayload = {
      primaryColor: body.branding?.primaryColor || '#0ea5e9',
      accentColor: body.branding?.accentColor || '#10b981',
      backgroundColor:
        body.branding?.backgroundColor ||
        'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
      logoUrl: body.branding?.logoUrl || '',
      companySlogan: body.branding?.companySlogan || '',
      enforceBranding:
        typeof body.branding?.enforceBranding === 'boolean'
          ? body.branding.enforceBranding
          : true,
    };

    if (existingOrg) {
      existingOrg.name = name;
      existingOrg.branding = {
        ...existingOrg.branding,
        ...brandingPayload,
      };
      await existingOrg.save();

      return NextResponse.json({
        success: true,
        message: 'مشخصات سازمان با موفقیت به‌روزرسانی شد.',
        organization: {
          _id: existingOrg._id.toString(),
          name: existingOrg.name,
          ownerId: String(existingOrg.ownerId),
          totalLicenses: existingOrg.totalLicenses,
          usedLicenses: existingOrg.usedLicenses,
          branding: existingOrg.branding,
        },
      });
    }

    const newOrg = await Organization.create({
      name,
      ownerId: currentUser._id,
      totalLicenses,
      usedLicenses: 0,
      branding: brandingPayload,
    });

    currentUser.organizationId = newOrg._id;
    currentUser.orgRole = 'owner';
    currentUser.accountType = 'corporate';
    if (currentUser.planType === 'free') {
      currentUser.planType = 'pro';
      currentUser.subscriptionPlan = 'enterprise';
    }
    await currentUser.save();

    return NextResponse.json(
      {
        success: true,
        message: 'سازمان شما با موفقیت راه‌اندازی شد.',
        organization: {
          _id: newOrg._id.toString(),
          name: newOrg.name,
          ownerId: String(newOrg.ownerId),
          totalLicenses: newOrg.totalLicenses,
          usedLicenses: newOrg.usedLicenses,
          branding: newOrg.branding,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/organization:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد یا ثبت مشخصات سازمان.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت انجام نشده است.' },
        { status: 401 }
      );
    }

    const userIdStr = currentUser._id.toString();
    const org = await Organization.findOne({
      $or: [{ ownerId: currentUser._id }, { ownerId: userIdStr }],
    });

    if (!org || (currentUser.orgRole !== 'owner' && String(org.ownerId) !== userIdStr)) {
      return NextResponse.json(
        { success: false, error: 'شما مجوز ویرایش تنظیمات این سازمان را ندارید.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (typeof body.name === 'string' && body.name.trim()) {
      org.name = body.name.trim();
    }

    if (body.branding && typeof body.branding === 'object') {
      org.branding = {
        primaryColor: body.branding.primaryColor || org.branding?.primaryColor || '#0ea5e9',
        accentColor: body.branding.accentColor || org.branding?.accentColor || '#10b981',
        backgroundColor:
          body.branding.backgroundColor ||
          org.branding?.backgroundColor ||
          'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
        logoUrl:
          typeof body.branding.logoUrl === 'string'
            ? body.branding.logoUrl.trim()
            : org.branding?.logoUrl || '',
        companySlogan:
          typeof body.branding.companySlogan === 'string'
            ? body.branding.companySlogan.trim()
            : org.branding?.companySlogan || '',
        enforceBranding:
          typeof body.branding.enforceBranding === 'boolean'
            ? body.branding.enforceBranding
            : org.branding?.enforceBranding ?? true,
      };
    }

    await org.save();

    // Sync unified corporate theme across all subordinate employee profiles if requested
    if (body.applyToAllMembers) {
      const orgIdStr = org._id.toString();
      const updateSet: Record<string, any> = {
        'themeConfig.primaryColor': org.branding?.primaryColor || '#0ea5e9',
        'themeConfig.accentColor': org.branding?.accentColor || '#10b981',
        'themeConfig.backgroundColor':
          org.branding?.backgroundColor ||
          'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
      };

      if (body.syncLogoAsAvatar && org.branding?.logoUrl) {
        updateSet.avatarUrl = org.branding.logoUrl;
      }

      await Profile.updateMany(
        { $or: [{ orgId: org._id }, { orgId: orgIdStr }] },
        { $set: updateSet }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تنظیمات برندینگ و مشخصات سازمان با موفقیت ذخیره شد.',
      organization: {
        _id: org._id.toString(),
        name: org.name,
        ownerId: String(org.ownerId),
        totalLicenses: org.totalLicenses,
        usedLicenses: org.usedLicenses,
        branding: org.branding,
      },
    });
  } catch (error) {
    console.error('Error in PATCH /api/organization:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بروزرسانی تنظیمات سازمان.' },
      { status: 500 }
    );
  }
}
