import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json') || contentType.includes('text/plain')) {
        body = await req.json();
      } else {
        const text = await req.text();
        if (text) {
          body = JSON.parse(text);
        }
      }
    } catch {
      body = {};
    }

    const { profileId, alias, linkId, moduleType } = body;

    if (!profileId && !alias && !linkId) {
      return NextResponse.json(
        { success: false, message: 'شناسه پروفایل یا پیوند الزامی است.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Resolve Profile Document
    let profile: any = null;
    const cleanAlias = (alias || '').trim().toLowerCase();

    if (profileId) {
      const trimmedId = profileId.toString().trim();
      if (mongoose.isValidObjectId(trimmedId)) {
        profile = await Profile.findById(trimmedId);
      }
      if (!profile) {
        profile = await Profile.findOne({ alias: trimmedId.toLowerCase() });
      }
    }

    if (!profile && cleanAlias) {
      profile = await Profile.findOne({ alias: cleanAlias });
    }

    // Fallback: If only linkId was provided, find profile that contains this link
    if (!profile && linkId) {
      profile = await Profile.findOne({ 'links.id': linkId });
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'پروفایل متناظر یافت نشد.' },
        { status: 404 }
      );
    }

    // 2. Increment Profile's total interactions/clicks
    // Atomic increment of clicks on the specific link within the links array
    let updatedSpecificLink = false;
    let newClickCount = 1;

    if (linkId) {
      // Method A: Atomic $inc via positional operator `links.$.clickCount`
      const updateResult = await Profile.updateOne(
        { _id: profile._id, 'links.id': linkId },
        {
          $inc: {
            'links.$.clickCount': 1,
          },
        }
      );

      if (updateResult.modifiedCount > 0) {
        updatedSpecificLink = true;
      } else {
        // Method B: In-memory fallback if link.id format differs (e.g. integer or ObjectId or by moduleType)
        const freshProfile = await Profile.findById(profile._id);
        if (freshProfile && Array.isArray(freshProfile.links)) {
          const target = freshProfile.links.find(
            (l: any) =>
              l.id === linkId ||
              l._id?.toString() === linkId ||
              (moduleType && l.moduleType === moduleType)
          );
          if (target) {
            target.clickCount = (target.clickCount || 0) + 1;
            newClickCount = target.clickCount;
            await freshProfile.save();
            updatedSpecificLink = true;
          }
        }
      }
    } else if (moduleType) {
      // If only moduleType was passed (e.g. 'phone_call' or 'whatsapp_direct')
      const freshProfile = await Profile.findById(profile._id);
      if (freshProfile && Array.isArray(freshProfile.links)) {
        const target = freshProfile.links.find((l: any) => l.moduleType === moduleType);
        if (target) {
          target.clickCount = (target.clickCount || 0) + 1;
          newClickCount = target.clickCount;
          await freshProfile.save();
          updatedSpecificLink = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'کلیک با موفقیت ثبت شد.',
      updatedSpecificLink,
      linkId,
      profileAlias: profile.alias,
    });
  } catch (error: any) {
    console.error('Error tracking module click:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت کلیک پیوند.' },
      { status: 500 }
    );
  }
}

