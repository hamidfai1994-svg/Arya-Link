import { z } from 'zod';

export const profileUpdateSchema = z
  .object({
    id: z.string().optional(),
    alias: z.string().optional(),
    displayName: z.string().optional(),
    headline: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
    coverUrl: z.string().optional(),
    headerLayout: z.enum(['curve', 'gradient_mask', 'minimal']).optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
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

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
