'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { WalletServiceType, AfghanBankType, PaymentProviderType } from '@/lib/constants/paymentProviders';
import {
  Landmark,
  Wallet,
  BadgeDollarSign,
  Coins,
  Truck,
  CreditCard,
} from 'lucide-react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// =========================================================================
// 1. AFGHAN WALLET LOGOS (SVG Vector Art)
// =========================================================================

// HesabPay Official Logo
export const HesabPayLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#hp-grad)" />
    <path
      d="M7 11.5C7 9.567 8.567 8 10.5 8H21.5C23.433 8 25 9.567 25 11.5V20.5C25 22.433 23.433 24 21.5 24H10.5C8.567 24 7 22.433 7 20.5V11.5Z"
      stroke="#ffffff"
      strokeWidth="1.8"
    />
    <path d="M12 12V20M12 16H18M18 12V20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="21" cy="16" r="1.5" fill="#10b981" />
    <defs>
      <linearGradient id="hp-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#059669" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
  </svg>
);

// M-Paisa (Roshan Telecom)
export const MPaisaLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#mpaisa-grad)" />
    <circle cx="16" cy="16" r="11" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
    <circle cx="16" cy="16" r="7.5" fill="#ffffff" fillOpacity="0.15" />
    <path
      d="M10 20V12L16 17L22 12V20"
      stroke="#ffffff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="mpaisa-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#dc2626" />
        <stop offset="1" stopColor="#991b1b" />
      </linearGradient>
    </defs>
  </svg>
);

// ATOMA Pay
export const AtomaPayLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#atoma-grad)" />
    <polygon points="16,6 26,11.5 26,22.5 16,28 6,22.5 6,11.5" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.6" />
    <path d="M16 9L21 21H18.5L16 15L13.5 21H11L16 9Z" fill="#ffffff" />
    <path d="M13.8 17.5H18.2" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="atoma-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7c3aed" />
        <stop offset="1" stopColor="#5b21b6" />
      </linearGradient>
    </defs>
  </svg>
);

// My-Money (Afghan Wireless AWCC)
export const MyMoneyLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#mymoney-grad)" />
    <path d="M7 16C7 11.029 11.029 7 16 7" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
    <path d="M9.5 16C9.5 12.41 12.41 9.5 16 9.5" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="16" cy="17" r="6" fill="#ffffff" fillOpacity="0.2" stroke="#ffffff" strokeWidth="1.5" />
    <text x="16" y="20.5" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
      M
    </text>
    <defs>
      <linearGradient id="mymoney-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e40af" />
        <stop offset="1" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
  </svg>
);

// Aurum AFG
export const AurumAfgLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#aurum-grad)" />
    <circle cx="16" cy="16" r="10" stroke="#fde047" strokeWidth="1.5" strokeDasharray="3 2" />
    <path d="M12 21L16 9L20 21" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="15" r="2" fill="#fde047" />
    <defs>
      <linearGradient id="aurum-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#d97706" />
        <stop offset="1" stopColor="#b45309" />
      </linearGradient>
    </defs>
  </svg>
);

// StarPay
export const StarPayLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#starpay-grad)" />
    <path
      d="M16 6L18.8 12.8L26 13.5L20.5 18.2L22.2 25L16 21.2L9.8 25L11.5 18.2L6 13.5L13.2 12.8L16 6Z"
      fill="#ffffff"
    />
    <circle cx="16" cy="16" r="3" fill="#0891b2" />
    <defs>
      <linearGradient id="starpay-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06b6d4" />
        <stop offset="1" stopColor="#0e7490" />
      </linearGradient>
    </defs>
  </svg>
);

// =========================================================================
// 2. AFGHAN BANK LOGOS (SVG Vector Art)
// =========================================================================

// Afghanistan International Bank (AIB)
export const AIBLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#aib-grad)" />
    <circle cx="16" cy="16" r="9" stroke="#ffffff" strokeWidth="1.5" />
    <ellipse cx="16" cy="16" rx="4" ry="9" stroke="#38bdf8" strokeWidth="1.2" />
    <line x1="7" y1="16" x2="25" y2="16" stroke="#38bdf8" strokeWidth="1.2" />
    <text x="16" y="27" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
      AIB
    </text>
    <defs>
      <linearGradient id="aib-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0369a1" />
        <stop offset="1" stopColor="#0c4a6e" />
      </linearGradient>
    </defs>
  </svg>
);

// Azizi Bank
export const AziziBankLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#azizi-grad)" />
    <circle cx="16" cy="14" r="7" stroke="#ffffff" strokeWidth="1.8" />
    <path d="M12 14L16 10L20 14M16 10V18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    <text x="16" y="27" fill="#fef08a" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
      AZIZI
    </text>
    <defs>
      <linearGradient id="azizi-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#b45309" />
        <stop offset="1" stopColor="#78350f" />
      </linearGradient>
    </defs>
  </svg>
);

