/**
 * Comprehensive Payment Provider System for Afghanistan
 * Supports: Bank, Mobile Wallet, Hawala (Money Exchange), Crypto (USDT), Cash on Delivery (COD), and Installments.
 * Strictly uses Afghan Dari vocabulary (داکتر، شفاخانه، صرافی، حواله، پوهنتون و...)
 */

export type PaymentProviderType = 'bank' | 'wallet' | 'hawala' | 'crypto' | 'cod' | 'installment';

export type WalletServiceType = 'M-Paisa' | 'HesabPay' | 'ATOMA Pay' | 'My-Money';

export type AfghanBankType = 
  | 'AIB' 
  | 'Azizi Bank' 
  | 'New Kabul Bank' 
  | 'Pashtany Bank' 
  | 'Bank-e-Millie Afghan';

export type CryptoNetworkType = 'TRC20' | 'ERC20';

export type InstallmentInterval = 'monthly' | 'weekly';

export interface WalletOption {
  id: WalletServiceType;
  name: string;
  nameFa: string;
  providerCompany: string;
  color: string;
  logoHint: string;
}

export const AFGHAN_WALLETS: WalletOption[] = [
  {
    id: 'HesabPay',
    name: 'HesabPay',
    nameFa: 'حساب‌پی (HesabPay)',
    providerCompany: 'سیستم ملی پرداخت الکترونیک',
    color: 'from-emerald-500 to-teal-600',
    logoHint: '📱',
  },
  {
    id: 'M-Paisa',
    name: 'M-Paisa',
    nameFa: 'ام‌پیسه (M-Paisa روشن)',
    providerCompany: 'شبکه مخابراتی روشن (Roshan)',
    color: 'from-red-500 to-rose-600',
    logoHint: '🔴',
  },
  {
    id: 'My-Money',
    name: 'My-Money',
    nameFa: 'مای‌مانی (My-Money افغان بیسیم)',
    providerCompany: 'شبکه افغان بیسیم (AWCC)',
    color: 'from-blue-500 to-indigo-600',
    logoHint: '🔵',
  },
  {
    id: 'ATOMA Pay',
    name: 'ATOMA Pay',
    nameFa: 'اتوما پی (ATOMA Pay)',
    providerCompany: 'سامانه پرداخت دیجیتال اتوما',
    color: 'from-purple-500 to-violet-600',
    logoHint: '🟣',
  },
];

export interface BankOption {
  id: AfghanBankType;
  name: string;
  nameFa: string;
  swiftCode: string;
  color: string;
}

export const AFGHAN_BANKS: BankOption[] = [
  {
    id: 'AIB',
    name: 'Afghanistan International Bank (AIB)',
    nameFa: 'د افغانستان نړيوال بانک (AIB)',
    swiftCode: 'AFINAFKA',
    color: 'from-blue-600 to-cyan-700',
  },
  {
    id: 'Azizi Bank',
    name: 'Azizi Bank',
    nameFa: 'عزیزی بانک (Azizi Bank)',
    swiftCode: 'AZBAAFKA',
    color: 'from-amber-600 to-yellow-600',
  },
  {
    id: 'New Kabul Bank',
    name: 'New Kabul Bank',
    nameFa: 'نوی کابل بانک (New Kabul Bank)',
    swiftCode: 'KABUAFKB',
    color: 'from-emerald-600 to-green-700',
  },
  {
    id: 'Pashtany Bank',
    name: 'Pashtany Bank',
    nameFa: 'پشتنی بانک (Pashtany Bank)',
    swiftCode: 'PABAAFKA',
    color: 'from-red-600 to-rose-700',
  },
  {
    id: 'Bank-e-Millie Afghan',
    name: 'Bank-e-Millie Afghan',
    nameFa: 'بانک ملی افغان (Bank-e-Millie)',
    swiftCode: 'BMAFAFKA',
    color: 'from-teal-600 to-emerald-700',
  },
];

export interface CryptoNetworkOption {
  id: CryptoNetworkType;
  name: string;
  blockchain: string;
  feeEstimated: string;
}

export const CRYPTO_NETWORKS: CryptoNetworkOption[] = [
  {
    id: 'TRC20',
    name: 'USDT (TRC20)',
    blockchain: 'Tron Network (کارمزد اندک، تأیید فوق‌سریع)',
    feeEstimated: '~1-2 USDT',
  },
  {
    id: 'ERC20',
    name: 'USDT (ERC20)',
    blockchain: 'Ethereum Network (امنیت بالا، شبکه اتریوم)',
    feeEstimated: '~5-10 USDT',
  },
];

export interface ProviderDefinition {
  id: PaymentProviderType;
  title: string;
  titleEn: string;
  description: string;
  iconName: string;
  badge: string;
  gradient: string;
}

