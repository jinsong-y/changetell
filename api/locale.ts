import {
  containsHanScript,
  display,
  displayRequired,
  ELEMENT_EN,
  HEXAGRAM_EN,
  RELATION_EN,
  SEASON_EN,
  STATUS_EN,
  STRENGTH_EN,
  TRIGRAM_EN,
} from '../src/i18n/display.js';

export type Locale = 'zh-CN' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en'];

export const normalizeLocale = (value: unknown): Locale | null =>
  value === 'zh-CN' || value === 'en' ? value : null;

export {
  containsHanScript,
  display,
  displayRequired,
  ELEMENT_EN,
  HEXAGRAM_EN,
  RELATION_EN,
  SEASON_EN,
  STATUS_EN,
  STRENGTH_EN,
  TRIGRAM_EN,
};
