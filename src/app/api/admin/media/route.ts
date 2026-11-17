import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import { deleteFromCloud, cloudinaryClient, imagekitClient } from '@/lib/cloudStorage';

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

    const mediaFiles: { name: string; url: string; size: number; createdAt: string }[] = [];

    // 1. Fetch Cloudinary media assets if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const cloudRes = await cloudinaryClient.api.resources({
          type: 'upload',
          max_results: 60,
        });
        if (cloudRes?.resources && Array.isArray(cloudRes.resources)) {
          for (const res of cloudRes.resources) {
            mediaFiles.push({
              name: path.basename(res.public_id),
              url: res.secure_url || res.url,
              size: res.bytes || 0,
              createdAt: res.created_at || new Date().toISOString(),
            });
          }
        }
      } catch (err: any) {
        console.warn('Could not list media from Cloudinary:', err?.message || err);
      }
    }

    // 2. Fetch ImageKit media assets if configured
    if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY) {
      try {
        const ikRes = await imagekitClient.listFiles({
          limit: 60,
        });
        if (Array.isArray(ikRes)) {
          for (const item of ikRes) {
            if ('url' in item && item.url) {
              mediaFiles.push({
                name: item.name,
                url: item.url,
                size: item.size || 0,
                createdAt: (item as any).createdAt || new Date().toISOString(),
              });
            }
          }
        }
      } catch (err: any) {
        console.warn('Could not list media from ImageKit:', err?.message || err);
      }
    }

    // 3. Fallback: check legacy local uploads folder
    const uploadsBase = path.join(process.cwd(), 'public', 'uploads');
    try {
      const scanDir = async (dir: string, relativePath: string = '') => {
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
      };

      await scanDir(uploadsBase);
    } catch {
      // Local folder may not exist or be empty
    }

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
    const fileUrl = searchParams.get('url')?.trim();

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, message: 'آدرس فایل نامعتبر است.' },
        { status: 400 }
      );
    }

    await deleteFromCloud(fileUrl);

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
