import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import {
  SystemSettings,
  DEFAULT_NFC_CARD_MATERIALS,
  DEFAULT_NFC_QTY_DISCOUNTS,
} from '@/models/systemSettings.model';

export const dynamic = 'force-dynamic';

/**
 * Public read-only endpoint exposing configured NFC card materials (trilingual name,
 * final print price, availability status, 3D rendering properties) and quantity discount tiers.
 * Never exposes any private API keys or admin credentials.
 */
export async function GET() {
  try {
    await connectToDatabase();
    const settings: any = await SystemSettings.findOne()
      .select('nfcCardMaterials nfcQtyDiscounts')
      .lean();

    const materials =
      Array.isArray(settings?.nfcCardMaterials) && settings.nfcCardMaterials.length > 0
        ? settings.nfcCardMaterials
        : DEFAULT_NFC_CARD_MATERIALS;

    const qtyDiscounts =
      Array.isArray(settings?.nfcQtyDiscounts) && settings.nfcQtyDiscounts.length > 0
        ? settings.nfcQtyDiscounts
        : DEFAULT_NFC_QTY_DISCOUNTS;

    return NextResponse.json({
      success: true,
      materials,
      qtyDiscounts,
    });
  } catch (error: any) {
    console.error('Error fetching public NFC materials settings:', error);
    return NextResponse.json({
      success: true,
      materials: DEFAULT_NFC_CARD_MATERIALS,
      qtyDiscounts: DEFAULT_NFC_QTY_DISCOUNTS,
      fallback: true,
    });
  }
}
