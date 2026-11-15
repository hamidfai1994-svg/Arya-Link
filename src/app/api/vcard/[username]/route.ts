import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { generateVCard } from '@/lib/generateVCard';
import { getLocalizedText } from '@/lib/i18n/multilingual';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const cleanAlias = decodeURIComponent(username || '').toLowerCase().trim();

    if (!cleanAlias) {
      return NextResponse.json(
        { success: false, message: 'نام کاربری پروفایل نامعتبر است.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const profile: any = await Profile.findOne({
      alias: cleanAlias,
      isActive: { $ne: false },
    }).lean();

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'پروفایل مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    const lang = profile.profileLanguage || 'dari';
    const normalizedProfile = {
      ...profile,
      id: profile._id.toString(),
      displayName: getLocalizedText(profile.displayName, lang, cleanAlias) || cleanAlias,
      headline: getLocalizedText(profile.headline, lang, ''),
      bio: getLocalizedText(profile.bio, lang, ''),
    };

    const vcardContent = generateVCard(normalizedProfile as any);
    const safeAsciiName =
      cleanAlias.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'contact';
    const utf8FileName = `${(normalizedProfile.displayName || safeAsciiName)
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '')
      .replace(/\s+/g, '-')}.vcf`;

    const headers = new Headers();
    headers.set('Content-Type', 'text/vcard; charset=utf-8');
    headers.set(
      'Content-Disposition',
      `attachment; filename="${safeAsciiName}.vcf"; filename*=UTF-8''${encodeURIComponent(utf8FileName)}`
    );
    headers.set('Cache-Control', 'no-store, max-age=0');

    return new NextResponse('\uFEFF' + vcardContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error generating vCard response:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در تولید و دانلود فایل مخاطب (vCard).' },
      { status: 500 }
    );
  }
}
