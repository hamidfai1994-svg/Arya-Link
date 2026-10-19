import mongoose from 'mongoose';

export interface UserSessionData {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  [key: string]: any;
}

/**
 * Validates that the current NextAuth session contains at least one valid identity attribute.
 */
export function isValidUserSession(sessionUser: UserSessionData | undefined | null): boolean {
  if (!sessionUser) return false;
  const hasId = typeof sessionUser.id === 'string' && sessionUser.id.trim().length > 0;
  const hasEmail = typeof sessionUser.email === 'string' && sessionUser.email.trim().length > 0;
  return hasId || hasEmail;
}

/**
 * Builds a strict MongoDB isolation query filter for the authenticated user.
 * Enforces server-level data isolation so users CANNOT query or view profiles
 * or links belonging to other accounts.
 *
 * Matches records where:
 *   - `userId` matches session.user.id (either as String or ObjectId)
 *   OR
 *   - `userEmail` / `email` matches session.user.email (case-insensitive & trimmed)
 *
 * If sessionUser has neither a valid id nor email, returns `{ _id: null }`
 * (an impossible match) ensuring zero unauthorized data leaks.
 */
export function buildUserIsolationQuery(sessionUser: UserSessionData | undefined | null): Record<string, any> {
  if (!sessionUser) {
    return { _id: null };
  }

  const conditions: any[] = [];

  // 1. Strict userId matching (handles both string and ObjectId in DB)
  if (sessionUser.id && typeof sessionUser.id === 'string') {
    const rawId = sessionUser.id.trim();
    if (rawId) {
      conditions.push({ userId: rawId });
      if (mongoose.isValidObjectId(rawId)) {
        conditions.push({ userId: new mongoose.Types.ObjectId(rawId) });
      }
    }
  }

  // 2. Strict userEmail / email matching (handles case-insensitive email matching)
  if (sessionUser.email && typeof sessionUser.email === 'string') {
    const cleanEmail = sessionUser.email.toLowerCase().trim();
    if (cleanEmail) {
      conditions.push({ email: cleanEmail });
      conditions.push({ userEmail: cleanEmail });
    }
  }

  if (conditions.length === 0) {
    return { _id: null };
  }

  return { $or: conditions };
}
