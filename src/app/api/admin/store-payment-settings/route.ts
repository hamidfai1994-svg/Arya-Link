import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { StorePaymentSettings } from '@/models/StorePaymentSettings.model';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['superadmin', 'admin', 'financial_admin'].includes(role);
}

function isSuperAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['superadmin', 'admin'].includes(role);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران ارشد و مالی مجاز هستند.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    let settings = await StorePaymentSettings.findOne().lean();
    if (!settings) {
      const created = await StorePaymentSettings.create({});
      settings = created.toObject();
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('Error in admin GET store payment settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت اطلاعات درگاه‌های فروشگاه.', error: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران ارشد امکان تغییر تنظیمات درگاه را دارند.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    await connectToDatabase();

    let settings = await StorePaymentSettings.findOne();
    if (!settings) {
      settings = new StorePaymentSettings({});
    }

    if (body.activeMethods) settings.activeMethods = { ...settings.activeMethods, ...body.activeMethods };
    if (body.activeProfileCategories) settings.activeProfileCategories = { ...settings.activeProfileCategories, ...body.activeProfileCategories };

    if (body.wallets) {
      settings.wallets = body.wallets;
      settings.walletsConfig = body.wallets.map((w: any) => ({
        id: w.id,
        name: w.name,
        nameFa: w.nameFa,
        providerCompany: w.providerCompany || '',
        isActive: Boolean(w.isActive),
      }));
      const hp = body.wallets.find((w: any) => w.id === 'hesabpay');
      if (hp) {
        settings.hesabPay = {
          ...settings.hesabPay,
          ...(hp.hesabPayConfig || {}),
          accountName: hp.accountName || hp.accountHolder || settings.hesabPay?.accountName || 'HAMID FASIHI',
          accountNumber: hp.accountNumber || settings.hesabPay?.accountNumber || '0729736813',
          merchantId: hp.merchantId || hp.hesabPayConfig?.merchantId || settings.hesabPay?.merchantId || 'ARYALINK_MERCHANT_01',
          apiKey: hp.apiKey || hp.hesabPayConfig?.apiKey || settings.hesabPay?.apiKey || '',
          isApiEnabled: hp.isApiEnabled !== undefined ? Boolean(hp.isApiEnabled) : (settings.hesabPay?.isApiEnabled ?? true),
          isActive: Boolean(hp.isActive),
        };
      }
    } else if (body.walletsConfig) {
      settings.walletsConfig = body.walletsConfig;
    }

    if (body.banks) {
      settings.banks = body.banks;
      settings.banksConfig = body.banks.map((b: any) => ({
        id: b.id,
        name: b.bankName,
        nameFa: b.bankNameFa,
        swiftCode: b.swiftCode || '',
        isActive: Boolean(b.isActive),
      }));
      settings.bankAccounts = body.banks.map((b: any) => ({
        bankName: b.bankName,
        bankNameFa: b.bankNameFa,
        accountHolder: b.accountHolder || '',
        accountNumber: b.accountNumber || '',
        iban: b.iban || '',
        swiftCode: b.swiftCode || '',
        isActive: Boolean(b.isActive),
      }));
    } else {
      if (body.banksConfig) settings.banksConfig = body.banksConfig;
      if (body.bankAccounts) settings.bankAccounts = body.bankAccounts;
    }

    if (body.hawalas) {
      settings.hawalas = body.hawalas;
      const firstActive = body.hawalas.find((h: any) => h.isActive) || body.hawalas[0];
      if (firstActive) {
        settings.hawalaInfo = {
          exchangeName: firstActive.exchangeName,
          cityBranch: firstActive.cityBranch,
          receiverName: firstActive.receiverName,
          receiverPhone: firstActive.receiverPhone,
          instructions: firstActive.instructions,
          isActive: Boolean(firstActive.isActive),
        };
      }
    } else if (body.hawalaInfo) {
      settings.hawalaInfo = body.hawalaInfo;
    }

    if (body.cryptos) {
      settings.cryptos = body.cryptos;
      settings.cryptoAddresses = body.cryptos.map((c: any) => ({
        network: c.network,
        walletAddress: c.walletAddress,
        currency: c.currency || 'USDT',
        isActive: Boolean(c.isActive),
      }));
    } else if (body.cryptoAddresses) {
      settings.cryptoAddresses = body.cryptoAddresses;
    }

    if (body.hesabPay) {
      settings.hesabPay = {
        ...settings.hesabPay,
        ...body.hesabPay,
      };
    }
    if (body.codSettings) settings.codSettings = body.codSettings;
    if (body.installmentSettings) settings.installmentSettings = body.installmentSettings;
    settings.updatedBy = session.user?.email || session.user?.name || 'admin';

    await settings.save();

    return NextResponse.json({
      success: true,
      message: 'تنظیمات درگاه‌ها و حساب‌های مرکزی با موفقیت ذخیره شد.',
      settings,
    });
  } catch (error: any) {
    console.error('Error in admin PUT store payment settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در به‌روزرسانی تنظیمات پرداخت.', error: error?.message },
      { status: 500 }
    );
  }
}

