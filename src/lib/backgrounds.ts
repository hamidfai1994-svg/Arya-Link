/**
 * Background presets for Arya Link (Professional Patterns & Industry Themed Images)
 * All IDs, dimensions and coordinates strictly use standard English digits.
 */

export interface PresetImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

export interface PresetPattern {
  id: string;
  name: string;
  desc: string;
  cssFunc: (color: string, size?: number) => string;
  backgroundSize?: (size: number) => string;
  backgroundRepeat?: string;
}

// 22 Professional High-Resolution Industry Themed Images (Unsplash compressed)
export const PRESET_IMAGES: PresetImage[] = [
  {
    id: 'tech_circuit',
    title: 'تکنولوژی و سخت‌افزار',
    category: 'فناوری',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'coding_dev',
    title: 'برنامه‌نویسی و نرم‌افزار',
    category: 'توسعه',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'medical_health',
    title: 'پزشکی و سلامت',
    category: 'درمان',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'law_justice',
    title: 'وکالت و حقوق',
    category: 'حقوقی',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'modern_art',
    title: 'هنر و گرافیک',
    category: 'طراحی',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'luxury_home',
    title: 'املاک و مستغلات',
    category: 'ساختمان',
    url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'architecture_sky',
    title: 'معماری و سازه',
    category: 'عمران',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'nature_forest',
    title: 'طبیعت و جنگل مه',
    category: 'محیط زیست',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'mountain_peaks',
    title: 'کوهستان و افق',
    category: 'طبیعت',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'music_studio',
    title: 'موسیقی و استودیو',
    category: 'صدا',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'fitness_gym',
    title: 'ورزش و فیتنس',
    category: 'سلامتی',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'beauty_cosmetics',
    title: 'زیبایی و مراقبت پوست',
    category: 'آرایشی',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'cozy_coffee',
    title: 'کافه و باریستا',
    category: 'رستوران',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'fine_dining',
    title: 'رستوران و آشپزی',
    category: 'پذیرایی',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'finance_stocks',
    title: 'امور مالی و سرمایه‌گذاری',
    category: 'اقتصاد',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'business_consulting',
    title: 'مشاوره و کسب‌وکار',
    category: 'مدیریت',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'education_books',
    title: 'آموزش و آکادمیک',
    category: 'تحصیلات',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'photography_lens',
    title: 'عکاسی و سینما',
    category: 'رسانه',
    url: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'luxury_cars',
    title: 'خودرو و ترابری',
    category: 'حمل و نقل',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'dark_fluid',
    title: 'امواج سیال تاریک',
    category: 'انتزاعی',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'light_prism',
    title: 'طیف نوری روشن',
    category: 'انتزاعی',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'cosmic_galaxy',
    title: 'کهکشان و نجوم',
    category: 'کیهان',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1080&q=80',
  },
];

