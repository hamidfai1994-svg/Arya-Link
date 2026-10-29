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
  Sparkles,
  Crown,
  Shield,
  Leaf,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    id: 'mat-gold-steel',
    name: 'استیل طلایی آینه‌ای',
    subtitle: '24K Gold Mirror Steel',
    materialType: 'gold_steel',
    orientation: 'horizontal',
    allowCustomUpload: true,
    badge: 'فوق لوکس (Ultra Luxury)',
    badgeStyle: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25',
    price: '3,900 AFN',
    thickness: '0.80 mm',
    weight: '24g (وزن سنگین لوکس)',
    chipset: 'NTAG216 Hybrid Boosted',
    description: 'آبکاری طلای 24 عیار به روش پیشرفته خلاء PVD با درخشش آینه‌ای خیره‌کننده. گزینه‌ای اختصاصی برای مدیران ارشد، دیپلمات‌ها و سازمان‌های ممتاز.',
    features: [
      'آبکاری طلای 24 عیار به روش پیشرفته PVD',
      'سطح کاملاً آینه‌ای با انعکاس نور خیره‌کننده',
      'حکاکی دقیق لیزری با خطوط طلایی براق',
      'ماژول تقویت‌شده ضدتداخل تداخل امواج فلز',
    ],
    gradientBg: 'from-[#451a03] via-[#78350f] to-[#1c1917]',
    accentColor: '#f59e0b',
    engravingColor: 'text-amber-200',
    foilEffect: 'rgba(254, 240, 138, 0.65)',
    surfaceTexture: 'mirror_gold',
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
    description: 'تراش‌خورده از استیل ضد زنگ 304 با پوشش مات مشکی الکترواستاتیک و حکاکی لیزری نقره‌ای کروم. حس وقار و ماندگاری ابدی.',
    features: [
      'بدنه تمام فلزی استیل ضدزنگ 304 با وزن سنگین 24g',
      'پوشش نانومات الکترواستاتیک ضد سایش و خط‌وخش',
      'حکاکی دقیق لیزر فیبر با بازتاب نقره‌ای صیقلی',
      'تراشه چیپست هیبریدی ویژه کارت‌های فلزی',
    ],
    gradientBg: 'from-zinc-950 via-stone-900 to-black',
    accentColor: '#94a3b8',
    engravingColor: 'text-slate-100',
    foilEffect: 'rgba(255, 255, 255, 0.45)',
    surfaceTexture: 'brushed_metal',
  },
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
    description: 'ساخته شده از پی‌وی‌سی فشرده درجه یک با روکش مخملی مات ضد اثر انگشت. گزینه‌ای مدرن، سبک و با دوام برای تبادل نامحدود اطلاعات کاری.',
    features: [
      'روکش مخملی مات (Soft-touch velvet finish)',
      'مقاومت 100% در برابر آب، رطوبت و خمش',
      'تراشه پرسرعت NTAG216 سازگار با آیفون و اندروید',
      'چاپ باکیفیت UV صنعتی با رزولوشن بسیار بالا',
    ],
    gradientBg: 'from-slate-900 via-slate-800 to-zinc-950',
    accentColor: '#06b6d4',
    engravingColor: 'text-white',
    foilEffect: 'rgba(6, 182, 212, 0.45)',
    surfaceTexture: 'matte',
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
    description: 'برش‌خورده از چوب طبیعی گردوی تصفیه‌شده با رگه‌های ارگانیک منحصربه‌فرد برای هر کارت. حسی اصیل، پایدار و 100% دوستدار محیط زیست.',
    features: [
      '100% چوب طبیعی گردوی تصفیه‌شده و بازیافت‌پذیر',
      'رگه‌ها و گره‌های متمایز و اختصاصی برای هر کارت',
      'تراشه کپسولی NFC تعبیه‌شده در لایه‌های چوب',
      'پوشش روغن گیاهی محافظ در برابر رطوبت و تغییر رنگ',
    ],
    gradientBg: 'from-[#3e2723] via-[#4e342e] to-[#271b18]',
    accentColor: '#10b981',
    engravingColor: 'text-amber-100',
    foilEffect: 'rgba(217, 119, 6, 0.45)',
    surfaceTexture: 'wood_grain',
  },
];

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;

// =========================================================================
// 2. INTERACTIVE 3D TILT & DYNAMIC GLARE PHYSICAL CARD SIMULATION
// =========================================================================

