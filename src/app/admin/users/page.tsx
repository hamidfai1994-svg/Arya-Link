'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Shield,
  UserCheck,
  UserX,
  CreditCard,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  MoreVertical,
  Mail,
  Phone,
  Sparkles,
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
import { PaginationBar } from '@/components/ui/pagination-bar';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin' | 'financial_admin' | 'content_editor';
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: string;
  profilesCount: number;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Pagination state (Strictly English numbers)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, planFilter]);

  // Edit user state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<string>('user');
  const [editPlan, setEditPlan] = useState<string>('free');
  const [isSavingUser, setIsSavingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      toast.error('خطا در دریافت لیست کاربران');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditPlan(user.subscriptionPlan || 'free');
  };

  const handleSaveUserRoles = async () => {
    if (!selectedUser) return;
    setIsSavingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: editRole,
          subscriptionPlan: editPlan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`دسترسی‌های کاربر «${selectedUser.name}» به‌روزرسانی شد`);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(data.message || 'خطا در ویرایش دسترسی');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isActive: !user.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`وضعیت دسترسی «${user.name}» تغییر یافت.`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('خطا در تغییر وضعیت کاربر');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return (
          <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px]">
            مدیر ارشد (Super Admin)
          </Badge>
        );
      case 'financial_admin':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
            مدیر مالی (Finance)
          </Badge>
        );
      case 'content_editor':
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px]">
            مدیر محتوا (Editor)
          </Badge>
        );
      case 'admin':
        return (
          <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[10px]">
            مدیر سیستم (Admin)
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            کاربر عادی
          </Badge>
        );
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (planFilter !== 'all' && u.subscriptionPlan !== planFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              مدیریت کاربران و دسترسی‌ها (RBAC Users)
            </h1>
            <Badge variant="cyan" className="font-sans text-xs">
              {users.length} کاربر
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            مشاهده اطلاعات کاربران، انتساب نقش‌های سازمانی (Super Admin, Financial, Content Editor)، ارتقای پلن و مسدودسازی
          </p>
        </div>

        <Button
          onClick={fetchUsers}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-border bg-card self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs">بروزرسانی داده‌ها</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            type="text"
            placeholder="جستجوی نام، ایمیل یا شماره..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Role and Plan Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground font-semibold focus:outline-none"
          >
            <option value="all">همه نقش‌ها</option>
            <option value="superadmin">مدیر ارشد (Super Admin)</option>
            <option value="admin">مدیر سیستم (Admin)</option>
            <option value="financial_admin">مدیر مالی (Financial Admin)</option>
            <option value="content_editor">مدیر محتوا (Content Editor)</option>
            <option value="user">کاربر عادی</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground font-semibold focus:outline-none"
          >
            <option value="all">همه پلن‌ها</option>
            <option value="free">رایگان (Free)</option>
            <option value="pro">حرفه‌ای (PRO)</option>
            <option value="enterprise">سازمانی (Enterprise)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="text-xs">در حال بارگذاری کاربران...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="text-sm font-bold text-foreground">کاربری مطابق جستجو یافت نشد</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs">نام و اطلاعات تماس</TableHead>
                  <TableHead className="text-right font-bold text-xs">نقش سازمانی (Role)</TableHead>
                  <TableHead className="text-right font-bold text-xs">پلن اشتراک</TableHead>
                  <TableHead className="text-right font-bold text-xs">احراز هویت</TableHead>
                  <TableHead className="text-right font-bold text-xs">تعداد کارت‌ها</TableHead>
                  <TableHead className="text-right font-bold text-xs">وضعیت حساب</TableHead>
                  <TableHead className="text-center font-bold text-xs">عملیات مدیریت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-muted/40 transition-colors">
                    {/* User Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-rose-500/20">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.isVerified && (
                              <span title="دارای تیک آبی">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-sans" dir="ltr">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-[10px] text-muted-foreground font-sans" dir="ltr">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>{getRoleBadge(user.role)}</TableCell>

                    {/* Plan */}
                    <TableCell>
                      <Badge
                        variant={user.subscriptionPlan === 'enterprise' ? 'purple' : user.subscriptionPlan === 'pro' ? 'gold' : 'outline'}
                        className="text-[10px] uppercase font-sans"
                      >
                        {user.subscriptionPlan || 'FREE'}
                      </Badge>
                    </TableCell>

                    {/* Verification */}
                    <TableCell>
                      {user.isVerified ? (
                        <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تایید شده</span>
                        </span>
                      ) : user.verificationStatus === 'pending' ? (
                        <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>در انتظار</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">ثبت‌نشده</span>
                      )}
                    </TableCell>

                    {/* Profiles count */}
                    <TableCell className="font-sans text-xs font-bold text-foreground">
                      {user.profilesCount} کارت
                    </TableCell>

                    {/* Active */}
                    <TableCell>
                      {user.isActive ? (
                        <span className="text-[11px] text-emerald-500 font-bold">فعال</span>
                      ) : (
                        <span className="text-[11px] text-rose-500 font-bold">مسدود</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(user)}
                          className="h-8 px-2.5 text-[11px] rounded-xl text-rose-500 hover:text-rose-600 border-rose-500/20"
                        >
                          <Shield className="w-3.5 h-3.5 ml-1" />
                          <span>تنظیم دسترسی</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(user)}
                          className={`h-8 px-2 text-[11px] rounded-xl ${
                            user.isActive
                              ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-500/10'
                              : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                        >
                          {user.isActive ? 'مسدودسازی' : 'فعال‌سازی'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination Bar */}
            <div className="p-4 border-t border-border">
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                itemLabel="کاربر"
              />
            </div>
          </div>
        )}
      </Card>

      {/* RBAC Role & Plan Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>تنظیم نقش و دسترسی «{selectedUser?.name}»</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              سطح دسترسی سازمانی (RBAC) و پلن اشتراک این کاربر را تعیین فرمایید.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">نقش سازمانی (Enterprise Role)</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-xs text-foreground font-semibold focus:outline-none"
                >
                  <option value="user">کاربر عادی (User) - فقط دسترسی به داشبورد و ساخت کارت‌ها</option>
                  <option value="content_editor">مدیر محتوا (Content Editor) - ویرایش بلاگ، خدمات و شرکت</option>
                  <option value="financial_admin">مدیر مالی (Financial Admin) - بررسی فروش و تسویه‌حساب‌ها</option>
                  <option value="admin">مدیر سیستم (Admin) - دسترسی کامل مدیریتی</option>
                  <option value="superadmin">مدیر ارشد کل (Super Admin) - کنترل تام سیستم</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">پلن اشتراک کاربر</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-xs text-foreground font-semibold focus:outline-none"
                >
                  <option value="free">رایگان (Free Plan)</option>
                  <option value="pro">حرفه‌ای (PRO Plan) - کارت‌های نامحدود و قابلیت‌های فروشگاه</option>
                  <option value="enterprise">سازمانی (Enterprise) - ماژول‌های VIP و برند اختصاصی</option>
                </select>
              </div>

              <DialogFooter className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="h-10 rounded-xl text-xs"
                >
                  انصراف
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveUserRoles}
                  disabled={isSavingUser}
                  className="h-10 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  {isSavingUser && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>اعمال و ذخیره دسترسی</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
