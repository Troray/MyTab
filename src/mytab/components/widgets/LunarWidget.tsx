import React, { useState, useEffect, useRef } from 'react';
import { ThemeSettings } from '../../../types';
import { ResolvedTextColors } from '../../../utils/wallpaperAnalyzer';
import { getLunarDisplay } from '../../../utils/lunar';

interface LunarWidgetProps {
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  width?: number;
  height?: number;
}

export const LunarWidget: React.FC<LunarWidgetProps> = React.memo(({
  settings,
  resolvedColors,
  isLight,
  width: propWidth,
  height: propHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: propWidth || 200, h: propHeight || 36 });
  const [time, setTime] = useState(() => new Date());

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

  useEffect(() => {
    let lastDate = new Date().getDate();
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== lastDate) {
        lastDate = now.getDate();
        setTime(now);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const lunarText = getLunarDisplay(time);
  if (!lunarText) return null;

  // Dynamic font sizing matching ClockHeader: text-xs (<768px: 12px) md:text-sm (>=768px: 14px), font-normal
  const baseSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 12 : 14;
  const scaledSize = dims.h > 46 ? Math.round(baseSize * (dims.h / 40)) : baseSize;
  const fontSize = Math.max(11, Math.min(scaledSize, Math.round(dims.w / Math.max(1, lunarText.length * 0.9))));

  // Determine date shadow matching ClockHeader
  const dateShadowClass = resolvedColors
    ? resolvedColors.dateShadow
    : isLight
      ? settings.backgroundType === 'gradient'
        ? 'text-slate-700 drop-shadow-sm'
        : 'text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]'
      : 'text-white/90 drop-shadow';

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center select-none pointer-events-none px-0.5 ${dateShadowClass}`}
      style={{
        color: resolvedColors?.date || (isLight && settings.backgroundType === 'gradient' ? '#475569' : '#ffffff'),
        textShadow: resolvedColors?.dateShadow,
      }}
    >
      <span
        className="font-normal tracking-wide text-center leading-tight truncate"
        style={{ fontSize: `${fontSize}px` }}
      >
        {lunarText}
      </span>
    </div>
  );
});

LunarWidget.displayName = 'LunarWidget';
