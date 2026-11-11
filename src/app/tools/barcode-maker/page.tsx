'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import bwipjs from 'bwip-js';
import {
  Barcode,
  Download,
  Copy,
  RefreshCw,
  Sparkles,
  Sliders,
  Check,
  User,
  Info,
  ShieldCheck,
  Palette,
  Layers,
  Calendar,
  Wifi,
  Search,
  Camera,
  X,
  Filter,
  Code,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ToolsCtaBanner } from '@/components/tools/ToolsCtaBanner';
import { useProfileLoader } from '@/components/tools/useProfileLoader';
import { CodeScanner } from '@/components/tools/CodeScanner';

export interface BarcodeSubtype {
  id: string;
  name: string;
  bcid: string;
  defaultText: string;
  placeholder: string;
  hint: string;
  features?: string;
  guide?: string;
  opts?: Record<string, any>;
}

export interface BarcodeCategory {
  id: string;
  title: string;
  subtypes: BarcodeSubtype[];
}

// Full 116 Barcode Models Database across 13 Categories (Localized for Afghan Dari)
export const BARCODE_CATEGORIES: BarcodeCategory[] = [
  // 1. Linear Codes (12 items)
  {
    id: 'linear',
    title: '1. Linear Codes (کدهای خطی)',
    subtypes: [
      { id: 'code128', name: 'Code-128 (معیار جهانی)', bcid: 'code128', defaultText: 'ARYALINK-128', placeholder: 'متن + عدد یا نمادهای معیاری (مثال: ARYALINK-128)', hint: 'حروف الفبای لاتین، اعداد و کلیه کاراکترهای اسکی' },
      { id: 'code11', name: 'Code-11 (تجهیزات مخابراتی)', bcid: 'code11', defaultText: '12345678', placeholder: 'فقط ارقام 0-9 و خط فاصله (مثال: 12345678)', hint: 'مخصوص شناسایی خطوط، کابل‌ها و تجهیزات تیلیفونی' },
      { id: 'interleaved2of5', name: 'Code-2of5 Interleaved (کدهای باربری و صنعتی)', bcid: 'interleaved2of5', defaultText: '2401234567', placeholder: 'تعداد جفت از ارقام (مثال: 2401234567)', hint: 'بارکد عددی متراکم با تعداد جفت ارقام برای گدام و توزیع' },
      { id: 'code39', name: 'Code-39 (صنعتی و نظامی)', bcid: 'code39', defaultText: 'ARYA39', placeholder: 'حروف بزرگ انگلیسی و ارقام (مثال: ARYA39)', hint: 'معیار کلاسیک صنعتی با حروف بزرگ، اعداد و خط فاصله' },
      { id: 'code39ext', name: 'Code-39 Full ASCII (پشتیبانی کامل اسکی)', bcid: 'code39ext', defaultText: 'Code39 Ext!', placeholder: 'تمام کاراکترهای اسکی شامل حروف کوچک (مثال: Code39 Ext!)', hint: 'نسخه ارتقایافته کد 39 با پشتیبانی از حروف کوچک و نمادها' },
      { id: 'code93', name: 'Code-93 (فشرده با چگالی بالا)', bcid: 'code93', defaultText: 'ARYA93', placeholder: 'متن یا ارقام فشرده (مثال: ARYA93)', hint: 'امنیت و چگالی بالاتر نسبت به کد 39 برای فضاهای باریک' },
      { id: 'flattermarken', name: 'Flattermarken (علامت‌گذاری چاپ و صحافی)', bcid: 'flattermarken', defaultText: '12345', placeholder: 'فقط ارقام (مثال: 12345)', hint: 'علامت‌های کنترول ترتیب صفحات و فورم‌های مطبعه' },
      { id: 'gs1-128', name: 'GS1-128 (UCC/EAN-128 زنجیره تأمین)', bcid: 'gs1-128', defaultText: '(01)09521234543213(3103)000123', placeholder: 'شناسه‌های کاربردی با قوسین (مثال: (01)09521234543213)', hint: 'معیار بین‌المللی لجستیک اموال و پالت‌های حمل و نقل' },
      { id: 'msi', name: 'MSI (گدام‌داری و رف فروشگاهی)', bcid: 'msi', defaultText: '123456', placeholder: 'فقط ارقام 0 تا 9 (مثال: 123456)', hint: 'سیستم کدگذاری خطی پلسی Plessey برای لیبل نرخ رف‌ها' },
      { id: 'pharmacode_one', name: 'Pharmacode One-Track (دواسازی تک‌خط)', bcid: 'pharmacode', defaultText: '117480', placeholder: 'یک عدد بین 3 تا 131070 (مثال: 117480)', hint: 'کنترول بسته‌بندی دوا در فابریکه‌ها با خطوط تک‌رشته‌ای' },
      { id: 'pharmacode_two', name: 'Pharmacode Two-Track (دواسازی دوخط)', bcid: 'pharmacode2', defaultText: '117480', placeholder: 'یک عدد بین 4 تا 64570080 (مثال: 117480)', hint: 'کنترول بسته‌بندی دوایی با دو ردیف خطوط با ضخامت متغیر' },
      { id: 'telepen', name: 'Telepen Alpha (معیار با امنیت بالا)', bcid: 'telepen', defaultText: 'ARYALINK', placeholder: 'متن اسکی انگلیسی (مثال: ARYALINK)', hint: 'سیستم کدگذاری اسکی کامل بریتانیا با ضریب خطای فوق‌العاده ناچیز' },
    ],
  },

  // 2. Postal Codes (15 items)
  {
    id: 'postal',
    title: '2. Postal Codes (کدهای پستی)',
    subtypes: [
      { id: 'auspost', name: 'Australian Post (پست استرالیا)', bcid: 'auspost', defaultText: '5956439111ABA 9', placeholder: 'کد 4-State استرالیا (مثال: 5956439111ABA 9)', hint: 'بارکد توزیع مکانیزه مرسولات شرکت پست استرالیا' },
      { id: 'daft', name: 'DAFT (کدگذاری 4 حالته پستی)', bcid: 'daft', defaultText: 'DAFTDAFT', placeholder: 'حروف D، A، F و T (مثال: DAFTDAFTDAFT)', hint: 'کدگذاری عمومی خطوط کوتاه، بالا، پایین و کامل پستی' },
      { id: 'dpd', name: 'DPD Barcode (شرکت پستی بین‌المللی DPD)', bcid: 'code128', defaultText: '01234567890123', placeholder: '14 رقم رهگیری بسته DPD (مثال: 01234567890123)', hint: 'شناسه اختصاصی بسته‌های شرکت انتقال سریع DPD اروپا' },
      { id: 'japanpost', name: 'Japanese Postal (پست ملی ژاپن)', bcid: 'japanpost', defaultText: '6540123789-A-K-Z', placeholder: 'کد پستی و آدرس ژاپن (مثال: 6540123789-A-K-Z)', hint: 'سیستم مرتب‌سازی خودکار پاکت نامه‌ها در ژاپن' },
      { id: 'kix', name: 'KIX (پست ملی هلند - TNT)', bcid: 'kix', defaultText: '1231FZ13XHS', placeholder: 'کد پستی هلند (مثال: 1231FZ13XHS)', hint: 'شاخص مشتری Klantindex در سامانه پستی هلند' },
      { id: 'koreapost', name: 'Korean Postal (پست کره جنوبی)', bcid: 'code128', defaultText: '123-456', placeholder: 'کد پستی 6 رقمی کره (مثال: 123-456)', hint: 'بارکد رسمی خطی توزیع نامه‌های شرکت پست کره جنوبی' },
      { id: 'planet', name: 'Planet Code 12 (رهگیری مکانیزه پست آمریکا)', bcid: 'planet', defaultText: '12345678901', placeholder: '11 یا 13 رقم (مثال: 12345678901)', hint: 'سامانه ردیابی و اعتبارسنجی آنلاین مرسولات USPS' },
      { id: 'royalmail', name: 'Royal Mail 4-State (پست سلطنتی بریتانیا)', bcid: 'royalmail', defaultText: 'LE28HS9Z', placeholder: 'کد پستی انگلستان (مثال: LE28HS9Z)', hint: 'کدگذاری 4 حالته RM4SCC جهت پردازش خودکار پاکت نامه‌ها' },
      { id: 'mailmark', name: 'Royal Mail Mailmark 4-State (سیستم نوین میل‌مارک)', bcid: 'mailmark', defaultText: 'JGB 012100123412345678AB19XY1A 0             www.xyz.com', placeholder: 'فرمت استاندارد میل‌مارک (مثال: JGB 012100123412345678AB19XY1A 0             www.xyz.com)', hint: 'جدیدترین سیستم رهگیری هوشمند مرسولات پستی بریتانیا' },
      { id: 'mailmark2d_postal', name: 'Royal Mail Mailmark 2D (کد دوبعدی میل‌مارک)', bcid: 'datamatrix', defaultText: 'JGB 012100123412345678AB19XY1A 0', placeholder: 'اطلاعات میل‌مارک دوبعدی (مثال: JGB 012100123412345678AB19XY1A 0)', hint: 'کد دیتاماتریکس با گنجایش اطلاعاتی بالا برای پاکت‌های تجاری' },
      { id: 'postnet5', name: 'USPS PostNet 5 (زیپ‌کد 5 رقمی آمریکا)', bcid: 'postnet', defaultText: '12345', placeholder: '5 رقم زیپ‌کد (مثال: 90210)', hint: 'کد میله‌ای کلاسیک هدایت نامه‌ها به منطقه پستی' },
      { id: 'postnet9', name: 'USPS PostNet 9 (زیپ‌کد 9 رقمی آمریکا)', bcid: 'postnet', defaultText: '123456789', placeholder: '9 رقم زیپ‌کد (مثال: 123456789)', hint: 'کد ZIP+4 جهت مسیریابی دقیق‌تر بلوک شهری' },
      { id: 'postnet11', name: 'USPS PostNet 11 (کد تحویل نهایی پستی)', bcid: 'postnet', defaultText: '12345678901', placeholder: '11 رقم نقطه تحویل (مثال: 12345678901)', hint: 'کد Delivery Point Barcode برای تفکیک تا سطح پلاک تعمیر' },
      { id: 'onecode', name: 'USPS IM Package (پکیج هوشمند Intelligent Mail)', bcid: 'onecode', defaultText: '0123456709498765432101234567891', placeholder: '31 رقم استاندارد IMb (مثال: 0123456709498765432101234567891)', hint: 'یکپارچه‌ترین بارکد اداره پست ایالات متحده آمریکا' },
      { id: 'upus10', name: 'UPU S10 (اتحادیه جهانی پست)', bcid: 'code128', defaultText: 'RA123456789US', placeholder: 'شناسه 13 کاراکتری پستی (مثال: RA123456789US)', hint: 'معیار بین‌المللی مرسولات سفارشی، امانات و پست پیشتاز' },
    ],
  },

  // 3. EAN / UPC (9 items)
  {
    id: 'ean_upc',
    title: '3. EAN / UPC (پرچون‌فروشی و اموال)',
    subtypes: [
      { id: 'ean8', name: 'EAN-8 (اجناس و محصولات کوچک)', bcid: 'ean8', defaultText: '95200002', placeholder: '7 یا 8 رقم جنس (مثال: 95200002)', hint: 'مخصوص اقلام و بسته‌های بسیار فشرده سوپرمارکتی' },
      { id: 'ean13', name: 'EAN-13 (بارکد معیاری اموال و اجناس)', bcid: 'ean13', defaultText: '9520123456788', placeholder: '12 یا 13 رقم مال / جنس (مثال: 9520123456788)', hint: 'رایج‌ترین بارکد تجارتی جهان برای ثبت در سیستم فروشگاه' },
      { id: 'ean14', name: 'EAN-14 / GS1-128 (کارتن‌های عمده)', bcid: 'ean14', defaultText: '(01) 0 952 8765 43210 8', placeholder: 'کد 14 رقمی کارتن با قوسین (مثال: (01) 0 952 8765 43210 8)', hint: 'شناسایی بسته‌های مادر، کارتن‌های صادراتی و پالت‌ها' },
      { id: 'ean8composite', name: 'EAN-8 Composite (ترکیبی دو مؤلفه‌ای EAN-8)', bcid: 'ean8composite', defaultText: '95200002|(21)A12345678', placeholder: 'کد EAN-8 به همراه مؤلفه دو بعدی با خط عمودی (مثال: 95200002|(21)A12345678)', hint: 'ترکیب بارکد خطی با میکروپی‌دی‌اف برای معلومات تکمیلی' },
      { id: 'ean13composite', name: 'EAN-13 Composite (ترکیبی دو مؤلفه‌ای EAN-13)', bcid: 'ean13composite', defaultText: '9520123456788|(99)1234-abcd', placeholder: 'کد EAN-13 به همراه مؤلفه دو بعدی (مثال: 9520123456788|(99)1234-abcd)', hint: 'افزودن نمبر لات یا انقضا در بالای بارکد جنس' },
      { id: 'upca', name: 'UPC-A (معیار آمریکا و کانادا)', bcid: 'upca', defaultText: '012345000058', placeholder: '11 یا 12 رقم جنس (مثال: 012345000058)', hint: 'سیستم معیاری بارکد فروشگاهی آمریکای شمالی' },
      { id: 'upce', name: 'UPC-E (نسخه فشرده 8 رقمی UPC)', bcid: 'upce', defaultText: '01234558', placeholder: '6 تا 8 رقم جنس (مثال: 01234558)', hint: 'نسخه بدون صفرهای مازاد UPC-A برای قوطی‌ها' },
      { id: 'upcacomposite', name: 'UPC-A Composite (ترکیبی دو مؤلفه‌ای UPC-A)', bcid: 'upcacomposite', defaultText: '012345000058|(99)1234-abcd', placeholder: 'کد UPC-A با مؤلفه دوبعدی (مثال: 012345000058|(99)1234-abcd)', hint: 'بارکد مال آمریکایی به همراه معلومات تکمیلی گدام‌داری' },
      { id: 'upcecomposite', name: 'UPC-E Composite (ترکیبی دو مؤلفه‌ای UPC-E)', bcid: 'upcecomposite', defaultText: '01234558|(15)021231', placeholder: 'کد UPC-E با مؤلفه دوبعدی (مثال: 01234558|(15)021231)', hint: 'نسخه فشرده ترکیبی اموال بازار آمریکا' },
    ],
  },

  // 4. 2D Codes (14 items)
  {
    id: '2d',
    title: '4. 2D Codes (کدهای دوبعدی)',
    subtypes: [
      { id: 'qrcode', name: 'QR Code (کد پاسخ سریع معیاری)', bcid: 'qrcode', defaultText: 'https://aryalink.com', placeholder: 'لینک وب‌سایت یا متن (مثال: https://aryalink.com)', hint: 'کد مربعی چندمنظوره با قابلیت اسکن 360 درجه' },
      { id: 'qrcode_mobile_2d', name: 'QR Code (Mobile) (بهینه برای موبایل)', bcid: 'qrcode', defaultText: 'https://aryalink.com', placeholder: 'آدرس اینترنتی یا پیام (مثال: https://aryalink.com)', hint: 'تنظیمات سبک و سریع برای کمره موبایل‌های هوشمند' },
      { id: 'datamatrix', name: 'Data Matrix (صنعتی و الکترونیک)', bcid: 'datamatrix', defaultText: 'https://aryalink.com', placeholder: 'متن، عدد یا آدرس (مثال: https://aryalink.com)', hint: 'کد دوبعدی فشرده برای پرزه‌جات فلزی، بردهای الکترونیکی و دوا' },
      { id: 'azteccode', name: 'Aztec (تکت قطار و پرواز)', bcid: 'azteccode', defaultText: 'AryaLink Ticket 2026', placeholder: 'مشخصات تکت یا بارکد مسافرتی (مثال: AryaLink Ticket 2026)', hint: 'کد مرکزی مربعی بدون نیاز به حاشیه سفید خالی' },
      { id: 'codablockf', name: 'Codablock-F (بارکد چندطبقه بر پایه کد 128)', bcid: 'codablockf', defaultText: 'AryaLink Codablock', placeholder: 'متن یا ارقام (مثال: AryaLink Codablock)', hint: 'بلوک دوبعدی پشته‌ای با امنیت رمزگذاری بالا' },
      { id: 'maxicode', name: 'MaxiCode (بسته‌بندی پستی UPS)', bcid: 'maxicode', defaultText: '996152382802840001', placeholder: 'کد پستی و نمبر پیگیری بسته (مثال: 996152382802840001)', hint: 'کد شش‌ضلعی با چشم هدف در مرکز مخصوص اسکنر خطوط پرسرعت' },
      { id: 'micropdf417', name: 'MicroPDF417 (کد مینیاتوری چندخطی)', bcid: 'micropdf417', defaultText: 'Micro1234', placeholder: 'متن کوتاه فشرده (مثال: Micro1234)', hint: 'نسخه جمع‌وجور PDF417 برای پرزه‌ها با عرض محدود' },
      { id: 'pdf417', name: 'PDF417 (تذکره الکترونیکی و اسناد هویتی)', bcid: 'pdf417', defaultText: 'AryaLink ID Card Verification', placeholder: 'معلومات هویتی و پرسونلی متنی (مثال: AryaLink ID Card Verification)', hint: 'بارکد اسناد دولتی، تکت پرواز و لایسنس رانندگی' },
      { id: 'microqrcode', name: 'Micro QR Code (کیوآر کد مینیاتوری)', bcid: 'microqrcode', defaultText: '12345', placeholder: 'متن یا عدد کوتاه (مثال: 12345)', hint: 'کیوآر کد تک‌نشانگر با ابعاد بسیار ریز' },
      { id: 'hanxin', name: 'Han Xin (کد ملی چین)', bcid: 'hanxin', defaultText: 'This is Han Xin', placeholder: 'متن یا حروف (مثال: This is Han Xin)', hint: 'کد دوبعدی بهینه‌شده برای الفبای چینی و کاراکترهای یونیکد' },
      { id: 'dotcode', name: 'DotCode (چاپ پرسرعت صنعتی)', bcid: 'dotcode', defaultText: 'DotCode-2026', placeholder: 'متن یا شناسه محصول (مثال: DotCode-2026)', hint: 'پرنترهای جوهرافشان لیزری سریع روی تنباکو، سگرت و دوا' },
      { id: 'mailmark2d', name: 'Royal Mail Mailmark 2D (کد پستی انگلستان)', bcid: 'datamatrix', defaultText: 'JGB 012100123412345678AB19XY1A 0', placeholder: 'معلومات پاکت پستی (مثال: JGB 012100123412345678AB19XY1A 0)', hint: 'معیار پست سلطنتی انگلستان در قالب دیتاماتریکس' },
      { id: 'ntin_code', name: 'NTIN Code (کد ملی دوایی جنس)', bcid: 'gs1datamatrix', defaultText: '(01)09521234543213(21)12345', placeholder: 'شناسه ملی جنس و نمبر سریال (مثال: (01)09521234543213(21)12345)', hint: 'شناسایی و ردیابی فرآورده‌های صحی و دوایی' },
      { id: 'ppn_code', name: 'PPN Code (شناسه دواخانه‌ای PPN)', bcid: 'code128', defaultText: '(9N)1234567890(1T)LOT123', placeholder: 'نمبر ثبت PPN و لات نمبر (مثال: (9N)1234567890(1T)LOT123)', hint: 'Pharmacy Product Number اروپا جهت ثبت اصالت دوا' },
    ],
  },

  // 5. GS1 DataBar (13 items)
  {
    id: 'gs1_databar',
    title: '5. GS1 DataBar (زنجیره تأمین و اکمالات)',
    subtypes: [
      { id: 'databaromni', name: 'GS1-DataBar (چندجهته فروشگاهی)', bcid: 'databaromni', defaultText: '(01)09521234543213', placeholder: 'کد GTIN با پیش‌شماره (مثال: (01)09521234543213)', hint: 'قابل خواندن توسط اسکنرهای صندوق فروشگاه' },
      { id: 'databarstacked', name: 'GS1-DataBar Stacked (دوطبقه فشرده)', bcid: 'databarstacked', defaultText: '(01)09521234543213', placeholder: 'فورمت (01) و ارقام GTIN (مثال: (01)09521234543213)', hint: 'مناسب میوه، ترکاری و اموال فله‌ای' },
      { id: 'databarstackedomni', name: 'GS1-DataBar Stacked Omni (چندجهته دوطبقه)', bcid: 'databarstackedomni', defaultText: '(01)24012345678905', placeholder: 'کد GTIN با ارقام معتبر (مثال: (01)24012345678905)', hint: 'ترکیب خوانایی چندجهته با ابعاد فشرده دوطبقه' },
      { id: 'databarlimited', name: 'GS1-DataBar Limited (محدود دوایی)', bcid: 'databarlimited', defaultText: '(01)15012345678907', placeholder: 'کد با ارقام آغازین 0 یا 1 (مثال: (01)15012345678907)', hint: 'مخصوص اقلام صحی بسیار باریک' },
      { id: 'databarexpanded', name: 'GS1-DataBar Expanded (توسعه‌یافته با وزن و قیمت)', bcid: 'databarexpanded', defaultText: '(01)09521234543213(3103)000123', placeholder: 'شناسه جنس و مشخصات وزن یا نرخ (مثال: (01)09521234543213(3103)000123)', hint: 'امکان ثبت تاریخ انقضا و وزن روی بسته‌بندی گوشت و مواد تازه' },
      { id: 'databarexpandedstacked', name: 'GS1-DataBar Expanded Stacked (دوطبقه توسعه‌یافته)', bcid: 'databarexpandedstacked', defaultText: '(01)09521234543213(3103)000123', placeholder: 'کد توسعه‌یافته دوطبقه (مثال: (01)09521234543213(3103)000123)', hint: 'نسخه چندسطحی برای برچسب‌های کم‌عرض' },
      { id: 'gs1-128composite', name: 'GS1-128 Composite (ترکیبی GS1-128)', bcid: 'gs1-128composite', defaultText: '(00)095287654321012346|(02)09521234543213(37)24(10)1234567ABCDEFG', placeholder: 'کد خطی و کامپوننت با خط عمودی (مثال: (00)...|(02)...)', hint: 'ترکیب کد 128 با بخش دوبعدی برای پالت و لجستیک اموال' },
      { id: 'databaromnicomposite', name: 'GS1-DataBar Composite (ترکیبی چندجهته)', bcid: 'databaromnicomposite', defaultText: '(01)09521234543213|(11)990102', placeholder: 'کد دیتا بار به همراه مؤلفه دوم (مثال: (01)09521234543213|(11)990102)', hint: 'بارکد فروشگاهی دو مؤلفه‌ای برای اقلام حساس' },
      { id: 'databarstackedcomposite', name: 'GS1-DataBar Stacked Composite (ترکیبی دوطبقه)', bcid: 'databarstackedcomposite', defaultText: '(01)09521234543213|(17)010200', placeholder: 'کد با مؤلفه دوم (مثال: (01)09521234543213|(17)010200)', hint: 'نسخه ترکیبی برای بسته‌های فشرده' },
      { id: 'databarstackedomnicomposite', name: 'GS1-DataBar Stacked Omni Composite (ترکیبی چندجهته دوطبقه)', bcid: 'databarstackedomnicomposite', defaultText: '(01)03612345678904|(11)990102', placeholder: 'کد ترکیبی (مثال: (01)03612345678904|(11)990102)', hint: 'اسکن سریع و همه جهته در صندوق با معلومات تاریخ' },
      { id: 'databarlimitedcomposite', name: 'GS1-DataBar Limited Composite (ترکیبی محدود)', bcid: 'databarlimitedcomposite', defaultText: '(01)09521234543213|(21)abcdefghijklmnopqrst', placeholder: 'کد ترکیبی (مثال: (01)09521234543213|(21)abcdefghijklmnopqrst)', hint: 'مخصوص اقلام صحی با سریال طولانی' },
      { id: 'databarexpandedcomposite', name: 'GS1-DataBar Expanded Composite (ترکیبی توسعه‌یافته)', bcid: 'databarexpandedcomposite', defaultText: '(01)09521234543213(3103)001234|(91)1A2B3C4D5E', placeholder: 'کد گسترش‌یافته ترکیبی (مثال: (01)09521234543213(3103)001234|(91)1A2B3C4D5E)', hint: 'ثبت جامع وزن، بچ و تاریخ در زنجیره اکمالات سرد' },
      { id: 'databarexpandedstackedcomposite', name: 'GS1-DataBar Expanded Stacked Composite (ترکیبی چندبخشی)', bcid: 'databarexpandedstackedcomposite', defaultText: '(01)09521234543213(10)ABCDEF|(21)12345678', placeholder: 'کد چندبخشی ترکیبی (مثال: (01)09521234543213(10)ABCDEF|(21)12345678)', hint: 'بیشترین ظرفیت معلوماتی در حداقل عرض لیبل' },
    ],
  },

  // 6. GS1 2D Barcodes (4 items)
  {
    id: 'gs1_2d',
    title: '6. GS1 2D Barcodes (ردیابی و اصالت اموال و اجناس)',
    subtypes: [
      { id: 'gs1qrcode', name: 'GS1 QR Code (معیار جهانی GS1 در بستر QR)', bcid: 'gs1qrcode', defaultText: '(01)09521234543213(8200)https://aryalink.com', placeholder: 'شناسه GTIN و آدرس وب (مثال: (01)09521234543213(8200)https://aryalink.com)', hint: 'پل ارتباطی مصرف‌کننده و اصالت جنس در نسل جدید بسته‌بندی‌ها' },
      { id: 'gs1datamatrix', name: 'GS1 DataMatrix (ردیابی و اصالت جنس و دوا)', bcid: 'gs1datamatrix', defaultText: '(01)09521234543213(17)261231(10)LOT123', placeholder: 'کد تجارتی، تاریخ انقضا و نمبر لات (مثال: (01)09521234543213(17)261231(10)LOT123)', hint: 'الزامی برای طرح ردیابی، رهگیری و کنترول اصالت دوا و تجهیزات صحی' },
      { id: 'gs1dlqrcode', name: 'GS1 Digital Link QR code (دیجیتال لینک QR)', bcid: 'gs1dlqrcode', defaultText: 'HTTPS://ID.GS1.ORG/01/09521234543213/22/ABC%2D123?99=XYZ-987', placeholder: 'آدرس اینترنتی رسمی GS1 Digital Link (مثال: HTTPS://ID.GS1.ORG/01/...)', hint: 'اتصال هوشمند خریدار به وب‌سایت، رهنمود و معلومات اصالت جنس' },
      { id: 'gs1dldatamatrix', name: 'GS1 Digital Link Data Matrix (دیجیتال لینک صنعتی)', bcid: 'gs1dldatamatrix', defaultText: 'https://id.gs1.org/01/09521234543213/22/ABC%2D123?99=XYZ-987', placeholder: 'آدرس معیاری Digital Link در دیتاماتریکس (مثال: https://id.gs1.org/...)', hint: 'دیجیتال لینک بر پایه دیتاماتریکس برای خطوط تولید صنعتی' },
    ],
  },

  // 7. Banking and Payments (9 items)
  {
    id: 'banking',
    title: '7. Banking and Payments (بانکی و پرداخت)',
    subtypes: [
      { id: 'epcqr', name: 'EPC QR Code V2 (پرداخت فوری یورو SEPA)', bcid: 'qrcode', defaultText: 'BCD\n002\n1\nSCT\nCH2400000000000000000\nAryaLink GmbH\nEUR120.00\n\n\nInvoice 2026', placeholder: 'معلومات حساب شتابی یورو (مثال: BCD 002 SCT)', hint: 'انتقال پول و پرداخت آنی بانکی در اتحادیه اروپا' },
      { id: 'swissqr_noref_23', name: 'Swiss QR (No Reference 2.3)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFNON^CR^LF^CR^LFEPD', placeholder: 'فیش بدون مرجع سوئیس (مثال: SPC 0200 CHF)', hint: 'فیش بانکی و صورتحساب رسمی سوئیس بدون کد ارجاع' },
      { id: 'swissqr_credref_23', name: 'Swiss QR (Creditor Ref 2.3)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFSCOR^CR^LFRF18539007547034^CR^LFEPD', placeholder: 'فیش با مرجع بستانکار (مثال: SCOR RF1853)', hint: 'فیش بانکی سوئیس با شناسه مرجع معیاری ISO 11649' },
      { id: 'swissqr_qrref_23', name: 'Swiss QR (QR Ref 2.3)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFQRR^CR^LF210000000003139471430009017^CR^LFEPD', placeholder: 'فیش با شناسه ارجاع (مثال: QRR 2100000)', hint: 'شناسه 27 رقمی اختصاصی پرداخت صورتحساب در سیستم بانکی سوئیس' },
      { id: 'swissqr_noref_22', name: 'Swiss QR (No Reference 2.2)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFNON^CR^LF^CR^LFEPD', placeholder: 'فیش بدون مرجع نسخه 2.2 (مثال: SPC 0200)', hint: 'نسخه معیاری 2.2 صورتحساب‌های الکترونیکی سوئیس' },
      { id: 'swissqr_credref_22', name: 'Swiss QR (Creditor Ref 2.2)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFSCOR^CR^LFRF18539007547034^CR^LFEPD', placeholder: 'فیش با مرجع بستانکار نسخه 2.2 (مثال: SCOR RF18)', hint: 'صورتحساب با کد شناسایی بستانکار در نسخه 2.2' },
      { id: 'swissqr_qrref_22', name: 'Swiss QR (QR Ref 2.2)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFQRR^CR^LF210000000003139471430009017^CR^LFEPD', placeholder: 'فیش با ارجاع نسخه 2.2 (مثال: QRR 21000)', hint: 'صورتحساب QR-Bill سازگار با نسخه‌های قبلی سیستم بانکی' },
      { id: 'swissqr_v1', name: 'Swiss QR v.1.0 (معیار اولیه فاکتور سوئیس)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0100^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFNON^CR^LF^CR^LFEPD', placeholder: 'فیش نسخه اول سوئیس (مثال: SPC 0100)', hint: 'نسخه نسل اول فیش‌های بانکی هوشمند سوئیس' },
      { id: 'zatca', name: 'ZATCA QR Code (صورتحساب الکترونیکی مالیاتی)', bcid: 'qrcode', defaultText: 'AryaLink - Invoice: 2026-001 - VAT: 300000000000003 - Total: 1500.00', placeholder: 'فاکتور مالیاتی زکات (مثال: AryaLink - VAT: 300000000000003)', hint: 'معیار فاکتورهای الکترونیکی سازمان امور مالیاتی خاورمیانه' },
    ],
  },

  // 8. Healthcare Codes (24 items)
  {
    id: 'healthcare',
    title: '8. Healthcare Codes (تجهیزات صحی و دوا)',
    subtypes: [
      { id: 'code32', name: 'Code32 (کد دوایی ملی ایتالیا)', bcid: 'code32', defaultText: '01234567', placeholder: '8 یا 9 رقم دوایی (مثال: 01234567)', hint: 'Italian Pharmacode (Radix-32) دواخانه‌های ایتالیا' },
      { id: 'flattermarken_health', name: 'Flattermarken (نشانه‌گذاری و برش قوطی دوا)', bcid: 'flattermarken', defaultText: '12345', placeholder: 'ارقام علامت‌گذاری (مثال: 12345)', hint: 'علامت‌های کنترول خط تولید و بسته‌بندی دوا' },
      { id: 'hibc_lic_128', name: 'HIBC LIC 128 (سازنده اولیه در کد 128)', bcid: 'hibccode128', defaultText: '+A999BJC5D6E71', placeholder: 'شناسه سازنده با علامت + (مثال: +A999BJC5D6E71)', hint: 'معیار بین‌المللی تجهیزات صحی Labeler Identification Code' },
      { id: 'hibc_lic_39', name: 'HIBC LIC 39 (سازنده اولیه در کد 39)', bcid: 'hibccode39', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'شناسه تجهیزات صحی در قالب خطی کد 39' },
      { id: 'hibc_lic_aztec', name: 'HIBC LIC Aztec (سازنده در Aztec)', bcid: 'hibcazteccode', defaultText: '+A999BJC5D6E71', placeholder: 'کد HIBC در Aztec (مثال: +A999BJC5D6E71)', hint: 'کدگذاری تجهیزات صحی در بارکد دوبعدی آزتک' },
      { id: 'hibc_lic_codablockf', name: 'HIBC LIC Codablock-F (سازنده در Codablock-F)', bcid: 'hibccodablockf', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'کدگذاری پشته‌ای تجهیزات صحی و لابراتواری' },
      { id: 'hibc_lic_datamatrix', name: 'HIBC LIC Data Matrix (سازنده در دیتاماتریکس)', bcid: 'hibcdatamatrix', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'کد دو بعدی دائمی حک‌شده روی سامان‌آلات جراحی و فلزی' },
      { id: 'hibc_lic_micropdf', name: 'HIBC LIC Micro PDF 417 (سازنده در MicroPDF417)', bcid: 'hibcmicropdf417', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'مخصوص پرزه‌جات صحی و پیچکاری‌های با ابعاد بسیار باریک' },
      { id: 'hibc_lic_pdf417', name: 'HIBC LIC PDF417 (سازنده در PDF417)', bcid: 'hibcpdf417', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'کد چندخطی لیبل کارتن‌های تجهیزات شفاخانه‌ای' },
      { id: 'hibc_lic_qrcode', name: 'HIBC LIC QR-Code (سازنده در QR Code)', bcid: 'hibcqrcode', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'شناسایی و ردیابی تجهیزات صحی با کمره موبایل' },
      { id: 'hibc_pas_128', name: 'HIBC PAS 128 (شناسه ثانوی در کد 128)', bcid: 'hibccode128', defaultText: '+$$7123456789012', placeholder: 'شناسه ثانوی با علامت +$$ (مثال: +$$7123456789012)', hint: 'HIBC Provider Applications Standard برای تاریخ و سری ساخت' },
      { id: 'hibc_pas_39', name: 'HIBC PAS 39 (شناسه ثانوی در کد 39)', bcid: 'hibccode39', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'ثبت لات نمبر و تاریخ انقضا در قالب خطی کد 39' },
      { id: 'hibc_pas_aztec', name: 'HIBC PAS Aztec (شناسه ثانوی در Aztec)', bcid: 'hibcazteccode', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'شناسه ثانوی دوایی در بارکد آزتک' },
      { id: 'hibc_pas_codablockf', name: 'HIBC PAS Codablock-F (شناسه ثانوی در Codablock-F)', bcid: 'hibccodablockf', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'کدگذاری ترکیبی معلومات انقضا و لات نمبر' },
      { id: 'hibc_pas_datamatrix', name: 'HIBC PAS Data Matrix (شناسه ثانوی در دیتاماتریکس)', bcid: 'hibcdatamatrix', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'شناسه تکمیلی ماندگار روی سامان‌آلات صحی' },
      { id: 'hibc_pas_micropdf', name: 'HIBC PAS Micro PDF417 (شناسه ثانوی در MicroPDF417)', bcid: 'hibcmicropdf417', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'معلومات تاریخ انقضا و سریال در ابعاد مینیاتوری' },
      { id: 'hibc_pas_pdf417', name: 'HIBC PAS PDF417 (شناسه ثانوی در PDF417)', bcid: 'hibcpdf417', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'لیبل معلومات تکمیلی بسته‌بندی تجهیزات کلینیکی و شفاخانه‌ای' },
      { id: 'hibc_pas_qrcode', name: 'HIBC PAS QR-Code (شناسه ثانوی در QR Code)', bcid: 'hibcqrcode', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'اسکن سریع تاریخ و بچ نمبر صحی با موبایل' },
      { id: 'ntin_health', name: 'NTIN (کد شناسه ملی جنس تجارتی)', bcid: 'gs1datamatrix', defaultText: '(01)09521234543213(21)12345', placeholder: 'شناسه GTIN به همراه سریال (مثال: (01)09521234543213(21)12345)', hint: 'National Trade Item Number در بخش صحت و دوا' },
      { id: 'pharmacode_one_health', name: 'Pharmacode One-Track (کنترول تک‌خط دوا)', bcid: 'pharmacode', defaultText: '117480', placeholder: 'نمبر دوایی بین 3 تا 131070 (مثال: 117480)', hint: 'کنترول بسته‌بندی قوطی دوا در خطوط مونتاژ دواسازی' },
      { id: 'pharmacode_two_health', name: 'Pharmacode Two-Track (کنترول دوخط دوا)', bcid: 'pharmacode2', defaultText: '117480', placeholder: 'نمبر دوایی دوخطی (مثال: 117480)', hint: 'کنترول دوطرفه خط چاپ در فابریکه‌های دوا' },
      { id: 'ppn_health', name: 'PPN (شناسه ملی دواخانه‌های اروپا)', bcid: 'code128', defaultText: '(9N)1234567890(1T)LOT123', placeholder: 'کد PPN به همراه شناسه بچ (مثال: (9N)1234567890(1T)LOT123)', hint: 'سیستم تصدیق اصالت دواها در دواخانه‌های سراسر اتحادیه اروپا' },
      { id: 'pzn7', name: 'PZN7 (شناسه 6 یا 7 رقمی دواخانه‌های آلمان)', bcid: 'pzn', defaultText: '123456', placeholder: '6 یا 7 رقم دوایی (مثال: 123456)', hint: 'Pharmazentralnummer کد ملی محصولات دوایی در آلمان' },
      { id: 'pzn8', name: 'PZN8 (شناسه 8 رقمی سراسری دواخانه‌های آلمان)', bcid: 'pzn', defaultText: '12345678', placeholder: '8 رقم دوایی (مثال: 12345678)', hint: 'نسخه ارتقایافته PZN با 8 رقم برای تمامی اقلام صحی و دوایی آلمان' },
    ],
  },

  // 9. Mobile Tagging (3 items)
  {
    id: 'mobile_tagging',
    title: '9. Mobile Tagging (اسکن موبایل)',
    subtypes: [
      { id: 'qr_mobile_tag', name: 'QR Code (کد پاسخ سریع کمره موبایل)', bcid: 'qrcode', defaultText: 'https://aryalink.com', placeholder: 'لینک اینترنتی یا متن (مثال: https://aryalink.com)', hint: 'اسکن سریع و فوری با تمام کمره‌های موبایل‌های هوشمند' },
      { id: 'dm_mobile_tag', name: 'Data Matrix (تگ دوبعدی کم‌حجم موبایل)', bcid: 'datamatrix', defaultText: 'https://aryalink.com/app', placeholder: 'آدرس کوتاه یا کد اختصاصی (مثال: https://aryalink.com/app)', hint: 'چگالی بالا با ابعاد مینیاتوری مناسب کدهای اسکن اپلیکیشن' },
      { id: 'aztec_mobile_tag', name: 'Aztec (کد بدون حاشیه امن مخصوص صفحه نمایش)', bcid: 'azteccode', defaultText: 'MOBILE-TAG-2026', placeholder: 'شناسه یا کوپن تخفیف (مثال: MOBILE-TAG-2026)', hint: 'عملکرد ایده‌آل برای نمایش روی اسکرین موبایل‌ها' },
    ],
  },

  // 10. ISBN Codes (5 items)
  {
    id: 'isbn_codes',
    title: '10. ISBN Codes (شابک، نشر و کتاب)',
    subtypes: [
      { id: 'isbn13', name: 'ISBN 13 (شابک بین‌المللی کتاب)', bcid: 'isbn', defaultText: '978-1-56581-231-4', placeholder: 'شابک 13 رقمی با خط تیره (مثال: 978-1-56581-231-4)', hint: 'معیار بین‌المللی ناشران برای ثبت کتاب' },
      { id: 'isbn13_5', name: 'ISBN 13 + 5 Digits (شابک با بارکد قیمت 5 رقمی)', bcid: 'isbn', defaultText: '978-1-56581-231-4 90000', placeholder: 'شابک با کد قیمت 5 رقمی (مثال: 978-1-56581-231-4 90000)', hint: 'بارکد کتاب به همراه قیمت چاپی پشت جلد در کتاب‌فروشی‌ها' },
      { id: 'ismn_code', name: 'ISMN (شماره استاندارد قطعات و نت‌های موسیقی)', bcid: 'ismn', defaultText: '979-0-2605-3211-3', placeholder: 'شناسه با پیشوند 979-0 (مثال: 979-0-2605-3211-3)', hint: 'معیار بین‌المللی ناشران موسیقی و پارتیتورها' },
      { id: 'issn_code', name: 'ISSN (شاپا نشریات و مجلات ادواری)', bcid: 'issn', defaultText: '0311-175X', placeholder: '8 کاراکتر با خط تیره (مثال: 0311-175X)', hint: 'شناسه اختصاصی روزنامه‌ها، مجلات و نشریات پوهنتونی' },
      { id: 'issn_2', name: 'ISSN + 2 Digits (شاپا همراه با کد شماره چاپ 2 رقمی)', bcid: 'issn', defaultText: '0311-175X 00', placeholder: 'شاپا به همراه شماره دوره 2 رقمی (مثال: 0311-175X 00)', hint: 'درج شماره چاپ یا فصلنامه در کنار بارکد نشریه' },
    ],
  },

  // 11. Business Cards (4 items)
  {
    id: 'business_cards',
    title: '11. Business Cards (کارت ویزیت / هویت الکترونیک)',
    subtypes: [
      { id: 'vcard_qr', name: 'QR Code vCard (کارت مخاطب استاندارد 3.0)', bcid: 'qrcode', defaultText: 'VCARD', placeholder: 'کارت ویزیت الکترونیک (مثال: BEGIN:VCARD)', hint: 'ذخیره فوری نمبر تماس، ایمیل و شرکت در دفترچه تیلیفون موبایل' },
      { id: 'vcard_dm', name: 'Data Matrix vCard (کارت ویزیت صنعتی)', bcid: 'datamatrix', defaultText: 'VCARD', placeholder: 'کارت ویزیت دیتاماتریکس (مثال: BEGIN:VCARD)', hint: 'فرمت دیتاماتریکس برای کارت‌های ویزیت فلزی یا پرسونلی' },
      { id: 'mecard_qr', name: 'QR Code MeCard (کارت ویزیت سبک MeCard)', bcid: 'qrcode', defaultText: 'MECARD', placeholder: 'کارت فشرده MeCard (مثال: MECARD:N:AryaLink)', hint: 'فرمت فشرده و کم‌حجم برای اسکن سریع‌تر در موبایل‌های هوشمند' },
      { id: 'mecard_dm', name: 'Data Matrix MeCard (کارت ویزیت دیتاماتریکس MeCard)', bcid: 'datamatrix', defaultText: 'MECARD', placeholder: 'کارت سبک دیتاماتریکس (مثال: MECARD:N:AryaLink)', hint: 'نسخه مینیاتوری کارت ویزیت در فرمت صنعتی دیتاماتریکس' },
    ],
  },

  // 12. Event Barcodes (2 items)
  {
    id: 'event_barcodes',
    title: '12. Event Barcodes (رویداد و تقویم iCal)',
    subtypes: [
      { id: 'event_qr', name: 'QR Code (افزودن مستقیم به تقویم موبایل)', bcid: 'qrcode', defaultText: 'EVENT', placeholder: 'رویداد تقویم (مثال: BEGIN:VCALENDAR)', hint: 'ثبت خودکار جلسه، همایش یا سمینار در تقویم Google و Apple' },
      { id: 'event_dm', name: 'Data Matrix (رویداد در Data Matrix)', bcid: 'datamatrix', defaultText: 'EVENT', placeholder: 'رویداد تقویم دیتاماتریکس (مثال: BEGIN:VCALENDAR)', hint: 'فرمت صنعتی برای تکت‌های فیزیکی رویدادها و کنفرانس‌ها' },
    ],
  },

  // 13. Wi-Fi Barcodes (2 items)
  {
    id: 'wifi_barcodes',
    title: '13. Wi-Fi Barcodes (اتصال خودکار وای‌فای)',
    subtypes: [
      { id: 'wifi_qr', name: 'QR Code (اتصال خودکار کمره موبایل به وای‌فای)', bcid: 'qrcode', defaultText: 'WIFI', placeholder: 'مشخصات شبکه وای‌فای (مثال: WIFI:S:AryaLink;T:WPA;P:Secret2026;;)', hint: 'کاربر تنها با گرفتن کمره روی بارکد، بدون تایپ پسورد وصل می‌شود' },
      { id: 'wifi_dm', name: 'Data Matrix (اتصال وای‌فای در Data Matrix)', bcid: 'datamatrix', defaultText: 'WIFI', placeholder: 'وای‌فای دیتاماتریکس (مثال: WIFI:S:AryaLink;T:WPA;P:Secret2026;;)', hint: 'اتصال خودکار به شبکه از طریق فرمت صنعتی دیتاماتریکس' },
    ],
  },
];

