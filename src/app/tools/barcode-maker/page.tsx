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

// Full 116 Barcode Models Database across 13 Categories
export const BARCODE_CATEGORIES: BarcodeCategory[] = [
  // 1. Linear Codes (12 items)
  {
    id: 'linear',
    title: '1. Linear Codes (کدهای خطی)',
    subtypes: [
      { id: 'code128', name: 'Code-128 (استاندارد جهانی)', bcid: 'code128', defaultText: 'ARYALINK-128', placeholder: 'متن + عدد یا نمادهای استاندارد (مثال: ARYALINK-128)', hint: 'حروف الفبای لاتین، اعداد و کلیه کاراکترهای اسکی' },
      { id: 'code11', name: 'Code-11 (تجهیزات مخابراتی)', bcid: 'code11', defaultText: '12345678', placeholder: 'فقط ارقام 0-9 و خط فاصله (مثال: 12345678)', hint: 'مخصوص شناسایی خطوط، کابل‌ها و تجهیزات تلفنی' },
      { id: 'interleaved2of5', name: 'Code-2of5 Interleaved (کدهای باربری و صنعتی)', bcid: 'interleaved2of5', defaultText: '2401234567', placeholder: 'تعداد زوج از ارقام (مثال: 2401234567)', hint: 'بارکد عددی متراکم با تعداد زوج ارقام برای انبار و توزیع' },
      { id: 'code39', name: 'Code-39 (صنعتی و نظامی)', bcid: 'code39', defaultText: 'ARYA39', placeholder: 'حروف بزرگ انگلیسی و ارقام (مثال: ARYA39)', hint: 'استاندارد کلاسیک صنعتی با حروف بزرگ، اعداد و خط فاصله' },
      { id: 'code39ext', name: 'Code-39 Full ASCII (پشتیبانی کامل اسکی)', bcid: 'code39ext', defaultText: 'Code39 Ext!', placeholder: 'تمام کاراکترهای اسکی شامل حروف کوچک (مثال: Code39 Ext!)', hint: 'نسخه ارتقایافته کد 39 با پشتیبانی از حروف کوچک و نمادها' },
      { id: 'code93', name: 'Code-93 (فشرده با چگالی بالا)', bcid: 'code93', defaultText: 'ARYA93', placeholder: 'متن یا ارقام فشرده (مثال: ARYA93)', hint: 'امنیت و چگالی بالاتر نسبت به کد 39 برای فضاهای باریک' },
      { id: 'flattermarken', name: 'Flattermarken (علامت‌گذاری چاپ و صحافی)', bcid: 'flattermarken', defaultText: '12345', placeholder: 'فقط ارقام (مثال: 12345)', hint: 'علامت‌های کنترل ترتیب صفحات و فرم‌های چاپخانه' },
      { id: 'gs1-128', name: 'GS1-128 (UCC/EAN-128 زنجیره تأمین)', bcid: 'gs1-128', defaultText: '(01)09521234543213(3103)000123', placeholder: 'شناسه‌های کاربردی با پرانتز (مثال: (01)09521234543213)', hint: 'استاندارد بین‌المللی لجستیک کالا و پالت‌های حمل و نقل' },
      { id: 'msi', name: 'MSI (انبارداری و قفسه فروشگاهی)', bcid: 'msi', defaultText: '123456', placeholder: 'فقط ارقام 0 تا 9 (مثال: 123456)', hint: 'سیستم کدگذاری خطی پلسی Plessey برای لیبل قیمت قفسه‌ها' },
      { id: 'pharmacode_one', name: 'Pharmacode One-Track (داروسازی تک‌خط)', bcid: 'pharmacode', defaultText: '117480', placeholder: 'یک عدد بین 3 تا 131070 (مثال: 117480)', hint: 'کنترل بسته‌بندی دارو در کارخانجات با خطوط تک‌رشته‌ای' },
      { id: 'pharmacode_two', name: 'Pharmacode Two-Track (داروسازی دوخط)', bcid: 'pharmacode2', defaultText: '117480', placeholder: 'یک عدد بین 4 تا 64570080 (مثال: 117480)', hint: 'کنترل بسته‌بندی دارویی با دو ردیف خطوط با ضخامت متغیر' },
      { id: 'telepen', name: 'Telepen Alpha (استاندارد با امنیت بالا)', bcid: 'telepen', defaultText: 'ARYALINK', placeholder: 'متن اسکی انگلیسی (مثال: ARYALINK)', hint: 'سیستم کدگذاری اسکی کامل بریتانیا با ضریب خطای فوق‌العاده ناچیز' },
    ],
  },

  // 2. Postal Codes (15 items)
  {
    id: 'postal',
    title: '2. Postal Codes (کدهای پستی)',
    subtypes: [
      { id: 'auspost', name: 'Australian Post (پست استرالیا)', bcid: 'auspost', defaultText: '5956439111ABA 9', placeholder: 'کد 4-State استرالیا (مثال: 5956439111ABA 9)', hint: 'بارکد توزیع مکانیزه مرسولات شرکت پست استرالیا' },
      { id: 'daft', name: 'DAFT (کدگذاری 4 حالته پستی)', bcid: 'daft', defaultText: 'DAFTDAFT', placeholder: 'حروف D، A، F و T (مثال: DAFTDAFTDAFT)', hint: 'کدگذاری عمومی خطوط کوتاه، بالا، پایین و کامل پستی' },
      { id: 'dpd', name: 'DPD Barcode (شرکت پستی بین‌المللی DPD)', bcid: 'code128', defaultText: '01234567890123', placeholder: '14 رقم رهگیری بسته DPD (مثال: 01234567890123)', hint: 'شناسه اختصاصی بسته‌های شرکت حمل و نقل سریع DPD اروپا' },
      { id: 'japanpost', name: 'Japanese Postal (پست ملی ژاپن)', bcid: 'japanpost', defaultText: '6540123789-A-K-Z', placeholder: 'کد پستی و آدرس ژاپن (مثال: 6540123789-A-K-Z)', hint: 'سیستم مرتب‌سازی خودکار پاکت نامه‌ها در ژاپن' },
      { id: 'kix', name: 'KIX (پست ملی هلند - TNT)', bcid: 'kix', defaultText: '1231FZ13XHS', placeholder: 'کد پستی هلند (مثال: 1231FZ13XHS)', hint: 'شاخص مشتری Klantindex در سامانه پستی هلند' },
      { id: 'koreapost', name: 'Korean Postal (پست کره جنوبی)', bcid: 'code128', defaultText: '123-456', placeholder: 'کد پستی 6 رقمی کره (مثال: 123-456)', hint: 'بارکد رسمی خطی توزیع نامه‌های شرکت پست کره جنوبی' },
      { id: 'planet', name: 'Planet Code 12 (رهگیری مکانیزه پست آمریکا)', bcid: 'planet', defaultText: '12345678901', placeholder: '11 یا 13 رقم (مثال: 12345678901)', hint: 'سامانه ردیابی و اعتبارسنجی آنلاین مرسولات USPS' },
      { id: 'royalmail', name: 'Royal Mail 4-State (پست سلطنتی بریتانیا)', bcid: 'royalmail', defaultText: 'LE28HS9Z', placeholder: 'کد پستی انگلستان (مثال: LE28HS9Z)', hint: 'کدگذاری 4 حالته RM4SCC جهت پردازش خودکار پاکت نامه‌ها' },
      { id: 'mailmark', name: 'Royal Mail Mailmark 4-State (سیستم نوین میل‌مارک)', bcid: 'mailmark', defaultText: 'JGB 012100123412345678AB19XY1A 0             www.xyz.com', placeholder: 'فرمت استاندارد میل‌مارک (مثال: JGB 012100123412345678AB19XY1A 0             www.xyz.com)', hint: 'جدیدترین سیستم رهگیری هوشمند مرسولات پستی بریتانیا' },
      { id: 'mailmark2d_postal', name: 'Royal Mail Mailmark 2D (کد دوبعدی میل‌مارک)', bcid: 'datamatrix', defaultText: 'JGB 012100123412345678AB19XY1A 0', placeholder: 'اطلاعات میل‌مارک دوبعدی (مثال: JGB 012100123412345678AB19XY1A 0)', hint: 'کد دیتاماتریکس با گنجایش اطلاعاتی بالا برای پاکت‌های تجاری' },
      { id: 'postnet5', name: 'USPS PostNet 5 (زیپ‌کد 5 رقمی آمریکا)', bcid: 'postnet', defaultText: '12345', placeholder: '5 رقم زیپ‌کد (مثال: 90210)', hint: 'کد میله‌ای کلاسیک هدایت نامه‌ها به منطقه پستی' },
      { id: 'postnet9', name: 'USPS PostNet 9 (زیپ‌کد 9 رقمی آمریکا)', bcid: 'postnet', defaultText: '123456789', placeholder: '9 رقم زیپ‌کد (مثال: 123456789)', hint: 'کد ZIP+4 جهت مسیریابی دقیق‌تر بلوک شهری' },
      { id: 'postnet11', name: 'USPS PostNet 11 (کد تحویل نهایی پستی)', bcid: 'postnet', defaultText: '12345678901', placeholder: '11 رقم نقطه تحویل (مثال: 12345678901)', hint: 'کد Delivery Point Barcode برای تفکیک تا سطح پلاک ساختمان' },
      { id: 'onecode', name: 'USPS IM Package (پکیج هوشمند Intelligent Mail)', bcid: 'onecode', defaultText: '0123456709498765432101234567891', placeholder: '31 رقم استاندارد IMb (مثال: 0123456709498765432101234567891)', hint: 'یکپارچه‌ترین بارکد اداره پست ایالات متحده آمریکا' },
      { id: 'upus10', name: 'UPU S10 (اتحادیه جهانی پست)', bcid: 'code128', defaultText: 'RA123456789US', placeholder: 'شناسه 13 کاراکتری پستی (مثال: RA123456789US)', hint: 'استاندارد بین‌المللی مرسولات سفارشی، امانات و پست پیشتاز' },
    ],
  },

  // 3. EAN / UPC (9 items)
  {
    id: 'ean_upc',
    title: '3. EAN / UPC (خرده‌فروشی و کالا)',
    subtypes: [
      { id: 'ean8', name: 'EAN-8 (محصولات کوچک)', bcid: 'ean8', defaultText: '95200002', placeholder: '7 یا 8 رقم کالا (مثال: 95200002)', hint: 'مخصوص اقلام و بسته‌های بسیار فشرده سوپرمارکتی' },
      { id: 'ean13', name: 'EAN-13 (بارکد استاندارد کالا)', bcid: 'ean13', defaultText: '9520123456788', placeholder: '12 یا 13 رقم کالا (مثال: 9520123456788)', hint: 'رایج‌ترین بارکد تجاری جهان برای ثبت در پایانه فروشگاه' },
      { id: 'ean14', name: 'EAN-14 / GS1-128 (کارتن‌های عمده)', bcid: 'ean14', defaultText: '(01) 0 952 8765 43210 8', placeholder: 'کد 14 رقمی کارتن با پرانتز (مثال: (01) 0 952 8765 43210 8)', hint: 'شناسایی بسته‌های مادر، کارتن‌های صادراتی و پالت‌ها' },
      { id: 'ean8composite', name: 'EAN-8 Composite (ترکیبی دو مؤلفه‌ای EAN-8)', bcid: 'ean8composite', defaultText: '95200002|(21)A12345678', placeholder: 'کد EAN-8 به همراه مؤلفه دو بعدی با خط عمودی (مثال: 95200002|(21)A12345678)', hint: 'ترکیب بارکد خطی با میکروپی‌دی‌اف برای اطلاعات تکمیلی' },
      { id: 'ean13composite', name: 'EAN-13 Composite (ترکیبی دو مؤلفه‌ای EAN-13)', bcid: 'ean13composite', defaultText: '9520123456788|(99)1234-abcd', placeholder: 'کد EAN-13 به همراه مؤلفه دو بعدی (مثال: 9520123456788|(99)1234-abcd)', hint: 'افزودن شماره لات یا انقضا در بالای بارکد کالا' },
      { id: 'upca', name: 'UPC-A (استاندارد آمریکا و کانادا)', bcid: 'upca', defaultText: '012345000058', placeholder: '11 یا 12 رقم کالا (مثال: 012345000058)', hint: 'سیستم استاندارد بارکد فروشگاهی آمریکای شمالی' },
      { id: 'upce', name: 'UPC-E (نسخه فشرده 8 رقمی UPC)', bcid: 'upce', defaultText: '01234558', placeholder: '6 تا 8 رقم کالا (مثال: 01234558)', hint: 'نسخه بدون صفرهای مازاد UPC-A برای قوطی‌ها' },
      { id: 'upcacomposite', name: 'UPC-A Composite (ترکیبی دو مؤلفه‌ای UPC-A)', bcid: 'upcacomposite', defaultText: '012345000058|(99)1234-abcd', placeholder: 'کد UPC-A با مؤلفه دوبعدی (مثال: 012345000058|(99)1234-abcd)', hint: 'بارکد کالای آمریکایی به همراه اطلاعات تکمیلی انبارداری' },
      { id: 'upcecomposite', name: 'UPC-E Composite (ترکیبی دو مؤلفه‌ای UPC-E)', bcid: 'upcecomposite', defaultText: '01234558|(15)021231', placeholder: 'کد UPC-E با مؤلفه دوبعدی (مثال: 01234558|(15)021231)', hint: 'نسخه فشرده ترکیبی کالاهای بازار آمریکا' },
    ],
  },

  // 4. 2D Codes (14 items)
  {
    id: '2d',
    title: '4. 2D Codes (کدهای دوبعدی)',
    subtypes: [
      { id: 'qrcode', name: 'QR Code (کد پاسخ سریع استاندارد)', bcid: 'qrcode', defaultText: 'https://aryalink.com', placeholder: 'لینک وب‌سایت یا متن (مثال: https://aryalink.com)', hint: 'کد مربعی چندمنظوره با قابلیت اسکن 360 درجه' },
      { id: 'qrcode_mobile_2d', name: 'QR Code (Mobile) (بهینه برای موبایل)', bcid: 'qrcode', defaultText: 'https://aryalink.com', placeholder: 'آدرس اینترنتی یا پیام (مثال: https://aryalink.com)', hint: 'تنظیمات سبک و سریع برای دوربین گوشی‌های هوشمند' },
      { id: 'datamatrix', name: 'Data Matrix (صنعتی و الکترونیک)', bcid: 'datamatrix', defaultText: 'https://aryalink.com', placeholder: 'متن، عدد یا آدرس (مثال: https://aryalink.com)', hint: 'کد دوبعدی فشرده برای قطعات فلزی، بردهای الکترونیکی و دارو' },
      { id: 'azteccode', name: 'Aztec (بلیت قطار و پرواز)', bcid: 'azteccode', defaultText: 'AryaLink Ticket 2026', placeholder: 'مشخصات بلیت یا بارکد مسافرتی (مثال: AryaLink Ticket 2026)', hint: 'کد مرکزی مربعی بدون نیاز به حاشیه سفید خالی' },
      { id: 'codablockf', name: 'Codablock-F (بارکد چندطبقه بر پایه کد 128)', bcid: 'codablockf', defaultText: 'AryaLink Codablock', placeholder: 'متن یا ارقام (مثال: AryaLink Codablock)', hint: 'بلوک دوبعدی پشته‌ای با امنیت رمزگذاری بالا' },
      { id: 'maxicode', name: 'MaxiCode (بسته‌بندی پستی UPS)', bcid: 'maxicode', defaultText: '996152382802840001', placeholder: 'کد پستی و شماره پیگیری بسته (مثال: 996152382802840001)', hint: 'کد شش‌ضلعی با چشم هدف در مرکز مخصوص اسکنر خطوط پرسرعت' },
      { id: 'micropdf417', name: 'MicroPDF417 (کد مینیاتوری چندخطی)', bcid: 'micropdf417', defaultText: 'Micro1234', placeholder: 'متن کوتاه فشرده (مثال: Micro1234)', hint: 'نسخه جمع‌وجور PDF417 برای قطعات با عرض محدود' },
      { id: 'pdf417', name: 'PDF417 (کارت‌های ملی و مدارک هویتی)', bcid: 'pdf417', defaultText: 'AryaLink ID Card Verification', placeholder: 'اطلاعات هویتی و پرسنلی متنی (مثال: AryaLink ID Card Verification)', hint: 'بارکد مدارک دولتی، کارت پرواز و گواهینامه‌ها' },
      { id: 'microqrcode', name: 'Micro QR Code (کیوآر کد مینیاتوری)', bcid: 'microqrcode', defaultText: '12345', placeholder: 'متن یا عدد کوتاه (مثال: 12345)', hint: 'کیوآر کد تک‌نشانگر با ابعاد بسیار ریز' },
      { id: 'hanxin', name: 'Han Xin (کد ملی چین)', bcid: 'hanxin', defaultText: 'This is Han Xin', placeholder: 'متن یا حروف (مثال: This is Han Xin)', hint: 'کد دوبعدی بهینه‌شده برای الفبای چینی و کاراکترهای یونیکد' },
      { id: 'dotcode', name: 'DotCode (چاپ پرسرعت صنعتی)', bcid: 'dotcode', defaultText: 'DotCode-2026', placeholder: 'متن یا شناسه محصول (مثال: DotCode-2026)', hint: 'چاپگرهای جوهرافشان لیزری سریع روی تنباکو، سیگار و دارو' },
      { id: 'mailmark2d', name: 'Royal Mail Mailmark 2D (کد پستی انگلستان)', bcid: 'datamatrix', defaultText: 'JGB 012100123412345678AB19XY1A 0', placeholder: 'اطلاعات پاکت پستی (مثال: JGB 012100123412345678AB19XY1A 0)', hint: 'استاندارد پست سلطنتی انگلستان در قالب دیتاماتریکس' },
      { id: 'ntin_code', name: 'NTIN Code (کد ملی دارویی کالا)', bcid: 'gs1datamatrix', defaultText: '(01)09521234543213(21)12345', placeholder: 'شناسه ملی کالا و شماره سریال (مثال: (01)09521234543213(21)12345)', hint: 'شناسایی و ردیابی فرآورده‌های بهداشتی و دارویی' },
      { id: 'ppn_code', name: 'PPN Code (شناسه داروخانه‌ای PPN)', bcid: 'code128', defaultText: '(9N)1234567890(1T)LOT123', placeholder: 'شماره ثبت PPN و لات نامبر (مثال: (9N)1234567890(1T)LOT123)', hint: 'Pharmacy Product Number اروپا جهت ثبت اصالت دارو' },
    ],
  },

  // 5. GS1 DataBar (13 items)
  {
    id: 'gs1_databar',
    title: '5. GS1 DataBar (زنجیره تأمین)',
    subtypes: [
      { id: 'databaromni', name: 'GS1-DataBar (چندجهته فروشگاهی)', bcid: 'databaromni', defaultText: '(01)09521234543213', placeholder: 'کد GTIN با پیش‌شماره (مثال: (01)09521234543213)', hint: 'قابل خواندن توسط اسکنرهای صندوق فروشگاه' },
      { id: 'databarstacked', name: 'GS1-DataBar Stacked (دوطبقه فشرده)', bcid: 'databarstacked', defaultText: '(01)09521234543213', placeholder: 'فرمت (01) و ارقام GTIN (مثال: (01)09521234543213)', hint: 'مناسب میوه، سبزیجات و کالاهای فله‌ای' },
      { id: 'databarstackedomni', name: 'GS1-DataBar Stacked Omni (چندجهته دوطبقه)', bcid: 'databarstackedomni', defaultText: '(01)24012345678905', placeholder: 'کد GTIN با ارقام معتبر (مثال: (01)24012345678905)', hint: 'ترکیب خوانایی چندجهته با ابعاد فشرده دوطبقه' },
      { id: 'databarlimited', name: 'GS1-DataBar Limited (محدود دارویی)', bcid: 'databarlimited', defaultText: '(01)15012345678907', placeholder: 'کد با ارقام آغازین 0 یا 1 (مثال: (01)15012345678907)', hint: 'مخصوص اقلام پزشکی بسیار باریک' },
      { id: 'databarexpanded', name: 'GS1-DataBar Expanded (توسعه‌یافته با وزن و قیمت)', bcid: 'databarexpanded', defaultText: '(01)09521234543213(3103)000123', placeholder: 'شناسه محصول و مشخصات وزن یا قیمت (مثال: (01)09521234543213(3103)000123)', hint: 'امکان ثبت تاریخ انقضا و وزن روی بسته‌بندی گوشت و مواد تازه' },
      { id: 'databarexpandedstacked', name: 'GS1-DataBar Expanded Stacked (دوطبقه توسعه‌یافته)', bcid: 'databarexpandedstacked', defaultText: '(01)09521234543213(3103)000123', placeholder: 'کد توسعه‌یافته دوطبقه (مثال: (01)09521234543213(3103)000123)', hint: 'نسخه چندسطحی برای برچسب‌های کم‌عرض' },
      { id: 'gs1-128composite', name: 'GS1-128 Composite (ترکیبی GS1-128)', bcid: 'gs1-128composite', defaultText: '(00)095287654321012346|(02)09521234543213(37)24(10)1234567ABCDEFG', placeholder: 'کد خطی و کامپوننت با خط عمودی (مثال: (00)...|(02)...)', hint: 'ترکیب کد 128 با بخش دوبعدی برای پالت و لجستیک کالا' },
      { id: 'databaromnicomposite', name: 'GS1-DataBar Composite (ترکیبی چندجهته)', bcid: 'databaromnicomposite', defaultText: '(01)09521234543213|(11)990102', placeholder: 'کد دیتا بار به همراه مؤلفه دوم (مثال: (01)09521234543213|(11)990102)', hint: 'بارکد فروشگاهی دو مؤلفه‌ای برای اقلام حساس' },
      { id: 'databarstackedcomposite', name: 'GS1-DataBar Stacked Composite (ترکیبی دوطبقه)', bcid: 'databarstackedcomposite', defaultText: '(01)09521234543213|(17)010200', placeholder: 'کد با مؤلفه دوم (مثال: (01)09521234543213|(17)010200)', hint: 'نسخه ترکیبی برای بسته‌های فشرده' },
      { id: 'databarstackedomnicomposite', name: 'GS1-DataBar Stacked Omni Composite (ترکیبی چندجهته دوطبقه)', bcid: 'databarstackedomnicomposite', defaultText: '(01)03612345678904|(11)990102', placeholder: 'کد ترکیبی (مثال: (01)03612345678904|(11)990102)', hint: 'اسکن سریع و همه جهته در صندوق با اطلاعات تاریخ' },
      { id: 'databarlimitedcomposite', name: 'GS1-DataBar Limited Composite (ترکیبی محدود)', bcid: 'databarlimitedcomposite', defaultText: '(01)09521234543213|(21)abcdefghijklmnopqrst', placeholder: 'کد ترکیبی (مثال: (01)09521234543213|(21)abcdefghijklmnopqrst)', hint: 'مخصوص اقلام پزشکی با سریال طولانی' },
      { id: 'databarexpandedcomposite', name: 'GS1-DataBar Expanded Composite (ترکیبی توسعه‌یافته)', bcid: 'databarexpandedcomposite', defaultText: '(01)09521234543213(3103)001234|(91)1A2B3C4D5E', placeholder: 'کد گسترش‌یافته ترکیبی (مثال: (01)09521234543213(3103)001234|(91)1A2B3C4D5E)', hint: 'ثبت جامع وزن، بچ و تاریخ در زنجیره تأمین سرد' },
      { id: 'databarexpandedstackedcomposite', name: 'GS1-DataBar Expanded Stacked Composite (ترکیبی چندبخشی)', bcid: 'databarexpandedstackedcomposite', defaultText: '(01)09521234543213(10)ABCDEF|(21)12345678', placeholder: 'کد چندبخشی ترکیبی (مثال: (01)09521234543213(10)ABCDEF|(21)12345678)', hint: 'بیشترین ظرفیت اطلاعاتی در حداقل عرض برچسب' },
    ],
  },

  // 6. GS1 2D Barcodes (4 items)
  {
    id: 'gs1_2d',
    title: '6. GS1 2D Barcodes (ردیابی و اصالت کالا)',
    subtypes: [
      { id: 'gs1qrcode', name: 'GS1 QR Code (استاندارد جهانی GS1 در بستر QR)', bcid: 'gs1qrcode', defaultText: '(01)09521234543213(8200)https://aryalink.com', placeholder: 'شناسه GTIN و آدرس وب (مثال: (01)09521234543213(8200)https://aryalink.com)', hint: 'پل ارتباطی مصرف‌کننده و اصالت کالا در نسل جدید بسته‌بندی‌ها' },
      { id: 'gs1datamatrix', name: 'GS1 DataMatrix (ردیابی و اصالت کالا و دارو)', bcid: 'gs1datamatrix', defaultText: '(01)09521234543213(17)261231(10)LOT123', placeholder: 'کد تجاری، تاریخ انقضا و شماره لات (مثال: (01)09521234543213(17)261231(10)LOT123)', hint: 'الزامی برای طرح ردیابی، رهگیری و کنترل اصالت دارو و تجهیزات پزشکی' },
      { id: 'gs1dlqrcode', name: 'GS1 Digital Link QR code (دیجیتال لینک QR)', bcid: 'gs1dlqrcode', defaultText: 'HTTPS://ID.GS1.ORG/01/09521234543213/22/ABC%2D123?99=XYZ-987', placeholder: 'آدرس اینترنتی رسمی GS1 Digital Link (مثال: HTTPS://ID.GS1.ORG/01/...)', hint: 'اتصال هوشمند خریدار به وب‌سایت، دفترچه راهنما و اطلاعات اصالت کالا' },
      { id: 'gs1dldatamatrix', name: 'GS1 Digital Link Data Matrix (دیجیتال لینک صنعتی)', bcid: 'gs1dldatamatrix', defaultText: 'https://id.gs1.org/01/09521234543213/22/ABC%2D123?99=XYZ-987', placeholder: 'آدرس استاندارد Digital Link در دیتاماتریکس (مثال: https://id.gs1.org/...)', hint: 'دیجیتال لینک بر پایه دیتاماتریکس برای خطوط تولید صنعتی' },
    ],
  },

  // 7. Banking and Payments (9 items)
  {
    id: 'banking',
    title: '7. Banking and Payments (بانکی و پرداخت)',
    subtypes: [
      { id: 'epcqr', name: 'EPC QR Code V2 (پرداخت شتابی یورو SEPA)', bcid: 'qrcode', defaultText: 'BCD\n002\n1\nSCT\nCH2400000000000000000\nAryaLink GmbH\nEUR120.00\n\n\nInvoice 2026', placeholder: 'اطلاعات حساب شتابی یورو (مثال: BCD 002 SCT)', hint: 'انتقال وجه و پرداخت آنی بانکی در اتحادیه اروپا' },
      { id: 'swissqr_noref_23', name: 'Swiss QR (No Reference 2.3)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFNON^CR^LF^CR^LFEPD', placeholder: 'فیش بدون مرجع سوئیس (مثال: SPC 0200 CHF)', hint: 'فیش بانکی و صورتحساب رسمی سوئیس بدون کد ارجاع' },
      { id: 'swissqr_credref_23', name: 'Swiss QR (Creditor Ref 2.3)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFSCOR^CR^LFRF18539007547034^CR^LFEPD', placeholder: 'فیش با مرجع بستانکار (مثال: SCOR RF1853)', hint: 'فیش بانکی سوئیس با شناسه مرجع استاندارد ISO 11649' },
      { id: 'swissqr_qrref_23', name: 'Swiss QR (QR Ref 2.3)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFQRR^CR^LF210000000003139471430009017^CR^LFEPD', placeholder: 'فیش با شناسه ارجاع (مثال: QRR 2100000)', hint: 'شناسه 27 رقمی اختصاصی پرداخت صورتحساب در سیستم بانکی سوئیس' },
      { id: 'swissqr_noref_22', name: 'Swiss QR (No Reference 2.2)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFNON^CR^LF^CR^LFEPD', placeholder: 'فیش بدون مرجع نسخه 2.2 (مثال: SPC 0200)', hint: 'نسخه استاندارد 2.2 صورتحساب‌های الکترونیکی سوئیس' },
      { id: 'swissqr_credref_22', name: 'Swiss QR (Creditor Ref 2.2)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFSCOR^CR^LFRF18539007547034^CR^LFEPD', placeholder: 'فیش با مرجع بستانکار نسخه 2.2 (مثال: SCOR RF18)', hint: 'صورتحساب با کد شناسایی بستانکار در نسخه 2.2' },
      { id: 'swissqr_qrref_22', name: 'Swiss QR (QR Ref 2.2)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0200^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFQRR^CR^LF210000000003139471430009017^CR^LFEPD', placeholder: 'فیش با ارجاع نسخه 2.2 (مثال: QRR 21000)', hint: 'صورتحساب QR-Bill سازگار با نسخه‌های قبلی سیستم بانکی' },
      { id: 'swissqr_v1', name: 'Swiss QR v.1.0 (استاندارد اولیه فاکتور سوئیس)', bcid: 'swissqrcode', defaultText: 'SPC^CR^LF0100^CR^LF1^CR^LFCH5800791123000889012^CR^LFS^CR^LFRobert Schneider AG^CR^LFRue du Lac^CR^LF1268^CR^LF2501^CR^LFBiel^CR^LFCH^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF^CR^LF199.95^CR^LFCHF^CR^LFK^CR^LFPia-Maria Rutschmann-Schnyder^CR^LFGrosse Marktgasse 28^CR^LF9400 Rorschach^CR^LF^CR^LF^CR^LFCH^CR^LFNON^CR^LF^CR^LFEPD', placeholder: 'فیش نسخه اول سوئیس (مثال: SPC 0100)', hint: 'نسخه نسل اول فیش‌های بانکی هوشمند سوئیس' },
      { id: 'zatca', name: 'ZATCA QR Code (صورتحساب الکترونیکی مالیاتی)', bcid: 'qrcode', defaultText: 'AryaLink - Invoice: 2026-001 - VAT: 300000000000003 - Total: 1500.00', placeholder: 'فاکتور مالیاتی زکات (مثال: AryaLink - VAT: 300000000000003)', hint: 'استاندارد فاکتورهای الکترونیکی سازمان امور مالیاتی خاورمیانه' },
    ],
  },

  // 8. Healthcare Codes (24 items)
  {
    id: 'healthcare',
    title: '8. Healthcare Codes (تجهیزات پزشکی و دارو)',
    subtypes: [
      { id: 'code32', name: 'Code32 (کد دارویی ملی ایتالیا)', bcid: 'code32', defaultText: '01234567', placeholder: '8 یا 9 رقم دارویی (مثال: 01234567)', hint: 'Italian Pharmacode (Radix-32) داروخانه‌های ایتالیا' },
      { id: 'flattermarken_health', name: 'Flattermarken (برش و علامت‌گذاری جعبه دارو)', bcid: 'flattermarken', defaultText: '12345', placeholder: 'ارقام علامت‌گذاری (مثال: 12345)', hint: 'علامت‌های کنترل خط تولید و بسته‌بندی دارو' },
      { id: 'hibc_lic_128', name: 'HIBC LIC 128 (سازنده اولیه در کد 128)', bcid: 'hibccode128', defaultText: '+A999BJC5D6E71', placeholder: 'شناسه سازنده با علامت + (مثال: +A999BJC5D6E71)', hint: 'استاندارد بین‌المللی تجهیزات پزشکی Labeler Identification Code' },
      { id: 'hibc_lic_39', name: 'HIBC LIC 39 (سازنده اولیه در کد 39)', bcid: 'hibccode39', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'شناسه تجهیزات پزشکی در قالب خطی کد 39' },
      { id: 'hibc_lic_aztec', name: 'HIBC LIC Aztec (سازنده در Aztec)', bcid: 'hibcazteccode', defaultText: '+A999BJC5D6E71', placeholder: 'کد HIBC در Aztec (مثال: +A999BJC5D6E71)', hint: 'کدگذاری تجهیزات پزشکی در بارکد دوبعدی آزتک' },
      { id: 'hibc_lic_codablockf', name: 'HIBC LIC Codablock-F (سازنده در Codablock-F)', bcid: 'hibccodablockf', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'کدگذاری پشته‌ای تجهیزات پزشکی و آزمایشگاهی' },
      { id: 'hibc_lic_datamatrix', name: 'HIBC LIC Data Matrix (سازنده در دیتاماتریکس)', bcid: 'hibcdatamatrix', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'کد دو بعدی دائمی حک‌شده روی ابزارهای جراحی و فلزی' },
      { id: 'hibc_lic_micropdf', name: 'HIBC LIC Micro PDF 417 (سازنده در MicroPDF417)', bcid: 'hibcmicropdf417', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'مخصوص قطعات پزشکی و سرنگ‌های با ابعاد بسیار باریک' },
      { id: 'hibc_lic_pdf417', name: 'HIBC LIC PDF417 (سازنده در PDF417)', bcid: 'hibcpdf417', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'کد چندخطی برچسب کارتن‌های تجهیزات بیمارستانی' },
      { id: 'hibc_lic_qrcode', name: 'HIBC LIC QR-Code (سازنده در QR Code)', bcid: 'hibcqrcode', defaultText: '+A999BJC5D6E71', placeholder: 'کد با علامت + (مثال: +A999BJC5D6E71)', hint: 'شناسایی و ردیابی تجهیزات پزشکی با دوربین گوشی' },
      { id: 'hibc_pas_128', name: 'HIBC PAS 128 (شناسه ثانویه در کد 128)', bcid: 'hibccode128', defaultText: '+$$7123456789012', placeholder: 'شناسه ثانویه با علامت +$$ (مثال: +$$7123456789012)', hint: 'HIBC Provider Applications Standard برای تاریخ و سری ساخت' },
      { id: 'hibc_pas_39', name: 'HIBC PAS 39 (شناسه ثانویه در کد 39)', bcid: 'hibccode39', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'ثبت لات نامبر و تاریخ انقضا در قالب خطی کد 39' },
      { id: 'hibc_pas_aztec', name: 'HIBC PAS Aztec (شناسه ثانویه در Aztec)', bcid: 'hibcazteccode', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'شناسه ثانویه دارویی در بارکد آزتک' },
      { id: 'hibc_pas_codablockf', name: 'HIBC PAS Codablock-F (شناسه ثانویه در Codablock-F)', bcid: 'hibccodablockf', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'کدگذاری ترکیبی اطلاعات انقضا و لات نامبر' },
      { id: 'hibc_pas_datamatrix', name: 'HIBC PAS Data Matrix (شناسه ثانویه در دیتاماتریکس)', bcid: 'hibcdatamatrix', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'شناسه تکمیلی ماندگار روی ابزارهای پزشکی' },
      { id: 'hibc_pas_micropdf', name: 'HIBC PAS Micro PDF417 (شناسه ثانویه در MicroPDF417)', bcid: 'hibcmicropdf417', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'اطلاعات انقضا و سریال در ابعاد مینیاتوری' },
      { id: 'hibc_pas_pdf417', name: 'HIBC PAS PDF417 (شناسه ثانویه در PDF417)', bcid: 'hibcpdf417', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'برچسب اطلاعات تکمیلی بسته‌بندی تجهیزات بالینی' },
      { id: 'hibc_pas_qrcode', name: 'HIBC PAS QR-Code (شناسه ثانویه در QR Code)', bcid: 'hibcqrcode', defaultText: '+$$7123456789012', placeholder: 'کد با پیش‌شماره +$$ (مثال: +$$7123456789012)', hint: 'اسکن سریع تاریخ و بچ نامبر پزشکی با گوشی' },
      { id: 'ntin_health', name: 'NTIN (کد شناسه ملی کالای تجاری)', bcid: 'gs1datamatrix', defaultText: '(01)09521234543213(21)12345', placeholder: 'شناسه GTIN به همراه سریال (مثال: (01)09521234543213(21)12345)', hint: 'National Trade Item Number در بخش سلامت و دارو' },
      { id: 'pharmacode_one_health', name: 'Pharmacode One-Track (کنترل تک‌خط دارو)', bcid: 'pharmacode', defaultText: '117480', placeholder: 'عدد دارویی بین 3 تا 131070 (مثال: 117480)', hint: 'کنترل بسته‌بندی جعبه دارو در خطوط مونتاژ داروسازی' },
      { id: 'pharmacode_two_health', name: 'Pharmacode Two-Track (کنترل دوخط دارو)', bcid: 'pharmacode2', defaultText: '117480', placeholder: 'عدد دارویی دوخطی (مثال: 117480)', hint: 'کنترل دوطرفه خط چاپ در کارخانجات دارو' },
      { id: 'ppn_health', name: 'PPN (شناسه ملی داروخانه‌های اروپا)', bcid: 'code128', defaultText: '(9N)1234567890(1T)LOT123', placeholder: 'کد PPN به همراه شناسه بچ (مثال: (9N)1234567890(1T)LOT123)', hint: 'سیستم اعتبارسنجی داروها در داروخانه‌های سراسر اتحادیه اروپا' },
      { id: 'pzn7', name: 'PZN7 (شناسه 6 یا 7 رقمی داروخانه‌های آلمان)', bcid: 'pzn', defaultText: '123456', placeholder: '6 یا 7 رقم دارویی (مثال: 123456)', hint: 'Pharmazentralnummer کد ملی محصولات دارویی در آلمان' },
      { id: 'pzn8', name: 'PZN8 (شناسه 8 رقمی سراسری داروخانه‌های آلمان)', bcid: 'pzn', defaultText: '12345678', placeholder: '8 رقم دارویی (مثال: 12345678)', hint: 'نسخه ارتقایافته PZN با 8 رقم برای تمامی اقلام درمانی آلمان' },
    ],
  },

  // 9. Mobile Tagging (3 items)
  {
    id: 'mobile_tagging',
    title: '9. Mobile Tagging (اسکن موبایل)',
    subtypes: [
      { id: 'qr_mobile_tag', name: 'QR Code (کد پاسخ سریع دوربین موبایل)', bcid: 'qrcode', defaultText: 'https://aryalink.com', placeholder: 'لینک اینترنتی یا متن (مثال: https://aryalink.com)', hint: 'اسکن سریع و فوری با کلیه دوربین‌های گوشی هوشمند' },
      { id: 'dm_mobile_tag', name: 'Data Matrix (تگ دوبعدی کم‌حجم موبایل)', bcid: 'datamatrix', defaultText: 'https://aryalink.com/app', placeholder: 'آدرس کوتاه یا کد اختصاصی (مثال: https://aryalink.com/app)', hint: 'چگالی بالا با ابعاد مینیاتوری مناسب کدهای اسکن اپلیکیشن' },
      { id: 'aztec_mobile_tag', name: 'Aztec (کد بدون حاشیه امن مخصوص صفحه نمایش)', bcid: 'azteccode', defaultText: 'MOBILE-TAG-2026', placeholder: 'شناسه یا کوپن تخفیف (مثال: MOBILE-TAG-2026)', hint: 'عملکرد ایده‌آل برای نمایش روی اسکرین گوشی‌ها' },
    ],
  },

  // 10. ISBN Codes (5 items)
  {
    id: 'isbn_codes',
    title: '10. ISBN Codes (شابک، نشر و کتاب)',
    subtypes: [
      { id: 'isbn13', name: 'ISBN 13 (شابک بین‌المللی کتاب)', bcid: 'isbn', defaultText: '978-1-56581-231-4', placeholder: 'شابک 13 رقمی با خط تیره (مثال: 978-1-56581-231-4)', hint: 'کد استاندارد بین‌المللی ناشران برای ثبت کتاب' },
      { id: 'isbn13_5', name: 'ISBN 13 + 5 Digits (شابک با بارکد قیمت 5 رقمی)', bcid: 'isbn', defaultText: '978-1-56581-231-4 90000', placeholder: 'شابک با کد قیمت 5 رقمی (مثال: 978-1-56581-231-4 90000)', hint: 'بارکد کتاب به همراه قیمت چاپی پشت جلد در کتاب‌فروشی‌ها' },
      { id: 'ismn_code', name: 'ISMN (شماره استاندارد قطعات و نت‌های موسیقی)', bcid: 'ismn', defaultText: '979-0-2605-3211-3', placeholder: 'شناسه با پیشوند 979-0 (مثال: 979-0-2605-3211-3)', hint: 'کد استاندارد بین‌المللی ناشران موسیقی و پارتیتورها' },
      { id: 'issn_code', name: 'ISSN (شاپا نشریات و مجلات ادواری)', bcid: 'issn', defaultText: '0311-175X', placeholder: '8 کاراکتر با خط تیره (مثال: 0311-175X)', hint: 'شناسه اختصاصی روزنامه‌ها، مجلات و نشریات دانشگاهی' },
      { id: 'issn_2', name: 'ISSN + 2 Digits (شاپا همراه با کد شماره چاپ 2 رقمی)', bcid: 'issn', defaultText: '0311-175X 00', placeholder: 'شاپا به همراه شماره دوره 2 رقمی (مثال: 0311-175X 00)', hint: 'درج شماره چاپ یا فصلنامه در کنار بارکد نشریه' },
    ],
  },

  // 11. Business Cards (4 items)
  {
    id: 'business_cards',
    title: '11. Business Cards (کارت ویزیت الکترونیک)',
    subtypes: [
      { id: 'vcard_qr', name: 'QR Code vCard (کارت مخاطب استاندارد 3.0)', bcid: 'qrcode', defaultText: 'VCARD', placeholder: 'کارت ویزیت الکترونیک (مثال: BEGIN:VCARD)', hint: 'ذخیره فوری شماره تماس، ایمیل و شرکت در دفترچه تلفن گوشی' },
      { id: 'vcard_dm', name: 'Data Matrix vCard (کارت ویزیت صنعتی)', bcid: 'datamatrix', defaultText: 'VCARD', placeholder: 'کارت ویزیت دیتاماتریکس (مثال: BEGIN:VCARD)', hint: 'فرمت دیتاماتریکس برای کارت‌های ویزیت فلزی یا پرسنلی' },
      { id: 'mecard_qr', name: 'QR Code MeCard (کارت ویزیت سبک MeCard)', bcid: 'qrcode', defaultText: 'MECARD', placeholder: 'کارت فشرده MeCard (مثال: MECARD:N:AryaLink)', hint: 'فرمت فشرده و کم‌حجم برای اسکن سریع‌تر در گوشی‌های همراه' },
      { id: 'mecard_dm', name: 'Data Matrix MeCard (کارت ویزیت دیتاماتریکس MeCard)', bcid: 'datamatrix', defaultText: 'MECARD', placeholder: 'کارت سبک دیتاماتریکس (مثال: MECARD:N:AryaLink)', hint: 'نسخه مینیاتوری کارت ویزیت در فرمت صنعتی دیتاماتریکس' },
    ],
  },

  // 12. Event Barcodes (2 items)
  {
    id: 'event_barcodes',
    title: '12. Event Barcodes (رویداد و تقویم iCal)',
    subtypes: [
      { id: 'event_qr', name: 'QR Code (افزودن مستقیم به تقویم موبایل)', bcid: 'qrcode', defaultText: 'EVENT', placeholder: 'رویداد تقویم (مثال: BEGIN:VCALENDAR)', hint: 'ثبت خودکار جلسه، همایش یا وبینار در تقویم Google و Apple' },
      { id: 'event_dm', name: 'Data Matrix (رویداد در Data Matrix)', bcid: 'datamatrix', defaultText: 'EVENT', placeholder: 'رویداد تقویم دیتاماتریکس (مثال: BEGIN:VCALENDAR)', hint: 'فرمت صنعتی برای بلیت‌های فیزیکی رویدادها و کنفرانس‌ها' },
    ],
  },

  // 13. Wi-Fi Barcodes (2 items)
  {
    id: 'wifi_barcodes',
    title: '13. Wi-Fi Barcodes (اتصال خودکار وای‌فای)',
    subtypes: [
      { id: 'wifi_qr', name: 'QR Code (اتصال خودکار دوربین گوشی به وای‌فای)', bcid: 'qrcode', defaultText: 'WIFI', placeholder: 'مشخصات شبکه وای‌فای (مثال: WIFI:S:AryaLink;T:WPA;P:Secret2026;;)', hint: 'مخاطب تنها با گرفتن دوربین روی کد، بدون تایپ رمز متصل می‌شود' },
      { id: 'wifi_dm', name: 'Data Matrix (اتصال وای‌فای در Data Matrix)', bcid: 'datamatrix', defaultText: 'WIFI', placeholder: 'وای‌فای دیتاماتریکس (مثال: WIFI:S:AryaLink;T:WPA;P:Secret2026;;)', hint: 'اتصال خودکار به شبکه از طریق فرمت صنعتی دیتاماتریکس' },
    ],
  },
];

