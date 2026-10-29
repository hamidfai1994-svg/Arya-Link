'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { UserProfileSummary } from '@/types/profile.types';

export interface ActiveCardContextType {
  activeCard: UserProfileSummary | null;
  activeCardId: string;
  cardsList: UserProfileSummary[];
  isLoadingCards: boolean;
  selectCard: (cardId: string) => Promise<void>;
  refreshCards: () => Promise<UserProfileSummary[]>;
}

const ActiveCardContext = createContext<ActiveCardContextType | undefined>(undefined);

export function ActiveCardProvider({ children }: { children: React.ReactNode }) {
  const {
    profilesList,
    activeProfileId,
    profile,
    fetchProfilesList,
    switchProfile,
  } = useEditorStore();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfilesList();
  }, [fetchProfilesList]);

  const selectCard = async (cardId: string) => {
    setIsLoading(true);
    try {
      await switchProfile(cardId);
    } finally {
      setIsLoading(false);
    }
  };

  const activeCard: UserProfileSummary | null = useMemo(() => {
    if (activeProfileId) {
      const match = profilesList.find((p) => p.id === activeProfileId);
      if (match) return match;
    }
    if (profile?.id) {
      return {
        id: profile.id,
        alias: profile.alias || 'user',
        displayName: profile.displayName || 'کارت هوشمند',
        headline: profile.headline,
        avatarUrl: profile.avatarUrl,
        roleType: (profile as any).roleType || 'personal',
        isActive: true,
      };
    }
    return profilesList[0] || null;
  }, [activeProfileId, profilesList, profile]);

  return (
    <ActiveCardContext.Provider
      value={{
        activeCard,
        activeCardId: activeProfileId || activeCard?.id || '',
        cardsList: profilesList,
        isLoadingCards: isLoading,
        selectCard,
        refreshCards: fetchProfilesList,
      }}
    >
      {children}
    </ActiveCardContext.Provider>
  );
}

export function useActiveCard() {
  const context = useContext(ActiveCardContext);
  if (!context) {
    throw new Error('useActiveCard must be used within an ActiveCardProvider');
  }
  return context;
}
