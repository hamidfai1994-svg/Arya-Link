'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  ExternalLink,
  Tag,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';

interface Post {
  _id: string;
  title: any;
  slug: string;
  summary: any;
  coverImage?: string;
  category: string;
  author: string;
  tags: string[];
  readTimeMinutes: number;
  publishedAt: string;
}

export default function BlogListingPage() {
  const { language, dir } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cms/blog', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setPosts(json.posts || []);
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filteredPosts = posts.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const titleLoc = getLocalizedText(p.title, language).toLowerCase();
    const summaryLoc = getLocalizedText(p.summary, language).toLowerCase();
    const matchesSearch =
      !q ||
      titleLoc.includes(q) ||
      summaryLoc.includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans select-none" dir={dir}>


      {/* Hero Banner */}
      <section className="py-16 border-b border-border bg-muted/20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <Badge variant="cyan" className="text-xs">
            دانش و نوآوری دیجیتال
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            بلاگ و راهنمای کسب‌وکار هوشمند
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            تازه‌ترین مقالات در حوزه فناوری لمسی NFC، روش‌های فروش آنلاین، استراتژی‌های بازاریابی و تحول دیجیتال
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-md mx-auto relative">
            <Input
              type="text"
              placeholder="جستجو در بین مقالات و آموزش‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-2xl bg-card border-border pr-10 text-xs shadow-sm"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat === 'all' ? 'همه مقالات' : cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <span className="text-xs text-muted-foreground">در حال بارگذاری مقالات...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">مقاله‌ای یافت نشد</h3>
            <p className="text-xs text-muted-foreground">با عبارت دیگری جستجو کنید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const dateStr = new Date(post.publishedAt).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <Card
                  key={post._id}
                  className="rounded-3xl border-border bg-card overflow-hidden hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="h-48 w-full bg-slate-900 overflow-hidden relative">
                      <img
                        src={post.coverImage || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white border-0 text-[10px]">
                        {post.category}
                      </Badge>
                    </div>

                    {/* Post Content Details */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-cyan-500" />
                          <span>{dateStr}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{post.readTimeMinutes} دقیقه مطالعه</span>
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-cyan-500 transition-colors">
                        {getLocalizedText(post.title, language)}
                      </h2>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {getLocalizedText(post.summary, language)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-500 hover:text-cyan-400 group/link"
                    >
                      <span>مطالعه کامل مقاله</span>
                      <ArrowLeft className="w-3.5 h-3.5 group-hover/link:-translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
