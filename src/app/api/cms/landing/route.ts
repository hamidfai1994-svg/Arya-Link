import { NextResponse } from 'next/server';
import { getLandingCms } from '@/lib/cms-landing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLandingCms();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching landing CMS data:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری محتوای صفحه اصلی.' },
      { status: 500 }
    );
  }
}

