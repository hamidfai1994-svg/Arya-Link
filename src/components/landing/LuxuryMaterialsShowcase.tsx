'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';
import {
  Zap,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// =========================================================================
// 1. DATA ARCHITECTURE (Mock Data for Future CMS & API Connection)
// =========================================================================

export interface CardMaterialItem {
  id: string;
  name: string;
  subtitle: string;
  materialType: 'pvc' | 'black_metal' | 'gold_steel' | 'wood';
  orientation: 'horizontal' | 'vertical';
  allowCustomUpload: boolean;
  badge: string;
  badgeStyle: string;
  price: string;
  thickness: string;
  weight: string;
  chipset: string;
  description: string;
  features: string[];
  gradientBg: string;
  accentColor: string;
  engravingColor: string;
  foilEffect: string;
  surfaceTexture: string;
}

export const CARD_MATERIALS_DATA: CardMaterialItem[] = [
  {
    id: 'mat-pvc',
    name: 'پی‌وی‌سی مات مخملی',
    subtitle: 'Matte Obsidian PVC',
    materialType: 'pvc',
    orientation: 'horizontal',
    allowCustomUpload: true,
    badge: 'پرفروش‌ترین (Most Popular)',
    badgeStyle: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    price: '1,500 AFN',
    thickness: '0.84 mm',
    weight: '5g (فوق‌العاده سبک)',
    chipset: 'NTAG216 (High-Speed)',
    description: 'ساخته شده از پی‌وی‌سی فشرده با روکش مخملی مات ضد اثر انگشت. گزینه‌ای مینیمال، مدرن و با دوام برای تبادل روزمره اطلاعات.',
    features: [
      'روکش مخملی مات (Soft-touch velvet finish)',
      'مقاومت 100% در برابر آب، رطوبت و خمیدگی',
      'تراشه NTAG216 سازگار با آیفون و اندروید',
      'چاپ باکیفیت UV صنعتی با وضوح بالا',
    ],
    gradientBg: 'from-slate-900 via-slate-800 to-zinc-950',
    accentColor: '#06b6d4',
    engravingColor: 'text-white',
    foilEffect: 'rgba(6, 182, 212, 0.4)',
    surfaceTexture: 'matte',
  },
  {
    id: 'mat-black-metal',
    name: 'فلز مشکی تیتانیوم',
    subtitle: 'Black Titanium Metal',
    materialType: 'black_metal',
    orientation: 'horizontal',
    allowCustomUpload: true,
    badge: 'ویژه مدیران (Executive)',
    badgeStyle: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    price: '3,500 AFN',
    thickness: '0.80 mm',
    weight: '24g (وزن سنگین لوکس)',
    chipset: 'NTAG216 Hybrid Boosted',
    description: 'تراش‌خورده از استیل ضد زنگ 304 با پوشش مات مشکی الکترواستاتیک و حکاکی لیزری نقره‌ای کروم. حس وقار و پرستیژ ماندگار.',
    features: [
      'بدنه تمام فلزی استیل 304 با وزن سنگین 24 گرم',
      'پوشش نانو مات ضد سایش و ضد خط‌وخش',
      'حکاکی دقیق لیزر فیبر با بازتاب نقره‌ای',
      'ماژول هیبریدی NFC تقویت‌شده ضدتداخل فلز',
    ],
    gradientBg: 'from-zinc-900 via-stone-900 to-black',
    accentColor: '#94a3b8',
    engravingColor: 'text-slate-100',
    foilEffect: 'rgba(255, 255, 255, 0.45)',
    surfaceTexture: 'brushed_metal',
  },
  {
    id: 'mat-gold-steel',
    name: 'استیل طلایی آینه‌ای',
    subtitle: '24K Gold Mirror Steel',
    materialType: 'gold_steel',
    orientation: 'horizontal',
    allowCustomUpload: true,
    badge: 'فوق لوکس (Ultra Luxury)',
    badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    price: '3,900 AFN',
    thickness: '0.80 mm',
    weight: '24g (وزن سنگین لوکس)',
    chipset: 'NTAG216 Hybrid Boosted',
    description: 'آبکاری طلای 24 عیار به روش PVD با درخشش آینه‌ای خیره‌کننده. امضای اختصاصی مدیران ارشد، دیپلمات‌ها و شرکت‌های ممتاز.',
    features: [
      'آبکاری طلای 24 عیار به روش پیشرفته خلاء PVD',
      'سطح کاملاً آینه‌ای با انعکاس نور خیره‌کننده',
      'حکاکی لیزری عمیق با درخشش متالیک طلایی',
      'بسته‌بندی اختصاصی در هاردباکس کادویی مخملین',
    ],
    gradientBg: 'from-[#451a03] via-[#78350f] to-[#1c1917]',
    accentColor: '#f59e0b',
    engravingColor: 'text-amber-200',
    foilEffect: 'rgba(254, 240, 138, 0.55)',
    surfaceTexture: 'mirror_gold',
  },
  {
    id: 'mat-wood',
    name: 'چوب طبیعی گردو',
    subtitle: 'Eco Walnut Wood',
    materialType: 'wood',
    orientation: 'horizontal',
    allowCustomUpload: true,
    badge: 'طبیعی و ارگانیک (Eco-Friendly)',
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    price: '2,400 AFN',
    thickness: '1.20 mm',
    weight: '7g (سبک و طبیعی)',
    chipset: 'NTAG216 Encapsulated',
    description: 'برش‌خورده از رگه‌های چوب طبیعی گردو با بافت طبیعی متمایز برای هر کارت. حسی اصیل، پایدار و 100% دوستدار محیط زیست.',
    features: [
      '100% چوب طبیعی گردوی تصفیه‌شده و بازیافت‌پذیر',
      'رگه‌ها و گره‌های چوب طبیعی متمایز برای هر کارت',
      'تراشه کپسولی NFC تعبیه‌شده در لایه‌های چوب',
      'پوشش روغن گیاهی محافظ در برابر رطوبت و تغییر رنگ',
    ],
    gradientBg: 'from-[#3e2723] via-[#4e342e] to-[#271b18]',
    accentColor: '#10b981',
    engravingColor: 'text-amber-100',
    foilEffect: 'rgba(217, 119, 6, 0.4)',
    surfaceTexture: 'wood_grain',
  },
];

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;

// =========================================================================
// 2. INTERACTIVE 3D TILT & DYNAMIC GLARE CARD COMPONENT
// =========================================================================

function InteractiveMaterialCard({ material }: { material: CardMaterialItem }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for normalized cursor coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for realistic inertia physics
  const springConfig = { stiffness: 280, damping: 22, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // 3D Tilt angles (X and Y axis)
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-16, 16]);

  // Dynamic Glare coordinates (from 0% to 100%)
  const glareX = useTransform(smoothMouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(smoothMouseY, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useTransform(smoothMouseX, [-0.5, 0, 0.5], [0.85, 0.4, 0.85]);

  const glareBackground = useMotionTemplate`radial-gradient(circle 260px at ${glareX} ${glareY}, ${material.foilEffect} 0%, rgba(255, 255, 255, 0.1) 40%, transparent 75%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="flex flex-col h-full justify-between p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-2xl hover:border-cyan-500/40 transition-all duration-300 group backdrop-blur-xl">
      {/* 3D Perspective Card Display */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full aspect-[1.586/1] relative cursor-pointer select-none perspective-1000 mb-6 rounded-2xl"
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className={`w-full h-full rounded-2xl p-5 shadow-2xl relative overflow-hidden border border-white/20 transition-shadow duration-300 flex flex-col justify-between bg-gradient-to-br ${material.gradientBg}`}
        >
          {/* Surface Texture Layer */}
          {material.materialType === 'black_metal' && (
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.08)_40%,transparent_60%)] pointer-events-none" />
          )}

          {material.materialType === 'gold_steel' && (
            <div className="absolute inset-0 bg-[linear-gradient(125deg,transparent_15%,rgba(255,236,179,0.25)_45%,transparent_65%)] pointer-events-none" />
          )}

          {material.materialType === 'wood' && (
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#bcaaa4_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
          )}

          {/* Interactive Dynamic Glare Overlay */}
          <motion.div
            style={{
              background: glareBackground,
              opacity: glareOpacity,
            }}
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay transition-opacity duration-300"
          />

          {/* Front Card Header: Brand & Contactless Icon */}
          <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(24px)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black font-outfit text-white text-xs">
                A
              </div>
              <span className="text-[11px] font-bold font-outfit tracking-wider uppercase text-white/90">
                Arya Link
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[9px] font-bold tracking-widest text-white/80 font-outfit uppercase">
                NFC
              </span>
            </div>
          </div>

          {/* Center: Chip Graphic */}
          <div className="my-auto flex items-center justify-between px-1 relative z-10" style={{ transform: 'translateZ(18px)' }}>
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 border border-amber-200/50 shadow-md flex items-center justify-center opacity-85">
              <div className="w-full h-full border border-amber-900/30 rounded-[4px] grid grid-cols-2 gap-0.5 p-0.5">
                <div className="border border-amber-800/20" />
                <div className="border border-amber-800/20" />
              </div>
            </div>

            <span className="text-[10px] font-outfit tracking-widest uppercase opacity-60 text-white">
              {material.chipset.split(' ')[0]}
            </span>
          </div>

          {/* Front Card Bottom: User Name & Physical Card Finish */}
          <div className="pt-2 border-t border-white/15 flex items-end justify-between relative z-10" style={{ transform: 'translateZ(22px)' }}>
            <div className="space-y-0.5">
              <h4
                className={`text-sm font-extrabold tracking-tight truncate ${material.engravingColor} drop-shadow-sm`}
              >
                {material.name}
              </h4>
              <p className="text-[10px] text-white/70 font-outfit tracking-wide truncate">
                {material.subtitle}
              </p>
            </div>

            <span className="text-[9px] font-outfit uppercase text-white/60 tracking-wider">
              ISO 7810
            </span>
          </div>
        </motion.div>
      </div>

      {/* Card Info & Details */}
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${material.badgeStyle}`}>
              {material.badge}
            </span>
            <span className="text-lg font-black font-outfit text-slate-900 dark:text-white">
              {material.price}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {material.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {material.description}
          </p>

          {/* Features Checkpoints */}
          <ul className="space-y-1.5 pt-2">
            {material.features.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="text-[11px]">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button: Links to /order */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 mt-auto">
          <Link href={`/order?material=${material.id}`} className="block w-full">
            <Button
              variant="outline"
              className="w-full h-11 rounded-2xl border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-500 transition-all shadow-sm"
            >
              <span>سفارش این کارت</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. MAIN SECTION COMPONENT (Dynamic & CMS-Ready)
// =========================================================================

export function LuxuryMaterialsShowcase({
  materials = CARD_MATERIALS_DATA,
}: {
  materials?: CardMaterialItem[];
}) {
  return (
    <section id="luxury-materials" className="py-20 sm:py-28 border-t border-border/80 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-10 w-[500px] h-[350px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[350px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header (Badges cleaned up as requested) */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_SNAPPY }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            کارت ویزیت هوشمند با متریال واقعی و ماندگار
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            کارت فیزیکی شما، نخستین امضای برند شماست. از پی‌وی‌سی مخملی مات تا استیل آبکاری‌شده با طلای 24 عیار و چوب طبیعی گردو، برای هر سلیقه و جایگاه کاری.
          </p>
        </motion.div>

        {/* Dynamic Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE_SNAPPY, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {materials.map((mat) => (
            <InteractiveMaterialCard key={mat.id} material={mat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default LuxuryMaterialsShowcase;
