import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import {
  extractAllLocalUploadUrls,
  normalizeUploadUrl,
} from '@/lib/storage/file-manager';

export const dynamic = 'force-dynamic';

function isSuperAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['superadmin', 'admin'].includes(role);
}

interface ScannedFile {
  fullPath: string;
  url: string;
  size: number;
}

async function scanUploadsDirectory(
  dir: string,
  relativePath: string = '',
  results: ScannedFile[] = []
): Promise<ScannedFile[]> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name === '.gitkeep' || entry.name === '.DS_Store') continue;

    const fullPath = path.join(dir, entry.name);
    const relPosix = relativePath
      ? `${relativePath}/${entry.name}`.replace(/\\/g, '/')
      : entry.name.replace(/\\/g, '/');

    if (entry.isDirectory()) {
      await scanUploadsDirectory(fullPath, relPosix, results);
    } else if (entry.isFile()) {
      const normalized = normalizeUploadUrl(`/uploads/${relPosix}`);
      if (normalized) {
        const stats = await fs.stat(fullPath);
        results.push({
          fullPath,
          url: normalized,
          size: stats.size,
        });
      }
    }
  }

  return results;
}

async function collectAllDatabaseUploadReferences(): Promise<Set<string>> {
  const referencedUrls = new Set<string>();
  const db = mongoose.connection.db;

  if (db) {
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      if (!col?.name || col.name.startsWith('system.')) continue;
      const docs = await db.collection(col.name).find({}).toArray();
      for (const doc of docs) {
        extractAllLocalUploadUrls(doc, referencedUrls);
      }
    }
  } else {
    for (const model of Object.values(mongoose.models)) {
      const docs = await model.find({}).lean();
      for (const doc of docs) {
        extractAllLocalUploadUrls(doc, referencedUrls);
      }
    }
  }

  return referencedUrls;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران ارشد مجاز هستند.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsRoot, { recursive: true });

    const [referencedUrls, physicalFiles] = await Promise.all([
      collectAllDatabaseUploadReferences(),
      scanUploadsDirectory(uploadsRoot),
    ]);

    let orphanCount = 0;
    let orphanBytes = 0;
    let totalBytes = 0;

    for (const file of physicalFiles) {
      totalBytes += file.size;
      if (!referencedUrls.has(file.url)) {
        orphanCount++;
        orphanBytes += file.size;
      }
    }

    return NextResponse.json({
      success: true,
      totalFiles: physicalFiles.length,
      referencedCount: referencedUrls.size,
      orphanCount,
      orphanBytes,
      orphanMB: Number((orphanBytes / (1024 * 1024)).toFixed(2)),
      totalMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
    });
  } catch (error: any) {
    console.error('Error inspecting uploads storage:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بررسی وضعیت فضای ذخیره‌سازی هاست.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران ارشد مجاز هستند.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsRoot, { recursive: true });

    const [referencedUrls, physicalFiles] = await Promise.all([
      collectAllDatabaseUploadReferences(),
      scanUploadsDirectory(uploadsRoot),
    ]);

    let deletedCount = 0;
    let keptCount = 0;
    let freedBytes = 0;
    const deletedFiles: { url: string; size: number }[] = [];

    for (const file of physicalFiles) {
      if (referencedUrls.has(file.url)) {
        keptCount++;
        continue;
      }

      try {
        await fs.unlink(file.fullPath);
        freedBytes += file.size;
        deletedCount++;
        deletedFiles.push({ url: file.url, size: file.size });
      } catch (unlinkErr: any) {
        if (unlinkErr?.code !== 'ENOENT') {
          console.warn(`Failed to unlink orphaned file ${file.fullPath}:`, unlinkErr);
        }
      }
    }

    const freedMB = Number((freedBytes / (1024 * 1024)).toFixed(2));

    return NextResponse.json({
      success: true,
      deletedCount,
      keptCount,
      freedBytes,
      freedMB,
      deletedFiles,
      message: `${freedMB} مگابایت فضای هاست آزاد شد`,
    });
  } catch (error: any) {
    console.error('Error during cleanup-uploads:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در پاکسازی فایل‌های اضافی هاست.',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
