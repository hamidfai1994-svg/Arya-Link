import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreBankAccount {
  bankName: string;
  bankNameFa: string;
  accountHolder: string;
  accountNumber: string;
  iban?: string;
  swiftCode?: string;
  isActive: boolean;
}

export interface IStoreCryptoAddress {
  network: string;
  walletAddress: string;
  currency: string;
  isActive: boolean;
}

export interface IStoreHawalaInfo {
  exchangeName: string;
  cityBranch: string;
  receiverName: string;
  receiverPhone: string;
  instructions?: string;
  isActive: boolean;
}

export interface IHesabPayGatewayConfig {
  isActive: boolean;
  isApiEnabled?: boolean;
  isSandbox: boolean;
  merchantId: string;
  apiKey: string;
  apiSecret?: string;
  endpointUrl: string;
  callbackUrl?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface IStoreWalletToggle {
  id: string;
  name: string;
  nameFa: string;
  providerCompany: string;
  isActive: boolean;
}

export interface IStoreBankToggle {
  id: string;
  name: string;
  nameFa: string;
  swiftCode: string;
  isActive: boolean;
}

export interface IStoreActiveMethods {
  hesabpay: boolean;
  bank: boolean;
  crypto: boolean;
  hawala: boolean;
  cod: boolean;
  installment: boolean;
}

export interface IStoreActiveProfileCategories {
  wallet: boolean;
  bank: boolean;
  hawala: boolean;
  crypto: boolean;
}

export interface IStoreWalletItem {
  id: string;
  name: string;
  nameFa: string;
  providerCompany: string;
  accountNumber: string;
  accountHolder: string;
  accountName?: string;
  isApiEnabled?: boolean;
  merchantId?: string;
  apiKey?: string;
  instructions: string;
  qrCodeUrl?: string;
  logoUrl?: string;
  isActive: boolean;
  hesabPayConfig?: {
    isSandbox: boolean;
    merchantId: string;
    apiKey: string;
    apiSecret?: string;
    endpointUrl: string;
  };
}

export interface IStoreBankItem {
  id: string;
  bankName: string;
  bankNameFa: string;
  accountHolder: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
  branchName?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface IStoreHawalaItem {
  id: string;
  exchangeName: string;
  cityBranch: string;
  receiverName: string;
  receiverPhone: string;
  instructions: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface IStoreCryptoItem {
  id: string;
  network: string;
  currency: string;
  walletAddress: string;
  instructions?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface IStorePaymentSettingsDocument extends Document {
  activeMethods: IStoreActiveMethods;
  activeProfileCategories: IStoreActiveProfileCategories;
  wallets: IStoreWalletItem[];
  banks: IStoreBankItem[];
  hawalas: IStoreHawalaItem[];
  cryptos: IStoreCryptoItem[];
  walletsConfig: IStoreWalletToggle[];
  banksConfig: IStoreBankToggle[];
  bankAccounts: IStoreBankAccount[];
  cryptoAddresses: IStoreCryptoAddress[];
  hawalaInfo: IStoreHawalaInfo;
  hesabPay: IHesabPayGatewayConfig;
  codSettings: {
    isActive: boolean;
    deliveryFee: number;
    deliveryCompany: string;
    terms: string;
    logoUrl?: string;
  };
  installmentSettings: {
    isActive: boolean;
    minOrderAmount: number;
    downPaymentPercent: number;
    installmentCount: number;
    corporateOnly: boolean; // محدود منحصراً به حساب‌های سازمانی و B2B
    terms: string;
    logoUrl?: string;
  };
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreBankAccountSchema = new Schema<IStoreBankAccount>(
  {
    bankName: { type: String, default: 'Afghanistan International Bank (AIB)' },
    bankNameFa: { type: String, default: 'د افغانستان نړيوال بانک' },
    accountHolder: { type: String, default: 'Aryalink Smart Technologies LLC' },
    accountNumber: { type: String, default: '0101-2345678-001' },
    iban: { type: String, default: 'AF01AIB00000001012345678001' },
    swiftCode: { type: String, default: 'AFINAFKA' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const StoreCryptoAddressSchema = new Schema<IStoreCryptoAddress>(
  {
    network: { type: String, default: 'TRC20' },
    walletAddress: { type: String, default: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd3G4Vtrc' },
    currency: { type: String, default: 'USDT' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const StoreWalletToggleSchema = new Schema<IStoreWalletToggle>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameFa: { type: String, required: true },
    providerCompany: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const StoreBankToggleSchema = new Schema<IStoreBankToggle>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameFa: { type: String, required: true },
    swiftCode: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const StoreWalletItemSchema = new Schema<IStoreWalletItem>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameFa: { type: String, required: true },
    providerCompany: { type: String, default: '' },
    accountNumber: { type: String, default: '0729736813' },
    accountHolder: { type: String, default: 'حمید فصیحی' },
    accountName: { type: String, default: 'HAMID FASIHI' },
    isApiEnabled: { type: Boolean, default: true },
    merchantId: { type: String, default: 'ARYALINK_MERCHANT_01' },
    apiKey: { type: String, default: 'hp_live_test_key_aryalink_af' },
    instructions: { type: String, default: '' },
    qrCodeUrl: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    hesabPayConfig: {
      isSandbox: { type: Boolean, default: true },
      merchantId: { type: String, default: 'ARYALINK_MERCHANT_01' },
      apiKey: { type: String, default: 'hp_live_test_key_aryalink_af' },
      apiSecret: { type: String, default: '' },
      endpointUrl: { type: String, default: 'https://api.hesabpay.af' },
    },
  },
  { _id: false }
);

const StoreBankItemSchema = new Schema<IStoreBankItem>(
  {
    id: { type: String, required: true },
    bankName: { type: String, required: true },
    bankNameFa: { type: String, required: true },
    accountHolder: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    iban: { type: String, default: '' },
    swiftCode: { type: String, default: '' },
    branchName: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const StoreHawalaItemSchema = new Schema<IStoreHawalaItem>(
  {
    id: { type: String, required: true },
    exchangeName: { type: String, required: true },
    cityBranch: { type: String, default: '' },
    receiverName: { type: String, default: '' },
    receiverPhone: { type: String, default: '' },
    instructions: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const StoreCryptoItemSchema = new Schema<IStoreCryptoItem>(
  {
    id: { type: String, required: true },
    network: { type: String, required: true },
    currency: { type: String, default: 'USDT' },
    walletAddress: { type: String, default: '' },
    instructions: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

export const DEFAULT_DETAILED_WALLETS: IStoreWalletItem[] = [
  {
    id: 'hesabpay',
    name: 'HesabPay',
    nameFa: 'حساب‌پی',
    providerCompany: 'افغان پی سنترال / د افغانستان بانک',
    accountNumber: '0729736813',
    accountHolder: 'حمید فصیحی',
    accountName: 'HAMID FASIHI',
    merchantId: 'ARYALINK_MERCHANT_01',
    apiKey: 'hp_live_test_key_aryalink_af',
    isApiEnabled: true,
    instructions: 'پرداخت آنی از طریق اپلیکیشن یا درگاه رسمی حساب‌پی.',
    logoUrl: '',
    isActive: true,
    hesabPayConfig: {
      isSandbox: true,
      merchantId: 'ARYALINK_MERCHANT_01',
      apiKey: 'hp_live_test_key_aryalink_af',
      apiSecret: '',
      endpointUrl: 'https://api.hesabpay.af',
    },
  },
  {
    id: 'm-paisa',
    name: 'M-Paisa',
    nameFa: 'ام‌پیسه روشن',
    providerCompany: 'روشن مخابراتی',
    accountNumber: '0799001122',
    accountHolder: 'شرکت فناوری‌های هوشمند آریا لینک',
    instructions: 'انتقال آنی وجه از اپلیکیشن ام‌پیسه به شماره فوق و ارسال پیامک تأیید.',
    logoUrl: '',
    isActive: true,
  },

  {
    id: 'atoma-pay',
    name: 'ATOMA Pay',
    nameFa: 'اتوما پی',
    providerCompany: 'اتوما پیمنت تکنولوژی',
    accountNumber: '0788334455',
    accountHolder: 'Aryalink LLC',
    instructions: 'واریز سریع الکترونیک از طریق بارکد یا شماره ولت اتوما پی.',
    logoUrl: '',
    isActive: true,
  },
  {
    id: 'my-money',
    name: 'My-Money',
    nameFa: 'مای‌مانی افغان بیسیم',
    providerCompany: 'افغان بیسیم',
    accountNumber: '0701998877',
    accountHolder: 'شرکت آریا لینک',
    instructions: 'انتقال با کد USSD یا اپلیکیشن مای‌مانی افغان بیسیم.',
    logoUrl: '',
    isActive: true,
  },
  {
    id: 'aurum',
    name: 'Aurum AFG',
    nameFa: 'اوروم',
    providerCompany: 'شرکت خدمات مالی و تادیاتی اوروم',
    accountNumber: '0777556677',
    accountHolder: 'Aryalink',
    instructions: 'تادیات و انتقال وجه با سیستم الکترونیک اوروم.',
    logoUrl: '',
    isActive: true,
  },
  {
    id: 'starpay',
    name: 'StarPay',
    nameFa: 'استار پی',
    providerCompany: 'خدمات پرداخت بین‌المللی استار',
    accountNumber: '0733221100',
    accountHolder: 'Aryalink',
    instructions: 'پرداخت و تسویه بین‌المللی استار پی.',
    logoUrl: '',
    isActive: true,
  },
];

export const DEFAULT_DETAILED_BANKS: IStoreBankItem[] = [
  {
    id: 'aib',
    bankName: 'Afghanistan International Bank',
    bankNameFa: 'د افغانستان نړيوال بانک',
    accountHolder: 'Aryalink Smart Technologies LLC',
    accountNumber: '0101-2345678-001',
    iban: 'AF01AIB00000001012345678001',
    swiftCode: 'AFINAFKA',
    branchName: 'شعبه مرکزی کابل، وزیر اکبر خان',
    logoUrl: '',
    isActive: true,
  },
  {
    id: 'azizi-bank',
    bankName: 'Azizi Bank',
    bankNameFa: 'عزیزی بانک',
    accountHolder: 'شرکت فناوری‌های هوشمند آریا لینک',
    accountNumber: '0001-9876543-001',
    iban: 'AF24AZBA00000000019876543001',
    swiftCode: 'AZBAAFKA',
    branchName: 'شعبه مرکزی کابل، چهارراهی انصاری',
    logoUrl: '',
    isActive: true,
  },
  {
    id: 'new-kabul-bank',
    bankName: 'New Kabul Bank',
    bankNameFa: 'نوی کابل بانک',
    accountHolder: 'شرکت آریا لینک',
    accountNumber: '1001-5544332-001',
    iban: 'AF12NKBK00000010015544332001',
    swiftCode: 'NKBKAFKA',
    branchName: 'شعبه مرکزی کابل',
    logoUrl: '',
    isActive: true,
  },
  {
    id: 'pashtany-bank',
    bankName: 'Pashtany Bank',
    bankNameFa: 'پشتنی بانک',
    accountHolder: 'آریا لینک',
    accountNumber: '2001-8877665-001',
    iban: 'AF33PABK00000020018877665001',
    swiftCode: 'PABKAFKA',
    branchName: 'شعبه پل خشتی، کابل',
    logoUrl: '',
    isActive: true,
  },
  {
    id: 'bma',
    bankName: 'Bank-e-Millie Afghan',
    bankNameFa: 'بانک ملی افغان',
    accountHolder: 'شرکت فناوری آریا لینک',
    accountNumber: '3001-1122334-001',
    iban: 'AF44BMAF00000030011122334001',
    swiftCode: 'BMAFAFK1',
    branchName: 'شعبه مرکزی کابل، ابن سینا',
    logoUrl: '',
    isActive: true,
  },
];

export const DEFAULT_DETAILED_HAWALAS: IStoreHawalaItem[] = [
  {
    id: 'hawala-1',
    exchangeName: 'صرافی برادران عزیزی و کابل اکسچنج',
    cityBranch: 'کابل، سرای شهزاده، منزل اول، دکان شماره 114',
    receiverName: 'احمد فرید رسولی',
    receiverPhone: '+93 788 112 233',
    instructions: 'حواله را در نزدیک‌ترین صرافی به نام فوق صادر و پارچه/سند حواله را ارسال فرمایید.',
    logoUrl: '',
    isActive: true,
  },
  {
    id: 'hawala-2',
    exchangeName: 'صرافی برادران انوری و هرات اکسچنج',
    cityBranch: 'هرات، مارکت خراسان، منزل همکف، دکان 28',
    receiverName: 'محمد یاسر رسولی',
    receiverPhone: '+93 700 445 566',
    instructions: 'حواله مستقیم هرات و حوزۀ غرب با تاییدیه آنی صرافی.',
    logoUrl: '',
    isActive: true,
  },
];

export const DEFAULT_DETAILED_CRYPTOS: IStoreCryptoItem[] = [
  {
    id: 'usdt-trc20',
    network: 'TRC20',
    currency: 'USDT',
    walletAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd3G4Vtrc',
    instructions: 'واریز سریع در شبکه بلاکچین ترون با کارمزد بسیار اندک.',
    logoUrl: '',
    isActive: true,
  },
  {
    id: 'usdt-erc20',
    network: 'ERC20',
    currency: 'USDT',
    walletAddress: '0x71C836e4bE76114eF33694fDdbF19d8A59E7A8A3',
    instructions: 'واریز بین‌المللی در شبکه اتریوم.',
    logoUrl: '',
    isActive: true,
  },
];

const DEFAULT_WALLETS_CONFIG: IStoreWalletToggle[] = [
  { id: 'hesabpay', name: 'HesabPay', nameFa: 'حساب‌پی', providerCompany: 'افغان پی سنترال / د افغانستان بانک', isActive: true },
  { id: 'm-paisa', name: 'M-Paisa', nameFa: 'ام‌پیسه', providerCompany: 'روشن مخابراتی', isActive: true },
  { id: 'atoma-pay', name: 'ATOMA Pay', nameFa: 'اتوما پی', providerCompany: 'اتوما پیمنت تکنولوژی', isActive: true },
  { id: 'my-money', name: 'My-Money', nameFa: 'مای‌مانی', providerCompany: 'افغان بیسیم', isActive: true },
  { id: 'aurum', name: 'Aurum AFG', nameFa: 'اوروم', providerCompany: 'شرکت خدمات مالی و تادیاتی اوروم', isActive: true },
  { id: 'starpay', name: 'StarPay', nameFa: 'استار پی', providerCompany: 'خدمات پرداخت بین‌المللی استار', isActive: true },
];

const DEFAULT_BANKS_CONFIG: IStoreBankToggle[] = [
  { id: 'aib', name: 'Afghanistan International Bank', nameFa: 'د افغانستان نړيوال بانک', swiftCode: 'AFINAFKA', isActive: true },
  { id: 'azizi-bank', name: 'Azizi Bank', nameFa: 'عزیزی بانک', swiftCode: 'AZBAAFKA', isActive: true },
  { id: 'dab', name: 'Da Afghanistan Bank', nameFa: 'د افغانستان بانک (بانک مرکزی)', swiftCode: 'DABKAFKA', isActive: true },
  { id: 'new-kabul-bank', name: 'New Kabul Bank', nameFa: 'نوی کابل بانک', swiftCode: 'NKBKAFKA', isActive: true },
  { id: 'pashtany-bank', name: 'Pashtany Bank', nameFa: 'پشتنی بانک', swiftCode: 'PABKAFKA', isActive: true },
  { id: 'bma', name: 'Bank-e-Millie Afghan', nameFa: 'بانک ملی افغان', swiftCode: 'BMAFAFK1', isActive: true },
  { id: 'ghazanfar', name: 'Ghazanfar Bank', nameFa: 'غضنفر بانک', swiftCode: 'GZNBAFKA', isActive: true },
  { id: 'maiwand', name: 'Maiwand Bank', nameFa: 'میوند بانک', swiftCode: 'MAIBAFKA', isActive: true },
  { id: 'islamic', name: 'Islamic Bank of Afghanistan', nameFa: 'د افغانستان اسلامی بانک', swiftCode: 'IBOAAFKA', isActive: true },
  { id: 'united', name: 'Afghan United Bank', nameFa: 'افغان یونایتد بانک', swiftCode: 'AUBKAFKA', isActive: true },
  { id: 'fmfb', name: 'First MicroFinance Bank', nameFa: 'د افغانستان د لومړنی کوچنی مالی بانک', swiftCode: 'FMFBAFKA', isActive: true },
];

const StorePaymentSettingsSchema = new Schema<IStorePaymentSettingsDocument>(
  {
    activeMethods: {
      hesabpay: { type: Boolean, default: true },
      bank: { type: Boolean, default: true },
      crypto: { type: Boolean, default: true },
      hawala: { type: Boolean, default: true },
      cod: { type: Boolean, default: true },
      installment: { type: Boolean, default: true },
    },
    activeProfileCategories: {
      wallet: { type: Boolean, default: true },
      bank: { type: Boolean, default: true },
      hawala: { type: Boolean, default: true },
      crypto: { type: Boolean, default: true },
    },
    wallets: {
      type: [StoreWalletItemSchema],
      default: DEFAULT_DETAILED_WALLETS,
    },
    banks: {
      type: [StoreBankItemSchema],
      default: DEFAULT_DETAILED_BANKS,
    },
    hawalas: {
      type: [StoreHawalaItemSchema],
      default: DEFAULT_DETAILED_HAWALAS,
    },
    cryptos: {
      type: [StoreCryptoItemSchema],
      default: DEFAULT_DETAILED_CRYPTOS,
    },
    walletsConfig: {
      type: [StoreWalletToggleSchema],
      default: DEFAULT_WALLETS_CONFIG,
    },
    banksConfig: {
      type: [StoreBankToggleSchema],
      default: DEFAULT_BANKS_CONFIG,
    },
    bankAccounts: {
      type: [StoreBankAccountSchema],
      default: [
        {
          bankName: 'Afghanistan International Bank (AIB)',
          bankNameFa: 'د افغانستان نړيوال بانک (AIB)',
          accountHolder: 'Aryalink Smart Technologies LLC',
          accountNumber: '0101-2345678-001',
          iban: 'AF01AIB00000001012345678001',
          swiftCode: 'AFINAFKA',
          isActive: true,
        },
        {
          bankName: 'Azizi Bank',
          bankNameFa: 'عزیزی بانک (Azizi Bank)',
          accountHolder: 'شرکت فناوری‌های هوشمند آریا لینک',
          accountNumber: '0001-9876543-001',
          iban: 'AF24AZBA00000000019876543001',
          swiftCode: 'AZBAAFKA',
          isActive: true,
        },
      ],
    },
    cryptoAddresses: {
      type: [StoreCryptoAddressSchema],
      default: [
        {
          network: 'TRC20',
          walletAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd3G4Vtrc',
          currency: 'USDT',
          isActive: true,
        },
      ],
    },
    hawalaInfo: {
      exchangeName: { type: String, default: 'صرافی برادران عزیزی و کابل اکسچنج' },
      cityBranch: { type: String, default: 'کابل، سرای شهزاده، منزل اول، دکان شماره 114' },
      receiverName: { type: String, default: 'احمد فرید رسولی' },
      receiverPhone: { type: String, default: '+93 788 112 233' },
      instructions: {
        type: String,
        default: 'حواله را در نزدیک‌ترین صرافی به مشخصات فوق صادر و کد حواله را ارسال فرمایید.',
      },
      isActive: { type: Boolean, default: true },
    },
    hesabPay: {
      isActive: { type: Boolean, default: true },
      isApiEnabled: { type: Boolean, default: true },
      isSandbox: { type: Boolean, default: true },
      accountName: { type: String, default: 'HAMID FASIHI' },
      accountNumber: { type: String, default: '0729736813' },
      merchantId: { type: String, default: 'ARYALINK_MERCHANT_01' },
      apiKey: { type: String, default: 'hp_live_test_key_aryalink_af' },
      apiSecret: { type: String, default: '' },
      endpointUrl: { type: String, default: 'https://api.hesabpay.af' },
      callbackUrl: { type: String, default: '/api/checkout/hesabpay/callback' },
    },
    codSettings: {
      isActive: { type: Boolean, default: true },
      deliveryFee: { type: Number, default: 150 },
      deliveryCompany: { type: String, default: 'پیک اکسپرس کابل و ترانسپورت پستی ولایات' },
      terms: {
        type: String,
        default: 'مبلغ قابل پرداخت پس از دریافت فیزیکی کارت هوشمند NFC و تأیید سلامت بسته به مأمور پیک پرداخت خواهد شد.',
      },
      logoUrl: { type: String, default: '' },
    },
    installmentSettings: {
      isActive: { type: Boolean, default: true },
      minOrderAmount: { type: Number, default: 5000 },
      downPaymentPercent: { type: Number, default: 30 },
      installmentCount: { type: Number, default: 3 },
      corporateOnly: { type: Boolean, default: true }, // فقط برای B2B/سازمانی
      terms: {
        type: String,
        default: 'خرید اقساطی صرفاً ویژه شرکت‌ها، سازمان‌ها و مشتریان سازمانی با عقد قرارداد رسمی امکان‌پذیر می‌باشد.',
      },
      logoUrl: { type: String, default: '' },
    },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

export const StorePaymentSettings: Model<IStorePaymentSettingsDocument> =
  (mongoose?.models && mongoose.models.StorePaymentSettings)
    ? (mongoose.models.StorePaymentSettings as Model<IStorePaymentSettingsDocument>)
    : mongoose.model<IStorePaymentSettingsDocument>('StorePaymentSettings', StorePaymentSettingsSchema);

export default StorePaymentSettings;

