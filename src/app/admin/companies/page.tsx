'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Globe,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Plus,
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
import { toast } from 'sonner';

interface CompanyAccount {
  id: string;
  name: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  plan: 'enterprise';
  seatCount: number;
  nfcCardsIssued: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

const mockCompanies: CompanyAccount[] = [
  {
    id: 'comp_1',
    name: 'بانک بین‌المللی افغانستان (AIB)',
    domain: 'aib.af',
    adminName: 'احمد ضیا مسعود',
    adminEmail: 'it.admin@aib.af',
    plan: 'enterprise',
    seatCount: 150,
    nfcCardsIssued: 140,
    status: 'active',
    createdAt: '2025-01-10',
  },
  {
    id: 'comp_2',
    name: 'شرکت مخابراتی افغان بیسیم (AWCC)',
    domain: 'afghan-wireless.com',
    adminName: 'فرید احمدی',
    adminEmail: 'farid@afghan-wireless.com',
    plan: 'enterprise',
    seatCount: 85,
    nfcCardsIssued: 80,
    status: 'active',
    createdAt: '2025-02-15',
  },
  {
    id: 'comp_3',
    name: 'صرافی و خدمات پولی کابل اکسچنج',
    domain: 'kabul-exchange.af',
    adminName: 'حامد رحیمی',
    adminEmail: 'ceo@kabul-exchange.af',
    plan: 'enterprise',
    seatCount: 20,
    nfcCardsIssued: 18,
    status: 'active',
    createdAt: '2025-03-01',
  },
  {
    id: 'comp_4',
    name: 'موسسه تحصیلات عالی کاردان',
    domain: 'kardan.edu.af',
    adminName: 'مریم سلطانی',
    adminEmail: 'pr@kardan.edu.af',
    plan: 'enterprise',
    seatCount: 45,
    nfcCardsIssued: 40,
    status: 'active',
    createdAt: '2025-03-20',
  },
];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyAccount[]>(mockCompanies);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filtered = companies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.adminEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              مدیریت حساب‌های شرکتی (Corporate Accounts)
            </h1>
            <Badge variant="purple" className="font-sans text-xs">
              Enterprise Teams
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            نظارت بر شرکت‌ها، بانک‌ها و سازمان‌های دارنده اشتراک سازمانی، دامنه اختصاصی و کارت‌های NFC پرسنلی
          </p>
        </div>

        <Button
          onClick={() => toast.info('افزودن شرکت جدید از طریق بخش قراردادهای سازمانی و ترفیع پلن انجام می‌شود.')}
          size="sm"
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>قرارداد سازمانی جدید</span>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            type="text"
            placeholder="جستجوی نام شرکت یا دامنه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <span className="text-xs text-muted-foreground font-sans">
          {companies.length} شرکت سازمانی فعال
        </span>
      </div>

      {/* Table */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right font-bold text-xs">نام سازمان / شرکت</TableHead>
                <TableHead className="text-right font-bold text-xs">دامنه شرکتی</TableHead>
                <TableHead className="text-right font-bold text-xs">مدیر حساب</TableHead>
                <TableHead className="text-right font-bold text-xs">تعداد کارمندان (Seats)</TableHead>
                <TableHead className="text-right font-bold text-xs">کارت‌های NFC صادرشده</TableHead>
                <TableHead className="text-right font-bold text-xs">وضعیت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((comp) => (
                <TableRow key={comp.id} className="border-border hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-500/20">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{comp.name}</div>
                        <Badge variant="purple" className="text-[9px] py-0 px-1.5 mt-0.5">
                          Enterprise
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-sans text-xs text-cyan-500 font-bold" dir="ltr">
                    {comp.domain}
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-bold text-foreground">{comp.adminName}</div>
                    <div className="text-[11px] text-muted-foreground font-sans" dir="ltr">
                      {comp.adminEmail}
                    </div>
                  </TableCell>

                  <TableCell className="font-sans text-xs font-bold text-foreground">
                    {comp.seatCount} نفر
                  </TableCell>

                  <TableCell className="font-sans text-xs font-bold text-emerald-500">
                    {comp.nfcCardsIssued} کارت
                  </TableCell>

                  <TableCell>
                    <Badge variant="success" className="text-[10px] py-0 px-2 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>فعال</span>
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
