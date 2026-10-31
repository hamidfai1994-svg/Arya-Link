'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_LANDING_CMS,
  ILandingCmsHero,
  ILandingCmsPlan,
  ILandingCmsMaterial,
  ILandingCmsTestimonial,
  ILandingCmsGeneral,
} from '@/models/LandingCms.model';

interface LandingCmsContextType {
  hero: ILandingCmsHero;
  plans: ILandingCmsPlan[];
  materials: ILandingCmsMaterial[];
  testimonials: ILandingCmsTestimonial[];
  general: ILandingCmsGeneral;
  isLoading: boolean;
}

const LandingCmsContext = createContext<LandingCmsContextType>({
  hero: INITIAL_LANDING_CMS.hero,
  plans: INITIAL_LANDING_CMS.plans,
  materials: INITIAL_LANDING_CMS.materials,
  testimonials: INITIAL_LANDING_CMS.testimonials,
  general: INITIAL_LANDING_CMS.general,
  isLoading: false,
});

export function LandingCmsProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: any;
}) {
  const [data, setData] = useState(initialData || INITIAL_LANDING_CMS);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/cms/landing', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data && isMounted) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load landing CMS data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <LandingCmsContext.Provider
      value={{
        hero: data.hero || INITIAL_LANDING_CMS.hero,
        plans: data.plans || INITIAL_LANDING_CMS.plans,
        materials: data.materials || INITIAL_LANDING_CMS.materials,
        testimonials: data.testimonials || INITIAL_LANDING_CMS.testimonials,
        general: data.general || INITIAL_LANDING_CMS.general,
        isLoading,
      }}
    >
      {children}
    </LandingCmsContext.Provider>
  );
}

export function useLandingCms() {
  return useContext(LandingCmsContext);
}

