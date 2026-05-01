import type { TrigramName } from './iching.js';
import type { ElementName, RelationName, RelationStatus, SeasonalStrength } from './meihua.js';

export type Locale = 'zh-CN' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en'];

export const normalizeLocale = (value: unknown): Locale | null =>
  value === 'zh-CN' || value === 'en' ? value : null;

export const TRIGRAM_EN: Record<TrigramName, string> = {
  天: 'Heaven',
  泽: 'Lake',
  火: 'Fire',
  雷: 'Thunder',
  风: 'Wind',
  水: 'Water',
  山: 'Mountain',
  地: 'Earth',
};

export const ELEMENT_EN: Record<ElementName, string> = {
  金: 'Metal',
  木: 'Wood',
  水: 'Water',
  火: 'Fire',
  土: 'Earth',
};

export const RELATION_EN: Record<RelationName, string> = {
  比和: 'Same Element',
  用生体: 'Use Generates Body',
  体克用: 'Body Controls Use',
  体生用: 'Body Generates Use',
  用克体: 'Use Controls Body',
};

export const STATUS_EN: Record<RelationStatus, string> = {
  大吉: 'Very Auspicious',
  小吉: 'Auspicious',
  不利: 'Unfavorable',
  大凶: 'Inauspicious',
};

export const STRENGTH_EN: Record<SeasonalStrength, string> = {
  旺: 'Prosperous',
  相: 'Supported',
  囚: 'Confined',
  休: 'Resting',
};

export const SEASON_EN: Record<string, string> = {
  春: 'Spring',
  夏: 'Summer',
  '长夏/四季土': 'Late Summer / Earth Season',
  秋: 'Autumn',
  冬: 'Winter',
};

export const HEXAGRAM_EN: Record<string, string> = {
  乾为天: 'Force',
  天泽履: 'Treading',
  天火同人: 'Fellowship',
  天雷无妄: 'Without Falsehood',
  天风姤: 'Coupling',
  天水讼: 'Arguing',
  天山遁: 'Retiring',
  天地否: 'Obstruction',
  泽天夬: 'Parting',
  兑为泽: 'Open',
  泽火革: 'Skinning',
  泽雷随: 'Following',
  泽风大过: 'Great Exceeding',
  泽水困: 'Confining',
  泽山咸: 'Conjoining',
  泽地萃: 'Clustering',
  火天大有: 'Great Possessing',
  火泽睽: 'Polarising',
  离为火: 'Radiance',
  火雷噬嗑: 'Gnawing Bite',
  火风鼎: 'Holding',
  火水未济: 'Not Yet Fording',
  火山旅: 'Sojourning',
  火地晋: 'Prospering',
  雷天大壮: 'Great Invigorating',
  雷泽归妹: 'Converting Maiden',
  雷火丰: 'Abounding',
  震为雷: 'Shake',
  雷风恒: 'Persevering',
  雷水解: 'Taking Apart',
  雷山小过: 'Small Exceeding',
  雷地豫: 'Providing',
  风天小畜: 'Small Accumulating',
  风泽中孚: 'Center Confirming',
  风火家人: 'Dwelling People',
  风雷益: 'Augmenting',
  巽为风: 'Ground',
  风水涣: 'Dispersing',
  风山渐: 'Infiltrating',
  风地观: 'Viewing',
  水天需: 'Attending',
  水泽节: 'Articulating',
  水火既济: 'Already Fording',
  水雷屯: 'Sprouting',
  水风井: 'Welling',
  坎为水: 'Gorge',
  水山蹇: 'Limping',
  水地比: 'Grouping',
  山天大畜: 'Great Accumulating',
  山泽损: 'Diminishing',
  山火贲: 'Adorning',
  山雷颐: 'Nourishing',
  山风蛊: 'Correcting',
  山水蒙: 'Enveloping',
  艮为山: 'Bound',
  山地剥: 'Stripping',
  地天泰: 'Pervading',
  地泽临: 'Nearing',
  地火明夷: 'Brightness Hiding',
  地雷复: 'Returning',
  地风升: 'Ascending',
  地水师: 'Leading',
  地山谦: 'Humbling',
  坤为地: 'Field',
};

export const display = (locale: Locale, value: string) => {
  if (locale === 'zh-CN') return value;
  return HEXAGRAM_EN[value]
    ?? TRIGRAM_EN[value as TrigramName]
    ?? ELEMENT_EN[value as ElementName]
    ?? RELATION_EN[value as RelationName]
    ?? STATUS_EN[value as RelationStatus]
    ?? STRENGTH_EN[value as SeasonalStrength]
    ?? SEASON_EN[value]
    ?? value;
};
