import mongoose, { Schema, Document, Model } from 'mongoose';
import { MultilingualText } from '@/lib/i18n/multilingual';

export interface IBranchOffice {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  manager: string;
  isMainBranch?: boolean;
}

export interface ICompanyInfoDocument extends Document {
  companyName: string | MultilingualText;
  slogan: string | MultilingualText;
  aboutStory: string | MultilingualText;
  mission: string | MultilingualText;
  vision: string | MultilingualText;
  ceoMessage: string | MultilingualText;
  headquarters: string;
  supportPhone: string;
  supportEmail: string;
  branches: IBranchOffice[];
  stats: { label: string; value: string }[];
  updatedAt: Date;
}

const BranchOfficeSchema = new Schema<IBranchOffice>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    manager: { type: String, required: true },
    isMainBranch: { type: Boolean, default: false },
  },
  { _id: false }
);

const CompanyInfoSchema = new Schema<ICompanyInfoDocument>(
  {
    companyName: {
      type: Schema.Types.Mixed,
      default: {
        da: 'شرکت فناوری آریا لینک (Arya Link Tech Ltd)',
        ps: 'د آریا لینک ټکنالوژۍ شرکت',
        en: 'Arya Link Tech Ltd',
      },
    },
    slogan: {
      type: Schema.Types.Mixed,
      default: {
        da: 'پیشگام در هویت دیجیتال و کارت‌های هوشمند NFC در افغانستان',
        ps: 'په افغانستان کې د سمارټ NFC او ډیجیټل هویت مخکښ',
        en: 'Pioneering Smart NFC Digital Identity in Afghanistan',
      },
    },
    aboutStory: {
      type: Schema.Types.Mixed,
      default: {
        da: 'آریا لینک با هدف حذف کارت‌های ویزیت کاغذی و مدرن‌سازی ارتباطات تجاری در افغانستان راه‌اندازی شده است. ما با تلفیق فناوری NFC، سامانه احراز هویت هوشمند و ماژول‌های فروشگاهی، به کسب‌وکارها، شرکت‌ها، متخصصان و کارآفرینان کمک می‌کنیم تا راه‌های ارتباطی و محصولات خود را در یک لمس با مشتریان به اشتراک بگذارند.',
        ps: 'آریا لینک په افغانستان کې د کاغذي ویزټ کارټونو له منځه وړلو او د سوداګریزو اړیکو عصري کولو په موخه پیل شوی. موږ د NFC سمارټ کارټونو له لارې مسلکي کسان او شرکتونه خپلو پیرودونکو سره نښلوو.',
        en: 'Arya Link was established to replace paper business cards and modernize business communication in Afghanistan with smart contactless NFC technology and instant bio-link solutions.',
      },
    },
    mission: {
      type: Schema.Types.Mixed,
      default: {
        da: 'ارائه مدرن‌ترین، سریع‌ترین و در دسترس‌ترین بستر هویت دیجیتال و کارت‌های ویزیت هوشمند با پشتیبانی از درگاه‌های مالی و ارز محلی افغانی.',
        ps: 'په افغانیو د سیمه ییزو تادیاتو په ملاتړ سره د سمارټ ویزټ کارټونو او ډیجیټل هویت خورا عصري، ګړندی او د لاسرسي وړ پلیټفارم چمتو کول.',
        en: 'Delivering the fastest and most accessible smart business card and digital identity platform with local currency payment support.',
      },
    },
    vision: {
      type: Schema.Types.Mixed,
      default: {
        da: 'تبدیل شدن به بزرگ‌ترین شبکه کارت ویزیت دیجیتال، بیو لینک و سیستم پرداخت مستقیم در آسیای میانه و منطقه.',
        ps: 'په منځنۍ اسیا او سیمه کې د سمارټ کارټونو، بایو لینک او مستقیمو تادیاتو تر ټولو لویه شبکه جوړېدل.',
        en: 'Becoming the premier smart contactless card network and direct commerce bio-link platform in Central Asia.',
      },
    },
    ceoMessage: {
      type: Schema.Types.Mixed,
      default: {
        da: 'ما باور داریم تحول دیجیتال از ساده‌ترین نقاط تماس با مشتریان آغاز می‌شود؛ یک کارت ویزیت هوشمند می‌تواند درهای بازارهای بزرگ را به روی شما بگشاید.',
        ps: 'موږ باور لرو چې ډیجیټل بدلون له پیرودونکو سره د لومړني لمس څخه پیل کیږي؛ یو سمارټ ویزټ کارټ کولی شي تاسو ته لویې دروازې پرانیزي.',
        en: 'We believe digital transformation begins at the simplest customer touchpoints: a single smart card can unlock new global business horizons.',
      },
    },
    headquarters: { type: String, default: 'کابل، شهر نو، جاده انصاری، مجتمع فناوری آریا، طبقه 4' },
    supportPhone: { type: String, default: '+93 799 123 456' },
    supportEmail: { type: String, default: 'contact@aryal.ink' },
    branches: {
      type: [BranchOfficeSchema],
      default: [
        {
          id: 'branch_kbl_1',
          name: 'دفتر مرکزی کابل (مرکز پشتیبانی و تولید NFC)',
          city: 'کابل',
          address: 'شهر نو، چهارراهی انصاری، برج فناوری آریا، طبقه 4، واحد 402',
          phone: '+93 799 123 456',
          email: 'kabul@aryal.ink',
          manager: 'مهندس احمد مسعود',
          isMainBranch: true,
        },
        {
          id: 'branch_hrt_1',
          name: 'نمایندگی ولایت هرات (غرب افغانستان)',
          city: 'هرات',
          address: 'خیابان ولایت، روبروی پارک فرهنگ، پاساژ ابریشم، طبقه 2',
          phone: '+93 700 654 321',
          email: 'herat@aryal.ink',
          manager: 'فریدون هروی',
          isMainBranch: false,
        },
        {
          id: 'branch_mza_1',
          name: 'نمایندگی ولایت بلخ (شمال افغانستان)',
          city: 'مزارشریف',
          address: 'دروازه شادیان، جنب دانشگاه بلخ، مرکز تجاری نور',
          phone: '+93 788 987 654',
          email: 'balkh@aryal.ink',
          manager: 'جمشید بلخی',
          isMainBranch: false,
        },
        {
          id: 'branch_kdh_1',
          name: 'نمایندگی ولایت قندهار (جنوب افغانستان)',
          city: 'قندهار',
          address: 'جاده شهیدان، روبروی شهرداری، مرکز تجاری احمدشاهی',
          phone: '+93 777 444 333',
          email: 'kandahar@aryal.ink',
          manager: 'محمد عیسی پوپل',
          isMainBranch: false,
        },
      ],
    },
    stats: {
      type: [{ label: String, value: String }],
      default: [
        { label: 'کارت هوشمند فعال', value: '15,000+' },
        { label: 'شرکت‌ها و سازمان‌ها', value: '240+' },
        { label: 'صرفه‌جویی در کاغذ', value: '1,200,000 برگ' },
        { label: 'دفاتر نمایندگی استانی', value: '4 ولایت' },
      ],
    },
  },
  { timestamps: true }
);

export const CompanyInfo: Model<ICompanyInfoDocument> =
  mongoose.models.CompanyInfo || mongoose.model<ICompanyInfoDocument>('CompanyInfo', CompanyInfoSchema);

export default CompanyInfo;
