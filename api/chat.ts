import { GoogleGenerativeAI } from "@google/generative-ai";
import { castByNumbers, castMeihua, type CastMethod } from "./meihua.js";
import { containsHanScript, displayRequired, normalizeLocale, type Locale } from './locale.js';

export { normalizeLocale };

const RELATION_SUMMARY: Record<string, string> = {
  比和: '体用同气，主客同频，事情较易相合。',
  用生体: '事情助我，外部条件生扶主方，最为有利。',
  体克用: '我能制事，虽需费力推动，仍有可成之象。',
  体生用: '我去生事，主方耗泄，易有投入多、回收慢之象。',
  用克体: '事情克我，阻力压身，宜谨慎退守或先化解冲突。',
};

const RELATION_SUMMARY_EN: Record<string, string> = {
  比和: 'Body and use share the same element, showing alignment between the querent and the matter.',
  用生体: 'Use generates body, so the matter supports the querent and conditions are favorable.',
  体克用: 'Body controls use, so the querent can shape the matter, though effort is required.',
  体生用: 'Body generates use, so the querent may spend energy and see slower returns.',
  用克体: 'Use controls body, so the matter presses against the querent and calls for caution.',
};

type DivinationData = ReturnType<typeof castMeihua>;

const isCastMethod = (value: unknown): value is CastMethod =>
  value === 'time' || value === 'numbers';

export const getServiceErrorMessage = (locale: Locale) =>
  locale === 'en'
    ? 'The interpretation service is temporarily unavailable. Please try again later.'
    : '天机运转受阻，请稍后再试';

const positionLabel = (locale: Locale, position: 'upper' | 'lower') =>
  locale === 'en'
    ? (position === 'upper' ? 'Upper Trigram' : 'Lower Trigram')
    : (position === 'upper' ? '上卦' : '下卦');

const localizeFormula = (formula: string, locale: Locale) => {
  if (locale === 'zh-CN') return formula;
  return formula
    .replaceAll('报数起卦', 'Number Cast')
    .replaceAll('上卦', 'Upper trigram')
    .replaceAll('下卦', 'Lower trigram')
    .replaceAll('动爻', 'Moving line');
};

const displayDeterministic = (locale: Locale, value: string, category: string) =>
  displayRequired(locale, value, category);

