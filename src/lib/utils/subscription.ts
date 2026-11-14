/**
 * Subscription & Access Control Helper
 * مدیریت اشتراک‌های کاربری، کنترل دسترسی و محدودسازی امکانات آریا لینک
 */

export type PlanType = 'free' | 'pro' | 'vip';

export interface UserSubscriptionInfo {
  planType?: string | null;
  subscriptionPlan?: string | null;
  planExpiresAt?: Date | string | null;
  features?: Record<string, any>;
}

export interface PlanConfig {
  id: PlanType;
  titleFa: string;
  badgeLabel: string;
  badgeClass: string;
  priceAfn: number;
  maxCards: number;
  customDomain: boolean;
  removeBranding: boolean;
  advancedAnalytics: boolean;
  proModules: boolean;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  free: {
    id: 'free',
    titleFa: 'رایگان (پایه)',
    badgeLabel: 'رایگان',
    badgeClass: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    priceAfn: 0,
    maxCards: 1,
    customDomain: false,
    removeBranding: false,
    advancedAnalytics: false,
    proModules: false,
  },
  pro: {
    id: 'pro',
    titleFa: 'حرفه‌ای (Pro)',
    badgeLabel: 'حرفه‌ای PRO',
    badgeClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    priceAfn: 990,
    maxCards: 5,
    customDomain: true,
    removeBranding: true,
    advancedAnalytics: true,
    proModules: true,
  },
  vip: {
    id: 'vip',
    titleFa: 'ویژه و سازمانی (VIP)',
    badgeLabel: 'ویژه VIP',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    priceAfn: 2490,
    maxCards: 999,
    customDomain: true,
    removeBranding: true,
    advancedAnalytics: true,
    proModules: true,
  },
};

/**
 * ماژول‌های ویژه و پیشرفته که نیازمند اشتراک Pro یا VIP هستند
 */
export const PRO_MODULE_TYPES: readonly string[] = [
  'payment', // درگاه و روش‌های پرداخت افغان
  'donation_hesabpay', // حمایت مالی و انعام حساب‌پی
  'sale_checkout', // لینک فروش و پرداخت مستقیم
  'product_card', // نمایش و فروش محصول
  'contact_form', // فرم تماس و پیام بازدیدکنندگان
  'image_gallery', // گالری تصاویر
  'image_slider', // اسلایدر متحرک تصاویر
  'pdf_catalog', // کاتالوگ و منوی PDF
  'video_meeting', // تماس تصویری و جلسه آنلاین
  'business_hours', // ساعات کاری هوشمند
  'countdown_timer', // شمارشگر معکوس
] as const;

/**
 * بررسی می‌کند آیا تاریخ انقضای پلن گذشته است یا خیر
 */
export function isPlanExpired(planExpiresAt?: Date | string | null): boolean {
  if (!planExpiresAt) return false;
  const expiryDate = new Date(planExpiresAt);
  if (isNaN(expiryDate.getTime())) return false;
  return expiryDate.getTime() < Date.now();
}

/**
 * تعیین پلن فعال و نافذ کاربر با در نظر گرفتن تاریخ انقضا
 * اگر انقضا گذشته باشد، کاربر به صورت خودکار به عنوان 'free' در نظر گرفته می‌شود
 */
export function getEffectivePlan(user?: UserSubscriptionInfo | null): PlanType {
  if (!user) return 'free';

  // بررسی انقضای زمانی
  if (isPlanExpired(user.planExpiresAt)) {
    return 'free';
  }

  const rawPlan = (user.planType || user.subscriptionPlan || 'free').toLowerCase();
  if (rawPlan === 'vip' || rawPlan === 'enterprise') return 'vip';
  if (rawPlan === 'pro') return 'pro';
  return 'free';
}

/**
 * رتبه عددی هر پلن جهت مقایسه سطح دسترسی
 */
export function getPlanRank(plan?: string | null): number {
  const normalized = (plan || 'free').toLowerCase();
  if (normalized === 'vip' || normalized === 'enterprise') return 2;
  if (normalized === 'pro') return 1;
  return 0;
}

/**
 * بررسی آیا پلن فعلی کاربر پاسخگوی سطح دسترسی مورد نیاز (requiredPlan) هست یا خیر
 */
export function isPlanSufficient(userPlan?: string | null, requiredPlan?: string | null): boolean {
  return getPlanRank(userPlan) >= getPlanRank(requiredPlan);
}

/**
 * آیا کاربر دارای پلن معتبر حرفه‌ای (Pro) یا ویژه (VIP) است؟
 */
export function isProOrVipUser(user?: UserSubscriptionInfo | null): boolean {
  const plan = getEffectivePlan(user);
  return plan === 'pro' || plan === 'vip';
}

