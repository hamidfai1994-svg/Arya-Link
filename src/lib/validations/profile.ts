import { z } from 'zod';
import { tServer } from '@/lib/i18n/translations';

export function getProfileUpdateSchema(locale?: string | null) {
  return z
    .object({
    id: z.string().optional(),
    alias: z.string().optional(),
    displayName: z.string().optional(),
    headline: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
    coverUrl: z.string().optional(),
    headerLayout: z.enum(['curve', 'gradient_mask', 'minimal']).optional(),
    phone: z
      .string()
      .max(20, tServer(locale, 'validation.phone_max'))
      .refine(
        (val) => !val || /^\+?[0-9\s-]{1,20}$/.test(val.trim()),
        tServer(locale, 'validation.phone_format')
      )
      .optional(),
    whatsapp: z
      .string()
      .max(20, tServer(locale, 'validation.whatsapp_max'))
      .refine(
        (val) => !val || /^\+?[0-9\s-]{1,20}$/.test(val.trim()),
        tServer(locale, 'validation.whatsapp_format')
      )
      .optional(),
    email: z.string().optional(),
    location: z.string().optional(),
    directModeEnabled: z.boolean().optional(),
    directModeUrl: z.string().optional(),
    themeConfig: z.record(z.string(), z.any()).optional(),
    links: z.array(z.any()).optional(),
    profileType: z.enum(['personal', 'business']).optional(),
    isVerified: z.boolean().optional(),
    verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
    verificationData: z.record(z.string(), z.any()).optional(),
    profileLanguage: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    noIndex: z.boolean().optional(),
    hideBranding: z.boolean().optional(),
    crmTelegramChatId: z.string().optional(),
    crmTelegramEnable: z.boolean().optional(),
  })
  .passthrough();
}

export const profileUpdateSchema = getProfileUpdateSchema('da');

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