function withDeterministicSummaries(divinationData: DivinationData, locale: Locale) {
  const relationSummary = locale === 'en'
    ? RELATION_SUMMARY_EN[divinationData.relation.relation]
    : RELATION_SUMMARY[divinationData.relation.relation];
  const relation = {
    ...divinationData.relation,
    bodyElement: displayDeterministic(locale, divinationData.relation.bodyElement, 'element'),
    useElement: displayDeterministic(locale, divinationData.relation.useElement, 'element'),
    relation: displayDeterministic(locale, divinationData.relation.relation, 'relation'),
    status: displayDeterministic(locale, divinationData.relation.status, 'status'),
    summary: relationSummary,
  };
  const seasonal = {
    ...divinationData.seasonal,
    seasonName: displayDeterministic(locale, divinationData.seasonal.seasonName, 'season'),
    seasonElement: displayDeterministic(locale, divinationData.seasonal.seasonElement, 'element'),
    bodyElement: displayDeterministic(locale, divinationData.seasonal.bodyElement, 'element'),
    strength: displayDeterministic(locale, divinationData.seasonal.strength, 'strength'),
    summary: locale === 'en'
      ? `The body trigram belongs to ${displayDeterministic(locale, divinationData.seasonal.bodyElement, 'element')}. The season is ${displayDeterministic(locale, divinationData.seasonal.seasonName, 'season')}, and the body force is ${displayDeterministic(locale, divinationData.seasonal.strength, 'strength')}. Season is secondary context and does not override the body/use relation.`
      : `体卦属${divinationData.seasonal.bodyElement}，时令为${divinationData.seasonal.seasonName}，体气为${divinationData.seasonal.strength}。时令只作辅助，不覆盖体用生克主断。`,
  };

  return {
    ...divinationData,
    castMethodLabel: locale === 'en'
      ? (divinationData.castMethod === 'numbers' ? 'Number Cast' : 'Time Cast')
      : divinationData.castMethodLabel,
    timeInfo: locale === 'en'
      ? (divinationData.castMethod === 'numbers'
        ? `Numbers are recorded in the cast payload; seasonal month: ${divinationData.seasonal.month}.`
        : `Time cast using deterministic lunar calendar values; seasonal month: ${divinationData.seasonal.month}.`)
      : divinationData.timeInfo,
    formula: localizeFormula(divinationData.formula, locale),
    stabilityNote: locale === 'en' && divinationData.stabilityNote
      ? 'This hexagram is derived from the lunar year, month, day, and hour. Avoid repeating the same question within the same two-hour period.'
      : divinationData.stabilityNote,
    mainHexName: divinationData.mainHex.name,
    mutualHexName: divinationData.mutualHex.name,
    changedHexName: divinationData.changedHex.name,
    mainHexDisplayName: displayDeterministic(locale, divinationData.mainHex.name, 'hexagram'),
    mutualHexDisplayName: displayDeterministic(locale, divinationData.mutualHex.name, 'hexagram'),
    changedHexDisplayName: displayDeterministic(locale, divinationData.changedHex.name, 'hexagram'),
    mainHex: {
      ...divinationData.mainHex,
      name: displayDeterministic(locale, divinationData.mainHex.name, 'hexagram'),
      upperName: displayDeterministic(locale, divinationData.mainHex.upperName, 'trigram'),
      lowerName: displayDeterministic(locale, divinationData.mainHex.lowerName, 'trigram'),
    },
    mutualHex: {
      ...divinationData.mutualHex,
      name: displayDeterministic(locale, divinationData.mutualHex.name, 'hexagram'),
      upperName: displayDeterministic(locale, divinationData.mutualHex.upperName, 'trigram'),
      lowerName: displayDeterministic(locale, divinationData.mutualHex.lowerName, 'trigram'),
    },
    changedHex: {
      ...divinationData.changedHex,
      name: displayDeterministic(locale, divinationData.changedHex.name, 'hexagram'),
      upperName: displayDeterministic(locale, divinationData.changedHex.upperName, 'trigram'),
      lowerName: displayDeterministic(locale, divinationData.changedHex.lowerName, 'trigram'),
    },
    body: {
      ...divinationData.body,
      name: displayDeterministic(locale, divinationData.body.name, 'trigram'),
      element: displayDeterministic(locale, divinationData.body.element, 'element'),
    },
    use: {
      ...divinationData.use,
      name: displayDeterministic(locale, divinationData.use.name, 'trigram'),
      element: displayDeterministic(locale, divinationData.use.element, 'element'),
    },
    relation,
    seasonal,
    omen: {
      ...divinationData.omen,
      summary: locale === 'en'
        ? 'No external omen was collected; the reading is based on body/use and five-element relations.'
        : divinationData.omen.summary,
    },
  };
}

export const isGeminiHighDemandError = (error: unknown) => {
  const candidate = error as { status?: unknown; statusText?: unknown; message?: unknown };
  const message = String(candidate?.message ?? error ?? '');
  return candidate?.status === 503
    || String(candidate?.statusText ?? '').includes('Service Unavailable')
    || (message.includes('503') && message.includes('high demand'));
};

export async function withGeminiHighDemandRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 1,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= maxRetries || !isGeminiHighDemandError(error)) {
        throw error;
      }
    }
  }

  throw new Error('Gemini retry exhausted');
}

function castByRequest(input: {
  castMethod: CastMethod;
  castPayload?: { numbers?: number[] };
  timestamp?: string;
}): DivinationData {
  if (input.castMethod === 'numbers') {
    return castByNumbers({
      numbers: input.castPayload?.numbers ?? [],
      timestamp: input.timestamp,
    });
  }

  if (input.castMethod === 'time') {
    return castMeihua(input.timestamp);
  }

  const exhaustive: never = input.castMethod;
  throw new Error(`Unsupported cast method: ${exhaustive}`);
}

