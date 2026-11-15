'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { getLocalizedText } from '@/lib/i18n/multilingual';
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
      if (match) {
        return {
          ...match,
          displayName: getLocalizedText(match.displayName, 'da', 'کارت هوشمند'),
          headline: getLocalizedText(match.headline, 'da', ''),
        };
      }
    }
    if (profile?.id) {
      return {
        id: profile.id,
        alias: profile.alias || 'user',
        displayName: getLocalizedText(profile.displayName, 'da', 'کارت هوشمند'),
        headline: getLocalizedText(profile.headline, 'da', ''),
        avatarUrl: profile.avatarUrl,
        roleType: (profile as any).roleType || 'personal',
        isActive: true,
      };
    }
    const fallbackCard = profilesList[0];
    return fallbackCard
      ? {
          ...fallbackCard,
          displayName: getLocalizedText(fallbackCard.displayName, 'da', 'کارت هوشمند'),
          headline: getLocalizedText(fallbackCard.headline, 'da', ''),
        }
      : null;
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