export const BARCODE_SMART_GUIDES: Record<string, string> = {
  // 1. Linear Codes (12 items)
  code128: "یکی از قدرتمندترین بارکدهای خطی با تراکم بالا که از تمام حروف انگلیسی، اعداد و کلیه علائم اسکی پشتیبانی می‌کند. مناسب برای نمبر سریال، گدام‌داری و کاتالوگ محصولات.",
  code11: "بارکد خطی متراکم که فقط از ارقام 0 تا 9 و خط تیره (-) پشتیبانی می‌کند. کاربرد اصلی آن در برچسب‌گذاری کابل‌ها و تجهیزات مخابراتی است.",
  interleaved2of5: "بارکد عددی فشرده ویژه بسته‌بندی و توزیع صنعتی. طول داده حتماً باید تعداد جفت ارقام (مانند 6، 8، 10 یا 14 رقم) باشد؛ در صورت تاق بودن، یک صفر در ابتدا قرار دهید.",
  code39: "بارکد خطی کلاسیک صنعتی و نظامی با پشتیبانی از حروف بزرگ انگلیسی (A-Z)، اعداد (0-9) و نمادهای خاص (- . $ / + % و فاصله).",
  code39ext: "نسخه کامل کد 39 با پشتیبانی از تمام 128 کاراکتر اسکی شامل حروف کوچک و علائم نگارشی برای کاربردهای اداری و نرم‌افزاری.",
  code93: "بارکد خطی با امنیت و فشردگی بالاتر نسبت به کد 39 که با دو رقم کنترلی پیشرفته از تمام کاراکترهای اسکی پشتیبانی می‌کند.",
  flattermarken: "بارکد تخصصی کنترول ترتیب صحافی و مطبعه‌ها؛ فقط شامل ارقام برای اطمینان از قرارگیری صحیح فورم‌های چاپی در کنار یکدیگر.",
  'gs1-128': "معیار جهانی لجستیک زنجیره تأمین با استفاده از شناسه‌های کاربردی Application Identifiers داخل قوسین؛ مانند (01) برای نمبر قلم تجارتی جنس و (10) برای شناسه بچ تولید.",
  msi: "بارکد خطی اصلاح‌شده Plessey ویژه گدام‌داری و برچسب نرخ رف‌های فروشگاه که منحصراً از ارقام 0 تا 9 پشتیبانی می‌کند.",
  pharmacode_one: "فارماکد تک‌مسیره معیاری کنترول بسته‌بندی دوا در خط تولید؛ فقط یک عدد صحیح بین 3 تا 131070 می‌پذیرد و بر اساس ضخامت خطوط خوانده می‌شود.",
  pharmacode_two: "فارماکد دوخطه با ضریب امنیت مضاعف برای قوطی‌های دوایی بسیار کوچک؛ یک عدد بین 4 تا 64570080 را کدگذاری می‌کند.",
  telepen: "بارکد خطی با ضریب خطای فوق‌العاده ناچیز در انگلستان که تمام کاراکترهای اسکی را بدون نیاز به کدهای شیفت خاص رمزنگاری می‌کند.",

  // 2. Postal Codes (15 items)
  auspost: "بارکد پستی 4 حالته استرالیا (Australian Post 4-State) شامل 8 رقم کد پستی به همراه معلومات تکمیلی آدرس برای تفکیک خودکار بسته‌ها.",
  daft: "کدگذاری 4 حالته عمومی پستی متشکل از حروف D (پایین)، A (بالا)، F (کامل) و T (ردیاب) که شالوده اکثر معیارهای مرسولات پستی جهان است.",
  dpd: "بارکد 14 رقمی اختصاصی رهگیری بسته‌های شرکت بین‌المللی DPD اروپا برای ترانزیت بین‌المللی و گمرک اموال.",
  japanpost: "بارکد پستی کشور ژاپن شامل کد پستی 7 رقمی و آدرس خلاصه برای اسکن با سرعت فوق‌العاده بالا در مراکز پستی ژاپن.",
  kix: "معیار شاخص مشتری (Klantindex) اداره پست هلند و شرکت TNT؛ شامل کد پستی و نمبر تعمیر برای هدایت خودکار پاکت‌ها.",
  koreapost: "معیار رسمی شرکت پست کره جنوبی با کد پستی 6 رقمی و نمبر پیگیری جهت توزیع مکانیزه مرسولات.",
  planet: "بارکد خطی 11 یا 13 رقمی سازمان پست آمریکا (USPS Planet) جهت تأیید اصالت و رهگیری آنلاین مرسولات تجارتی.",
  royalmail: "بارکد 4 حالته RM4SCC پست سلطنتی بریتانیا برای هدایت مکانیزه نامه‌ها بر اساس کد پستی و نمبر پلاک انگلستان.",
  mailmark: "بارکد پستی هوشمند نسل نوین بریتانیا (Royal Mail Mailmark 4-State) با فارمت معیاری شامل شناسه مشتری و نوع مرسوله.",
  mailmark2d_postal: "نگارش دوبعدی دیتاماتریکس معیاری میل‌مارک بریتانیا با چگالی بالا برای سازمان‌های دولتی و اسناد رسمی.",
  postnet5: "بارکد پستی کلاسیک 5 رقمی زیپ‌کد آمریکا (USPS PostNet) برای مسیریابی محموله‌ها به حوزه پستی مقصد.",
  postnet9: "بارکد پستی 9 رقمی آمریکا (ZIP+4) برای هدایت مرسوله تا سطح بلوک ساختمانی مشخص.",
  postnet11: "بارکد پستی 11 رقمی تحویل نهایی آمریکا (Delivery Point Barcode) که نقطه دقیق تحویل تا نمبر واحد را مشخص می‌کند.",
  onecode: "بارکد هوشمند یکپارچه آمریکا (USPS Intelligent Mail Barcode) با طول دقیق 31 رقم؛ ترکیب‌کننده تمام خدمات رهگیری، تأیید و توزیع مرسوله.",
  upus10: "معیار بین‌المللی 13 کاراکتری اتحادیه جهانی پست (UPU S10) برای رهگیری بسته‌های سفارشی و امانات بین کشورها.",

  // 3. EAN / UPC (9 items)
  ean8: "نسخه فشرده بارکد جنس برای محصولات کوچک (مانند ساجق و لوازم آرایشی). فقط مجاز به وارد کردن 7 یا 8 رقم هستید و رقم آخر Check Digit است.",
  ean13: "این معیار جهانی برای محصولات سوپرمارکتی است. شما فقط مجاز به وارد کردن دقیقاً 12 یا 13 کاراکتر عددی هستید (بدون حروف). عدد آخر به عنوان Check Digit محاسبه می‌شود.",
  ean14: "بارکد 14 رقمی معیاری برای کارتن‌های مادر و پالت‌های گدام‌داری (GTIN-14 با شناسه کاربردی 01) جهت ثبت ورود و خروج عمده اموال.",
  ean8composite: "بارکد ترکیبی دو مؤلفه‌ای شامل EAN-8 خطی به همراه یک ماتریس دوبعدی MicroPDF417 در بالا برای ذخیره تاریخ انقضا و نمبر فرمایش.",
  ean13composite: "بارکد ترکیبی تجارتی پیشرفته شامل EAN-13 در پایه و مؤلفه دوبعدی در بالا جهت اتصال نمبر سریال و بچ تولید به بارکد فروشگاهی.",
  upca: "بارکد معیاری پرچون‌فروشی آمریکای شمالی (ایالات متحده و کانادا). طول مجاز دقیقاً 11 یا 12 رقم است و سیستم رقم دوازدهم را به عنوان Check Digit اعتبارسنجی می‌کند.",
  upce: "نسخه فشرده 8 رقمی بارکد آمریکایی UPC-A با حذف صفرهای زائد برای اجناس کوچک در بازار آمریکا و کانادا.",
  upcacomposite: "ساختار ترکیبی UPC-A با نماد دوبعدی فوقانی برای درج مشخصات تخنیکی تکمیلی یا سریال ساخت در پرچون‌فروشی‌های آمریکای شمالی.",
  upcecomposite: "ساختار فشرده ترکیبی UPC-E همراه با نماد دوبعدی برای بسته‌بندی‌های بسیار کوچک بازار آمریکا.",

  // 4. 2D Codes (14 items)
  qrcode: "پرکاربردترین بارکد دوبعدی دنیا با قابلیت اسکن سریع با تمام کمره‌های موبایل. مناسب برای لینک وب‌سایت، شبکه‌های اجتماعی، متن و کارت ویزیت.",
  qrcode_mobile_2d: "بارکد کیوآر بهینه‌شده برای اسکن روی صفحه‌نمایش موبایل‌های هوشمند با تصحیح خطای متناسب.",
  datamatrix: "بارکد دوبعدی مربعی با ظرفیت دیتای بسیار بالا و اندازه میکروسکوپی. ایده‌آل برای پرزه‌های صنعتی، بردهای الکترونیکی و تجهیزات صحی و دوا.",
  azteccode: "بارکد دوبعدی با چشم مرکزی مربعی شبیه اهرام آزتک. نیازی به حاشیه خالی (Quiet Zone) ندارد و معیار تکت‌های طیاره و خط آهن جهان است.",
  codablockf: "بارکد دوبعدی پشته‌ای چندردیفه بر پایه Code-128 برای مواردی که بارکدخوان‌های خطی قدیمی لیزری باید حجم بالایی از متن را اسکن کنند.",
  maxicode: "بارکد دوبعدی شش‌ضلعی با چشم دایره‌ای مرکزی بول‌سای؛ معیار شرکت بین‌المللی انتقال سریع UPS برای تفکیک فوق‌سریع بسته‌ها روی تسمه‌نقاله.",
  micropdf417: "نسخه بسیار فشرده PDF417 برای فضاهای محدود صنعتی و بسته‌بندی دوا با امکان ذخیره معلومات ساخت‌یافته.",
  pdf417: "بارکد دوبعدی خطی با گنجایش دیتای عظیم تا بیش از 1000 کاراکتر؛ معیار رسمی تذکره الکترونیکی، لایسنس رانندگی و تکت پرواز خطوط هوایی.",
  microqrcode: "نسخه بسیار کوچک کیوآر کد با تنها یک نشانگر موقعیت در گوشه برای پرزه‌های مینیاتوری که کیوآر کد معمولی در آن‌ها جا نمی‌شود.",
  hanxin: "معیار ملی بارکد دوبعدی کشور چین (Han Xin Code) بهینه‌شده برای ذخیره فونت‌ها و کلمات چینی و دیتاهای متراکم صنعتی.",
  dotcode: "بارکد ماتریسی متشکل از نقاط ناپیوسته، طراحی‌شده برای چاپ پرسرعت با پرنترهای جوهرافشان صنعتی روی خطوط تولید سگرت و نوشیدنی.",
  mailmark2d: "کد دیتاماتریکس پستی پیشرفته معیاری میل‌مارک بریتانیا با چگالی بالا برای سازمان‌های دولتی و فاکتورها.",
  ntin_code: "کد ملی ردیابی و شناسه تجارت دوایی NTIN در فارمت معیاری دوبعدی دیتاماتریکس با نمبر ملی و سریال محصول.",
  ppn_code: "کد عددی دواخانه‌ای معیاری اتحادیه اروپا در قالب دیتاماتریکس برای پیشگیری از جعل دوا و تأیید اصالت در مبادی مصرف.",

  // 5. GS1 DataBar (13 items)
  databaromni: "بارکد فشرده فروشگاهی معیاری GS1 DataBar برای برچسب‌گذاری میوه‌ها، گوشت و اقلام کیلویی فاقد بسته‌بندی با شناسه 14 رقمی GTIN.",
  databarstacked: "نسخه دوردیفه پشته‌ای GS1 DataBar با عرض باریک برای نصب روی برچسب‌های کوچک میوه و اقلام دوایی.",
  databarstackedomni: "نسخه تمام‌جهته دوردیفه GS1 DataBar برای اسکن آسان روی بارکدخوان‌های ثابت میز سوپرمارکت از هر زاویه.",
  databarlimited: "معیار بارکد محدود برای اقلام صحی و سامان‌آلات کوچک با شناسه رقمی که فقط با ارقام 0 یا 1 آغاز می‌شود.",
  databarexpanded: "نسخه گسترش‌یافته GS1 DataBar برای درج هم‌زمان وزن، نرخ، تاریخ انقضا و نمبر سریال علاوه بر شناسه جنس.",
  databarexpandedstacked: "نسخه پشته‌ای چندطبقه Expanded برای کالاهای دارای تاریخ انقضا و وزن با حفظ ابعاد فشرده برچسب.",
  'gs1-128composite': "بارکد خطی GS1-128 با نماد دوبعدی بالای آن جهت ردیابی کامل پالت‌ها و لجستیک چندمرحله‌ای.",
  databaromnicomposite: "ترکیب هم‌زمان GS1 DataBar تمام‌جهته با نماد دوبعدی برای ردیابی جامع مشخصات اقلام متغیر.",
  databarstackedcomposite: "نسخه ترکیبی دوردیفه با مؤلفه دوبعدی الحاقی برای فرآورده‌های با تاریخ مصرف محدود.",
  databarstackedomnicomposite: "بارکد ترکیبی سوپرمارکتی تمام‌جهته با قابلیت اسکن دیتاهای تاریخ تولید و نرخ.",
  databarlimitedcomposite: "نماد ترکیبی نسخه محدود ویژه بسته‌های درمانی و شفاخانه‌ای کوچک.",
  databarexpandedcomposite: "نسخه ترکیبی گسترده تک‌خطی برای ثبت زنجیره تأمین پیچیده مواد پروتئینی و لبنی.",
  databarexpandedstackedcomposite: "نسخه ترکیبی پشته‌ای چندردیفه با حداکثر گنجایش معلوماتی برای ره‌گیری محموله‌های صادراتی.",

  // 6. GS1 2D Barcodes (4 items)
  gs1qrcode: "کیوآر کد سازمانی مطابق معیار بین‌المللی GS1 با شناسه‌های کاربردی Application Identifiers (مانند نمبر جنس، انقضا و لات).",
  gs1datamatrix: "دیتاماتریکس سازمانی معیار اجباری جهانی در صنایع دوایی و صحی برای سریال‌سازی تک‌تک قوطی‌های دوا.",
  gs1dlqrcode: "نسل نوین کیوآر کد دیجیتال لینک GS1 Digital Link که با یک اسکن هم کاربر را به صفحه وب محصول هدایت می‌کند و هم در صندوق فروشگاه خوانده می‌شود.",
  gs1dldatamatrix: "دیتاماتریکس دیجیتال لینک برای اتصال مستقیم پرزه‌های صنعتی به پایگاه داده دیجیتال جنس از طریق وب‌سایت سازنده.",

  // 7. Banking and Payments (9 items)
  epcqr: "معیار رسمی پرداخت و انتقال پول آنی یورو (SEPA Credit Transfer) در اتحادیه اروپا بر پایه QR Code با مشخصات IBAN و مبلغ.",
  swissqr_noref_23: "نسخه 2.3 صورتحساب بانکی رسمی سوئیس (Swiss QR-Bill) بدون شناسه مرجع برای پرداخت‌های عادی بانکی با ارز CHF یا EUR.",
  swissqr_credref_23: "نسخه 2.3 صورتحساب سوئیس با شناسه معیاری بین‌المللی مرجع بستانکار (SCOR ISO 11649) جهت تسویه اتوماتیک فاکتور.",
  swissqr_qrref_23: "نسخه 2.3 فیش بانکی سوئیس دارای شناسه اختصاصی 27 رقمی QR-Reference برای وصول دقیق پول در سیستم بانکی سوئیس.",
  swissqr_noref_22: "نسخه معیاری 2.2 فیش الکترونیکی بانکی سوئیس بدون کد ارجاع سازگار با نرم‌افزارهای محاسبه و حسابداری قدیمی‌تر.",
  swissqr_credref_22: "صورتحساب معیاری 2.2 سوئیس با مرجع طلبکار جهت مطابقت دقیق فاکتورهای شرکتی.",
  swissqr_qrref_22: "نسخه 2.2 صورتحساب سوئیس دارای شناسه ارجاع 27 رقمی بانکی برای کنترول خودکار وصولی‌ها.",
  swissqr_v1: "نسخه نسل اول 1.0 معیاری فیش‌های بانکی هوشمند سوئیس برای ثبت پرداخت‌ها.",
  zatca: "معیار صورتحساب الکترونیکی سازمان امور مالیاتی عربستان (ZATCA Fatoora) در قالب TLV بر پایه QR Code برای فاکتورهای رسمی.",

  // 8. Healthcare Codes (24 items)
  code32: "بارکد دوایی ملی کشور ایتالیا (Radix 32 / Codice Farmaceutico) برای کدگذاری 9 رقمی دواهای تحت پوشش نظام سلامت.",
  flattermarken_health: "علائم کنترولی ترتیب بسته‌بندی در خطوط تولید اقلام صحی و قوطی‌های دوا.",
  hibc_lic_128: "معیار انجمن بارکد صنعت سلامت (HIBC) در فارمت Code-128 با شناسه اختصاصی برچسب جنس (LIC) با علامت مثبت (+) در ابتدا.",
  hibc_lic_39: "معیار HIBC LIC در قالب کد 39 برای تجهیزات صحی شفاخانه‌ای و سامان‌آلات اطاق عملیات.",
  hibc_lic_aztec: "بارکد آزتک مطابق فارمت صحی HIBC LIC برای ایمپلنت‌ها و سامان‌آلات جراحی طب دندان.",
  hibc_lic_codablockf: "کد پشته‌ای صحی چندردیفه برای کیت‌های لابراتواری با دستگاه‌های اسکنر خطی.",
  hibc_lic_datamatrix: "رایج‌ترین معیار بین‌المللی تجهیزات صحی روی بدنه فلزی سامان‌آلات جراحی و لنزها (HIBC LIC Data Matrix).",
  hibc_lic_micropdf: "معیار مینیاتوری صحی برای برچسب‌گذاری پیچکاری‌ها و ویال‌های باریک تزریقی.",
  hibc_lic_pdf417: "فارمت دوبعدی با ظرفیت بالا برای درج تاریخچه کامل استریلیزاسیون و معیار تجهیزات اطاق عملیات.",
  hibc_lic_qrcode: "کیوآر کد تخصصی سلامت با فارمت HIBC LIC برای تجهیزات مصرفی صحی و دستگاه‌های شفاخانه‌ای.",
  hibc_pas_128: "فارمت معلومات تکمیلی سازنده (HIBC PAS) شامل نمبر لات، تاریخ انقضا و سریال در قالب خطی Code-128.",
  hibc_pas_39: "کد 39 با ساختار HIBC PAS برای ثبت سوابق تولید و بچ نمبر سامان‌آلات صحی.",
  hibc_pas_aztec: "کد آزتک جهت ثبت معلومات ثانوی و نمبر سریال اجناس صحی.",
  hibc_pas_codablockf: "بارکد پشته‌ای PAS برای بسته‌بندی‌های ثانوی لابراتواری.",
  hibc_pas_datamatrix: "معیار دیتاماتریکس PAS جهت حک مستقیم لیزری معلومات انقضا و سریال روی تجهیزات فلزی صحی.",
  hibc_pas_micropdf: "فارمت مینیاتوری PAS برای ظروف لابراتواری تشخیص طبی.",
  hibc_pas_pdf417: "معیار با ظرفیت بالا برای مشخصات تخنیکی ایمپلنت‌های ارتوپدی.",
  hibc_pas_qrcode: "کیوآر کد سلامت با ساختار PAS برای معلومات انقضا و رهگیری دستگاه‌های تنفسی و مانیتورینگ.",
  ntin_health: "نمبر ملی شناسه صحی اقلام سلامت (NTIN) برای ثبت و کنترول سراسری دوا.",
  pharmacode_one_health: "فارماکد تک‌مسیره ویژه بسته‌بندی دوا در فابریکه‌های دواسازی داخلی و بین‌المللی.",
  pharmacode_two_health: "فارماکد دوخطه با ایمنی مضاعف برای ممانعت از بسته‌بندی اشتباه دواها.",
  ppn_health: "ساختار Pharmacy Product Number اتحادیه اروپا با پیشوند (9N) جهت راستی‌آزمایی دواها در دواخانه‌ها.",
  pzn7: "شناسه ملی 7 رقمی دواخانه‌های آلمان (Pharmazentralnummer 7) شامل 6 یا 7 رقم برای خریداری و بازپرداخت بیمه در آلمان.",
  pzn8: "شناسه ارتقایافته 8 رقمی سراسری دواخانه‌های آلمان (PZN8) با ارقام 0 تا 9 برای کلیه اقلام صحی جدید.",

  // 9. Mobile Tagging (3 items)
  qr_mobile_tag: "بارکد کیوآر کد سریع و بهینه‌سازی شده برای پوسترها، کاتالوگ‌ها و بیلبوردها جهت باز شدن فوری در کمره موبایل.",
  dm_mobile_tag: "بارکد دیتاماتریکس مناسب برای برچسب‌های بسیار کوچک روی وسایل شخصی و تجهیزات با قابلیت خوانش توسط موبایل‌های هوشمند.",
  aztec_mobile_tag: "بارکد آزتک برای تکت‌های الکترونیکی همایش‌ها، کارت‌های تخفیف و نمایشگرهای دیجیتال.",

  // 10. ISBN Codes (5 items)
  isbn13: "نمبر معیاری بین‌المللی کتاب (شابک 13 رقمی) با پیشوند 978 یا 979 همراه با خط تیره؛ الزام قانونی ناشران برای نشر کتاب.",
  isbn13_5: "بارکد کتاب به همراه بارکد الحاقی 5 رقمی قیمت پشت جلد (EAN-5) جهت اسکن هم‌زمان کتاب و نرخ در کتاب‌فروشی‌ها.",
  ismn_code: "نمبر معیاری بین‌المللی نت‌های موسیقی (شامپ) با پیشوند 979-0 برای پارتیتورها و آثار مکتوب موسیقایی.",
  issn_code: "نمبر معیاری بین‌المللی نشریات ادواری (شاپا 8 کاراکتری) برای ثبت روزنامه‌ها، ماه‌نامه‌ها و ژورنال‌های علمی و پوهنتونی.",
  issn_2: "بارکد شاپا نشریات به همراه بارکد الحاقی 2 رقمی نشان‌دهنده شماره نسخه یا ماه انتشار نشریه.",

  // 11. Business Cards (4 items)
  vcard_qr: "کارت ویزیت هوشمند الکترونیکی vCard بر پایه QR Code؛ با اسکن آن توسط کمره موبایل، نام، تیلیفون، ایمیل و شرکت مستقیماً در مخاطبان تیلیفون ذخیره می‌شود.",
  vcard_dm: "کارت ویزیت الکترونیکی vCard بر پایه Data Matrix؛ مناسب برای کارت‌های پرسونلی و برچسب‌های شناسایی سازمانی.",
  mecard_qr: "فارمت فوق‌العاده فشرده کارت مخاطب (MeCard) ژاپنی بر پایه QR Code با حجم کمتر و اسکن سریع‌تر در موبایل‌های قدیمی.",
  mecard_dm: "کارت مخاطب فشرده MeCard در قالب صنعتی دیتاماتریکس برای شناسایی فردی و کارت‌های امنیتی دخول و خروج.",

  // 12. Event Barcodes (2 items)
  event_qr: "معیار بین‌المللی تقویم دیجیتال iCalendar بر پایه QR Code؛ با اسکن، رویداد با تاریخ و محل جلسه مستقیماً به تقویم گوگل یا تقویم آیفون اضافه می‌شود.",
  event_dm: "رویداد تقویم در قالب Data Matrix برای تکت‌های همایش و کارت‌های کنفرانس‌های بین‌المللی.",

  // 13. Wi-Fi Barcodes (2 items)
  wifi_qr: "اتصال خودکار کمره موبایل به وای‌فای؛ کاربر با گرفتن کمره روی بارکد، بدون نیاز به انتخاب SSID یا تایپ پسورد، مستقیماً به شبکه متصل می‌شود.",
  wifi_dm: "مشخصات اتصال به شبکه بیسیم در قالب بارکد دیتاماتریکس مناسب برای برچسب‌های تخنیکی پشت مودم و روتر.",

  // Category Fallbacks (13 items)
  linear: "کدهای میله‌ای خطی تک‌بعدی 1D که با تغییر ضخامت و فاصله خطوط موازی دیتا را ذخیره می‌کنند و با انواع بارکدخوان‌های لیزری و نوری خوانده می‌شوند.",
  postal: "معیارهای رسمی ادارات پست کشورهای مختلف برای پروسس خودکار و سریع نامه‌ها، بسته‌ها و مرسولات سفارشی بر اساس کد پستی و آدرس.",
  ean_upc: "معیارهای رسمی بین‌المللی پرچون‌فروشی و سوپرمارکتی جهان تحت نظارت سازمان GS1 برای ثبت نرخ و مشخصات اموال در صندوق‌های فروشگاهی.",
  '2d': "بارکدهای ماتریسی دوبعدی با ظرفیت ذخیره‌سازی دیتای بسیار بالاتر از کدهای خطی، شامل قابلیت تصحیح خطا در صورت مخدوش شدن بخشی از کد.",
  gs1_databar: "خانواده کدهای فشرده زنجیره تأمین GS1 برای ردیابی اقلام متغیر، محصولات زراعتی و گوشت دارای تاریخ انقضا و وزن متغیر.",
  gs1_2d: "نسل نوین معیارهای دوبعدی GS1 شامل دیتاماتریکس و کیوآر کدهای دیجیتال لینک برای اتصال محصول به وب‌سایت رسمی سازنده.",
  banking: "معیارهای رسمی نظام‌های مالی و بانکی جهت پرداخت‌های آنی الکترونیکی، فیش‌های بانکی سوئیس و فاکتورهای رسمی مالیاتی.",
  healthcare: "کدهای نظارتی سخت‌گیرانه صنایع دواسازی و تجهیزات صحی (شامل معیارهای HIBC و IFA PPN) جهت اصالت‌سنجی و پیشگیری از جعل دوا.",
  mobile_tagging: "بارکدهای بهینه‌شده برای اسکن فوق‌سریع توسط کمره تیلیفون‌های هوشمند جهت ارجاع به محتوای دیجیتال، اعلانات و کاتالوگ‌ها.",
  isbn_codes: "معیارهای رسمی بین‌المللی نشر کتاب (شابک)، نشریات ادواری (شاپا) و نت‌های موسیقی (شامپ) برای ثبت در کتابخانه‌ها و مراکز فروش.",
  business_cards: "معیارهای ذخیره معلومات فردی و کارت ویزیت الکترونیکی (vCard و MeCard) برای انتقال خودکار نمبر تماس، ایمیل و لینک به دفترچه تیلیفون.",
  event_barcodes: "معیارهای جهانی تقویم دیجیتال برای ثبت همایش‌ها، جلسات و سمینارها در تقویم موبایل و کمپیوتر با یک اسکن ساده.",
  wifi_barcodes: "معیارهای اشتراک‌گذاری مصئون اتصال اینترنت بی‌سیم جهت اتصال خودکار دستگاه‌های هوشمند به شبکه Wi-Fi بدون نیاز به تایپ پسورد."
};