const isValidNumberCastValue = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 999;

export function getCastRequestValidationError(input: {
  prompt?: unknown;
  locale?: unknown;
  castMethod?: unknown;
  castPayload?: { numbers?: unknown[] };
}) {
  const locale = normalizeLocale(input.locale);
  if (!input.locale) return 'Locale is required';
  if (!locale) return 'Unsupported locale';
  if (typeof input.prompt !== 'string' || !input.prompt.trim()) {
    return locale === 'en' ? 'Prompt is required' : '请填写求问之事';
  }
  if (!input.castMethod) {
    return locale === 'en' ? 'Cast method is required' : '请选择起卦方式';
  }
  if (!isCastMethod(input.castMethod)) {
    return locale === 'en' ? 'Unsupported cast method' : '不支持的起卦方式';
  }

  if (input.castMethod === 'numbers') {
    const numbers = input.castPayload?.numbers;
    const upper = Array.isArray(numbers) ? numbers[0] : undefined;
    const lower = Array.isArray(numbers) ? numbers[1] : undefined;
    const moving = Array.isArray(numbers) ? numbers[2] : undefined;

    if (upper === undefined || lower === undefined) {
      return locale === 'en'
        ? 'Number Cast requires at least upper and lower numbers'
        : '报数起卦至少需要填写上卦数和下卦数';
    }

    if (!isValidNumberCastValue(upper) || !isValidNumberCastValue(lower) || (moving !== undefined && !isValidNumberCastValue(moving))) {
      return locale === 'en'
        ? 'Number Cast values must be whole numbers from 1 to 999'
        : '报数起卦数字需为 1 到 999 的整数';
    }
  }

  return null;
}

const asText = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback;

const asObject = (value: unknown) =>
  value && typeof value === 'object' ? value as Record<string, unknown> : {};

const assertEnglishAiText = (value: unknown, path: string) => {
  if (typeof value === 'string' && containsHanScript(value)) {
    throw new Error(`English AI payload contains Chinese at ${path}`);
  }
};

const validateEnglishAiPayload = (
  aiPayload: Record<string, unknown>,
  aiMainHex: Record<string, unknown>,
  aiMutualHex: Record<string, unknown>,
  aiChangedHex: Record<string, unknown>,
) => {
  assertEnglishAiText(aiPayload.timeAnalysis, 'timeAnalysis');
  assertEnglishAiText(aiMainHex.name, 'mainHex.name');
  assertEnglishAiText(aiMainHex.meaning, 'mainHex.meaning');
  assertEnglishAiText(aiMutualHex.name, 'mutualHex.name');
  assertEnglishAiText(aiMutualHex.meaning, 'mutualHex.meaning');
  assertEnglishAiText(aiChangedHex.name, 'changedHex.name');
  assertEnglishAiText(aiChangedHex.meaning, 'changedHex.meaning');
  assertEnglishAiText(aiPayload.bodyUseAnalysis, 'bodyUseAnalysis');
  assertEnglishAiText(aiPayload.fiveElementAnalysis, 'fiveElementAnalysis');
  assertEnglishAiText(aiPayload.seasonalAnalysis, 'seasonalAnalysis');
  assertEnglishAiText(aiPayload.omenAnalysis, 'omenAnalysis');
  assertEnglishAiText(aiPayload.meaning, 'meaning');
  assertEnglishAiText(aiPayload.advice, 'advice');
  assertEnglishAiText(aiPayload.overallStatus, 'overallStatus');
};

