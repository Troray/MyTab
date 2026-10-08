import { zhCN } from './zh-CN';
import { zhTW } from './zh-TW';
import { en } from './en';
import { ja } from './ja';
import { ko } from './ko';
import { fr } from './fr';
import { ru } from './ru';
import { de } from './de';
import { es } from './es';
import { ptBR } from './pt-BR';
import { it } from './it';
import { pl } from './pl';
import { tr } from './tr';
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
  'de': de,
  'es': es,
  'pt-BR': ptBR,
  'it': it,
  'pl': pl,
  'tr': tr,
};

export const supportedLocales = [
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
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
