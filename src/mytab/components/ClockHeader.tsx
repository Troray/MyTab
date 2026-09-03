import React, { useState, useEffect, useMemo } from 'react';
import { ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { t } from '../../utils/i18n';

interface ClockHeaderProps {
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
}

export const ClockHeader: React.FC<ClockHeaderProps> = React.memo(({ settings, resolvedColors }) => {
  const [time, setTime] = useState(new Date());
  const [hours, setHours] = useState(new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      setHours(now.getHours());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const h = hours;
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
  }, [hours, settings.language, settings.customGreetings]);

  const hasAnyDisplay = settings.showClock || settings.showDate || settings.showGreeting;
  if (!hasAnyDisplay) return null;

  const is12h = settings.timeFormat === '12h';
  let displayHours = String(time.getHours()).padStart(2, '0');
  let ampm = '';

  if (is12h) {
    const h = time.getHours();
    ampm = h >= 12 ? 'PM' : 'AM';
    displayHours = String(h % 12 || 12).padStart(2, '0');
  }

  const minutes = String(time.getMinutes()).padStart(2, '0');

  const formatDate = () => {
    return time.toLocaleDateString(settings.language || 'zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const isLight = settings.mode === 'light';

  // Determine clock color & shadow
  const clockColorStyle = resolvedColors ? { color: resolvedColors.clock } : undefined;
  const clockShadowClass = resolvedColors
    ? resolvedColors.clockShadow
    : isLight
    ? settings.backgroundType === 'gradient'
      ? 'text-slate-800 drop-shadow-sm'
      : 'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]'
    : 'text-white drop-shadow-md';

  // Determine date & greeting colors & shadow
  const dateColorStyle = resolvedColors ? { color: resolvedColors.date } : undefined;
  const greetingColorStyle = resolvedColors ? { color: resolvedColors.greeting } : undefined;
  const dateShadowClass = resolvedColors
    ? resolvedColors.dateShadow
    : isLight
    ? settings.backgroundType === 'gradient'
      ? 'text-slate-700 drop-shadow-sm'
      : 'text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]'
    : 'text-white/90 drop-shadow';

  return (
    <div className="flex flex-col items-center justify-center text-center select-none pt-6 pb-3 transition-colors">
      {settings.showClock && (
        <div
          style={clockColorStyle}
          className={`flex items-baseline justify-center text-6xl sm:text-7xl md:text-8xl font-extralight tracking-tight tabular-nums transition-colors ${clockShadowClass}`}
        >
          <span>{displayHours}<span className="opacity-75 animate-pulse">:</span>{minutes}</span>
          {is12h && <span className="text-xl sm:text-2xl md:text-3xl ml-3 font-medium opacity-80">{ampm}</span>}
        </div>
      )}

      {(settings.showDate || settings.showGreeting) && (
        <div
          className={`flex items-center gap-2.5 ${settings.showClock ? 'mt-2.5' : 'mt-1'} text-xs md:text-sm font-normal transition-colors ${dateShadowClass}`}
        >
          {settings.showDate && <span style={dateColorStyle}>{formatDate()}</span>}
          {settings.showDate && settings.showGreeting && (
            <span style={dateColorStyle} className="opacity-60">•</span>
          )}
          {settings.showGreeting && (
            <span style={greetingColorStyle} className="font-light tracking-wide">{greeting}</span>
          )}
        </div>
      )}
    </div>
  );
});
