'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, ShoppingBag, Wallet } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type TelegramTabId = 'dashboard' | 'users' | 'orders' | 'finance';

// آیتم‌های پیش‌فرض برای داشبورد ادمین (در صورت پاس داده نشدن پراپ items)
export const DEFAULT_ADMIN_ITEMS: readonly NavItem[] = [
  { id: 'finance', label: 'مالی', icon: Wallet },
  { id: 'orders', label: 'سفارشات', icon: ShoppingBag },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'dashboard', label: 'پیشخوان', icon: LayoutDashboard },
] as const;

// ابعاد استاندارد برای هماهنگی فرورفتگی با دکمه شناور ۵۶ پیکسلی
const NAV_CONFIG = {
  height: 68,
  cornerRadius: 20,
  buttonRadius: 28,
};

// تابع محاسبات دقیق هندسه منحنی بزیه برای رسم فرورفتگی مایع شیشه‌ای
function generatePillPath(
  w: number,
  h: number,
  r: number,
  bx: number,
  bw: number,
  bh: number
): string {
  if (w <= 0) return '';

  const halfBw = bw / 2;
  const minCenter = r + halfBw;
  const maxCenter = w - r - halfBw;
  const a = Math.max(minCenter, Math.min(maxCenter, bx));

  const s = a - halfBw;
  const e = a + halfBw;
  const q1 = bw * 0.22;
  const q2 = bw * 0.2;
  const depth = bh;

  return (
    `M ${r},0 ` +
    `L ${s},0 ` +
    `C ${s + q1},0 ${a - q2},${depth} ${a},${depth} ` +
    `C ${a + q2},${depth} ${e - q1},0 ${e},0 ` +
    `L ${w - r},0 ` +
    `A ${r},${r} 0 0 1 ${w},${r} ` +
    `L ${w},${h - r} ` +
    `A ${r},${r} 0 0 1 ${w - r},${h} ` +
    `L ${r},${h} ` +
    `A ${r},${r} 0 0 1 0,${h - r} ` +
    `L 0,${r} ` +
    `A ${r},${r} 0 0 1 ${r},0 Z`
  );
}

export interface LiquidBottomNavProps<T extends string = string> {
  items?: readonly NavItem[] | NavItem[];
  activeTab?: T;
  onChange?: (tab: T) => void;
  defaultIndex?: number;
}