// Ensure every subtype across all 116 items has explicit name, features, and guide fields populated
// and strip any legacy "راهنما: " or "راهنما:" prefix from guides
Object.keys(BARCODE_SMART_GUIDES).forEach((k) => {
  BARCODE_SMART_GUIDES[k] = BARCODE_SMART_GUIDES[k].replace(/^راهنما:\s*/, '');
});

BARCODE_CATEGORIES.forEach((cat) => {
  cat.subtypes.forEach((sub) => {
    if (!sub.features) {
      sub.features = sub.hint;
    }
    const rawGuide =
      BARCODE_SMART_GUIDES[sub.id] ||
      BARCODE_SMART_GUIDES[cat.id] ||
      sub.hint;
    sub.guide = rawGuide.replace(/^راهنما:\s*/, '');
  });
});

function MegaBarcodeGeneratorContent() {
  const { dir, language, t } = useLanguage();
  const isRtl = dir === 'rtl';
  const { loadProfile, isLoading: isProfileLoading } = useProfileLoader();

  // Top-Level Tab State (Generator vs Scanner)
  const [activeToolTab, setActiveToolTab] = useState<'generator' | 'scanner'>('generator');

  // Handle URL query parameter ?tab=scanner
  const searchParams = useSearchParams();
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'scanner' || tabParam === 'scan') {
      setActiveToolTab('scanner');
    } else if (tabParam === 'generator') {
      setActiveToolTab('generator');
    }
  }, [searchParams]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInName, setSearchInName] = useState<boolean>(true);
  const [searchInFeatures, setSearchInFeatures] = useState<boolean>(true);
  const [searchInGuide, setSearchInGuide] = useState<boolean>(true);

  // Cascade State
  const [selectedCategory, setSelectedCategory] = useState<string>('linear');
  const [selectedSubtypeId, setSelectedSubtypeId] = useState<string>('code128');

  // Barcode Generic Text (for categories 1 to 10) - Non-empty initial value guarantees instant first render
  const [textValue, setTextValue] = useState<string>('ARYALINK-128');

  // Barcode Styling: Defaults guaranteed high contrast (Pure White bg, Pure Black bar)
  const [lineColor, setLineColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [scale, setScale] = useState<number>(3);
  const [includeText, setIncludeText] = useState<boolean>(true);

  // Group 7: Banking and Payments Form State (Stage 1)
  // 1. EPC QR Code V2 (SEPA)
  const [epcName, setEpcName] = useState('AryaLink Technologies');
  const [epcIban, setEpcIban] = useState('CH2400000000000000000');
  const [epcBic, setEpcBic] = useState('TESTCHZZXXX');
  const [epcAmount, setEpcAmount] = useState('120.00');
  const [epcBusinessCode, setEpcBusinessCode] = useState('SALES');
  const [epcReference, setEpcReference] = useState('INV-2026-001');

  // 2. Swiss QR Code
  const [swissIban, setSwissIban] = useState('CH5800791123000889012');
  const [swissName, setSwissName] = useState('Robert Schneider AG');
  const [swissStreet, setSwissStreet] = useState('Rue du Lac');
  const [swissBuildingNumber, setSwissBuildingNumber] = useState('1268');
  const [swissPostalCode, setSwissPostalCode] = useState('2501');
  const [swissCity, setSwissCity] = useState('Biel');
  const [swissCountryCode, setSwissCountryCode] = useState('CH');

  // 3. ZATCA QR Code (KSA)
  const [zatcaSellerName, setZatcaSellerName] = useState('AryaLink Digital Solutions');
  const [zatcaVatNumber, setZatcaVatNumber] = useState('300000000000003');
  const [zatcaTimestamp, setZatcaTimestamp] = useState('2026-11-08T16:00:00Z');
  const [zatcaInvoiceTotal, setZatcaInvoiceTotal] = useState('1500.00');
  const [zatcaVatTotal, setZatcaVatTotal] = useState('225.00');

  // HTML Embed & Cloud History States (Stage 2 & 5)
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>('');
  const [embedCopied, setEmbedCopied] = useState<boolean>(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState<boolean>(false);
  const [isSavingToHistory, setIsSavingToHistory] = useState<boolean>(false);

  // Group 11: Business Card State
  const [cardFirstName, setCardFirstName] = useState('احمد');
  const [cardLastName, setCardLastName] = useState('رسولی');
  const [cardOrg, setCardOrg] = useState('شرکت آریا لینک');
  const [cardTitle, setCardTitle] = useState('مدیر فناوری');
  const [cardPhone, setCardPhone] = useState('+93700123456');
  const [cardEmail, setCardEmail] = useState('info@aryalink.com');
  const [cardWebsite, setCardWebsite] = useState('https://aryalink.com');

  // Group 12: Event Barcode State
  const [eventTitle, setEventTitle] = useState('کنفرانس فناوری آریا لینک 2026');
  const [eventLocation, setEventLocation] = useState('کابل، هتل کابل سرینا');
  const [eventStart, setEventStart] = useState('20261115T090000Z');
  const [eventEnd, setEventEnd] = useState('20261115T120000Z');
  const [eventDescription, setEventDescription] = useState('معرفی نسل جدید کارت‌های ویزیت دیجیتال هوشمند');

  // Group 13: Wi-Fi Barcode State
  const [wifiSsid, setWifiSsid] = useState('AryaLink_Guest_WiFi');
  const [wifiPassword, setWifiPassword] = useState('AryaLink@2026');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  // Status & Render refs
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [svgOutput, setSvgOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Dedicated HTML5 Canvas ref for direct bwipjs.toCanvas rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active category and subtype objects
  const currentCategory =
    BARCODE_CATEGORIES.find((c) => c.id === selectedCategory) ||
    BARCODE_CATEGORIES[0];
  const currentSubtype =
    currentCategory.subtypes.find((s) => s.id === selectedSubtypeId) ||
    currentCategory.subtypes[0];

  // Smart Helper Guide Text for active barcode
  const currentGuideText =
    BARCODE_SMART_GUIDES[currentSubtype.id] ||
    BARCODE_SMART_GUIDES[currentCategory.id] ||
    currentSubtype.hint;

  // Case-insensitive Real-time Search across 116 Barcode Models (Stage 1)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      category: BarcodeCategory;
      subtype: BarcodeSubtype;
      features: string;
      guide: string;
    }> = [];

    for (const cat of BARCODE_CATEGORIES) {
      for (const sub of cat.subtypes) {
        const feat = sub.features || sub.hint || '';
        const gd =
          sub.guide ||
          BARCODE_SMART_GUIDES[sub.id] ||
          BARCODE_SMART_GUIDES[cat.id] ||
          feat;

        const matchName = searchInName && sub.name.toLowerCase().includes(q);
        const matchFeat = searchInFeatures && feat.toLowerCase().includes(q);
        const matchGuide = searchInGuide && gd.toLowerCase().includes(q);

        if (matchName || matchFeat || matchGuide) {
          results.push({
            category: cat,
            subtype: sub,
            features: feat,
            guide: gd,
          });
        }
      }
    }
    return results;
  }, [searchQuery, searchInName, searchInFeatures, searchInGuide]);

  // String formatting for Group 7 (Banking), 11, 12, 13
  const computedPayload = useMemo(() => {
    // Group 7: Banking and Payments (EPC SEPA, Swiss QR, ZATCA)
    if (selectedCategory === 'banking') {
      if (selectedSubtypeId === 'epcqr') {
        // EPC QR Code V2 (SEPA Credit Transfer)
        return [
          'BCD',
          '002',
          '1',
          'SCT',
          epcBic.trim(),
          epcName.trim(),
          epcIban.trim(),
          epcAmount.trim() ? `EUR${epcAmount.trim()}` : '',
          epcBusinessCode.trim(),
          epcReference.trim(),
        ].join('\n');
      }

      if (selectedSubtypeId.startsWith('swissqr')) {
        // Swiss QR Bill (SPC)
        const version = selectedSubtypeId === 'swissqr_v1' ? '0100' : '0200';
        const refType = selectedSubtypeId.includes('credref')
          ? 'SCOR'
          : selectedSubtypeId.includes('qrref')
            ? 'QRR'
            : 'NON';
        const refNumber = selectedSubtypeId.includes('credref')
          ? 'RF18539007547034'
          : selectedSubtypeId.includes('qrref')
            ? '210000000003139471430009017'
            : '';

        return [
          'SPC',
          version,
          '1',
          swissIban.trim(),
          'S',
          swissName.trim(),
          swissStreet.trim(),
          swissBuildingNumber.trim(),
          swissPostalCode.trim(),
          swissCity.trim(),
          swissCountryCode.trim(),
          '', '', '', '', '', '', '',
          '199.95',
          'CHF',
          'K',
          'Customer AG',
          'Bahnhofstrasse 10',
          '8001 Zurich',
          '', '', 'CH',
          refType,
          refNumber,
          'EPD',
        ].join('^CR^LF');
      }

      if (selectedSubtypeId === 'zatca') {
        // ZATCA Saudi Arabia TLV Base64 format
        try {
          const encoder = new TextEncoder();
          const tags = [
            zatcaSellerName.trim() || 'AryaLink Digital Solutions',
            zatcaVatNumber.trim() || '300000000000003',
            zatcaTimestamp.trim() || '2026-11-08T16:00:00Z',
            zatcaInvoiceTotal.trim() || '1500.00',
            zatcaVatTotal.trim() || '225.00',
          ];
          const bytes: number[] = [];
          tags.forEach((str, i) => {
            const tagNum = i + 1;
            const utf8 = encoder.encode(str);
            bytes.push(tagNum);
            bytes.push(utf8.length);
            for (let j = 0; j < utf8.length; j++) {
              bytes.push(utf8[j]);
            }
          });
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return btoa(binary);
        } catch {
          return `${zatcaSellerName} - VAT: ${zatcaVatNumber} - Total: ${zatcaInvoiceTotal}`;
        }
      }
    }

    if (selectedCategory === 'business_cards') {
      if (
        selectedSubtypeId === 'mecard_qr' ||
        selectedSubtypeId === 'mecard_dm'
      ) {
        return `MECARD:N:${cardLastName},${cardFirstName};ORG:${cardOrg};TEL:${cardPhone};EMAIL:${cardEmail};URL:${cardWebsite};;`;
      }
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${cardLastName};${cardFirstName};;;`,
        `FN:${cardFirstName} ${cardLastName}`.trim(),
        cardOrg ? `ORG:${cardOrg}` : '',
        cardTitle ? `TITLE:${cardTitle}` : '',
        cardPhone ? `TEL:${cardPhone}` : '',
        cardEmail ? `EMAIL:${cardEmail}` : '',
        cardWebsite ? `URL:${cardWebsite}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (selectedCategory === 'event_barcodes') {
      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${eventTitle}`,
        eventLocation ? `LOCATION:${eventLocation}` : '',
        `DTSTART:${eventStart}`,
        `DTEND:${eventEnd}`,
        eventDescription ? `DESCRIPTION:${eventDescription}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (selectedCategory === 'wifi_barcodes') {
      return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'
        };;`;
    }

    return textValue;
  }, [
    selectedCategory,
    selectedSubtypeId,
    textValue,
    cardFirstName,
    cardLastName,
    cardOrg,
    cardTitle,
    cardPhone,
    cardEmail,
    cardWebsite,
    eventTitle,
    eventLocation,
    eventStart,
    eventEnd,
    eventDescription,
    wifiAuth,
    wifiSsid,
    wifiPassword,
    wifiHidden,
    epcName,
    epcIban,
    epcBic,
    epcAmount,
    epcBusinessCode,
    epcReference,
    swissIban,
    swissName,
    swissStreet,
    swissBuildingNumber,
    swissPostalCode,
    swissCity,
    swissCountryCode,
    zatcaSellerName,
    zatcaVatNumber,
    zatcaTimestamp,
    zatcaInvoiceTotal,
    zatcaVatTotal,
  ]);

  // Auto-switch subtype when category changes
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const cat = BARCODE_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.subtypes.length > 0) {
      const first = cat.subtypes[0];
      setSelectedSubtypeId(first.id);
      if (first.defaultText) {
        setTextValue(first.defaultText);
      }
    }
  };

  const handleSubtypeChange = (subId: string) => {
    setSelectedSubtypeId(subId);
    const sub = currentCategory.subtypes.find((s) => s.id === subId);
    if (sub && sub.defaultText) {
      setTextValue(sub.defaultText);
    }
  };

  // Render Barcode directly on Canvas via bwip-js inside useEffect with full try/catch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!computedPayload || !currentSubtype) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasError(true);
      setErrorMessage('فرمت ورودی برای این نوع بارکد نامعتبر است.');
      setSvgOutput('');
      return;
    }

    try {
      setHasError(false);
      setErrorMessage(null);

      // Clean hex colors without # for bwip-js (Default: barcolor='000000', backgroundcolor='ffffff')
      const barcolorClean = (lineColor || '#000000').replace('#', '');
      const backgroundcolorClean = (bgColor || '#ffffff').replace('#', '');

      const is2dCode =
        currentSubtype.bcid === 'qrcode' ||
        currentSubtype.bcid === 'datamatrix' ||
        currentSubtype.bcid === 'azteccode' ||
        currentSubtype.bcid === 'swissqrcode' ||
        currentSubtype.bcid === 'maxicode' ||
        currentSubtype.bcid === 'hanxin' ||
        currentSubtype.bcid === 'dotcode' ||
        currentSubtype.bcid === 'pdf417' ||
        currentSubtype.bcid === 'micropdf417' ||
        currentSubtype.bcid === 'microqrcode' ||
        currentSubtype.bcid === 'gs1qrcode' ||
        currentSubtype.bcid === 'gs1datamatrix' ||
        currentSubtype.bcid === 'gs1dlqrcode' ||
        currentSubtype.bcid === 'gs1dldatamatrix';

      // Conditional Options Configuration (Step 1):
      // Differentiate Retail Codes from regular Linear and 2D codes
      const barcodeType = currentSubtype.bcid;
      const isRetailCode = ['ean13', 'ean8', 'upca', 'upce', 'isbn', 'ismn', 'issn'].some(
        (t) => barcodeType.toLowerCase().includes(t)
      );

      const bwipOptions: any = {
        bcid: currentSubtype.bcid,
        text: computedPayload,
        scale: scale,
        barcolor: barcolorClean,
        backgroundcolor: backgroundcolorClean,
      };

      if (isRetailCode) {
        // Retail barcodes: only guardwhitespace and includetext so guard bars descend correctly
        bwipOptions.guardwhitespace = true;
        bwipOptions.includetext = true;
      } else if (!is2dCode) {
        // Normal linear barcode: apply centering, textgaps, and bottom padding
        bwipOptions.height = 10;
        bwipOptions.includetext = includeText;
        if (includeText) {
          bwipOptions.textxalign = 'center';
          bwipOptions.textgaps = 2;
          bwipOptions.paddingbottom = 10;
        }
      } else {
        // 2D barcode (QR, DataMatrix, Aztec, etc.)
        bwipOptions.includetext = includeText;
      }

      if (
        currentSubtype.bcid === 'swissqrcode' ||
        currentSubtype.bcid === 'maxicode'
      ) {
        bwipOptions.parse = true;
      }

      if (currentSubtype.bcid === 'auspost') {
        bwipOptions.custinfoenc = 'character';
      }

      if (currentSubtype.bcid === 'mailmark') {
        bwipOptions.type = '29';
      }

      if (currentSubtype.id === 'pzn8') {
        bwipOptions.pzn8 = true;
      }

      // 1. Render directly to visible canvas via bwipjs.toCanvas
      bwipjs.toCanvas(canvas, bwipOptions);

      // Save raster dataUrl for HTML Embed snippet & Cloud History (Stage 2 & 5)
      try {
        setBarcodeDataUrl(canvas.toDataURL('image/png'));
      } catch (dataErr) { }

      // 2. Also generate SVG string for SVG vector download/copy
      try {
        const svg = bwipjs.toSVG(bwipOptions);
        setSvgOutput(svg);
      } catch (svgErr) {
        setSvgOutput('');
      }
    } catch (err: any) {
      console.warn('Barcode rendering error caught:', err);
      // Clear canvas so broken drawing is not left on canvas
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      setHasError(true);
      setErrorMessage('فرمت ورودی برای این نوع بارکد نامعتبر است.');
      setSvgOutput('');
    }
  }, [
    computedPayload,
    selectedCategory,
    selectedSubtypeId,
    currentSubtype.bcid,
    currentSubtype.id,
    scale,
    lineColor,
    bgColor,
    includeText,
  ]);

  // Handle Load Profile button
  const handleLoadProfile = () => {
    loadProfile((profile) => {
      const parts = profile.displayName.trim().split(' ');
      const fName = parts[0] || '';
      const lName = parts.slice(1).join(' ') || '';

      setCardFirstName(fName);
      setCardLastName(lName);
      if (profile.company) setCardOrg(profile.company);
      if (profile.headline) setCardTitle(profile.headline);
      if (profile.phone) setCardPhone(profile.phone);
      if (profile.email) setCardEmail(profile.email);
      if (profile.website) setCardWebsite(profile.website);

      // If user is on other tabs, set default profile URL as barcode text
      if (profile.website) {
        setTextValue(profile.website);
      }
    });
  };

  // Export handlers
  const handleDownloadSvg = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aryalink-barcode-${currentSubtype.id}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('فایل SVG با موفقیت دانلود شد.');
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current || hasError) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `aryalink-barcode-${currentSubtype.id}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تصویر PNG با موفقیت دانلود شد.');
  };

  const handleDownloadJpg = () => {
    if (!canvasRef.current || hasError) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = bgColor || '#ffffff';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(canvasRef.current, 0, 0);
      const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `aryalink-barcode-${currentSubtype.id}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('تصویر JPG با موفقیت دانلود شد.');
    }
  };

  const handleCopySvg = () => {
    if (!svgOutput) return;
    navigator.clipboard.writeText(svgOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('کد وکتور SVG در حافظه کپی شد.');
  };

  // Stage 5: Save Barcode to Cloud History
  const handleSaveToHistory = async () => {
    try {
      setIsSavingToHistory(true);
      const preview =
        barcodeDataUrl ||
        (canvasRef.current ? canvasRef.current.toDataURL('image/png') : '');

      const res = await fetch('/api/tools/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'barcode',
          title: `Barcode: ${currentSubtype.name}`,
          subtype: currentSubtype.id,
          payload: computedPayload,
          previewDataUrl: preview,
          config: {
            bcid: currentSubtype.bcid,
            category: selectedCategory,
            scale,
            barcolor: lineColor,
            backgroundcolor: bgColor,
          },
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        toast.error('برای ذخیره در تاریخچه، ابتدا وارد حساب کاربری خود شوید.');
        return;
      }

      if (data.success) {
        toast.success('بارکد با موفقیت در تاریخچه ابزارهای شما ذخیره شد.');
      } else {
        toast.error(data.message || 'خطا در ذخیره تاریخچه.');
      }
    } catch {
      toast.error('خطای شبکه در ذخیره تاریخچه.');
    } finally {
      setIsSavingToHistory(false);
    }
  };

  // Stage 2: HTML Embed Snippet & Backlink
  const embedHtmlCode = useMemo(() => {
    const src = barcodeDataUrl || 'data:image/png;base64,...';
    return `<!-- Barcode generated by AryaLink (https://aryalink.com/tools/barcode-maker) -->\n<a href="https://aryalink.com/tools/barcode-maker" target="_blank" rel="noopener noreferrer">\n  <img src="${src}" alt="${currentSubtype.name} - AryaLink Barcode" />\n</a>`;
  }, [barcodeDataUrl, currentSubtype.name]);

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(embedHtmlCode);
    setEmbedCopied(true);
    toast.success('کد جاسازی HTML با موفقیت کپی شد.');
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="max-w-3xl mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ابزار صنعتی و تجاری آریا لینک (116 مدل در 13 دسته)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Barcode className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500" />
            <span>بارکد ساز جامع | Mega Barcode Generator</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {language === 'en'
              ? 'Generate ultra high-resolution 1D & 2D barcodes across 116 international standards with vector SVG, PNG, and JPG export.'
              : language === 'ps'
                ? 'په 116 نړیوالو او صنعتي معیارونو کې باکیفیته بارکوډونه جوړ کړئ او په وړیا ډول یې ډاونلوډ کړئ.'
                : 'تولید 116 مدل بارکد خطی، دوبعدی، گمرکی، اموال (EAN/UPC)، صنایع دوایی و صحی، پستی و بانکی با بالاترین کیفیت و خروجی وکتور SVG.'}
          </p>
        </div>

        {/* Top-Level Mode Navigation: Generator vs Scanner */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-card border border-border/80 shadow-md mb-8 max-w-md">
          <button
            type="button"
            onClick={() => setActiveToolTab('generator')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeToolTab === 'generator'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
          >
            <Barcode className="w-4 h-4" />
            <span>سازنده بارکد (Generator)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveToolTab('scanner')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeToolTab === 'scanner'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
          >
            <Camera className="w-4 h-4" />
            <span>اسکنر بارکد (Scanner)</span>
          </button>
        </div>

        {activeToolTab === 'generator' ? (
          /* Generator View (Controls Grid + Live Canvas Preview) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controls Column */}
            <div className="lg:col-span-7 space-y-6 bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-xl">
              {/* Header & Load My Profile Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-base font-bold text-foreground">
                    تنظیمات و انتخاب استاندارد بارکد (116 مدل بین‌المللی)
                  </h2>
                </div>

                {/* Load Profile Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoadProfile}
                  disabled={isProfileLoading}
                  className="rounded-xl border-cyan-500/40 text-cyan-500 hover:bg-cyan-500/10 font-bold text-xs h-9"
                >
                  <User className="w-3.5 h-3.5 me-1.5" />
                  <span>
                    {isProfileLoading ? 'در حال فراخوانی...' : 'فراخوانی اطلاعات من'}
                  </span>
                </Button>
              </div>

              {/* Stage 1: Smart Search & Filter Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/70 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Search className="w-4 h-4 text-cyan-500" />
                    <span>جستجوی هوشمند در 116 مدل بارکد:</span>
                  </div>

                  {/* 3 Filter Checkboxes */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-[11px] text-muted-foreground">جستجو در:</span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={searchInName}
                        onChange={(e) => setSearchInName(e.target.checked)}
                        className="rounded border-border text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5"
                      />
                      <span>نام</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={searchInFeatures}
                        onChange={(e) => setSearchInFeatures(e.target.checked)}
                        className="rounded border-border text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5"
                      />
                      <span>ویژگی‌ها</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={searchInGuide}
                        onChange={(e) => setSearchInGuide(e.target.checked)}
                        className="rounded border-border text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5"
                      />
                      <span>راهنما</span>
                    </label>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو بر اساس نام، مشخصات، استاندارد یا کاربرد صنعتی..."
                    className="ps-10 pe-10 h-10 rounded-xl bg-background border-border text-xs focus-visible:ring-cyan-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md"
                      title="پاک کردن جستجو"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conditional Display: Search Results vs Cascade Selector */}
              {searchQuery.trim().length > 0 ? (
                /* Interactive Search Results Card Grid */
                <div className="space-y-3 p-4 rounded-2xl bg-card border border-cyan-500/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-cyan-500" />
                      <span>نتایج جستجو:</span>
                    </span>
                    <span className="text-cyan-500 font-mono font-bold">
                      {searchResults.length} مدل یافت شد
                    </span>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pe-1">
                      {searchResults.map(({ category, subtype, features, guide }) => {
                        const isSelected = selectedSubtypeId === subtype.id;
                        return (
                          <button
                            key={subtype.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setSelectedSubtypeId(subtype.id);
                              if (
                                subtype.defaultText &&
                                !['business_cards', 'event_barcodes', 'wifi_barcodes'].includes(category.id)
                              ) {
                                setTextValue(subtype.defaultText);
                              }
                              toast.info(`مدل ${subtype.name} انتخاب شد.`);
                            }}
                            className={`p-3 rounded-xl border text-start transition-all flex flex-col justify-between gap-2 ${isSelected
                              ? 'bg-cyan-500/15 border-cyan-500 text-foreground ring-1 ring-cyan-500'
                              : 'bg-muted/30 border-border/70 hover:border-cyan-500/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                              }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold text-foreground line-clamp-1">
                                  {subtype.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500 text-white font-semibold">
                                    فعال
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                {features}
                              </p>
                            </div>
                            <div className="text-[10px] font-mono text-cyan-500/90 flex items-center justify-between pt-1 border-t border-border/40">
                              <span className="truncate">{category.title.split('(')[0].trim()}</span>
                              <span>bcid: {subtype.bcid}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                      <p>هیچ مدلی با عبارت جستجو شده یافت نشد.</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="text-cyan-500 hover:text-cyan-400 text-xs"
                      >
                        نمایش تمام 116 مدل بارکد
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Cascade 1: Category Selector (Sleek Styled Select) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-500" />
                        <span>1. انتخاب دسته‌بندی بارکد:</span>
                      </span>
                      <span className="text-[11px] font-mono text-cyan-500 font-medium">
                        {BARCODE_CATEGORIES.length} دسته اصلی
                      </span>
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer shadow-xs"
                    >
                      {BARCODE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-1">
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cascade 2: Subtype Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5 text-cyan-500" />
                        <span>2. نوع دقیق استاندارد (Subtype):</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {currentCategory.subtypes.length} مدل در این دسته
                      </span>
                    </label>
                    <select
                      value={selectedSubtypeId}
                      onChange={(e) => handleSubtypeChange(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer shadow-xs"
                    >
                      {currentCategory.subtypes.map((sub) => (
                        <option key={sub.id} value={sub.id} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-1">
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Content Input Form: Adaptive based on Category (Stage 1 Dynamic Forms) */}
              <div className="space-y-3 pt-2">
                {/* GROUP 7: Banking and Payments Dynamic Form (Stage 1) */}
                {selectedCategory === 'banking' ? (
                  <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
                    {/* Subtype 1: EPC QR Code V2 (SEPA) */}
                    {selectedSubtypeId === 'epcqr' ? (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border/50">
                          <Layers className="w-4 h-4 text-cyan-500" />
                          <span>مشخصات پرداخت شتابی یورو (EPC QR Code V2 SEPA):</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              نام ذینفع (Name):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={epcName}
                              onChange={(e) => setEpcName(e.target.value)}
                              placeholder="Beneficiary Name (e.g. AryaLink Technologies)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              شماره شبا بین‌المللی (IBAN):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={epcIban}
                              onChange={(e) => setEpcIban(e.target.value)}
                              placeholder="IBAN (e.g. CH2400000000000000000)"
                              className="h-10 text-xs font-mono text-left uppercase"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              کد سوئیفت بانک (BIC):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={epcBic}
                              onChange={(e) => setEpcBic(e.target.value)}
                              placeholder="BIC / SWIFT (e.g. TESTCHZZXXX)"
                              className="h-10 text-xs font-mono text-left uppercase"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              مبلغ یورو (Amount EUR):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={epcAmount}
                              onChange={(e) => setEpcAmount(e.target.value)}
                              placeholder="Amount in EUR (e.g. 120.00)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              کد کسب‌وکار (Business Code):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={epcBusinessCode}
                              onChange={(e) => setEpcBusinessCode(e.target.value)}
                              placeholder="Business Code (e.g. SALES)"
                              className="h-10 text-xs font-mono text-left uppercase"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              کد مرجع و شناسه فاکتور (Reference):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={epcReference}
                              onChange={(e) => setEpcReference(e.target.value)}
                              placeholder="Reference (e.g. INV-2026-001)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                        </div>
                      </div>
                    ) : selectedSubtypeId.startsWith('swissqr') ? (
                      /* Subtype 2: Swiss QR Code */
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border/50">
                          <Layers className="w-4 h-4 text-cyan-500" />
                          <span>مشخصات صورتحساب رسمی سوئیس (Swiss QR-Bill):</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              شماره شبا (IBAN):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={swissIban}
                              onChange={(e) => setSwissIban(e.target.value)}
                              placeholder="IBAN (e.g. CH5800791123000889012)"
                              className="h-10 text-xs font-mono text-left uppercase"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              نام ذینفع / بستانکار (Name):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={swissName}
                              onChange={(e) => setSwissName(e.target.value)}
                              placeholder="Name (e.g. Robert Schneider AG)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              خیابان (Street):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={swissStreet}
                              onChange={(e) => setSwissStreet(e.target.value)}
                              placeholder="Street (e.g. Rue du Lac)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              پلاک ساختمان (Building Number):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={swissBuildingNumber}
                              onChange={(e) => setSwissBuildingNumber(e.target.value)}
                              placeholder="Building No (e.g. 1268)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              کد پستی (Postal Code):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={swissPostalCode}
                              onChange={(e) => setSwissPostalCode(e.target.value)}
                              placeholder="Postal Code (e.g. 2501)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              شهر (Town / City):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={swissCity}
                              onChange={(e) => setSwissCity(e.target.value)}
                              placeholder="City (e.g. Biel)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              کد کشور (Country Code):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={swissCountryCode}
                              onChange={(e) => setSwissCountryCode(e.target.value)}
                              placeholder="Country (e.g. CH)"
                              className="h-10 text-xs font-mono text-left uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Subtype 3: ZATCA QR Code (KSA) */
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border/50">
                          <Layers className="w-4 h-4 text-cyan-500" />
                          <span>مشخصات صورتحساب الکترونیکی زکات و مالیات (ZATCA Fatoora TLV):</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              نام فروشنده (Seller Name):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={zatcaSellerName}
                              onChange={(e) => setZatcaSellerName(e.target.value)}
                              placeholder="Seller Name (e.g. AryaLink Digital Solutions)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              شماره مالیاتی (VAT Number):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={zatcaVatNumber}
                              onChange={(e) => setZatcaVatNumber(e.target.value)}
                              placeholder="15-digit VAT (e.g. 300000000000003)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              زمان و تاریخ صدور (Time Stamp):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={zatcaTimestamp}
                              onChange={(e) => setZatcaTimestamp(e.target.value)}
                              placeholder="Timestamp (e.g. 2026-11-08T16:00:00Z)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              مجموع فاکتور (Invoice Total):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={zatcaInvoiceTotal}
                              onChange={(e) => setZatcaInvoiceTotal(e.target.value)}
                              placeholder="Total (e.g. 1500.00)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              مجموع مالیات ارزش افزوده (VAT Total):
                            </label>
                            <Input
                              dir="ltr"
                              style={{ textAlign: 'left' }}
                              value={zatcaVatTotal}
                              onChange={(e) => setZatcaVatTotal(e.target.value)}
                              placeholder="VAT Amount (e.g. 225.00)"
                              className="h-10 text-xs font-mono text-left"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedCategory === 'business_cards' ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/60">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border/50">
                      <User className="w-4 h-4 text-cyan-500" />
                      <span>مشخصات کارت ویزیت الکترونیکی (vCard / MeCard):</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          نام:
                        </label>
                        <Input
                          value={cardFirstName}
                          onChange={(e) => setCardFirstName(e.target.value)}
                          placeholder="نام (مثال: احمد)"
                          className="h-10 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          نام خانوادگی:
                        </label>
                        <Input
                          value={cardLastName}
                          onChange={(e) => setCardLastName(e.target.value)}
                          placeholder="نام خانوادگی (مثال: رسولی)"
                          className="h-10 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          شرکت / سازمان:
                        </label>
                        <Input
                          value={cardOrg}
                          onChange={(e) => setCardOrg(e.target.value)}
                          placeholder="نام شرکت (مثال: آریا لینک)"
                          className="h-10 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          عنوان شغلی:
                        </label>
                        <Input
                          value={cardTitle}
                          onChange={(e) => setCardTitle(e.target.value)}
                          placeholder="سمت (مثال: مدیر فناوری)"
                          className="h-10 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          شماره تلفن:
                        </label>
                        <Input
                          dir="ltr"
                          style={{ textAlign: 'left' }}
                          value={cardPhone}
                          onChange={(e) => setCardPhone(e.target.value)}
                          placeholder="شماره تلفن با کد کشور (مثال: +93700123456)"
                          className="h-10 text-xs font-mono text-left"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          آدرس ایمیل:
                        </label>
                        <Input
                          dir="ltr"
                          style={{ textAlign: 'left' }}
                          value={cardEmail}
                          onChange={(e) => setCardEmail(e.target.value)}
                          placeholder="ایمیل کاری (مثال: info@aryalink.com)"
                          className="h-10 text-xs font-mono text-left"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">
                        وب‌سایت یا لینک کارت هوشمند:
                      </label>
                      <Input
                        dir="ltr"
                        style={{ textAlign: 'left' }}
                        value={cardWebsite}
                        onChange={(e) => setCardWebsite(e.target.value)}
                        placeholder="لینک اینترنتی (مثال: https://aryalink.com)"
                        className="h-10 text-xs font-mono text-left"
                      />
                    </div>
                  </div>
                ) : selectedCategory === 'event_barcodes' ? (
                  /* GROUP 12: Event Barcodes Form */
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/60">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border/50">
                      <Calendar className="w-4 h-4 text-cyan-500" />
                      <span>مشخصات رویداد و تقویم (iCalendar VEVENT):</span>
                    </span>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">
                        عنوان رویداد:
                      </label>
                      <Input
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="عنوان جلسه یا همایش (مثال: کنفرانس سالانه آریا لینک)"
                        className="h-10 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">
                        محل برگزاری:
                      </label>
                      <Input
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="محل رویداد (مثال: کابل، هتل سرینا)"
                        className="h-10 text-xs font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          زمان شروع (فرمت YYYYMMDDTHHMMSSZ):
                        </label>
                        <Input
                          dir="ltr"
                          style={{ textAlign: 'left' }}
                          value={eventStart}
                          onChange={(e) => setEventStart(e.target.value)}
                          placeholder="فرمت تقویم (مثال: 20261115T090000Z)"
                          className="h-10 text-xs font-mono text-left"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          زمان پایان (فرمت YYYYMMDDTHHMMSSZ):
                        </label>
                        <Input
                          dir="ltr"
                          style={{ textAlign: 'left' }}
                          value={eventEnd}
                          onChange={(e) => setEventEnd(e.target.value)}
                          placeholder="فرمت تقویم (مثال: 20261115T120000Z)"
                          className="h-10 text-xs font-mono text-left"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">
                        توضیحات رویداد:
                      </label>
                      <Input
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        placeholder="توضیحات کوتاه (مثال: معرفی راهکارهای نوین کارت هوشمند)"
                        className="h-10 text-xs font-medium"
                      />
                    </div>
                  </div>
                ) : selectedCategory === 'wifi_barcodes' ? (
                  /* GROUP 13: Wi-Fi Barcodes Form */
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/60">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border/50">
                      <Wifi className="w-4 h-4 text-cyan-500" />
                      <span>مشخصات اتصال خودکار شبکه وای‌فای:</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          نام شبکه (SSID):
                        </label>
                        <Input
                          dir="ltr"
                          style={{ textAlign: 'left' }}
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          placeholder="نام شبکه وای‌فای (مثال: AryaLink_Guest)"
                          className="h-10 text-xs font-mono text-left"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">
                          رمز عبور وای‌فای:
                        </label>
                        <Input
                          dir="ltr"
                          style={{ textAlign: 'left' }}
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="رمز عبور شبکه (مثال: Secret2026)"
                          className="h-10 text-xs font-mono text-left"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          رمزنگاری:
                        </span>
                        {(['WPA', 'WEP', 'nopass'] as const).map((auth) => (
                          <button
                            key={auth}
                            type="button"
                            onClick={() => setWifiAuth(auth)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${wifiAuth === auth
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold'
                              : 'border-border/60 text-muted-foreground hover:bg-muted'
                              }`}
                          >
                            {auth === 'nopass' ? 'بدون رمز (Open)' : auth}
                          </button>
                        ))}
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={wifiHidden}
                          onChange={(e) => setWifiHidden(e.target.checked)}
                          className="rounded border-border accent-cyan-500 cursor-pointer"
                        />
                        <span>شبکه پنهان (Hidden SSID)</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  /* GROUP 1-10: Standard Barcode Content Input with dir="ltr" and text-left */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        3. متن، عدد یا لینک درون بارکد:
                      </label>
                      <button
                        type="button"
                        onClick={() => setTextValue(currentSubtype.defaultText)}
                        className="text-[10px] text-cyan-500 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>نمونه پیش‌فرض معتبر</span>
                      </button>
                    </div>
                    <Input
                      dir="ltr"
                      style={{ textAlign: 'left' }}
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder={currentSubtype.placeholder}
                      className="h-11 rounded-xl text-xs font-mono font-semibold text-left"
                    />
                  </div>
                )}
              </div>

              {/* Appearance Settings: Colors, Scale, Include Text */}
              <div className="pt-4 border-t border-border/60 space-y-4">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-500" />
                  <span>تنظیمات ظاهری و خروجی:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Line Color */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      رنگ خطوط بارکد (پیش‌فرض مشکی):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border p-0.5 bg-transparent"
                      />
                      <Input
                        dir="ltr"
                        style={{ textAlign: 'left' }}
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        className="h-10 text-xs font-mono text-left"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      رنگ پس‌زمینه (پیش‌فرض سفید):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border p-0.5 bg-transparent"
                      />
                      <Input
                        dir="ltr"
                        style={{ textAlign: 'left' }}
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-10 text-xs font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Scale */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                      <span>اندازه و مقیاس (Scale):</span>
                      <span className="font-mono text-cyan-500 font-bold">
                        {scale}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Include Text */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-foreground cursor-pointer">
                        نمایش متن زیر بارکد
                      </label>
                      <p className="text-[10px] text-muted-foreground">
                        فاصله استاندارد 2 پیکسلی و 10 پیکسل حاشیه امن پایین
                      </p>
                    </div>
                    <Switch
                      checked={includeText}
                      onCheckedChange={(checked) => setIncludeText(checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview & Download Column (Step 3: max-w-full h-auto object-contain, No stretching) */}
            <div className="lg:col-span-5 sticky top-28 space-y-6">
              <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>پیش‌نمایش زنده بارکد</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono font-semibold text-muted-foreground">
                    {currentSubtype.name}
                  </span>
                </div>

                {/* STRICT PURE WHITE Barcode Render Container (Step 3: object-contain with native aspect ratio) */}
                <div className="min-h-[260px] rounded-2xl bg-white border-2 border-slate-200 p-6 sm:p-8 flex items-center justify-center overflow-hidden shadow-inner text-slate-900">
                  <div className="flex flex-col items-center justify-center max-w-full overflow-x-auto p-2 bg-white">
                    {/* Step 3: Strictly max-w-full h-auto object-contain - No w-full or h-full to keep 2D codes perfectly square */}
                    <canvas
                      ref={canvasRef}
                      className={`max-w-full h-auto object-contain drop-shadow-sm select-none transition-opacity duration-200 ${hasError ? 'hidden' : 'block'
                        }`}
                    />

                    {/* Fallback Display if Format is Invalid */}
                    {hasError && (
                      <div className="text-center p-4 max-w-sm space-y-2">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto font-bold text-lg">
                          !
                        </div>
                        <p className="text-xs font-bold text-rose-500">
                          فرمت ورودی برای این نوع بارکد نامعتبر است.
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {currentSubtype.hint}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Small red error message under the box if format error occurs */}
                {hasError && (
                  <p className="text-xs font-semibold text-rose-500 text-center animate-pulse">
                    فرمت ورودی برای این نوع بارکد نامعتبر است.
                  </p>
                )}

                {/* Payload Summary Info */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center justify-between gap-3 text-start">
                  <div className="min-w-0 flex-1 truncate">
                    <span className="text-[10px] uppercase font-mono block text-muted-foreground">
                      محتوای کدگذاری‌شده:
                    </span>
                    <span
                      dir="ltr"
                      className="text-foreground font-mono truncate block text-xs text-left"
                    >
                      {computedPayload}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(computedPayload);
                      toast.success('محتوای کد کپی شد.');
                    }}
                    className="p-1.5 rounded-lg bg-background border border-border hover:bg-muted text-foreground transition-colors shrink-0"
                    title="کپی محتوا"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Action Buttons: SVG, PNG, JPG */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      onClick={handleDownloadSvg}
                      disabled={hasError || !svgOutput}
                      className="h-11 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>SVG (وکتور)</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={handleDownloadPng}
                      disabled={hasError}
                      className="h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={handleDownloadJpg}
                      disabled={hasError}
                      className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JPG</span>
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopySvg}
                    disabled={hasError || !svgOutput}
                    className="w-full h-10 rounded-xl text-xs font-semibold border-border hover:bg-muted flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>
                      {copied ? 'کد SVG کپی شد!' : 'کپی سورس وکتور SVG'}
                    </span>
                  </Button>

                  {/* Stage 5: Save to History Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveToHistory}
                    disabled={hasError || isSavingToHistory}
                    className="w-full h-10 rounded-xl text-xs font-bold border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center gap-2"
                  >
                    <Bookmark className="w-4 h-4 text-cyan-400" />
                    <span>
                      {isSavingToHistory
                        ? 'در حال ذخیره...'
                        : 'ذخیره در تاریخچه ابزارهای من'}
                    </span>
                  </Button>
                </div>


              </div>

              {/* Stage 3: Smart Helper (بخش راهنمای هوشمند استاندارد) */}
              <div className="bg-card/95 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-sm text-start space-y-3.5 relative overflow-hidden group transition-all duration-300 hover:border-cyan-500/50">
                <div className="absolute top-0 end-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        راهنمای هوشمند استاندارد
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {currentSubtype.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                    {currentCategory.title.split('(')[0].trim()}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                  <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                    {currentGuideText}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>استاندارد بین‌المللی ISO/IEC و GS1</span>
                  </span>

                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Scanner View (Stage 2, 3, 4) */
          <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-xl">
            <CodeScanner
              scannerType="barcode"
              title="اسکنر هوشمند بارکد (Barcode Scanner)"
              subtitle="اسکن زنده انواع کدهای خطی، دوبعدی و صنعتی با دوربین زنده دستگاه یا بارگذاری عکس"
              onRecreate={(decodedText) => {
                setTextValue(decodedText);
                setActiveToolTab('generator');
                toast.success('محتوای اسکن شده به اینپوت بارکد منتقل شد.');
              }}
            />
          </div>
        )}

        {/* Stage 3: Collapsible HTML Embed Accordion Section */}
        {activeToolTab === 'generator' && (
          <div className="bg-card border border-border/70 rounded-3xl shadow-xl overflow-hidden my-8 transition-all">
            <button
              type="button"
              onClick={() => setIsEmbedOpen((prev) => !prev)}
              className="w-full p-6 sm:p-7 flex items-center justify-between gap-4 text-start hover:bg-muted/30 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-bold mb-1">
                    HTML Embed Code
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    کد جاسازی در سایت (HTML Embed Code)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    تگ آماده HTML تصویر بارکد برای قرار دادن در وب‌سایت‌ها، فاکتورها و ایمیل
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-cyan-500 hidden sm:inline">
                  {isEmbedOpen ? 'بستن' : 'مشاهده کد'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                  {isEmbedOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </button>

            {isEmbedOpen && (
              <div className="p-6 sm:p-7 pt-0 border-t border-border/60 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    تگ HTML زیر حاوی تصویر Base64 بارکد تولیدشده است. برای استفاده در صفحات وب، فاکتورهای آنلاین یا نرم‌افزارها، آن را با یک کلیک کپی کنید:
                  </p>

                  <Button
                    type="button"
                    onClick={handleCopyEmbedCode}
                    className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs flex items-center gap-2 shrink-0 self-start sm:self-center"
                  >
                    {embedCopied ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>{embedCopied ? 'کد کپی شد!' : 'کپی کد HTML Embed'}</span>
                  </Button>
                </div>

                <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto text-left" dir="ltr">
                  <pre className="whitespace-pre-wrap break-all leading-relaxed">
                    {embedHtmlCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage 4: CTA Banner */}
        <ToolsCtaBanner />
      </div>
    </div>
  );
}

export default function MegaBarcodeGeneratorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>}>
      <MegaBarcodeGeneratorContent />
    </Suspense>
  );
}
