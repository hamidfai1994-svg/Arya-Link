import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSiteContent, updateSiteContent } from '@/lib/cms-site-content';
import { getRequestLocale } from '@/lib/i18n/server-locale';
import { tServer } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';

function isContentAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'content_editor'].includes(role);
}

export async function GET(req: NextRequest) {
  const locale = getRequestLocale(req);
  try {
    const data = await getSiteContent();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching site content:', error);
    return NextResponse.json(
      { success: false, message: tServer(locale, 'toast.network_error') },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  let locale = getRequestLocale(req);
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isContentAdmin(session)) {
      return NextResponse.json(
        { success: false, message: tServer(locale, 'toast.forbidden') },
        { status: 403 }
      );
    }

    const body = await req.json();
    locale = getRequestLocale(req, body?.locale || body?.language);
    const updatedBy = session.user.name || session.user.email || 'Admin';

    const result = await updateSiteContent(body, updatedBy);

    return NextResponse.json({
      success: true,
      message: tServer(locale, 'toast.save_success'),
      data: result,
    });
  } catch (error: any) {
    console.error('Error updating site content:', error);
    return NextResponse.json(
      { success: false, message: error.message || tServer(locale, 'toast.save_error') },
      { status: 500 }
    );
  }
}