// Da Afghanistan Bank (DAB - Central Bank)
export const DABLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#dab-grad)" />
    <circle cx="16" cy="16" r="10" stroke="#fcd34d" strokeWidth="1.5" />
    <path d="M16 8L22 12H10L16 8Z" fill="#ffffff" />
    <rect x="11" y="13" width="2" height="6" fill="#ffffff" />
    <rect x="15" y="13" width="2" height="6" fill="#ffffff" />
    <rect x="19" y="13" width="2" height="6" fill="#ffffff" />
    <rect x="9" y="20" width="14" height="2" fill="#ffffff" />
    <defs>
      <linearGradient id="dab-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#d97706" />
        <stop offset="1" stopColor="#451a03" />
      </linearGradient>
    </defs>
  </svg>
);

// New Kabul Bank
export const NewKabulBankLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#nkb-grad)" />
    <rect x="8" y="10" width="16" height="12" rx="2" stroke="#ffffff" strokeWidth="1.6" />
    <path d="M12 10V22M20 10V22" stroke="#86efac" strokeWidth="1.5" />
    <path d="M8 15H24" stroke="#ffffff" strokeWidth="1.5" />
    <defs>
      <linearGradient id="nkb-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#047857" />
        <stop offset="1" stopColor="#064e3b" />
      </linearGradient>
    </defs>
  </svg>
);

// Pashtany Bank
export const PashtanyBankLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#pashtany-grad)" />
    <circle cx="16" cy="16" r="9" stroke="#ffffff" strokeWidth="1.6" />
    <path d="M12 11H17C18.657 11 20 12.343 20 14C20 15.657 18.657 17 17 17H12V22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="pashtany-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#b91c1c" />
        <stop offset="1" stopColor="#7f1d1d" />
      </linearGradient>
    </defs>
  </svg>
);

// Bank-e-Millie Afghan
export const BankMillieLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#bma-grad)" />
    <path d="M16 6L24 10V17C24 21.5 20.5 25.5 16 27C11.5 25.5 8 21.5 8 17V10L16 6Z" stroke="#ffffff" strokeWidth="1.8" />
    <text x="16" y="19" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
      BMA
    </text>
    <defs>
      <linearGradient id="bma-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0f766e" />
        <stop offset="1" stopColor="#115e59" />
      </linearGradient>
    </defs>
  </svg>
);

// Generic / Other Afghan Banks (Ghazanfar, Maiwand, Islamic Bank, Afghan United, FMFB)
export const GenericBankLogo: React.FC<LogoProps & { letter?: string; gradientColor?: string }> = ({
  className,
  size = 24,
  letter = 'B',
  gradientColor = 'from-slate-700 to-slate-900',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="#1e293b" />
    <path d="M16 7L24 11H8L16 7Z" fill="#94a3b8" />
    <rect x="10" y="12" width="2.5" height="7" fill="#cbd5e1" />
    <rect x="14.75" y="12" width="2.5" height="7" fill="#cbd5e1" />
    <rect x="19.5" y="12" width="2.5" height="7" fill="#cbd5e1" />
    <rect x="8" y="20" width="16" height="2.5" fill="#94a3b8" />
    <text x="16" y="27" fill="#38bdf8" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
      {letter}
    </text>
  </svg>
);

// =========================================================================
// 3. CRYPTO & PROVIDER CATEGORY LOGOS (USDT TRC20, COD, Installment)
// =========================================================================

// Tether USDT Logo
export const TetherLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#usdt-grad)" />
    <circle cx="16" cy="16" r="10" stroke="#a7f3d0" strokeWidth="1.2" strokeOpacity="0.4" />
    <path
      d="M19.5 12H12.5M16 12V22M10 15.5C10 14.12 12.69 13 16 13C19.31 13 22 14.12 22 15.5C22 16.88 19.31 18 16 18C12.69 18 10 16.88 10 15.5Z"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="usdt-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0d9488" />
        <stop offset="1" stopColor="#042f2e" />
      </linearGradient>
    </defs>
  </svg>
);

// Hawala / Sarrafi Logo
export const HawalaLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#hawala-grad)" />
    <rect x="7" y="10" width="18" height="12" rx="2" stroke="#ffffff" strokeWidth="1.8" />
    <circle cx="16" cy="16" r="3.5" stroke="#fde68a" strokeWidth="1.6" />
    <path d="M10 14V18M22 14V18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="hawala-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#b45309" />
        <stop offset="1" stopColor="#78350f" />
      </linearGradient>
    </defs>
  </svg>
);

// Cash on Delivery (COD) Truck
export const CodLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#cod-grad)" />
    <path d="M6 11H18V21H6V11Z" stroke="#ffffff" strokeWidth="1.6" />
    <path d="M18 14H22L25 17V21H18V14Z" stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="11" cy="22" r="2.5" fill="#c084fc" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="21" cy="22" r="2.5" fill="#c084fc" stroke="#ffffff" strokeWidth="1.5" />
    <defs>
      <linearGradient id="cod-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7e22ce" />
        <stop offset="1" stopColor="#581c87" />
      </linearGradient>
    </defs>
  </svg>
);

