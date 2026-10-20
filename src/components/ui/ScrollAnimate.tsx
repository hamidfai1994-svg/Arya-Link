'use client';

import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

export type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface ScrollAnimateProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: AnimationDirection;
  distance?: number;
  className?: string;
  viewport?: {
    once?: boolean;
    margin?: string;
    amount?: number | 'some' | 'all';
  };
  scale?: number;
}

export function ScrollAnimate({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 32,
  className = '',
  viewport = { once: false, amount: 0.15 },
  scale,
  ...props
}: ScrollAnimateProps) {
  const prefersReducedMotion = useReducedMotion();

  // If the user prefers reduced motion, render without movement
  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: initialPos.x,
        y: initialPos.y,
        scale: scale !== undefined ? scale : 1,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={viewport}
      transition={{
        duration,
        delay,
        ease: [0, 0.7, 0.2, 1], // Ultra-snappy instant launch ease-out curve
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default ScrollAnimate;
