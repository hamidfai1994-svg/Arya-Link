import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';
import { Otp } from '@/models/Otp.model';
import { verifyRecaptcha } from '@/lib/recaptcha';

async function generateGoogleAlias(rawName: string): Promise<string> {
  let clean = rawName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .trim();

  if (!clean || clean.length < 2) {
    clean = 'user';
  }

  let alias = `${clean}_${Math.floor(100 + Math.random() * 900)}`;
  while (await Profile.findOne({ alias })) {
    alias = `${clean}_${Math.floor(100 + Math.random() * 900)}`;
  }
  return alias;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'ایمیل و رمز عبور',
      credentials: {
        email: { label: 'ایمیل', type: 'email' },
        password: { label: 'رمز عبور', type: 'password' },
        recaptchaToken: { label: 'reCAPTCHA Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('لطفاً ایمیل و رمز عبور را وارد نمایید.');
        }

        // Verify Google reCAPTCHA v3
        const recaptchaResult = await verifyRecaptcha(credentials?.recaptchaToken);
        if (!recaptchaResult.success) {
          throw new Error(recaptchaResult.message || 'درخواست نامعتبر: اعتبارسنجی امنیتی تایید نشد.');
        }

        await connectToDatabase();

        const cleanEmail = credentials.email.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail }).select('+password');

        if (!user) {
          throw new Error('حساب کاربری با این ایمیل یافت نشد.');
        }

        if (!user.password) {
          throw new Error('این حساب قبلاً با ورود شبکه اجتماعی (گوگل) ثبت شده است. لطفاً با گوگل وارد شوید.');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error('رمز عبور وارد شده نادرست است.');
        }

        if (!user.isActive) {
          throw new Error('حساب کاربری شما غیرفعال شده است.');
        }

        // Update last login timestamp
        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar || '',
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
          planType: user.planType || user.subscriptionPlan || 'free',
          planExpiresAt: user.planExpiresAt || null,
          features: user.features || {},
          accountType: user.accountType || 'personal',
          organizationId: user.organizationId ? user.organizationId.toString() : null,
          orgRole: user.orgRole || null,
        };
      },
    }),

    CredentialsProvider({
      id: 'email-otp',
      name: 'ورود با کد یکبار مصرف (Email OTP)',
      credentials: {
        email: { label: 'ایمیل', type: 'email' },
        code: { label: 'کد تایید', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          throw new Error('لطفاً ایمیل و کد تایید را وارد نمایید.');
        }

        await connectToDatabase();

        const cleanEmail = credentials.email.toLowerCase().trim();
        const cleanCode = credentials.code.toString().trim();

        // Validate 6-digit OTP code in MongoDB
        const validOtp = await Otp.findOne({ email: cleanEmail, code: cleanCode });
        if (!validOtp) {
          throw new Error('کد تایید نادرست یا منقضی شده است.');
        }

        // Delete used OTP to prevent replay
        await Otp.deleteMany({ email: cleanEmail });

        let user = await User.findOne({ email: cleanEmail });
        if (!user) {
          const defaultName = cleanEmail.split('@')[0] || 'کاربر آریا لینک';
          user = await User.create({
            name: defaultName,
            email: cleanEmail,
            role: 'user',
            subscriptionPlan: 'free',
            isActive: true,
            emailVerified: new Date(),
            lastLoginAt: new Date(),
          });

          // Auto-provision single personal profile
          const uniqueAlias = await generateGoogleAlias(user.name);
          await Profile.create({
            userId: user._id,
            alias: uniqueAlias,
            displayName: user.name,
            headline: 'پروفایل شخصی',
            bio: 'به کارت هوشمند دیجیتال من در آریا لینک خوش آمدید.',
            avatarUrl: '',
            email: user.email,
            phone: '',
            whatsapp: '',
            location: 'افغانستان',
            directModeEnabled: false,
            hideBranding: false,
            seoTitle: `${user.name} | کارت دیجیتال آریا لینک`,
            seoDescription: 'صفحه رسمی و کارت ویزیت هوشمند',
            themeConfig: {
              preset: 'dark_neon',
              primaryColor: '#0ea5e9',
              accentColor: '#06b6d4',
              backgroundColor: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
              cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
              textColor: '#ffffff',
              borderRadius: 'rounded-2xl',
            },
            links: [],
            isActive: true,
          });
        } else {
          if (!user.isActive) {
            throw new Error('حساب کاربری شما غیرفعال شده است.');
          }
          user.lastLoginAt = new Date();
          await user.save();
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar || '',
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
          planType: user.planType || user.subscriptionPlan || 'free',
          planExpiresAt: user.planExpiresAt || null,
          features: user.features || {},
          accountType: user.accountType || 'personal',
          organizationId: user.organizationId ? user.organizationId.toString() : null,
          orgRole: user.orgRole || null,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          let existingUser = await User.findOne({ email });

          if (!existingUser) {
            existingUser = await User.create({
              name: user.name || (profile as any)?.name || 'کاربر آریا لینک',
              email,
              avatar: user.image || '',
              role: 'user',
              subscriptionPlan: 'free',
              providers: [
                {
                  provider: 'google',
                  providerId: account.providerAccountId,
                },
              ],
              isActive: true,
              emailVerified: new Date(),
            });

            // Auto-provision single personal profile
            const uniqueAlias = await generateGoogleAlias(existingUser.name);
            await Profile.create({
              userId: existingUser._id,
              alias: uniqueAlias,
              displayName: existingUser.name,
              headline: 'پروفایل شخصی',
              bio: 'به کارت هوشمند دیجیتال من در آریا لینک خوش آمدید.',
              avatarUrl: existingUser.avatar || '',
              email: existingUser.email,
              phone: '',
              whatsapp: '',
              location: 'افغانستان',
              directModeEnabled: false,
              hideBranding: false,
              seoTitle: `${existingUser.name} | کارت دیجیتال آریا لینک`,
              seoDescription: 'صفحه رسمی و کارت ویزیت هوشمند',
              themeConfig: {
                preset: 'dark_neon',
                primaryColor: '#0ea5e9',
                accentColor: '#06b6d4',
                backgroundColor: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
                cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
                textColor: '#ffffff',
                borderRadius: 'rounded-2xl',
              },
              links: [],
              isActive: true,
            });
          } else {
            // Check if google provider is recorded
            const hasGoogle = existingUser.providers?.some(
              (p: any) => p.provider === 'google'
            );
            if (!hasGoogle) {
              existingUser.providers.push({
                provider: 'google',
                providerId: account.providerAccountId,
              });
              await existingUser.save();
            }

            // If user logged in before and has 0 profiles, create their one personal profile
            const userProfilesCount = await Profile.countDocuments({ userId: existingUser._id });
            if (userProfilesCount === 0) {
              const uniqueAlias = await generateGoogleAlias(existingUser.name);
              await Profile.create({
                userId: existingUser._id,
                alias: uniqueAlias,
                displayName: existingUser.name,
                headline: 'پروفایل شخصی',
                bio: 'به کارت هوشمند دیجیتال من در آریا لینک خوش آمدید.',
                avatarUrl: existingUser.avatar || user.image || '',
                email: existingUser.email,
                phone: '',
                whatsapp: '',
                location: 'افغانستان',
                directModeEnabled: false,
                hideBranding: false,
                seoTitle: `${existingUser.name} | کارت دیجیتال آریا لینک`,
                seoDescription: 'صفحه رسمی و کارت ویزیت هوشمند',
                themeConfig: {
                  preset: 'dark_neon',
                  primaryColor: '#0ea5e9',
                  accentColor: '#06b6d4',
                  backgroundColor: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
                  cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
                  textColor: '#ffffff',
                  borderRadius: 'rounded-2xl',
                },
                links: [],
                isActive: true,
              });
            }
          }

          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.subscriptionPlan = existingUser.subscriptionPlan;
          user.planType = existingUser.planType || existingUser.subscriptionPlan || 'free';
          user.planExpiresAt = existingUser.planExpiresAt || null;
          user.features = existingUser.features || {};
          user.accountType = existingUser.accountType || 'personal';
          user.organizationId = existingUser.organizationId ? existingUser.organizationId.toString() : null;
          user.orgRole = existingUser.orgRole || null;
          return true;
        } catch (error) {
          console.error('Error in Google signIn callback:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.subscriptionPlan = user.subscriptionPlan || 'free';
        token.planType = user.planType || user.subscriptionPlan || 'free';
        token.planExpiresAt = user.planExpiresAt || null;
        token.features = user.features || {};
        token.accountType = user.accountType || 'personal';
        token.organizationId = user.organizationId || null;
        token.orgRole = user.orgRole || null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.subscriptionPlan = token.subscriptionPlan as string;
        session.user.planType = (token.planType as any) || token.subscriptionPlan || 'free';
        session.user.planExpiresAt = token.planExpiresAt as any;
        session.user.features = (token.features as any) || {};
        session.user.accountType = (token.accountType as any) || 'personal';
        session.user.organizationId = (token.organizationId as any) || null;
        session.user.orgRole = (token.orgRole as any) || null;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    newUser: '/dashboard',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET || 'aryalink_super_secret_auth_jwt_key_2026_afghanistan',
};
