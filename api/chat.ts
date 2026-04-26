import { GoogleGenerativeAI } from "@google/generative-ai";
import { castMeihua } from "../src/utils/meihua";

const RELATION_SUMMARY: Record<string, string> = {
  比和: '体用同气，主客同频，事情较易相合。',
  用生体: '事情助我，外部条件生扶主方，最为有利。',
  体克用: '我能制事，虽需费力推动，仍有可成之象。',
  体生用: '我去生事，主方耗泄，易有投入多、回收慢之象。',
  用克体: '事情克我，阻力压身，宜谨慎退守或先化解冲突。',
};

function withDeterministicSummaries(divinationData: ReturnType<typeof castMeihua>) {
  const relation = {
    ...divinationData.relation,
    summary: RELATION_SUMMARY[divinationData.relation.relation],
  };
  const seasonal = {
    ...divinationData.seasonal,
    summary: `体卦属${divinationData.seasonal.bodyElement}，时令为${divinationData.seasonal.seasonName}，体气为${divinationData.seasonal.strength}。时令只作辅助，不覆盖体用生克主断。`,
  };

  return {
    ...divinationData,
    mainHexName: divinationData.mainHex.name,
    mutualHexName: divinationData.mutualHex.name,
    changedHexName: divinationData.changedHex.name,
    relation,
    seasonal,
  };
}

const asText = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback;

const asObject = (value: unknown) =>
  value && typeof value === 'object' ? value as Record<string, unknown> : {};

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
    const divinationData = castMeihua(timestamp);
    const {
      timeInfo,
      formula,
      mainHexName,
      mutualHexName,
      changedHexName,
      movingLine,
      body,
      use,
      relation,
      seasonal,
      omen,
    } = withDeterministicSummaries(divinationData);

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    const systemPrompt = `你是一位精通梅花易数的解卦师。
本地程序已经按梅花易数计算出确定结果。你必须严格依据这些确定数据解释，不得改动卦名、动爻、体用、五行、生克、吉凶，不得编造外应。

确定数据如下：
- 起卦时间：${timeInfo}
- 起卦公式：${formula}
- 本卦：${mainHexName}，代表开始/当前状态
- 互卦：${mutualHexName}，代表中间过程/隐情
- 变卦：${changedHexName}，代表最终结果/趋势
- 动爻：第${movingLine}爻
- 体卦：${body.name}（${body.position === 'upper' ? '上卦' : '下卦'}，五行属${body.element}），代表我、求测者、主方
- 用卦：${use.name}（${use.position === 'upper' ? '上卦' : '下卦'}，五行属${use.element}），代表事、对方、客方
- 体用关系：${relation.relation}
- 核心吉凶：${relation.status}
- 生克摘要：${relation.summary}
- 时令：${seasonal.summary}
- 外应：${omen.summary}

解读要求：
1. 按“排三卦 -> 定体用 -> 论五行生克 -> 看时令外应 -> 综合建议”的顺序输出。
2. 核心判断以体用生克为主，不以复杂爻辞为主。
3. 外应未取，只能说明未取外应，不得杜撰看到、听到、遇到的事物。
4. 文风古雅但清楚，建议必须能落到用户问题。
5. overallStatus 必须严格等于 ${relation.status}。

输出JSON结构：
{
  "timeAnalysis": "说明起卦时间与公式如何推出三卦和动爻",
  "mainHex": { "name": "${mainHexName}", "meaning": "本卦如何表示开始/当前" },
  "mutualHex": { "name": "${mutualHexName}", "meaning": "互卦如何表示中间过程/隐情" },
  "changedHex": { "name": "${changedHexName}", "meaning": "变卦如何表示最终趋势" },
  "bodyUseAnalysis": "解释体卦${body.name}与用卦${use.name}的定位",
  "fiveElementAnalysis": "解释${body.element}与${use.element}形成${relation.relation}，结论必须是${relation.status}",
  "seasonalAnalysis": "解释${seasonal.summary}",
  "omenAnalysis": "解释${omen.summary}",
  "meaning": "围绕用户问题的综合断语",
  "advice": "可执行建议",
  "overallStatus": "${relation.status}"
}`;

    const result = await model.generateContent([systemPrompt, `用户求问：${prompt}`]);
    const response = await result.response;
    const text = response.text();

    const aiPayload = JSON.parse(text);
    const aiMainHex = asObject(aiPayload.mainHex);
    const aiMutualHex = asObject(aiPayload.mutualHex);
    const aiChangedHex = asObject(aiPayload.changedHex);

    return res.status(200).json({
      timeAnalysis: asText(
        aiPayload.timeAnalysis,
        `起卦时间为${timeInfo}，按公式${formula}排出本卦${mainHexName}、互卦${mutualHexName}、变卦${changedHexName}，动爻为第${movingLine}爻。`,
      ),
      mainHex: {
        name: mainHexName,
        meaning: asText(aiMainHex.meaning, `${mainHexName}代表开始/当前状态。`),
      },
      mutualHex: {
        name: mutualHexName,
        meaning: asText(aiMutualHex.meaning, `${mutualHexName}代表中间过程/隐情。`),
      },
      changedHex: {
        name: changedHexName,
        meaning: asText(aiChangedHex.meaning, `${changedHexName}代表最终结果/趋势。`),
      },
      bodyUseAnalysis: asText(
        aiPayload.bodyUseAnalysis,
        `体卦为${body.name}，位在${body.position === 'upper' ? '上卦' : '下卦'}，五行属${body.element}；用卦为${use.name}，位在${use.position === 'upper' ? '上卦' : '下卦'}，五行属${use.element}。`,
      ),
      fiveElementAnalysis: asText(
        aiPayload.fiveElementAnalysis,
        `${body.element}与${use.element}形成${relation.relation}，核心吉凶为${relation.status}。${relation.summary}`,
      ),
      seasonalAnalysis: asText(aiPayload.seasonalAnalysis, seasonal.summary),
      omenAnalysis: asText(aiPayload.omenAnalysis, omen.summary),
      meaning: asText(
        aiPayload.meaning,
        `本断以体用五行生克为主，${relation.summary}本卦看当前，互卦看过程，变卦看趋势。`,
      ),
      advice: asText(
        aiPayload.advice,
        relation.status === '大凶' || relation.status === '不利'
          ? '宜先退守审势，减少消耗，待条件转顺后再推进。'
          : '可顺势推进，但仍需守正稳行，以时令外应为辅，不可轻躁。',
      ),
      formula,
      movingLine,
      body,
      use,
      relation,
      seasonal,
      omen,
      overallStatus: relation.status,
    });
  } catch (error: any) {
    console.error("Divination/Gemini Error:", error);
    return res.status(500).json({ error: "天机运转受阻，请稍后再试" });
  }
}