// Installment Calendar
export const InstallmentLogo: React.FC<LogoProps> = ({ className, size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0', className)}
    {...props}
  >
    <rect width="32" height="32" rx="8" fill="url(#inst-grad)" />
    <rect x="7" y="9" width="18" height="15" rx="3" stroke="#ffffff" strokeWidth="1.8" />
    <path d="M11 7V10M21 7V10" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 13H25" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="12" cy="17" r="1.2" fill="#fda4af" />
    <circle cx="16" cy="17" r="1.2" fill="#fda4af" />
    <circle cx="20" cy="17" r="1.2" fill="#fda4af" />
    <circle cx="12" cy="20.5" r="1.2" fill="#fda4af" />
    <circle cx="16" cy="20.5" r="1.2" fill="#fda4af" />
    <defs>
      <linearGradient id="inst-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#be123c" />
        <stop offset="1" stopColor="#881337" />
      </linearGradient>
    </defs>
  </svg>
);

// =========================================================================
// 4. ZERO-404 SAFE LOGO BADGE (DYNAMIC CUSTOM LOGO WITH LUCIDE FALLBACK)
// =========================================================================

// Kept for backward compatibility but strictly returns null to prevent 404 image requests
export const STATIC_LOGO_PATHS: Record<string, string> = {};

export function getStaticLogoPath(_id?: string, _type?: string): string | null {
  return null;
}

interface PaymentLogoBadgeProps {
  type?: 'wallet' | 'bank' | 'crypto' | 'hawala' | 'cod' | 'installment' | 'provider';
  id?: string;
  customLogoUrl?: string;
  size?: number;
  className?: string;
}

export const PaymentLogoBadge: React.FC<PaymentLogoBadgeProps> = ({
  type = 'wallet',
  id = '',
  customLogoUrl,
  size = 24,
  className,
}) => {
  const [customImgError, setCustomImgError] = React.useState(false);

  React.useEffect(() => {
    setCustomImgError(false);
  }, [customLogoUrl]);

  // 1. If admin provided a custom uploaded logo URL (uploads or Base64) and it hasn't errored
  if (customLogoUrl && customLogoUrl.trim() !== '' && !customImgError) {
    return (
      <img
        src={customLogoUrl}
        alt={id || type || 'payment-logo'}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={cn('rounded-lg object-contain shrink-0 bg-slate-900/60 p-0.5', className)}
        onError={() => setCustomImgError(true)}
      />
    );
  }

  // 2. Safe Fallback: NEVER load from /logos/*.png static files to avoid 404 errors!
  // Instead, render Lucide icons with thematic styled badge containers.
  const normId = (id || '').toLowerCase().trim();
  const normType = (type || '').toLowerCase().trim();

  const isBank =
    normType === 'bank' ||
    normId.includes('bank') ||
    normId.includes('aib') ||
    normId.includes('azizi') ||
    normId.includes('ghazanfar') ||
    normId.includes('maiwand') ||
    normId.includes('kabul') ||
    normId.includes('pashtany') ||
    normId.includes('melli') ||
    normId.includes('millie') ||
    normId.includes('bma') ||
    normId.includes('united') ||
    normId.includes('islamic') ||
    normId.includes('fmfb') ||
    normId === 'dab';

  const isHawala =
    normType === 'hawala' ||
    normId.includes('hawala') ||
    normId.includes('sarafi');

  const isCrypto =
    normType === 'crypto' ||
    normId.includes('crypto') ||
    normId.includes('usdt') ||
    normId.includes('tether') ||
    normId.includes('btc') ||
    normId.includes('polygon') ||
    normId.includes('trc20') ||
    normId.includes('erc20');

  const isCod =
    normType === 'cod' ||
    normId.includes('cod') ||
    normId.includes('delivery');

  const isInstallment =
    normType === 'installment' ||
    normId.includes('installment') ||
    normId.includes('qest');

  const iconSize = Math.max(14, Math.round(size * 0.55));

  if (isBank) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          'rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-sm',
          className
        )}
        title="بانک تجارتی"
      >
        <Landmark size={iconSize} />
      </div>
    );
  }

  if (isHawala) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          'rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm',
          className
        )}
        title="حواله صرافی"
      >
        <BadgeDollarSign size={iconSize} />
      </div>
    );
  }

  if (isCrypto) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          'rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-sm',
          className
        )}
        title="ارز دیجیتال"
      >
        <Coins size={iconSize} />
      </div>
    );
  }

  if (isCod) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          'rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-sm',
          className
        )}
        title="پرداخت در محل"
      >
        <Truck size={iconSize} />
      </div>
    );
  }

  if (isInstallment) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          'rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-sm',
          className
        )}
        title="خرید اقساطی"
      >
        <CreditCard size={iconSize} />
      </div>
    );
  }

  // Default fallback: Wallet (HesabPay, M-Paisa, ATOMA, My-Money, etc.)
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm',
        className
      )}
      title="کیف پول دیجیتال"
    >
      <Wallet size={iconSize} />
    </div>
  );
};

