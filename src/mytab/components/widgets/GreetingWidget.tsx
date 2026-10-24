import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ThemeSettings } from '../../../types';
import { ResolvedTextColors } from '../../../utils/wallpaperAnalyzer';
import { t } from '../../../utils/i18n';

interface GreetingWidgetProps {
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  width?: number;
  height?: number;
}

export const GreetingWidget: React.FC<GreetingWidgetProps> = React.memo(({
  settings,
  resolvedColors,
  isLight,
  width: propWidth,
  height: propHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: propWidth || 280, h: propHeight || 32 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    const lang = settings.language;
    const custom = settings.customGreetings;

    let periodKey: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
    let defaultKey: 'greetingMorning' | 'greetingNoon' | 'greetingAfternoon' | 'greetingEvening' | 'greetingNight';

    if (h >= 5 && h < 11) {
      periodKey = 'morning';
      defaultKey = 'greetingMorning';
    } else if (h >= 11 && h < 13) {
      periodKey = 'noon';
      defaultKey = 'greetingNoon';
    } else if (h >= 13 && h < 18) {
      periodKey = 'afternoon';
      defaultKey = 'greetingAfternoon';
    } else if (h >= 18 && h < 23) {
      periodKey = 'evening';
      defaultKey = 'greetingEvening';
    } else {
      periodKey = 'night';
      defaultKey = 'greetingNight';
    }

    if (custom && Array.isArray(custom[periodKey]) && custom[periodKey]!.length > 0) {
      const pool = custom[periodKey]!.filter(Boolean);
      if (pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
      }
    }

    return t(defaultKey, lang);
  }, [settings.language, settings.customGreetings]);

  // Dynamic font sizing matching ClockHeader: text-xs (<768px: 12px) md:text-sm (>=768px: 14px), font-light tracking-wide
  const baseSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 12 : 14;
  const scaledSize = dims.h > 46 ? Math.round(baseSize * (dims.h / 40)) : baseSize;
  const fontSize = Math.max(11, Math.min(scaledSize, Math.round(dims.w / Math.max(1, greeting.length * 0.9))));

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center select-none pointer-events-none px-0.5"
      style={{
        color: resolvedColors?.greeting || (isLight ? '#475569' : '#cbd5e1'),
        textShadow: resolvedColors?.greetingShadow,
      }}
    >
      <span
        className="font-light tracking-wide text-center leading-tight truncate"
        style={{ fontSize: `${fontSize}px` }}
      >
        {greeting}
      </span>
    </div>
  );
});

GreetingWidget.displayName = 'GreetingWidget';
