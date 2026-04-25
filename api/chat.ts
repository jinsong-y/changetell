import { GoogleGenerativeAI } from "@google/generative-ai";
import { Solar, Lunar } from 'lunar-typescript';

// 八卦对应表 (梅花易数标准: 1乾, 2兑, 3离, 4震, 5巽, 6坎, 7艮, 8坤)
const TRIGRAM_MAP: Record<number, string> = {
  1: '天', 2: '泽', 3: '火', 4: '雷', 5: '风', 6: '水', 7: '山', 0: '地', 8: '地'
};

// 八卦二进制 (从下往上: 阳1阴0)
const TRIGRAM_BINARY: Record<string, string> = {
  '天': '111', '泽': '011', '火': '101', '雷': '001',
  '风': '110', '水': '010', '山': '100', '地': '000'
};

const HEXAGRAMS_TABLE: any = {
  '天': { '天': '乾为天', '泽': '天泽履', '火': '天火同人', '雷': '天雷无妄', '风': '天风姤', '水': '天水讼', '山': '天山遁', '地': '天地否' },
  '泽': { '天': '泽天夬', '泽': '兑为泽', '火': '泽火革', '雷': '泽雷随', '风': '泽风大过', '水': '泽水困', '山': '泽山咸', '地': '泽地萃' },
  '火': { '天': '火天大有', '泽': '火泽睽', '火': '离为火', '雷': '火雷噬嗑', '风': '火风鼎', '水': '火水未济', '山': '火山旅', '地': '火地晋' },
  '雷': { '天': '雷天大壮', '泽': '雷泽归妹', '火': '雷火丰', '雷': '震为雷', '风': '雷风恒', '水': '雷水解', '山': '雷山小过', '地': '雷地豫' },
  '风': { '天': '风天小畜', '泽': '风泽中孚', '火': '风火家人', '雷': '风雷益', '风': '巽为风', '水': '风水涣', '山': '风山渐', '地': '风地观' },
  '水': { '天': '水天需', '泽': '水泽节', '火': '水火既济', '雷': '水雷屯', '风': '水风井', '水': '坎为水', '山': '水山蹇', '地': '水地比' },
  '山': { '天': '山天大畜', '泽': '山泽损', '火': '山火贲', '雷': '山雷颐', '风': '山风蛊', '水': '山水蒙', '山': '艮为山', '地': '山地剥' },
  '地': { '天': '地天泰', '泽': '地泽临', '火': '地火明夷', '雷': '地雷复', '风': '地风升', '水': '地水师', '山': '地山谦', '地': '坤为地' }
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, timestamp } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    // 1. 本地计算梅花易数
    const date = timestamp ? new Date(timestamp) : new Date();
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    const yearZhiIndex = lunar.getYearZhiIndex() + 1; // 子1, 丑2... 午7...
    const month = lunar.getMonth();
    const day = lunar.getDay();
    const hourZhiIndex = lunar.getTimeZhiIndex() + 1;

    // 梅花易数公式
    const upperIndex = (yearZhiIndex + month + day) % 8;
    const lowerIndex = (yearZhiIndex + month + day + hourZhiIndex) % 8;
    let movingLine = (yearZhiIndex + month + day + hourZhiIndex) % 6;
    if (movingLine === 0) movingLine = 6;

    const upperName = TRIGRAM_MAP[upperIndex === 0 ? 8 : upperIndex];
    const lowerName = TRIGRAM_MAP[lowerIndex === 0 ? 8 : lowerIndex];
    const mainHexName = HEXAGRAMS_TABLE[upperName][lowerName];

    // 计算互卦 (取主卦的 234 爻为下，345 爻为上)
    const mainBinary = TRIGRAM_BINARY[lowerName] + TRIGRAM_BINARY[upperName]; // 下+上 = 123 + 456
    const mutualLowerBinary = mainBinary.substring(1, 4); // 2,3,4爻
    const mutualUpperBinary = mainBinary.substring(2, 5); // 3,4,5爻
    
    const findTrigramByBinary = (bin: string) => Object.keys(TRIGRAM_BINARY).find(key => TRIGRAM_BINARY[key] === bin) || '天';
    const mutualLowerName = findTrigramByBinary(mutualLowerBinary);
    const mutualUpperName = findTrigramByBinary(mutualUpperBinary);
    const mutualHexName = HEXAGRAMS_TABLE[mutualUpperName][mutualLowerName];

    // 计算变卦
    const changedBinaryArr = mainBinary.split('');
    const lineToChange = movingLine - 1;
    changedBinaryArr[lineToChange] = changedBinaryArr[lineToChange] === '1' ? '0' : '1';
    const changedLowerName = findTrigramByBinary(changedBinaryArr.slice(0, 3).join(''));
    const changedUpperName = findTrigramByBinary(changedBinaryArr.slice(3, 6).join(''));
    const changedHexName = HEXAGRAMS_TABLE[changedUpperName][changedLowerName];

    const divinationData = {
      timeInfo: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
      formula: `上卦:(${yearZhiIndex}+${month}+${day})%8=${upperIndex}; 下卦:(${yearZhiIndex}+${month}+${day}+${hourZhiIndex})%8=${lowerIndex}; 动爻:${movingLine}`,
      mainHexName,
      mutualHexName,
      changedHexName,
      movingLine
    };

    // 2. 调用 AI 进行解读
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview", 
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `你是一位精通易经的顶级解卦大师。
我已经通过"梅花易数"本地算法计算出了精确的结果，请你基于以下确定的卦象数据进行专业、深度的文化解读。

确定数据如下：
- 起卦时间：${divinationData.timeInfo}
- 主卦：${mainHexName}
- 互卦：${mutualHexName}
- 变卦：${changedHexName}
- 动爻：第${movingLine}爻

你的任务是：
1. 解释这些卦象之间的逻辑联系（现状、过程、趋势）。
2. 结合用户求问之事，给出极具洞察力的建议。
3. 保持古雅且专业的文风。

输出JSON结构：
{
  "timeAnalysis": "说明如何基于时间推导出上述卦象的逻辑（引用起卦时间）",
  "mainHex": { "name": "${mainHexName}", "meaning": "主卦的含义解析" },
  "mutualHex": { "name": "${mutualHexName}", "meaning": "互卦的含义解析" },
  "changedHex": { "name": "${changedHexName}", "meaning": "变卦的含义解析" },
  "movingLines": "第${movingLine}爻动的具体含义及变动启示",
  "judgment": "核心卜辞解析",
  "meaning": "深度综合解析",
  "advice": "针对性建议",
  "overallStatus": "总体状态(如: 大吉/平平等)"
}`;

    const result = await model.generateContent([systemPrompt, `用户求问：${prompt}`]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json(JSON.parse(text));
  } catch (error: any) {
    console.error("Divination/Gemini Error:", error);
    return res.status(500).json({ error: "天机运转受阻，请稍后再试" });
  }
}
