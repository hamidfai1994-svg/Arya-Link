export interface VerifyRecaptchaResult {
  success: boolean;
  score?: number;
  message?: string;
  errorCodes?: string[];
}

/**
 * Verify Google reCAPTCHA v3 token against Google siteverify API.
 * Rules:
 * 1. Success must be true.
 * 2. Score must be >= 0.5.
 * 3. All numbers in code logic must be strictly English digits.
 */
export async function verifyRecaptcha(
  token: string | undefined | null,
  remoteIp?: string
): Promise<VerifyRecaptchaResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn('[reCAPTCHA] RECAPTCHA_SECRET_KEY is not defined. Bypassing check.');
    return { success: true, score: 1.0 };
  }

  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      success: false,
      message: 'درخواست نامعتبر: توکن اعتبارسنجی امنیتی (reCAPTCHA) الزامی است.',
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token.trim());
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!data.success) {
      console.warn('[reCAPTCHA] Google verification failed:', data['error-codes']);
      return {
        success: false,
        message: 'درخواست نامعتبر: اعتبارسنجی امنیتی با خطا مواجه شد.',
        errorCodes: data['error-codes'],
      };
    }

    const score = typeof data.score === 'number' ? data.score : 1.0;
    if (score < 0.5) {
      console.warn(`[reCAPTCHA] Verification score too low: ${score} (< 0.5)`);
      return {
        success: false,
        score,
        message: 'درخواست نامعتبر: امتیاز امنیتی پایین شناسایی شد.',
      };
    }

    return {
      success: true,
      score,
    };
  } catch (err: any) {
    console.error('[reCAPTCHA] Verification network exception:', err);
    if (process.env.NODE_ENV === 'development') {
      console.warn('[reCAPTCHA] Network failure in development mode. Bypassing check.');
      return { success: true, score: 1.0 };
    }
    return {
      success: false,
      message: 'خطا در ارتباط با سرور اعتبارسنجی گوگل.',
    };
  }
}

