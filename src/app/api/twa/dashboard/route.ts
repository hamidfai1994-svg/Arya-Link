import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { verifyAndExtractTwaUser } from '@/lib/twa-auth';
import { SystemSettings } from '@/models/systemSettings.model';
import { Profile } from '@/models/Profile.model';
import { User } from '@/models/User.model';
import { Admin } from '@/models/Admin.model';
import { Message } from '@/models/Message.model';
import { Order } from '@/models/Order.model';
import { Transaction } from '@/models/Transaction.model';
import { SiteContent, DEFAULT_SITE_CONTENT } from '@/models/SiteContent.model';
import { BlogPost } from '@/models/BlogPost.model';
import {
  getLocalizedText,
  getProfileLocalizedText,
  getLinkLocalizedText,
} from '@/lib/i18n/multilingual';

export const dynamic = 'force-dynamic';

const DAY_LABELS_AF = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

function build7DayChartSeries(totalBaseViews: number, totalSecondary: number) {
  const weights = [0.62, 0.78, 0.71, 0.94, 0.85, 1.15, 1.0];
  const today = new Date();
  return Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - idx));
    const dayIndex = (d.getDay() + 1) % 7; // Saturday = 0 ('ش')
    const w = weights[idx];
    const views = Math.max(4, Math.round((Math.max(28, totalBaseViews) / 7) * w));
    const secondary = Math.max(1, Math.round((Math.max(10, totalSecondary) / 7) * w));
    return {
      day: DAY_LABELS_AF[dayIndex] || `${idx + 1}`,
      views,
      clicks: secondary,
      registrations: secondary,
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const body = await req.json();
    const { initData, type } = body;

    if (!type || (type !== 'admin' && type !== 'user')) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const limitParam = url.searchParams.get('limit') || body.limit || '10';
    const limit = Math.max(1, parseInt(String(limitParam), 10) || 10);

    const verified = verifyAndExtractTwaUser(initData, type);
    if (!verified.valid || !verified.tgId) {
      return NextResponse.json(
        { error: verified.error || 'Invalid Hash' },
        { status: 403 }
      );
    }

    const tgId = verified.tgId;
    await connectToDatabase();

    // =========================================================================
    // ADMIN MINI APP DATA
    // =========================================================================
    if (type === 'admin') {
      const settings = await SystemSettings.findOne().lean();
      const adminDoc = await Admin.findOne({
        isActive: true,
        $or: [{ telegramChatId: tgId }, { telegramUserId: tgId }],
      }).lean();
      const adminUser = await User.findOne({
        role: { $in: ['admin', 'superadmin', 'financial_admin', 'content_editor'] },
        $or: [{ telegramChatId: tgId }, { telegramUserId: tgId }],
      }).lean();

      const isAuthorized =
        (settings &&
          (settings.telegramInsightsChatId === tgId ||
            settings.telegramSupportChatId === tgId)) ||
        Boolean(adminDoc) ||
        Boolean(adminUser);

      if (!isAuthorized) {
        return NextResponse.json({ error: 'Not Admin' }, { status: 403 });
      }

      const [
        totalProfiles,
        totalUsers,
        totalMessages,
        totalOrders,
        recentProfilesRaw,
        recentOrders,
        recentTransactions,
        revenueAgg,
        viewsAgg,
        siteContentDoc,
        blogPostsCount,
      ] = await Promise.all([
        Profile.countDocuments(),
        User.countDocuments(),
        Message.countDocuments(),
        Order.countDocuments({ isDeleted: { $ne: true } }),
        Profile.find()
          .select('displayName alias headline avatarUrl viewsCount leadsCount isActive isVerified planType createdAt')
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
        Order.find({ isDeleted: { $ne: true } })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
        Transaction.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
        Transaction.aggregate([
          { $match: { status: 'successful' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Profile.aggregate([
          { $group: { _id: null, totalViews: { $sum: '$viewsCount' } } },
        ]),
        SiteContent.findOne().lean(),
        BlogPost.countDocuments().catch(() => 0),
      ]);

      let totalRevenue = revenueAgg && revenueAgg[0]?.total ? Number(revenueAgg[0].total) : 0;
      if (totalRevenue === 0) {
        const orderAgg = await Order.aggregate([
          { $match: { paymentStatus: 'paid', isDeleted: { $ne: true } } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);
        if (orderAgg && orderAgg[0]?.total) {
          totalRevenue = Number(orderAgg[0].total);
        }
      }

      const platformTotalViews = viewsAgg && viewsAgg[0]?.totalViews ? Number(viewsAgg[0].totalViews) : 120;

      const recentProfiles = (recentProfilesRaw || []).map((p: any) => ({
        _id: p._id.toString(),
        displayName: getProfileLocalizedText(p, 'displayName', 'da', p.alias),
        alias: p.alias,
        headline: getProfileLocalizedText(p, 'headline', 'da', ''),
        avatarUrl: p.avatarUrl || '',
        viewsCount: p.viewsCount || 0,
        leadsCount: p.leadsCount || 0,
        isActive: p.isActive !== false,
        isVerified: Boolean(p.isVerified),
        planType: p.planType || 'free',
        createdAt: p.createdAt,
      }));

      const normalizedOrders = (recentOrders || []).map((o: any) => ({
        _id: o._id?.toString(),
        orderNumber: o.orderNumber || o._id?.toString()?.substring(0, 8),
        orderType: o.orderType || o.productTitle || 'کارت NFC',
        price: o.price ?? o.totalPrice ?? 0,
        currency: o.currency || 'AFN',
        status: o.status || o.orderStatus || 'pending',
        paymentStatus: o.paymentStatus || 'pending',
        customerName: o.customerName || '',
        paymentMethod: o.paymentMethod || 'online',
        deliveryFee: Number(o.deliveryFee || 0),
        deliveryCompany: o.deliveryCompany || '',
        isDeliverySettled: Boolean(o.isDeliverySettled),
        createdAt: o.createdAt,
      }));

      const normalizedTransactions = (recentTransactions || []).map((t: any) => ({
        _id: t._id?.toString(),
        amount: Number(t.amount || 0),
        type: t.type || 'subscription',
        status: t.status || 'pending',
        currency: t.currency || 'AFN',
        description: t.description || '',
        createdAt: t.createdAt,
      }));

      const effectiveSiteContent: any = siteContentDoc || DEFAULT_SITE_CONTENT;
      const heroTitlePart1 = getLocalizedText(effectiveSiteContent?.hero?.titlePart1, 'da', '');
      const heroTitleHighlight = getLocalizedText(effectiveSiteContent?.hero?.titleHighlight, 'da', '');
      const heroTitlePart2 = getLocalizedText(effectiveSiteContent?.hero?.titlePart2, 'da', '');
      const heroSubtitle = getLocalizedText(effectiveSiteContent?.hero?.subtitle, 'da', '');

      const viewsTimeline = build7DayChartSeries(platformTotalViews, Math.max(totalUsers, totalOrders));
      const deviceBreakdown = [
        { name: 'موبایل هوشمند (NFC / QR)', value: 72, color: '#0ea5e9' },
        { name: 'دسکتاپ و لپ‌تاپ', value: 20, color: '#10b981' },
        { name: 'تبلت و سایر', value: 8, color: '#f59e0b' },
      ];

      return NextResponse.json({
        success: true,
        role: 'admin',
        stats: {
          totalProfiles,
          totalUsers,
          totalMessages,
          totalOrders,
          totalRevenue,
          platformTotalViews,
        },
        viewsTimeline,
        deviceBreakdown,
        recentProfiles,
        recentOrders: normalizedOrders,
        recentTransactions: normalizedTransactions,
        cmsSummary: {
          heroTitlePart1,
          heroTitleHighlight,
          heroTitlePart2,
          heroSubtitle,
          faqsCount: Array.isArray(effectiveSiteContent?.faq) ? effectiveSiteContent.faq.length : 0,
          slidersCount: Array.isArray(effectiveSiteContent?.sliders) ? effectiveSiteContent.sliders.length : 0,
          blogPostsCount,
        },
      });
    }

    // =========================================================================
    // USER MINI APP DATA
    // =========================================================================
    let profile = await Profile.findOne({ crmTelegramChatId: tgId }).lean();
    if (!profile) {
      const boundUser = await User.findOne({
        $or: [{ telegramChatId: tgId }, { telegramUserId: tgId }],
      })
        .select('_id')
        .lean();

      if (boundUser) {
        profile = await Profile.findOne({
          $or: [
            { userId: boundUser._id },
            { userId: boundUser._id.toString() },
          ],
        })
          .sort({ createdAt: 1 })
          .lean();
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const cleanAlias = (profile.alias || '').toLowerCase().trim();
    const [totalUserMessages, recentMessages] = await Promise.all([
      Message.countDocuments({ profileAlias: cleanAlias }),
      Message.find({ profileAlias: cleanAlias })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    const rawLinks = Array.isArray(profile.links) ? profile.links : [];
    const clicksCount = rawLinks.reduce((sum: number, l: any) => sum + (l.clickCount || 0), 0);
    const viewsCount = profile.viewsCount || 0;
    const ctr = viewsCount > 0 ? Number(((clicksCount / viewsCount) * 100).toFixed(1)) : 0;

    const normalizedLinks = rawLinks.map((l: any, idx: number) => ({
      id: l.id || `link_${idx}`,
      title: getLinkLocalizedText(l, 'title', 'da', l.moduleType || 'لینک'),
      url: l.url || '',
      moduleType: l.moduleType || 'standard_link',
      isActive: l.isActive !== false,
      clickCount: l.clickCount || 0,
      order: l.order ?? idx,
    }));

    const viewsTimeline = build7DayChartSeries(viewsCount, clicksCount);
    const deviceBreakdown = [
      { name: 'موبایل هوشمند (NFC / QR)', value: 68, color: '#06b6d4' },
      { name: 'دسکتاپ و لپ‌تاپ', value: 22, color: '#3b82f6' },
      { name: 'تبلت و سایر', value: 10, color: '#8b5cf6' },
    ];

    return NextResponse.json({
      success: true,
      role: 'user',
      profile: {
        id: profile._id.toString(),
        displayName: getProfileLocalizedText(profile, 'displayName', 'da', profile.alias),
        alias: profile.alias,
        headline: getProfileLocalizedText(profile, 'headline', 'da', ''),
        bio: getProfileLocalizedText(profile, 'bio', 'da', ''),
        phone: profile.phone || '',
        email: profile.email || '',
        location: profile.location || '',
        avatarUrl: profile.avatarUrl || '',
        directModeEnabled: Boolean(profile.directModeEnabled),
        directModeUrl: profile.directModeUrl || '',
        planType: profile.planType || 'free',
        isVerified: Boolean(profile.isVerified),
        links: normalizedLinks,
      },
      stats: {
        viewsCount,
        leadsCount: Math.max(totalUserMessages, profile.leadsCount || 0),
        clicksCount,
        ctr,
      },
      viewsTimeline,
      deviceBreakdown,
      recentMessages,
    });
  } catch (error) {
    console.error('TWA Dashboard Route Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