function Interactive3DCard({
  material,
  aspectRatio = 'aspect-[1.586/1]',
}: {
  material: CardMaterialItem;
  aspectRatio?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Normalized cursor coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for inertia physics
  const springConfig = { stiffness: 280, damping: 22, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // 3D Tilt angles (X and Y axis)
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-16, 16]);

  // Dynamic Glare coordinates
  const glareX = useTransform(smoothMouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(smoothMouseY, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useTransform(smoothMouseX, [-0.5, 0, 0.5], [0.9, 0.35, 0.9]);

  const glareBackground = useMotionTemplate`radial-gradient(circle 320px at ${glareX} ${glareY}, ${material.foilEffect} 0%, rgba(255, 255, 255, 0.15) 35%, transparent 75%)`;

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
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`w-full ${aspectRatio} relative cursor-pointer select-none mb-6 rounded-2xl`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`w-full h-full rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)] relative overflow-hidden border border-white/20 transition-shadow duration-300 flex flex-col justify-between bg-gradient-to-br ${material.gradientBg}`}
      >
        {/* Surface Texture Layer */}
        {material.materialType === 'black_metal' && (
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.08)_40%,transparent_60%)] pointer-events-none" />
        )}

        {material.materialType === 'gold_steel' && (
          <div className="absolute inset-0 bg-[linear-gradient(125deg,transparent_15%,rgba(255,236,179,0.3)_45%,transparent_65%)] pointer-events-none" />
        )}

        {material.materialType === 'wood' && (
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#bcaaa4_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
        )}

        {/* Dynamic Specular Glare Highlight */}
        <motion.div
          style={{
            background: glareBackground,
            opacity: glareOpacity,
          }}
          className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay transition-opacity duration-300"
        />

        {/* Front Card Header: Brand Monogram & NFC Indicator */}
        <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(26px)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black font-outfit text-white text-xs shadow-inner">
              AL
            </div>
            <span className="text-xs font-bold font-outfit tracking-widest uppercase text-white/95">
              ARYA LINK
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-black tracking-widest text-white/90 font-outfit uppercase">
              NFC
            </span>
          </div>
        </div>

        {/* Chip Graphic Simulation */}
        <div className="my-auto flex items-center justify-between px-1 relative z-10" style={{ transform: 'translateZ(20px)' }}>
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 border border-amber-200/60 shadow-md flex items-center justify-center opacity-90">
            <div className="w-full h-full border border-amber-900/30 rounded-[4px] grid grid-cols-2 gap-0.5 p-0.5">
              <div className="border border-amber-800/25" />
              <div className="border border-amber-800/25" />
            </div>
          </div>

          <span className="text-[10px] font-outfit font-bold tracking-widest uppercase opacity-70 text-white">
            {material.chipset.split(' ')[0]}
          </span>
        </div>

        {/* Card Footer: User Finish & Standards */}
        <div className="pt-2 border-t border-white/15 flex items-end justify-between relative z-10" style={{ transform: 'translateZ(24px)' }}>
          <div className="space-y-0.5">
            <h4 className={`text-sm font-black tracking-tight truncate ${material.engravingColor} drop-shadow-sm`}>
              {material.name}
            </h4>
            <p className="text-[10px] text-white/75 font-outfit tracking-wider truncate">
              {material.subtitle}
            </p>
          </div>

          <span className="text-[9px] font-outfit uppercase text-white/70 tracking-widest">
            ISO 7810 ID-1
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// =========================================================================
// 3. MAIN SECTION: ASYMMETRIC BENTO GRID SHOWCASE
// =========================================================================

