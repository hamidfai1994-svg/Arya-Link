import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';
import { Admin } from '@/models/Admin.model';
import { SystemSettings } from '@/models/systemSettings.model';
import { deleteReplacedFileIfUnused } from '@/lib/storage/file-manager';
import { createPlatformNotification } from '@/lib/notifications';
import { sendAdminKycAlert } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isVerified: !!user.isVerified,
      verificationStatus: user.verificationStatus || 'unverified',
      kycData: user.kycData || {},
    });
  } catch (error: any) {
    console.error('Error fetching KYC info:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری اطلاعات احراز هویت.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userId = session.user.id;
    const body = await req.json();
    const { nationalId, documentType, selfieUrl, documentUrl, fullName } = body;

    if (!nationalId || !documentType || !selfieUrl || !documentUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'لطفاً تمام موارد خواسته شده (شماره مدرک، عکس سلفی، و تصویر مدرک شناسایی) را وارد کنید.',
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findById(userId).select('kycData').lean();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          verificationStatus: 'pending',
          kycData: {
            fullName: fullName || session.user.name,
            nationalId: nationalId.trim(),
            documentType,
            selfieUrl,
            documentUrl,
            submittedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    await deleteReplacedFileIfUnused(existingUser?.kycData?.selfieUrl, selfieUrl);
    await deleteReplacedFileIfUnused(existingUser?.kycData?.documentUrl, documentUrl);

    // Also mark user's profiles with pending verification status
    await Profile.updateMany(
      { userId },
      { $set: { verificationStatus: 'pending' } }
    );

    // Notify Admin Bell & Telegram Bot (non-blocking)
    (async () => {
      try {
        const applicantName = fullName || session.user.name || 'کاربر';
        await createPlatformNotification({
          userId: 'admin',
          targetRole: 'admin',
          title: 'درخواست جدید راستی‌آزمایی (KYC)',
          message: `${applicantName} مدارک شناسایی خود را جهت تایید هویت ارسال نمود.`,
          type: 'kyc_update',
          link: '/admin/kyc',
          metadata: { userId },
        });

        const settings = await SystemSettings.findOne();
        const adminsWithTelegram = await Admin.find({
          isActive: true,
          telegramChatId: { $exists: true, $ne: '' },
        })
          .select('telegramChatId')
          .lean();

        const targetChatIds = new Set<string>();
        if (settings?.telegramBotsActive && settings?.telegramInsightsChatId) {
          targetChatIds.add(settings.telegramInsightsChatId);
        } else if (settings?.telegramBotsActive && settings?.telegramSupportChatId) {
          targetChatIds.add(settings.telegramSupportChatId);
        }
        adminsWithTelegram.forEach((a: any) => {
          if (a.telegramChatId) targetChatIds.add(a.telegramChatId);
        });

        for (const chatId of Array.from(targetChatIds)) {
          await sendAdminKycAlert(chatId, {
            userId: String(userId),
            fullName: applicantName,
            nationalId: nationalId.trim(),
            documentType,
          });
        }
      } catch (notifErr) {
        console.warn('KYC notification dispatch warning:', notifErr);
      }
    })().catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'مدارک احراز هویت با موفقیت ثبت شد و در صف بررسی ادمین قرار گرفت.',
      verificationStatus: 'pending',
      kycData: updatedUser?.kycData,
    });
  } catch (error: any) {
    console.error('Error submitting KYC:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت مدارک احراز هویت.' },
      { status: 500 }
    );
  }
}
