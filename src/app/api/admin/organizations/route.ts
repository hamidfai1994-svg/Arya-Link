import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Organization } from '@/models/Organization.model';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return role === 'superadmin' || role === 'admin';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران ارشد سیستم مجاز هستند.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const organizations = await Organization.find({})
      .sort({ createdAt: -1 })
      .lean();

    const ownerObjectIds: mongoose.Types.ObjectId[] = [];
    const ownerRawIds: string[] = [];
    const orgIds: mongoose.Types.ObjectId[] = [];
    const orgIdStrings: string[] = [];

    organizations.forEach((org: any) => {
      orgIds.push(org._id);
      orgIdStrings.push(org._id.toString());

      if (org.ownerId) {
        const rawOwner = String(org.ownerId);
        ownerRawIds.push(rawOwner);
        if (mongoose.Types.ObjectId.isValid(rawOwner)) {
          ownerObjectIds.push(new mongoose.Types.ObjectId(rawOwner));
        }
      }
    });

    const owners =
      ownerObjectIds.length > 0
        ? await User.find({ _id: { $in: ownerObjectIds } })
            .select('name email phone avatar orgRole')
            .lean()
        : [];

    const ownersMap: Record<string, any> = {};
    owners.forEach((u: any) => {
      ownersMap[u._id.toString()] = u;
    });

    const orgUsers =
      orgIds.length > 0
        ? await User.find({
            $or: [
              { organizationId: { $in: orgIds } },
              { organizationId: { $in: orgIdStrings } },
            ],
          })
            .select('organizationId orgRole')
            .lean()
        : [];

    const memberCountMap: Record<string, number> = {};
    orgUsers.forEach((u: any) => {
      if (u.organizationId && u.orgRole === 'member') {
        const key = String(u.organizationId);
        memberCountMap[key] = (memberCountMap[key] || 0) + 1;
      }
    });

    const formattedOrganizations = organizations.map((org: any) => {
      const orgIdStr = org._id.toString();
      const ownerIdStr = org.ownerId ? String(org.ownerId) : '';
      const owner = ownersMap[ownerIdStr];
      const liveMembersCount = memberCountMap[orgIdStr] || 0;

      return {
        id: orgIdStr,
        name: org.name,
        ownerId: ownerIdStr,
        ownerName: owner?.name || 'نامشخص',
        ownerEmail: owner?.email || '—',
        ownerPhone: owner?.phone || '',
        totalLicenses: Number(org.totalLicenses) || 50,
        usedLicenses: Math.max(Number(org.usedLicenses) || 0, liveMembersCount),
        membersCount: liveMembersCount,
        branding: org.branding || {},
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      organizations: formattedOrganizations,
    });
  } catch (error: any) {
    console.error('Error fetching admin organizations:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت لیست سازمان‌ها از پایگاه داده.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران ارشد سیستم مجاز هستند.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const cleanName = typeof body?.name === 'string' ? body.name.trim() : '';
    const normalizedEmail =
      typeof body?.ownerEmail === 'string' ? body.ownerEmail.trim().toLowerCase() : '';
    const parsedLicenses = Number(body?.totalLicenses);

    if (!cleanName) {
      return NextResponse.json(
        { success: false, message: 'لطفاً نام سازمان را وارد نمایید.' },
        { status: 400 }
      );
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'لطفاً یک ایمیل معتبر برای مدیر سازمان وارد نمایید.' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(parsedLicenses) || parsedLicenses < 1) {
      return NextResponse.json(
        { success: false, message: 'تعداد لایسنس خریداری شده باید حداقل ۱ عدد باشد.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const targetUser = await User.findOne({ email: normalizedEmail });
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            'کاربری با این ایمیل در سیستم یافت نشد. لطفاً ابتدا از ثبت‌نام این کاربر در پلتفرم اطمینان حاصل نمایید.',
        },
        { status: 404 }
      );
    }

    if (targetUser.orgRole === 'owner' && targetUser.organizationId) {
      const existingOrg = mongoose.Types.ObjectId.isValid(String(targetUser.organizationId))
        ? await Organization.findById(targetUser.organizationId).lean()
        : null;
      if (existingOrg) {
        return NextResponse.json(
          {
            success: false,
            message: `این کاربر هم‌اکنون مدیر سازمان «${existingOrg.name}» است.`,
          },
          { status: 400 }
        );
      }
    }

    const newOrg = await Organization.create({
      name: cleanName,
      ownerId: targetUser._id,
      totalLicenses: Math.floor(parsedLicenses),
      usedLicenses: 0,
    });

    targetUser.organizationId = newOrg._id;
    targetUser.orgRole = 'owner';
    targetUser.accountType = 'corporate';
    targetUser.planType = 'pro';
    targetUser.subscriptionPlan = 'enterprise';
    await targetUser.save();

    const userIdStr = targetUser._id.toString();
    await Profile.updateMany(
      {
        $or: [
          { userId: targetUser._id },
          { userId: userIdStr },
          { userEmail: targetUser.email },
        ],
      },
      {
        $set: {
          orgId: newOrg._id,
          roleType: 'business',
          profileType: 'business',
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: `سازمان «${newOrg.name}» با موفقیت ثبت شد و پنل مدیریت سازمانی برای ${targetUser.name} فعال گردید.`,
        organization: {
          id: newOrg._id.toString(),
          name: newOrg.name,
          ownerId: userIdStr,
          ownerName: targetUser.name,
          ownerEmail: targetUser.email,
          ownerPhone: targetUser.phone || '',
          totalLicenses: newOrg.totalLicenses,
          usedLicenses: newOrg.usedLicenses,
          membersCount: 0,
          branding: newOrg.branding || {},
          createdAt: newOrg.createdAt,
          updatedAt: newOrg.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور هنگام ثبت سازمان جدید.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const orgId = typeof body?.organizationId === 'string' ? body.organizationId.trim() : '';

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
      return NextResponse.json(
        { success: false, message: 'شناسه سازمان معتبر نیست.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const org = await Organization.findById(orgId);
    if (!org) {
      return NextResponse.json(
        { success: false, message: 'سازمان مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    if (typeof body?.name === 'string' && body.name.trim()) {
      org.name = body.name.trim();
    }

    if (body?.totalLicenses !== undefined) {
      const nextTotal = Math.floor(Number(body.totalLicenses));
      if (!Number.isFinite(nextTotal) || nextTotal < 1) {
        return NextResponse.json(
          { success: false, message: 'تعداد لایسنس باید حداقل ۱ عدد باشد.' },
          { status: 400 }
        );
      }
      if (nextTotal < (org.usedLicenses || 0)) {
        return NextResponse.json(
          {
            success: false,
            message: `تعداد کل لایسنس‌ها نمی‌تواند کمتر از تعداد کارمندان فعلی (${org.usedLicenses}) باشد.`,
          },
          { status: 400 }
        );
      }
      org.totalLicenses = nextTotal;
    }

    await org.save();

    return NextResponse.json({
      success: true,
      message: 'اطلاعات سازمان با موفقیت بروزرسانی شد.',
      organization: {
        id: org._id.toString(),
        name: org.name,
        totalLicenses: org.totalLicenses,
        usedLicenses: org.usedLicenses,
      },
    });
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بروزرسانی اطلاعات سازمان.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز.' },
        { status: 403 }
      );
    }

    const orgId = req.nextUrl.searchParams.get('id')?.trim() || '';
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
      return NextResponse.json(
        { success: false, message: 'شناسه سازمان معتبر نیست.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const org = await Organization.findById(orgId);
    if (!org) {
      return NextResponse.json(
        { success: false, message: 'سازمان مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    const orgObjectId = org._id;
    const orgIdStr = org._id.toString();

    await User.updateMany(
      {
        $or: [
          { organizationId: orgObjectId },
          { organizationId: orgIdStr },
        ],
      },
      {
        $set: {
          organizationId: null,
          orgRole: null,
          accountType: 'personal',
        },
      }
    );

    await Profile.updateMany(
      {
        $or: [
          { orgId: orgObjectId },
          { orgId: orgIdStr },
        ],
      },
      {
        $unset: { orgId: '' },
        $set: {
          roleType: 'personal',
          profileType: 'personal',
        },
      }
    );

    await Organization.findByIdAndDelete(orgObjectId);

    return NextResponse.json({
      success: true,
      message: `سازمان «${org.name}» با موفقیت حذف شد و وضعیت حساب کاربران مرتبط آزاد گردید.`,
    });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف سازمان.' },
      { status: 500 }
    );
  }
}