/**
 * آیا کاربر دارای پلن معتبر ویژه (VIP) است؟
 */
export function isVipUser(user?: UserSubscriptionInfo | null): boolean {
  return getEffectivePlan(user) === 'vip';
}

/**
 * آیا یک ماژول خاص جزو امکانات پولی و پیشرفته Pro است؟
 */
export function isProModule(moduleType: string): boolean {
  return PRO_MODULE_TYPES.includes(moduleType);
}

/**
 * بررسی دسترسی کاربر به افزودن یا استفاده از یک ماژول خاص
 */
export function canAccessModule(moduleType: string, user?: UserSubscriptionInfo | null): boolean {
  if (!isProModule(moduleType)) return true;
  return isProOrVipUser(user);
}

/**
 * محاسبه تعداد روزهای باقیمانده از اشتراک
 */
export function getDaysRemaining(planExpiresAt?: Date | string | null): number {
  if (!planExpiresAt) return 0;
  const expiryDate = new Date(planExpiresAt);
  if (isNaN(expiryDate.getTime())) return 0;
  const diff = expiryDate.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * بررسی و سینک وضعیت اشتراک در دیتابیس (سمت سرور)
 * اگر تاریخ انقضا گذشته باشد، فیلد planType کاربر در دیتابیس به free تغییر می‌یابد
 */
export async function syncAndCheckUserSubscription(userId: string) {
  const { connectToDatabase } = await import('@/lib/db/mongodb');
  const { User } = await import('@/models/User.model');
  const { Profile } = await import('@/models/Profile.model');

  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) {
    return {
      planType: 'free' as PlanType,
      isExpired: false,
      isPro: false,
      isVip: false,
      daysRemaining: 0,
    };
  }

  const hasExpired = isPlanExpired(user.planExpiresAt);

  // اگر تاریخ گذشته بود، در دیتابیس هم تنزل داده شود
  if (hasExpired && (user.planType !== 'free' || user.subscriptionPlan !== 'free')) {
    user.planType = 'free';
    user.subscriptionPlan = 'free';
    await user.save();

    // همگام‌سازی روی پروفایل‌ها
    await Profile.updateMany(
      { userId: user._id },
      { $set: { planType: 'free' } }
    );

    return {
      planType: 'free' as PlanType,
      isExpired: true,
      isPro: false,
      isVip: false,
      planExpiresAt: user.planExpiresAt,
      daysRemaining: 0,
      features: user.features || {},
    };
  }

  const effectivePlan = getEffectivePlan(user);

  return {
    planType: effectivePlan,
    isExpired: hasExpired,
    isPro: effectivePlan === 'pro' || effectivePlan === 'vip',
    isVip: effectivePlan === 'vip',
    planExpiresAt: user.planExpiresAt,
    daysRemaining: getDaysRemaining(user.planExpiresAt),
    features: user.features || {},
  };
}

/**
 * فعال‌سازی خودکار اشتراک سالانه حرفه‌ای (Pro) برای کاربر پس از تایید پرداخت سفارش اشتراک
 * مقدار planType کاربر را به 'pro' و planExpiresAt را دقیقاً روی ۳۶۵ روز بعد از تاریخ تایید تنظیم می‌کند
 */
export async function activateUserSubscriptionFromOrder(order: any) {
  if (!order || order.orderType !== 'subscription') {
    return { activated: false, reason: 'not_subscription_order' };
  }

  const { connectToDatabase } = await import('@/lib/db/mongodb');
  const { User } = await import('@/models/User.model');
  const { Profile } = await import('@/models/Profile.model');

  await connectToDatabase();

  let targetUser: any = null;
  const candidateUserId = order.userId || order.sellerUserId;
  if (candidateUserId && String(candidateUserId) !== 'platform') {
    try {
      targetUser = await User.findById(candidateUserId);
    } catch {
      targetUser = null;
    }
  }

  if (!targetUser && order.customerEmail) {
    targetUser = await User.findOne({ email: String(order.customerEmail).toLowerCase().trim() });
  }

  if (!targetUser) {
    return { activated: false, reason: 'user_not_found' };
  }

  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  targetUser.planType = 'pro';
  targetUser.subscriptionPlan = 'pro';
  targetUser.planExpiresAt = expiresAt;
  targetUser.features = {
    ...(targetUser.features || {}),
    maxCards: 5,
    customDomain: true,
    analyticsAdvanced: true,
    removeBranding: true,
    prioritySupport: true,
  };
  await targetUser.save();

  await Profile.updateMany(
    { userId: targetUser._id },
    { $set: { planType: 'pro', planExpiresAt: expiresAt } }
  );

  return {
    activated: true,
    userId: targetUser._id.toString(),
    planType: 'pro' as PlanType,
    planExpiresAt: expiresAt,
  };
}
