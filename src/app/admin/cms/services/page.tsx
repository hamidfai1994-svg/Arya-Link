'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface ServiceItemData {
  _id?: string;
  title: string | MultilingualText;
  slug: string;
  summary: string | MultilingualText;
  description: string | MultilingualText;
  icon: string;
  features: string[];
  targetAudience: string | MultilingualText;
  pricingInfo: string;
  order: number;
  isActive: boolean;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItemData | null>(null);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  // Multilingual form fields
  const [title, setTitle] = useState<MultilingualText>({ da: '', ps: '', en: '' });
  const [summary, setSummary] = useState<MultilingualText>({ da: '', ps: '', en: '' });
  const [description, setDescription] = useState<MultilingualText>({ da: '', ps: '', en: '' });
  const [targetAudience, setTargetAudience] = useState<MultilingualText>({ da: '', ps: '', en: '' });

  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Layers');
  const [featuresStr, setFeaturesStr] = useState('');
  const [pricingInfo, setPricingInfo] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cms/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (err) {
      toast.error('خطا در دریافت لیست خدمات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item?: ServiceItemData) => {
    if (item) {
      setEditingService(item);
      setTitle(normalizeMultilingual(item.title));
      setSummary(normalizeMultilingual(item.summary));
      setDescription(normalizeMultilingual(item.description));
      setTargetAudience(normalizeMultilingual(item.targetAudience));
      setSlug(item.slug);
      setIcon(item.icon || 'Layers');
      setFeaturesStr((item.features || []).join('\n'));
      setPricingInfo(item.pricingInfo || '');
      setOrder(item.order || 0);
      setIsActive(item.isActive !== false);
    } else {
      setEditingService(null);
      setTitle({ da: '', ps: '', en: '' });
      setSummary({ da: '', ps: '', en: '' });
      setDescription({ da: '', ps: '', en: '' });
      setTargetAudience({
        da: 'کسب‌وکارها، شرکت‌ها و فریلنسرها',
        ps: 'سوداګرۍ، شرکتونه او فریلنسران',
        en: 'Enterprises, Companies and Freelancers',
      });
      setSlug('');
      setIcon('Layers');
      setFeaturesStr('');
      setPricingInfo('تماس برای استعلام یا پلن PRO');
      setOrder(services.length + 1);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  // Master translate for service
  const handleAutoTranslateAll = async () => {
    if (!title.da && !summary.da) {
      toast.error('لطفاً ابتدا عنوان یا خلاصه خدمت را به زبان دری وارد نمایید.');
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
            description: description.da,
            targetAudience: targetAudience.da,
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
        if (data.ps?.description || data.en?.description) {
          setDescription({ ...description, ps: data.ps?.description || description.ps, en: data.en?.description || description.en });
        }
        if (data.ps?.targetAudience || data.en?.targetAudience) {
          setTargetAudience({ ...targetAudience, ps: data.ps?.targetAudience || targetAudience.ps, en: data.en?.targetAudience || targetAudience.en });
        }
        toast.success('✨ تمام فیلدهای خدمت به پشتو و انگلیسی ترجمه شدند!');
      }
    } catch {
      toast.error('خطای شبکه در ترجمه خودکار');
    } finally {
      setIsTranslatingAll(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.da.trim() || !summary.da.trim()) {
      toast.error('عنوان و خلاصه خدمت به زبان دری الزامی هستند');
      return;
    }

    const payload = {
      id: editingService?._id,
      title,
      slug: slug.trim() || title.da.toLowerCase().replace(/[\s\W-]+/g, '-'),
      summary,
      description: description.da ? description : summary,
      icon: icon.trim() || 'Layers',
      features: featuresStr
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      targetAudience,
      pricingInfo: pricingInfo.trim(),
      order: Number(order) || 0,
      isActive,
    };

    setIsSaving(true);
    try {
      const method = editingService?._id ? 'PUT' : 'POST';
      const res = await fetch('/api/cms/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingService?._id ? 'خدمت با موفقیت ویرایش شد' : 'خدمت جدید اضافه شد');
        setIsModalOpen(false);
        fetchServices();
      } else {
        toast.error(data.message || 'خطا در ثبت خدمت');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف خدمت «${name}» اطمینان دارید؟`)) return;

    try {
      const res = await fetch(`/api/cms/services?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`خدمت «${name}» حذف گردید.`);
        fetchServices();
      } else {
        toast.error(data.message || 'خطا در حذف');
      }
    } catch (err) {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              مدیریت سه‌زبانه خدمات شرکت (Multilingual Services)
            </h1>
            <Badge variant="cyan" className="font-outfit text-xs">
              CMS 3-LANG
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            تعریف و ویرایش سه‌زبانه سبد خدمات، راهکارهای سازمانی، قیمت‌ها و ویژگی‌ها به زبان‌های دری، پشتو و انگلیسی
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => handleOpenModal()}
            size="sm"
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن خدمت جدید</span>
          </Button>

          <Button
            onClick={fetchServices}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="h-10 px-3 rounded-xl border-border bg-card"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Services Table */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="text-xs">در حال بارگذاری لیست خدمات...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="text-sm font-bold text-foreground">هیچ خدمتی یافت نشد</h3>
            <p className="text-xs text-muted-foreground mt-1">
              جهت اضافه کردن خدمت نخست روی دکمه افزودن خدمت جدید کلیک کنید.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs">ترتیب</TableHead>
                  <TableHead className="text-right font-bold text-xs">عنوان خدمت</TableHead>
                  <TableHead className="text-right font-bold text-xs">پوشش زبان</TableHead>
                  <TableHead className="text-right font-bold text-xs">مخاطبان هدف</TableHead>
                  <TableHead className="text-right font-bold text-xs">تعرفه</TableHead>
                  <TableHead className="text-right font-bold text-xs">وضعیت</TableHead>
                  <TableHead className="text-center font-bold text-xs">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((item) => {
                  const titleDa = getLocalizedText(item.title, 'da');
                  const titlePs = getLocalizedText(item.title, 'ps');
                  const titleEn = getLocalizedText(item.title, 'en');
                  const summaryDa = getLocalizedText(item.summary, 'da');
                  const audienceDa = getLocalizedText(item.targetAudience, 'da');

                  return (
                    <TableRow key={item._id} className="border-border hover:bg-muted/40 transition-colors">
                      <TableCell className="font-outfit text-xs font-bold text-muted-foreground">
                        #{item.order}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            <span>{titleDa}</span>
                            <span className="text-[10px] text-muted-foreground font-outfit" dir="ltr">
                              /{item.slug}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{summaryDa}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${titleDa ? 'bg-cyan-500/15 text-cyan-500' : 'bg-muted text-muted-foreground'}`}>
                            🇦🇫 DA
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${titlePs && titlePs !== titleDa ? 'bg-amber-500/15 text-amber-500' : 'bg-muted text-muted-foreground opacity-50'}`}>
                            🇦🇫 PS
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${titleEn && titleEn !== titleDa ? 'bg-purple-500/15 text-purple-400' : 'bg-muted text-muted-foreground opacity-50'}`}>
                            🇬🇧 EN
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {audienceDa}
                      </TableCell>

                      <TableCell className="text-xs font-bold font-outfit text-emerald-500">
                        {item.pricingInfo}
                      </TableCell>

                      <TableCell>
                        {item.isActive ? (
                          <Badge variant="success" className="text-[10px] py-0 px-2 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>فعال</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-2 flex items-center gap-1 w-fit text-rose-500">
                            <XCircle className="w-3 h-3" />
                            <span>غیرفعال</span>
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(item)}
                            className="h-8 px-2 text-[11px] rounded-lg text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/10"
                          >
                            <Edit2 className="w-3.5 h-3.5 ml-1" />
                            <span>ویرایش</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => item._id && handleDelete(item._id, titleDa)}
                            className="h-8 px-2 text-[11px] rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
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

      {/* Edit / Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-rose-500" />
                <span>{editingService ? 'ویرایش سه‌زبانه خدمت' : 'افزودن خدمت سه‌زبانه جدید'}</span>
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
              عنوان، خلاصه، شرح و مخاطبان خدمت را وارد نمایید یا با دکمه ترجمه هوشمند تکمیل کنید.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            {/* Title */}
            <MultilingualInput
              label="عنوان خدمت"
              value={title}
              onChange={setTitle}
              placeholder={{
                da: 'مثال: طراحی و تولید کارت‌های هوشمند لمسی NFC',
                ps: 'د سمارټ لمسي NFC ویزټ کارټونو جوړول',
                en: 'Design & Production of Smart Contactless NFC Cards',
              }}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">شناسه آدرس (Slug) *</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="nfc-cards"
                  className="h-10 rounded-xl text-xs font-outfit"
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">تعرفه / قیمت</label>
                <Input
                  value={pricingInfo}
                  onChange={(e) => setPricingInfo(e.target.value)}
                  placeholder="شروع از ۱,۵۰۰ افغانی یا پلن PRO"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Summary */}
            <MultilingualTextarea
              label="خلاصه کوتاه خدمت"
              value={summary}
              onChange={setSummary}
              placeholder={{
                da: 'توضیح کوتاه یک یا دو خطی در کارت خدمات...',
                ps: 'د خدمت لنډ معلومات...',
                en: 'Short summary of the service...',
              }}
              rows={2}
              required
            />

            {/* Description */}
            <MultilingualTextarea
              label="شرح کامل خدمت"
              value={description}
              onChange={setDescription}
              placeholder={{
                da: 'توضیحات جامع درباره مزایا و جزئیات خدمت...',
                ps: 'د خدمت بشپړ جزئیات او ځانګړنې...',
                en: 'Comprehensive description of the service...',
              }}
              rows={3}
            />

            {/* Target Audience */}
            <MultilingualInput
              label="مخاطبان هدف"
              value={targetAudience}
              onChange={setTargetAudience}
              placeholder={{
                da: 'شرکت‌ها، سازمان‌ها، صرافی‌ها...',
                ps: 'شرکتونه، سازمانونه، صرافان...',
                en: 'Companies, organizations, currency exchanges...',
              }}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                ویژگی‌های کلیدی (هر مورد در یک خط)
              </label>
              <Textarea
                value={featuresStr}
                onChange={(e) => setFeaturesStr(e.target.value)}
                rows={3}
                placeholder="چیپ NTAG216 اصلی&#10;چاپ دو رو با روکش UV&#10;پنل مدیریت اختصاصی"
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold cursor-pointer text-foreground">
                  نمایش عمومی در صفحه خدمات
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">ترتیب نمایش:</span>
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-20 h-8 rounded-lg text-xs font-outfit"
                />
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
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
                disabled={isSaving}
                className="h-10 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>ذخیره خدمت سه‌زبانه</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
