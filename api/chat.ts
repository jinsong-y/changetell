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
    return res.status(200).json({
      ...aiPayload,
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