export const BARCODE_SMART_GUIDES: Record<string, string> = {
  // 1. Linear Codes (12 items)
  code128: "راهنما: یکی از قدرتمندترین بارکدهای خطی با تراکم بالا که از تمام حروف انگلیسی، اعداد و کلیه علائم اسکی پشتیبانی می‌کند. مناسب برای شماره سریال، انبارداری و کاتالوگ محصولات.",
  code11: "راهنما: بارکد خطی متراکم که فقط از ارقام 0 تا 9 و خط تیره (-) پشتیبانی می‌کند. کاربرد اصلی آن در برچسب‌گذاری کابل‌ها و تجهیزات مخابراتی است.",
  interleaved2of5: "راهنما: بارکد عددی فشرده ویژه بسته‌بندی و توزیع صنعتی. طول داده حتماً باید تعداد زوجی از ارقام (مانند 6، 8، 10 یا 14 رقم) باشد؛ در صورت فرد بودن، یک صفر در ابتدا قرار دهید.",
  code39: "راهنما: بارکد خطی کلاسیک صنعتی و نظامی با پشتیبانی از حروف بزرگ انگلیسی (A-Z)، اعداد (0-9) و نمادهای خاص (- . $ / + % و فاصله).",
  code39ext: "راهنما: نسخه کامل کد 39 با پشتیبانی از تمام 128 کاراکتر اسکی شامل حروف کوچک و علائم نگارشی برای کاربردهای اداری و نرم‌افزاری.",
  code93: "راهنما: بارکد خطی با امنیت و فشردگی بالاتر نسبت به کد 39 که با دو رقم کنترلی پیشرفته از تمام کاراکترهای اسکی پشتیبانی می‌کند.",
  flattermarken: "راهنما: بارکد تخصصی کنترل ترتیب صحافی و چاپخانه‌ها؛ فقط شامل ارقام برای اطمینان از قرارگیری صحیح فرم‌های چاپی در کنار یکدیگر.",
  'gs1-128': "راهنما: استاندارد جهانی لجستیک زنجیره تأمین با استفاده از شناسه‌های کاربردی Application Identifiers داخل پرانتز؛ مانند (01) برای شماره قلم تجاری کالا و (10) برای شناسه بچ تولید.",
  msi: "راهنما: بارکد خطی اصلاح‌شده Plessey ویژه انبارداری و برچسب قیمت قفسه فروشگاه‌ها که منحصراً از ارقام 0 تا 9 پشتیبانی می‌کند.",
  pharmacode_one: "راهنما: فارماکد تک‌مسیره استاندارد کنترل بسته‌بندی دارو در خط تولید؛ فقط یک عدد صحیح بین 3 تا 131070 می‌پذیرد و بر اساس ضخامت خطوط خوانده می‌شود.",
  pharmacode_two: "راهنما: فارماکد دوخطه با ضریب امنیت مضاعف برای جعبه‌های دارویی بسیار کوچک؛ یک عدد بین 4 تا 64570080 را کدگذاری می‌کند.",
  telepen: "راهنما: بارکد خطی با ضریب خطای فوق‌العاده ناچیز در انگلستان که تمام کاراکترهای اسکی را بدون نیاز به کدهای شیفت خاص رمزنگاری می‌کند.",

  // 2. Postal Codes (15 items)
  auspost: "راهنما: بارکد پستی 4 حالته استرالیا (Australian Post 4-State) شامل 8 رقم کد پستی به همراه اطلاعات تکمیلی آدرس برای تفکیک خودکار بسته‌ها.",
  daft: "راهنما: کدگذاری 4 حالته عمومی پستی متشکل از حروف D (پایین)، A (بالا)، F (کامل) و T (ردیاب) که شالوده اکثر استانداردهای مرسولات پستی جهان است.",
  dpd: "راهنما: بارکد 14 رقمی اختصاصی رهگیری بسته‌های شرکت بین‌المللی DPD اروپا برای ترانزیت بین‌المللی و گمرک کالا.",
  japanpost: "راهنما: بارکد پستی کشور ژاپن شامل کد پستی 7 رقمی و آدرس خلاصه برای اسکن با سرعت فوق‌العاده بالا در مراکز پستی ژاپن.",
  kix: "راهنما: استاندارد شاخص مشتری (Klantindex) اداره پست هلند و شرکت TNT؛ شامل کد پستی و شماره ساختمان برای هدایت خودکار پاکت‌ها.",
  koreapost: "راهنما: استاندارد رسمی شرکت پست کره جنوبی با کد پستی 6 رقمی و شماره پیگیری جهت توزیع مکانیزه مرسولات.",
  planet: "راهنما: بارکد خطی 11 یا 13 رقمی سازمان پست آمریکا (USPS Planet) جهت تأیید اصالت و رهگیری آنلاین مرسولات تجاری.",
  royalmail: "راهنما: بارکد 4 حالته RM4SCC پست سلطنتی بریتانیا برای هدایت مکانیزه نامه‌ها بر اساس کد پستی و شماره پلاک انگلستان.",
  mailmark: "راهنما: بارکد پستی هوشمند نسل نوین بریتانیا (Royal Mail Mailmark 4-State) با فرمت استاندارد شامل شناسه مشتری و نوع مرسوله.",
  mailmark2d_postal: "راهنما: نگارش دوبعدی دیتاماتریکس استاندارد میل‌مارک بریتانیا با چگالی بالا برای سازمان‌های دولتی و اسناد رسمی.",
  postnet5: "راهنما: بارکد پستی کلاسیک 5 رقمی زیپ‌کد آمریکا (USPS PostNet) برای مسیریابی محموله‌ها به حوزه پستی مقصد.",
  postnet9: "راهنما: بارکد پستی 9 رقمی آمریکا (ZIP+4) برای هدایت مرسوله تا سطح بلوک ساختمانی مشخص.",
  postnet11: "راهنما: بارکد پستی 11 رقمی تحویل نهایی آمریکا (Delivery Point Barcode) که نقطه دقیق تحویل تا شماره واحد را مشخص می‌کند.",
  onecode: "راهنما: بارکد هوشمند یکپارچه آمریکا (USPS Intelligent Mail Barcode) با طول دقیق 31 رقم؛ ترکیب‌کننده تمام خدمات رهگیری، تأیید و توزیع مرسوله.",
  upus10: "راهنما: استاندارد بین‌المللی 13 کاراکتری اتحادیه جهانی پست (UPU S10) برای رهگیری بسته‌های سفارشی و امانات بین کشورها.",

  // 3. EAN / UPC (9 items)
  ean8: "راهنما: نسخه فشرده بارکد کالا برای محصولات کوچک (مانند آدامس و لوازم آرایشی). فقط مجاز به وارد کردن 7 یا 8 رقم هستید و رقم آخر Check Digit است.",
  ean13: "راهنما: این استاندارد جهانی برای محصولات سوپرمارکتی است. شما فقط مجاز به وارد کردن دقیقاً 12 یا 13 کاراکتر عددی هستید (بدون حروف). عدد آخر به عنوان Check Digit محاسبه می‌شود.",
  ean14: "راهنما: بارکد 14 رقمی استاندارد برای کارتن‌های مادر و پالت‌های انبارداری (GTIN-14 با شناسه کاربردی 01) جهت ثبت ورود و خروج عمده کالا.",
  ean8composite: "راهنما: بارکد ترکیبی دو مؤلفه‌ای شامل EAN-8 خطی به همراه یک ماتریس دوبعدی MicroPDF417 در بالا برای ذخیره تاریخ انقضا و شماره سفارش.",
  ean13composite: "راهنما: بارکد ترکیبی تجاری پیشرفته شامل EAN-13 در پایه و مؤلفه دوبعدی در بالا جهت اتصال شماره سریال و بچ تولید به بارکد فروشگاهی.",
  upca: "راهنما: بارکد استاندارد خرده‌فروشی آمریکای شمالی (ایالات متحده و کانادا). طول مجاز دقیقاً 11 یا 12 رقم است و سیستم رقم دوازدهم را به عنوان Check Digit اعتبارسنجی می‌کند.",
  upce: "راهنما: نسخه فشرده 8 رقمی بارکد آمریکایی UPC-A با حذف صفرهای زائد برای کالاهای کوچک در بازار آمریکا و کانادا.",
  upcacomposite: "راهنما: ساختار ترکیبی UPC-A با نماد دوبعدی فوقانی برای درج مشخصات فنی تکمیلی یا سریال ساخت در خرده‌فروشی‌های آمریکای شمالی.",
  upcecomposite: "راهنما: ساختار فشرده ترکیبی UPC-E همراه با نماد دوبعدی برای بسته‌بندی‌های بسیار کوچک بازار آمریکا.",

  // 4. 2D Codes (14 items)
  qrcode: "راهنما: پرکاربردترین بارکد دوبعدی دنیا با قابلیت اسکن سریع با تمام دوربین‌های موبایل. مناسب برای لینک وب‌سایت، شبکه‌های اجتماعی، متن و کارت ویزیت.",
  qrcode_mobile_2d: "راهنما: بارکد کیوآر بهینه‌شده برای اسکن روی صفحه‌نمایش گوشی‌های هوشمند با تصحیح خطای متناسب.",
  datamatrix: "راهنما: بارکد دوبعدی مربعی با ظرفیت دیتای بسیار بالا و اندازه میکروسکوپی. ایده‌آل برای قطعات صنعتی، بردهای الکترونیکی و تجهیزات پزشکی.",
  azteccode: "راهنما: بارکد دوبعدی با چشم مرکزی مربعی شبیه اهرام آزتک. نیازی به حاشیه خالی (Quiet Zone) ندارد و استاندارد بلیت‌های هواپیمایی و راه‌آهن جهان است.",
  codablockf: "راهنما: بارکد دوبعدی پشته‌ای چندردیفه بر پایه Code-128 برای مواردی که بارکدخوان‌های خطی قدیمی لیزری باید حجم بالایی از متن را اسکن کنند.",
  maxicode: "راهنما: بارکد دوبعدی شش‌ضلعی با چشم دایره‌ای مرکزی بول‌سای؛ استاندارد شرکت بین‌المللی حمل‌ونقل سریع UPS برای تفکیک فوق‌سریع بسته‌ها روی تسمه‌نقاله.",
  micropdf417: "راهنما: نسخه بسیار فشرده PDF417 برای فضاهای محدود صنعتی و بسته‌بندی دارو با امکان ذخیره داده‌های ساخت‌یافته.",
  pdf417: "راهنما: بارکد دوبعدی خطی با گنجایش دیتای عظیم تا بیش از 1000 کاراکتر؛ استاندارد رسمی کارت ملی، گواهینامه رانندگی و کارت پرواز خطوط هوایی.",
  microqrcode: "راهنما: نسخه بسیار کوچک کیوآر کد با تنها یک نشانگر موقعیت در گوشه برای قطعات مینیاتوری که کیوآر کد معمولی در آن‌ها جا نمی‌شود.",
  hanxin: "راهنما: استاندارد ملی بارکد دوبعدی کشور چین (Han Xin Code) بهینه‌شده برای ذخیره فونت‌ها و کلمات چینی و دیتاهای متراکم صنعتی.",
  dotcode: "راهنما: بارکد ماتریسی متشکل از نقاط ناپیوسته، طراحی‌شده برای چاپ پرسرعت با چاپگرهای جوهرافشان صنعتی روی خطوط تولید سیگار و نوشیدنی.",
  mailmark2d: "راهنما: کد دیتاماتریکس پستی پیشرفته استاندارد میل‌مارک بریتانیا با چگالی بالا برای سازمان‌های دولتی و فاکتورها.",
  ntin_code: "راهنما: کد ملی ردیابی و شناسه تجارت دارویی NTIN در فرمت استاندارد دوبعدی دیتاماتریکس با شماره ملی و سریال محصول.",
  ppn_code: "راهنما: کد عددی داروخانه‌ای استاندارد اتحادیه اروپا در قالب دیتاماتریکس برای پیشگیری از جعل دارو و تأیید اصالت در مبادی مصرف.",

  // 5. GS1 DataBar (13 items)
  databaromni: "راهنما: بارکد فشرده فروشگاهی استاندارد GS1 DataBar برای برچسب‌گذاری میوه‌ها، گوشت و اقلام کیلویی فاقد بسته‌بندی با شناسه 14 رقمی GTIN.",
  databarstacked: "راهنما: نسخه دوردیفه پشته‌ای GS1 DataBar با عرض باریک برای نصب روی برچسب‌های کوچک میوه و اقلام دارویی.",
  databarstackedomni: "راهنما: نسخه تمام‌جهته دوردیفه GS1 DataBar برای اسکن آسان روی بارکدخوان‌های ثابت میز سوپرمارکت از هر زاویه.",
  databarlimited: "راهنما: استاندارد بارکد محدود برای اقلام پزشکی و ابزارهای کوچک با شناسه رقمی که فقط با ارقام 0 یا 1 آغاز می‌شود.",
  databarexpanded: "راهنما: نسخه گسترش‌یافته GS1 DataBar برای درج هم‌زمان وزن، قیمت، تاریخ انقضا و شماره سریال علاوه بر شناسه کالا.",
  databarexpandedstacked: "راهنما: نسخه پشته‌ای چندطبقه Expanded برای کالاهای دارای تاریخ انقضا و وزن با حفظ ابعاد فشرده برچسب.",
  'gs1-128composite': "راهنما: بارکد خطی GS1-128 با نماد دوبعدی بالای آن جهت ردیابی کامل پالت‌ها و لجستیک چندمرحله‌ای.",
  databaromnicomposite: "راهنما: ترکیب هم‌زمان GS1 DataBar تمام‌جهته با نماد دوبعدی برای ردیابی جامع مشخصات اقلام متغیر.",
  databarstackedcomposite: "راهنما: نسخه ترکیبی دوردیفه با مؤلفه دوبعدی الحاقی برای فرآورده‌های با تاریخ مصرف محدود.",
  databarstackedomnicomposite: "راهنما: بارکد ترکیبی سوپرمارکتی تمام‌جهته با قابلیت اسکن داده‌های تاریخ تولید و قیمت.",
  databarlimitedcomposite: "راهنما: نماد ترکیبی نسخه محدود ویژه بسته‌های درمانی و بیمارستانی کوچک.",
  databarexpandedcomposite: "راهنما: نسخه ترکیبی گسترده تک‌خطی برای ثبت زنجیره تأمین پیچیده مواد پروتئینی و لبنی.",
  databarexpandedstackedcomposite: "راهنما: نسخه ترکیبی پشته‌ای چندردیفه با حداکثر گنجایش اطلاعاتی برای ره‌گیری محموله‌های صادراتی.",

  // 6. GS1 2D Barcodes (4 items)
  gs1qrcode: "راهنما: کیوآر کد سازمانی مطابق استاندارد بین‌المللی GS1 با شناسه‌های کاربردی Application Identifiers (مانند شماره کالا، انقضا و لات).",
  gs1datamatrix: "راهنما: دیتاماتریکس سازمانی استاندارد اجباری جهانی در صنایع دارویی و پزشکی برای سریال‌سازی تک‌تک جعبه‌های دارو.",
  gs1dlqrcode: "راهنما: نسل نوین کیوآر کد دیجیتال لینک GS1 Digital Link که با یک اسکن هم کاربر را به صفحه وب محصول هدایت می‌کند و هم در صندوق فروشگاه خوانده می‌شود.",
  gs1dldatamatrix: "راهنما: دیتاماتریکس دیجیتال لینک برای اتصال مستقیم قطعات صنعتی به پایگاه داده دیجیتال قطعه از طریق وب‌سایت سازنده.",

  // 7. Banking and Payments (9 items)
  epcqr: "راهنما: استاندارد رسمی پرداخت و انتقال وجه آنی یورو (SEPA Credit Transfer) در اتحادیه اروپا بر پایه QR Code با مشخصات IBAN و مبلغ.",
  swissqr_noref_23: "راهنما: نسخه 2.3 صورتحساب بانکی رسمی سوئیس (Swiss QR-Bill) بدون شناسه مرجع برای پرداخت‌های عادی بانکی با ارز CHF یا EUR.",
  swissqr_credref_23: "راهنما: نسخه 2.3 صورتحساب سوئیس با شناسه استاندارد بین‌المللی مرجع بستانکار (SCOR ISO 11649) جهت تسویه اتوماتیک فاکتور.",
  swissqr_qrref_23: "راهنما: نسخه 2.3 فیش بانکی سوئیس دارای شناسه اختصاصی 27 رقمی QR-Reference برای وصول دقیق وجوه در سیستم بانکی سوئیس.",
  swissqr_noref_22: "راهنما: نسخه استاندارد 2.2 فیش الکترونیکی بانکی سوئیس بدون کد ارجاع سازگار با نرم‌افزارهای حسابداری قدیمی‌تر.",
  swissqr_credref_22: "راهنما: صورتحساب استاندارد 2.2 سوئیس با مرجع طلبکار جهت مطابقت دقیق فاکتورهای شرکتی.",
  swissqr_qrref_22: "راهنما: نسخه 2.2 صورتحساب سوئیس دارای شناسه ارجاع 27 رقمی بانکی برای کنترل خودکار وصولی‌ها.",
  swissqr_v1: "راهنما: نسخه نسل اول 1.0 استاندارد فیش‌های بانکی هوشمند سوئیس برای ثبت پرداخت‌ها.",
  zatca: "راهنما: استاندارد صورتحساب الکترونیکی سازمان امور مالیاتی عربستان (ZATCA Fatoora) در قالب TLV بر پایه QR Code برای فاکتورهای رسمی.",

  // 8. Healthcare Codes (24 items)
  code32: "راهنما: بارکد دارویی ملی کشور ایتالیا (Radix 32 / Codice Farmaceutico) برای کدگذاری 9 رقمی داروهای تحت پوشش نظام سلامت.",
  flattermarken_health: "راهنما: علائم کنترلی ترتیب بسته‌بندی در خطوط تولید اقلام درمانی و جعبه‌های دارو.",
  hibc_lic_128: "راهنما: استاندارد انجمن بارکد صنعت سلامت (HIBC) در فرمت Code-128 با شناسه اختصاصی برچسب کالا (LIC) با علامت مثبت (+) در ابتدا.",
  hibc_lic_39: "راهنما: استاندارد HIBC LIC در قالب کد 39 برای تجهیزات پزشکی بیمارستانی و ابزارهای اتاق عمل.",
  hibc_lic_aztec: "راهنما: بارکد آزتک مطابق فرمت درمانی HIBC LIC برای ایمپلنت‌ها و ابزارهای جراحی دندانپزشکی.",
  hibc_lic_codablockf: "راهنما: کد پشته‌ای درمانی چندردیفه برای کیت‌های آزمایشگاهی با دستگاه‌های اسکنر خطی.",
  hibc_lic_datamatrix: "راهنما: رایج‌ترین استاندارد بین‌المللی تجهیزات پزشکی روی بدنه فلزی ابزارهای جراحی و لنزها (HIBC LIC Data Matrix).",
  hibc_lic_micropdf: "راهنما: استاندارد مینیاتوری درمانی برای برچسب‌گذاری سرنگ‌ها و ویال‌های باریک تزریقی.",
  hibc_lic_pdf417: "راهنما: فرمت دوبعدی با ظرفیت بالا برای درج تاریخچه کامل استریلیزاسیون و استاندارد تجهیزات اتاق عمل.",
  hibc_lic_qrcode: "راهنما: کیوآر کد تخصصی سلامت با فرمت HIBC LIC برای تجهیزات مصرفی پزشکی و دستگاه‌های بیمارستانی.",
  hibc_pas_128: "راهنما: فرمت داده‌های تکمیلی سازنده (HIBC PAS) شامل شماره لات، تاریخ انقضا و سریال در قالب خطی Code-128.",
  hibc_pas_39: "راهنما: کد 39 با ساختار HIBC PAS برای ثبت سوابق تولید و بچ نامبر ادوات پزشکی.",
  hibc_pas_aztec: "راهنما: کد آزتک جهت ثبت داده‌های ثانویه و شماره سریال کالاهای بهداشتی.",
  hibc_pas_codablockf: "راهنما: بارکد پشته‌ای PAS برای بسته‌بندی‌های ثانویه آزمایشگاهی.",
  hibc_pas_datamatrix: "راهنما: استاندارد دیتاماتریکس PAS جهت حک مستقیم لیزری اطلاعات انقضا و سریال روی تجهیزات فلزی پزشکی.",
  hibc_pas_micropdf: "راهنما: فرمت مینیاتوری PAS برای ظروف آزمایشگاهی تشخیص طبی.",
  hibc_pas_pdf417: "راهنما: استاندارد با ظرفیت بالا برای مشخصات فنی ایمپلنت‌های ارتوپدی.",
  hibc_pas_qrcode: "راهنما: کیوآر کد سلامت با ساختار PAS برای اطلاعات انقضا و رهگیری دستگاه‌های تنفسی و مانیتورینگ.",
  ntin_health: "راهنما: شماره ملی شناسه درمانی اقلام سلامت (NTIN) برای ثبت و کنترل سراسری دارو.",
  pharmacode_one_health: "راهنما: فارماکد تک‌مسیره ویژه بسته‌بندی دارو در کارخانجات داروسازی داخلی و بین‌المللی.",
  pharmacode_two_health: "راهنما: فارماکد دوخطه با ایمنی مضاعف برای ممانعت از بسته‌بندی اشتباه داروها.",
  ppn_health: "راهنما: ساختار Pharmacy Product Number اتحادیه اروپا با پیشوند (9N) جهت راستی‌آزمایی داروها در داروخانه‌ها.",
  pzn7: "راهنما: شناسه ملی 7 رقمی داروخانه‌های آلمان (Pharmazentralnummer 7) شامل 6 یا 7 رقم برای خرید و بازپرداخت بیمه در آلمان.",
  pzn8: "راهنما: شناسه ارتقایافته 8 رقمی سراسری داروخانه‌های آلمان (PZN8) با ارقام 0 تا 9 برای کلیه اقلام درمانی جدید.",

  // 9. Mobile Tagging (3 items)
  qr_mobile_tag: "راهنما: بارکد کیوآر کد سریع و بهینه‌سازی شده برای پوسترها، کاتالوگ‌ها و بیلبوردها جهت باز شدن فوری در دوربین گوشی همراه.",
  dm_mobile_tag: "راهنما: بارکد دیتاماتریکس مناسب برای برچسب‌های بسیار کوچک روی وسایل شخصی و تجهیزات با قابلیت خوانش توسط گوشی‌های هوشمند.",
  aztec_mobile_tag: "راهنما: بارکد آزتک برای بلیت‌های الکترونیکی همایش‌ها، کارت‌های تخفیف و نمایشگرهای دیجیتال.",

  // 10. ISBN Codes (5 items)
  isbn13: "راهنما: شماره استاندارد بین‌المللی کتاب (شابک 13 رقمی) با پیشوند 978 یا 979 همراه با خط تیره؛ الزام قانونی ناشران برای انتشار کتاب.",
  isbn13_5: "راهنما: بارکد کتاب به همراه بارکد الحاقی 5 رقمی قیمت پشت جلد (EAN-5) جهت اسکن هم‌زمان کتاب و قیمت در کتاب‌فروشی‌ها.",
  ismn_code: "راهنما: شماره استاندارد بین‌المللی نت‌های موسیقی (شامپ) با پیشوند 979-0 برای پارتیتورها و آثار مکتوب موسیقایی.",
  issn_code: "راهنما: شماره استاندارد بین‌المللی نشریات ادواری (شاپا 8 کاراکتری) برای ثبت روزنامه‌ها، ماهنامه‌ها و ژورنال‌های علمی.",
  issn_2: "راهنما: بارکد شاپا نشریات به همراه بارکد الحاقی 2 رقمی نشان‌دهنده شماره نسخه یا شماره ماه انتشار نشریه.",

  // 11. Business Cards (4 items)
  vcard_qr: "راهنما: کارت ویزیت هوشمند الکترونیکی vCard بر پایه QR Code؛ با اسکن آن توسط دوربین موبایل، نام، تلفن، ایمیل و وب‌سایت مستقیماً در مخاطبان گوشی ذخیره می‌شود.",
  vcard_dm: "راهنما: کارت ویزیت الکترونیکی vCard بر پایه Data Matrix؛ مناسب برای کارت‌های پرسنلی و برچسب‌های شناسایی سازمانی.",
  mecard_qr: "راهنما: فرمت فوق‌العاده فشرده کارت مخاطب (MeCard) ژاپنی بر پایه QR Code با حجم کمتر و اسکن سریع‌تر در موبایل‌های قدیمی.",
  mecard_dm: "راهنما: کارت مخاطب فشرده MeCard در قالب صنعتی دیتاماتریکس برای شناسایی فردی و کارت‌های امنیتی ورود و خروج.",

  // 12. Event Barcodes (2 items)
  event_qr: "راهنما: استاندارد بین‌المللی تقویم دیجیتال iCalendar بر پایه QR Code؛ با اسکن، رویداد با تاریخ و محل جلسه مستقیماً به تقویم گوگل یا تقویم آیفون اضافه می‌شود.",
  event_dm: "راهنما: رویداد تقویم در قالب Data Matrix برای بلیت‌های همایش و کارت‌های همایش‌های بین‌المللی.",

  // 13. Wi-Fi Barcodes (2 items)
  wifi_qr: "راهنما: اتصال خودکار دوربین گوشی به وای‌فای؛ کاربر با گرفتن دوربین روی بارکد، بدون نیاز به انتخاب SSID یا تایپ کلمه عبور، مستقیماً به شبکه متصل می‌شود.",
  wifi_dm: "راهنما: مشخصات اتصال به شبکه بیسیم در قالب بارکد دیتاماتریکس مناسب برای برچسب‌های فنی پشت مودم و روتر.",

  // Category Fallbacks (13 items)
  linear: "راهنما: کدهای میله‌ای خطی تک‌بعدی 1D که با تغییر ضخامت و فاصله خطوط موازی داده‌ها را ذخیره می‌کنند و با انواع بارکدخوان‌های لیزری و نوری خوانده می‌شوند.",
  postal: "راهنما: استانداردهای رسمی ادارات پست کشورهای مختلف برای پردازش خودکار و سریع نامه‌ها، بسته‌ها و مرسولات سفارشی بر اساس کد پستی و آدرس.",
  ean_upc: "راهنما: استانداردهای رسمی بین‌المللی خرده‌فروشی و سوپرمارکتی جهان تحت نظارت سازمان GS1 برای ثبت قیمت و مشخصات کالا در صندوق‌های فروشگاهی.",
  '2d': "راهنما: بارکدهای ماتریسی دوبعدی با ظرفیت ذخیره‌سازی داده بسیار بالاتر از کدهای خطی، شامل قابلیت تصحیح خطا در صورت مخدوش شدن بخشی از کد.",
  gs1_databar: "راهنما: خانواده کدهای فشرده زنجیره تأمین GS1 برای ردیابی اقلام متغیر، محصولات کشاورزی و گوشت دارای تاریخ انقضا و وزن متغیر.",
  gs1_2d: "راهنما: نسل نوین استانداردهای دوبعدی GS1 شامل دیتاماتریکس و کیوآر کدهای دیجیتال لینک برای اتصال محصول به وب‌سایت رسمی سازنده.",
  banking: "راهنما: استانداردهای رسمی نظام‌های مالی و بانکی جهت پرداخت‌های آنی الکترونیکی، فیش‌های بانکی سوئیس و فاکتورهای رسمی مالیاتی.",
  healthcare: "راهنما: کدهای نظارتی سخت‌گیرانه صنایع داروسازی و تجهیزات پزشکی (شامل استانداردهای HIBC و IFA PPN) جهت اصالت‌سنجی و پیشگیری از جعل دارو.",
  mobile_tagging: "راهنما: بارکدهای بهینه‌شده برای اسکن فوق‌سریع توسط دوربین تلفن‌های هوشمند جهت ارجاع به محتوای دیجیتال، تبلیغات و کاتالوگ‌ها.",
  isbn_codes: "راهنما: استانداردهای رسمی بین‌المللی نشر کتاب (شابک)، نشریات ادواری (شاپا) و نت‌های موسیقی (شامپ) برای ثبت در کتابخانه‌ها و مراکز فروش.",
  business_cards: "راهنما: استانداردهای ذخیره اطلاعات فردی و کارت ویزیت الکترونیکی (vCard و MeCard) برای انتقال خودکار شماره تماس، ایمیل و لینک به دفترچه تلفن.",
  event_barcodes: "راهنما: استانداردهای جهانی تقویم دیجیتال برای ثبت همایش‌ها، جلسات و وبینارها در تقویم موبایل و رایانه با یک اسکن ساده.",
  wifi_barcodes: "راهنما: استانداردهای اشتراک‌گذاری ایمن اتصال اینترنت بی‌سیم جهت اتصال خودکار دستگاه‌های هوشمند به شبکه Wi-Fi بدون نیاز به تایپ رمز عبور."
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
                : 'تولید 116 مدل بارکد خطی، دوبعدی، گمرکی، کالا (EAN/UPC)، صنایع دارویی، پستی و بانکی با بالاترین کیفیت و خروجی وکتور SVG.'}
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
                        <span>1. انتخاب دسته‌بندی بارکد (13 گروه مستقل):</span>
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

                <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-2 pt-2 border-t border-border/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>
                    خروجی کاملاً استاندارد و قابل خواندن توسط تمام دستگاه‌های
                    بارکدخوان
                  </span>
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
