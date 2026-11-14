import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { SystemSettings, IModuleAccessConfigItem } from '@/models/systemSettings.model';
import { MODULE_REGISTRY, ModuleRegistryItem } from '@/lib/constants/moduleRegistry';
import type { LinkModuleType } from '@/types/profile.types';

export const dynamic = 'force-dynamic';

function buildMergedRegistry(storedList: IModuleAccessConfigItem[] = []): {
  modules: ModuleRegistryItem[];
  accessMap: Record<string, { requiredPlan: 'free' | 'pro' | 'vip'; isPremium: boolean; isEnabled: boolean }>;
} {
  const overrideMap = new Map<string, IModuleAccessConfigItem>();
  for (const item of storedList) {
    if (item && item.moduleType) {
      overrideMap.set(item.moduleType, item);
    }
  }

  const modules: ModuleRegistryItem[] = MODULE_REGISTRY.map((def) => {
    const override = overrideMap.get(def.moduleType);
    if (!override) return { ...def };

    const plan =
      override.requiredPlan === 'vip' || override.requiredPlan === 'pro' || override.requiredPlan === 'free'
        ? override.requiredPlan
        : def.requiredPlan;

    return {
      ...def,
      requiredPlan: plan,
      isPremium: plan !== 'free',
      isEnabled: override.isEnabled !== false,
    };
  });

  // Include any custom modules added directly in DB overrides
  for (const item of storedList) {
    if (item?.moduleType && !MODULE_REGISTRY.some((d) => d.moduleType === item.moduleType)) {
      const plan =
        item.requiredPlan === 'vip' || item.requiredPlan === 'pro' || item.requiredPlan === 'free'
          ? item.requiredPlan
          : 'free';
      modules.push({
        moduleType: item.moduleType as LinkModuleType,
        title: item.title || item.moduleType,
        category: (item.category as any) || 'commerce',
        categoryTitle: 'سایر ماژول‌ها',
        description: '',
        colorClass: 'hover:border-cyan-500/50',
        requiredPlan: plan,
        isPremium: plan !== 'free',
        isEnabled: item.isEnabled !== false,
      });
    }
  }

  const accessMap: Record<
    string,
    { requiredPlan: 'free' | 'pro' | 'vip'; isPremium: boolean; isEnabled: boolean }
  > = {};

  for (const mod of modules) {
    accessMap[mod.moduleType] = {
      requiredPlan: mod.requiredPlan,
      isPremium: mod.isPremium,
      isEnabled: mod.isEnabled,
    };
  }

  return { modules, accessMap };
}

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SystemSettings.findOne().lean();
    const storedList = (settings?.moduleAccessConfig || []) as IModuleAccessConfigItem[];

    const { modules, accessMap } = buildMergedRegistry(storedList);

    return NextResponse.json({
      success: true,
      modules,
      accessMap,
    });
  } catch (error: any) {
    console.error('Error fetching module access config:', error);
    const { modules, accessMap } = buildMergedRegistry([]);
    return NextResponse.json(
      {
        success: true,
        modules,
        accessMap,
        fallback: true,
      },
      { status: 200 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user?.role || '').toLowerCase();
    if (!session?.user?.id || (role !== 'admin' && role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, message: 'شما اجازه تغییر تنظیمات سطح دسترسی ماژول‌ها را ندارید.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();

    let nextConfigList: IModuleAccessConfigItem[] = [];

    if (Array.isArray(body.modules)) {
      nextConfigList = body.modules
        .filter((m: any) => m && typeof m.moduleType === 'string' && m.moduleType.trim())
        .map((m: any) => {
          const plan: 'free' | 'pro' | 'vip' =
            m.requiredPlan === 'vip' || m.requiredPlan === 'pro' || m.requiredPlan === 'free'
              ? m.requiredPlan
              : m.isPremium
              ? 'pro'
              : 'free';

          return {
            moduleType: m.moduleType.trim(),
            title: m.title || '',
            category: m.category || '',
            requiredPlan: plan,
            isPremium: plan !== 'free',
            isEnabled: m.isEnabled !== false,
          };
        });
    } else if (body.moduleType && typeof body.moduleType === 'string') {
      const existing = await SystemSettings.findOne().lean();
      const { modules: currentModules } = buildMergedRegistry(
        (existing?.moduleAccessConfig || []) as IModuleAccessConfigItem[]
      );

      const targetPlan: 'free' | 'pro' | 'vip' =
        body.requiredPlan === 'vip' || body.requiredPlan === 'pro' || body.requiredPlan === 'free'
          ? body.requiredPlan
          : body.isPremium
          ? 'pro'
          : 'free';

      let found = false;
      nextConfigList = currentModules.map((m) => {
        if (m.moduleType === body.moduleType) {
          found = true;
          return {
            moduleType: m.moduleType,
            title: m.title,
            category: m.category,
            requiredPlan: targetPlan,
            isPremium: targetPlan !== 'free',
            isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : m.isEnabled,
          };
        }
        return {
          moduleType: m.moduleType,
          title: m.title,
          category: m.category,
          requiredPlan: m.requiredPlan,
          isPremium: m.requiredPlan !== 'free',
          isEnabled: m.isEnabled,
        };
      });

      if (!found) {
        nextConfigList.push({
          moduleType: body.moduleType.trim(),
          title: body.title || body.moduleType.trim(),
          category: body.category || 'commerce',
          requiredPlan: targetPlan,
          isPremium: targetPlan !== 'free',
          isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : true,
        });
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'دیتای ارسالی نامعتبر است.' },
        { status: 400 }
      );
    }

    await SystemSettings.findOneAndUpdate(
      {},
      { $set: { moduleAccessConfig: nextConfigList } },
      { upsert: true, new: true }
    );

    const { modules, accessMap } = buildMergedRegistry(nextConfigList);

    return NextResponse.json({
      success: true,
      message: 'تنظیمات سطح دسترسی ماژول‌ها با موفقیت در دیتابیس ذخیره شد.',
      modules,
      accessMap,
    });
  } catch (error: any) {
    console.error('Error saving module access config:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ذخیره‌سازی تنظیمات دسترسی ماژول‌ها.' },
      { status: 500 }
    );
  }
}

