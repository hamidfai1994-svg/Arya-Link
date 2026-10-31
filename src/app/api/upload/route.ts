import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'هیچ فایلی ارسال نشده است.' },
        { status: 400 }
      );
    }

    // Size limits: 2MB for images, 5MB for documents/pdf
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    const maxSizeBytes = isImage ? 2.5 * 1024 * 1024 : 5.5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          message: isImage
            ? 'حجم تصویر نباید بیشتر از 2 مگابایت باشد.'
            : 'حجم فایل نباید بیشتر از 5 مگابایت باشد.',
        },
        { status: 400 }
      );
    }

    // Sanitize folder name
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', sanitizedFolder);

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique file name
    const ext = path.extname(file.name) || (isImage ? '.jpg' : '.pdf');
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${sanitizedFolder}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      message: 'فایل با موفقیت بارگذاری شد.',
      url: publicUrl,
      fileName: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطایی در آپلود فایل رخ داد.',
        error: error?.message || 'Upload failed',
      },
      { status: 500 }
    );
  }
}
