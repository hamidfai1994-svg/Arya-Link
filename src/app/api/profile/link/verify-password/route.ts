import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { profileAlias, profileId, linkId, password } = body;

    if (!linkId || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'اطلاعات ارسالی ناقص است.' },
        { status: 400 }
      );
    }

    const query: any = {};
    if (profileId && mongoose.isValidObjectId(profileId)) {
      query._id = new mongoose.Types.ObjectId(profileId);
    } else if (profileAlias) {
      query.alias = String(profileAlias).toLowerCase().trim();
    } else {
      return NextResponse.json(
        { success: false, message: 'آی دی پروفایل مشخص نیست.' },
        { status: 400 }
      );
    }

    const profile = await Profile.findOne(query).lean();
    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'پروفایل یافت نشد.' },
        { status: 404 }
      );
    }

    const link = (profile.links || []).find((l: any) => String(l.id) === String(linkId));
    if (!link) {
      return NextResponse.json(
        { success: false, message: 'لینک مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    // Check expiration
    const expiresAt = link.expiresAt || link.advancedSettings?.expiresAt;
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, message: 'این لینک منقضی شده است.' },
        { status: 410 }
      );
    }

    // Check click limit
    const maxClicks = typeof link.maxClicks === 'number' ? link.maxClicks : link.advancedSettings?.maxClicks;
    if (typeof maxClicks === 'number' && (link.clickCount || 0) >= maxClicks) {
      return NextResponse.json(
        { success: false, message: 'ظرفیت کلیک این لینک به پایان رسیده است.' },
        { status: 410 }
      );
    }

    const hash = link.passwordHash || link.advancedSettings?.passwordHash;
    if (hash) {
      const isMatch = await bcrypt.compare(password, hash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'رمز عبور وارد شده نادرست است.' },
          { status: 401 }
        );
      }
    }

    // Increment click count safely in background
    try {
      await Profile.updateOne(
        { _id: profile._id, 'links.id': link.id },
        { $inc: { 'links.$.clickCount': 1 } }
      );
    } catch (err) {
      console.error('Failed to increment clickCount:', err);
    }

    return NextResponse.json({
      success: true,
      url: link.url,
      message: 'رمز عبور تایید شد.',
    });
  } catch (error: any) {
    console.error('Verify link password error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در تایید رمز عبور.' },
      { status: 500 }
    );
  }
}

