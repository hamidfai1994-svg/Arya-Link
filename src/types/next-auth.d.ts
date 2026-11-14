import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      subscriptionPlan?: string;
      planType?: 'free' | 'pro' | 'vip' | string;
      planExpiresAt?: string | Date | null;
      features?: Record<string, any>;
      accountType?: 'personal' | 'business' | 'corporate';
      organizationId?: string | null;
      orgRole?: 'owner' | 'member' | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: string;
    subscriptionPlan?: string;
    planType?: 'free' | 'pro' | 'vip' | string;
    planExpiresAt?: string | Date | null;
    features?: Record<string, any>;
    accountType?: 'personal' | 'business' | 'corporate';
    organizationId?: string | null;
    orgRole?: 'owner' | 'member' | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
    subscriptionPlan?: string;
    planType?: 'free' | 'pro' | 'vip' | string;
    planExpiresAt?: string | Date | null;
    features?: Record<string, any>;
    accountType?: 'personal' | 'business' | 'corporate';
    organizationId?: string | null;
    orgRole?: 'owner' | 'member' | null;
  }
}
