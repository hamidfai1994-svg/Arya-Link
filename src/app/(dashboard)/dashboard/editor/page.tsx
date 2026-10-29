'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/editor-store';
import { Loader2 } from 'lucide-react';

function EditorRedirectInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, profilesList, fetchProfilesList, fetchProfileData } = useEditorStore();

  useEffect(() => {
    const resolveAndRedirect = async () => {
      const aliasParam = searchParams.get('alias');
      const returnTo = searchParams.get('returnTo');
      const tab = searchParams.get('tab');

      const queryParts: string[] = [];
      if (returnTo) queryParts.push(`returnTo=${encodeURIComponent(returnTo)}`);
      if (tab) queryParts.push(`tab=${encodeURIComponent(tab)}`);
      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

      if (aliasParam) {
        router.replace(`/dashboard/editor/${encodeURIComponent(aliasParam)}${queryString}`);
        return;
      }

      if (profile?.id) {
        router.replace(`/dashboard/editor/${encodeURIComponent(profile.id)}${queryString}`);
        return;
      }

      if (profilesList.length > 0) {
        router.replace(`/dashboard/editor/${encodeURIComponent(profilesList[0].id)}${queryString}`);
        return;
      }

      const list = await fetchProfilesList();
      if (list.length > 0) {
        router.replace(`/dashboard/editor/${encodeURIComponent(list[0].id)}${queryString}`);
        return;
      }

      const ok = await fetchProfileData();
      const loadedId = useEditorStore.getState().profile?.id || useEditorStore.getState().profile?.alias;
      if (ok && loadedId) {
        router.replace(`/dashboard/editor/${encodeURIComponent(loadedId)}${queryString}`);
      } else {
        router.replace('/dashboard');
      }
    };

    resolveAndRedirect();
  }, [searchParams, router, profile?.id, profilesList, fetchProfilesList, fetchProfileData]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground" dir="rtl">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      <span className="text-xs font-semibold">در حال ورود به محیط ویرایشگر اختصاصی لینک...</span>
    </div>
  );
}

export default function ProfileBuilderRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EditorRedirectInner />
    </Suspense>
  );
}