export function LuxuryMaterialsShowcase() {
  const goldMaterial = CARD_MATERIALS_DATA[0];  // 24K Gold
  const metalMaterial = CARD_MATERIALS_DATA[1]; // Black Titanium
  const pvcMaterial = CARD_MATERIALS_DATA[2];   // Matte PVC
  const woodMaterial = CARD_MATERIALS_DATA[3];  // Walnut Wood

  return (
    <section id="luxury-materials" className="py-24 sm:py-36 border-t border-border/80 relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-8 w-[550px] h-[400px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-16 left-8 w-[550px] h-[400px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_SNAPPY }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-semibold shadow-xs">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>گالری متریال‌های فاخر (Bento Materials Gallery)</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.15]">
            کارت ویزیت هوشمند با{' '}
            <span className="bg-gradient-to-l from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              متریال واقعی و ماندگار
            </span>
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            کارت فیزیکی شما، نخستین امضای برند شما در جلسات حضوری است. از پی‌وی‌سی مخملی مات تا استیل آبکاری‌شده با طلای 24 عیار و چوب طبیعی گردو، برای هر سلیقه و جایگاه کاری.
          </p>
        </motion.div>

        {/* ========================================================
            ASYMMETRIC BENTO GRID ARCHITECTURE
        ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* ========================================================
              BENTO TILE 1 (GRAND SPOTLIGHT - SPAN 7): 24K Gold Mirror
          ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.65, ease: EASE_SNAPPY }}
            className="md:col-span-12 lg:col-span-7 rounded-[2rem] p-7 sm:p-10 bg-gradient-to-br from-amber-500/[0.04] via-card/70 to-card/50 dark:from-amber-950/20 dark:via-slate-900/40 dark:to-zinc-950/40 backdrop-blur-2xl border border-amber-500/30 shadow-xl hover:shadow-[0_0_50px_rgba(245,158,11,0.18)] transition-all duration-500 flex flex-col justify-between group"
          >
            <div>
              {/* Header Badge & Price */}
              <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-6">
                <span className="text-xs font-bold px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{goldMaterial.badge}</span>
                </span>
                <span className="text-2xl font-black font-outfit text-amber-500">
                  {goldMaterial.price}
                </span>
              </div>

              {/* 3D Interactive Card Display */}
              <Interactive3DCard material={goldMaterial} aspectRatio="aspect-[1.586/1]" />

              <div className="space-y-3 mt-6">
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {goldMaterial.name} ({goldMaterial.subtitle})
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {goldMaterial.description}
                </p>
              </div>

              {/* Checkpoints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-5">
                {goldMaterial.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-[11px] font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border/60 mt-8">
              <Link href={`/order?material=${goldMaterial.id}`} className="block w-full">
                <Button className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group cursor-pointer transition-all">
                  <span>سفارش کارت طلای 24 عیار</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1.5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* ========================================================
              BENTO TILE 2 (EXECUTIVE - SPAN 5): Black Titanium Metal
          ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.65, ease: EASE_SNAPPY, delay: 0.1 }}
            className="md:col-span-12 lg:col-span-5 rounded-[2rem] p-7 sm:p-9 bg-card/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-xl hover:border-slate-400/50 hover:shadow-[0_0_50px_rgba(148,163,184,0.18)] transition-all duration-500 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-6">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full border border-slate-500/30 bg-slate-500/10 text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{metalMaterial.badge}</span>
                </span>
                <span className="text-2xl font-black font-outfit text-foreground">
                  {metalMaterial.price}
                </span>
              </div>

              {/* 3D Interactive Card Display */}
              <Interactive3DCard material={metalMaterial} aspectRatio="aspect-[1.586/1]" />

              <div className="space-y-3 mt-6">
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {metalMaterial.name} ({metalMaterial.subtitle})
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {metalMaterial.description}
                </p>
              </div>

              <div className="space-y-2 pt-5">
                {metalMaterial.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-[11px] font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border/60 mt-8">
              <Link href={`/order?material=${metalMaterial.id}`} className="block w-full">
                <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-700 hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer transition-all">
                  <span>سفارش کارت فلزی تیتانیوم</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* ========================================================
              BENTO TILE 3 (POPULAR - SPAN 6): Matte Obsidian PVC
          ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.65, ease: EASE_SNAPPY }}
            className="md:col-span-12 lg:col-span-6 rounded-[2rem] p-7 sm:p-9 bg-card/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-xl hover:border-cyan-500/50 hover:shadow-[0_0_50px_rgba(6,182,212,0.18)] transition-all duration-500 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-6">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{pvcMaterial.badge}</span>
                </span>
                <span className="text-2xl font-black font-outfit text-cyan-400">
                  {pvcMaterial.price}
                </span>
              </div>

              {/* 3D Interactive Card Display */}
              <Interactive3DCard material={pvcMaterial} aspectRatio="aspect-[1.586/1]" />

              <div className="space-y-3 mt-6">
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {pvcMaterial.name} ({pvcMaterial.subtitle})
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {pvcMaterial.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-5">
                {pvcMaterial.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-[11px] font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border/60 mt-8">
              <Link href={`/order?material=${pvcMaterial.id}`} className="block w-full">
                <Button className="w-full h-12 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 group cursor-pointer transition-all">
                  <span>سفارش کارت پی‌وی‌سی مخملی</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* ========================================================
              BENTO TILE 4 (ORGANIC - SPAN 6): Eco Walnut Wood
          ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.65, ease: EASE_SNAPPY, delay: 0.1 }}
            className="md:col-span-12 lg:col-span-6 rounded-[2rem] p-7 sm:p-9 bg-card/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-xl hover:border-emerald-500/50 hover:shadow-[0_0_50px_rgba(16,185,129,0.18)] transition-all duration-500 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-6">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>{woodMaterial.badge}</span>
                </span>
                <span className="text-2xl font-black font-outfit text-emerald-400">
                  {woodMaterial.price}
                </span>
              </div>

              {/* 3D Interactive Card Display */}
              <Interactive3DCard material={woodMaterial} aspectRatio="aspect-[1.586/1]" />

              <div className="space-y-3 mt-6">
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {woodMaterial.name} ({woodMaterial.subtitle})
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {woodMaterial.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-5">
                {woodMaterial.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border/60 mt-8">
              <Link href={`/order?material=${woodMaterial.id}`} className="block w-full">
                <Button variant="outline" className="w-full h-12 rounded-2xl border-emerald-500/40 hover:bg-emerald-500/10 text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer transition-all">
                  <span>سفارش کارت چوب طبیعی</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default LuxuryMaterialsShowcase;
