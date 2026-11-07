'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Search,
  Download,
  Phone,
  Clock,
  CheckCircle2,
  Copy,
  Trash2,
  ExternalLink,
  Mail,
  UserCheck,
  Sparkles,
  Inbox,
  Filter,
  Loader2,
  Scan,
  Upload,
  Link as LinkIcon,
  Clipboard,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import { toast } from 'sonner';
import { useEditorStore } from '@/store/editor-store';
import { CardOcrScannerModal, ScannedContactData } from '@/components/common/CardOcrScannerModal';

export interface LeadItem {
  id: string;
  name: string;
  phone: string;
  message: string;
  email?: string;
  status: 'new' | 'contacted' | 'archived';
  dateStr: string;
}

interface CrmLeadsTableProps {
  profileAlias?: string;
}

export const CrmLeadsTable: React.FC<CrmLeadsTableProps> = ({ profileAlias }) => {
  const { unreadLeadsCount, setUnreadLeadsCount } = useEditorStore();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<LeadItem | null>(null);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrInitialMode, setOcrInitialMode] = useState<'upload' | 'url' | 'clipboard' | 'camera'>('upload');
  const [pastedImageSrc, setPastedImageSrc] = useState<string | null>(null);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUploadDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Step 3: Global Paste Support (Ctrl+V / Cmd+V anywhere on the contacts page)
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              if (base64) {
                setPastedImageSrc(base64);
                setOcrInitialMode('upload');
                setIsOcrOpen(true);
                toast.success('تصویر از کلیپ‌بورد دریافت شد و اسکن هوشمند با Gemini آغاز گردید!');
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPastedImageSrc(base64);
        setOcrInitialMode('upload');
        setIsOcrOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOcrComplete = async (scanned: ScannedContactData) => {
    try {
      const fullNote = [
        scanned.company ? `شرکت: ${scanned.company}` : '',
        scanned.job_title ? `سمت: ${scanned.job_title}` : '',
        scanned.notes || 'مخاطب اسکن شده از کارت ویزیت کاغذی با هوش مصنوعی',
      ]
        .filter(Boolean)
        .join(' - ');

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scanned.name || 'مخاطب کارت ویزیت',
          phone: scanned.phone || '0000',
          email: scanned.email,
          message: fullNote,
          profileAlias: profileAlias,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLeads((prev) => [data.data, ...prev]);
        toast.success(`مخاطب «${data.data.name}» با موفقیت ثبت شد!`);
      } else {
        toast.error(data.message || 'خطا در ذخیره مخاطب.');
      }
    } catch (err) {
      toast.error('خطا در برقراری ارتباط با سرور.');
    }
  };

  // Quick stats
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const contactedLeads = leads.filter((l) => l.status === 'contacted').length;

  // Load real leads from database on mount or profile change
  React.useEffect(() => {
    async function loadLeads() {
      setIsLoading(true);
      try {
        const url = profileAlias ? `/api/lead?profileAlias=${encodeURIComponent(profileAlias)}` : '/api/lead';
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLeads(json.data);
          const unread = json.data.filter((l: LeadItem) => l.status === 'new').length;
          setUnreadLeadsCount(unread);
        } else {
          setLeads([]);
          setUnreadLeadsCount(0);
        }
      } catch (err) {
        console.error('Failed to load leads from database:', err);
        setLeads([]);
        setUnreadLeadsCount(0);
      } finally {
        setIsLoading(false);
      }
    }
    loadLeads();
  }, [profileAlias, setUnreadLeadsCount]);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success('شماره تماس در کلیپ‌بورد کپی شد', { description: phone });
  };

  const handleOpenMessage = async (lead: LeadItem) => {
    setSelectedMessage(lead);
    if (lead.status === 'new') {
      const updated = leads.map((l) => (l.id === lead.id ? { ...l, status: 'contacted' as const } : l));
      setLeads(updated);
      const unread = updated.filter((l) => l.status === 'new').length;
      setUnreadLeadsCount(unread);
      try {
        await fetch('/api/lead', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lead.id, status: 'contacted' }),
        });
      } catch (e) {
        console.error('Error updating status on server:', e);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = leads.find((l) => l.id === id);
    const nextStatus: LeadItem['status'] = target?.status === 'new' ? 'contacted' : 'new';
    const updated: LeadItem[] = leads.map((l) => (l.id === id ? { ...l, status: nextStatus } : l));
    setLeads(updated);
    const unread = updated.filter((l) => l.status === 'new').length;
    setUnreadLeadsCount(unread);
    toast.success(
      nextStatus === 'contacted' ? 'پیام به وضعیت «پاسخ داده شده» تغییر یافت' : 'پیام به وضعیت «جدید» تغییر یافت'
    );
    try {
      await fetch('/api/lead', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
    } catch (e) {
      console.error('Error updating status on server:', e);
    }
  };

  const handleDeleteLead = async (id: string) => {
    const updated = leads.filter((l) => l.id !== id);
    setLeads(updated);
    const unread = updated.filter((l) => l.status === 'new').length;
    setUnreadLeadsCount(unread);
    toast.success('پیام با موفقیت حذف شد');
    try {
      await fetch(`/api/lead?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Error deleting lead on server:', e);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      'نام,شماره تماس,ایمیل,پیام,وضعیت,تاریخ\n' +
      leads
        .map(
          (l) =>
            `"${l.name}","${l.phone}","${l.email || ''}","${l.message.replace(/"/g, '""')}","${l.status}","${l.dateStr}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads-${profileAlias || 'aryalink'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('فایل اکسل پیام‌ها با موفقیت ذخیره شد');
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200" dir="rtl">
      {/* Header & Subtitle */}
      <div className="bg-muted/30 border border-border rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">مدیریت مخاطبین و لیدها (Contacts &amp; CRM)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                مخاطبین اسکن‌شده از کارت ویزیت و پیام‌هایی که کاربران از طریق فرم تماس ارسال کرده‌اند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Advanced OCR Upload Dropdown (Step 2) */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-slate-900 text-cyan-300 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setPastedImageSrc(null);
                    setOcrInitialMode('upload');
                    setIsOcrOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  title="اسکن هوشمند کارت ویزیت (کلید میانبر Ctrl+V)"
                >
                  <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>اسکن کارت ویزیت</span>
                  <span className="text-[10px] font-sans font-bold bg-slate-900/80 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                    Ctrl+V
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadDropdownOpen(!isUploadDropdownOpen)}
                  className="px-2 py-2 border-r border-cyan-500/30 hover:bg-cyan-500/25 transition-all text-cyan-300 cursor-pointer"
                  title="روش‌های مختلف آپلود عکس"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isUploadDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Advanced Dropdown Menu */}
              {isUploadDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 text-right">
                  {/* Option 1: Upload from device */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadDropdownOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full text-right p-2.5 rounded-xl hover:bg-cyan-500/10 text-xs text-slate-200 hover:text-cyan-300 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-semibold block">۱. آپلود از دستگاه</span>
                      <span className="text-[10px] text-slate-400 block font-normal">انتخاب تصویر از گالری/کامپیوتر</span>
                    </div>
                  </button>

                  {/* Option 2: Paste Image URL */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadDropdownOpen(false);
                      setPastedImageSrc(null);
                      setOcrInitialMode('url');
                      setIsOcrOpen(true);
                    }}
                    className="w-full text-right p-2.5 rounded-xl hover:bg-purple-500/10 text-xs text-slate-200 hover:text-purple-300 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="font-semibold block">۲. جایگذاری لینک عکس</span>
                      <span className="text-[10px] text-slate-400 block font-normal">ورود URL اینترنتی تصویر</span>
                    </div>
                  </button>

                  {/* Option 3: Read from Clipboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadDropdownOpen(false);
                      setPastedImageSrc(null);
                      setOcrInitialMode('clipboard');
                      setIsOcrOpen(true);
                    }}
                    className="w-full text-right p-2.5 rounded-xl hover:bg-emerald-500/10 text-xs text-slate-200 hover:text-emerald-300 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <Clipboard className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-semibold block">۳. خواندن از کلیپ‌بورد</span>
                      <span className="text-[10px] text-slate-400 block font-normal">استخراج مستقیم تصویر کپی‌شده</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Hidden file input for Option 1 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-cyan-500" />
              <span>دانلود فایل اکسل</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-border/80">
          <div className="p-3 rounded-xl bg-card border border-border flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">کل پیام‌ها</span>
            <div className="text-lg font-bold text-foreground font-sans mt-1 flex items-center justify-between">
              <span>{totalLeads}</span>
              <Inbox className="w-4 h-4 text-muted-foreground/60" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
              <span>پیام‌های جدید</span>
              {newLeads > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>}
            </span>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-sans mt-1 flex items-center justify-between">
              <span>{newLeads}</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">پاسخ داده شده</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-sans mt-1 flex items-center justify-between">
              <span>{contactedLeads}</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام، شماره تماس یا متن پیام..."
            className="w-full bg-card border border-border rounded-xl pr-9 pl-3 py-2 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border rounded-xl shrink-0 text-xs">
          {[
            { id: 'all' as const, label: 'همه' },
            { id: 'new' as const, label: 'جدید' },
            { id: 'contacted' as const, label: 'پاسخ داده شده' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${statusFilter === tab.id
                  ? 'bg-card text-foreground shadow-sm font-bold border border-border'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Shadcn UI Table Container */}
      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm w-full">
        <Table className="w-full">
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-right text-xs font-bold text-foreground py-2.5 px-3">فرستنده</TableHead>
              <TableHead className="text-right text-xs font-bold text-foreground py-2.5 px-3">شماره تماس</TableHead>
              <TableHead className="text-right text-xs font-bold text-foreground py-2.5 px-3 hidden lg:table-cell">متن پیام</TableHead>
              <TableHead className="text-right text-xs font-bold text-foreground py-2.5 px-3">وضعیت</TableHead>
              <TableHead className="text-right text-xs font-bold text-foreground py-2.5 px-3 hidden sm:table-cell">تاریخ</TableHead>
              <TableHead className="text-center text-xs font-bold text-foreground py-2.5 px-3">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                    <span className="text-xs">در حال بارگذاری پیام‌ها...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 text-muted-foreground/40 stroke-1" />
                    <span className="text-xs">هیچ پیامی با این مشخصات یافت نشد.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="border-border hover:bg-muted/30 transition-colors">
                  {/* Sender Name */}
                  <TableCell
                    className="py-2.5 px-3 font-medium cursor-pointer"
                    onClick={() => handleOpenMessage(lead)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                        {lead.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate max-w-[110px] sm:max-w-none">
                          {lead.name}
                        </div>
                        {lead.email && (
                          <div className="text-[10px] text-muted-foreground font-sans truncate max-w-[110px] sm:max-w-none" dir="ltr">
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Phone Number */}
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5" dir="ltr">
                      <span className="text-xs font-sans font-semibold text-foreground">{lead.phone}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(lead.phone)}
                        className="text-muted-foreground hover:text-cyan-500 transition-colors p-1"
                        title="کپی شماره"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </TableCell>

                  {/* Message Preview */}
                  <TableCell className="py-2.5 px-3 hidden lg:table-cell max-w-[200px]">
                    <p
                      onClick={() => handleOpenMessage(lead)}
                      className="text-xs text-muted-foreground line-clamp-2 leading-relaxed cursor-pointer hover:text-foreground transition-colors whitespace-normal break-words"
                      title="کلیک برای مشاهده متن کامل پیام"
                    >
                      {lead.message}
                    </p>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(lead.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${lead.status === 'new'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                        }`}
                      title="کلیک برای تغییر وضعیت پیام"
                    >
                      {lead.status === 'new' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>جدید</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>پاسخ داده</span>
                        </>
                      )}
                    </button>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-2.5 px-3 text-[11px] text-muted-foreground font-sans hidden sm:table-cell whitespace-nowrap">
                    {lead.dateStr}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* WhatsApp Call / Chat Link */}
                      <a
                        href={`https://wa.me/93${lead.phone.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg border border-border bg-card hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground flex items-center justify-center transition-colors shadow-xs"
                        title="ارسال پیام در واتساپ"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                      </a>

                      {/* Phone Call Link */}
                      <a
                        href={`tel:${lead.phone}`}
                        className="w-7 h-7 rounded-lg border border-border bg-card hover:bg-cyan-500/10 hover:text-cyan-500 text-muted-foreground flex items-center justify-center transition-colors shadow-xs"
                        title="تماس"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteLead(lead.id)}
                        className="w-7 h-7 rounded-lg border border-border bg-card hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground flex items-center justify-center transition-colors shadow-xs"
                        title="حذف پیام"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Message Modal Preview */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                  {selectedMessage.name.slice(0, 1)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{selectedMessage.name}</h4>
                  <span className="text-[11px] text-muted-foreground font-sans" dir="ltr">{selectedMessage.phone}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{selectedMessage.dateStr}</span>
            </div>

            <div className="bg-muted/40 p-4 rounded-2xl border border-border/80 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {selectedMessage.message}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/93${selectedMessage.phone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  <span>پاسخ در واتساپ</span>
                </a>
                <a
                  href={`tel:${selectedMessage.phone}`}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-500" />
                  <span>تماس</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-1.5 rounded-xl bg-muted text-foreground hover:bg-muted/80 text-xs font-semibold transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card OCR Scanner Modal (Gemini Vision with Advanced Upload & Global Paste) */}
      <CardOcrScannerModal
        isOpen={isOcrOpen}
        onClose={() => {
          setIsOcrOpen(false);
          setPastedImageSrc(null);
        }}
        onScanComplete={handleOcrComplete}
        initialImageSrc={pastedImageSrc}
        initialMode={ocrInitialMode}
      />
    </div>
  );
};
