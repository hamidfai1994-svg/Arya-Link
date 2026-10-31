'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  Plus,
  Trash2,
  MapPin,
  RefreshCw,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultilingualInput } from '@/components/admin/MultilingualInput';
import { MultilingualTextarea } from '@/components/admin/MultilingualTextarea';
import { MultilingualText, normalizeMultilingual } from '@/lib/i18n/multilingual';
import { toast } from 'sonner';

interface BranchOffice {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  manager: string;
  isMainBranch?: boolean;
}

interface StatItem {
  label: string;
  value: string;
}

export default function AdminCompanyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  // Multilingual fields
  const [companyName, setCompanyName] = useState<MultilingualText>({ da: '', ps: '', en: '' });
  const [slogan, setSlogan] = useState<MultilingualText>({ da: '', ps: '', en: '' });
  const [aboutStory, setAboutStory] = useState<MultilingualText>({ da: '', ps: '', en: '' });
  const [mission, setMission] = useState<MultilingualText>({ da: '', ps: '', en: '' });
  const [vision, setVision] = useState<MultilingualText>({ da: '', ps: '', en: '' });

  const [headquarters, setHeadquarters] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [branches, setBranches] = useState<BranchOffice[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cms/company');
      const data = await res.json();
      if (data.success && data.company) {
        const c = data.company;
        setCompanyName(normalizeMultilingual(c.companyName, 'شرکت فناوری آریا لینک'));
        setSlogan(normalizeMultilingual(c.slogan, 'پیشگام در هویت دیجیتال و کارت‌های هوشمند NFC در افغانستان'));
        setAboutStory(normalizeMultilingual(c.aboutStory));
        setMission(normalizeMultilingual(c.mission));
        setVision(normalizeMultilingual(c.vision));
        setHeadquarters(c.headquarters || '');
        setSupportPhone(c.supportPhone || '');
        setSupportEmail(c.supportEmail || '');
        setBranches(c.branches || []);
        setStats(c.stats || []);
      }
    } catch (err) {
      toast.error('خطا در دریافت اطلاعات شرکت');
    } finally {
      setIsLoading(false);
    }
  };

  // Master translate for all company texts
  const handleAutoTranslateAll = async () => {
    if (!companyName.da && !aboutStory.da) {
      toast.error('لطفاً ابتدا فیلدهای زبان دری را وارد نمایید.');
      return;
    }

    setIsTranslatingAll(true);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            companyName: companyName.da,
            slogan: slogan.da,
            aboutStory: aboutStory.da,
            mission: mission.da,
            vision: vision.da,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.ps?.companyName || data.en?.companyName) {
          setCompanyName({ ...companyName, ps: data.ps?.companyName || companyName.ps, en: data.en?.companyName || companyName.en });
        }
        if (data.ps?.slogan || data.en?.slogan) {
          setSlogan({ ...slogan, ps: data.ps?.slogan || slogan.ps, en: data.en?.slogan || slogan.en });
        }
        if (data.ps?.aboutStory || data.en?.aboutStory) {
          setAboutStory({ ...aboutStory, ps: data.ps?.aboutStory || aboutStory.ps, en: data.en?.aboutStory || aboutStory.en });
        }
        if (data.ps?.mission || data.en?.mission) {
          setMission({ ...mission, ps: data.ps?.mission || mission.ps, en: data.en?.mission || mission.en });
        }
        if (data.ps?.vision || data.en?.vision) {
          setVision({ ...vision, ps: data.ps?.vision || vision.ps, en: data.en?.vision || vision.en });
        }
        toast.success('✨ اطلاعات شرکت با موفقیت به پشتو و انگلیسی ترجمه شدند!');
      }
    } catch {
      toast.error('خطای شبکه در ترجمه خودکار');
    } finally {
      setIsTranslatingAll(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/cms/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          slogan,
          aboutStory,
          mission,
          vision,
          headquarters,
          supportPhone,
          supportEmail,
          branches,
          stats,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('اطلاعات سه‌زبانه شرکت و نمایندگی‌ها با موفقیت ذخیره شد');
      } else {
        toast.error(data.message || 'خطا در ذخیره‌سازی');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBranch = () => {
    const newBranch: BranchOffice = {
      id: `branch_${Date.now()}`,
      name: 'نمایندگی ولایت جدید',
      city: 'کابل',
      address: 'آدرس نمایندگی...',
      phone: '+93 ',
      manager: 'نام مدیر شعبه',
      isMainBranch: false,
    };
    setBranches([...branches, newBranch]);
  };

  const handleUpdateBranch = (index: number, field: keyof BranchOffice, val: any) => {
    const updated = [...branches];
    updated[index] = { ...updated[index], [field]: val };
    setBranches(updated);
  };

  const handleRemoveBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              درباره شرکت و نمایندگی‌های سه‌زبانه (Multilingual Company CMS)
            </h1>
            <Badge variant="cyan" className="font-sans text-xs">
              CMS 3-LANG
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            ویرایش سه‌زبانه داستان برند، اهداف، رسالت، اطلاعات تماس و دفاتر نمایندگی فعال در ولایات افغانستان
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            onClick={handleAutoTranslateAll}
            disabled={isTranslatingAll || isLoading}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {isTranslatingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>ترجمه هوشمند تمام مشخصات 🪄</span>
          </Button>

          <Button
            onClick={fetchCompanyData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="h-10 px-3 rounded-xl border-border bg-card"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>ذخیره تغییرات</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <span className="text-xs">در حال بارگذاری اطلاعات شرکت...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Main Multilingual Info */}
          <Card className="p-6 rounded-3xl border-border bg-card/90 space-y-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border">
              <Building className="w-4 h-4 text-rose-500" />
              <span>مشخصات سه‌زبانه، شعار و هویت برند</span>
            </h2>

            <MultilingualInput
              label="نام رسمی شرکت"
              value={companyName}
              onChange={setCompanyName}
              placeholder={{
                da: 'شرکت فناوری آریا لینک (Arya Link Tech Ltd)',
                ps: 'د آریا لینک ټکنالوژۍ شرکت',
                en: 'Arya Link Tech Ltd',
              }}
              required
            />

            <MultilingualInput
              label="شعار برند (Slogan)"
              value={slogan}
              onChange={setSlogan}
              placeholder={{
                da: 'پیشگام در هویت دیجیتال و کارت‌های هوشمند NFC در افغانستان',
                ps: 'په افغانستان کې د سمارټ NFC او ډیجیټل هویت مخکښ',
                en: 'Pioneering Smart NFC Digital Identity in Afghanistan',
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">دفتر مرکزی</label>
                <Input
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">تلفن پشتیبانی مرکزی</label>
                <Input
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="h-10 rounded-xl text-xs font-sans"
                  dir="ltr"
                />
              </div>
            </div>

            <MultilingualTextarea
              label="داستان برند و درباره ما (About Story)"
              value={aboutStory}
              onChange={setAboutStory}
              placeholder={{
                da: 'آریا لینک با هدف حذف کارت‌های ویزیت کاغذی و مدرن‌سازی ارتباطات تجاری در افغانستان راه‌اندازی شده است...',
                ps: 'آریا لینک په افغانستان کې د کاغذي ویزټ کارټونو د پای ته رسولو په موخه...',
                en: 'Arya Link was founded to eliminate paper business cards and modernize networking in Afghanistan...',
              }}
              rows={4}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MultilingualTextarea
                label="ماموریت شرکت (Mission)"
                value={mission}
                onChange={setMission}
                rows={3}
              />

              <MultilingualTextarea
                label="چشم‌انداز آینده (Vision)"
                value={vision}
                onChange={setVision}
                rows={3}
              />
            </div>
          </Card>

          {/* Branch Offices Section */}
          <Card className="p-6 rounded-3xl border-border bg-card/90 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>دفاتر نمایندگی در ولایات افغانستان ({branches.length} شعبه)</span>
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  دفاتر توزیع کارت NFC، پشتیبانی حضوری و عقد قرارداد سازمانی
                </p>
              </div>

              <Button
                type="button"
                onClick={handleAddBranch}
                size="sm"
                className="h-9 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن شعبه جدید</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {branches.map((b, idx) => (
                <div
                  key={b.id || idx}
                  className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-sans text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span>{b.name || 'شعبه بدون نام'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(idx)}
                      className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                      title="حذف شعبه"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-muted-foreground">نام شعبه:</label>
                      <Input
                        value={b.name}
                        onChange={(e) => handleUpdateBranch(idx, 'name', e.target.value)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">شهر / ولایت:</label>
                      <Input
                        value={b.city}
                        onChange={(e) => handleUpdateBranch(idx, 'city', e.target.value)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">آدرس کامل:</label>
                    <Input
                      value={b.address}
                      onChange={(e) => handleUpdateBranch(idx, 'address', e.target.value)}
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-muted-foreground">تلفن تماس:</label>
                      <Input
                        value={b.phone}
                        onChange={(e) => handleUpdateBranch(idx, 'phone', e.target.value)}
                        className="h-8 rounded-lg text-xs font-sans"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">مدیر شعبه:</label>
                      <Input
                        value={b.manager}
                        onChange={(e) => handleUpdateBranch(idx, 'manager', e.target.value)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
