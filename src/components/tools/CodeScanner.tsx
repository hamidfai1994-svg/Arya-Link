'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Upload,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  SwitchCamera,
  Layers,
  ExternalLink,
  RefreshCw,
  QrCode,
  Barcode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export interface CodeScannerProps {
  onRecreate: (decodedText: string, formatName?: string) => void;
  scannerType?: 'all' | 'barcode' | 'qrcode';
  title?: string;
  subtitle?: string;
}

export function CodeScanner({
  onRecreate,
  scannerType = 'all',
  title,
  subtitle,
}: CodeScannerProps) {
  // Mode: 'camera' vs 'file'
  const [scanMode, setScanMode] = useState<'camera' | 'file'>('camera');

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);

  // File scan states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isScanningFile, setIsScanningFile] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Decoded Result
  const [decodedResult, setDecodedResult] = useState<{
    text: string;
    format?: string;
    timestamp: number;
  } | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // References
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const scannerContainerId = 'code-scanner-camera-viewport';

  // Helper to immediately kill all MediaStream tracks and turn off webcam LED synchronously
  const killAllMediaTracks = useCallback(() => {
    try {
      const videos = document.querySelectorAll<HTMLVideoElement>('video');
      videos.forEach((video) => {
        const stream = video.srcObject as MediaStream | null;
        if (stream && stream.getTracks) {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch (e) {}
          });
        }
        video.srcObject = null;
      });

      const container = document.getElementById(scannerContainerId);
      if (container) {
        const cVideos = container.getElementsByTagName('video');
        for (let i = 0; i < cVideos.length; i++) {
          const v = cVideos[i];
          const st = v.srcObject as MediaStream | null;
          if (st && st.getTracks) {
            st.getTracks().forEach((tr) => {
              try {
                tr.stop();
              } catch (e) {}
            });
          }
          v.srcObject = null;
        }
      }
    } catch (err) {}
  }, []);

  // Formats to support based on scannerType
  const formatsToSupport = React.useMemo(() => {
    if (scannerType === 'qrcode') {
      return [Html5QrcodeSupportedFormats.QR_CODE];
    }
    if (scannerType === 'barcode') {
      return [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.PDF_417,
        Html5QrcodeSupportedFormats.AZTEC,
        Html5QrcodeSupportedFormats.CODABAR,
      ];
    }
    // 'all': support all standard formats
    return [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.CODE_93,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.ITF,
      Html5QrcodeSupportedFormats.DATA_MATRIX,
      Html5QrcodeSupportedFormats.PDF_417,
      Html5QrcodeSupportedFormats.AZTEC,
      Html5QrcodeSupportedFormats.CODABAR,
    ];
  }, [scannerType]);

  // Handle Scan Success Callback
  const handleScanSuccess = useCallback(
    (text: string, format?: string) => {
      // Stop camera if running
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {}).then(() => {
          setIsCameraActive(false);
        });
      }

      setDecodedResult({
        text: text.trim(),
        format: format || (scannerType === 'qrcode' ? 'QR_CODE' : 'BARCODE'),
        timestamp: Date.now(),
      });
      toast.success('کد با موفقیت اسکن و شناسایی شد.');
    },
    [scannerType]
  );

  // Stop camera helper
  const stopCamera = useCallback(async () => {
    killAllMediaTracks();
    const scanner = html5QrCodeRef.current;
    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (err) {
        // Ignore error on stopping
      }
      try {
        await scanner.clear();
      } catch (err) {
        // Ignore error on clearing
      }
    }
    killAllMediaTracks();
    setIsCameraActive(false);
  }, [killAllMediaTracks]);

  // Start Camera
  const startCamera = useCallback(
    async (preferredFacingMode?: 'environment' | 'user') => {
      setCameraError(null);
      setIsStartingCamera(true);

      const targetFacing = preferredFacingMode || facingMode;

      try {
        // Stop any active instance first
        await stopCamera();

        // Initialize instance
        const html5QrCode = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: formatsToSupport,
          verbose: false,
        });
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.max(180, Math.floor(minEdge * 0.72));
            return { width: edgeSize, height: edgeSize };
          },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: targetFacing },
          config,
          (decodedText, result) => {
            const formatName = result?.result?.format?.formatName;
            handleScanSuccess(decodedText, formatName);
          },
          () => {
            // Frame error - ignore
          }
        );

        // Check if component unmounted while camera start was in flight
        if (!isMountedRef.current || scanMode !== 'camera') {
          try {
            if (html5QrCode.isScanning) {
              await html5QrCode.stop();
            }
          } catch (e) {}
          try {
            await html5QrCode.clear();
          } catch (e) {}
          killAllMediaTracks();
          setIsCameraActive(false);
          return;
        }

        setIsCameraActive(true);
      } catch (err: any) {
        console.error('Camera start error:', err);
        let msg = 'امکان دسترسی به دوربین وجود ندارد. لطفاً دسترسی دوربین را در مرورگر مجاز کنید.';
        if (err?.name === 'NotAllowedError') {
          msg = 'دسترسی به دوربین توسط کاربر یا مرورگر مسدود شده است.';
        } else if (err?.name === 'NotFoundError') {
          msg = 'هیچ دوربینی بر روی دستگاه شما پیدا نشد.';
        }
        setCameraError(msg);
        setIsCameraActive(false);
      } finally {
        setIsStartingCamera(false);
      }
    },
    [facingMode, formatsToSupport, handleScanSuccess, stopCamera, killAllMediaTracks, scanMode]
  );

  // Toggle Camera Front / Back
  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      await startCamera(nextFacing);
    }
  };

  // Scan Image File Handler
  const handleFileScan = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setFileError('لطفاً یک فایل تصویری معتبر انتخاب کنید.');
      return;
    }

    setFileError(null);
    setIsScanningFile(true);

    // Create thumbnail
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);

    try {
      // Use hidden or temporary reader for file scanning
      const tempId = 'temp-html5-file-scanner';
      let tempEl = document.getElementById(tempId);
      if (!tempEl) {
        tempEl = document.createElement('div');
        tempEl.id = tempId;
        tempEl.style.display = 'none';
        document.body.appendChild(tempEl);
      }

      const fileScanner = new Html5Qrcode(tempId, {
        formatsToSupport: formatsToSupport,
        verbose: false,
      });

      const decodedText = await fileScanner.scanFile(file, true);
      await fileScanner.clear();

      if (decodedText) {
        handleScanSuccess(decodedText);
      } else {
        setFileError('بارکد یا کیوآر کدی در این تصویر شناسایی نشد.');
      }
    } catch (err: any) {
      console.warn('File decode failed:', err);
      setFileError('کدی در این تصویر یافت نشد. لطفاً تصویری با وضوح بالاتر و نور مناسب امتحان کنید.');
    } finally {
      setIsScanningFile(false);
    }
  };

  // Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileScan(e.dataTransfer.files[0]);
    }
  };

  // Copy Scanned Content
  const handleCopyContent = () => {
    if (!decodedResult?.text) return;
    navigator.clipboard.writeText(decodedResult.text);
    setIsCopied(true);
    toast.success('محتوای کد در کلیپ‌بورد کپی شد.');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Recreate & Transfer
  const handleRecreate = () => {
    if (!decodedResult?.text) return;
    onRecreate(decodedResult.text, decodedResult.format);
  };

  // Reset Scanner
  const handleResetScan = () => {
    setDecodedResult(null);
    setFilePreview(null);
    setFileError(null);
    setCameraError(null);
    if (scanMode === 'camera') {
      startCamera();
    }
  };

  // Auto-start camera when entering camera tab if no result yet
  useEffect(() => {
    isMountedRef.current = true;
    if (scanMode === 'camera' && !decodedResult) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      isMountedRef.current = false;
      killAllMediaTracks();
      const scanner = html5QrCodeRef.current;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner
              .stop()
              .catch(() => {})
              .finally(() => {
                try {
                  scanner.clear();
                } catch (e) {}
                killAllMediaTracks();
              });
          } else {
            try {
              scanner.clear();
            } catch (e) {}
            killAllMediaTracks();
          }
        } catch (err) {}
      }
      setIsCameraActive(false);
    };
  }, [scanMode, decodedResult, startCamera, stopCamera, killAllMediaTracks]);

  // Guarantee complete camera teardown and stop video streams on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      killAllMediaTracks();
      const scanner = html5QrCodeRef.current;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner
              .stop()
              .catch(() => {})
              .finally(() => {
                try {
                  scanner.clear();
                } catch (e) {}
                killAllMediaTracks();
              });
          } else {
            try {
              scanner.clear();
            } catch (e) {}
            killAllMediaTracks();
          }
        } catch (err) {}
      }
      setIsCameraActive(false);
    };
  }, [killAllMediaTracks]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border/70 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            {scannerType === 'qrcode' ? (
              <QrCode className="w-5 h-5" />
            ) : (
              <Barcode className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {title || (scannerType === 'qrcode' ? 'اسکنر هوشمند کیوآر کد' : 'اسکنر جامع بارکد و QR')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {subtitle || 'شناسایی و بازخوانی سریع با دوربین دستگاه یا آپلود مستقیم عکس'}
            </p>
          </div>
        </div>

        {/* Scan Mode Segmented Control: Camera vs File */}
        <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setScanMode('camera');
              setDecodedResult(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              scanMode === 'camera'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>دوربین (Camera)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setScanMode('file');
              stopCamera();
              setDecodedResult(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              scanMode === 'file'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>آپلود عکس (Upload)</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Viewport / Dropzone */}
        <div className="lg:col-span-7 space-y-4">
          {scanMode === 'camera' ? (
            /* MODE 1: Camera Scanner */
            <div className="p-6 rounded-3xl bg-card border border-border/70 shadow-xl space-y-4 text-center">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>پخش زنده دوربین</span>
                </span>

                {/* Switch Camera Button (Front / Back) */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleCameraFacing}
                  disabled={!isCameraActive || isStartingCamera}
                  className="h-8 rounded-xl text-xs gap-1.5 border-border hover:bg-muted"
                  title="تغییر دوربین پشت / جلو"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {facingMode === 'environment' ? 'دوربین پشت' : 'دوربین سلفی'}
                  </span>
                </Button>
              </div>

              {/* Viewport Box */}
              <div className="relative aspect-square max-w-[320px] sm:max-w-[360px] mx-auto rounded-3xl overflow-hidden bg-slate-950 border-2 border-cyan-500/40 shadow-inner flex items-center justify-center">
                {/* Viewport for html5-qrcode */}
                <div
                  id={scannerContainerId}
                  className="w-full h-full overflow-hidden [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                />

                {/* Overlay Scanning Reticle */}
                {isCameraActive && !decodedResult && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-dashed border-cyan-400/70 rounded-2xl relative animate-pulse shadow-[0_0_25px_rgba(6,182,212,0.25)]">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -start-1 w-5 h-5 border-t-4 border-s-4 border-cyan-400 rounded-tl" />
                      <div className="absolute -top-1 -end-1 w-5 h-5 border-t-4 border-e-4 border-cyan-400 rounded-tr" />
                      <div className="absolute -bottom-1 -start-1 w-5 h-5 border-b-4 border-s-4 border-cyan-400 rounded-bl" />
                      <div className="absolute -bottom-1 -end-1 w-5 h-5 border-b-4 border-e-4 border-cyan-400 rounded-br" />

                      {/* Laser Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce shadow-md shadow-cyan-400" />
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isStartingCamera && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-cyan-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>در حال راه‌اندازی دوربین...</span>
                  </div>
                )}

                {/* Error State */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 p-5 flex flex-col items-center justify-center gap-3 text-center">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                    <p className="text-xs text-rose-400 leading-relaxed max-w-xs">
                      {cameraError}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => startCamera()}
                      className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold"
                    >
                      تلاش مجدد
                    </Button>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {isCameraActive ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopCamera}
                    className="h-9 rounded-xl text-xs border-border hover:bg-muted text-muted-foreground"
                  >
                    توقف دوربین
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => startCamera()}
                    disabled={isStartingCamera}
                    className="h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                  >
                    فعال‌سازی مجدد دوربین
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* MODE 2: File Upload Scanner */
            <div className="p-6 rounded-3xl bg-card border border-border/70 shadow-xl space-y-4">
              <span className="text-xs font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>انتخاب یا رها کردن عکس بارکد / QR</span>
              </span>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileScan(e.target.files[0]);
                  }
                }}
              />

              {/* Dropzone Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`min-h-[260px] rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center gap-3 ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-border/80 hover:border-cyan-500/50 hover:bg-muted/30 bg-muted/20'
                }`}
              >
                {filePreview ? (
                  <div className="relative group max-w-[200px] max-h-[200px] rounded-2xl overflow-hidden border border-border">
                    <img
                      src={filePreview}
                      alt="Uploaded code"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition-opacity">
                      تغییر عکس
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">
                        عکس حاوی کد را اینجا بکشید یا کلیک کنید
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        پشتیبانی از تمام فرمت‌های JPG, PNG, WEBP و اسکرین‌شات
                      </p>
                    </div>
                  </>
                )}

                {isScanningFile && (
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium pt-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال پردازش و استخراج محتوا...</span>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {fileError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Decoded Result & Actions (Stage 4) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-card border border-border/70 shadow-xl space-y-5 text-start">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>نتیجه بازخوانی (Decoded Result)</span>
              </span>
              {decodedResult && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                  {decodedResult.format || 'SUCCESS'}
                </span>
              )}
            </div>

            {decodedResult ? (
              /* Success Result Display */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-500 block">
                    محتوای استخراج شده:
                  </span>
                  <div
                    dir="ltr"
                    style={{ textAlign: 'left' }}
                    className="p-3 rounded-xl bg-background border border-border font-mono text-xs text-foreground font-semibold break-all select-all max-h-48 overflow-y-auto leading-relaxed"
                  >
                    {decodedResult.text}
                  </div>
                </div>

                {/* Detect Web URL */}
                {decodedResult.text.startsWith('http://') ||
                decodedResult.text.startsWith('https://') ? (
                  <a
                    href={decodedResult.text}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>باز کردن این لینک در تب جدید</span>
                  </a>
                ) : null}

                {/* Primary Action Buttons (Stage 4) */}
                <div className="space-y-2.5 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Button 1: Copy Content */}
                    <Button
                      type="button"
                      onClick={handleCopyContent}
                      className="h-11 rounded-2xl bg-muted hover:bg-muted/80 text-foreground border border-border font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-cyan-400" />
                      )}
                      <span>{isCopied ? 'کپی شد!' : 'کپی محتوا'}</span>
                    </Button>

                    {/* Button 2: Recreate & Transfer */}
                    <Button
                      type="button"
                      onClick={handleRecreate}
                      className="h-11 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>ویرایش و بازآفرینی</span>
                    </Button>
                  </div>

                  {/* Button 3: Scan Again */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetScan}
                    className="w-full h-10 rounded-2xl text-xs font-semibold border-border hover:bg-muted text-muted-foreground flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>اسکن مجدد کد دیگر</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Awaiting Scan State */
              <div className="p-8 rounded-2xl bg-muted/20 border border-border/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    در انتظار اسکن کد...
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    دوربین را روبروی بارکد یا QR بگیرید یا عکس آن را در بخش آپلود قرار دهید تا محتوا بلافاصله اینجا استخراج شود.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

