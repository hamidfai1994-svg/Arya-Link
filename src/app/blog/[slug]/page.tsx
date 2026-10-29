'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  Share2,
  Tag,
  BookOpen,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import { toast } from 'sonner';

export default function SingleBlogPostPage() {
  const { language, dir } = useLanguage();
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cms/blog?slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      if (json.success && json.post) {
        setPost(json.post);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('لینک مقاله کپی شد!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="text-xs text-muted-foreground">در حال خواندن مقاله...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-4 text-center" dir="rtl">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-bold">مقاله مورد نظر یافت نشد</h1>
        <Link href="/blog">
          <Button variant="outline" className="rounded-xl text-xs">
            بازگشت به لیست بلاگ
          </Button>
        </Link>
      </div>
    );
  }

  const dateStr = new Date(post.publishedAt || post.createdAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans select-none" dir="rtl">
      {/* Top Action Bar */}
      <div className="border-b border-border/80 bg-muted/10 py-3">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-cyan-500" />
            <span>بازگشت به مقالات بلاگ</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8 rounded-xl text-xs flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>اشتراک‌گذاری</span>
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Meta Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" className="text-xs">
              {post.category}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTimeMinutes || 4} دقیقه مطالعه</span>
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.viewsCount || 1} بازدید</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-snug">
            {getLocalizedText(post.title, language)}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {getLocalizedText(post.summary, language)}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-border/60 text-xs text-muted-foreground">
            <span>نویسنده: <strong className="text-foreground">{post.author}</strong></span>
            <span>تاریخ انتشار: {dateStr}</span>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-border shadow-xl">
            <img src={post.coverImage} alt={getLocalizedText(post.title, language)} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Body Content */}
        <div
          className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-4 font-sans text-foreground"
          dangerouslySetInnerHTML={{ __html: getLocalizedText(post.content, language) }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-border flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-semibold">برچسب‌ها:</span>
            {post.tags.map((tag: string, i: number) => (
              <Badge key={i} variant="outline" className="text-[11px] font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA Box */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 text-center space-y-4">
          <h3 className="text-lg font-bold text-foreground">
            می‌خواهید کارت هوشمند اختصاصی خود را بسازید؟
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            در کمتر از 1 دقیقه حساب کاربری خود را در آریا لینک بسازید و از قابلیت‌های مدرن کارت ویزیت هوشمند بهره‌مند شوید.
          </p>
          <Link href="/register">
            <Button className="rounded-2xl bg-cyan-500 text-white font-bold text-xs h-11 px-8">
              شروع رایگان با آریا لینک
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
