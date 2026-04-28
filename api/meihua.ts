import { Solar } from 'lunar-typescript';
import { HEXAGRAMS_TABLE, TRIGRAMS as TRIGRAM_BINARY, type TrigramName } from './iching.js';

export type ElementName = '木' | '火' | '土' | '金' | '水';
export type PositionName = 'upper' | 'lower';
export type RelationName = '比和' | '用生体' | '体克用' | '体生用' | '用克体';
export type RelationStatus = '大吉' | '小吉' | '不利' | '大凶';
export type SeasonalStrength = '旺' | '相' | '囚' | '休';

export interface HexInfo {
  name: string;
  upperName: TrigramName;
  lowerName: TrigramName;
}

export interface TrigramRole {
  name: TrigramName;
  position: PositionName;
  element: ElementName;
}

export interface RelationAnalysis {
  bodyElement: ElementName;
  useElement: ElementName;
  relation: RelationName;
  status: RelationStatus;
}

export interface SeasonalAnalysis {
  month: number;
  seasonName: string;
  seasonElement: ElementName;
  bodyElement: ElementName;
  strength: SeasonalStrength;
}

export interface OmenAnalysis {
  used: boolean;
  summary: string;
}

export interface CastResult {
  timeInfo: string;
  formula: string;
  mainHex: HexInfo;
  mutualHex: HexInfo;
  changedHex: HexInfo;
  movingLine: number;
  body: TrigramRole;
  use: TrigramRole;
  relation: RelationAnalysis;
  seasonal: SeasonalAnalysis;
  omen: OmenAnalysis;
}

export const TRIGRAM_MAP: Record<number, TrigramName> = {
  1: '天',
  2: '泽',
  3: '火',
  4: '雷',
  5: '风',
  6: '水',
  7: '山',
  8: '地',
};

export const TRIGRAM_ELEMENTS: Record<TrigramName, ElementName> = {
  天: '金',
  泽: '金',
  地: '土',
  山: '土',
  雷: '木',
  风: '木',
  水: '水',
  火: '火',
};

const GENERATES: Record<ElementName, ElementName> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

const CONTROLS: Record<ElementName, ElementName> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
};

export function normalizeTrigramIndex(index: number): number {
  const normalized = ((index % 8) + 8) % 8;
  return normalized === 0 ? 8 : normalized;
}

export function getTrigramElement(name: TrigramName): ElementName {
  return TRIGRAM_ELEMENTS[name];
}

export function findTrigramByBinary(binary: string): TrigramName {
  return (Object.keys(TRIGRAM_BINARY) as TrigramName[]).find((name) => TRIGRAM_BINARY[name] === binary) ?? '天';
}

export function getBodyUseRoles(input: {
  upperName: TrigramName;
  lowerName: TrigramName;
  movingLine: number;
}): { body: TrigramRole; use: TrigramRole } {
  const upper: TrigramRole = {
    name: input.upperName,
    position: 'upper',
    element: getTrigramElement(input.upperName),
  };
  const lower: TrigramRole = {
    name: input.lowerName,
    position: 'lower',
    element: getTrigramElement(input.lowerName),
  };

  return input.movingLine <= 3
    ? { body: upper, use: lower }
    : { body: lower, use: upper };
}

export function analyzeRelation(bodyElement: ElementName, useElement: ElementName): RelationAnalysis {
  if (bodyElement === useElement) {
    return { bodyElement, useElement, relation: '比和', status: '大吉' };
  }

  if (GENERATES[useElement] === bodyElement) {
    return { bodyElement, useElement, relation: '用生体', status: '大吉' };
  }

  if (CONTROLS[bodyElement] === useElement) {
    return { bodyElement, useElement, relation: '体克用', status: '小吉' };
  }

  if (GENERATES[bodyElement] === useElement) {
    return { bodyElement, useElement, relation: '体生用', status: '不利' };
  }

  return { bodyElement, useElement, relation: '用克体', status: '大凶' };
}

