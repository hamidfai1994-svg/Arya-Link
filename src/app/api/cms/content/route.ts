import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSiteContent, updateSiteContent } from '@/lib/cms-site-content';

export const dynamic = 'force-dynamic';

function isContentAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'content_editor'].includes(role);
}

export async function GET() {
  try {
    const data = await getSiteContent();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching site content:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری محتوای سایت.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isContentAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز به ویرایش محتوای سایت.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updatedBy = session.user.name || session.user.email || 'Admin';

    const result = await updateSiteContent(body, updatedBy);

    return NextResponse.json({
      success: true,
      message: 'محتوای سیستم با موفقیت به‌روزرسانی و در پایگاه داده ذخیره شد.',
      data: result,
    });
  } catch (error: any) {
    console.error('Error updating site content:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'خطا در ذخیره‌سازی محتوا.' },
      { status: 500 }
    );
  }
}
