'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';

const SLIDE_INTERVAL = 6000;

export function CmsSlidersSection() {
  const { language, dir } = useLanguage();
  const { sliders } = useSiteContent();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlides = (sliders || [])
    .filter((s) => s.isActive !== false && s.imageUrl)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeSlides.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [activeSlides.length, isPaused]);

  if (activeSlides.length === 0) return null;

  const currentSlide = activeSlides[currentIdx] || activeSlides[0];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % activeSlides.length);
  };

  const isRtl = dir === 'rtl';

  return (
    <section
      id="showcase-slider"
      className="py-16 sm:py-24 border-t border-border/80 relative overflow-hidden bg-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Slider Card */}
        <div className="relative rounded-[32px] overflow-hidden border border-cyan-500/20 bg-slate-950/80 shadow-2xl min-h-[460px] sm:min-h-[520px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id || currentIdx}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.65, ease: [0, 0.7, 0.2, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
              />

              {/* Gradient Overlays for Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent dark:from-slate-950 dark:via-slate-950/85" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
            </motion.div>
          </AnimatePresence>

          {/* Foreground Content */}
          <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-10 space-y-6">
            <motion.div
              key={`badge-${currentSlide.id || currentIdx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <Badge variant="cyan" className="font-sans text-xs px-3 py-1 flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{getLocalizedText(currentSlide.badge, language, 'آریا لینک')}</span>
              </Badge>
            </motion.div>

            <motion.h3
              key={`title-${currentSlide.id || currentIdx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
            >
              {getLocalizedText(currentSlide.title, language)}
            </motion.h3>

            <motion.p
              key={`desc-${currentSlide.id || currentIdx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 sm:line-clamp-none"
            >
              {getLocalizedText(currentSlide.subtitle, language)}
            </motion.p>

            {currentSlide.buttonLink && (
              <motion.div
                key={`cta-${currentSlide.id || currentIdx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-2"
              >
                <Link href={currentSlide.buttonLink}>
                  <Button
                    size="lg"
                    className="h-12 px-7 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2"
                  >
                    <span>{getLocalizedText(currentSlide.buttonText, language, 'مشاهده و جزئیات')}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Navigation Arrows */}
          {activeSlides.length > 1 && (
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={isRtl ? handleNext : handlePrev}
                className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 text-white border border-white/10 hover:border-cyan-500/40 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                aria-label="Previous Slide"
              >
                {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={isRtl ? handlePrev : handleNext}
                className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 text-white border border-white/10 hover:border-cyan-500/40 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                aria-label="Next Slide"
              >
                {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Dots Indicator */}
          {activeSlides.length > 1 && (
            <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 flex items-center gap-2">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIdx === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CmsSlidersSection;
