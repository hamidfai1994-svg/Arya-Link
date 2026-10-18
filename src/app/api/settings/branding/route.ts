import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'content_editor'].includes(role);
}

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('Error fetching branding settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری تنظیمات برند.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. تنها مدیران سیستم اجازه ویرایش دارند.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await updateSiteSettings(
      {
        companyLogo: typeof body.companyLogo === 'string' ? body.companyLogo.trim() : undefined,
        favicon: typeof body.favicon === 'string' ? body.favicon.trim() : undefined,
        siteName: typeof body.siteName === 'string' ? body.siteName.trim() : undefined,
        siteDescription: typeof body.siteDescription === 'string' ? body.siteDescription.trim() : undefined,
      },
      session.user?.email || 'admin'
    );

    return NextResponse.json({
      success: true,
      message: 'تنظیمات برندینگ با موفقیت ذخیره و بروزرسانی شد.',
      settings: updated,
    });
  } catch (error: any) {
    console.error('Error updating branding settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ذخیره‌سازی تنظیمات برند.' },
      { status: 500 }
    );
  }
}
