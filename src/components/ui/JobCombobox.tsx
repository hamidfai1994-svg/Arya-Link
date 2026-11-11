'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Briefcase,
  Plus,
  Check,
  ChevronDown,
  X,
  Loader2,
  Sparkles,
  Stethoscope,
  Code,
  GraduationCap,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  JOB_CATEGORIES,
  INITIAL_SEED_JOBS,
  JobCategory,
  JobItem,
  ReferenceTemplateId,
  normalizeTemplateId,
} from '@/lib/constants/jobTemplates';

export interface JobSelection {
  title: string;
  categoryId: string;
  templateId: ReferenceTemplateId;
}

interface JobComboboxProps {
  value?: string;
  onChange: (selected: JobSelection) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Stethoscope':
      return <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />;
    case 'Code':
      return <Code className="w-3.5 h-3.5 text-cyan-500" />;
    case 'Briefcase':
      return <Building2 className="w-3.5 h-3.5 text-amber-500" />;
    case 'GraduationCap':
      return <GraduationCap className="w-3.5 h-3.5 text-purple-500" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
  }
};

export const JobCombobox: React.FC<JobComboboxProps> = ({
  value = '',
  onChange,
  placeholder = 'جستجو و انتخاب شغل یا حوزه فعالیت...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // 'search' mode or 'create_inline' mode
  const [viewMode, setViewMode] = useState<'search' | 'create_inline'>('search');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCategory, setNewJobCategory] = useState<string>('other');

  // Local state for categories and jobs
  const [categories, setCategories] = useState<JobCategory[]>(JOB_CATEGORIES);
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_SEED_JOBS);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch jobs from backend API on mount
  useEffect(() => {
    let isMounted = true;
    async function loadJobs() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        if (data.success && isMounted) {
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (Array.isArray(data.jobs) && data.jobs.length > 0) {
            setJobs(data.jobs);
          }
        }
      } catch (err) {
        console.warn('Jobs API load failed, using seed data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Collision detection to determine open direction (up vs down)
  const calculateDirection = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Popover needs ~300px. If space below is tight and above is more ample, flip upward.
    if (spaceBelow < 300 && spaceAbove > spaceBelow) {
      setOpenDirection('up');
    } else {
      setOpenDirection('down');
    }
  }, []);

  // Update direction on open, resize or scroll
  useEffect(() => {
    if (isOpen) {
      calculateDirection();
      window.addEventListener('resize', calculateDirection);
      window.addEventListener('scroll', calculateDirection, true);
      return () => {
        window.removeEventListener('resize', calculateDirection);
        window.removeEventListener('scroll', calculateDirection, true);
      };
    }
  }, [isOpen, calculateDirection]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode('search');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && viewMode === 'search') {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, viewMode]);

  // Selected job object
  const currentSelectedJob = useMemo(() => {
    if (!value) return null;
    const cleanVal = value.trim().toLowerCase();
    return jobs.find((j) => j.title.toLowerCase() === cleanVal || j.id === value) || {
      title: value,
      categoryId: 'other',
      templateId: normalizeTemplateId(value),
      isUserAdded: false,
    };
  }, [value, jobs]);

  // Filtered jobs based on search query and category filter
  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch = !q || job.title.toLowerCase().includes(q);
      const matchesCategory = selectedCategoryFilter === 'all' || job.categoryId === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [jobs, searchQuery, selectedCategoryFilter]);

  // Group filtered jobs by category
  const groupedJobs = useMemo(() => {
    const groups: Record<string, { category: JobCategory; items: JobItem[] }> = {};

    categories.forEach((cat) => {
      groups[cat.id] = { category: cat, items: [] };
    });

    filteredJobs.forEach((job) => {
      if (!groups[job.categoryId]) {
        groups[job.categoryId] = {
          category: {
            id: job.categoryId,
            title: 'سایر زمینه‌ها',
            titleEn: 'Other',
            defaultTemplateId: 'general',
            icon: 'Sparkles',
          },
          items: [],
        };
      }
      groups[job.categoryId].items.push(job);
    });

    return Object.values(groups).filter((g) => g.items.length > 0);
  }, [categories, filteredJobs]);

  // Handle select existing job
  const handleSelectJob = (job: JobItem) => {
    onChange({
      title: job.title,
      categoryId: job.categoryId,
      templateId: normalizeTemplateId(job.templateId),
    });
    setIsOpen(false);
    setSearchQuery('');
    setViewMode('search');
  };

  // Open inline creation form
  const handleOpenInlineCreate = () => {
    const term = searchQuery.trim();
    setNewJobTitle(term);
    setNewJobCategory(selectedCategoryFilter !== 'all' ? selectedCategoryFilter : 'other');
    setViewMode('create_inline');
  };

  // Handle submit new custom job
  const handleCreateNewJob = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const titleToCreate = newJobTitle.trim() || searchQuery.trim();
    if (!titleToCreate || titleToCreate.length < 2) {
      toast.error('لطفاً عنوان معتبری برای شغل وارد نمایید (حداقل 2 حرف).');
      return;
    }

    setIsSubmittingNew(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleToCreate,
          categoryId: newJobCategory || 'other',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'خطا در ثبت شغل جدید');
      }

      const created: JobItem = json.data;

      // Update local state with the new job
      setJobs((prev) => {
        const exists = prev.some((j) => j.title.toLowerCase() === created.title.toLowerCase());
        return exists ? prev : [created, ...prev];
      });

      // Select this new job
      onChange({
        title: created.title,
        categoryId: created.categoryId,
        templateId: normalizeTemplateId(created.templateId),
      });

      toast.success(`شغل «${created.title}» با موفقیت اضافه و انتخاب شد.`);
      setIsOpen(false);
      setSearchQuery('');
      setNewJobTitle('');
      setViewMode('search');
    } catch (err: any) {
      console.error('Error creating job:', err);
      toast.error(err.message || 'خطا در ثبت شغل جدید.');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className={`relative w-full font-sans select-none ${className}`} ref={containerRef} dir="rtl">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setViewMode('search');
          }
        }}
        className={`w-full h-11 px-3.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all text-right ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${
          isOpen
            ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-background shadow-sm'
            : 'border-input bg-background hover:bg-muted/40 text-foreground'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          {currentSelectedJob ? (
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-semibold text-foreground truncate">
                {currentSelectedJob.title}
              </span>
              {currentSelectedJob.categoryId && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
                  {categories.find((c) => c.id === currentSelectedJob.categoryId)?.title || 'شغل'}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground font-normal truncate">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-cyan-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover with Collision Detection */}
      {isOpen && (
        <div
          className={`absolute right-0 left-0 z-50 rounded-2xl bg-popover text-popover-foreground border border-border shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col ${
            openDirection === 'up'
              ? 'bottom-full mb-2 slide-in-from-bottom-2'
              : 'top-full mt-2 slide-in-from-top-2'
          }`}
          style={{ maxHeight: '380px' }}
        >
          {viewMode === 'search' ? (
            /* ================= SEARCH & LIST MODE ================= */
            <div className="flex flex-col h-full min-h-0">
              {/* Header: Search Input Bar */}
              <div className="p-2.5 pb-2 space-y-2 border-b border-border shrink-0 bg-popover">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsOpen(false);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filteredJobs.length > 0 && searchQuery.trim().toLowerCase() === filteredJobs[0].title.toLowerCase()) {
                          handleSelectJob(filteredJobs[0]);
                        } else if (searchQuery.trim().length > 0) {
                          handleOpenInlineCreate();
                        }
                      }
                    }}
                    placeholder="جستجو کنید (مثلاً: داکتر، برنامه‌نویس، عکاس...)"
                    className="w-full h-9 pr-8 pl-8 rounded-xl bg-muted/60 border border-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar scrollbar-none text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    همه ({jobs.length})
                  </button>
                  {categories.map((cat) => {
                    const count = jobs.filter((j) => j.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all flex items-center gap-1 ${
                          selectedCategoryFilter === cat.id
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                      >
                        <span>{cat.title}</span>
                        <span className="opacity-70 text-[10px]">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grouped Jobs Scroll Area: Constrained with max-h-[250px] and overflow-y-auto */}
              <div className="max-h-[250px] overflow-y-auto space-y-2.5 p-2 custom-scrollbar flex-1">
                {isLoading && jobs.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                    <span className="text-xs">در حال بارگذاری مشاغل...</span>
                  </div>
                ) : groupedJobs.length > 0 ? (
                  groupedJobs.map((group) => (
                    <div key={group.category.id} className="space-y-1">
                      {/* Category Header */}
                      <div className="flex items-center justify-between px-2.5 py-1 bg-muted/60 rounded-lg text-foreground border border-border/40 sticky top-0 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          {getCategoryIcon(group.category.icon)}
                          <span>{group.category.title}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {group.items.length} شغل
                        </span>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 gap-1 pt-0.5">
                        {group.items.map((job, idx) => {
                          const isSelected =
                            currentSelectedJob?.title.toLowerCase() === job.title.toLowerCase();
                          return (
                            <button
                              key={job.id || `${job.title}_${idx}`}
                              type="button"
                              onClick={() => handleSelectJob(job)}
                              className={`w-full p-2 px-3 rounded-xl text-right flex items-center justify-between text-xs transition-all ${
                                isSelected
                                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-bold'
                                  : 'hover:bg-muted/80 text-foreground'
                              }`}
                            >
                              <span className="truncate">{job.title}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {job.isUserAdded && (
                                  <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                    کاربری
                                  </span>
                                )}
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    هیچ شغلی مطابق با «{searchQuery}» در لیست فعلی یافت نشد.
                  </div>
                )}
              </div>

              {/* ================= CRITICAL FEATURE: ADD NEW JOB BUTTON (ALWAYS AT BOTTOM IF USER TYPED) ================= */}
              {searchQuery.trim().length > 0 && (
                <div className="p-2 pt-2 border-t border-border bg-muted/20 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenInlineCreate}
                    className="w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15 hover:from-cyan-500/25 hover:to-purple-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
                  >
                    <Plus className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>+ افزودن &quot;{searchQuery.trim()}&quot; به عنوان شغل جدید</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ================= INLINE CREATE & CATEGORIZE FORM ================= */
            <div className="p-3.5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span>افزودن شغل جدید به سیستم</span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('search')}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>انصراف و بازگشت</span>
                </button>
              </div>

              <form onSubmit={handleCreateNewJob} className="space-y-3">
                {/* Job Title Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground block">
                    عنوان شغل جدید:
                  </label>
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    required
                    placeholder="عنوان دقیق شغل را بنویسید..."
                    className="w-full h-10 px-3 rounded-xl bg-muted/60 border border-input text-xs text-foreground font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Category Dropdown Select */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground block">
                    انتخاب دسته‌بندی:
                  </label>
                  <div className="relative">
                    <select
                      value={newJobCategory}
                      onChange={(e) => setNewJobCategory(e.target.value)}
                      className="w-full h-10 px-3 pr-3 pl-8 rounded-xl bg-muted/60 border border-input text-xs text-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-popover text-popover-foreground py-1">
                          {cat.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingNew}
                    className="w-full h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingNew ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>در حال ثبت شغل در دیتابیس...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تایید و ثبت</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCombobox;
