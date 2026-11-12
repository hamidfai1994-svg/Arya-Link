import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'هیچ فایلی ارسال نشده است.' },
        { status: 400 }
      );
    }

    // Size limit: 3MB max for receipt images
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'صرفاً فایل‌های تصویری (JPG, PNG) مجاز هستند.' },
        { status: 400 }
      );
    }

    if (file.size > 3.5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'حجم تصویر فیش نباید بیشتر از 3 مگابایت باشد.' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || '.jpg';
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/receipts/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      message: 'رسید با موفقیت بارگذاری شد.',
    });
  } catch (error: any) {
    console.error('Receipt upload error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در آپلود فایل رسید.' },
      { status: 500 }
    );
  }
}

