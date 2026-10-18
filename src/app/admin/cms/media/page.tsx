'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Copy,
  Trash2,
  Check,
  Search,
  RefreshCw,
  Loader2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        setFiles(data.files || []);
      }
    } catch (err) {
      toast.error('خطا در دریافت لیست رسانه‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'media');

    setIsUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تصویر با موفقیت بارگذاری شد!');
        fetchMediaFiles();
      } else {
        toast.error(data.message || 'خطا در آپلود');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور در آپلود فایل');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyLink = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    toast.success('لینک مستقیم تصویر کپی شد!');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDelete = async (url: string) => {
    if (!confirm('آیا از حذف این فایل مطمئن هستید؟')) return;

    try {
      const res = await fetch(`/api/admin/media?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('فایل حذف گردید.');
        fetchMediaFiles();
      } else {
        toast.error(data.message || 'خطا در حذف');
      }
    } catch (err) {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              گالری رسانه و فایل‌ها (Media Library)
            </h1>
            <Badge variant="cyan" className="font-outfit text-xs">
              CMS Assets
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            آپلود تصاویر، لوگوها و فایل‌های موردنیاز در مقالات بلاگ، کارت‌های NFC و بخش‌های مختلف سایت
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            size="sm"
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>بارگذاری رسانه جدید</span>
          </Button>

          <Button
            onClick={fetchMediaFiles}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="h-10 px-3 rounded-xl border-border bg-card"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            type="text"
            placeholder="جستجوی نام فایل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <span className="text-xs text-muted-foreground font-outfit">
          {filteredFiles.length} فایل ثبت شده
        </span>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <span className="text-xs">در حال واکشی فایل‌های رسانه...</span>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="p-16 text-center flex flex-col items-center justify-center border border-dashed border-border rounded-3xl bg-card/40">
          <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="text-sm font-bold text-foreground">فایلی یافت نشد</h3>
          <p className="text-xs text-muted-foreground mt-1">
            جهت شروع، اولین تصویر خود را آپلود نمایید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map((file) => {
            const isCopied = copiedUrl === file.url;
            return (
              <Card
                key={file.url}
                className="rounded-2xl border-border bg-card/90 overflow-hidden shadow-sm flex flex-col group transition-all hover:border-rose-500/40"
              >
                <div className="h-36 bg-slate-950 flex items-center justify-center relative overflow-hidden">
                  {file.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <FileText className="w-10 h-10" />
                      <span className="text-[10px]">فایل سند</span>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-colors"
                      title="مشاهده اندازه اصلی"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(file.url)}
                      className="w-8 h-8 rounded-lg bg-rose-500/80 text-white hover:bg-rose-600 flex items-center justify-center transition-colors"
                      title="حذف فایل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-xs font-bold text-foreground truncate block" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-outfit mt-0.5 block">
                      {formatBytes(file.size)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyLink(file.url)}
                    className={`w-full h-8 text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      isCopied ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : ''
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'کپی شد!' : 'کپی لینک'}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
