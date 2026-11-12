import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { PhysicalCard } from '@/models/PhysicalCard.model';
import { Profile } from '@/models/Profile.model';
import { User } from '@/models/User.model';
import { Order } from '@/models/Order.model';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ shortCode: string }> | { shortCode: string } }
) {
  try {
    const rawParams = await context.params;
    const shortCode = (rawParams?.shortCode || '').trim().toUpperCase();

    console.log(`[NFC Tracker] 📡 Request received for shortCode: "${shortCode}"`);

    if (!shortCode) {
      console.warn('[NFC Tracker] ⚠️ Missing or empty shortCode. Redirecting to /404');
      return NextResponse.redirect(new URL('/404', req.url));
    }

    await connectToDatabase();

    // 1. Search card by shortCode and populate ownerId
    const card = await PhysicalCard.findOne({ shortCode }).populate('ownerId');

    if (!card) {
      console.warn(`[NFC Tracker] ❌ Card not found for shortCode: "${shortCode}". Redirecting to /404`);
      return NextResponse.redirect(new URL('/404', req.url));
    }

    // Atomically increment physical NFC card scansCount
    await PhysicalCard.updateOne({ _id: card._id }, { $inc: { scansCount: 1 } });
    const currentScans = (card.scansCount || 0) + 1;

    console.log(`[NFC Tracker] ✅ Found card [${card._id}] for shortCode: "${shortCode}". Total scans: ${currentScans}`);

    let username: string | null = null;

    // 2. Extract username / profile destination
    // Case A: From populated ownerId (User)
    const owner: any = card.ownerId;
    if (owner && typeof owner === 'object') {
      console.log(`[NFC Tracker] Owner details from card.ownerId:`, {
        id: owner._id?.toString(),
        username: owner.username,
        profileUrl: owner.profileUrl,
        email: owner.email,
        name: owner.name,
      });

      if (owner.username && typeof owner.username === 'string' && owner.username.trim()) {
        username = owner.username.trim();
        console.log(`[NFC Tracker] 👉 Found username from card.ownerId.username: "${username}"`);
      } else if (owner.profileUrl && typeof owner.profileUrl === 'string' && owner.profileUrl.trim()) {
        const clean = owner.profileUrl.trim().replace(/^https?:\/\/[^\/]+\//i, '').replace(/^\/+/, '');
        if (clean && clean.toLowerCase() !== 'username') {
          username = clean;
          console.log(`[NFC Tracker] 👉 Found username from card.ownerId.profileUrl: "${username}"`);
        }
      }
    }

    // Case B: Direct profile attached to card
    if (!username && card.profileId) {
      const specificProfile = await Profile.findById(card.profileId)
        .select('alias username isActive')
        .lean();
      if (specificProfile && specificProfile.isActive !== false) {
        const candidate = (specificProfile.alias || (specificProfile as any).username || '').trim();
        if (candidate && candidate.toLowerCase() !== 'username') {
          username = candidate;
          console.log(`[NFC Tracker] 👉 Found username from card.profileId: "${username}"`);
        }
      }
    }

    // Case C: Linked Order (e.g. cardUrl chosen at checkout or order.profileId)
    if (!username && card.orderId) {
      const order = await Order.findById(card.orderId).select('cardSpecs profileId userId').lean();
      if (order) {
        if (order.cardSpecs?.cardUrl) {
          const rawUrl = order.cardSpecs.cardUrl.trim();
          const match = rawUrl.match(/(?:https?:\/\/[^\/]+\/|\/|^)([a-zA-Z0-9_\-\.]+)\/?$/);
          if (match && match[1] && match[1].toLowerCase() !== 'username') {
            username = match[1];
            console.log(`[NFC Tracker] 👉 Found username from order.cardSpecs.cardUrl: "${username}"`);
          }
        }
        if (!username && order.profileId) {
          const orderProf = await Profile.findById(order.profileId).select('alias username').lean();
          if (orderProf && (orderProf.alias || (orderProf as any).username)) {
            const candidate = (orderProf.alias || (orderProf as any).username).trim();
            if (candidate && candidate.toLowerCase() !== 'username') {
              username = candidate;
              console.log(`[NFC Tracker] 👉 Found username from order.profileId: "${username}"`);
            }
          }
        }
      }
    }

    // Case D: Find user's active Profile by owner user ID
    if (!username) {
      const ownerIdValue = owner?._id || (typeof card.ownerId === 'string' ? card.ownerId : null);
      if (ownerIdValue) {
        const userProfile = await Profile.findOne({
          userId: ownerIdValue,
          isActive: { $ne: false },
        })
          .sort({ createdAt: 1 })
          .select('alias username')
          .lean();

        if (userProfile && (userProfile.alias || (userProfile as any).username)) {
          const candidate = (userProfile.alias || (userProfile as any).username).trim();
          if (candidate && candidate.toLowerCase() !== 'username') {
            username = candidate;
            console.log(`[NFC Tracker] 👉 Found username from Profile.findOne by userId: "${username}"`);
          }
        }
      }
    }

    // Case E: Query User document directly if owner wasn't populated
    if (!username && card.ownerId && typeof card.ownerId === 'string') {
      const directUser = await User.findById(card.ownerId).select('username name email').lean();
      if (directUser && (directUser as any).username) {
        username = (directUser as any).username.trim();
        console.log(`[NFC Tracker] 👉 Found username from User.findById: "${username}"`);
      }
    }

    // Clean and validate username
    const cleanUsername = (username || '').replace(/^\/+/, '').trim();

    // 4. Fallback / 404 Guard: Never silently redirect to homepage
    if (!cleanUsername || cleanUsername.toLowerCase() === 'username') {
      console.warn(`[NFC Tracker] ⚠️ No valid username or profile alias found for shortCode "${shortCode}". Redirecting to /404`);
      return NextResponse.redirect(new URL('/404', req.url));
    }

    // 3. Ultra-fast Permanent redirect (308) with anti-browser-cache headers
    const redirectUrl = new URL(`/${cleanUsername}`, req.url);
    console.log(`[NFC Tracker] 🚀 Success! Redirecting shortCode "${shortCode}" to: "${redirectUrl.pathname}"`);

    const response = NextResponse.redirect(redirectUrl, 308);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-NFC-Tracking', shortCode);
    return response;
  } catch (error) {
    console.error('[NFC Tracker] 💥 Critical Error in tracker route:', error);
    return NextResponse.redirect(new URL('/404', req.url));
  }
}
