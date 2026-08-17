import React, { useState, useEffect, useMemo } from 'react';
import { ThemeSettings } from '../../types';

interface ClockHeaderProps {
  settings: ThemeSettings;
}

const GREETINGS_ZH = {
  morning: [
    '早上好，新的一天元气满满 ☀️',
    '清晨的阳光正好，开启美好一天 ✨',
    '早安！保持专注，今天也将收获满满 ☕',
    '一日之计在于晨，今天也要加油哦 🚀',
  ],
  noon: [
    '中午好，适当休息一下吧 🍱',
    '午餐时间到，享受片刻惬意时光 🍵',
    '蓄满能量，迎接充实的下午 🌿',
  ],
  afternoon: [
    '下午好，保持高效与从容 💻',
    '来杯咖啡或清茶，提提神吧 ☕',
    '专注当下，步履不停 🎯',
    '灵感闪耀的午后，灵感不断涌现 ✨',
  ],
  evening: [
    '晚上好，享受属于自己的闲暇时光 🌆',
    '辛苦了一天，好好犒劳一下自己吧 🌙',
    '夜幕降临，放慢节奏，静享安宁 🛋️',
  ],
  night: [
    '夜深了，早点休息，明天更美好 🌌',
    '晚安，愿好梦常伴 💤',
    '告别今天的疲惫，静待明天的阳光 ⭐',
  ],
};

const GREETINGS_EN = {
  morning: [
    'Good morning, have a wonderful and productive day! ☀️',
    'Rise and shine, new possibilities await ✨',
    'Start your morning with a fresh mind and coffee ☕',
  ],
  noon: [
    'Good afternoon, take a relaxing lunch break! 🍱',
    'Recharge your energy for the afternoon ahead 🍵',
  ],
  afternoon: [
    'Good afternoon, stay focused and inspired 💻',
    'Keep up the great work and steady momentum 🎯',
  ],
  evening: [
    'Good evening, unwind and enjoy your free time 🌆',
    'Time to relax and reflect on today’s achievements 🌙',
  ],
  night: [
    'Good night, rest well and sweet dreams 🌌',
    'Time to sleep and recharge for tomorrow ⭐',
  ],
};

export const ClockHeader: React.FC<ClockHeaderProps> = React.memo(({ settings }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pick a random dynamic greeting per session/time of day
  const randomGreeting = useMemo(() => {
    const h = new Date().getHours();
    const isZh = settings.language === 'zh-CN';
    const dict = isZh ? GREETINGS_ZH : GREETINGS_EN;

    let pool: string[];
    if (h >= 5 && h < 11) pool = dict.morning;
    else if (h >= 11 && h < 13) pool = dict.noon;
    else if (h >= 13 && h < 18) pool = dict.afternoon;
    else if (h >= 18 && h < 23) pool = dict.evening;
    else pool = dict.night;

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }, [settings.language]);

  if (!settings.showClock) return null;

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');

  const formatDate = () => {
    const lang = settings.language === 'zh-CN' ? 'zh-CN' : 'en-US';
    return time.toLocaleDateString(lang, {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center select-none pt-6 pb-3">
      <div className="text-6xl sm:text-7xl md:text-8xl font-extralight tracking-tight text-white drop-shadow-md tabular-nums">
        {hours}<span className="opacity-75 animate-pulse">:</span>{minutes}
      </div>

      {(settings.showDate || settings.showGreeting) && (
        <div className="flex items-center gap-2.5 mt-2.5 text-xs md:text-sm font-normal text-white/90 drop-shadow">
          {settings.showDate && <span>{formatDate()}</span>}
          {settings.showDate && settings.showGreeting && <span className="opacity-60">•</span>}
          {settings.showGreeting && (
            <span className="font-light tracking-wide">{randomGreeting}</span>
          )}
        </div>
      )}
    </div>
  );
});
