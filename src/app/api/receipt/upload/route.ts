import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { optimizeImageBuffer } from '@/lib/storage/file-manager';
import { uploadToCloud, deleteFromCloud } from '@/lib/cloudStorage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const previousUrl = (formData.get('previousUrl') as string | null) || '';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'هیچ فایلی ارسال نشده است.' },
        { status: 400 }
      );
    }

    // Size limit: 10MB max for receipt images prior to Sharp WebP optimization
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'صرفاً فایل‌های تصویری (JPG, PNG, WEBP) مجاز هستند.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'حجم تصویر فیش نباید بیشتر از 10 مگابایت باشد.' },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || '.jpg';
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    const processed = await optimizeImageBuffer(rawBuffer, file.type, ext);
    const uniqueFileName = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${processed.ext}`;

    // Upload directly to Dual Cloud (Cloudinary with ImageKit fallback) - no local disk writeFile
    const cloudUrl = await uploadToCloud(processed.buffer, uniqueFileName, 'receipts');

    if (previousUrl) {
      await deleteFromCloud(previousUrl);
    }

    return NextResponse.json({
      success: true,
      url: cloudUrl,
      fileName: file.name,
      size: processed.buffer.length,
      message: 'رسید با موفقیت بهینه‌سازی و در فضای ابری بارگذاری شد.',
    });
  } catch (error: any) {
    console.error('Receipt upload error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری ابری فایل رسید.' },
      { status: 500 }
    );
  }
}

