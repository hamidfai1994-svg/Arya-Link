import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import {
  SystemSettings,
  ISystemSettings,
  INfcCardMaterialConfig,
  INfcQtyDiscountTier,
  DEFAULT_NFC_CARD_MATERIALS,
  DEFAULT_NFC_QTY_DISCOUNTS,
} from '@/models/systemSettings.model';
import { updateSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

function isSuperAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['superadmin', 'admin'].includes(role);
}

const DEFAULT_SETTINGS = {
  telegramSupportChatId: '',
  telegramInsightsChatId: '',
  telegramBotsActive: false,
  notifyNewUsers: true,
  notifyOrders: true,
  notifySupportTickets: true,
  notifySystemAlerts: false,
  appPushEnabled: false,
  platformMainLogo: '',
  platformFavicon: '',
  nfcCardMaterials: DEFAULT_NFC_CARD_MATERIALS,
  nfcQtyDiscounts: DEFAULT_NFC_QTY_DISCOUNTS,
};

function sanitizeNfcMaterials(raw: any): INfcCardMaterialConfig[] | null {
  if (!Array.isArray(raw)) return null;
  const cleaned: INfcCardMaterialConfig[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== 'object') continue;
    const id =
      String(item.id || `material-${i + 1}`)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-') || `material-${i + 1}`;
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const price = Number(item.priceWithPrint);
    const defaultEnv = id === 'metal' ? 0.55 : id === 'pvc-gloss' ? 0.35 : 0.15;

    cleaned.push({
      id,
      name: {
        fa: String(item.name?.fa || item.name?.da || '').trim() || id,
        ps: String(item.name?.ps || item.name?.fa || '').trim() || id,
        en: String(item.name?.en || item.name?.fa || '').trim() || id,
      },
      priceWithPrint: Number.isFinite(price) && price >= 0 ? Math.round(price) : 650,
      isAvailable: item.isAvailable !== false,
      metalness: Math.max(0, Math.min(1, Number.isFinite(Number(item.metalness)) ? Number(item.metalness) : 0.12)),
      roughness: Math.max(0, Math.min(1, Number.isFinite(Number(item.roughness)) ? Number(item.roughness) : 0.56)),
      clearcoat: Math.max(0, Math.min(1, Number.isFinite(Number(item.clearcoat)) ? Number(item.clearcoat) : 0.18)),
      envMapIntensity: Math.max(
        0,
        Math.min(1.5, Number.isFinite(Number(item.envMapIntensity)) ? Number(item.envMapIntensity) : defaultEnv)
      ),
      brushed: Boolean(item.brushed),
    });
  }

  return cleaned.length > 0 ? cleaned : DEFAULT_NFC_CARD_MATERIALS;
}

function sanitizeQtyDiscounts(raw: any): INfcQtyDiscountTier[] | null {
  if (!Array.isArray(raw)) return null;
  const cleaned = raw
    .map((item: any) => ({
      qty: Math.max(1, Math.round(Number(item?.qty) || 1)),
      disc: Math.max(0, Math.min(90, Math.round(Number(item?.disc) || 0))),
    }))
    .sort((a, b) => a.qty - b.qty);

  return cleaned.length > 0 ? cleaned : DEFAULT_NFC_QTY_DISCOUNTS;
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

    let settings: any = await SystemSettings.findOne().lean();
    if (!settings) {
      const created = await SystemSettings.create(DEFAULT_SETTINGS);
      settings = created.toObject();
    }

    const hydratedData = {
      ...settings,
      nfcCardMaterials:
        Array.isArray(settings.nfcCardMaterials) && settings.nfcCardMaterials.length > 0
          ? settings.nfcCardMaterials
          : DEFAULT_NFC_CARD_MATERIALS,
      nfcQtyDiscounts:
        Array.isArray(settings.nfcQtyDiscounts) && settings.nfcQtyDiscounts.length > 0
          ? settings.nfcQtyDiscounts
          : DEFAULT_NFC_QTY_DISCOUNTS,
    };

    return NextResponse.json({
      success: true,
      data: hydratedData,
    });
  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت تنظیمات سیستم.', error: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران ارشد مجاز هستند.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await req.json();

    const sanitizedMaterials = sanitizeNfcMaterials(body.nfcCardMaterials);
    const sanitizedDiscounts = sanitizeQtyDiscounts(body.nfcQtyDiscounts);

    const updateData: Partial<ISystemSettings> = {
      telegramSupportChatId: typeof body.telegramSupportChatId === 'string' ? body.telegramSupportChatId.trim() : '',
      telegramInsightsChatId: typeof body.telegramInsightsChatId === 'string' ? body.telegramInsightsChatId.trim() : '',
      telegramBotsActive: Boolean(body.telegramBotsActive),
      notifyNewUsers: Boolean(body.notifyNewUsers),
      notifyOrders: Boolean(body.notifyOrders),
      notifySupportTickets: Boolean(body.notifySupportTickets),
      notifySystemAlerts: Boolean(body.notifySystemAlerts),
      appPushEnabled: false, // Future mobile app push feature
      ...(typeof body.platformMainLogo === 'string' && {
        platformMainLogo: body.platformMainLogo.trim(),
      }),
      ...(typeof body.platformFavicon === 'string' && {
        platformFavicon: body.platformFavicon.trim(),
      }),
      ...(body.aiSettings && { aiSettings: body.aiSettings }),
      ...(body.cloudStorageSettings && { cloudStorageSettings: body.cloudStorageSettings }),
      ...(body.securitySettings && { securitySettings: body.securitySettings }),
      ...(body.paymentSettings && { paymentSettings: body.paymentSettings }),
      ...(sanitizedMaterials && { nfcCardMaterials: sanitizedMaterials }),
      ...(sanitizedDiscounts && { nfcQtyDiscounts: sanitizedDiscounts }),
    };

    const settings = await SystemSettings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    if (
      typeof body.platformMainLogo === 'string' ||
      typeof body.platformFavicon === 'string'
    ) {
      await updateSiteSettings(
        {
          ...(typeof body.platformMainLogo === 'string' && {
            platformMainLogo: body.platformMainLogo.trim(),
          }),
          ...(typeof body.platformFavicon === 'string' && {
            platformFavicon: body.platformFavicon.trim(),
          }),
        },
        session.user?.email || 'admin'
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تنظیمات کلان، متریال‌های کارت NFC و ربات‌های تلگرام با موفقیت ذخیره شد.',
      data: settings,
    });
  } catch (error: any) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ذخیره‌سازی تنظیمات سیستم.', error: error?.message },
      { status: 500 }
    );
  }
}
