'use client';

import React from 'react';
import { CreditCard, Layers, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { CollapsibleSection } from '@/components/admin/CollapsibleSection';
import { MultilingualInput } from '@/components/admin/MultilingualInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  DEFAULT_NFC_CARD_MATERIALS,
  DEFAULT_NFC_QTY_DISCOUNTS,
  INfcCardMaterialConfig,
  INfcQtyDiscountTier,
} from '@/models/systemSettings.model';

interface NfcMaterialsSettingsAccordionProps {
  materials: INfcCardMaterialConfig[];
  qtyDiscounts: INfcQtyDiscountTier[];
  onChangeMaterials: (next: INfcCardMaterialConfig[]) => void;
  onChangeQtyDiscounts: (next: INfcQtyDiscountTier[]) => void;
}

export function NfcMaterialsSettingsAccordion({
  materials,
  qtyDiscounts,
  onChangeMaterials,
  onChangeQtyDiscounts,
}: NfcMaterialsSettingsAccordionProps) {
  const { t } = useLanguage();

  const updateMaterial = (index: number, patch: Partial<INfcCardMaterialConfig>) => {
    const next = materials.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChangeMaterials(next);
  };

  const handleAddMaterial = () => {
    const newItem: INfcCardMaterialConfig = {
      id: `custom-mat-${Date.now().toString().slice(-4)}`,
      name: {
        fa: 'متریال جدید کارت NFC',
        ps: 'د NFC کارټ نوی جنس',
        en: 'New NFC Material',
      },
      priceWithPrint: 950,
      isAvailable: true,
      metalness: 0.25,
      roughness: 0.4,
      clearcoat: 0.35,
      envMapIntensity: 0.25,
      brushed: false,
    };
    onChangeMaterials([...materials, newItem]);
  };

  const handleRemoveMaterial = (index: number) => {
    if (materials.length <= 1) return;
    onChangeMaterials(materials.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, patch: Partial<INfcQtyDiscountTier>) => {
    const next = qtyDiscounts.map((tier, i) => (i === index ? { ...tier, ...patch } : tier));
    onChangeQtyDiscounts(next);
  };

  const handleResetDefaults = () => {
    onChangeMaterials(DEFAULT_NFC_CARD_MATERIALS.map((m) => ({ ...m, name: { ...m.name } })));
    onChangeQtyDiscounts(DEFAULT_NFC_QTY_DISCOUNTS.map((d) => ({ ...d })));
  };

  const availableCount = materials.filter((m) => m.isAvailable !== false).length;

  return (
    <CollapsibleSection
      title={t('admin.nfcMaterials.accordionTitle', 'متریال‌ها و قیمت چاپ کارت NFC')}
      subtitle={t(
        'admin.nfcMaterials.accordionSub',
        'تعیین قیمت نهایی هر متریال با چاپ، کنترل موجودی (موجود / ناموجود)، تنظیمات رندر سه‌بعدی و تخفیف‌های تعدادی'
      )}
      icon={CreditCard}
      badge={`${availableCount}/${materials.length} ${t('admin.nfcMaterials.availableShort', 'موجود')}`}
      defaultOpen={false}
    >
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border">
          <div className="text-xs text-muted-foreground leading-relaxed">
            {t(
              'admin.nfcMaterials.helperNote',
              'تغییرات پس از کلیک روی «ذخیره کلیه تغییرات پلتفرم» بلافاصله در استودیوی سه‌بعدی صفحه سفارش کارت اعمال می‌شوند.'
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="h-9 rounded-xl text-xs gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('admin.nfcMaterials.resetDefaults', 'بازنشانی پیش‌فرض')}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAddMaterial}
              className="h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('admin.nfcMaterials.addMaterial', 'افزودن متریال جدید')}</span>
            </Button>
          </div>
        </div>

        {/* Materials List */}
        <div className="space-y-4">
          {materials.map((mat, idx) => (
            <div
              key={mat.id || idx}
              className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 ${
                mat.isAvailable
                  ? 'bg-muted/25 border-border'
                  : 'bg-rose-500/5 border-rose-500/30 opacity-85'
              }`}
            >
              {/* Material Header: ID + Status Switch + Remove */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {mat.name?.fa || mat.id}
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {mat.id}
                  </Badge>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      mat.isAvailable
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {mat.isAvailable
                      ? t('admin.nfcMaterials.statusAvailable', 'موجود و فعال')
                      : t('admin.nfcMaterials.statusUnavailable', 'ناموجود')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('admin.nfcMaterials.availabilityToggle', 'وضعیت موجودی:')}
                    </span>
                    <Switch
                      checked={mat.isAvailable !== false}
                      onCheckedChange={(checked) => updateMaterial(idx, { isAvailable: checked })}
                    />
                  </div>
                  {materials.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMaterial(idx)}
                      className="h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg cursor-pointer"
                      aria-label={t('admin.nfcMaterials.deleteMaterial', 'حذف متریال')}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Trilingual Name + Price With Print */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-8">
                  <MultilingualInput
                    label={t('admin.nfcMaterials.nameLabel', 'نام سه‌زبانه متریال (دری، پشتو، انگلیسی)')}
                    value={{
                      fa: mat.name?.fa || '',
                      en: mat.name?.en || '',
                      ps: mat.name?.ps || '',
                    }}
                    onChange={(val) =>
                      updateMaterial(idx, {
                        name: { fa: val.fa, en: val.en, ps: val.ps },
                      })
                    }
                  />
                </div>

                <div className="lg:col-span-4 space-y-2">
                  <label
                    htmlFor={`nfc-mat-price-${idx}`}
                    className="text-xs font-bold text-foreground block"
                  >
                    {t('admin.nfcMaterials.priceWithPrintLabel', 'قیمت نهایی هر عدد با چاپ (AFN)')}
                  </label>
                  <Input
                    id={`nfc-mat-price-${idx}`}
                    type="number"
                    min={0}
                    step={10}
                    value={mat.priceWithPrint}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateMaterial(idx, {
                        priceWithPrint: Number.isFinite(val) && val >= 0 ? Math.round(val) : 0,
                      });
                    }}
                    className="font-mono text-sm font-bold rounded-xl h-10"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    {t('admin.nfcMaterials.priceHint', 'به افغانی — شامل هزینه چاپ دوطرفه و پروگرام NFC')}
                  </span>
                </div>
              </div>

              {/* 3D Material Rendering Specs */}
              <div className="pt-3 border-t border-border/50 space-y-2.5">
                <div className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" aria-hidden="true" />
                  <span>{t('admin.nfcMaterials.renderSpecsTitle', 'مشخصات رندر سه‌بعدی متریال (Three.js)')}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                  <div>
                    <label
                      htmlFor={`mat-metalness-${idx}`}
                      className="text-[10px] font-semibold text-muted-foreground block mb-1"
                    >
                      Metalness (0–1)
                    </label>
                    <Input
                      id={`mat-metalness-${idx}`}
                      type="number"
                      min={0}
                      max={1}
                      step={0.02}
                      value={mat.metalness}
                      onChange={(e) => updateMaterial(idx, { metalness: Number(e.target.value) || 0 })}
                      className="font-mono text-xs h-9 rounded-xl"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`mat-roughness-${idx}`}
                      className="text-[10px] font-semibold text-muted-foreground block mb-1"
                    >
                      Roughness (0–1)
                    </label>
                    <Input
                      id={`mat-roughness-${idx}`}
                      type="number"
                      min={0}
                      max={1}
                      step={0.02}
                      value={mat.roughness}
                      onChange={(e) => updateMaterial(idx, { roughness: Number(e.target.value) || 0 })}
                      className="font-mono text-xs h-9 rounded-xl"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`mat-clearcoat-${idx}`}
                      className="text-[10px] font-semibold text-muted-foreground block mb-1"
                    >
                      Clearcoat (0–1)
                    </label>
                    <Input
                      id={`mat-clearcoat-${idx}`}
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={mat.clearcoat}
                      onChange={(e) => updateMaterial(idx, { clearcoat: Number(e.target.value) || 0 })}
                      className="font-mono text-xs h-9 rounded-xl"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`mat-env-${idx}`}
                      className="text-[10px] font-semibold text-muted-foreground block mb-1"
                    >
                      Env Reflection (0–1)
                    </label>
                    <Input
                      id={`mat-env-${idx}`}
                      type="number"
                      min={0}
                      max={1.5}
                      step={0.05}
                      value={mat.envMapIntensity ?? 0.15}
                      onChange={(e) =>
                        updateMaterial(idx, { envMapIntensity: Number(e.target.value) || 0 })
                      }
                      className="font-mono text-xs h-9 rounded-xl"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 px-3 h-9 rounded-xl bg-muted/40 border border-border">
                    <span className="text-[10px] font-semibold text-foreground">
                      {t('admin.nfcMaterials.brushedTexture', 'بافت برس‌خورده')}
                    </span>
                    <Switch
                      checked={Boolean(mat.brushed)}
                      onCheckedChange={(checked) => updateMaterial(idx, { brushed: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quantity Discounts Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-muted/25 border border-border space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {t('admin.nfcMaterials.qtyDiscountsTitle', 'پلکان تخفیف‌های تعدادی')}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t(
                  'admin.nfcMaterials.qtyDiscountsSub',
                  'درصد تخفیف خودکار براساس تعداد کارت‌های انتخاب‌شده در مرحله تسویه حساب'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {qtyDiscounts.map((tier, tIdx) => (
              <div
                key={tIdx}
                className="p-3 rounded-xl bg-background/60 border border-border space-y-2"
              >
                <div>
                  <label
                    htmlFor={`qty-tier-count-${tIdx}`}
                    className="text-[10px] text-muted-foreground block mb-1"
                  >
                    {t('admin.nfcMaterials.tierMinQty', 'حداقل تعداد کارت')}
                  </label>
                  <Input
                    id={`qty-tier-count-${tIdx}`}
                    type="number"
                    min={1}
                    value={tier.qty}
                    onChange={(e) =>
                      updateTier(tIdx, { qty: Math.max(1, Math.round(Number(e.target.value) || 1)) })
                    }
                    className="font-mono text-xs h-8 rounded-lg"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`qty-tier-disc-${tIdx}`}
                    className="text-[10px] text-muted-foreground block mb-1"
                  >
                    {t('admin.nfcMaterials.tierDiscountPct', 'درصد تخفیف (%)')}
                  </label>
                  <Input
                    id={`qty-tier-disc-${tIdx}`}
                    type="number"
                    min={0}
                    max={90}
                    value={tier.disc}
                    onChange={(e) =>
                      updateTier(tIdx, {
                        disc: Math.max(0, Math.min(90, Math.round(Number(e.target.value) || 0))),
                      })
                    }
                    className="font-mono text-xs h-8 rounded-lg"
                    dir="ltr"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}

export default NfcMaterialsSettingsAccordion;
