'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_PRICING_CONTENT,
  DEFAULT_FEATURES_CONTENT,
  DEFAULT_HOW_IT_WORKS_CONTENT,
  DEFAULT_FINAL_CTA_CONTENT,
  DEFAULT_LEGAL_CONTENT,
  DEFAULT_CONTACT_US_CONTENT,
  ISiteContentHero,
  ISiteContentNfcConcept,
  ISiteContentSlider,
  ISiteContentAboutUs,
  ISiteContentTeamMember,
  ISiteContentPartner,
  ISiteContentBlogCms,
  ISiteContentSeo,
  ISiteContentPricing,
  ISiteContentFeatures,
  ISiteContentHowItWorks,
  ISiteContentFinalCta,
  ISiteContentLegal,
  ISiteContentContactUs,
  ISiteContentFaq,
  ISiteContentFooter,
} from '@/models/SiteContent.model';

interface SiteContentContextType {
  hero: ISiteContentHero;
  nfcConcept: ISiteContentNfcConcept;
  sliders: ISiteContentSlider[];
  aboutUs: ISiteContentAboutUs;
  team: ISiteContentTeamMember[];
  partners: ISiteContentPartner[];
  blogCms: ISiteContentBlogCms;
  seo: ISiteContentSeo;
  pricing: ISiteContentPricing;
  features: ISiteContentFeatures;
  howItWorks: ISiteContentHowItWorks;
  finalCta: ISiteContentFinalCta;
  legal: ISiteContentLegal;
  contactUs: ISiteContentContactUs;
  faq: ISiteContentFaq[];
  footer: ISiteContentFooter;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType>({
  hero: DEFAULT_SITE_CONTENT.hero,
  nfcConcept: DEFAULT_SITE_CONTENT.nfcConcept,
  sliders: DEFAULT_SITE_CONTENT.sliders,
  aboutUs: DEFAULT_SITE_CONTENT.aboutUs,
  team: DEFAULT_SITE_CONTENT.team || [],
  partners: DEFAULT_SITE_CONTENT.partners || [],
  blogCms: DEFAULT_SITE_CONTENT.blogCms || ({} as any),
  seo: DEFAULT_SITE_CONTENT.seo || ({} as any),
  pricing: DEFAULT_PRICING_CONTENT,
  features: DEFAULT_FEATURES_CONTENT,
  howItWorks: DEFAULT_HOW_IT_WORKS_CONTENT,
  finalCta: DEFAULT_FINAL_CTA_CONTENT,
  legal: DEFAULT_LEGAL_CONTENT,
  contactUs: DEFAULT_CONTACT_US_CONTENT,
  faq: DEFAULT_SITE_CONTENT.faq,
  footer: DEFAULT_SITE_CONTENT.footer,
  isLoading: false,
  refetch: async () => {},
});

export function SiteContentProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: any;
}) {
  const [data, setData] = useState(initialData || DEFAULT_SITE_CONTENT);
  const [isLoading, setIsLoading] = useState(!initialData);

  const loadData = async () => {
    try {
      const res = await fetch('/api/cms/content', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load site content from API, keeping defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SiteContentContext.Provider
      value={{
        hero: data.hero || DEFAULT_SITE_CONTENT.hero,
        nfcConcept: data.nfcConcept || DEFAULT_SITE_CONTENT.nfcConcept,
        sliders: data.sliders && data.sliders.length > 0 ? data.sliders : DEFAULT_SITE_CONTENT.sliders,
        aboutUs: data.aboutUs || DEFAULT_SITE_CONTENT.aboutUs,
        team: data.team && data.team.length > 0 ? data.team : (DEFAULT_SITE_CONTENT.team || []),
        partners: data.partners && data.partners.length > 0 ? data.partners : (DEFAULT_SITE_CONTENT.partners || []),
        blogCms: data.blogCms || DEFAULT_SITE_CONTENT.blogCms || ({} as any),
        seo: data.seo || DEFAULT_SITE_CONTENT.seo || ({} as any),
        pricing: data.pricing || DEFAULT_PRICING_CONTENT,
        features: data.features || DEFAULT_FEATURES_CONTENT,
        howItWorks: data.howItWorks || DEFAULT_HOW_IT_WORKS_CONTENT,
        finalCta: data.finalCta || DEFAULT_FINAL_CTA_CONTENT,
        legal: data.legal || DEFAULT_LEGAL_CONTENT,
        contactUs: data.contactUs || DEFAULT_CONTACT_US_CONTENT,
        faq: data.faq && data.faq.length > 0 ? data.faq : DEFAULT_SITE_CONTENT.faq,
        footer: data.footer || DEFAULT_SITE_CONTENT.footer,
        isLoading,
        refetch: loadData,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