export function buildDivinationResponse(
  divinationDataInput: DivinationData,
  aiPayloadInput: unknown = {},
  locale: Locale,
) {
  const divinationData = withDeterministicSummaries(divinationDataInput, locale);
  const aiPayload = asObject(aiPayloadInput);
  const aiMainHex = asObject(aiPayload.mainHex);
  const aiMutualHex = asObject(aiPayload.mutualHex);
  const aiChangedHex = asObject(aiPayload.changedHex);
  if (locale === 'en') {
    validateEnglishAiPayload(aiPayload, aiMainHex, aiMutualHex, aiChangedHex);
  }
  const {
    castMethodLabel,
    timeInfo,
    formula,
    stabilityNote,
    mainHexName,
    mutualHexName,
    changedHexName,
    mainHexDisplayName,
    mutualHexDisplayName,
    changedHexDisplayName,
    movingLine,
    body,
    use,
    relation,
    seasonal,
    omen,
  } = divinationData;

  const isEnglish = locale === 'en';
  const mainMeaning = isEnglish
    ? `${mainHexDisplayName} represents the beginning or current state.`
    : `${mainHexName}代表开始/当前状态。`;
  const mutualMeaning = isEnglish
    ? `${mutualHexDisplayName} represents the inner process or hidden condition.`
    : `${mutualHexName}代表中间过程/隐情。`;
  const changedMeaning = isEnglish
    ? `${changedHexDisplayName} represents the final result or tendency.`
    : `${changedHexName}代表最终结果/趋势。`;

  return {
    timeAnalysis: asText(
      aiPayload.timeAnalysis,
      isEnglish
        ? `${castMethodLabel}: ${timeInfo} The formula gives Original Hexagram ${mainHexDisplayName}, Mutual Hexagram ${mutualHexDisplayName}, Changed Hexagram ${changedHexDisplayName}, with moving line ${movingLine}.`
        : `${castMethodLabel}：${timeInfo}，按公式${formula}排出本卦${mainHexName}、互卦${mutualHexName}、变卦${changedHexName}，动爻为第${movingLine}爻。`,
    ),
    mainHex: {
      name: mainHexDisplayName,
      meaning: asText(aiMainHex.meaning, mainMeaning),
    },
    mutualHex: {
      name: mutualHexDisplayName,
      meaning: asText(aiMutualHex.meaning, mutualMeaning),
    },
    changedHex: {
      name: changedHexDisplayName,
      meaning: asText(aiChangedHex.meaning, changedMeaning),
    },
    bodyUseAnalysis: asText(
      aiPayload.bodyUseAnalysis,
      isEnglish
        ? `The body trigram is ${body.name}, placed in the ${positionLabel(locale, body.position)}, element ${body.element}. The use trigram is ${use.name}, placed in the ${positionLabel(locale, use.position)}, element ${use.element}.`
        : `体卦为${body.name}，位在${positionLabel(locale, body.position)}，五行属${body.element}；用卦为${use.name}，位在${positionLabel(locale, use.position)}，五行属${use.element}。`,
    ),
    fiveElementAnalysis: asText(
      aiPayload.fiveElementAnalysis,
      isEnglish
        ? `${body.element} and ${use.element} form ${relation.relation}. The core status is ${relation.status}. ${relation.summary}`
        : `${body.element}与${use.element}形成${relation.relation}，核心吉凶为${relation.status}。${relation.summary}`,
    ),
    seasonalAnalysis: asText(aiPayload.seasonalAnalysis, seasonal.summary),
    omenAnalysis: asText(aiPayload.omenAnalysis, omen.summary),
    meaning: asText(
      aiPayload.meaning,
      isEnglish
        ? `This reading centers on the body/use five-element relation. ${relation.summary} The original hexagram shows the present, the mutual hexagram shows the process, and the changed hexagram shows the tendency.`
        : `本断以体用五行生克为主，${relation.summary}本卦看当前，互卦看过程，变卦看趋势。`,
    ),
    advice: asText(
      aiPayload.advice,
      isEnglish
        ? (relation.status === 'Inauspicious' || relation.status === 'Unfavorable'
          ? 'Step back, reduce avoidable strain, and wait for conditions to turn before pressing forward.'
          : 'Move with the favorable pattern, while staying steady and using season and omen only as supporting context.')
        : (relation.status === '大凶' || relation.status === '不利'
          ? '宜先退守审势，减少消耗，待条件转顺后再推进。'
          : '可顺势推进，但仍需守正稳行，以时令外应为辅，不可轻躁。'),
    ),
    formula,
    castMethod: divinationData.castMethod,
    castMethodLabel,
    stabilityNote,
    mainHexName,
    mutualHexName,
    changedHexName,
    movingLine,
    body,
    use,
    relation,
    seasonal,
    omen,
    overallStatus: relation.status,
  };
}

