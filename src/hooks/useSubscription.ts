'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useEditorStore } from '@/store/editor-store';
import {
  PlanType,
  getEffectivePlan,
  isPlanExpired,
  isProModule,
  isPlanSufficient,
  getDaysRemaining,
} from '@/lib/utils/subscription';

interface RemoteSubscriptionState {
  planType: PlanType;
  isPro: boolean;
  isVip: boolean;
  isExpired: boolean;
  planExpiresAt?: Date | string | null;
  daysRemaining?: number;
  features?: Record<string, any>;
}

export interface ModuleAccessRule {
  requiredPlan: PlanType;
  isPremium: boolean;
  isEnabled: boolean;
}

export function useSubscription() {
  const { data: session, status } = useSession();
  const profile = useEditorStore((state) => state.profile);
  const [remoteSub, setRemoteSub] = useState<RemoteSubscriptionState | null>(null);
  const [moduleAccessMap, setModuleAccessMap] = useState<Record<string, ModuleAccessRule>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchModuleAccess = useCallback(async () => {
    try {
      const res = await fetch('/api/modules/access', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success && data.accessMap) {
        setModuleAccessMap(data.accessMap);
      }
    } catch {
      // Graceful fallback to default rules
    }
  }, []);

  useEffect(() => {
    fetchModuleAccess();
  }, [fetchModuleAccess]);

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/subscription', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success && data.subscription) {
        setRemoteSub(data.subscription);
      }
    } catch {
      // Graceful fallback to session/profile data
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status, fetchSubscription]);

  const effectiveUser = useMemo(() => {
    if (remoteSub) {
      return {
        planType: remoteSub.planType,
        planExpiresAt: remoteSub.planExpiresAt,
        features: remoteSub.features,
      };
    }
    if (profile?.planType) {
      return {
        planType: profile.planType,
        planExpiresAt: profile.planExpiresAt,
        features: profile.features,
      };
    }
    return {
      planType: session?.user?.planType || session?.user?.subscriptionPlan || 'free',
      subscriptionPlan: session?.user?.subscriptionPlan,
      planExpiresAt: session?.user?.planExpiresAt,
      features: session?.user?.features,
    };
  }, [remoteSub, profile, session?.user]);

  const effectivePlan = useMemo<PlanType>(
    () => getEffectivePlan(effectiveUser),
    [effectiveUser]
  );

  const isPro = effectivePlan === 'pro' || effectivePlan === 'vip';
  const isVip = effectivePlan === 'vip';
  const isFree = effectivePlan === 'free';
  const isExpired =
    remoteSub?.isExpired ?? isPlanExpired(effectiveUser?.planExpiresAt);
  const daysRemaining =
    remoteSub?.daysRemaining ?? getDaysRemaining(effectiveUser?.planExpiresAt);

  const getModuleRequiredPlan = useCallback(
    (moduleType: string): PlanType => {
      const rule = moduleAccessMap[moduleType];
      if (rule?.requiredPlan) {
        return rule.requiredPlan;
      }
      return isProModule(moduleType) ? 'pro' : 'free';
    },
    [moduleAccessMap]
  );

  const isModulePremium = useCallback(
    (moduleType: string): boolean => {
      return getModuleRequiredPlan(moduleType) !== 'free';
    },
    [getModuleRequiredPlan]
  );

  const isModuleLockedForUser = useCallback(
    (moduleType: string): boolean => {
      const requiredPlan = getModuleRequiredPlan(moduleType);
      return !isPlanSufficient(effectivePlan, requiredPlan);
    },
    [effectivePlan, getModuleRequiredPlan]
  );

  const canUseModule = useCallback(
    (moduleType: string): boolean => {
      return !isModuleLockedForUser(moduleType);
    },
    [isModuleLockedForUser]
  );

  return {
    planType: effectivePlan,
    effectivePlan,
    isPro,
    isVip,
    isFree,
    isExpired,
    planExpiresAt: effectiveUser?.planExpiresAt || null,
    daysRemaining,
    features: effectiveUser?.features || {},
    moduleAccessMap,
    refreshModuleAccess: fetchModuleAccess,
    refreshSubscription: fetchSubscription,
    getModuleRequiredPlan,
    isModulePremium,
    isModuleLockedForUser,
    isProModule,
    canUseModule,
    isLoading,
  };
}
