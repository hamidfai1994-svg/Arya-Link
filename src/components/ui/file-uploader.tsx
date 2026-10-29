'use client';

import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  ExternalLink,
  Link2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export interface FileUploaderProps {
  value: string;
  onChange: (url: string) => void;
  fileType?: 'image' | 'document';
  folder?: 'avatars' | 'covers' | 'documents' | 'general' | 'products' | 'branding';
  label?: string;
  description?: string;
  maxSizeMB?: number; // 2 for images, 5 for documents
  aspectRatio?: 'square' | 'banner' | 'free';
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  value,
  onChange,
  fileType = 'image',
  folder = 'general',
  label,
  description,
  maxSizeMB = fileType === 'image' ? 2 : 5,
  aspectRatio = 'free',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [showDriveFallback, setShowDriveFallback] = useState(false);
  const [manualUrl, setManualUrl] = useState(value);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = fileType === 'document';

  const handleProcessAndUpload = async (file: File) => {
    // 1. Strict Size Check for Files over 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل بالاست. لطفاً در Google Drive آپلود کنید و لینک را وارد نمایید.', {
        duration: 7000,
      });
      setShowDriveFallback(true);
      setShowUrlInput(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadStatus('در حال آماده‌سازی فایل...');

    let fileToUpload = file;

    // 2. Image Compression using browser-image-compression for images under 5MB
    if (fileType === 'image' || file.type.startsWith('image/')) {
      try {
        setUploadStatus('در حال بهینه‌سازی و فشرده‌سازی تصویر...');
        setUploadProgress(35);

        const options = {
          maxSizeMB: Math.min(maxSizeMB, 1.5), // compress under 1.5MB
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp',
          onProgress: (p: number) => {
            // Map compression progress to 30% - 60%
            setUploadProgress(30 + Math.round((p / 100) * 30));
          },
        };

        const compressedBlob = await imageCompression(file, options);
        fileToUpload = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
          type: 'image/webp',
        });
      } catch (compErr) {
        console.warn('Image compression bypassed:', compErr);
        fileToUpload = file;
      }
    }

    // 3. Size Check after compression (Max 2.5MB for images, 5MB for documents)
    const allowedLimit = (fileType === 'image' ? 2.5 : 5) * 1024 * 1024;
    if (fileToUpload.size > allowedLimit) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('حجم فایل بالاست. لطفاً در Google Drive آپلود کنید و لینک را وارد نمایید.', {
        duration: 7000,
      });
      setShowDriveFallback(true);
      setShowUrlInput(true);
      return;
    }

    // 4. Upload to Server API with Progress Simulation
    setUploadStatus('در حال ارسال و بارگذاری در سرور...');
    setUploadProgress(70);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error('خطا در بارگذاری فایل', {
          description: data.message || 'مشکلی در ذخیره فایل رخ داد.',
        });
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(100);
      setUploadStatus('بارگذاری تکمیل شد!');
      onChange(data.url);
      setManualUrl(data.url);
      setShowDriveFallback(false);
      toast.success('فایل با موفقیت بارگذاری شد!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('خطای شبکه در بارگذاری فایل');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
      }, 500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessAndUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessAndUpload(file);
    }
  };

  const handleClear = () => {
    onChange('');
    setManualUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualUrlSave = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      toast.success('آدرس فایل با موفقیت ذخیره شد.');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Hint */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">{label}</label>
          <span className="text-[10px] text-muted-foreground font-sans">
            حداکثر {maxSizeMB}MB
          </span>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        disabled={isUploading}
        accept={fileType === 'image' ? 'image/*' : '.pdf,application/pdf'}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Active File / Image Display */}
      {value && !isUploading ? (
        <div className="relative rounded-2xl border border-border bg-card/60 p-3 shadow-sm flex items-center gap-3 overflow-hidden group">
          {fileType === 'image' ? (
            <div
              className={`relative overflow-hidden rounded-xl border border-border/80 bg-slate-900 shrink-0 ${
                aspectRatio === 'banner'
                  ? 'w-24 h-14'
                  : aspectRatio === 'square'
                  ? 'w-14 h-14'
                  : 'w-16 h-14'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate font-sans">
              {fileType === 'image' ? 'تصویر انتخاب شده' : 'فایل سند PDF'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              تغییر
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="حذف فایل"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Compact File Upload Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!isUploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`rounded-xl border border-dashed p-2.5 px-3 transition-all flex items-center justify-between gap-3 select-none cursor-pointer ${
            isUploading
              ? 'border-cyan-500/50 bg-cyan-500/5 cursor-wait pointer-events-none'
              : isDragging
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-border/90 hover:border-cyan-500/60 bg-muted/20 hover:bg-muted/40'
          }`}
        >
          {isUploading ? (
            <div className="py-1 w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span className="text-xs font-semibold">{uploadStatus}</span>
              </div>
              <div className="w-32 bg-muted rounded-full h-1.5 overflow-hidden border border-border/60">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-outfit text-muted-foreground">{uploadProgress}%</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                  {fileType === 'image' ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                </div>
                <div className="text-right truncate">
                  <span className="text-xs text-muted-foreground block truncate">
                    {description || (fileType === 'image' ? 'فرمت‌های JPG، PNG، WEBP' : 'فایل سند یا کاتالوگ')}
                  </span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>انتخاب فایل</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Size limit reminder under upload button */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
        <span className="font-sans font-medium text-[11px]">
          سایز مناسب: 2 مگابایت برای عکس، 5 مگابایت برای فایل
        </span>
        <span className="text-[10px] font-outfit">Google Drive برای بیش از 5MB</span>
      </div>

      {/* Google Drive Guideline & External Link Box for Large Files */}
      {showDriveFallback && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 space-y-2 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-sans">
              <strong>حجم فایل بالاست.</strong> لطفاً در{' '}
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 inline-flex items-center gap-1 mx-1"
              >
                گوگل درایو (Google Drive) <ExternalLink className="w-3 h-3" />
              </a>{' '}
              آپلود کنید و لینک را وارد نمایید.
            </div>
          </div>
        </div>
      )}

      {/* Manual Link / Google Drive Input toggle */}
      <div className="pt-0.5">
        {!showUrlInput && !showDriveFallback ? (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => setShowUrlInput(true)}
            className="text-[11px] text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <Link2 className="w-3 h-3" />
            <span>یا وارد کردن لینک مستقیم / Google Drive</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://drive.google.com/... یا لینک مستقیم"
              className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
              dir="ltr"
            />
            <button
              type="button"
              onClick={handleManualUrlSave}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shrink-0 transition-colors"
            >
              ثبت لینک
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
