import { HEXAGRAMS_TABLE, TRIGRAMS, type TrigramName } from '../../api/iching';

export { HEXAGRAMS_TABLE, TRIGRAMS, type BinaryString, type TrigramName } from '../../api/iching';

// 反向查询：根据卦名获取二进制爻象 (从下往上)
export function getBinaryByHexName(name: string): string | null {
  for (const [upper, row] of Object.entries(HEXAGRAMS_TABLE)) {
    for (const [lower, hexName] of Object.entries(row)) {
      if (hexName === name || name.includes(hexName) || hexName.includes(name)) {
        // 易经卦象是从下往上排，所以先放下卦，再放上卦
        return TRIGRAMS[lower as TrigramName] + TRIGRAMS[upper as TrigramName];
      }
    }
  }
  return null;
}
