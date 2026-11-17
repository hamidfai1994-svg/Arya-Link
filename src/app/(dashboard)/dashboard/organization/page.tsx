'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  UserPlus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Palette,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Mail,
  Phone,
  Briefcase,
  Lock,
  AlertCircle,
  CheckCircle2,
  Crown,
  Link2,
  BadgeCheck,
  Image as ImageIcon,
  Eye,
  Edit3,
  Ban,
  Wand2,
  RotateCcw,
  BarChart3,
  MousePointerClick,
  Trophy,
  Download,
  Contact,
  MessageSquare,
  TrendingUp,
  CreditCard,
  Printer,
  MapPin,
  Upload,
  FileImage,
  PackageCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUploader } from '@/components/ui/file-uploader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getBaseUrl } from '@/lib/base-url';

interface OrgBranding {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  coverImage?: string;
  backgroundColor?: string;
  logoUrl?: string;
  companySlogan?: string;
  enforceBranding?: boolean;
}

interface OrganizationData {
  _id: string;
  name: string;
  ownerId: string;
  totalLicenses: number;
  usedLicenses: number;
  branding: OrgBranding;
  createdAt?: string;
}

interface OrgMemberProfile {
  _id: string;
  alias: string;
  displayName: string;
  headline: string;
  avatarUrl: string;
  isActive: boolean;
}

interface OrgMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  orgRole: 'owner' | 'member' | string;
  isActive: boolean;
  createdAt?: string;
  viewsCount?: number;
  clicksCount?: number;
  leadsCount?: number;
  profile: OrgMemberProfile | null;
}

interface OrgLeaderboardEntry {
  memberId: string;
  name: string;
  email: string;
  occupation: string;
  orgRole: string;
  isActive: boolean;
  alias: string;
  avatarUrl: string;
  viewsCount: number;
  clicksCount: number;
  leadsCount: number;
}

interface OrgAnalytics {
  totalTeamViews: number;
  totalTeamClicks: number;
  totalTeamLeads: number;
  ctr: number;
  leaderboard: OrgLeaderboardEntry[];
}

interface OrgLead {
  _id: string;
  profileId: string;
  organizationId: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  createdAt?: string;
  employee: {
    _id: string;
    name: string;
    email: string;
    occupation: string;
    alias: string;
  };
}

function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

function formatDariDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('fa-AF', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return '—';
  }
}

