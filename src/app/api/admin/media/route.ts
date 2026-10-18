import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

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
        { success: false, message: 'دسترسی غیرمجاز.' },
        { status: 403 }
      );
    }

    const uploadsBase = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists
    await fs.mkdir(uploadsBase, { recursive: true });

    // Recursively get files
    const mediaFiles: { name: string; url: string; size: number; createdAt: string }[] = [];

    const scanDir = async (dir: string, relativePath: string = '') => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const rel = path.join(relativePath, entry.name).replace(/\\/g, '/');

          if (entry.isDirectory()) {
            await scanDir(fullPath, rel);
          } else {
            const stats = await fs.stat(fullPath);
            mediaFiles.push({
              name: entry.name,
              url: `/uploads/${rel}`,
              size: stats.size,
              createdAt: stats.birthtime.toISOString(),
            });
          }
        }
      } catch (err) {
        console.error('Scan dir error:', err);
      }
    }

    await scanDir(uploadsBase);

    // Sort newest first
    mediaFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      files: mediaFiles,
      count: mediaFiles.length,
    });
  } catch (error: any) {
    console.error('Media listing error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در واکشی لیست رسانه‌ها.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return NextResponse.json(
        { success: false, message: 'آدرس فایل نامعتبر است.' },
        { status: 400 }
      );
    }

    const cleanPath = fileUrl.replace('/uploads/', '').replace(/\.\./g, '');
    const fullPath = path.join(process.cwd(), 'public', 'uploads', cleanPath);

    await fs.unlink(fullPath);

    return NextResponse.json({
      success: true,
      message: 'فایل با موفقیت حذف گردید.',
    });
  } catch (error: any) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف فایل.' },
      { status: 500 }
    );
  }
}
