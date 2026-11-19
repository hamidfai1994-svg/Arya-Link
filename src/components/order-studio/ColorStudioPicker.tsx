'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  BgConfig,
  ColorStudioTab,
  GRADIENT_PRESETS,
  SOLID_PRESETS,
} from './types';

interface ColorStudioPickerProps {
  idPrefix: string;
  bg: BgConfig;
  onChange: (nextBg: BgConfig, options?: { animateStage?: boolean; smartAccentHex?: string }) => void;
}

export function ColorStudioPicker({ idPrefix, bg, onChange }: ColorStudioPickerProps) {
  const { language, t } = useLanguage();

  const tabs: Array<{ id: ColorStudioTab; label: string }> = [
    { id: 'solid', label: t('orderStudio.tabSolid', 'رنگ آماده') },
    { id: 'custom', label: t('orderStudio.tabCustom', 'رنگ دلخواه') },
    { id: 'grad', label: t('orderStudio.tabGrad', 'گرادیانت آماده') },
    { id: 'customGrad', label: t('orderStudio.tabCustomGrad', 'گرادیانت دلخواه') },
  ];

  const handleTabChange = (nextTab: ColorStudioTab) => {
    onChange({ ...bg, tab: nextTab }, { animateStage: true });
  };

  return (
    <div className="color-studio">
      <div className="cs-tabs" role="tablist" aria-label={t('orderStudio.lblFrontBg', 'رنگ و گرادیانت')}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={bg.tab === tab.id}
            className={`cs-tab ${bg.tab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="cs-body">
        {bg.tab === 'solid' && (
          <div className="swatch-grid">
            {SOLID_PRESETS.map((preset) => {
              const isActive = bg.solidColor.toLowerCase() === preset.color.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`swatch-chip ${isActive ? 'active' : ''}`}
                  style={{ background: preset.color }}
                  onClick={() =>
                    onChange(
                      { ...bg, tab: 'solid', solidColor: preset.color },
                      { animateStage: true, smartAccentHex: preset.accent }
                    )
                  }
                >
                  <span>{preset.name[language] || preset.name.da}</span>
                </button>
              );
            })}
          </div>
        )}

        {bg.tab === 'custom' && (
          <label className="picker-pill" htmlFor={`${idPrefix}-custom-solid`}>
            <input
              id={`${idPrefix}-custom-solid`}
              type="color"
              value={bg.solidColor}
              onChange={(e) =>
                onChange(
                  { ...bg, tab: 'custom', solidColor: e.target.value },
                  { animateStage: false }
                )
              }
              onBlur={() => onChange({ ...bg }, { animateStage: true })}
            />
            <code>{bg.solidColor.toUpperCase()}</code>
          </label>
        )}

        {bg.tab === 'grad' && (
          <div className="swatch-grid">
            {GRADIENT_PRESETS.map((preset) => {
              const css =
                preset.type === 'radial'
                  ? `radial-gradient(circle, ${preset.c1}, ${preset.c2})`
                  : `linear-gradient(${preset.angle}deg, ${preset.c1}, ${preset.c2})`;
              const isActive =
                bg.c1.toLowerCase() === preset.c1.toLowerCase() &&
                bg.c2.toLowerCase() === preset.c2.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`swatch-chip ${isActive ? 'active' : ''}`}
                  style={{ background: css }}
                  onClick={() =>
                    onChange(
                      {
                        ...bg,
                        tab: 'grad',
                        gradType: preset.type,
                        c1: preset.c1,
                        c2: preset.c2,
                        angle: preset.angle,
                      },
                      { animateStage: true, smartAccentHex: preset.accent }
                    )
                  }
                >
                  <span>{preset.name[language] || preset.name.da}</span>
                </button>
              );
            })}
          </div>
        )}

        {bg.tab === 'customGrad' && (
          <div>
            <div className="color-chips-row">
              <label className="picker-pill" htmlFor={`${idPrefix}-grad-c1`}>
                <input
                  id={`${idPrefix}-grad-c1`}
                  type="color"
                  value={bg.c1}
                  onChange={(e) =>
                    onChange({ ...bg, tab: 'customGrad', c1: e.target.value }, { animateStage: false })
                  }
                />
                <code>{bg.c1.toUpperCase()}</code>
              </label>

              <label className="picker-pill" htmlFor={`${idPrefix}-grad-c2`}>
                <input
                  id={`${idPrefix}-grad-c2`}
                  type="color"
                  value={bg.c2}
                  onChange={(e) =>
                    onChange({ ...bg, tab: 'customGrad', c2: e.target.value }, { animateStage: false })
                  }
                />
                <code>{bg.c2.toUpperCase()}</code>
              </label>

              <button
                type="button"
                className="hud-btn"
                style={{ padding: '5px 11px', fontSize: 11 }}
                onClick={() =>
                  onChange(
                    {
                      ...bg,
                      tab: 'customGrad',
                      gradType: bg.gradType === 'linear' ? 'radial' : 'linear',
                    },
                    { animateStage: false }
                  )
                }
              >
                {bg.gradType === 'radial'
                  ? t('orderStudio.lblRadial', 'شعاعی')
                  : t('orderStudio.lblLinear', 'خطی')}
              </button>
            </div>

            {bg.gradType !== 'radial' && (
              <div className="angle-row">
                <label htmlFor={`${idPrefix}-grad-angle`}>
                  {t('orderStudio.lblAngle', 'زاویه:')}
                </label>
                <input
                  id={`${idPrefix}-grad-angle`}
                  type="range"
                  min={0}
                  max={360}
                  value={bg.angle}
                  onChange={(e) =>
                    onChange(
                      { ...bg, tab: 'customGrad', angle: Number(e.target.value) },
                      { animateStage: false }
                    )
                  }
                />
                <code style={{ fontFamily: 'ui-monospace, monospace' }}>{bg.angle}°</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ColorStudioPicker;