export default function OrganizationDashboardPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [orgRole, setOrgRole] = useState<string | null>(null);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [analytics, setAnalytics] = useState<OrgAnalytics>({
    totalTeamViews: 0,
    totalTeamClicks: 0,
    totalTeamLeads: 0,
    ctr: 0,
    leaderboard: [],
  });
  const [orgLeads, setOrgLeads] = useState<OrgLead[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'bulk_order' | 'analytics' | 'leads' | 'branding'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [leadsSearch, setLeadsSearch] = useState('');
  const [leadsEmployeeFilter, setLeadsEmployeeFilter] = useState('all');
  const [copiedAlias, setCopiedAlias] = useState<string | null>(null);

  // Bulk Physical NFC Card Ordering State
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [bulkCardMaterial, setBulkCardMaterial] = useState<string>('پی‌وی‌سی مات سازمانی (استاندارد)');
  const [bulkUnitPrice, setBulkUnitPrice] = useState<number>(1500);
  const [isBulkOrderModalOpen, setIsBulkOrderModalOpen] = useState(false);
  const [bulkProvince, setBulkProvince] = useState('کابل');
  const [bulkShippingAddress, setBulkShippingAddress] = useState('');
  const [bulkContactPhone, setBulkContactPhone] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkPaymentType, setBulkPaymentType] = useState<'prepayment' | 'cod'>('prepayment');
  const [bulkReceiptUrl, setBulkReceiptUrl] = useState('');
  const [bulkTransactionRef, setBulkTransactionRef] = useState('');
  const [isUploadingBulkReceipt, setIsUploadingBulkReceipt] = useState(false);
  const [isSubmittingBulkOrder, setIsSubmittingBulkOrder] = useState(false);
  const [lastCreatedBulkOrderNumber, setLastCreatedBulkOrderNumber] = useState<string | null>(null);
  const [storePaymentInfo, setStorePaymentInfo] = useState<{
    accountName: string;
    accountNumber: string;
    instructions?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolder?: string;
  }>({
    accountName: 'ARYALINK PLATFORM',
    accountNumber: '0729736813',
  });

  // Onboarding state (if organization is not initialized yet)
  const [setupCompanyName, setSetupCompanyName] = useState('');
  const [setupLicenses, setSetupLicenses] = useState(50);
  const [setupSlogan, setSetupSlogan] = useState('');
  const [isInitializingOrg, setIsInitializingOrg] = useState(false);

  // Add Employee Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empHeadline, setEmpHeadline] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // Edit Employee Modal state
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);

  // Corporate Branding state
  const [brandName, setBrandName] = useState('');
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#0ea5e9');
  const [brandSecondaryColor, setBrandSecondaryColor] = useState('#10b981');
  const [brandCoverImage, setBrandCoverImage] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [brandSlogan, setBrandSlogan] = useState('');
  const [brandEnforce, setBrandEnforce] = useState(true);
  const [applyToAllMembers, setApplyToAllMembers] = useState(true);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const fetchOrganizationData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/organization', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در بارگذاری اطلاعات سازمان.');
        setIsLoading(false);
        return;
      }

      setIsOwner(Boolean(data.isOwner));
      setOrgRole(data.orgRole || null);
      setOrganization(data.organization || null);
      setMembers(Array.isArray(data.members) ? data.members : []);
      setAnalytics(
        data.analytics || {
          totalTeamViews: 0,
          totalTeamClicks: 0,
          totalTeamLeads: 0,
          ctr: 0,
          leaderboard: [],
        }
      );
      setOrgLeads(Array.isArray(data.leads) ? data.leads : []);

      if (data.organization) {
        setBrandName(data.organization.name || '');
        setBrandPrimaryColor(data.organization.branding?.primaryColor || '#0ea5e9');
        setBrandSecondaryColor(
          data.organization.branding?.secondaryColor ||
            data.organization.branding?.accentColor ||
            '#10b981'
        );
        setBrandCoverImage(data.organization.branding?.coverImage || '');
        setBrandLogoUrl(data.organization.branding?.logoUrl || '');
        setBrandSlogan(data.organization.branding?.companySlogan || '');
        setBrandEnforce(data.organization.branding?.enforceBranding ?? true);
      }
    } catch {
      toast.error('ارتباط با سرور جهت دریافت اطلاعات سازمان برقرار نشد.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationData();

    fetch('/api/store/payment-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const s = data?.settings;
        if (!s) return;
        const hp = s.hesabPay;
        const hpWallet = Array.isArray(s.wallets)
          ? s.wallets.find((w: any) => w.id === 'hesabpay')
          : null;
        const primaryBank = Array.isArray(s.banks) ? s.banks.find((b: any) => b.isActive !== false) : null;
        setStorePaymentInfo({
          accountName: hp?.accountName || hpWallet?.accountName || 'ARYALINK PLATFORM',
          accountNumber: hp?.accountNumber || hpWallet?.accountNumber || '0729736813',
          instructions: hpWallet?.instructions || hp?.instructions || '',
          bankName: primaryBank?.bankName || '',
          bankAccountNumber: primaryBank?.accountNumber || '',
          bankAccountHolder: primaryBank?.accountHolder || '',
        });
      })
      .catch(() => {});
  }, []);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone || '').toLowerCase().includes(q) ||
        (m.occupation || '').toLowerCase().includes(q) ||
        (m.profile?.alias || '').toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const filteredLeads = useMemo(() => {
    const q = leadsSearch.trim().toLowerCase();
    return orgLeads.filter((lead) => {
      const empMatch =
        leadsEmployeeFilter === 'all' ||
        lead.employee?._id === leadsEmployeeFilter ||
        lead.employee?.name === leadsEmployeeFilter;
      if (!empMatch) return false;
      if (!q) return true;
      return (
        (lead.name || '').toLowerCase().includes(q) ||
        (lead.phone || '').toLowerCase().includes(q) ||
        (lead.email || '').toLowerCase().includes(q) ||
        (lead.message || '').toLowerCase().includes(q) ||
        (lead.employee?.name || '').toLowerCase().includes(q)
      );
    });
  }, [orgLeads, leadsSearch, leadsEmployeeFilter]);

  const handleExportCsv = () => {
    if (filteredLeads.length === 0) {
      toast.error('هیچ مخاطبی برای خروجی گرفتن یافت نشد.');
      return;
    }

    const escapeCsv = (value: unknown) => {
      const str = String(value ?? '')
        .replace(/\r?\n|\r/g, ' ')
        .trim();
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      'نام مشتری',
      'شماره تماس',
      'ایمیل',
      'جذب‌شده توسط کارمند',
      'سِمت کارمند',
      'لینک کارت کارمند',
      'پیام / جزئیات',
      'تاریخ ثبت',
    ];

    const rows = filteredLeads.map((lead) => [
      lead.name || '—',
      lead.phone || '—',
      lead.email || '—',
      lead.employee?.name || 'کارمند سازمان',
      lead.employee?.occupation || '—',
      lead.employee?.alias ? `/${lead.employee.alias}` : '—',
      lead.message || '—',
      formatDariDate(lead.createdAt),
    ]);

    const csvLines = [
      headers.map(escapeCsv).join(','),
      ...rows.map((r) => r.map(escapeCsv).join(',')),
    ];

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel renders Dari/Persian script cleanly
    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeOrgName = (organization?.name || 'organization')
      .replace(/[^\w\u0600-\u06FF-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'organization';
    link.href = url;
    link.setAttribute(
      'download',
      `${safeOrgName}-contacts-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('فایل اکسل (CSV) مخاطبین سازمان با موفقیت دانلود شد.');
  };

  const handleCopyLink = (alias: string) => {
    if (!alias) return;
    const origin = getBaseUrl();
    const fullUrl = `${origin}/${alias}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedAlias(alias);
    toast.success('لینک مینی‌سایت کارمند در حافظه کاپی شد.');
    setTimeout(() => setCopiedAlias(null), 2200);
  };

  const bulkTotalPrice = selectedEmployeeIds.length * bulkUnitPrice;
  const allEmployeesSelected =
    members.length > 0 && selectedEmployeeIds.length === members.length;

  const handleToggleEmployeeSelection = (empId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleToggleSelectAllEmployees = () => {
    if (allEmployeesSelected) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(members.map((m) => m._id));
    }
  };

  const handleOpenBulkOrderModal = () => {
    if (selectedEmployeeIds.length === 0) {
      toast.error('لطفاً حداقل یک کارمند را از لیست برای چاپ کارت انتخاب نمایید.');
      return;
    }
    const ownerMember = members.find((m) => m.orgRole === 'owner');
    if (!bulkContactPhone && ownerMember?.phone) {
      setBulkContactPhone(ownerMember.phone);
    }
    setIsBulkOrderModalOpen(true);
  };

  const handleBulkReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً صرفاً فایل تصویری (JPG یا PNG) برای فیش واریزی انتخاب کنید.');
      return;
    }
    if (file.size > 3.5 * 1024 * 1024) {
      toast.error('حجم تصویر فیش نباید بیشتر از ۳.۵ مگابایت باشد.');
      return;
    }

    setIsUploadingBulkReceipt(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/receipt/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.message || 'خطا در آپلود تصویر فیش واریزی.');
      }
      setBulkReceiptUrl(data.url);
      toast.success('تصویر فیش واریزی با موفقیت آپلود شد.');
    } catch (err: any) {
      toast.error(err.message || 'خطا در آپلود فیش واریزی.');
    } finally {
      setIsUploadingBulkReceipt(false);
    }
  };

  const handleSubmitBulkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployeeIds.length === 0) {
      toast.error('هیچ کارمندی برای چاپ انتخاب نشده است.');
      return;
    }
    if (!bulkShippingAddress.trim()) {
      toast.error('وارد کردن آدرس دقیق ارسال (لجستیک) الزامی است.');
      return;
    }
    if (!bulkContactPhone.trim()) {
      toast.error('وارد کردن شماره تماس هماهنگی جهت تحویل کارت‌ها الزامی است.');
      return;
    }
    if (bulkPaymentType === 'prepayment' && !bulkReceiptUrl) {
      toast.error('لطفاً تصویر فیش واریزی پیش‌پرداخت را آپلود کنید یا روش تسویه هنگام تحویل را برگزینید.');
      return;
    }

    const selectedSet = new Set(selectedEmployeeIds);
    const origin = getBaseUrl();
    const bulkItemsPayload = members
      .filter((m) => selectedSet.has(m._id))
      .map((m) => ({
        employeeId: m._id,
        name: m.name,
        occupation: m.occupation || m.profile?.headline || 'کارمند سازمان',
        email: m.email || '',
        alias: m.profile?.alias || '',
        profileUrl: m.profile?.alias ? `${origin}/${m.profile.alias}` : '',
        companyName: organization?.name || '',
      }));

    const fullShippingAddress = `${bulkProvince} - ${bulkShippingAddress.trim()}`;

    setIsSubmittingBulkOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: 'bulk_nfc_cards',
          subscriptionPlanType: 'corporate',
          organizationId: organization?._id,
          companyName: organization?.name || '',
          employeeIds: selectedEmployeeIds,
          bulkItems: bulkItemsPayload,
          productTitle: `سفارش گروهی کارت فیزیکی NFC (${organization?.name || 'سازمان'} - ${selectedEmployeeIds.length} عدد)`,
          quantity: selectedEmployeeIds.length,
          unitPrice: bulkUnitPrice,
          totalPrice: bulkTotalPrice,
          currency: 'AFN',
          customerPhone: bulkContactPhone.trim(),
          shippingAddress: fullShippingAddress,
          paymentMethod: bulkPaymentType === 'cod' ? 'cod' : 'wallet',
          paymentGateway: bulkPaymentType === 'cod' ? 'cod' : 'hesabpay',
          paymentMode: 'manual',
          paymentStatus: 'pending',
          orderStatus: bulkPaymentType === 'cod' ? 'processing' : 'pending_payment',
          trackingNumber: bulkTransactionRef.trim(),
          paymentProviderDetails:
            bulkPaymentType === 'prepayment'
              ? {
                  providerType: 'wallet',
                  walletService: 'حساب‌پی / فیش آفلاین',
                  walletAccount: storePaymentInfo.accountNumber,
                  receiptUrl: bulkReceiptUrl,
                  transactionRef: bulkTransactionRef.trim(),
                }
              : {
                  providerType: 'cod',
                  codTerms: 'پرداخت نقدی هنگام تحویل محموله به شرکت',
                },
          cardSpecs: {
            material: bulkCardMaterial,
            templateName: 'چاپ گروهی کارت سازمانی (B2B)',
            companyName: organization?.name || '',
          },
          notes: `ولایت: ${bulkProvince} | آدرس ارسال: ${bulkShippingAddress.trim()} | تماس هماهنگی: ${bulkContactPhone.trim()}${
            bulkNotes.trim() ? ` | توضیحات: ${bulkNotes.trim()}` : ''
          }`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'خطا در ثبت سفارش گروهی کارت فیزیکی.');
        return;
      }

      const ordNum = data.order?.orderNumber || '';
      setLastCreatedBulkOrderNumber(ordNum);
      toast.success(
        `سفارش گروهی چاپ ${toPersianDigits(selectedEmployeeIds.length)} کارت با شماره ${ordNum} با موفقیت ثبت شد!`
      );
      setIsBulkOrderModalOpen(false);
      setSelectedEmployeeIds([]);
      setBulkReceiptUrl('');
      setBulkTransactionRef('');
      setBulkNotes('');
    } catch {
      toast.error('ارتباط با سرور جهت ثبت سفارش گروهی برقرار نشد.');
    } finally {
      setIsSubmittingBulkOrder(false);
    }
  };

  const handleInitializeOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupCompanyName.trim()) {
      toast.error('لطفاً نام شرکت یا سازمان را وارد نمایید.');
      return;
    }

    setIsInitializingOrg(true);
    try {
      const res = await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: setupCompanyName.trim(),
          totalLicenses: Number(setupLicenses) || 50,
          branding: {
            companySlogan: setupSlogan.trim(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در راه‌اندازی پنل سازمانی.');
        return;
      }
      toast.success('پنل سازمانی (B2B) با موفقیت فعال شد.');
      await fetchOrganizationData();
      router.refresh();
    } catch {
      toast.error('خطای شبکه در راه‌اندازی سازمان.');
    } finally {
      setIsInitializingOrg(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const symbols = '@#$!';
    let pass = 'Arya';
    pass += symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 0; i < 6; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    pass += Math.floor(10 + Math.random() * 89);
    setEmpPassword(pass);
    setCopiedPassword(false);
  };

  const handleCopyPassword = () => {
    if (!empPassword.trim()) return;
    navigator.clipboard.writeText(empPassword);
    setCopiedPassword(true);
    toast.success('رمز عبور اولیه در حافظه کاپی شد.');
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      toast.error('وارد کردن نام و تخلص کارمند الزامی است.');
      return;
    }
    if (!empEmail.trim()) {
      toast.error('لطفاً ایمیل کارمند را برای ورود به سیستم وارد کنید.');
      return;
    }

    setIsSubmittingMember(true);
    try {
      const res = await fetch('/api/organization/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: empName.trim(),
          email: empEmail.trim(),
          phone: empPhone.trim(),
          headline: empHeadline.trim(),
          password: empPassword.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'خطا در ثبت کارمند جدید.');
        return;
      }

      toast.success(data.message || 'کارمند جدید و پروفایل مینی‌سایت وی با موفقیت ساخته شد.');
      if (data.member) {
        setMembers((prev) => {
          const exists = prev.some((m) => m._id === data.member._id);
          return exists
            ? prev.map((m) => (m._id === data.member._id ? data.member : m))
            : [data.member, ...prev];
        });
      }
      if (organization) {
        setOrganization({
          ...organization,
          usedLicenses:
            typeof data.usedLicenses === 'number'
              ? data.usedLicenses
              : organization.usedLicenses + 1,
        });
      }

      setEmpName('');
      setEmpEmail('');
      setEmpPhone('');
      setEmpHeadline('');
      setEmpPassword('');
      setIsAddModalOpen(false);
    } catch {
      toast.error('خطا در برقراری ارتباط با سرور برای افزودن کارمند.');
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleOpenEditModal = (member: OrgMember) => {
    setEditingMember(member);
    setEditName(member.name || '');
    setEditHeadline(member.occupation || member.profile?.headline || '');
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editName.trim()) {
      toast.error('نام و تخلص کارمند نمی‌تواند خالی باشد.');
      return;
    }

    setIsUpdatingMember(true);
    try {
      const res = await fetch('/api/organization/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: editingMember._id,
          name: editName.trim(),
          headline: editHeadline.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در ویرایش مشخصات کارمند.');
        return;
      }

      toast.success(data.message || 'مشخصات کارمند با موفقیت بروزرسانی شد.');
      if (data.member) {
        setMembers((prev) =>
          prev.map((m) => (m._id === data.member._id ? data.member : m))
        );
      }
      setEditingMember(null);
    } catch {
      toast.error('خطای شبکه هنگام ویرایش اطلاعات کارمند.');
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const handleRemoveMember = async (member: OrgMember) => {
    const confirmed = window.confirm(
      `آیا مطمئن هستید که می‌خواهید دسترسی «${member.name}» را غیرفعال و مسدود کنید؟ با این کار اکانت کارمند مسدود شده، لینک مینی‌سایت او از کار می‌افتد و ۱ جواز به ظرفیت سازمان بازمی‌گردد.`
    );
    if (!confirmed) return;

    setRemovingMemberId(member._id);
    try {
      const res = await fetch(`/api/organization/members?memberId=${member._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در غیرفعال‌سازی کارمند.');
        return;
      }

      toast.success(
        data.message ||
          'اکانت کارمند مسدود شد، لینک مینی‌سایت او از کار افتاد و ۱ جواز آزاد گردید.'
      );
      setMembers((prev) =>
        prev.map((m) =>
          m._id === member._id
            ? {
                ...m,
                isActive: false,
                profile: m.profile ? { ...m.profile, isActive: false } : null,
              }
            : m
        )
      );
      if (organization) {
        setOrganization({
          ...organization,
          usedLicenses:
            typeof data.usedLicenses === 'number'
              ? data.usedLicenses
              : Math.max(0, organization.usedLicenses - 1),
        });
      }
    } catch {
      toast.error('خطای سرور هنگام غیرفعال‌سازی کارمند.');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleReactivateMember = async (member: OrgMember) => {
    setRemovingMemberId(member._id);
    try {
      const res = await fetch('/api/organization/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member._id,
          action: 'reactivate',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در فعال‌سازی مجدد کارمند.');
        return;
      }

      toast.success(data.message || 'حساب کارمند و لینک مینی‌سایت او دوباره فعال شد.');
      if (data.member) {
        setMembers((prev) =>
          prev.map((m) => (m._id === member._id ? data.member : m))
        );
      }
      if (organization) {
        setOrganization({
          ...organization,
          usedLicenses:
            typeof data.usedLicenses === 'number'
              ? data.usedLicenses
              : organization.usedLicenses + 1,
        });
      }
    } catch {
      toast.error('خطای شبکه هنگام فعال‌سازی مجدد کارمند.');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    try {
      const res = await fetch('/api/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandName.trim(),
          branding: {
            primaryColor: brandPrimaryColor,
            secondaryColor: brandSecondaryColor,
            accentColor: brandSecondaryColor,
            coverImage: brandCoverImage.trim(),
            logoUrl: brandLogoUrl.trim(),
            companySlogan: brandSlogan.trim(),
            enforceBranding: brandEnforce,
          },
          applyToAllMembers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در ذخیره تنظیمات برندینگ.');
        return;
      }

      toast.success(data.message || 'تنظیمات برندینگ و قالب تیم با موفقیت ذخیره و اعمال شد.');
      if (data.organization) {
        setOrganization(data.organization);
      }
    } catch {
      toast.error('خطای شبکه هنگام ذخیره برندینگ.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <RefreshCw className="w-7 h-7 animate-spin text-cyan-500" />
        <p className="text-sm font-medium">در حال دریافت اطلاعات سازمان و لیست کارمندان...</p>
      </div>
    );
  }

  // Read-only corporate identity view if user is a subordinate member (orgRole === 'member')
  if (!isOwner && orgRole === 'member' && organization) {
    const memberPrimary = organization.branding?.primaryColor || '#0ea5e9';
    const memberSecondary =
      organization.branding?.secondaryColor || organization.branding?.accentColor || '#10b981';

    return (
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
        <Card className="p-6 md:p-8 border-border bg-card/85 backdrop-blur-xl rounded-3xl shadow-xl space-y-6">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-white/15 shadow-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${memberPrimary}25, ${memberSecondary}25)`,
              }}
            >
              {organization.branding?.logoUrl ? (
                <img
                  src={organization.branding.logoUrl}
                  alt={organization.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8" style={{ color: memberPrimary }} />
              )}
            </div>
            <div className="space-y-1.5">
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold gap-1">
                <Lock className="w-3 h-3" />
                حساب زیرمجموعه سازمانی
              </Badge>
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                {organization.name}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                رنگ‌بندی، قالب تیم، کاور پس‌زمینه و لوگوی مینی‌سایت شما به صورت خودکار توسط مدیر سازمانِ «{organization.name}» تنظیم و یکپارچه‌سازی می‌شود.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">
                پالت رنگی یکپارچه سازمان
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-lg border border-white/20 shadow-sm"
                    style={{ backgroundColor: memberPrimary }}
                  />
                  <span className="text-xs font-mono text-foreground" dir="ltr">
                    {memberPrimary}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-lg border border-white/20 shadow-sm"
                    style={{ backgroundColor: memberSecondary }}
                  />
                  <span className="text-xs font-mono text-foreground" dir="ltr">
                    {memberSecondary}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">
                کاور ثابت و نشان تایید سازمانی
              </span>
              {organization.branding?.coverImage ? (
                <div className="h-12 w-full rounded-xl overflow-hidden border border-border">
                  <img
                    src={organization.branding.coverImage}
                    alt="Corporate Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">کاور پیش‌فرض سازمانی فعال است</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Link href="/dashboard/editor">
              <Button className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold gap-2 px-5">
                <Sparkles className="w-4 h-4" />
                رفتن به ویرایشگر کارت هوشمند من
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback onboarding / B2B initialization if user is not yet owner of an organization
  if (!isOwner || !organization) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Card className="p-6 md:p-8 border-border bg-card/80 backdrop-blur-xl rounded-3xl shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <Badge variant="outline" className="mb-2 border-cyan-500/30 text-cyan-500 text-[11px]">
                پنل فروش سازمانی (B2B)
              </Badge>
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                راه‌اندازی پنل مدیریت سازمان و کارمندان
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                این بخش مخصوص مدیران شرکت‌ها و نهادهاست تا جوازهای (لایسنس‌های) خریداری‌شده را به کارمندان خود تخصیص دهند و رنگ‌بندی و هویت بصری واحد روی تمام کارت‌های پرسنل اعمال گردد.
              </p>
            </div>
          </div>

          <form onSubmit={handleInitializeOrganization} className="space-y-4 border-t border-border pt-6">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                نام شرکت یا نهاد (الزامی)
              </label>
              <Input
                value={setupCompanyName}
                onChange={(e) => setSetupCompanyName(e.target.value)}
                placeholder="مثلاً: شرکت تجارتی آریا گروپ"
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  تعداد جوازهای (لایسنس‌های) پکیج
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5000}
                  value={setupLicenses}
                  onChange={(e) => setSetupLicenses(Number(e.target.value))}
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  شعار سازمانی کارت‌ها (اختیاری)
                </label>
                <Input
                  value={setupSlogan}
                  onChange={(e) => setSetupSlogan(e.target.value)}
                  placeholder="مثلاً: پیشرو در خدمات دیجیتال افغانستان"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isInitializingOrg}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 gap-2"
              >
                {isInitializingOrg ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                فعال‌سازی پنل مدیریت سازمان
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  const totalLicenses = Math.max(1, organization.totalLicenses || 50);
  const usedLicenses = Math.max(0, organization.usedLicenses || 0);
  const remainingLicenses = Math.max(0, totalLicenses - usedLicenses);
  const usagePercent = Math.min(100, Math.round((usedLicenses / totalLicenses) * 100));
  const isQuotaFull = usedLicenses >= totalLicenses;

  const progressBarColor =
    usagePercent >= 95
      ? 'bg-rose-500'
      : usagePercent >= 75
        ? 'bg-amber-500'
        : 'bg-cyan-500';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/15 shadow-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${organization.branding?.primaryColor || '#0ea5e9'}22, ${organization.branding?.accentColor || '#10b981'}22)`,
            }}
          >
            {organization.branding?.logoUrl ? (
              <img
                src={organization.branding.logoUrl}
                alt={organization.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2
                className="w-7 h-7"
                style={{ color: organization.branding?.primaryColor || '#0ea5e9' }}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                {organization.name}
              </h1>
              <Badge className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
                پنل منابع بشری (HR)
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              مدیریت کارمندان، صدور خودکار کارت هوشمند و کنترل جوازهای سازمانی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant={activeTab === 'bulk_order' ? 'default' : 'outline'}
            onClick={() =>
              setActiveTab(activeTab === 'bulk_order' ? 'members' : 'bulk_order')
            }
            className="rounded-xl gap-2 text-xs font-bold h-10"
          >
            <CreditCard className="w-4 h-4 text-emerald-500" />
            سفارش کارت فیزیکی (گروهی)
          </Button>
          <Button
            type="button"
            variant={activeTab === 'branding' ? 'default' : 'outline'}
            onClick={() =>
              setActiveTab(activeTab === 'branding' ? 'members' : 'branding')
            }
            className="rounded-xl gap-2 text-xs font-bold h-10"
          >
            <Palette className="w-4 h-4 text-cyan-500" />
            هویت سازمانی و قالب تیم
          </Button>
          <Button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold gap-2 text-xs h-10 px-4 shadow-lg shadow-cyan-500/20"
          >
            <UserPlus className="w-4 h-4" />
            + افزودن کارمند جدید
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card/80 border border-border w-full lg:w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>اعضای تیم و جوازها</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bulk_order')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'bulk_order'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>سفارش کارت فیزیکی (گروهی)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>آمار و عملکرد تیم</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'leads'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Contact className="w-4 h-4" />
          <span>مخاطبین و مشتریان</span>
          {orgLeads.length > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                activeTab === 'leads'
                  ? 'bg-white/20 text-white'
                  : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
              }`}
            >
              {toPersianDigits(orgLeads.length)}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>هویت سازمانی و قالب تیم</span>
        </button>
      </div>

      {activeTab === 'members' && (
        <>
          {/* License Quota & Corporate Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* License Quota Widget */}
        <Card className="p-5 rounded-3xl border-border bg-card/80 backdrop-blur-md md:col-span-2 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-bold text-muted-foreground block mb-1">
                وضعیت جوازها (لایسنس‌های سازمانی)
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-black text-foreground">
                  مصرف شده: {toPersianDigits(usedLicenses)} از {toPersianDigits(totalLicenses)}
                </span>
                <Badge
                  variant="outline"
                  className={
                    isQuotaFull
                      ? 'border-rose-500/30 text-rose-500 bg-rose-500/10'
                      : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                  }
                >
                  {isQuotaFull
                    ? 'ظرفیت تکمیل است'
                    : `${toPersianDigits(remainingLicenses)} جواز باقی‌مانده`}
                </Badge>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-cyan-500" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden border border-border/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>میزان استفاده از بسته شرکتی</span>
              <span className="font-bold text-foreground">{toPersianDigits(usagePercent)}٪</span>
            </div>
          </div>
        </Card>

        {/* Corporate Branding Summary Card */}
        <Card className="p-5 rounded-3xl border-border bg-card/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-muted-foreground block mb-1">
                هویت بصری و برندینگ واحد
              </span>
              <p className="text-sm font-bold text-foreground">
                {organization.branding?.enforceBranding
                  ? 'برندینگ خودکار فعال است'
                  : 'برندینگ اختیاری'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                style={{ backgroundColor: organization.branding?.primaryColor || '#0ea5e9' }}
                title="رنگ اصلی سازمانی"
              />
              <span
                className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                style={{
                  backgroundColor:
                    organization.branding?.secondaryColor ||
                    organization.branding?.accentColor ||
                    '#10b981',
                }}
                title="رنگ ثانویه سازمانی"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate max-w-[180px]">
              {organization.branding?.companySlogan || 'بدون شعار ثبت شده'}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className="text-cyan-500 hover:text-cyan-400 font-bold shrink-0 cursor-pointer"
            >
              هویت سازمانی و قالب تیم
            </button>
          </div>
        </Card>
      </div>

      {/* Quota Warning Banner when full */}
      {isQuotaFull && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs md:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            سقف جوازهای سازمان شما پر شده است ({toPersianDigits(totalLicenses)} از{' '}
            {toPersianDigits(totalLicenses)}). برای افزودن کارمند جدید، لطفاً بسته سازمانی خود را ارتقا دهید یا یک عضو غیرفعال را حذف کنید.
          </span>
        </div>
      )}

      {/* Employees Table Section */}
      <Card className="rounded-3xl border-border bg-card/80 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-black text-foreground">
              لیست کارمندان و پروفایل‌های سازمانی ({toPersianDigits(members.length)})
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام، ایمیل یا شماره تماس..."
              className="pr-9 rounded-xl h-9 text-xs"
            />
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="py-14 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {searchQuery
                ? 'هیچ کارمندی مطابق جستجوی شما یافت نشد.'
                : 'هنوز هیچ کارمندی به سازمان اضافه نشده است.'}
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              با کلیک بر روی دکمه «افزودن کارمند جدید»، می‌توانید در چند ثانیه برای کارمندان خود حساب کاربری و کارت ویزیت دیجیتال یکپارچه بسازید.
            </p>
            {!searchQuery && (
              <Button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                + افزودن کارمند جدید
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground">
                  <th className="py-3.5 px-4">نام کارمند</th>
                  <th className="py-3.5 px-4">ایمیل</th>
                  <th className="py-3.5 px-4">سِمت (عنوان شغلی)</th>
                  <th className="py-3.5 px-4">لینک مینی‌سایت</th>
                  <th className="py-3.5 px-4">وضعیت</th>
                  <th className="py-3.5 px-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70 text-xs">
                {filteredMembers.map((member) => {
                  const alias = member.profile?.alias || '';
                  const isOwnerRow = member.orgRole === 'owner';
                  const isMemberActive = member.isActive !== false;

                  return (
                    <tr
                      key={member._id}
                      className={`hover:bg-muted/30 transition-colors ${!isMemberActive ? 'opacity-65 bg-rose-500/[0.03]' : ''}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shrink-0 overflow-hidden ${!isMemberActive ? 'grayscale' : ''}`}
                            style={{
                              background:
                                organization.branding?.primaryColor || '#0ea5e9',
                            }}
                          >
                            {member.profile?.avatarUrl ? (
                              <img
                                src={member.profile.avatarUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              member.name.slice(0, 2)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">
                              {member.name}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              ثبت: {formatDariDate(member.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-foreground" dir="ltr">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[190px]">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground" dir="ltr">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-foreground">
                          {member.occupation || member.profile?.headline || 'عضو تیم'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {alias ? (
                          isMemberActive ? (
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/${alias}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold transition-colors"
                                dir="ltr"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                <span>/{alias}</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(alias)}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="کاپی لینک کارت کارمند"
                              >
                                {copiedAlias === alias ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[11px] font-medium line-through" dir="ltr">
                              /{alias}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            بدون مینی‌سایت متصل
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isOwnerRow ? (
                          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] gap-1">
                            <Crown className="w-3 h-3" />
                            مدیر سازمان
                          </Badge>
                        ) : isMemberActive ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]"
                          >
                            فعال
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-rose-500/30 text-rose-500 bg-rose-500/10 text-[10px]"
                          >
                            غیرفعال (دسترسی مسدود)
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-left">
                        {!isOwnerRow ? (
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditModal(member)}
                              className="h-8 px-2.5 rounded-xl text-xs gap-1.5 border-border hover:border-cyan-500/40"
                              title="ویرایش نام و سِمت کارمند"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-cyan-500" />
                              <span>ویرایش</span>
                            </Button>

                            {isMemberActive ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={removingMemberId === member._id}
                                onClick={() => handleRemoveMember(member)}
                                className="h-8 px-2.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs gap-1.5"
                                title="غیرفعال‌سازی اکانت، مسدود کردن لینک مینی‌سایت و آزادسازی جواز"
                              >
                                {removingMemberId === member._id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Ban className="w-3.5 h-3.5" />
                                )}
                                <span>غیرفعال‌سازی / حذف دسترسی</span>
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={removingMemberId === member._id}
                                onClick={() => handleReactivateMember(member)}
                                className="h-8 px-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 text-xs gap-1.5"
                                title="فعال‌سازی مجدد حساب کارمند"
                              >
                                {removingMemberId === member._id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3.5 h-3.5" />
                                )}
                                <span>فعال‌سازی مجدد</span>
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
        </>
      )}

      {/* TAB: Corporate Bulk Physical NFC Card Ordering */}
      {activeTab === 'bulk_order' && (
        <div className="space-y-6">
          {lastCreatedBulkOrderNumber && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <PackageCheck className="w-5 h-5 shrink-0" />
                <span>
                  سفارش گروهی کارت‌های فیزیکی NFC شما با شماره{' '}
                  <strong className="font-mono" dir="ltr">
                    {lastCreatedBulkOrderNumber}
                  </strong>{' '}
                  ثبت گردید و در وضعیت بررسی قرار دارد.
                </span>
              </div>
              <Link href="/dashboard/orders">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>مشاهده در تاریخچه سفارشات</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Top Controls & Auto Pricing Calculator */}
          <Card className="p-5 md:p-6 rounded-3xl border-border bg-card/85 backdrop-blur-md shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-foreground">
                    سفارش گروهی کارت‌های فیزیکی هوشمند (NFC) برای کارمندان
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    کارمندان مورد نظر خود را تیک بزنید؛ مبلغ کل به صورت خودکار بر اساس تعداد کارمندان و جنس کارت محاسبه گردیده و لینک اختصاصی هر کارمند برای چاپخانه و کدگذاری آماده می‌شود.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                disabled={selectedEmployeeIds.length === 0}
                onClick={handleOpenBulkOrderModal}
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-2 text-xs h-11 px-5 shadow-lg shadow-emerald-600/20 disabled:opacity-50 shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>ثبت سفارش چاپ ({toPersianDigits(selectedEmployeeIds.length)} کارت)</span>
              </Button>
            </div>

            {/* Material Grade & Pricing Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    label: 'پی‌وی‌سی مات سازمانی',
                    desc: 'ضدخش • مناسب همه تیم',
                    price: 1500,
                  },
                  {
                    label: 'فلز تیتانیوم برس‌خورده',
                    desc: 'حکاکی لیزری • مدیران',
                    price: 2800,
                  },
                  {
                    label: 'استیل طلایی VIP',
                    desc: 'لوکس و تشریفاتی',
                    price: 3400,
                  },
                ].map((mat) => {
                  const isSelected = bulkUnitPrice === mat.price;
                  return (
                    <button
                      key={mat.label}
                      type="button"
                      onClick={() => {
                        setBulkCardMaterial(mat.label);
                        setBulkUnitPrice(mat.price);
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 ring-1 ring-cyan-500/40'
                          : 'bg-background/60 border-border hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-foreground">
                          {mat.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{mat.desc}</p>
                      <p className="text-xs font-black text-cyan-600 dark:text-cyan-400 mt-1.5">
                        {toPersianDigits(mat.price.toLocaleString('en-US'))} افغانی / کارت
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <span className="text-[11px] font-bold text-muted-foreground block">
                    تعداد انتخاب‌شده
                  </span>
                  <span className="text-xl font-black text-foreground mt-1 block">
                    {toPersianDigits(selectedEmployeeIds.length)} از {toPersianDigits(members.length)} کارمند
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                    مبلغ کل سفارش گروهی
                  </span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {toPersianDigits(bulkTotalPrice.toLocaleString('en-US'))} افغانی
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Selectable Employee List for Printing */}
          <Card className="rounded-3xl border-border bg-card/80 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted border border-border text-xs font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={allEmployeesSelected}
                    onChange={handleToggleSelectAllEmployees}
                    className="w-4 h-4 rounded border-border text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>انتخاب همه کارمندان ({toPersianDigits(members.length)})</span>
                </label>
              </div>

              <div className="text-xs text-muted-foreground">
                با تیک زدن هر کارمند، مشخصات و لینک QR وی برای چاپ کارت فیزیکی در سفارش گنجانده می‌شود.
              </div>
            </div>

            {members.length === 0 ? (
              <div className="py-14 px-4 text-center space-y-3">
                <Users className="w-8 h-8 text-muted-foreground mx-auto opacity-60" />
                <p className="text-sm font-bold text-foreground">
                  هنوز کارمندی در سازمان ثبت نشده است.
                </p>
                <p className="text-xs text-muted-foreground">
                  ابتدا از بخش «اعضای تیم و جوازها» کارمندان خود را اضافه کنید تا بتوانید برای آن‌ها کارت فیزیکی سفارش دهید.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground">
                      <th className="py-3.5 px-4 w-12">انتخاب</th>
                      <th className="py-3.5 px-4">نام و تخلص کارمند</th>
                      <th className="py-3.5 px-4">عنوان شغلی / سِمت</th>
                      <th className="py-3.5 px-4">لینک مینی‌سایت (QR Code)</th>
                      <th className="py-3.5 px-4">وضعیت حساب</th>
                      <th className="py-3.5 px-4">هزینه چاپ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {members.map((member) => {
                      const isChecked = selectedEmployeeIds.includes(member._id);
                      const alias = member.profile?.alias || '';
                      return (
                        <tr
                          key={member._id}
                          onClick={() => handleToggleEmployeeSelection(member._id)}
                          className={`cursor-pointer transition-colors ${
                            isChecked ? 'bg-cyan-500/10 hover:bg-cyan-500/15' : 'hover:bg-muted/20'
                          }`}
                        >
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleEmployeeSelection(member._id)}
                              className="w-4 h-4 rounded border-border text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                            />
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0 font-bold text-foreground">
                                {member.profile?.avatarUrl ? (
                                  <img
                                    src={member.profile.avatarUrl}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  member.name?.slice(0, 1) || 'ک'
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-foreground block">
                                  {member.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground" dir="ltr">
                                  {member.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {member.occupation || member.profile?.headline || 'کارمند سازمان'}
                          </td>

                          <td className="py-3.5 px-4">
                            {alias ? (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold"
                                dir="ltr"
                              >
                                <Link2 className="w-3 h-3" />
                                /{alias}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">بدون لینک</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {member.isActive !== false ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]"
                              >
                                فعال
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-rose-500/30 text-rose-500 bg-rose-500/10 text-[10px]"
                              >
                                غیرفعال
                              </Badge>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-foreground">
                            {toPersianDigits(bulkUnitPrice.toLocaleString('en-US'))} افغانی
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB: Team Analytics & Employee Leaderboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Team Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 rounded-3xl border-border bg-card/80 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground">
                  مجموع بازدید کل کارت‌های تیم
                </span>
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black text-foreground">
                {toPersianDigits(analytics.totalTeamViews)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                اسکن QR و بازدید مستقیم مینی‌سایت همه کارمندان
              </p>
            </Card>

            <Card className="p-5 rounded-3xl border-border bg-card/80 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground">
                  مجموع کلیک روی لینک‌های تیم
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black text-foreground">
                {toPersianDigits(analytics.totalTeamClicks)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                کلیک روی واتساپ، تماس، شبکه‌های اجتماعی و لینک‌ها
              </p>
            </Card>

            <Card className="p-5 rounded-3xl border-border bg-card/80 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground">
                  مخاطبین و مشتریان جذب‌شده
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                  <Contact className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black text-foreground">
                {toPersianDigits(analytics.totalTeamLeads)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                ذخیره‌شده در دفترچه تماس متمرکز سازمان (CRM)
              </p>
            </Card>

            <Card className="p-5 rounded-3xl border-border bg-card/80 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground">
                  نرخ تعامل و کلیک (CTR)
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black text-foreground" dir="ltr">
                {toPersianDigits(analytics.ctr)}%
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                نسبت کلیک بر لینک‌ها به مجموع بازدید کارت‌های تیم
              </p>
            </Card>
          </div>

          {/* Employee Performance Leaderboard */}
          <Card className="rounded-3xl border-border bg-card/80 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground">
                    جدول رتبه‌بندی عملکرد کارمندان (Leaderboard)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    مقایسه کارمندان بر اساس بیشترین تعداد بازدید کارت، کلیک‌ها و مشتریان جذب‌شده
                  </p>
                </div>
              </div>
            </div>

            {analytics.leaderboard.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto opacity-60" />
                <p className="text-sm font-bold text-foreground">
                  هنوز داده‌ای برای تحلیل عملکرد تیم ثبت نشده است.
                </p>
                <p className="text-xs text-muted-foreground">
                  با افزودن کارمندان و اشتراک‌گذاری کارت‌های هوشمند، آمار بازدید و کلیک‌ها به صورت خودکار اینجا نمایش داده می‌شود.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground">
                      <th className="py-3.5 px-4 w-16">رتبه</th>
                      <th className="py-3.5 px-4">کارمند / سِمت</th>
                      <th className="py-3.5 px-4">لینک کارت</th>
                      <th className="py-3.5 px-4">بازدید / اسکن</th>
                      <th className="py-3.5 px-4">کلیک روی لینک‌ها</th>
                      <th className="py-3.5 px-4">مشتری جذب‌شده</th>
                      <th className="py-3.5 px-4">سهم از بازدید تیم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {analytics.leaderboard.map((entry, idx) => {
                      const rank = idx + 1;
                      const sharePercent =
                        analytics.totalTeamViews > 0
                          ? Math.round((entry.viewsCount / analytics.totalTeamViews) * 100)
                          : 0;
                      return (
                        <tr
                          key={entry.memberId}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                                rank === 1
                                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                                  : rank === 2
                                    ? 'bg-slate-400/20 text-slate-600 dark:text-slate-300 border border-slate-400/40'
                                    : rank === 3
                                      ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/40'
                                      : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {toPersianDigits(rank)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0 font-bold text-foreground">
                                {entry.avatarUrl ? (
                                  <img
                                    src={entry.avatarUrl}
                                    alt={entry.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  entry.name?.slice(0, 1) || 'ک'
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-foreground">
                                    {entry.name}
                                  </span>
                                  {entry.orgRole === 'owner' && (
                                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] px-1.5 py-0">
                                      مدیر
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                                  {entry.occupation || entry.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {entry.alias ? (
                              <Link
                                href={`/${entry.alias}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold"
                                dir="ltr"
                              >
                                <span>/{entry.alias}</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-black text-foreground">
                            {toPersianDigits(entry.viewsCount)}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                            {toPersianDigits(entry.clicksCount)}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                            {toPersianDigits(entry.leadsCount)}
                          </td>

                          <td className="py-3.5 px-4 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                                  style={{ width: `${sharePercent}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-muted-foreground w-9 text-left">
                                {toPersianDigits(sharePercent)}٪
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB: Corporate Contacts & Centralized CRM */}
      {activeTab === 'leads' && (
        <Card className="rounded-3xl border-border bg-card/80 backdrop-blur-md overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                <Contact className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">
                  مخاطبین و مشتریان سازمان (دفترچه تماس متمرکز CRM)
                </h2>
                <p className="text-xs text-muted-foreground">
                  تمام مخاطبینی که از طریق «تبادل مخاطب» یا فرم تماس در کارت‌های کارمندان ثبت شده‌اند در مالکیت سازمان نگهداری می‌شوند.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={leadsSearch}
                  onChange={(e) => setLeadsSearch(e.target.value)}
                  placeholder="جستجوی نام، شماره یا ایمیل..."
                  className="pr-9 rounded-xl h-9 text-xs"
                />
              </div>

              <select
                value={leadsEmployeeFilter}
                onChange={(e) => setLeadsEmployeeFilter(e.target.value)}
                className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <option value="all">همه کارمندان ({toPersianDigits(members.length)})</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredLeads.length === 0}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs h-9 px-4 shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                دانلود خروجی (CSV/Excel)
              </Button>
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="py-14 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 mx-auto flex items-center justify-center">
                <Contact className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {leadsSearch || leadsEmployeeFilter !== 'all'
                  ? 'هیچ مخاطبی با این جستجو یا فیلتر یافت نشد.'
                  : 'هنوز هیچ مشتری یا مخاطبی از کارت‌های تیم ثبت نشده است.'}
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                هرگاه مشتریان روی کارت ویزیت دیجیتال یکی از کارمندان گزینه ذخیره مخاطب (تبادل تماس) یا فرم ارتباطی را تکمیل کنند، مشخصات آن‌ها بلافاصله در این دفترچه ثبت می‌گردد.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground">
                    <th className="py-3.5 px-4">نام مشتری</th>
                    <th className="py-3.5 px-4">شماره تماس</th>
                    <th className="py-3.5 px-4">ایمیل</th>
                    <th className="py-3.5 px-4">جذب‌شده توسط</th>
                    <th className="py-3.5 px-4">جزئیات / پیام</th>
                    <th className="py-3.5 px-4">تاریخ ثبت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {lead.name || 'مشتری بدون نام'}
                      </td>

                      <td className="py-3.5 px-4">
                        {lead.phone && lead.phone !== '-' && lead.phone !== '—' ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
                            dir="ltr"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{lead.phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1.5 text-foreground hover:text-cyan-500 transition-colors"
                            dir="ltr"
                          >
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{lead.email}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-foreground">
                            {lead.employee?.name || 'کارمند سازمان'}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {lead.employee?.occupation ||
                              (lead.employee?.alias ? `/${lead.employee.alias}` : 'عضو تیم')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
                          <span className="line-clamp-2">{lead.message || '—'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                        {formatDariDate(lead.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: Corporate Branding & Team Template Settings */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Branding Settings Form */}
          <Card className="lg:col-span-7 p-5 md:p-6 rounded-3xl border-border bg-card/85 backdrop-blur-md shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
              <div>
                <h2 className="text-base md:text-lg font-black text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-cyan-500" />
                  هویت سازمانی و قالب تیم
                </h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  لوگوی سازمان، رنگ اصلی و ثانویه و تصویر پس‌زمینه (کاور) یکپارچه را تنظیم نمایید تا ظاهر مینی‌سایت تمام کارمندان به صورت هماهنگ و قفل‌شده نمایش داده شود.
                </p>
              </div>
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold gap-1 shrink-0">
                <Lock className="w-3 h-3" />
                یکپارچه‌سازی سازمانی
              </Badge>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  نام رسمی شرکت / سازمان
                </label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="نام رسمی سازمان"
                  className="rounded-xl"
                  required
                />
              </div>

              {/* 1. Corporate Logo Uploader */}
              <FileUploader
                value={brandLogoUrl}
                onChange={(url) => setBrandLogoUrl(url)}
                fileType="image"
                folder="branding"
                label="۱. لوگوی سازمان (آپلود تصویر)"
                description="این لوگو به عنوان نشان تایید و وابستگی سازمانی در هدر و فوتر مینی‌سایت تمام کارمندان نمایش داده می‌شود."
                maxSizeMB={2}
                aspectRatio="square"
              />

              {/* 2. Primary & Secondary Theme Colors */}
              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    ۲. رنگ اصلی و رنگ ثانویه سازمان (Color Pickers)
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { p: '#0ea5e9', s: '#10b981', name: 'فیروزه‌ای و زمردی' },
                      { p: '#2563eb', s: '#06b6d4', name: 'آبی رسمی' },
                      { p: '#7c3aed', s: '#ec4899', name: 'بنفش مدرن' },
                      { p: '#d97706', s: '#f59e0b', name: 'طلایی لوکس' },
                    ].map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        title={pal.name}
                        onClick={() => {
                          setBrandPrimaryColor(pal.p);
                          setBrandSecondaryColor(pal.s);
                        }}
                        className="w-6 h-6 rounded-full border border-white/30 shadow-xs cursor-pointer transition-transform hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${pal.p}, ${pal.s})`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      رنگ اصلی تم (Primary Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandPrimaryColor}
                        onChange={(e) => setBrandPrimaryColor(e.target.value)}
                        className="w-11 h-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5 shrink-0"
                      />
                      <Input
                        value={brandPrimaryColor}
                        onChange={(e) => setBrandPrimaryColor(e.target.value)}
                        className="rounded-xl text-xs font-sans uppercase"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      رنگ ثانویه تم (Secondary Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandSecondaryColor}
                        onChange={(e) => setBrandSecondaryColor(e.target.value)}
                        className="w-11 h-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5 shrink-0"
                      />
                      <Input
                        value={brandSecondaryColor}
                        onChange={(e) => setBrandSecondaryColor(e.target.value)}
                        className="rounded-xl text-xs font-sans uppercase"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Fixed Corporate Cover Image Uploader */}
              <FileUploader
                value={brandCoverImage}
                onChange={(url) => setBrandCoverImage(url)}
                fileType="image"
                folder="covers"
                label="۳. تصویر پس‌زمینه (کاور) یکپارچه برای همه کارمندان"
                description="این تصویر به عنوان کاور پس‌زمینه ثابت روی مینی‌سایت تمام کارمندان اعمال شده و کارمندان امکان تغییر آن را نخواهند داشت."
                maxSizeMB={2}
                aspectRatio="banner"
              />

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  شعار سازمانی پیش‌فرض کارت‌ها (اختیاری)
                </label>
                <Input
                  value={brandSlogan}
                  onChange={(e) => setBrandSlogan(e.target.value)}
                  placeholder="مثلاً: خدمات معیاری و نوین برای مشتریان عزیز"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-muted/25 border border-border">
                <label className="flex items-center gap-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brandEnforce}
                    onChange={(e) => setBrandEnforce(e.target.checked)}
                    className="rounded border-border text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="font-semibold text-foreground">
                    قفل کردن ابزارهای رنگ و کاور در ویرایشگر کارمندان (کارمند فقط عکس پروفایل شخصی را تغییر دهد)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToAllMembers}
                    onChange={(e) => setApplyToAllMembers(e.target.checked)}
                    className="rounded border-border text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    بروزرسانی و اعمال فوری روی پروفایل تمام کارمندان فعلی
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSavingBranding}
                  className="w-full sm:w-auto rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs gap-2 px-6 h-11 shadow-lg shadow-cyan-500/20"
                >
                  {isSavingBranding ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  ذخیره و اعمال برندینگ روی تمام کارت‌های تیم
                </Button>
              </div>
            </form>
          </Card>

          {/* Live Corporate Mini-Site Preview Column */}
          <Card className="lg:col-span-5 p-5 rounded-3xl border-border bg-card/85 backdrop-blur-md shadow-sm space-y-4 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-black text-foreground">
                  پیش‌نمایش زنده قالب یکپارچه کارمندان
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-500">
                نمای عمومی کارت
              </Badge>
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/15 bg-slate-950 text-white shadow-2xl">
              {/* Cover Area */}
              <div className="relative h-36 w-full overflow-hidden">
                {brandCoverImage ? (
                  <img
                    src={brandCoverImage}
                    alt="Corporate Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(135deg, ${brandPrimaryColor}, ${brandSecondaryColor})`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />

                {/* Floating Corporate Affiliation Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/15 text-[10px] font-bold shadow-lg">
                  {brandLogoUrl ? (
                    <img
                      src={brandLogoUrl}
                      alt={brandName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-3.5 h-3.5" style={{ color: brandPrimaryColor }} />
                  )}
                  <span className="truncate max-w-[130px]">{brandName || 'نام سازمان'}</span>
                  <BadgeCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                </div>
              </div>

              {/* Avatar & Employee Sample Body */}
              <div className="px-5 pb-6 -mt-10 relative z-10 text-center space-y-3">
                <div className="w-20 h-20 rounded-full mx-auto border-4 border-slate-950 shadow-xl flex items-center justify-center text-lg font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${brandPrimaryColor}, ${brandSecondaryColor})`,
                  }}
                >
                  اف
                </div>

                <div>
                  <h3 className="text-base font-black text-white">احمد فرهاد نوری</h3>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: brandSecondaryColor }}>
                    مسئول ارتباطات — {brandName || 'سازمان شما'}
                  </p>
                  {brandSlogan && (
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {brandSlogan}
                    </p>
                  )}
                </div>

                {/* Sample Corporate Action Buttons */}
                <div className="space-y-2 pt-2">
                  <div
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-between border"
                    style={{
                      backgroundColor: `${brandPrimaryColor}26`,
                      borderColor: brandPrimaryColor,
                    }}
                  >
                    <span>تماس مستقیم و واتساپ کاری</span>
                    <span className="text-[10px] opacity-80">←</span>
                  </div>
                  <div
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-between border"
                    style={{
                      background: `linear-gradient(135deg, ${brandPrimaryColor}, ${brandSecondaryColor})`,
                      borderColor: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    <span>ذخیره در مخاطبان موبایل (vCard)</span>
                    <span className="text-[10px]">+</span>
                  </div>
                </div>

                {/* Footer Affiliation Badge */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-slate-300">
                  {brandLogoUrl && (
                    <img
                      src={brandLogoUrl}
                      alt={brandName}
                      className="w-4 h-4 rounded object-cover"
                    />
                  )}
                  <span>تایید شده توسط {brandName || 'سازمان شما'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <span>
                تمام کارمندان تیم این کاور و رنگ‌بندی را روی کارت عمومی خود دریافت می‌کنند و در داشبورد خودشان فقط اجازه تغییر عکس پروفایل شخصی را خواهند داشت.
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Modal 1: Add New Employee */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <UserPlus className="w-5 h-5 text-cyan-500" />
              افزودن کارمند جدید به سازمان
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              اطلاعات کارمند را وارد کنید تا حساب کاربری عضو و کارت ویزیت هوشمند وی با رنگ‌بندی سازمان به صورت خودکار ایجاد شود.
            </DialogDescription>
          </DialogHeader>

          {isQuotaFull && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-600 dark:text-rose-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>ظرفیت پکیج شما تکمیل شده است. برای افزودن کارمند جدید، پکیج خود را ارتقا دهید.</span>
              </div>
              <Link href="/dashboard/upgrade">
                <Button type="button" size="sm" className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] shrink-0">
                  ارتقای بسته
                </Button>
              </Link>
            </div>
          )}

          <form onSubmit={handleAddEmployee} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                نام و تخلص کارمند (الزامی)
              </label>
              <Input
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="مثلاً: احمد فرهاد نوری"
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  ایمیل کارمند (برای ورود به سیستم)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="name@company.af"
                    className="pr-9 rounded-xl"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  شماره تماس / واتساپ (اختیاری)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="+93799000000"
                    className="pr-9 rounded-xl"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                عنوان شغلی / سِمت
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={empHeadline}
                  onChange={(e) => setEmpHeadline(e.target.value)}
                  placeholder="مثلاً: داکتر عمومی، مدیر فروش"
                  className="pr-9 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-foreground">
                  رمز عبور اولیه
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>تولید خودکار (Generate)</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Lock className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="رمز عبور اولیه کارمند یا دکمه تولید خودکار را بزنید"
                    className="pr-9 rounded-xl font-mono text-xs"
                    dir="ltr"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                  className="rounded-xl text-xs gap-1.5 shrink-0"
                  title="تولید خودکار رمز عبور"
                >
                  <Wand2 className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="hidden sm:inline">Generate</span>
                </Button>
                {empPassword && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyPassword}
                    className="rounded-xl px-2.5 shrink-0"
                    title="کاپی رمز عبور"
                  >
                    {copiedPassword ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5 text-[11px] text-cyan-700 dark:text-cyan-300 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500" />
              <span>
                با ثبت این کارمند، ۱ عدد از جوازهای باقی‌مانده ({toPersianDigits(remainingLicenses)} عدد موجود) مصرف شده و رنگ‌بندی/لوگوی سازمان به صورت خودکار روی کارت دیجیتال وی اعمال می‌گردد.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl text-xs"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingMember}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs gap-2 px-5"
              >
                {isSubmittingMember ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                ثبت کارمند و ساخت کارت
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Edit Employee Name & Job Title */}
      <Dialog
        open={Boolean(editingMember)}
        onOpenChange={(open) => {
          if (!open) setEditingMember(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <Edit3 className="w-5 h-5 text-cyan-500" />
              ویرایش مشخصات و سِمت کارمند
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              نام و عنوان شغلی کارمند روی حساب کاربری و کارت دیجیتال عمومی وی بروزرسانی خواهد شد.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateEmployee} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                نام و تخلص کارمند (الزامی)
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="نام و تخلص کارمند"
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                عنوان شغلی / سِمت
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  placeholder="مثلاً: داکتر عمومی، مدیر فروش"
                  className="pr-9 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMember(null)}
                className="rounded-xl text-xs"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingMember}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs gap-2 px-5"
              >
                {isUpdatingMember ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                ذخیره تغییرات
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Bulk NFC Physical Cards Logistics & Offline Prepayment */}
      <Dialog
        open={isBulkOrderModalOpen}
        onOpenChange={(open) => {
          if (!isSubmittingBulkOrder) setIsBulkOrderModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <Printer className="w-5 h-5 text-emerald-500" />
              تکمیل سفارش چاپ گروهی ({toPersianDigits(selectedEmployeeIds.length)} کارت)
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              آدرس ارسال محموله (لجستیک)، شماره تماس هماهنگی و اطلاعات پیش‌پرداخت آفلاین را وارد نمایید تا سفارش برای چاپخانه ثبت شود.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitBulkOrder} className="space-y-4 mt-2">
            {/* Auto-Calculated Price Summary Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-foreground block">
                  {bulkCardMaterial} ({toPersianDigits(selectedEmployeeIds.length)} عدد)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  قیمت پایه هر کارت: {toPersianDigits(bulkUnitPrice.toLocaleString('en-US'))} افغانی
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-muted-foreground block">مبلغ کل قابل پرداخت</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {toPersianDigits(bulkTotalPrice.toLocaleString('en-US'))} افغانی
                </span>
              </div>
            </div>

            {/* Logistics Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  ولایت مقصد (ارسال)
                </label>
                <select
                  value={bulkProvince}
                  onChange={(e) => setBulkProvince(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {['کابل', 'هرات', 'بلخ (مزارشریف)', 'ننگرهار (جلال‌آباد)', 'قندهار', 'بامیان', 'بدخشان', 'کندز', 'غزنی', 'خوست', 'سایر ولایات'].map(
                    (prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  شماره تماس هماهنگی (الزامی)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={bulkContactPhone}
                    onChange={(e) => setBulkContactPhone(e.target.value)}
                    placeholder="+93799000000"
                    className="pr-9 rounded-xl text-xs"
                    dir="ltr"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                آدرس دقیق تحویل دفتر یا سازمان (الزامی)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-muted-foreground absolute right-3 top-3" />
                <textarea
                  value={bulkShippingAddress}
                  onChange={(e) => setBulkShippingAddress(e.target.value)}
                  placeholder="مثال: کابل، شهر نو، سرک چهارم، ساختمان تجاری، طبقه سوم، دفتر مرکزی..."
                  rows={2}
                  className="w-full pr-9 pl-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
                  required
                />
              </div>
            </div>

            {/* Payment Method: Offline Prepayment Portal (Receipt Upload) or COD */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-foreground">
                  روش پرداخت (درگاه آفلاین پیش‌پرداخت)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBulkPaymentType('prepayment')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      bulkPaymentType === 'prepayment'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-background border border-border text-muted-foreground'
                    }`}
                  >
                    آپلود فیش پیش‌پرداخت
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkPaymentType('cod')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      bulkPaymentType === 'cod'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-background border border-border text-muted-foreground'
                    }`}
                  >
                    تسویه هنگام تحویل
                  </button>
                </div>
              </div>

              {bulkPaymentType === 'prepayment' ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">حساب حساب‌پی پلتفرم:</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400" dir="ltr">
                        {storePaymentInfo.accountNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">به نام:</span>
                      <span className="font-bold text-foreground">{storePaymentInfo.accountName}</span>
                    </div>
                    {storePaymentInfo.bankName && storePaymentInfo.bankAccountNumber && (
                      <div className="flex items-center justify-between pt-1 border-t border-border/60">
                        <span className="text-muted-foreground">{storePaymentInfo.bankName}:</span>
                        <span className="font-mono text-[11px]" dir="ltr">
                          {storePaymentInfo.bankAccountNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      آپلود تصویر فیش / رسید واریزی (الزامی)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 h-10 px-3 rounded-xl border border-dashed border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10 text-xs font-bold text-cyan-600 dark:text-cyan-400 cursor-pointer transition-colors">
                        {isUploadingBulkReceipt ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>
                          {bulkReceiptUrl
                            ? 'تغییر تصویر فیش آپلود شده'
                            : 'انتخاب و آپلود تصویر فیش واریزی'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBulkReceiptUpload}
                          className="hidden"
                        />
                      </label>
                      {bulkReceiptUrl && (
                        <a
                          href={bulkReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-10 px-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-1"
                        >
                          <FileImage className="w-4 h-4" />
                          مشاهده
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      شماره پیگیری / رفرنس تراکنش (اختیاری)
                    </label>
                    <Input
                      value={bulkTransactionRef}
                      onChange={(e) => setBulkTransactionRef(e.target.value)}
                      placeholder="مثلاً: TX-849210"
                      className="rounded-xl text-xs h-9"
                      dir="ltr"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  در این حالت سفارش بلافاصله ثبت شده و تیم پشتیبانی جهت هماهنگی چاپ و دریافت وجه در محل شرکت با شما تماس می‌گیرد.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                یادداشت یا راهنمای اضافی برای چاپخانه (اختیاری)
              </label>
              <Input
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                placeholder="مثلاً: درج لوگوی جدید روی همه کارت‌ها..."
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmittingBulkOrder}
                onClick={() => setIsBulkOrderModalOpen(false)}
                className="rounded-xl text-xs"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingBulkOrder || isUploadingBulkReceipt}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 px-5"
              >
                {isSubmittingBulkOrder ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                تایید و ثبت نهایی سفارش چاپ
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
