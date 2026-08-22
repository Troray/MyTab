import React, { useState, useEffect, useMemo } from 'react';
import { ThemeSettings } from '../../types';
import { t } from '../../utils/i18n';

interface ClockHeaderProps {
  settings: ThemeSettings;
}

export const ClockHeader: React.FC<ClockHeaderProps> = React.memo(({ settings }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  const hasAnyDisplay = settings.showClock || settings.showDate || settings.showGreeting;
  if (!hasAnyDisplay) return null;

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');

  const formatDate = () => {
    return time.toLocaleDateString(settings.language || 'zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const isLight = settings.mode === 'light';

  return (
    <div className="flex flex-col items-center justify-center text-center select-none pt-6 pb-3 transition-colors">
      {settings.showClock && (
        <div
          className={`text-6xl sm:text-7xl md:text-8xl font-extralight tracking-tight tabular-nums transition-colors ${
            isLight
              ? 'text-slate-900 drop-shadow-sm'
              : 'text-white drop-shadow-md'
          }`}
        >
          {hours}<span className="opacity-75 animate-pulse">:</span>{minutes}
        </div>
      )}

      {(settings.showDate || settings.showGreeting) && (
        <div
          className={`flex items-center gap-2.5 ${settings.showClock ? 'mt-2.5' : 'mt-1'} text-xs md:text-sm font-normal transition-colors ${
            isLight
              ? 'text-slate-700 drop-shadow-sm'
              : 'text-white/90 drop-shadow'
          }`}
        >
          {settings.showDate && <span>{formatDate()}</span>}
          {settings.showDate && settings.showGreeting && <span className="opacity-60">•</span>}
          {settings.showGreeting && (
            <span className="font-light tracking-wide">{greeting}</span>
          )}
        </div>
      )}
    </div>
  );
});