export function buildSystemPrompt(divinationDataInput: DivinationData, locale: Locale) {
  const divinationData = withDeterministicSummaries(divinationDataInput, locale);

  if (locale === 'en') {
    return `You are an I Ching interpreter trained in Mei Hua Yi Shu.
The local program has already calculated the deterministic result. You must explain strictly from these fixed data. Do not change hexagram names, moving line, body/use roles, five-element relation, status, or omen status.

Output only English. Do not include Chinese characters.

Fixed data:
- Cast method: ${divinationData.castMethodLabel}
- Cast information: ${divinationData.timeInfo}
- Formula: ${divinationData.formula}
- Original Hexagram: ${divinationData.mainHexDisplayName}, representing beginning/current state
- Mutual Hexagram: ${divinationData.mutualHexDisplayName}, representing inner process/hidden condition
- Changed Hexagram: ${divinationData.changedHexDisplayName}, representing final tendency
- Moving line: Line ${divinationData.movingLine}
- Body Trigram: ${divinationData.body.name} (${positionLabel(locale, divinationData.body.position)}, element ${divinationData.body.element}), representing the querent/main side
- Use Trigram: ${divinationData.use.name} (${positionLabel(locale, divinationData.use.position)}, element ${divinationData.use.element}), representing the matter/counterpart
- Body/use relation: ${divinationData.relation.relation}
- Core status: ${divinationData.relation.status}
- Relation summary: ${divinationData.relation.summary}
- Season: ${divinationData.seasonal.summary}
- Omen: ${divinationData.omen.summary}
${divinationData.stabilityNote ? `- Casting note: ${divinationData.stabilityNote}` : ''}

Interpretation requirements:
1. Follow this order: three hexagrams -> body/use -> five-element relation -> season/omen -> integrated advice.
2. Make the core judgment from body/use generation and control, not elaborate line text.
3. If no external omen was collected, say so and do not invent sights, sounds, people, or events.
4. Write in clear English with a slightly classical but readable tone.
5. overallStatus must exactly equal ${divinationData.relation.status}.

Return this JSON shape:
{
  "timeAnalysis": "Explain how the cast information and formula produce the three hexagrams and moving line",
  "mainHex": { "name": "${divinationData.mainHexDisplayName}", "meaning": "How the original hexagram describes the beginning/current state" },
  "mutualHex": { "name": "${divinationData.mutualHexDisplayName}", "meaning": "How the mutual hexagram describes the inner process/hidden condition" },
  "changedHex": { "name": "${divinationData.changedHexDisplayName}", "meaning": "How the changed hexagram describes the final tendency" },
  "bodyUseAnalysis": "Explain the body trigram ${divinationData.body.name} and use trigram ${divinationData.use.name}",
  "fiveElementAnalysis": "Explain why ${divinationData.body.element} and ${divinationData.use.element} form ${divinationData.relation.relation}; the conclusion must be ${divinationData.relation.status}",
  "seasonalAnalysis": "Explain ${divinationData.seasonal.summary}",
  "omenAnalysis": "Explain ${divinationData.omen.summary}",
  "meaning": "A concise integrated judgment related to the user's question",
  "advice": "Practical advice",
  "overallStatus": "${divinationData.relation.status}"
}`;
  }

  return `你是一位精通梅花易数的解卦师。
本地程序已经按梅花易数计算出确定结果。你必须严格依据这些确定数据解释，不得改动卦名、动爻、体用、五行、生克、吉凶，不得编造外应。

确定数据如下：
- 起卦方式：${divinationData.castMethodLabel}
- 起卦信息：${divinationData.timeInfo}
- 起卦公式：${divinationData.formula}
- 本卦：${divinationData.mainHexName}，代表开始/当前状态
- 互卦：${divinationData.mutualHexName}，代表中间过程/隐情
- 变卦：${divinationData.changedHexName}，代表最终结果/趋势
- 动爻：第${divinationData.movingLine}爻
- 体卦：${divinationData.body.name}（${positionLabel(locale, divinationData.body.position)}，五行属${divinationData.body.element}），代表我、求测者、主方
- 用卦：${divinationData.use.name}（${positionLabel(locale, divinationData.use.position)}，五行属${divinationData.use.element}），代表事、对方、客方
- 体用关系：${divinationData.relation.relation}
- 核心吉凶：${divinationData.relation.status}
- 生克摘要：${divinationData.relation.summary}
- 时令：${divinationData.seasonal.summary}
- 外应：${divinationData.omen.summary}
${divinationData.stabilityNote ? `- 起卦提示：${divinationData.stabilityNote}` : ''}

解读要求：
1. 按“排三卦 -> 定体用 -> 论五行生克 -> 看时令外应 -> 综合建议”的顺序输出。
2. 核心判断以体用生克为主，不以复杂爻辞为主。
3. 外应未取，只能说明未取外应，不得杜撰看到、听到、遇到的事物。
4. 文风古雅但清楚，建议必须能落到用户问题。
5. overallStatus 必须严格等于 ${divinationData.relation.status}。

输出JSON结构：
{
  "timeAnalysis": "说明起卦时间与公式如何推出三卦和动爻",
  "mainHex": { "name": "${divinationData.mainHexName}", "meaning": "本卦如何表示开始/当前" },
  "mutualHex": { "name": "${divinationData.mutualHexName}", "meaning": "互卦如何表示中间过程/隐情" },
  "changedHex": { "name": "${divinationData.changedHexName}", "meaning": "变卦如何表示最终趋势" },
  "bodyUseAnalysis": "解释体卦${divinationData.body.name}与用卦${divinationData.use.name}的定位",
  "fiveElementAnalysis": "解释${divinationData.body.element}与${divinationData.use.element}形成${divinationData.relation.relation}，结论必须是${divinationData.relation.status}",
  "seasonalAnalysis": "解释${divinationData.seasonal.summary}",
  "omenAnalysis": "解释${divinationData.omen.summary}",
  "meaning": "围绕用户问题的综合断语",
  "advice": "可执行建议",
  "overallStatus": "${divinationData.relation.status}"
}`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, timestamp, locale: localeInput, castMethod, castPayload } = req.body;
  const locale = normalizeLocale(localeInput);
  const validationError = getCastRequestValidationError({ prompt, locale: localeInput, castMethod, castPayload });
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    if (!locale) {
      throw new Error('Locale validation invariant failed');
    }

    const rawDivinationData = castByRequest({ castMethod, castPayload, timestamp });
    const systemPrompt = buildSystemPrompt(rawDivinationData, locale);
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    try {
      const text = await withGeminiHighDemandRetry(async () => {
        const userPrompt = locale === 'en' ? `User question: ${prompt}` : `用户求问：${prompt}`;
        const result = await model.generateContent([systemPrompt, userPrompt]);
        const response = await result.response;
        return response.text();
      });

      return res.status(200).json(buildDivinationResponse(rawDivinationData, JSON.parse(text), locale));
    } catch (error) {
      if (!isGeminiHighDemandError(error)) throw error;

      console.warn("Gemini high demand:", error);
      return res.status(503).json({ error: getServiceErrorMessage(locale) });
    }
  } catch (error: any) {
    console.error("Divination/Gemini Error:", error);
    return res.status(500).json({ error: getServiceErrorMessage(locale ?? 'zh-CN') });
  }
}