export default function TelegramBottomNav<T extends string = string>({
  items,
  activeTab,
  onChange,
  defaultIndex,
}: LiquidBottomNavProps<T>) {
  const currentItems: readonly NavItem[] = items && items.length > 0 ? items : DEFAULT_ADMIN_ITEMS;

  // تعیین ایندکس اولیه: در صورت عدم ارسال، برای ۴ تایی ایندکس ۳ (پیشخوان) و برای ۵ تایی ایندکس ۲ (افزودن)
  const initialIdx =
    defaultIndex !== undefined
      ? defaultIndex
      : currentItems.length === 5
      ? 2
      : currentItems.length - 1;

  const [active, setActive] = useState(initialIdx);
  const navRef = useRef<HTMLElement>(null);
  const [navWidth, setNavWidth] = useState(0);
  const [pathD, setPathD] = useState('');

  // فیزیک فنری دقیق برای حرکت روان و بدون لرزش دکمه شناور
  const springX = useSpring(0, { stiffness: 380, damping: 32 });

  // همگام‌سازی استیت محلی با مقدار تب فعال پاس داده شده
  useEffect(() => {
    if (activeTab) {
      const idx = currentItems.findIndex((item) => item.id === activeTab);
      if (idx !== -1) {
        setActive(idx);
      }
    }
  }, [activeTab, currentItems]);

  useEffect(() => {
    const updateWidth = () => {
      if (navRef.current) {
        setNavWidth(navRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // ابعاد فرورفتگی متناسب با تعداد تب‌ها
  const dipWidth = currentItems.length >= 5 ? 76 : 80;
  const dipDepth = 32;
  const sidePadding = currentItems.length >= 5 ? 12 : 20;

  // محاسبه داینامیک موقعیت دکمه شناور بر اساس تعداد تب‌ها
  useEffect(() => {
    if (navWidth > 0 && currentItems.length > 0) {
      const innerWidth = navWidth - sidePadding * 2;
      const itemWidth = innerWidth / currentItems.length;
      const rawTargetX = sidePadding + (active + 0.5) * itemWidth;

      // کلمپ کردن targetX برای جلوگیری از بیرون‌زدگی دکمه و منحنی
      const minX = Math.max(NAV_CONFIG.cornerRadius + dipWidth / 2, NAV_CONFIG.buttonRadius + 4);
      const maxX = navWidth - minX;
      const targetX = Math.max(minX, Math.min(maxX, rawTargetX));

      springX.set(targetX);
    }
  }, [active, navWidth, currentItems.length, sidePadding, dipWidth, springX]);

  // به‌روزرسانی مداوم مسیر منحنی SVG
  useEffect(() => {
    if (navWidth > 0) {
      const unsubscribe = springX.on('change', (latestX) => {
        setPathD(
          generatePillPath(
            navWidth,
            NAV_CONFIG.height,
            NAV_CONFIG.cornerRadius,
            latestX,
            dipWidth,
            dipDepth
          )
        );
      });
      return () => unsubscribe();
    }
  }, [springX, navWidth, dipWidth]);

  const handleSelect = (index: number) => {
    setActive(index);
    const item = currentItems[index];
    if (item && onChange) {
      onChange(item.id as T);
    }
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      tg?.HapticFeedback?.selectionChanged();
    }
  };

  const ActiveIcon = currentItems[active]?.icon || LayoutDashboard;

  return (
    <div className="fixed bottom-6 left-3 right-3 z-50 max-w-md mx-auto pointer-events-auto" dir="ltr">
      <nav
        ref={navRef}
        className="relative h-[68px] w-full flex items-center select-none"
        style={{
          paddingLeft: `${sidePadding}px`,
          paddingRight: `${sidePadding}px`,
        }}
      >
        {/* پس‌زمینه شیشه‌ای بلور شده */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl -z-20 border border-white/10"
          style={{ borderRadius: `${NAV_CONFIG.cornerRadius}px` }}
        />

        {/* رسم لایه داینامیک SVG با کانتور فیروزه‌ای */}
        <div className="absolute -inset-[2px] pointer-events-none -z-10" style={{ top: '-40px' }}>
          <svg
            viewBox={`-2 -40 ${navWidth + 4} 112`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <path
              d={pathD}
              fill="rgba(15, 23, 42, 0.85)"
              stroke="rgba(6, 182, 212, 0.45)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* دکمه شناور فیروزه‌ای (Floating Button) */}
        <motion.div
          className="absolute top-0 -mt-[24px] w-[56px] h-[56px] rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-400 via-cyan-500 to-teal-600 shadow-[0_8px_24px_rgba(6,182,212,0.55)] border-2 border-cyan-200/60 z-20 cursor-pointer"
          style={{ x: springX, left: -28 }}
          whileTap={{ scale: 0.94 }}
        >
          {/* نور محیطی زیر دکمه شناور */}
          <div className="absolute -inset-1.5 rounded-full bg-cyan-400/35 blur-md -z-10 pointer-events-none" />

          {/* ترنزیشن نرم تغییر آیکون درون دکمه شناور */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItems[active]?.id || 'active-icon'}
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
              transition={{ duration: 0.18 }}
            >
              <ActiveIcon className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* دکمه‌های ناوبری داینامیک */}
        {currentItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === active;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(index)}
              className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 z-10 relative h-full cursor-pointer select-none group"
            >
              <Icon
                className={`w-[20px] h-[20px] transition-all duration-300 ${
                  isActive
                    ? 'opacity-0 scale-50 -translate-y-2'
                    : 'opacity-100 text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span
                className={`text-[10px] sm:text-[11px] font-medium tracking-tight truncate max-w-full transition-colors duration-300 ${
                  isActive
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export const LiquidBottomNav = TelegramBottomNav;