// 22 Dynamic High-Quality Patterns (Generated via pure CSS Gradients & SVG Data URIs)
export const PRESET_PATTERNS: PresetPattern[] = [
  {
    id: 'dots',
    name: 'ماتریس نقطه‌ای',
    desc: 'الگوی پولکا مدرن و مینیمال',
    cssFunc: (c) => `radial-gradient(circle, ${c} 1.5px, transparent 1.5px)`,
    backgroundSize: (s) => `${s}px ${s}px`,
  },
  {
    id: 'grid',
    name: 'شبکه شطرنجی',
    desc: 'خطوط ظریف افقی و عمودی',
    cssFunc: (c) => `linear-gradient(to right, ${c} 1px, transparent 1px), linear-gradient(to bottom, ${c} 1px, transparent 1px)`,
    backgroundSize: (s) => `${s}px ${s}px`,
  },
  {
    id: 'diagonal',
    name: 'خطوط مورب',
    desc: 'خطوط ۴۵ درجه شیک و پویا',
    cssFunc: (c, s = 24) => `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent ${s}px)`,
    backgroundSize: () => 'auto',
  },
  {
    id: 'stripes',
    name: 'راه‌راه افقی',
    desc: 'خطوط موازی و تراز شده',
    cssFunc: (c, s = 24) => `repeating-linear-gradient(0deg, ${c}, ${c} 1px, transparent 1px, transparent ${s}px)`,
    backgroundSize: () => 'auto',
  },
  {
    id: 'vertical_lines',
    name: 'راه‌راه عمودی',
    desc: 'خطوط مستقیم از بالا به پایین',
    cssFunc: (c, s = 24) => `repeating-linear-gradient(90deg, ${c}, ${c} 1px, transparent 1px, transparent ${s}px)`,
    backgroundSize: () => 'auto',
  },
  {
    id: 'cross_dots',
    name: 'مورب متقاطع',
    desc: 'شبکه الماسی ضربدری ۴۵ درجه',
    cssFunc: (c, s = 24) => `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent ${s}px), repeating-linear-gradient(-45deg, ${c}, ${c} 1px, transparent 1px, transparent ${s}px)`,
    backgroundSize: () => 'auto',
  },
  {
    id: 'plus',
    name: 'علامت پلاس (+)',
    desc: 'الگوی تکنولوژی با نماد مثبت',
    cssFunc: (c, s = 24) => {
      const enc = encodeURIComponent(c);
      const half = s / 2;
      return `url("data:image/svg+xml,%3Csvg width='${s}' height='${s}' viewBox='0 0 ${s} ${s}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M${half} 0v${s}M0 ${half}h${s}' stroke='${enc}' stroke-width='1.5'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s}px ${s}px`,
  },
  {
    id: 'checkerboard',
    name: 'شطرنجی پر و خالی',
    desc: 'صفحه شطرنج کلاسیک دو رنگ',
    cssFunc: (c) => `linear-gradient(45deg, ${c} 25%, transparent 25%), linear-gradient(-45deg, ${c} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${c} 75%), linear-gradient(-45deg, transparent 75%, ${c} 75%)`,
    backgroundSize: (s) => `${s}px ${s}px`,
  },
  {
    id: 'zigzag',
    name: 'زیگزاگ مدرن',
    desc: 'خطوط شکسته جناغی و هندسی',
    cssFunc: (c, s = 24) => `repeating-linear-gradient(135deg, ${c}, ${c} 1px, transparent 1px, transparent ${s}px), repeating-linear-gradient(225deg, ${c}, ${c} 1px, transparent 1px, transparent ${s}px)`,
    backgroundSize: (s) => `${s * 2}px ${s * 2}px`,
  },
  {
    id: 'waves',
    name: 'امواج پیوسته',
    desc: 'الگوی سینوسی و آرامش‌بخش',
    cssFunc: (c) => {
      const enc = encodeURIComponent(c);
      return `url("data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q10 0, 20 10 T40 10' fill='none' stroke='${enc}' stroke-width='1.5'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s * 2}px ${s}px`,
  },
  {
    id: 'hexagon',
    name: 'لانه زنبوری',
    desc: 'شش‌ضلعی‌های ارگانیک و پیوسته',
    cssFunc: (c) => {
      const enc = encodeURIComponent(c);
      return `url("data:image/svg+xml,%3Csvg width='56' height='48' viewBox='0 0 56 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0L56 16v16L28 48 0 32V16z' fill='none' stroke='${enc}' stroke-width='1.5'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s * 2}px ${Math.round(s * 1.714)}px`,
  },
  {
    id: 'bricks',
    name: 'دیوار آجری',
    desc: 'ساختار آجری منظم معماری',
    cssFunc: (c) => {
      const enc = encodeURIComponent(c);
      return `url("data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10h40M20 0v10M0 10v10M40 10v10' fill='none' stroke='${enc}' stroke-width='1'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s * 2}px ${s}px`,
  },
  {
    id: 'concentric_circles',
    name: 'حلقه‌های تو در تو',
    desc: 'مدارهای دوار متمرکز',
    cssFunc: (c) => `radial-gradient(circle, transparent 35%, ${c} 36%, ${c} 38%, transparent 39%, transparent 68%, ${c} 69%, ${c} 71%, transparent 72%)`,
    backgroundSize: (s) => `${s * 2}px ${s * 2}px`,
  },
  {
    id: 'isometric',
    name: 'مکعب ایزومتریک',
    desc: 'پرسپکتیو سه‌بعدی و مدرن',
    cssFunc: (c) => {
      const enc = encodeURIComponent(c);
      return `url("data:image/svg+xml,%3Csvg width='60' height='35' viewBox='0 0 60 35' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 35L30 17.5 60 35M30 17.5V0' fill='none' stroke='${enc}' stroke-width='1'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s * 2}px ${Math.round(s * 1.166)}px`,
  },
  {
    id: 'circuit',
    name: 'مدار نئونی',
    desc: 'الگوی چیپست و سخت‌افزار',
    cssFunc: (c) => {
      const enc = encodeURIComponent(c);
      return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v10M0 30h10M30 50v10M50 30h10M20 20h20v20H20z' stroke='${enc}' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='30' cy='30' r='3' fill='${enc}'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s * 2}px ${s * 2}px`,
  },
  {
    id: 'diamonds',
    name: 'شبکه لوزی',
    desc: 'الگوی ظریف ۶۰ درجه الماسی',
    cssFunc: (c, s = 24) => `repeating-linear-gradient(60deg, ${c}, ${c} 1px, transparent 1px, transparent ${s}px), repeating-linear-gradient(-60deg, ${c}, ${c} 1px, transparent 1px, transparent ${s}px)`,
    backgroundSize: () => 'auto',
  },
  {
    id: 'triangles',
    name: 'مثلثی هندسی',
    desc: 'پلی‌گان‌های منظم مثلثی',
    cssFunc: (c) => {
      const enc = encodeURIComponent(c);
      return `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='15,0 30,30 0,30' fill='none' stroke='${enc}' stroke-width='1'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s}px ${s}px`,
  },
  {
    id: 'carbon',
    name: 'فیبر کربن',
    desc: 'بافت سبک کربن با عمق بالا',
    cssFunc: (c) => `linear-gradient(27deg, ${c} 5px, transparent 5px) 0 5px, linear-gradient(207deg, ${c} 5px, transparent 5px) 10px 0px, linear-gradient(27deg, ${c} 5px, transparent 5px) 0px 10px, linear-gradient(207deg, ${c} 5px, transparent 5px) 10px 5px`,
    backgroundSize: () => '20px 20px',
  },
  {
    id: 'stars',
    name: 'ستاره‌ای چهارپر',
    desc: 'ستارگان درخشان آسمان شب',
    cssFunc: (c) => {
      const enc = encodeURIComponent(c);
      return `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0 Q15 15, 30 15 Q15 15, 15 30 Q15 15, 0 15 Q15 15, 15 0Z' fill='${enc}'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s * 1.5}px ${s * 1.5}px`,
  },
  {
    id: 'weave',
    name: 'بافت حصیری',
    desc: 'تار و پود درهم تنیده ارگانیک',
    cssFunc: (c, s = 24) => {
      const half = s / 2;
      return `repeating-linear-gradient(0deg, transparent, transparent ${half}px, ${c} ${half}px, ${c} ${s}px), repeating-linear-gradient(90deg, ${c}, ${c} 1px, transparent 1px, transparent ${half}px)`;
    },
    backgroundSize: (s) => `${s}px ${s}px`,
  },
  {
    id: 'scales',
    name: 'پولک‌های کمانی',
    desc: 'قوس‌های تودرتوی اقیانوسی',
    cssFunc: (c) => {
      const enc = encodeURIComponent(c);
      return `url("data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 A20 20 0 0 1 40 20' fill='none' stroke='${enc}' stroke-width='1.5'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s * 2}px ${s}px`,
  },
  {
    id: 'moroccan',
    name: 'اسلیمی مراکشی',
    desc: 'نقوش معماری کهن مشرق‌زمین',
    cssFunc: (c) => {
      const enc = encodeURIComponent(c);
      return `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 C25 10, 30 15, 40 20 C30 25, 25 30, 20 40 C15 30, 10 25, 0 20 C10 15, 15 10, 20 0 Z' fill='none' stroke='${enc}' stroke-width='1.5'/%3E%3C/svg%3E")`;
    },
    backgroundSize: (s) => `${s * 2}px ${s * 2}px`,
  },
];

