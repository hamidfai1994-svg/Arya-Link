import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { CompanyInfo } from '@/models/CompanyInfo.model';

export const dynamic = 'force-dynamic';

function isContentAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'content_editor'].includes(role);
}

export async function GET() {
  try {
    await connectToDatabase();
    let info = await CompanyInfo.findOne({}).lean();

    if (!info) {
      info = await CompanyInfo.create({});
    }

    return NextResponse.json({ success: true, company: info });
  } catch (error: any) {
    console.error('Error fetching company info:', error);
    return NextResponse.json({ success: false, message: 'خطا در بارگذاری اطلاعات شرکت.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isContentAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    let info = await CompanyInfo.findOne({});
    if (!info) {
      info = await CompanyInfo.create(body);
    } else {
      Object.assign(info, body);
      await info.save();
    }

    return NextResponse.json({ success: true, message: 'اطلاعات شرکت و نمایندگی‌ها بروزرسانی شد.', company: info });
  } catch (error: any) {
    console.error('Error updating company info:', error);
    return NextResponse.json({ success: false, message: 'خطا در ذخیره‌سازی اطلاعات.' }, { status: 500 });
  }
}
