import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, timestamp } = req.body;
  if (!prompt || !timestamp) return res.status(400).json({ error: "Missing prompt or timestamp" });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite", 
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const systemPrompt = `你是一位精通"梅花易数"时间起卦法的解卦大师。
你的任务是：
1. 根据用户提供的时间戳（${timestamp}），将其转换为农历，并按照梅花易数规则起卦。
   - 上卦：(年支数 + 农历月 + 农历日) 除以 8 的余数。
   - 下卦：(年支数 + 农历月 + 农历日 + 时支数) 除以 8 的余数。
   - 动爻：(年支数 + 农历月 + 农历日 + 时支数) 除以 6 的余数。
2. 推导出【主卦】、【互卦】和【变卦】。
3. 结合用户求问之事（${prompt}），进行深度结构化解析。

输出JSON结构：
{
  "timeAnalysis": "说明时间如何转化为卦象的逻辑",
  "mainHex": { "name": "卦名", "meaning": "含义" },
  "mutualHex": { "name": "卦名", "meaning": "含义" },
  "changedHex": { "name": "卦名", "meaning": "含义" },
  "movingLines": "说明动爻在哪一爻及其代表的变数",
  "judgment": "核心卜辞",
  "meaning": "深度解析（结合主、互、变卦的关系）",
  "advice": "核心建议",
  "overallStatus": "总体状态(如: 大吉/平平/小吉等)"
}
请确保起卦推演严谨，文化底蕴深厚。`;

    const result = await model.generateContent([systemPrompt, `求问之事: ${prompt}`]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: "天机难测，请稍后再试" });
  }
}
