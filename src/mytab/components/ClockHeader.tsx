import React, { useState, useEffect, useMemo } from 'react';
import { ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { t } from '../../utils/i18n';
import { getLunarDisplay } from '../../utils/lunar';
import { isLightMode } from '../../utils/constants';

interface ClockHeaderProps {
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
}

export const ClockHeader: React.FC<ClockHeaderProps> = React.memo(({ settings, resolvedColors, isLight: propsIsLight }) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    let lastMinute = new Date().getMinutes();

    const checkTime = () => {
      const now = new Date();
      if (now.getMinutes() !== lastMinute) {
        lastMinute = now.getMinutes();
        setTime(now);
      }
    };

    const timer = setInterval(checkTime, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = new Date();
        lastMinute = now.getMinutes();
        setTime(now);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const greeting = useMemo(() => {
    const h = time.getHours();
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
  }, [time.getHours(), settings.language, settings.customGreetings]);

  const showLunar = settings.showLunar ?? true;

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
    const lang = settings.language || 'zh-CN';
    if (lang.startsWith('zh') || lang === 'ja') {
      const datePart = time.toLocaleDateString(lang, {
        month: 'long',
        day: 'numeric',
      });
      const weekdayPart = time.toLocaleDateString(lang, {
        weekday: 'long',
      });
      return `${datePart} ${weekdayPart}`;
    }

    return time.toLocaleDateString(lang, {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const lunarDate = useMemo(() => {
    if (!showLunar) return '';
    return getLunarDisplay(time);
  }, [showLunar, time.getFullYear(), time.getMonth(), time.getDate()]);

  const hasAnyDisplay = settings.showClock || settings.showDate || settings.showGreeting || (showLunar && !!lunarDate);
  if (!hasAnyDisplay) return null;

  const isLight = propsIsLight !== undefined ? propsIsLight : isLightMode(settings.mode);

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

  const greetingShadowClass = resolvedColors
    ? resolvedColors.greetingShadow
    : dateShadowClass;

  const hasDateOrLunar = settings.showDate || (showLunar && !!lunarDate);

  return (
    <div className="flex flex-col items-center justify-center text-center select-none pt-6 pb-3 transition-colors">
      {settings.showClock && (
        <div
          id="mytab-clock"
          style={clockColorStyle}
          className={`flex items-baseline justify-center text-7xl sm:text-8xl md:text-[108px] lg:text-[120px] font-semibold tracking-tight transition-colors leading-none ${clockShadowClass}`}
        >
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
          {is12h && <span className="text-xl sm:text-2xl md:text-3xl ml-3.5 font-semibold opacity-80">{ampm}</span>}
        </div>
      )}

      {(hasDateOrLunar || settings.showGreeting) && (
        <div
          className={`flex items-center justify-center flex-wrap gap-2 md:gap-2.5 ${settings.showClock ? 'mt-3.5 md:mt-4' : 'mt-1'} text-xs md:text-sm font-normal transition-colors`}
        >
          {settings.showDate && (
            <span id="mytab-date" style={dateColorStyle} className={dateShadowClass}>
              {formatDate()}
            </span>
          )}
          {settings.showDate && showLunar && !!lunarDate && (
            <span style={dateColorStyle} className={`opacity-60 ${dateShadowClass}`}>•</span>
          )}
          {showLunar && !!lunarDate && (
            <span id="mytab-lunar" style={dateColorStyle} className={dateShadowClass}>
              {lunarDate}
            </span>
          )}
          {hasDateOrLunar && settings.showGreeting && (
            <span style={dateColorStyle} className={`opacity-60 ${dateShadowClass}`}>•</span>
          )}
          {settings.showGreeting && (
            <span id="mytab-greeting" style={greetingColorStyle} className={`font-light tracking-wide ${greetingShadowClass}`}>
              {greeting}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
