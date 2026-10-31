'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useBranding } from '@/lib/branding/BrandingContext';
import { cn } from '@/lib/utils';

export interface SiteLogoProps {
  /** Width in pixels (default: 40) */
  width?: number;
  /** Height in pixels (default: 40) */
  height?: number;
  /** Class name applied to outer container */
  className?: string;
  /** Class name applied directly to the image or fallback badge */
  imageClassName?: string;
  /** Text class name for site title */
  textClassName?: string;
  /** Alt text for the image */
  alt?: string;
  /** Whether image should load with priority */
  priority?: boolean;
  /** If true, displays site name text next to logo */
  showText?: boolean;
  /** Custom site name override */
  siteName?: string;
  /** If true, displays PRO or custom badge */
  showBadge?: boolean;
  /** Badge text (default: 'PRO') */
  badgeText?: string;
  /** Subtitle displayed below site name */
  subtitle?: string;
  /** Link href to wrap logo (e.g. '/' or '/dashboard'). Leave undefined for raw component */
  href?: string | null;
  /** Fallback letters when no logo is set (default: 'AL') */
  fallbackText?: string;
  /** Direct override logo URL if available */
  overrideLogo?: string;
}

export function SiteLogo({
  width = 40,
  height = 40,
  className,
  imageClassName,
  textClassName,
  alt,
  priority = false,
  showText = false,
  siteName,
  showBadge = false,
  badgeText = 'PRO',
  subtitle,
  href,
  fallbackText = 'AL',
  overrideLogo,
}: SiteLogoProps) {
  const { settings } = useBranding();
  const [imageError, setImageError] = useState(false);

  const effectiveLogo = overrideLogo !== undefined ? overrideLogo : settings?.companyLogo;
  const effectiveSiteName = siteName || settings?.siteName || 'Arya Link';

  // Reset error state if logo URL changes
  useEffect(() => {
    setImageError(false);
  }, [effectiveLogo]);

  // Determine fallback size styling
  const fontSizeClass =
    width >= 56 ? 'text-xl' : width >= 44 ? 'text-base' : width >= 36 ? 'text-sm' : 'text-xs';

  const logoGraphic =
    effectiveLogo && !imageError ? (
      <div
        className={cn(
          'relative flex items-center justify-center shrink-0 bg-transparent',
          imageClassName
        )}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image
          src={effectiveLogo}
          alt={alt || effectiveSiteName}
          width={width}
          height={height}
          priority={priority}
          unoptimized
          onError={() => setImageError(true)}
          className="w-full h-full object-contain bg-transparent"
        />
      </div>
    ) : (
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className={cn(
          'rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black font-sans shadow-md shadow-cyan-500/25 shrink-0 select-none group-hover:scale-105 transition-transform duration-200',
          fontSizeClass,
          imageClassName
        )}
      >
        {fallbackText}
      </div>
    );

  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      {logoGraphic}

      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-extrabold text-foreground tracking-tight font-sans text-base sm:text-lg',
                textClassName
              )}
            >
              {effectiveSiteName}
            </span>
            {showBadge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 font-sans">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground hidden sm:block truncate max-w-xs">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}

export default SiteLogo;
