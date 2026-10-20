'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* 1. Subtle High-Tech Grid Pattern with Radial Vignette */}
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" 
      />

      {/* 2. Top-Center Ambient Light Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-[80px]" />

      {/* 3. Floating Brand Glow 1: Vibrant Cyan Halo (Top-Right / Center) */}
      <motion.div
        animate={{
          x: [0, 70, -40, 0],
          y: [0, -50, 60, 0],
          scale: [1, 1.18, 0.92, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-24 right-[10%] sm:right-[15%] w-[480px] sm:w-[620px] h-[480px] sm:h-[620px] rounded-full bg-gradient-to-br from-cyan-500/20 via-teal-400/15 to-transparent blur-[130px] sm:blur-[160px]"
      />

      {/* 4. Floating Brand Glow 2: Deep Violet / Purple Halo (Middle-Left) */}
      <motion.div
        animate={{
          x: [0, -60, 50, 0],
          y: [0, 70, -40, 0],
          scale: [1, 1.22, 0.9, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/4 -left-16 sm:left-[5%] w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] rounded-full bg-gradient-to-tr from-purple-600/20 via-indigo-500/15 to-transparent blur-[140px] sm:blur-[170px]"
      />

      {/* 5. Floating Brand Glow 3: Electric Sky Blue Halo (Bottom-Center / Right) */}
      <motion.div
        animate={{
          x: [0, 45, -55, 0],
          y: [0, -45, 35, 0],
          scale: [0.95, 1.12, 0.98, 0.95],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute top-2/3 right-1/4 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full bg-gradient-to-tl from-blue-600/15 via-cyan-500/10 to-transparent blur-[130px] sm:blur-[150px]"
      />
    </div>
  );
}

export default AuroraBackground;
