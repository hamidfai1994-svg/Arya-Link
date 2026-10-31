'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MultilingualText } from '@/lib/i18n/multilingual';
import { toast } from 'sonner';

interface MultilingualTextareaProps {
  label: string;
  value: MultilingualText;
  onChange: (val: MultilingualText) => void;
  placeholder?: {
    da?: string;
    ps?: string;
    en?: string;
  };
  rows?: number;
  required?: boolean;
}

export function MultilingualTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
}: MultilingualTextareaProps) {
  const [activeTab, setActiveTab] = useState<'da' | 'ps' | 'en'>('da');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!value.da || !value.da.trim()) {
      toast.error('لطفاً ابتدا متن زبان دری را وارد نمایید تا به پشتو و انگلیسی ترجمه شود.');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value.da }),
      });
      const data = await res.json();
      if (data.success) {
        onChange({
          ...value,
          ps: data.ps || value.ps,
          en: data.en || value.en,
        });
        toast.success('✨ متن با موفقیت به پشتو و انگلیسی ترجمه شد!');
      } else {
        toast.error(data.message || 'خطا در ترجمه خودکار');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور در ترجمه خودکار');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-1.5" dir="rtl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>

        <div className="flex items-center gap-1.5">
          {/* Language Switch Tabs */}
          <div className="flex items-center bg-muted/70 p-0.5 rounded-xl border border-border text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('da')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'da'
                  ? 'bg-background text-cyan-500 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇦🇫 دری
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ps')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'ps'
                  ? 'bg-background text-cyan-500 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇦🇫 پښتو
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-2.5 py-1 rounded-lg font-bold font-sans transition-all ${
                activeTab === 'en'
                  ? 'bg-background text-cyan-500 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          {/* Auto Translate Magic Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTranslate}
            disabled={isTranslating}
            className="h-7 px-2 text-[10px] rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-500 border border-cyan-500/30 font-bold flex items-center gap-1 transition-all"
            title="ترجمه خودکار از دری به پشتو و انگلیسی"
          >
            {isTranslating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3 text-cyan-500" />
            )}
            <span>ترجمه خودکار 🪄</span>
          </Button>
        </div>
      </div>

      {/* Textarea depending on active language */}
      {activeTab === 'da' && (
        <Textarea
          value={value.da || ''}
          onChange={(e) => onChange({ ...value, da: e.target.value })}
          placeholder={placeholder?.da || 'ورود متن توضیحات به زبان دری...'}
          rows={rows}
          className="rounded-xl text-xs bg-background leading-relaxed"
          required={required}
        />
      )}

      {activeTab === 'ps' && (
        <Textarea
          value={value.ps || ''}
          onChange={(e) => onChange({ ...value, ps: e.target.value })}
          placeholder={placeholder?.ps || 'پښتو تفصیلي متن دننه کړئ...'}
          rows={rows}
          className="rounded-xl text-xs bg-background leading-relaxed"
        />
      )}

      {activeTab === 'en' && (
        <Textarea
          value={value.en || ''}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          placeholder={placeholder?.en || 'Enter English description or details...'}
          rows={rows}
          className="rounded-xl text-xs bg-background font-sans text-left leading-relaxed"
          dir="ltr"
        />
      )}
    </div>
  );
}
export default MultilingualTextarea;