export const PAYMENT_PROVIDERS: Record<PaymentProviderType, ProviderDefinition> = {
  wallet: {
    id: 'wallet',
    title: 'کیف پول الکترونیکی (Mobile Money)',
    titleEn: 'Mobile Wallet',
    description: 'واریز فوری از طریق حساب‌پی، ام‌پیسه روشن، مای‌مانی و اتوما پی',
    iconName: 'Smartphone',
    badge: 'فوری و بومی',
    gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
  },
  bank: {
    id: 'bank',
    title: 'واریز به حساب بانکی (Bank Transfer)',
    titleEn: 'Bank Transfer',
    description: 'انتقال مستقیم به بانک‌های معتبر افغانستان (AIB، عزیزی بانک، کابل بانک و...) همراه با QR کد',
    iconName: 'Building2',
    badge: 'رسمی و شرکتی',
    gradient: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
  },
  hawala: {
    id: 'hawala',
    title: 'حواله صرافی (مارکیت اسعار)',
    titleEn: 'Sarrafi / Hawala',
    description: 'حواله پول از طریق صرافی‌های کابل (سرای شهزاده)، هرات، مزار و تمام ولایات',
    iconName: 'Banknote',
    badge: 'سراسری افغانستان',
    gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
  },
  crypto: {
    id: 'crypto',
    title: 'تتر USDT (ارز دیجیتال)',
    titleEn: 'USDT Tether Crypto',
    description: 'دریافت تتر از طریق شبکه‌های TRC20 و ERC20 با اسکن خودکار QR کد کیف پول',
    iconName: 'Coins',
    badge: 'بین‌المللی و ضدتحریم',
    gradient: 'from-cyan-500/20 to-indigo-500/20 border-cyan-500/30 text-cyan-400',
  },
  cod: {
    id: 'cod',
    title: 'پرداخت در محل (تحویل و تسویه با پیک)',
    titleEn: 'Cash on Delivery',
    description: 'تحویل فیزیکی کارت یا اموال توسط پیک در کابل و ولایات و دریافت وجه نقد پس از تسلیمی',
    iconName: 'Truck',
    badge: 'تسلیمی با اطمینان',
    gradient: 'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400',
  },
  installment: {
    id: 'installment',
    title: 'خرید اقساطی / قراردادی',
    titleEn: 'Installments & Contract',
    description: 'ویژه سفارش‌های شرکتی، سازمانی یا تیراژ با جدول زمان‌بندی اقساط ماهانه و هفتگی',
    iconName: 'CalendarClock',
    badge: 'سازمانی و اقساط',
    gradient: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
  },
};

/**
 * Calculates a structured installment schedule based on total, down payment, count, and interval
 */
export interface InstallmentScheduleItem {
  installmentNumber: number;
  amount: number;
  dueDateLabel: string;
  intervalLabel: string;
}

export function calculateInstallmentSchedule(
  totalAmount: number,
  downPayment: number,
  count: number,
  interval: InstallmentInterval = 'monthly'
): InstallmentScheduleItem[] {
  const safeTotal = Math.max(0, Number(totalAmount) || 0);
  const safeDown = Math.max(0, Math.min(safeTotal, Number(downPayment) || 0));
  const safeCount = Math.max(1, Math.min(36, Number(count) || 1));
  const remaining = safeTotal - safeDown;
  const rawPerInstallment = Math.round(remaining / safeCount);

  const schedule: InstallmentScheduleItem[] = [];
  for (let i = 1; i <= safeCount; i++) {
    const isMonthly = interval === 'monthly';
    const dueDateLabel = isMonthly 
      ? `قسط ${i}: ${i} ماه پس از عقد قرارداد` 
      : `قسط ${i}: هفته ${i} پس از تحویل`;
    
    // Adjust last installment for rounding differences
    const amount = i === safeCount 
      ? remaining - rawPerInstallment * (safeCount - 1)
      : rawPerInstallment;

    schedule.push({
      installmentNumber: i,
      amount: Math.max(0, amount),
      dueDateLabel,
      intervalLabel: isMonthly ? 'ماهانه' : 'هفتگی',
    });
  }

  return schedule;
}

/**
 * Official default central platform payment credentials (for buying NFC cards / platform services)
 */
export const PLATFORM_CENTRAL_PAYMENT_DEFAULTS = {
  wallet: {
    service: 'HesabPay' as WalletServiceType,
    account: '+93799123456',
    name: 'حساب رسمی آریا لینک (HesabPay)',
  },
  bank: {
    bank: 'AIB' as AfghanBankType,
    accountHolder: 'Aryalink Smart Technologies LLC',
    accountNumber: '0101-2345678-001',
    iban: 'AF01AIB00000001012345678001',
  },
  hawala: {
    exchangeName: 'صرافی برادران عزیزی و کابل اکسچنج',
    receiverName: 'احمد فرید رسولی',
    receiverPhone: '+93 788 112 233',
    cityBranch: 'کابل، سرای شهزاده، منزل اول، دکان شماره 114',
  },
  crypto: {
    network: 'TRC20' as CryptoNetworkType,
    walletAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd3G4Vtrc',
  },
  cod: {
    courierCompany: 'پیک اکسپرس کابل و ترانسپورت پستی ولایات',
    deliveryFee: 150,
    terms: 'مبلغ قابل پرداخت پس از دریافت فیزیکی کارت هوشمند NFC و تأیید سلامت بسته به مأمور پیک پرداخت خواهد شد.',
  },
};
