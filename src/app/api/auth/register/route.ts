import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';
import { SystemSettings } from '@/models/systemSettings.model';
import { sendSupportMessage } from '@/lib/telegram';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { getJobTemplate, generateDefaultModulesForJob } from '@/lib/constants/jobTemplates';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, job, templateId, jobCategory, recaptchaToken } = body;

    // Verify Google reCAPTCHA v3
    const remoteIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      undefined;

    const recaptchaResult = await verifyRecaptcha(recaptchaToken, remoteIp);
    if (!recaptchaResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: recaptchaResult.message || 'درخواست نامعتبر: اعتبارسنجی امنیتی تایید نشد.',
        },
        { status: 400 }
      );
    }

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'نام و تخلص باید حداقل شامل 2 کاراکتر باشد.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'فرمت آدرس ایمیل وارد شده نامعتبر است.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'رمز عبور باید حداقل 6 کاراکتر باشد.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if email already registered
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'حساب کاربری با این ایمیل قبلاً ثبت‌نام شده است.' },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Resolve Job Template & Default Modules for Smart Onboarding
    const resolvedTemplateId = templateId || jobCategory || job || 'general';
    const jobTemplate = getJobTemplate(resolvedTemplateId);
    const initialModules = generateDefaultModulesForJob(resolvedTemplateId);
    const jobTitleToSave = (typeof job === 'string' && job.trim()) || jobTemplate.title;

    // 5. Create user
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: typeof phone === 'string' ? phone.trim() : '',
      occupation: jobTitleToSave,
      jobCategory: jobTemplate.id,
      role: 'user',
      subscriptionPlan: 'free',
      providers: [{ provider: 'credentials' }],
      isActive: true,
    });

    // 6. Generate unique default alias for this user's first profile (e.g. hamidfasihi_123)
    let cleanName = name
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9_]/g, '')
      .trim();

    if (!cleanName || cleanName.length < 2) {
      cleanName = 'user';
    }

    let candidateAlias = `${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
    while (await Profile.findOne({ alias: candidateAlias })) {
      candidateAlias = `${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
    }

    // 7. Resolve theme style according to selected job preset
    const themePreset = jobTemplate.defaultThemePreset || 'dark_neon';
    const isEmerald = themePreset === 'emerald_luxury';
    const isGlass = themePreset === 'glass_morphism';

    const bgGradient = isEmerald
      ? 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)'
      : isGlass
      ? 'linear-gradient(135deg, #180d2c 0%, #2e1065 50%, #0f172a 100%)'
      : 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)';

    const primaryColor = isEmerald ? '#059669' : isGlass ? '#8b5cf6' : '#0ea5e9';
    const accentColor = isEmerald ? '#10b981' : isGlass ? '#c084fc' : '#06b6d4';

    // 8. Create single personal starter profile populated with smart job-specific modules
    await Profile.create({
      userId: newUser._id,
      alias: candidateAlias,
      displayName: newUser.name,
      headline: jobTitleToSave && jobTitleToSave !== 'عمومی / سایر مشاغل' ? jobTitleToSave : jobTemplate.defaultHeadline || 'پروفایل شخصی',
      bio: jobTemplate.defaultBio || 'به کارت هوشمند دیجیتال من در آریا لینک خوش آمدید.',
      avatarUrl: '',
      phone: typeof phone === 'string' ? phone.trim() : '',
      whatsapp: '',
      email: cleanEmail,
      location: 'افغانستان',
      directModeEnabled: false,
      hideBranding: false,
      seoTitle: `${newUser.name} | کارت دیجیتال آریا لینک`,
      seoDescription: `${jobTitleToSave} - صفحه رسمی و کارت ویزیت هوشمند`,
      themeConfig: {
        preset: themePreset,
        primaryColor,
        accentColor,
        backgroundColor: bgGradient,
        cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
        textColor: '#ffffff',
        borderRadius: 'rounded-2xl',
      },
      links: initialModules,
      occupation: jobTitleToSave,
      jobCategory: jobTemplate.id,
      isActive: true,
    });

    // Non-blocking notification to Support Bot
    (async () => {
      try {
        const settings = await SystemSettings.findOne();
        if (
          settings &&
          settings.telegramBotsActive &&
          settings.telegramSupportChatId &&
          settings.notifyNewUsers
        ) {
          const msg = `🎉 <b>کاربر جدید در آریا لینک ثبت‌نام کرد</b>\n\n👤 <b>نام:</b> ${newUser.name}\n💼 <b>شغل/حوزه:</b> ${jobTitleToSave} (${jobTemplate.title})\n✉️ <b>ایمیل:</b> ${newUser.email}\n📞 <b>تلفن:</b> ${newUser.phone || 'ندارد'}\n🔗 <b>لینک اولیه:</b> aryal.ink/${candidateAlias}\n🧩 <b>ماژول‌های هوشمند:</b> ${initialModules.length} ماژول چیده‌شده`;
          await sendSupportMessage(settings.telegramSupportChatId, msg);
        }
      } catch (err) {
        console.error('Support bot new user alert error:', err);
      }
    })().catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: 'ثبت‌نام با موفقیت انجام شد. اکنون وارد شوید.',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطایی در ثبت‌نام رخ داد. لطفاً مجدداً تلاش فرمایید.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
