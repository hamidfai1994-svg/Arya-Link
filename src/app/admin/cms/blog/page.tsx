'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  Save,
  Globe,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { MultilingualInput } from '@/components/admin/MultilingualInput';
import { MultilingualTextarea } from '@/components/admin/MultilingualTextarea';
import { MultilingualText, getLocalizedText, normalizeMultilingual } from '@/lib/i18n/multilingual';
import { toast } from 'sonner';

interface Post {
  _id: string;
  title: string | MultilingualText;
  slug: string;
  summary: string | MultilingualText;
  content: string | MultilingualText;
  coverImage?: string;
  category: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  readTimeMinutes: number;
  viewsCount: number;
  publishedAt: string;
}

export default function AdminBlogCmsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Multilingual Fields
  const [title, setTitle] = useState<MultilingualText>({ da: '', ps: '', en: '' });
  const [summary, setSummary] = useState<MultilingualText>({ da: '', ps: '', en: '' });
  const [content, setContent] = useState<MultilingualText>({ da: '', ps: '', en: '' });

  const [slug, setSlug] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('فناوری و کسب‌وکار');
  const [author, setAuthor] = useState('تیم تحریریه');
  const [tagsInput, setTagsInput] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cms/blog?admin=true', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setPosts(json.posts || []);
      }
    } catch (err) {
      toast.error('خطا در بارگذاری مقالات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle({ da: '', ps: '', en: '' });
    setSummary({ da: '', ps: '', en: '' });
    setContent({ da: '', ps: '', en: '' });
    setSlug('');
    setCoverImage('https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80');
    setCategory('فناوری و کسب‌وکار');
    setAuthor('تیم تحریریه آریا لینک');
    setTagsInput('NFC, هوشمند, دیجیتال');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Post) => {
    setEditingPost(p);
    setTitle(normalizeMultilingual(p.title));
    setSummary(normalizeMultilingual(p.summary));
    setContent(normalizeMultilingual(p.content));
    setSlug(p.slug);
    setCoverImage(p.coverImage || '');
    setCategory(p.category);
    setAuthor(p.author);
    setTagsInput((p.tags || []).join(', '));
    setIsPublished(p.isPublished);
    setIsModalOpen(true);
  };

  // Auto-translate all fields at once
  const handleAutoTranslateAll = async () => {
    if (!title.da && !summary.da) {
      toast.error('لطفاً ابتدا فیلدهای زبان دری را وارد نمایید.');
      return;
    }

    setIsTranslatingAll(true);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            title: title.da,
            summary: summary.da,
            content: content.da,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.ps?.title || data.en?.title) {
          setTitle({ ...title, ps: data.ps?.title || title.ps, en: data.en?.title || title.en });
        }
        if (data.ps?.summary || data.en?.summary) {
          setSummary({ ...summary, ps: data.ps?.summary || summary.ps, en: data.en?.summary || summary.en });
        }
        if (data.ps?.content || data.en?.content) {
          setContent({ ...content, ps: data.ps?.content || content.ps, en: data.en?.content || content.en });
        }
        toast.success('🪄 تمامی فیلدها با هوش مصنوعی به پشتو و انگلیسی ترجمه شدند!');
      } else {
        toast.error('خطا در ترجمه خودکار فیلدها');
      }
    } catch {
      toast.error('خطای شبکه در ترجمه خودکار');
    } finally {
      setIsTranslatingAll(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.da.trim() || !summary.da.trim()) {
      toast.error('عنوان و خلاصه مقاله به زبان دری الزامی است.');
      return;
    }

    const payload = {
      id: editingPost?._id,
      title,
      slug: slug.trim() || title.da.toLowerCase().replace(/[\s\W-]+/g, '-'),
      summary,
      content,
      coverImage: coverImage.trim(),
      category: category.trim(),
      author: author.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      isPublished,
    };

    setIsSubmitting(true);
    try {
      const method = editingPost ? 'PUT' : 'POST';
      const res = await fetch('/api/cms/blog', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error('خطا در ذخیره مقاله', { description: json.message });
        setIsSubmitting(false);
        return;
      }

      toast.success(editingPost ? 'مقاله بروزرسانی شد' : 'مقاله جدید منتشر شد');
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      toast.error('خطای ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`آیا از حذف مقاله «${postTitle}» اطمینان دارید؟`)) return;

    try {
      const res = await fetch(`/api/cms/blog?id=${postId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('مقاله با موفقیت حذف شد.');
        fetchPosts();
      } else {
        toast.error('خطا در حذف مقاله');
      }
    } catch (err) {
      toast.error('خطای شبکه');
    }
  };

  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const titleDa = getLocalizedText(p.title, 'da');
    const summaryDa = getLocalizedText(p.summary, 'da');
    return (
      titleDa.toLowerCase().includes(q) ||
      summaryDa.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              مدیریت سه‌زبانه بلاگ و مقالات (Multilingual Blog CMS)
            </h1>
            <Badge variant="cyan" className="font-outfit text-xs">
              CMS 3-LANG
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            نگارش، ویرایش و ترجمه خودکار مقالات بلاگ به زبان‌های دری (da)، پشتو (ps) و انگلیسی (en) با هوش مصنوعی
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>پست مقاله جدید</span>
          </Button>

          <Button
            onClick={fetchPosts}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="h-10 px-3 rounded-xl border-border bg-card"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            type="text"
            placeholder="جستجوی عنوان یا نامک مقاله..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-outfit">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>{filteredPosts.length} مقاله ثبت‌شده</span>
        </div>
      </div>

      {/* Posts Table */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="text-xs">در حال بارگذاری مقالات...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="text-sm font-bold text-foreground">مقاله‌ای یافت نشد</h3>
            <p className="text-xs text-muted-foreground mt-1">
              جهت ایجاد اولین پست روی دکمه پست مقاله جدید کلیک نمایید.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs">عنوان و خلاصه مقاله</TableHead>
                  <TableHead className="text-right font-bold text-xs">پوشش زبانی</TableHead>
                  <TableHead className="text-right font-bold text-xs">دسته‌بندی</TableHead>
                  <TableHead className="text-right font-bold text-xs">نویسنده</TableHead>
                  <TableHead className="text-right font-bold text-xs">بازدیدها</TableHead>
                  <TableHead className="text-right font-bold text-xs">وضعیت</TableHead>
                  <TableHead className="text-center font-bold text-xs">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((p) => {
                  const titleDa = getLocalizedText(p.title, 'da');
                  const titlePs = getLocalizedText(p.title, 'ps');
                  const titleEn = getLocalizedText(p.title, 'en');
                  const summaryDa = getLocalizedText(p.summary, 'da');

                  return (
                    <TableRow key={p._id} className="border-border hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.coverImage && (
                            <img
                              src={p.coverImage}
                              alt=""
                              className="w-12 h-10 rounded-lg object-cover shrink-0 border border-border"
                            />
                          )}
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-foreground line-clamp-1 block">
                              {titleDa}
                            </span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1 block">
                              {summaryDa}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              titleDa ? 'bg-cyan-500/15 text-cyan-500' : 'bg-muted text-muted-foreground'
                            }`}
                            title="دری"
                          >
                            🇦🇫 DA
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              titlePs && titlePs !== titleDa
                                ? 'bg-amber-500/15 text-amber-500'
                                : 'bg-muted text-muted-foreground opacity-50'
                            }`}
                            title="پشتو"
                          >
                            🇦🇫 PS
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              titleEn && titleEn !== titleDa
                                ? 'bg-purple-500/15 text-purple-400'
                                : 'bg-muted text-muted-foreground opacity-50'
                            }`}
                            title="انگلیسی"
                          >
                            🇬🇧 EN
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">{p.category}</TableCell>

                      <TableCell className="text-xs text-muted-foreground">{p.author}</TableCell>

                      <TableCell className="font-outfit text-xs font-bold text-foreground">
                        {p.viewsCount || 0}
                      </TableCell>

                      <TableCell>
                        {p.isPublished ? (
                          <Badge variant="success" className="text-[10px] py-0 px-1.5 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>منتشر شده</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            <span>پیش‌نویس</span>
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link href={`/blog/${p.slug}`} target="_blank">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground"
                              title="مشاهده زنده مقاله"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(p)}
                            className="h-8 px-2 text-[11px] rounded-lg text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/10"
                            title="ویرایش مقاله"
                          >
                            <Edit className="w-3.5 h-3.5 ml-1" />
                            <span>ویرایش</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(p._id, titleDa)}
                            className="h-8 px-2 text-[11px] rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            title="حذف مقاله"
                          >
                            <Trash2 className="w-3.5 h-3.5 ml-1" />
                            <span>حذف</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                <span>{editingPost ? 'ویرایش سه‌زبانه مقاله' : 'انتشار مقاله سه‌زبانه جدید'}</span>
              </DialogTitle>

              {/* Master Translate Button */}
              <Button
                type="button"
                onClick={handleAutoTranslateAll}
                disabled={isTranslatingAll}
                className="h-8 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                {isTranslatingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>ترجمه هوشمند تمام فیلدها 🪄</span>
              </Button>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              محتوای مقاله را به زبان دری بنویسید؛ با کلیک بر دکمه‌های ترجمه خودکار، فیلدهای پشتو و انگلیسی سریعاً تکمیل می‌گردند.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* Multilingual Title */}
            <MultilingualInput
              label="عنوان مقاله"
              value={title}
              onChange={setTitle}
              placeholder={{
                da: 'مثال: نسل جدید کارت‌های ویزیت لمسی NFC',
                ps: 'د سمارټ NFC ویزټ کارټونو نوی نسل',
                en: 'Next Generation Contactless NFC Smart Cards',
              }}
              required
            />

            {/* Slug & Cover */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">شناسه آدرس (Slug) *</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="nfc-smart-cards-guide"
                  className="h-10 rounded-xl text-xs font-outfit"
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">آدرس تصویر کاور (URL)</label>
                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://... یا /uploads/media/..."
                  className="h-10 rounded-xl text-xs font-outfit"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Multilingual Summary */}
            <MultilingualTextarea
              label="خلاصه کوتاه مقاله (در لیست‌ها و کارت‌ها)"
              value={summary}
              onChange={setSummary}
              placeholder={{
                da: 'توضیح کوتاه یک یا دو پاراگرافی درباره محتوای مقاله...',
                ps: 'د مقالې لنډ معلومات چې په کارتونو او لستونو کې ښودل کیږي...',
                en: 'Short summary of the article displayed on listing cards...',
              }}
              rows={2}
              required
            />

            {/* Multilingual Content */}
            <MultilingualTextarea
              label="متن کامل و بدنه مقاله (پشتیبانی از HTML)"
              value={content}
              onChange={setContent}
              placeholder={{
                da: '<p>متن کامل مقاله به همراه تیترها و پاراگراف‌ها...</p>',
                ps: '<p>د مقالې بشپړ متن او توضیحات په پښتو ژبه...</p>',
                en: '<p>Full body text and HTML content in English...</p>',
              }}
              rows={6}
              required
            />

            {/* Category & Author & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">دسته‌بندی</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">نویسنده</label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">برچسب‌ها (با کاما)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="NFC, هوشمند, کارت"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Publication Toggle */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border">
              <input
                type="checkbox"
                id="isPublishedToggle"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
              />
              <label htmlFor="isPublishedToggle" className="text-xs font-bold cursor-pointer text-foreground">
                انتشار عمومی در صفحه بلاگ سایت
              </label>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-10 rounded-xl text-xs"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>ذخیره تغییرات سه‌زبانه</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
