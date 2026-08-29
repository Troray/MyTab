import { zhCN } from './zh-CN';
import { zhTW } from './zh-TW';
import { en } from './en';
import { ja } from './ja';
import { ko } from './ko';
import { fr } from './fr';
import { ru } from './ru';
import { Translation, TranslationKey, Locale } from './types';

export * from './types';

export const translations: Record<string, Translation> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en': en,
  'ja': ja,
  'ko': ko,
  'fr': fr,
  'ru': ru,
};

export const supportedLocales = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'ru', label: 'Русский' },
] as const;

/**
 * 获取对应语言的国际化文本
 * @param key 词条键
 * @param lang 语言代码，默认为 'zh-CN'
 */
export function t(key: TranslationKey, lang: Locale = 'zh-CN'): string {
  const dict = translations[lang] || translations['zh-CN'];
  const val = dict?.[key] || translations['zh-CN']?.[key] || (key as string);
  return typeof val === 'string' ? val : (key as string);
}
