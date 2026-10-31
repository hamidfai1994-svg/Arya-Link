import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLandingCms, updateLandingCms } from '@/lib/cms-landing';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'content_editor'].includes(role);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز به تنظیمات محتوا.' },
        { status: 403 }
      );
    }

    const data = await getLandingCms();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching admin CMS settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت اطلاعات تنظیمات محتوا.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز به ویرایش تنظیمات.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updatedBy = session.user.name || session.user.email || 'Admin';

    const result = await updateLandingCms(body, updatedBy);

    return NextResponse.json({
      success: true,
      message: 'تنظیمات محتوای سامانه با موفقیت در پایگاه داده ذخیره شد.',
      data: result,
    });
  } catch (error: any) {
    console.error('Error updating admin CMS settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ذخیره‌سازی اطلاعات تنظیمات.' },
      { status: 500 }
    );
  }
}

