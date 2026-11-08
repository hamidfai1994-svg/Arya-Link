'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Camera,
  Upload,
  Link as LinkIcon,
  Clipboard,
  RefreshCw,
  CheckCircle2,
  Scan,
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  FileText,
  Loader2,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ScannedContactData {
  name: string;
  phone: string;
  email: string;
  website?: string;
  company?: string;
  job_title?: string;
  socials?: {
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    [key: string]: string | undefined;
  };
  notes?: string;
  rawText?: string;
}

interface CardOcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (contact: ScannedContactData) => void;
  initialImageSrc?: string | null;
  initialMode?: 'upload' | 'url' | 'clipboard' | 'camera';
}

// Convert Persian/Arabic digits to strictly English digits
export function convertToEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export const CardOcrScannerModal: React.FC<CardOcrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  initialImageSrc,
  initialMode = 'upload',
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [parsedData, setParsedData] = useState<ScannedContactData | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Advanced upload modes: 'menu' | 'url_input'
  const [activeSubMode, setActiveSubMode] = useState<'menu' | 'url_input'>('menu');
  const [urlInput, setUrlInput] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when closing
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleClose = () => {
    stopCamera();
    setImageSrc(null);
    setParsedData(null);
    setIsScanning(false);
    setActiveSubMode('menu');
    setUrlInput('');
    onClose();
  };

  // Watch initialImageSrc (e.g. from global Ctrl+V paste)
  useEffect(() => {
    if (isOpen && initialImageSrc) {
      setImageSrc(initialImageSrc);
      runGeminiVisionOcr(initialImageSrc, false);
    }
  }, [isOpen, initialImageSrc]);

  // Watch initialMode if provided
  useEffect(() => {
    if (isOpen && !initialImageSrc) {
      if (initialMode === 'clipboard') {
        handleClipboardRead();
      } else if (initialMode === 'url') {
        setActiveSubMode('url_input');
      } else if (initialMode === 'camera') {
        startCamera();
      }
    }
  }, [isOpen, initialMode]);

  // Helper: Client-side image compression to max 1024px and JPEG quality 0.7
  const compressImage = (imageSource: File | Blob | string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const MAX_DIMENSION = 1024;
          let { width, height } = img;

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(typeof imageSource === 'string' ? imageSource : '');
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Compress with quality 0.7 to reduce size below 200KB while preserving sharp OCR text
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressed);
        } catch (err) {
          console.warn('Canvas compression error:', err);
          resolve(typeof imageSource === 'string' ? imageSource : '');
        }
      };

      img.onerror = () => {
        resolve(typeof imageSource === 'string' ? imageSource : '');
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        img.src = URL.createObjectURL(imageSource);
      }
    });
  };

  // Start live webcam / mobile camera
  const startCamera = async () => {
    setImageSrc(null);
    setParsedData(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access failed:', err);
      toast.error('دسترسی به دوربین برقرار نشد. لطفاً از گزینه آپلود یا کلیپ‌بورد استفاده کنید.');
    }
  };

  // Capture still image from camera video stream
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    stopCamera();
    const compressed = await compressImage(dataUrl);
    setImageSrc(compressed);
    runGeminiVisionOcr(compressed, false);
  };

  // Handle uploaded file (Option 1: Upload from device with client-side compression)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    try {
      const compressed = await compressImage(file);
      setImageSrc(compressed);
      runGeminiVisionOcr(compressed, false);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageSrc(result);
        runGeminiVisionOcr(result, false);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input so the same file can be picked again if desired
    e.target.value = '';
  };

  // Option 2: Image URL scan
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed || !trimmed.startsWith('http')) {
      toast.error('لطفاً یک آدرس اینترنتی معتبر (شروع با http یا https) وارد کنید.');
      return;
    }
    setImageSrc(trimmed);
    runGeminiVisionOcr(trimmed, true);
  };

  // Option 3: Read from clipboard
  const handleClipboardRead = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        toast.error('مرورگر شما از دسترسی مستقیم به کلیپ‌بورد پشتیبانی نمی‌کند. می‌توانید با زدن Ctrl+V تصویر را جایگذاری کنید.');
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const compressed = await compressImage(blob);
          if (compressed) {
            setImageSrc(compressed);
            runGeminiVisionOcr(compressed, false);
            toast.success('تصویر فشرده شده از کلیپ‌بورد برای اسکن ارسال شد!');
            return;
          }
        }
      }

      // Check if text in clipboard is an image URL
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().startsWith('http') && (text.includes('.jpg') || text.includes('.png') || text.includes('.jpeg') || text.includes('.webp'))) {
          setImageSrc(text.trim());
          runGeminiVisionOcr(text.trim(), true);
          return;
        }
      } catch { }

      toast.info('هیچ تصویری در کلیپ‌بورد شما یافت نشد. عکسی را Copy کنید و مجدداً امتحان کنید.');
    } catch (err: any) {
      console.error('Clipboard error:', err);
      toast.error('امکان خواندن کلیپ‌بورد وجود ندارد. لطفاً اجازه دسترسی بدهید یا عکس را آپلود کنید.');
    }
  };

  // Call Gemini Vision OCR API Route (High-Precision Persian/Dari/Pashto/English)
  const runGeminiVisionOcr = async (imgPayload: string, isUrl = false) => {
    setIsScanning(true);
    setScanProgress(20);
    setStatusText('در حال آماده‌سازی و بهینه‌سازی تصویر...');

    try {
      let finalPayload = imgPayload;
      if (!isUrl && (imgPayload.startsWith('data:image') || imgPayload.length > 50000)) {
        finalPayload = await compressImage(imgPayload);
      }

      setScanProgress(45);
      setStatusText('در حال ارسال تصویر فشرده به هوش مصنوعی...');

      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isUrl ? { imageUrl: finalPayload } : { imageBase64: finalPayload }),
      });

      setScanProgress(80);
      setStatusText('در حال خواندن و استخراج متون فارسی، پشتو و انگلیسی...');

      const result = await res.json();
      if (!result.success || !result.data) {
        throw new Error(result.message || 'خطا در اسکن تصویر کارت با هوش مصنوعی.');
      }

      const { name, phone, email, website, company, job_title, socials } = result.data;
      setScanProgress(100);
      setStatusText('اطلاعات با دقت بالا استخراج شد!');

      const notesArr = [
        company ? `شرکت: ${company}` : '',
        job_title ? `سمت: ${job_title}` : '',
        website ? `وب‌سایت: ${website}` : '',
        'اسکن شده با هوش مصنوعی در Arya Link',
      ].filter(Boolean);

      const parsed: ScannedContactData = {
        name: name || '',
        phone: phone || '',
        email: email || '',
        website: website || '',
        company: company || '',
        job_title: job_title || '',
        socials: socials || {},
        notes: notesArr.join(' - '),
      };

      setParsedData(parsed);
      toast.success('کارت ویزیت با هوش مصنوعی تحلیل شد!');
    } catch (err: any) {
      console.error('Gemini OCR Error:', err);
      toast.error(err.message || 'خطا در تحلیل تصویر کارت ویزیت.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveContact = () => {
    if (!parsedData) return;
    if (!parsedData.name && !parsedData.phone) {
      toast.error('لطفاً حداقل نام یا شماره تماس را وارد کنید.');
      return;
    }
    onScanComplete(parsedData);
    handleClose();
  };

  // Listen to paste inside the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleModalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            stopCamera();
            compressImage(file).then((compressed) => {
              if (compressed) {
                setImageSrc(compressed);
                runGeminiVisionOcr(compressed, false);
                toast.success('تصویر الصاق شده فشرده و برای اسکن ارسال شد!');
              }
            });
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleModalPaste);
    return () => window.removeEventListener('paste', handleModalPaste);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-lg rounded-3xl z-50 bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl p-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader className="space-y-1.5 pb-2 border-b border-white/10 text-right">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-inner">
                <Scan className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  <span>اسکنر هوشمند ویزیت کارت</span>

                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  لطفا از ویزیت کارت تان در محیط مناسب و نور کافی، عکس واضح بگیرید!
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          {/* Advanced Upload Menu (When no image or camera) */}
          {!imageSrc && !isCameraActive && (
            <div className="space-y-3 py-2">
              {activeSubMode === 'menu' ? (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option 1: Upload from device */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all hover:scale-[1.02] text-cyan-300 font-bold text-xs shadow-md group cursor-pointer text-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span>۱. آپلود از دستگاه</span>
                      <span className="text-[10px] text-slate-400 font-normal">انتخاب فایل از گالری/کامپیوتر</span>
                    </button>

                    {/* Option 2: Paste Image URL */}
                    <button
                      type="button"
                      onClick={() => setActiveSubMode('url_input')}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all hover:scale-[1.02] text-purple-300 font-bold text-xs shadow-md group cursor-pointer text-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                      <span>۲. جایگذاری لینک عکس</span>
                      <span className="text-[10px] text-slate-400 font-normal">ورود URL مستقیم تصویر اینترنتی</span>
                    </button>

                    {/* Option 3: Read from Clipboard */}
                    <button
                      type="button"
                      onClick={handleClipboardRead}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all hover:scale-[1.02] text-emerald-300 font-bold text-xs shadow-md group cursor-pointer text-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <Clipboard className="w-5 h-5" />
                      </div>
                      <span>۳. خواندن از کلیپ‌بورد</span>
                      <span className="text-[10px] text-slate-400 font-normal">کپی و خواندن تصویر یا متن لینک</span>
                    </button>

                    {/* Option 4: Camera */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all hover:scale-[1.02] text-slate-200 font-bold text-xs shadow-md group cursor-pointer text-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span>۴. عکس با دوربین</span>
                      <span className="text-[10px] text-slate-400 font-normal">عکاسی زنده با وبکم یا موبایل</span>
                    </button>
                  </div>

                  {/* Keyboard shortcut hint */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>جایگذاری فوق‌سریع:</span>
                    </span>
                    <span className="font-sans font-bold bg-slate-900 border border-white/15 px-2 py-0.5 rounded text-[11px] text-cyan-400">
                      Ctrl + V
                    </span>
                  </div>
                </>
              ) : (
                /* Submode: URL Input Form */
                <form onSubmit={handleUrlSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4 text-purple-400" />
                      <span>جایگذاری لینک مستقیم عکس کارت:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSubMode('menu')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      بازگشت
                    </button>
                  </div>

                  <input
                    type="url"
                    dir="ltr"
                    autoFocus
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/card.jpg"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-white font-sans outline-none"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={!urlInput.trim()}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>بارگیری و اسکن با Gemini</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubMode('menu')}
                      className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs border border-white/10"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Live Camera Viewfinder */}
          {isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-black aspect-[16/10] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-4 border-2 border-dashed border-cyan-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] text-cyan-200/80 bg-slate-950/70 px-2.5 py-1 rounded-full font-sans">
                  کارت را در این کادر قرار دهید
                </span>
              </div>
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3 px-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="py-2 px-5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>ثبت و اسکن</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="py-2 px-3 rounded-full bg-slate-900/80 text-slate-300 text-xs border border-white/20 cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          )}

          {/* Captured / Uploaded Image with High-tech Laser Scanner Line Overlay */}
          {imageSrc && (
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-900/80 aspect-[16/10] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Business Card"
                className="w-full h-full object-contain"
              />

              {/* Animated Laser Scanner Line */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee,0_0_30px_#06b6d4]"
                    animate={{ y: ['0%', '7000%', '0%'] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
                </div>
              )}

              {/* Retake button */}
              {!isScanning && (
                <button
                  type="button"
                  onClick={() => {
                    setImageSrc(null);
                    setParsedData(null);
                    setActiveSubMode('menu');
                  }}
                  className="absolute top-2.5 left-2.5 py-1 px-2.5 rounded-lg bg-slate-900/80 border border-white/20 text-[11px] text-slate-200 hover:text-white flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>انتخاب عکس دیگر</span>
                </button>
              )}
            </div>
          )}

          {/* Scanner Progress Bar */}
          {isScanning && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-300 font-medium flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>{statusText}</span>
                </span>
                <span className="text-cyan-400 font-bold font-sans">{scanProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400"
                  style={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}

          {/* Extracted Contact Form (Autofilled with Gemini JSON keys) */}
          {parsedData && !isScanning && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>اطلاعات استخراج شده</span>
                </span>
                <span className="text-[10px] text-slate-400 font-sans">قابل ویرایش</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-cyan-400" />
                    <span>نام و نام خانوادگی:</span>
                  </label>
                  <input
                    type="text"
                    value={parsedData.name}
                    onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                    placeholder="نام مخاطب..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>شماره تماس:</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={parsedData.phone}
                    onChange={(e) =>
                      setParsedData({
                        ...parsedData,
                        phone: convertToEnglishDigits(e.target.value),
                      })
                    }
                    placeholder="0700 000 000"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-2.5 py-1.5 text-xs text-white font-sans text-left outline-none"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-400" />
                    <span>نام شرکت / برند:</span>
                  </label>
                  <input
                    type="text"
                    value={parsedData.company || ''}
                    onChange={(e) => setParsedData({ ...parsedData, company: e.target.value })}
                    placeholder="نام شرکت..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-purple-400" />
                    <span>سمت یا عنوان شغلی:</span>
                  </label>
                  <input
                    type="text"
                    value={parsedData.job_title || ''}
                    onChange={(e) => setParsedData({ ...parsedData, job_title: e.target.value })}
                    placeholder="مدیرعامل، طراح و..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-amber-400" />
                    <span>آدرس ایمیل:</span>
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={parsedData.email}
                    onChange={(e) => setParsedData({ ...parsedData, email: e.target.value })}
                    placeholder="contact@example.com"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-2.5 py-1.5 text-xs text-white font-sans text-left outline-none"
                  />
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>آدرس وب‌سایت:</span>
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={parsedData.website || ''}
                    onChange={(e) => setParsedData({ ...parsedData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-2.5 py-1.5 text-xs text-white font-sans text-left outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveContact}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تبدیل و افزودن به ماژول‌های کارت</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs border border-white/10 hover:bg-slate-700 cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
