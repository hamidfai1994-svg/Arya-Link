import { z } from 'zod';
import { tServer } from '@/lib/i18n/translations';

export function getRegisterSchema(locale?: string | null) {
  return z.object({
    fullName: z
      .string({ message: tServer(locale, 'validation.required') })
      .trim()
      .min(2, tServer(locale, 'validation.name_min')),
    email: z
      .string({ message: tServer(locale, 'validation.required') })
      .trim()
      .email(tServer(locale, 'validation.email_invalid')),
    password: z
      .string({ message: tServer(locale, 'validation.required') })
      .min(6, tServer(locale, 'validation.password_min')),
  });
}

export function getLoginSchema(locale?: string | null) {
  return z.object({
    email: z
      .string({ message: tServer(locale, 'validation.required') })
      .trim()
      .email(tServer(locale, 'validation.email_invalid')),
    password: z
      .string({ message: tServer(locale, 'validation.required') })
      .min(1, tServer(locale, 'validation.required')),
  });
}

export function getContactMessageSchema(locale?: string | null) {
  return z.object({
    senderName: z
      .string({ message: tServer(locale, 'validation.required') })
      .trim()
      .min(2, tServer(locale, 'validation.name_min')),
    senderEmail: z
      .string()
      .trim()
      .email(tServer(locale, 'validation.email_invalid'))
      .optional()
      .or(z.literal('')),
    senderPhone: z
      .string()
      .trim()
      .max(20, tServer(locale, 'validation.phone_max'))
      .refine(
        (val) => !val || /^\+?[0-9\s-]{1,20}$/.test(val),
        tServer(locale, 'validation.phone_format')
      )
      .optional()
      .or(z.literal('')),
    messageText: z
      .string({ message: tServer(locale, 'validation.message_required') })
      .trim()
      .min(5, tServer(locale, 'validation.message_min')),
  });
}

export function getKycValidationSchema(locale?: string | null) {
  const reqMsg = tServer(locale, 'validation.kyc_fields_required');
  return z.object({
    nationalIdNumber: z.string({ message: reqMsg }).trim().min(3, reqMsg),
    selfieImageUrl: z.string({ message: reqMsg }).trim().min(1, reqMsg),
    idDocumentUrl: z.string({ message: reqMsg }).trim().min(1, reqMsg),
  });
}

export function getOrderValidationSchema(locale?: string | null) {
  return z.object({
    fullName: z
      .string({ message: tServer(locale, 'validation.required') })
      .trim()
      .min(2, tServer(locale, 'validation.name_min')),
    phone: z
      .string({ message: tServer(locale, 'validation.phone_required') })
      .trim()
      .min(5, tServer(locale, 'validation.phone_required'))
      .max(20, tServer(locale, 'validation.phone_max'))
      .refine(
        (val) => /^\+?[0-9\s-]{1,20}$/.test(val),
        tServer(locale, 'validation.phone_format')
      ),
    address: z
      .string({ message: tServer(locale, 'validation.required') })
      .trim()
      .min(5, tServer(locale, 'validation.required')),
  });
}
