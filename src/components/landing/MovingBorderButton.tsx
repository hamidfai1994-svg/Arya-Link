'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MovingBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  borderClassName?: string;
  duration?: number;
  glow?: boolean;
}

export function MovingBorderButton({
  children,
  containerClassName,
  className,
  borderClassName,
  duration = 4,
  glow = true,
  ...props
}: MovingBorderButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      className={cn(
        'relative p-[1.5px] overflow-hidden rounded-2xl group cursor-pointer inline-flex items-center justify-center select-none',
        containerClassName
      )}
      {...(props as any)}
    >
      {/* 1. Ambient Glow underneath */}
      {glow && (
        <span className="absolute inset-0 rounded-2xl bg-cyan-500/25 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}

      {/* 2. Rotating Conic Gradient Beam */}
      <span
        style={{
          animationDuration: `${duration}s`,
        }}
        className={cn(
          'absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#06b6d4_320deg,#3b82f6_355deg,transparent_360deg)] pointer-events-none',
          borderClassName
        )}
      />

      {/* 3. Button Body */}
      <span
        className={cn(
          'relative z-10 w-full h-full rounded-[15px] bg-slate-950/90 dark:bg-zinc-950/90 backdrop-blur-xl px-7 py-3.5 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors group-hover:bg-slate-900/90 border border-white/10 shadow-inner',
          className
        )}
      >
        {children}
      </span>
    </motion.button>
  );
}

export default MovingBorderButton;
