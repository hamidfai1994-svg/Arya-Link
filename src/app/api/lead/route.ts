import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { Lead } from '@/models/Lead.model';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET: Fetch leads for a profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;
    const profileAlias = searchParams.get('profileAlias');
    const profileId = searchParams.get('profileId');

    let targetProfile = null;
    if (profileAlias) {
      targetProfile = await Profile.findOne({
        alias: profileAlias.toLowerCase().trim(),
        userId: session.user.id,
      }).select('_id');
    } else if (profileId && mongoose.isValidObjectId(profileId)) {
      targetProfile = await Profile.findOne({
        _id: new mongoose.Types.ObjectId(profileId),
        userId: session.user.id,
      }).select('_id');
    } else {
      targetProfile = await Profile.findOne({ userId: session.user.id }).select('_id');
    }

    if (!targetProfile) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const leads = await Lead.find({ profileId: targetProfile._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedLeads = leads.map((l: any) => ({
      id: l._id.toString(),
      name: l.name,
      phone: l.phone,
      email: l.email || '',
      message: l.message,
      status: l.status,
      dateStr: new Date(l.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: l.createdAt,
    }));

    return NextResponse.json({ success: true, data: formattedLeads }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در خواندن پیام‌ها', error: error?.message },
      { status: 500 }
    );
  }
}

// PATCH: Update status of a lead
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { id, status } = body;

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'آی دی پیام نامعتبر است' }, { status: 400 });
    }

    const updated = await Lead.findByIdAndUpdate(
      id,
      { $set: { status: status === 'contacted' ? 'contacted' : 'new' } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating lead status:', error);
    return NextResponse.json({ success: false, message: 'خطا در ویرایش وضعیت پیام' }, { status: 500 });
  }
}

// DELETE: Delete a lead
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز' }, { status: 401 });
    }

    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'آی دی نامعتبر است' }, { status: 400 });
    }

    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'پیام حذف شد' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ success: false, message: 'خطا در حذف پیام' }, { status: 500 });
  }
}

// POST: Add a new lead / scanned contact manually
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'لطفاً وارد شوید.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { name, phone, email, message, profileAlias, profileId } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'نام و شماره تماس الزامی هستند.' },
        { status: 400 }
      );
    }

    let targetProfile = null;
    if (profileAlias) {
      targetProfile = await Profile.findOne({
        alias: profileAlias.toLowerCase().trim(),
        userId: session.user.id,
      }).select('_id');
    } else if (profileId && mongoose.isValidObjectId(profileId)) {
      targetProfile = await Profile.findOne({
        _id: new mongoose.Types.ObjectId(profileId),
        userId: session.user.id,
      }).select('_id');
    } else {
      targetProfile = await Profile.findOne({ userId: session.user.id }).select('_id');
    }

    if (!targetProfile) {
      return NextResponse.json(
        { success: false, message: 'پروفایل متصل یافت نشد.' },
        { status: 404 }
      );
    }

    const newLead = await Lead.create({
      profileId: targetProfile._id,
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      message: (message || 'مخاطب اسکن شده از کارت ویزیت کاغذی').trim(),
      status: 'new',
    });

    return NextResponse.json({
      success: true,
      message: 'مخاطب با موفقیت به لیست لیدها اضافه شد.',
      data: {
        id: newLead._id.toString(),
        name: newLead.name,
        phone: newLead.phone,
        email: newLead.email,
        message: newLead.message,
        status: newLead.status,
        dateStr: 'همین الان',
        createdAt: newLead.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت مخاطب جدید.', error: error?.message },
      { status: 500 }
    );
  }
}
