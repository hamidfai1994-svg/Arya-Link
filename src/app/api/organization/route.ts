import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Organization } from '@/models/Organization.model';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';
import { Lead } from '@/models/Lead.model';

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
      if (currentUser.orgRole === 'member' && currentUser.organizationId) {
        const orgIdVal = String(currentUser.organizationId);
        const memberOrg = mongoose.Types.ObjectId.isValid(orgIdVal)
          ? await Organization.findById(orgIdVal).lean()
          : null;

        if (memberOrg) {
          return NextResponse.json({
            success: true,
            isOwner: false,
            orgRole: 'member',
            organization: {
              _id: memberOrg._id.toString(),
              name: memberOrg.name,
              branding: {
                ...(memberOrg.branding || {}),
                secondaryColor:
                  memberOrg.branding?.secondaryColor ||
                  memberOrg.branding?.accentColor ||
                  '#10b981',
                coverImage: memberOrg.branding?.coverImage || '',
              },
            },
            members: [],
          });
        }
      }

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
      .select(
        'userId orgId alias displayName headline avatarUrl email phone isActive viewsCount leadsCount links createdAt'
      )
      .lean();

    const profileIds = orgProfiles.map((p: any) => p._id);
    const profileIdStrings = orgProfiles.map((p: any) => p._id.toString());

    const profileById = new Map<string, any>();
    for (const p of orgProfiles) {
      profileById.set(p._id.toString(), p);
    }

    const memberByUserId = new Map<string, any>();
    for (const u of orgUsers) {
      memberByUserId.set(u._id.toString(), u);
    }

    // Fetch all CRM leads belonging to this organization OR captured via any employee's card
    const orgLeadsRaw = await Lead.find({
      $or: [
        { organizationId: org._id },
        { organizationId: orgIdStr },
        ...(profileIds.length > 0
          ? [{ profileId: { $in: [...profileIds, ...profileIdStrings] } }]
          : []),
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const leadCountByProfileId = new Map<string, number>();
    for (const lead of orgLeadsRaw) {
      const pid = String(lead.profileId || '');
      if (pid) {
        leadCountByProfileId.set(pid, (leadCountByProfileId.get(pid) || 0) + 1);
      }
    }

    let totalTeamViews = 0;
    let totalTeamClicks = 0;
    const statsByUserId = new Map<
      string,
      { viewsCount: number; clicksCount: number; leadsCount: number }
    >();

    for (const p of orgProfiles) {
      const uid = String(p.userId || '');
      const pViews = Number(p.viewsCount || 0);
      const pClicks = Array.isArray(p.links)
        ? p.links.reduce((acc: number, ln: any) => acc + Number(ln?.clickCount || 0), 0)
        : 0;
      const pLeads = leadCountByProfileId.get(p._id.toString()) || 0;

      totalTeamViews += pViews;
      totalTeamClicks += pClicks;

      if (uid) {
        const current = statsByUserId.get(uid) || {
          viewsCount: 0,
          clicksCount: 0,
          leadsCount: 0,
        };
        current.viewsCount += pViews;
        current.clicksCount += pClicks;
        current.leadsCount += pLeads;
        statsByUserId.set(uid, current);
      }
    }

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
      const uid = u._id.toString();
      const p = profileByUserId.get(uid) || null;
      const memberStats = statsByUserId.get(uid) || {
        viewsCount: 0,
        clicksCount: 0,
        leadsCount: 0,
      };
      return {
        _id: uid,
        name: u.name,
        email: u.email,
        phone: u.phone || p?.phone || '',
        occupation: u.occupation || p?.headline || '',
        orgRole: u.orgRole || 'member',
        isActive: u.isActive,
        createdAt: u.createdAt,
        viewsCount: memberStats.viewsCount,
        clicksCount: memberStats.clicksCount,
        leadsCount: memberStats.leadsCount,
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

    const leaderboard = [...members]
      .sort((a, b) => {
        if (b.viewsCount !== a.viewsCount) return b.viewsCount - a.viewsCount;
        if (b.clicksCount !== a.clicksCount) return b.clicksCount - a.clicksCount;
        return b.leadsCount - a.leadsCount;
      })
      .map((m) => ({
        memberId: m._id,
        name: m.name,
        email: m.email,
        occupation: m.occupation,
        orgRole: m.orgRole,
        isActive: m.isActive,
        alias: m.profile?.alias || '',
        avatarUrl: m.profile?.avatarUrl || '',
        viewsCount: m.viewsCount,
        clicksCount: m.clicksCount,
        leadsCount: m.leadsCount,
      }));

    const leads = orgLeadsRaw.map((lead: any) => {
      const prof = profileById.get(String(lead.profileId));
      const emp =
        (lead.employeeUserId ? memberByUserId.get(String(lead.employeeUserId)) : null) ||
        (prof?.userId ? memberByUserId.get(String(prof.userId)) : null);
      return {
        _id: lead._id.toString(),
        profileId: String(lead.profileId),
        organizationId: lead.organizationId ? String(lead.organizationId) : orgIdStr,
        name: lead.name || 'مشتری بدون نام',
        phone: lead.phone || '—',
        email: lead.email || '',
        message: lead.message || '',
        status: lead.status || 'new',
        createdAt: lead.createdAt,
        employee: {
          _id: emp?._id ? String(emp._id) : '',
          name: emp?.name || prof?.displayName || 'کارمند سازمان',
          email: emp?.email || '',
          occupation: emp?.occupation || prof?.headline || '',
          alias: prof?.alias || '',
        },
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
        branding: {
          ...(org.branding || {}),
          secondaryColor:
            org.branding?.secondaryColor || org.branding?.accentColor || '#10b981',
          coverImage: org.branding?.coverImage || '',
        },
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      },
      members,
      analytics: {
        totalTeamViews,
        totalTeamClicks,
        totalTeamLeads: leads.length,
        ctr:
          totalTeamViews > 0
            ? Number(((totalTeamClicks / totalTeamViews) * 100).toFixed(1))
            : 0,
        leaderboard,
      },
      leads,
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

    const secondaryCol =
      body.branding?.secondaryColor || body.branding?.accentColor || '#10b981';

    const brandingPayload = {
      primaryColor: body.branding?.primaryColor || '#0ea5e9',
      secondaryColor: secondaryCol,
      accentColor: secondaryCol,
      coverImage:
        typeof body.branding?.coverImage === 'string'
          ? body.branding.coverImage.trim()
          : '',
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
      const resolvedSecondary =
        body.branding.secondaryColor ||
        body.branding.accentColor ||
        org.branding?.secondaryColor ||
        org.branding?.accentColor ||
        '#10b981';

      org.branding = {
        primaryColor: body.branding.primaryColor || org.branding?.primaryColor || '#0ea5e9',
        secondaryColor: resolvedSecondary,
        accentColor: resolvedSecondary,
        coverImage:
          typeof body.branding.coverImage === 'string'
            ? body.branding.coverImage.trim()
            : org.branding?.coverImage || '',
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

    // Sync unified corporate theme and cover across all subordinate employee profiles
    const shouldSyncMembers = body.applyToAllMembers !== false;
    if (shouldSyncMembers) {
      const orgIdStr = org._id.toString();
      const orgUsers = await User.find({
        $or: [{ organizationId: org._id }, { organizationId: orgIdStr }],
      })
        .select('_id')
        .lean();
      const memberIds = orgUsers.map((u: any) => u._id);
      const memberIdStrs = orgUsers.map((u: any) => u._id.toString());

      const secondary =
        org.branding?.secondaryColor || org.branding?.accentColor || '#10b981';
      const primary = org.branding?.primaryColor || '#0ea5e9';

      const updateSet: Record<string, any> = {
        'themeConfig.primaryColor': primary,
        'themeConfig.accentColor': secondary,
        'themeConfig.buttonBgColor': primary,
        'themeConfig.buttonBorderColor': secondary,
        'themeConfig.backgroundColor':
          org.branding?.backgroundColor ||
          'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
      };

      if (typeof org.branding?.coverImage === 'string') {
        updateSet.coverUrl = org.branding.coverImage;
      }

      if (body.syncLogoAsAvatar && org.branding?.logoUrl) {
        updateSet.avatarUrl = org.branding.logoUrl;
      }

      await Profile.updateMany(
        {
          $or: [
            { orgId: org._id },
            { orgId: orgIdStr },
            { userId: { $in: [...memberIds, ...memberIdStrs] } },
          ],
        },
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
