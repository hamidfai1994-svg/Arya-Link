'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className = '', fill = 'rgba(6, 182, 212, 0.25)' }: SpotlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className={`pointer-events-none absolute z-0 overflow-hidden select-none ${className}`}
    >
      <svg
        className="w-[130%] h-[130%] -translate-x-[15%] -translate-y-[20%] opacity-75"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 3787 2842"
        fill="none"
      >
        <g filter="url(#spotlight-filter)">
          <ellipse
            cx="1924.71"
            cy="273.501"
            rx="1924.71"
            ry="273.501"
            transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
            fill={fill}
            fillOpacity="0.35"
          />
        </g>
        <defs>
          <filter
            id="spotlight-filter"
            x="0.860352"
            y="0.838989"
            width="3785.16"
            height="2840.26"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
}

export default Spotlight;
