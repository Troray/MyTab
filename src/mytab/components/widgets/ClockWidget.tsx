import React, { useState, useEffect, useRef } from 'react';
import { ThemeSettings } from '../../../types';
import { ResolvedTextColors } from '../../../utils/wallpaperAnalyzer';

interface ClockWidgetProps {
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  width?: number;
  height?: number;
}

export const ClockWidget: React.FC<ClockWidgetProps> = React.memo(({
  settings,
  resolvedColors,
  isLight,
  width: propWidth,
  height: propHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: propWidth || 320, h: propHeight || 90 });
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
    let lastMinute = new Date().getMinutes();
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextMinute = () => {
      const now = new Date();
      if (now.getMinutes() !== lastMinute) {
        lastMinute = now.getMinutes();
        setTime(now);
      }
      const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
      timerId = setTimeout(scheduleNextMinute, Math.max(100, msUntilNextMinute));
    };

    scheduleNextMinute();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (timerId) clearTimeout(timerId);
        const now = new Date();
        if (now.getMinutes() !== lastMinute) {
          lastMinute = now.getMinutes();
          setTime(now);
        }
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
        timerId = setTimeout(scheduleNextMinute, Math.max(100, msUntilNextMinute));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const is12h = settings.timeFormat === '12h';
  let displayHours = String(time.getHours()).padStart(2, '0');
  let ampm = '';

  if (is12h) {
    const h = time.getHours();
    ampm = h >= 12 ? 'PM' : 'AM';
    displayHours = String(h % 12 || 12).padStart(2, '0');
  }

  const minutes = String(time.getMinutes()).padStart(2, '0');

  // Matching ClockHeader responsive font sizing: 72px (<640px), 96px (640-767px), 108px (768-1023px), 120px (>=1024px)
  let baseClockSize = 120;
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 640) baseClockSize = 72;
    else if (window.innerWidth < 768) baseClockSize = 96;
    else if (window.innerWidth < 1024) baseClockSize = 108;
  }
  const defaultClockH = 124;
  const scaledSize = Math.abs(dims.h - defaultClockH) <= 15 ? baseClockSize : Math.round(baseClockSize * (dims.h / defaultClockH));
  const fontSize = Math.max(24, Math.min(scaledSize, Math.round(dims.w * (is12h ? 0.25 : 0.31))));

  // Determine clock color & shadow matching ClockHeader exactly
  const clockShadowClass = resolvedColors
    ? resolvedColors.clockShadow
    : isLight
      ? settings.backgroundType === 'gradient'
        ? 'text-slate-800 drop-shadow-sm'
        : 'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]'
      : 'text-white drop-shadow-md';

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center select-none font-tabular pointer-events-none ${clockShadowClass}`}
      style={{
        color: resolvedColors?.clock || (isLight && settings.backgroundType === 'gradient' ? '#1e293b' : '#ffffff'),
        textShadow: resolvedColors?.clockShadow,
      }}
    >
      <div className="flex items-baseline justify-center tracking-tight font-semibold leading-none" style={{ fontSize: `${fontSize}px` }}>
        <div className="flex items-baseline justify-center">
          <span className="inline-flex justify-center">
            <span className="inline-block w-[0.68em] text-center">{displayHours[0]}</span>
            <span className="inline-block w-[0.68em] text-center">{displayHours[1]}</span>
          </span>
          <span className="inline-block w-[0.32em] text-center opacity-75 animate-pulse select-none">:</span>
          <span className="inline-flex justify-center">
            <span className="inline-block w-[0.68em] text-center">{minutes[0]}</span>
            <span className="inline-block w-[0.68em] text-center">{minutes[1]}</span>
          </span>
        </div>
        {is12h && ampm && (
          <span
            className="ml-3 font-semibold uppercase opacity-80"
            style={{ fontSize: `${Math.max(14, Math.round(fontSize * 0.25))}px` }}
          >
            {ampm}
          </span>
        )}
      </div>
    </div>
  );
});

ClockWidget.displayName = 'ClockWidget';
