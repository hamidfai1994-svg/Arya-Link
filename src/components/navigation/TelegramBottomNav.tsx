'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { LayoutDashboard, Users, ShoppingBag, Wallet } from 'lucide-react';

export type TelegramTabId = 'dashboard' | 'users' | 'orders' | 'finance';

export const NAV_ITEMS = [
  { id: 'finance', label: 'مالی', icon: Wallet },
  { id: 'orders', label: 'سفارشات', icon: ShoppingBag },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'dashboard', label: 'پیشخوان', icon: LayoutDashboard },
] as const;

// تابع محاسبات ریاضی برای رسم منحنی شیشه‌ای داینامیک
function generatePillPath(w: number, h: number, r: number, bx: number, bw: number, bh: number) {
  const t = 0, L = r, R = w - r, a = Math.max(L + bw / 2, Math.min(R - bw / 2, bx));
  let top = `M${L},${t}`;
  if (bh) {
    const s = a - bw / 2, e = a + bw / 2, q = bw * 0.28;
    top += ` L${s},${t} C${s + q},${t} ${a - bw * 0.22},${t - bh} ${a},${t - bh} C${a + bw * 0.22},${t - bh} ${e - q},${t} ${e},${t}`;
  }
  return top + ` L${R},${t} A${r},${r} 0 0 1 ${R},${h} L${L},${h} A${r},${r} 0 0 1 ${L},${t} Z`;
}

interface TelegramBottomNavProps {
  activeTab?: TelegramTabId;
  onChange?: (tab: TelegramTabId) => void;
}

export default function TelegramBottomNav({ activeTab, onChange }: TelegramBottomNavProps) {
  const [active, setActive] = useState(3); // پیش‌فرض روی تب آخر (پیشخوان)
  const navRef = useRef<HTMLElement>(null);
  const [navWidth, setNavWidth] = useState(0);
  const [pathD, setPathD] = useState('');

  // فیزیک فنری (Spring) برای حرکت نرم دکمه شناور
  const springX = useSpring(0, { stiffness: 350, damping: 30 });

  // همگام‌سازی با تب فعال از پراپس ورودی در صورت وجود
  useEffect(() => {
    if (activeTab) {
      const idx = NAV_ITEMS.findIndex((item) => item.id === activeTab);
      if (idx !== -1) {
        setActive(idx);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const updateWidth = () => {
      if (navRef.current) setNavWidth(navRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (navWidth > 0) {
      const itemWidth = navWidth / NAV_ITEMS.length;
      const targetX = (active + 0.5) * itemWidth;
      springX.set(targetX);
    }
  }, [active, navWidth, springX]);

  useEffect(() => {
    const unsubscribe = springX.on('change', (latestX) => {
      if (navWidth > 0) {
        // bw: عرض فرورفتگی، bh: عمق فرورفتگی
        setPathD(generatePillPath(navWidth, 70, 35, latestX, 105, -34));
      }
    });
    return () => unsubscribe();
  }, [springX, navWidth]);

  const ActiveIcon = NAV_ITEMS[active]?.icon || LayoutDashboard;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto" dir="ltr">
      <nav ref={navRef} className="relative h-[70px] w-full flex items-center">
        
        {/* پس‌زمینه شیشه‌ای بلور شده */}
        <div className="absolute inset-0 rounded-full bg-slate-900/40 backdrop-blur-xl -z-20"></div>

        {/* رسم لایه داینامیک SVG با Stroke */}
        <div className="absolute -inset-[2px] pointer-events-none -z-10" style={{ top: '-40px' }}>
          <svg viewBox={`-2 -40 ${navWidth + 4} 112`} className="w-full h-full overflow-visible">
            <path
              d={pathD}
              fill="rgba(15, 23, 42, 0.75)"
              stroke="rgba(6, 182, 212, 0.4)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* دکمه شناور (Floating Button) */}
        <motion.div
          className="absolute top-0 -mt-[28px] w-[56px] h-[56px] rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-600 shadow-[0_0_22px_rgba(6,182,212,0.55)] border border-cyan-200/50 z-10"
          style={{ x: springX, left: -28 }}
        >
          <ActiveIcon className="w-6 h-6 text-white" />
        </motion.div>

        {/* دکمه‌های منو */}
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === active;
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActive(index);
                onChange?.(item.id as TelegramTabId);
                if (typeof window !== 'undefined') {
                  const tg = (window as any).Telegram?.WebApp;
                  tg?.HapticFeedback?.selectionChanged();
                }
              }}
              className="flex-1 flex flex-col items-center justify-center gap-1 z-0 relative h-full cursor-pointer select-none"
            >
              <Icon
                className={`w-[22px] h-[22px] transition-all duration-300 ${
                  isActive ? 'opacity-0 scale-50' : 'opacity-100 text-slate-300'
                }`}
              />
              <span
                className={`text-[11px] font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
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

