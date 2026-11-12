import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      subscriptionPlan?: string;
      accountType?: 'personal' | 'business' | 'corporate';
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: string;
    subscriptionPlan?: string;
    accountType?: 'personal' | 'business' | 'corporate';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
    subscriptionPlan?: string;
    accountType?: 'personal' | 'business' | 'corporate';
  }
}