export function getSeasonName(month: number): string {
  if (month >= 1 && month <= 3) return '春';
  if (month >= 4 && month <= 5) return '夏';
  if (month === 6 || month === 9 || month === 12) return '长夏/四季土';
  if (month >= 7 && month <= 8) return '秋';
  return '冬';
}

export function getSeasonalAnalysis(bodyElement: ElementName, month: number): SeasonalAnalysis {
  const seasonName = getSeasonName(month);
  const seasonElementByName: Record<string, ElementName> = {
    春: '木',
    夏: '火',
    '长夏/四季土': '土',
    秋: '金',
    冬: '水',
  };
  const seasonElement = seasonElementByName[seasonName];

  let strength: SeasonalStrength = '休';
  if (seasonElement === bodyElement) {
    strength = '旺';
  } else if (GENERATES[seasonElement] === bodyElement) {
    strength = '相';
  } else if (CONTROLS[seasonElement] === bodyElement) {
    strength = '囚';
  }

  return {
    month,
    seasonName,
    seasonElement,
    bodyElement,
    strength,
  };
}

export function castMeihua(timestamp?: string | number | Date): CastResult {
  const date = timestamp === undefined ? new Date() : new Date(timestamp);
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  const yearZhiIndex = lunar.getYearZhiIndex() + 1;
  const month = Math.abs(lunar.getMonth());
  const day = lunar.getDay();
  const hourZhiIndex = lunar.getTimeZhiIndex() + 1;

  const upperIndexRaw = (yearZhiIndex + month + day) % 8;
  const lowerIndexRaw = (yearZhiIndex + month + day + hourZhiIndex) % 8;
  const movingLineRaw = (yearZhiIndex + month + day + hourZhiIndex) % 6;
  const movingLine = movingLineRaw === 0 ? 6 : movingLineRaw;

  const upperName = TRIGRAM_MAP[normalizeTrigramIndex(upperIndexRaw)];
  const lowerName = TRIGRAM_MAP[normalizeTrigramIndex(lowerIndexRaw)];
  const mainHex: HexInfo = {
    name: HEXAGRAMS_TABLE[upperName][lowerName],
    upperName,
    lowerName,
  };

  const mainBinary = TRIGRAM_BINARY[lowerName] + TRIGRAM_BINARY[upperName];
  const mutualLowerName = findTrigramByBinary(mainBinary.substring(1, 4));
  const mutualUpperName = findTrigramByBinary(mainBinary.substring(2, 5));
  const mutualHex: HexInfo = {
    name: HEXAGRAMS_TABLE[mutualUpperName][mutualLowerName],
    upperName: mutualUpperName,
    lowerName: mutualLowerName,
  };

  const changedBinaryArr = mainBinary.split('');
  const lineToChange = movingLine - 1;
  changedBinaryArr[lineToChange] = changedBinaryArr[lineToChange] === '1' ? '0' : '1';
  const changedLowerName = findTrigramByBinary(changedBinaryArr.slice(0, 3).join(''));
  const changedUpperName = findTrigramByBinary(changedBinaryArr.slice(3, 6).join(''));
  const changedHex: HexInfo = {
    name: HEXAGRAMS_TABLE[changedUpperName][changedLowerName],
    upperName: changedUpperName,
    lowerName: changedLowerName,
  };

  const { body, use } = getBodyUseRoles({ upperName, lowerName, movingLine });

  return {
    timeInfo: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
    formula: `上卦:(${yearZhiIndex}+${month}+${day})%8=${upperIndexRaw}; 下卦:(${yearZhiIndex}+${month}+${day}+${hourZhiIndex})%8=${lowerIndexRaw}; 动爻:${movingLine}`,
    mainHex,
    mutualHex,
    changedHex,
    movingLine,
    body,
    use,
    relation: analyzeRelation(body.element, use.element),
    seasonal: getSeasonalAnalysis(body.element, month),
    omen: {
      used: false,
      summary: '本次未采外应，不编造声色人事之灵应；以体用五行生克为主。',
    },
  };
}
