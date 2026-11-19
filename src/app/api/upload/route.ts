import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import { optimizeImageBuffer } from '@/lib/storage/file-manager';
import { uploadToCloud, deleteFromCloud } from '@/lib/cloudStorage';

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
    const previousUrl = (formData.get('previousUrl') as string | null) || '';
    const preserveOriginal = (formData.get('preserveOriginal') as string | null) === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'هیچ فایلی ارسال نشده است.' },
        { status: 400 }
      );
    }

    // Size limits before Sharp compression: 10MB for images, 5.5MB for documents/pdf
    const isImage = file.type.startsWith('image/');

    const maxSizeBytes = isImage ? 10 * 1024 * 1024 : 5.5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          message: isImage
            ? 'حجم تصویر ورودی نباید بیشتر از 10 مگابایت باشد.'
            : 'حجم فایل نباید بیشتر از 5 مگابایت باشد.',
        },
        { status: 400 }
      );
    }

    // Sanitize folder name
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';

    // Read file bytes and optimize images to WebP (max width 1080px, quality 80)
    const ext = path.extname(file.name) || (isImage ? '.jpg' : '.pdf');
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    const processed =
      isImage && !preserveOriginal
        ? await optimizeImageBuffer(rawBuffer, file.type, ext)
        : { buffer: rawBuffer, ext, mimeType: file.type || (isImage ? 'image/png' : 'application/pdf') };

    const uniqueFileName = `${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${processed.ext}`;

    // Upload directly to Dual Cloud (Cloudinary with ImageKit fallback) - no local disk writeFile
    const cloudUrl = await uploadToCloud(processed.buffer, uniqueFileName, sanitizedFolder);

    // If replacing an existing uploaded file in the same control, delete the old file from cloud immediately
    if (previousUrl) {
      await deleteFromCloud(previousUrl);
    }

    return NextResponse.json({
      success: true,
      message: 'فایل با موفقیت بهینه‌سازی و در فضای ابری بارگذاری شد.',
      url: cloudUrl,
      fileName: file.name,
      size: processed.buffer.length,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطایی در بارگذاری ابری فایل رخ داد.',
        error: error?.message || 'Upload failed',
      },
      { status: 500 }
    );
  }
}
