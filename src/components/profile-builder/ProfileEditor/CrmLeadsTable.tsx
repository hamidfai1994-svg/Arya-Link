'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import { toast } from 'sonner';

export interface LeadItem {
  id: string;
  name: string;
  phone: string;
  message: string;
  email?: string;
  status: 'new' | 'contacted' | 'archived';
  dateStr: string;
}

const INITIAL_MOCK_LEADS: LeadItem[] = [
  {
    id: 'lead-1',
    name: 'احمد رفیق کاکر',
    phone: '0789123456',
    email: 'ahmad.rafiq@gmail.com',
    message: 'سلام و احترام. در رابطه با خدمات مشاوره و سفارش 50 عدد کارت هوشمند برای شرکت‌مان می‌خواستم شرایط و پیش‌فاکتور را دریافت کنم.',
    status: 'new',
    dateStr: 'امروز - 10:45',
  },
  {
    id: 'lead-2',
    name: 'مریم حسینی',
    phone: '0774567890',
    email: 'm.hossaini@outlook.com',
    message: 'با سلام، من در همایش کارآفرینی کابل با کارت شما آشنا شدم. مایل به همکاری در بخش دیجیتال مارکتینگ و فروش هستم.',
    status: 'new',
    dateStr: 'امروز - 08:20',
  },
  {
    id: 'lead-3',
    name: 'شرکت خدمات تجارتی کابل نوین',
    phone: '0701239874',
    email: 'info@kabul-novin.af',
    message: 'جهت هماهنگی جلسه حضوری در دفتر کابل برای عقد قرارداد رسمی تامین تجهیزات لطفاً تماس بگیرید.',
    status: 'contacted',
    dateStr: 'دیروز - 16:30',
  },
  {
    id: 'lead-4',
    name: 'فرهاد نوری',
    phone: '0799887766',
    email: 'farhad.nouri@yahoo.com',
    message: 'سلام روزتان بخیر، تعرفه طراحی کارت هوشمند با متریال چوب گردو و حک لوگو به صورت عمده چقدر است؟',
    status: 'contacted',
    dateStr: '3 روز قبل',
  },
];

interface CrmLeadsTableProps {
  profileAlias?: string;
}

export const CrmLeadsTable: React.FC<CrmLeadsTableProps> = ({ profileAlias }) => {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_MOCK_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<LeadItem | null>(null);

  // Quick stats
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const contactedLeads = leads.filter((l) => l.status === 'contacted').length;

  // Load real leads from database on mount or profile change
  React.useEffect(() => {
    async function loadLeads() {
      try {
        const url = profileAlias ? `/api/lead?profileAlias=${profileAlias}` : '/api/lead';
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setLeads(json.data);
        }
      } catch (err) {
        console.error('Failed to load leads from database:', err);
      }
    }
    loadLeads();
  }, [profileAlias]);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success('شماره تماس در کلیپ‌بورد کپی شد', { description: phone });
  };

  const handleToggleStatus = async (id: string) => {
    const target = leads.find((l) => l.id === id);
    const nextStatus = target?.status === 'new' ? 'contacted' : 'new';
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: nextStatus } : l))
    );
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
    setLeads((prev) => prev.filter((l) => l.id !== id));
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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">پیام‌های دریافتی</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                پیام‌ها و اطلاعات تماسی که مخاطبان از طریق فرم تماس برای شما ارسال کرده‌اند.
              </p>
            </div>
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-border/80">
          <div className="p-3 rounded-xl bg-card border border-border flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">کل پیام‌ها</span>
            <div className="text-lg font-bold text-foreground font-outfit mt-1 flex items-center justify-between">
              <span>{totalLeads}</span>
              <Inbox className="w-4 h-4 text-muted-foreground/60" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
              <span>پیام‌های جدید</span>
              {newLeads > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>}
            </span>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-outfit mt-1 flex items-center justify-between">
              <span>{newLeads}</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">پاسخ داده شده</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-outfit mt-1 flex items-center justify-between">
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
            {filteredLeads.length === 0 ? (
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
                  <TableCell className="py-2.5 px-3 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                        {lead.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate max-w-[110px] sm:max-w-none">
                          {lead.name}
                        </div>
                        {lead.email && (
                          <div className="text-[10px] text-muted-foreground font-outfit truncate max-w-[110px] sm:max-w-none" dir="ltr">
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Phone Number */}
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5" dir="ltr">
                      <span className="text-xs font-outfit font-semibold text-foreground">{lead.phone}</span>
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
                      onClick={() => setSelectedMessage(lead)}
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
                  <span className="text-[11px] text-muted-foreground font-outfit" dir="ltr">{selectedMessage.phone}</span>
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
    </div>
  );
};
