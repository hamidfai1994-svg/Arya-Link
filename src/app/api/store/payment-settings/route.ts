import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import {
  StorePaymentSettings,
  DEFAULT_DETAILED_WALLETS,
  DEFAULT_DETAILED_BANKS,
  DEFAULT_DETAILED_HAWALAS,
  DEFAULT_DETAILED_CRYPTOS,
} from '@/models/StorePaymentSettings.model';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    let settings = await StorePaymentSettings.findOne().lean();
    if (!settings) {
      const created = await StorePaymentSettings.create({});
      settings = created.toObject();
    }

    // Sanitize detailed wallets - never expose HesabPay secret / API key
    const rawWallets = (settings.wallets && settings.wallets.length > 0) ? settings.wallets : DEFAULT_DETAILED_WALLETS;
    const sanitizedWallets = rawWallets.map((w: any) => ({
      id: w.id,
      name: w.name,
      nameFa: w.nameFa,
      providerCompany: w.providerCompany,
      accountNumber: w.accountNumber || (w.id === 'hesabpay' ? settings.hesabPay?.accountNumber || '0729736813' : ''),
      accountHolder: w.accountHolder,
      accountName: w.accountName || (w.id === 'hesabpay' ? settings.hesabPay?.accountName || 'HAMID FASIHI' : w.accountHolder),
      isApiEnabled: w.isApiEnabled !== undefined ? Boolean(w.isApiEnabled) : (w.id === 'hesabpay' ? (settings.hesabPay?.isApiEnabled ?? true) : false),
      instructions: w.instructions,
      qrCodeUrl: w.qrCodeUrl || '',
      logoUrl: w.logoUrl || '',
      isActive: w.isActive ?? true,
      hesabPayConfig: w.hesabPayConfig
        ? {
            isSandbox: w.hesabPayConfig.isSandbox ?? true,
            merchantId: w.hesabPayConfig.merchantId || settings.hesabPay?.merchantId || 'ARYALINK_MERCHANT_01',
          }
        : undefined,
    }));

    const rawBanks = (settings.banks && settings.banks.length > 0) ? settings.banks : DEFAULT_DETAILED_BANKS;
    const rawHawalas = (settings.hawalas && settings.hawalas.length > 0) ? settings.hawalas : DEFAULT_DETAILED_HAWALAS;
    const rawCryptos = (settings.cryptos && settings.cryptos.length > 0) ? settings.cryptos : DEFAULT_DETAILED_CRYPTOS;

    const isWalletGroupActive = settings.activeProfileCategories?.wallet !== false;
    const isBankGroupActive = settings.activeProfileCategories?.bank !== false;
    const isHawalaGroupActive = settings.activeProfileCategories?.hawala !== false;
    const isCryptoGroupActive = settings.activeProfileCategories?.crypto !== false;

    // Filter by master group switch and individual isActive status
    const publicWallets = isWalletGroupActive ? sanitizedWallets.filter((w: any) => w.isActive) : [];
    const publicBanks = isBankGroupActive ? rawBanks.filter((b: any) => b.isActive) : [];
    const publicHawalas = isHawalaGroupActive ? rawHawalas.filter((h: any) => h.isActive) : [];
    const publicCryptos = isCryptoGroupActive ? rawCryptos.filter((c: any) => c.isActive) : [];

    // Publicly sanitized view
    const sanitized = {
      activeMethods: {
        hesabpay: isWalletGroupActive && Boolean(publicWallets.find((w: any) => w.id === 'hesabpay')?.isActive),
        bank: isBankGroupActive && publicBanks.length > 0,
        crypto: isCryptoGroupActive && publicCryptos.length > 0,
        hawala: isHawalaGroupActive && publicHawalas.length > 0,
        cod: Boolean(settings.codSettings?.isActive ?? true),
        installment: Boolean(settings.installmentSettings?.isActive ?? true),
      },
      activeProfileCategories: settings.activeProfileCategories || {
        wallet: true,
        bank: true,
        hawala: true,
        crypto: true,
      },
      wallets: publicWallets,
      banks: publicBanks,
      hawalas: publicHawalas,
      cryptos: publicCryptos,
      walletsConfig: publicWallets.map((w: any) => ({ id: w.id, name: w.name, nameFa: w.nameFa, isActive: true })),
      banksConfig: publicBanks.map((b: any) => ({ id: b.id, name: b.bankName, nameFa: b.bankNameFa, swiftCode: b.swiftCode, isActive: true })),
      bankAccounts: publicBanks,
      cryptoAddresses: publicCryptos,
      hawalaInfo: publicHawalas[0] || null,
      codSettings: settings.codSettings || {
        isActive: true,
        deliveryFee: 150,
        deliveryCompany: 'پیک اکسپرس کابل و ترانسپورت پستی ولایات',
        terms: 'مبلغ پس از دریافت فیزیکی کارت هوشمند NFC پرداخت خواهد شد.',
        logoUrl: '',
      },
      installmentSettings: settings.installmentSettings || {
        isActive: true,
        minOrderAmount: 5000,
        downPaymentPercent: 30,
        installmentCount: 3,
        corporateOnly: true,
        terms: 'خرید اقساطی صرفاً ویژه شرکت‌ها و سازمان‌های دارای حساب حقوقی است.',
        logoUrl: '',
      },
      hesabPay: {
        isActive: isWalletGroupActive && (publicWallets.some((w: any) => w.id === 'hesabpay')),
        isApiEnabled: settings.hesabPay?.isApiEnabled !== false,
        isSandbox: settings.hesabPay?.isSandbox ?? true,
        merchantId: settings.hesabPay?.merchantId || 'ARYALINK_MERCHANT_01',
        accountName: settings.hesabPay?.accountName || 'HAMID FASIHI',
        accountNumber: settings.hesabPay?.accountNumber || '0729736813',
      },
    };

    return NextResponse.json({
      success: true,
      settings: sanitized,
    });
  } catch (error: any) {
    console.error('Error fetching store payment settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری تنظیمات پرداخت فروشگاه.', error: error?.message },
      { status: 500 }
    );
  }
}

