# Meihua Flow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the divination result flow so the app follows Meihua Yishu: three hexagrams, body/use roles, five-element relation, seasonal support, omen note, and final advice.

**Architecture:** Extract deterministic Meihua rules into one shared TypeScript utility, then use it from the Vercel API route before calling Gemini. The frontend keeps the existing dark card style and `BigHexagram` display, but renders the result as a flow: cast three hexagrams, assign body/use, judge five elements, note season/omen, then summarize.

**Tech Stack:** React 19, Vite 6, TypeScript, `lunar-typescript`, Vercel serverless function in `api/chat.ts`, Gemini SDK, `tsx` for lightweight rule tests.

---

## File Structure

- Create `src/utils/meihua.ts`: shared deterministic Meihua rule engine. Owns trigram maps, hexagram table, cast calculation, body/use role calculation, five-element relation, seasonal analysis, and final payload shape helpers.
- Create `src/utils/meihua.test.ts`: lightweight `node:assert` tests run by `tsx`, focused on deterministic rules.
- Modify `package.json`: add `test:meihua` script. No runtime dependency changes needed.
- Modify `api/chat.ts`: import shared rule engine, remove duplicated local maps, inject deterministic fields into the Gemini prompt, return deterministic fields merged with AI text.
- Modify `src/components/ResultView.tsx`: update TypeScript shape and render the confirmed C flow.
- Modify `README.md`: update feature wording to mention body/use and Vercel environment variable expectations.

## Vercel Deployment Notes

- Keep `api/chat.ts` as a default-export serverless handler so Vercel keeps routing `/api/chat`.
- Do not import browser-only packages into `api/chat.ts`.
- Keep shared utility free of React, DOM, Node-only APIs, and mutable global state so it can bundle for both API and frontend.
- Preserve `GOOGLE_GENERATIVE_AI_API_KEY` env usage. Vercel must have this variable configured.
- Run `npm run lint` and `npm run build` before deployment. The build must not require the Gemini env var because the API route is bundled separately by Vercel.

---

### Task 1: Extract Deterministic Meihua Rules

**Files:**
- Create: `src/utils/meihua.ts`
- Create: `src/utils/meihua.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Add the test script**

Edit `package.json` scripts to include:

```json
"test:meihua": "tsx src/utils/meihua.test.ts"
```

Expected scripts block:

```json
{
  "dev": "vite --port=3000 --host=0.0.0.0",
  "build": "vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist",
  "lint": "tsc --noEmit",
  "test:meihua": "tsx src/utils/meihua.test.ts"
}
```

- [ ] **Step 2: Write failing tests for body/use and five elements**

Create `src/utils/meihua.test.ts`:

```ts
import assert from 'node:assert/strict';
import {
  analyzeRelation,
  getBodyUseRoles,
  getSeasonalAnalysis,
  getTrigramElement,
} from './meihua';

assert.equal(getTrigramElement('天'), '金');
assert.equal(getTrigramElement('泽'), '金');
assert.equal(getTrigramElement('地'), '土');
assert.equal(getTrigramElement('山'), '土');
assert.equal(getTrigramElement('雷'), '木');
assert.equal(getTrigramElement('风'), '木');
assert.equal(getTrigramElement('水'), '水');
assert.equal(getTrigramElement('火'), '火');

const lowerMoving = getBodyUseRoles({
  upperName: '天',
  lowerName: '雷',
  movingLine: 2,
});
assert.equal(lowerMoving.body.name, '天');
assert.equal(lowerMoving.body.position, 'upper');
assert.equal(lowerMoving.use.name, '雷');
assert.equal(lowerMoving.use.position, 'lower');

const upperMoving = getBodyUseRoles({
  upperName: '火',
  lowerName: '水',
  movingLine: 5,
});
assert.equal(upperMoving.body.name, '水');
assert.equal(upperMoving.body.position, 'lower');
assert.equal(upperMoving.use.name, '火');
assert.equal(upperMoving.use.position, 'upper');

assert.equal(analyzeRelation('木', '水').relation, '用生体');
assert.equal(analyzeRelation('木', '木').relation, '比和');
assert.equal(analyzeRelation('木', '土').relation, '体克用');
assert.equal(analyzeRelation('木', '火').relation, '体生用');
assert.equal(analyzeRelation('木', '金').relation, '用克体');

assert.equal(getSeasonalAnalysis('木', 1).strength, '旺');
assert.equal(getSeasonalAnalysis('火', 5).strength, '旺');
assert.equal(getSeasonalAnalysis('金', 8).strength, '旺');
assert.equal(getSeasonalAnalysis('水', 11).strength, '旺');
assert.equal(getSeasonalAnalysis('土', 6).strength, '旺');

console.log('meihua deterministic rules passed');
```

- [ ] **Step 3: Run tests and confirm failure**

Run:

```bash
npm run test:meihua
```

Expected: FAIL because `src/utils/meihua.ts` does not exist yet.

- [ ] **Step 4: Implement shared Meihua utility**

Create `src/utils/meihua.ts`:

```ts
import { Solar } from 'lunar-typescript';

export type TrigramName = '天' | '泽' | '火' | '雷' | '风' | '水' | '山' | '地';
export type ElementName = '金' | '木' | '水' | '火' | '土';
export type PositionName = 'upper' | 'lower';
export type RelationName = '用生体' | '比和' | '体克用' | '体生用' | '用克体';
export type RelationStatus = '大吉' | '小吉' | '不利' | '大凶';
export type SeasonalStrength = '旺' | '相' | '休' | '囚';

export interface HexInfo {
  name: string;
  meaning: string;
}

export interface TrigramRole {
  name: TrigramName;
  position: PositionName;
  element: ElementName;
  role: '体' | '用';
  description: string;
}

export interface RelationAnalysis {
  relation: RelationName;
  status: RelationStatus;
  summary: string;
}

export interface SeasonalAnalysis {
  bodyElement: ElementName;
  season: string;
  strength: SeasonalStrength;
  summary: string;
}

export interface OmenAnalysis {
  used: false;
  summary: string;
}

export interface CastResult {
  timeInfo: string;
  formula: string;
  upperName: TrigramName;
  lowerName: TrigramName;
  mainHexName: string;
  mutualHexName: string;
  changedHexName: string;
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

export const TRIGRAM_BINARY: Record<TrigramName, string> = {
  天: '111',
  泽: '011',
  火: '101',
  雷: '001',
  风: '110',
  水: '010',
  山: '100',
  地: '000',
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

export const HEXAGRAMS_TABLE: Record<TrigramName, Record<TrigramName, string>> = {
  天: { 天: '乾为天', 泽: '天泽履', 火: '天火同人', 雷: '天雷无妄', 风: '天风姤', 水: '天水讼', 山: '天山遁', 地: '天地否' },
  泽: { 天: '泽天夬', 泽: '兑为泽', 火: '泽火革', 雷: '泽雷随', 风: '泽风大过', 水: '泽水困', 山: '泽山咸', 地: '泽地萃' },
  火: { 天: '火天大有', 泽: '火泽睽', 火: '离为火', 雷: '火雷噬嗑', 风: '火风鼎', 水: '火水未济', 山: '火山旅', 地: '火地晋' },
  雷: { 天: '雷天大壮', 泽: '雷泽归妹', 火: '雷火丰', 雷: '震为雷', 风: '雷风恒', 水: '雷水解', 山: '雷山小过', 地: '雷地豫' },
  风: { 天: '风天小畜', 泽: '风泽中孚', 火: '风火家人', 雷: '风雷益', 风: '巽为风', 水: '风水涣', 山: '风山渐', 地: '风地观' },
  水: { 天: '水天需', 泽: '水泽节', 火: '水火既济', 雷: '水雷屯', 风: '水风井', 水: '坎为水', 山: '水山蹇', 地: '水地比' },
  山: { 天: '山天大畜', 泽: '山泽损', 火: '山火贲', 雷: '山雷颐', 风: '山风蛊', 水: '山水蒙', 山: '艮为山', 地: '山地剥' },
  地: { 天: '地天泰', 泽: '地泽临', 火: '地火明夷', 雷: '地雷复', 风: '地风升', 水: '地水师', 山: '地山谦', 地: '坤为地' },
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
  return index === 0 ? 8 : index;
}

export function getTrigramElement(name: TrigramName): ElementName {
  return TRIGRAM_ELEMENTS[name];
}

export function findTrigramByBinary(binary: string): TrigramName {
  const found = Object.entries(TRIGRAM_BINARY).find(([, value]) => value === binary);
  if (!found) throw new Error(`Unknown trigram binary: ${binary}`);
  return found[0] as TrigramName;
}

export function getBodyUseRoles(input: {
  upperName: TrigramName;
  lowerName: TrigramName;
  movingLine: number;
}): { body: TrigramRole; use: TrigramRole } {
  const lowerIsUse = input.movingLine <= 3;
  const bodyName = lowerIsUse ? input.upperName : input.lowerName;
  const useName = lowerIsUse ? input.lowerName : input.upperName;
  const bodyPosition: PositionName = lowerIsUse ? 'upper' : 'lower';
  const usePosition: PositionName = lowerIsUse ? 'lower' : 'upper';

  return {
    body: {
      name: bodyName,
      position: bodyPosition,
      element: getTrigramElement(bodyName),
      role: '体',
      description: '动爻不在之经卦，代表我方、求测者、主方。',
    },
    use: {
      name: useName,
      position: usePosition,
      element: getTrigramElement(useName),
      role: '用',
      description: '动爻所在之经卦，代表事情、对方、客方。',
    },
  };
}

export function analyzeRelation(bodyElement: ElementName, useElement: ElementName): RelationAnalysis {
  if (bodyElement === useElement) {
    return { relation: '比和', status: '大吉', summary: '体用同气，主客同频，事情较易相合。' };
  }
  if (GENERATES[useElement] === bodyElement) {
    return { relation: '用生体', status: '大吉', summary: '事情助我，外部条件生扶主方，最为有利。' };
  }
  if (CONTROLS[bodyElement] === useElement) {
    return { relation: '体克用', status: '小吉', summary: '我能制事，虽需费力推动，仍有可成之象。' };
  }
  if (GENERATES[bodyElement] === useElement) {
    return { relation: '体生用', status: '不利', summary: '我去生事，主方耗泄，易有投入多、回收慢之象。' };
  }
  return { relation: '用克体', status: '大凶', summary: '事情克我，阻力压身，宜谨慎退守或先化解冲突。' };
}

export function getSeasonName(lunarMonth: number): string {
  if ([1, 2, 3].includes(lunarMonth)) return '春';
  if ([4, 5].includes(lunarMonth)) return '夏';
  if ([6, 9, 12].includes(lunarMonth)) return '长夏/四季土';
  if ([7, 8].includes(lunarMonth)) return '秋';
  return '冬';
}

export function getSeasonalAnalysis(bodyElement: ElementName, lunarMonth: number): SeasonalAnalysis {
  const season = getSeasonName(lunarMonth);
  const seasonElement: Record<string, ElementName> = {
    春: '木',
    夏: '火',
    '长夏/四季土': '土',
    秋: '金',
    冬: '水',
  };
  const activeElement = seasonElement[season];
  let strength: SeasonalStrength = '休';
  if (bodyElement === activeElement) strength = '旺';
  else if (GENERATES[activeElement] === bodyElement) strength = '相';
  else if (CONTROLS[activeElement] === bodyElement) strength = '囚';

  return {
    bodyElement,
    season,
    strength,
    summary: `体卦属${bodyElement}，时令为${season}，体气为${strength}。时令只作辅助，不覆盖体用生克主断。`,
  };
}

export function castMeihua(timestamp?: string | Date): CastResult {
  const date = timestamp ? new Date(timestamp) : new Date();
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  const yearZhiIndex = lunar.getYearZhiIndex() + 1;
  const month = lunar.getMonth();
  const day = lunar.getDay();
  const hourZhiIndex = lunar.getTimeZhiIndex() + 1;

  const upperIndex = (yearZhiIndex + month + day) % 8;
  const lowerIndex = (yearZhiIndex + month + day + hourZhiIndex) % 8;
  let movingLine = (yearZhiIndex + month + day + hourZhiIndex) % 6;
  if (movingLine === 0) movingLine = 6;

  const upperName = TRIGRAM_MAP[normalizeTrigramIndex(upperIndex)];
  const lowerName = TRIGRAM_MAP[normalizeTrigramIndex(lowerIndex)];
  const mainHexName = HEXAGRAMS_TABLE[upperName][lowerName];

  const mainBinary = TRIGRAM_BINARY[lowerName] + TRIGRAM_BINARY[upperName];
  const mutualLowerName = findTrigramByBinary(mainBinary.substring(1, 4));
  const mutualUpperName = findTrigramByBinary(mainBinary.substring(2, 5));
  const mutualHexName = HEXAGRAMS_TABLE[mutualUpperName][mutualLowerName];

  const changedBinaryArr = mainBinary.split('');
  const lineToChange = movingLine - 1;
  changedBinaryArr[lineToChange] = changedBinaryArr[lineToChange] === '1' ? '0' : '1';
  const changedLowerName = findTrigramByBinary(changedBinaryArr.slice(0, 3).join(''));
  const changedUpperName = findTrigramByBinary(changedBinaryArr.slice(3, 6).join(''));
  const changedHexName = HEXAGRAMS_TABLE[changedUpperName][changedLowerName];

  const roles = getBodyUseRoles({ upperName, lowerName, movingLine });
  const relation = analyzeRelation(roles.body.element, roles.use.element);
  const seasonal = getSeasonalAnalysis(roles.body.element, month);

  return {
    timeInfo: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
    formula: `上卦:(${yearZhiIndex}+${month}+${day})%8=${upperIndex}; 下卦:(${yearZhiIndex}+${month}+${day}+${hourZhiIndex})%8=${lowerIndex}; 动爻:${movingLine}`,
    upperName,
    lowerName,
    mainHexName,
    mutualHexName,
    changedHexName,
    movingLine,
    body: roles.body,
    use: roles.use,
    relation,
    seasonal,
    omen: {
      used: false,
      summary: '本次未采外应，不编造声色人事之灵应；以体用五行生克为主。',
    },
  };
}
```

- [ ] **Step 5: Run deterministic tests**

Run:

```bash
npm run test:meihua
```

Expected:

```text
meihua deterministic rules passed
```

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add package.json src/utils/meihua.ts src/utils/meihua.test.ts
git commit -m "feat: add meihua rule engine"
```

---

### Task 2: Use Deterministic Rules in Vercel API

**Files:**
- Modify: `api/chat.ts`

- [ ] **Step 1: Replace duplicated maps and cast logic**

Edit `api/chat.ts` imports:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { castMeihua } from "../src/utils/meihua";
```

Remove `Solar`, `Lunar`, `TRIGRAM_MAP`, `TRIGRAM_BINARY`, `HEXAGRAMS_TABLE`, and the inline cast logic. Inside `try`, use:

```ts
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
} = divinationData;
```

- [ ] **Step 2: Replace Gemini prompt with constrained Meihua prompt**

Use this prompt body:

```ts
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
```

- [ ] **Step 3: Merge deterministic fields into response**

After parsing Gemini JSON, return deterministic fields with AI fields:

```ts
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
```

- [ ] **Step 4: Run type check**

Run:

```bash
npm run lint
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add api/chat.ts
git commit -m "feat: constrain api to meihua body-use rules"
```

---

### Task 3: Render Flow-Based Result UI

**Files:**
- Modify: `src/components/ResultView.tsx`

- [ ] **Step 1: Update result types**

Add these interfaces near existing result types:

```ts
interface TrigramRole {
  name: string;
  position: 'upper' | 'lower';
  element: string;
  role: '体' | '用';
  description: string;
}

interface RelationAnalysis {
  relation: string;
  status: string;
  summary: string;
}

interface SeasonalAnalysis {
  bodyElement: string;
  season: string;
  strength: string;
  summary: string;
}

interface OmenAnalysis {
  used: false;
  summary: string;
}
```

Update `DivinationResult`:

```ts
interface DivinationResult {
  timeAnalysis: string;
  formula?: string;
  mainHex: HexInfo;
  mutualHex: HexInfo;
  changedHex: HexInfo;
  movingLine?: number;
  body: TrigramRole;
  use: TrigramRole;
  relation: RelationAnalysis;
  seasonal: SeasonalAnalysis;
  omen: OmenAnalysis;
  bodyUseAnalysis: string;
  fiveElementAnalysis: string;
  seasonalAnalysis: string;
  omenAnalysis: string;
  meaning: string;
  advice: string;
  overallStatus: string;
}
```

- [ ] **Step 2: Add small display helpers**

Inside `ResultView.tsx`, before `export default function ResultView`, add:

```tsx
const positionLabel = (position: 'upper' | 'lower') => (position === 'upper' ? '上卦' : '下卦');

const SectionLabel = ({ step, title, tone }: { step: string; title: string; tone: string }) => (
  <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center justify-between">
    <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
      <span className={`text-[10px] border px-2 py-0.5 ${tone}`}>{step}</span>
      {title}
    </span>
  </div>
);
```

- [ ] **Step 3: Replace status bar details**

In the status bar, keep current style and display:

```tsx
<span>时间起卦：{data.timeAnalysis}</span>
{data.formula && (
  <span className="text-[#565f89]">推演公式：{data.formula}</span>
)}
{data.movingLine && (
  <span className="text-[#e0af68]">动爻：第{data.movingLine}爻</span>
)}
```

- [ ] **Step 4: Keep three hexagram cards as Step 1**

Retain the existing `BigHexagram` cards for main, mutual, and changed hexagrams, but put them under one flow section titled:

```tsx
<SectionLabel step="01" title="排出三卦" tone="border-[#7aa2f7] text-[#7aa2f7]" />
```

Use copy:

```tsx
主卦 -- 开始/当前
互卦 -- 中间/隐情
变卦 -- 最终/趋势
```

- [ ] **Step 5: Replace oracle/line card with body/use card**

Remove the current "爻辞卜辞解析" card from the core flow. Add:

```tsx
<motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#bb9af7]/40 transition-colors duration-500">
  <SectionLabel step="02" title="分辨体用" tone="border-[#bb9af7] text-[#bb9af7]" />
  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
    {[data.body, data.use].map((role) => (
      <div key={role.role} className="border border-[#414868]/70 bg-[#0c0e13] p-5">
        <div className="text-xs text-[#565f89] tracking-widest mb-2">{role.role}卦</div>
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-2xl font-bold text-[#c0caf5]">{role.name}</h3>
          <span className="text-sm text-[#e0af68]">五行属{role.element}</span>
        </div>
        <p className="text-xs text-[#7aa2f7] mt-2">{positionLabel(role.position)} · {role.description}</p>
      </div>
    ))}
  </div>
  <div className="px-6 pb-6">
    <p className="text-sm text-[#8a98c9] leading-relaxed border-l-2 border-[#bb9af7] pl-4 bg-[#bb9af7]/5 py-3">
      {data.bodyUseAnalysis}
    </p>
  </div>
</motion.article>
```

- [ ] **Step 6: Add five-element relation card**

Add after body/use:

```tsx
<motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#73daca]/40 transition-colors duration-500">
  <SectionLabel step="03" title="五行生克论吉凶" tone="border-[#73daca] text-[#73daca]" />
  <div className="p-6 flex flex-col gap-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="border border-[#414868]/70 bg-[#0c0e13] p-4">
        <div className="text-xs text-[#565f89] tracking-widest">关系</div>
        <div className="text-xl font-bold text-[#73daca] mt-2">{data.relation.relation}</div>
      </div>
      <div className="border border-[#414868]/70 bg-[#0c0e13] p-4">
        <div className="text-xs text-[#565f89] tracking-widest">核心吉凶</div>
        <div className="text-xl font-bold text-[#e0af68] mt-2">{data.relation.status}</div>
      </div>
      <div className="border border-[#414868]/70 bg-[#0c0e13] p-4">
        <div className="text-xs text-[#565f89] tracking-widest">体用五行</div>
        <div className="text-xl font-bold text-[#c0caf5] mt-2">体{data.body.element} / 用{data.use.element}</div>
      </div>
    </div>
    <p className="text-sm text-[#8a98c9] leading-relaxed">{data.fiveElementAnalysis || data.relation.summary}</p>
  </div>
</motion.article>
```

- [ ] **Step 7: Add seasonal and omen card**

Add after relation:

```tsx
<motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#e0af68]/40 transition-colors duration-500">
  <SectionLabel step="04" title="时令与外应" tone="border-[#e0af68] text-[#e0af68]" />
  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="border border-[#414868]/70 bg-[#0c0e13] p-5">
      <div className="text-xs text-[#565f89] tracking-widest mb-2">旺相休囚</div>
      <h3 className="text-xl font-bold text-[#e0af68]">{data.seasonal.season} · 体气{data.seasonal.strength}</h3>
      <p className="text-sm text-[#8a98c9] leading-relaxed mt-3">{data.seasonalAnalysis || data.seasonal.summary}</p>
    </div>
    <div className="border border-[#414868]/70 bg-[#0c0e13] p-5">
      <div className="text-xs text-[#565f89] tracking-widest mb-2">外应</div>
      <h3 className="text-xl font-bold text-[#c0caf5]">未取外应</h3>
      <p className="text-sm text-[#8a98c9] leading-relaxed mt-3">{data.omenAnalysis || data.omen.summary}</p>
    </div>
  </div>
</motion.article>
```

- [ ] **Step 8: Retitle final analysis card**

Change final card title to:

```tsx
05 综合断语与核心建议
```

Keep `data.meaning`, `data.advice`, and status pill. Ensure status pill uses `data.overallStatus`.

- [ ] **Step 9: Run build checks**

Run:

```bash
npm run lint
npm run build
```

Expected: both PASS.

- [ ] **Step 10: Commit Task 3**

Run:

```bash
git add src/components/ResultView.tsx
git commit -m "feat: render meihua flow result"
```

---

### Task 4: Documentation and Vercel Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update feature list**

Replace the existing feature bullets for three-hexagram and AI analysis with:

```md
* **三卦流程推演**：自动推导本卦、互卦、变卦，分别对应当前状态、中间过程与最终趋势。
* **体用生克判断**：按动爻定位体卦与用卦，并以五行生克输出核心吉凶。
* **时令辅助分析**：结合农历月份判断体卦旺相休囚，作为辅助因素修正判断语气。
* **AI 结构化解读**：Gemini 只负责文化化表达与建议，核心卦象、体用、生克、吉凶由本地规则确定。
```

- [ ] **Step 2: Add Vercel env note**

Add this deployment note:

```md
## Vercel 部署

部署到 Vercel 时，需要在 Project Settings → Environment Variables 中配置：

* `GOOGLE_GENERATIVE_AI_API_KEY`：服务端 `/api/chat` 调用 Gemini 使用。

本地 `npm run build` 不需要该变量；线上请求 `/api/chat` 时必须存在。
```

- [ ] **Step 3: Run verification**

Run:

```bash
npm run test:meihua
npm run lint
npm run build
```

Expected:

```text
meihua deterministic rules passed
```

and then `lint` and `build` pass.

- [ ] **Step 4: Optional Vercel build dry run**

Run:

```bash
npx vercel build
```

Expected: PASS if Vercel project/env is configured locally. If it fails because Vercel login/project metadata is missing, record exact error and continue with `npm run build` as primary local verification.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add README.md
git commit -m "docs: document meihua flow deployment"
```

---

### Task 5: Manual Runtime Check

**Files:**
- No source edits expected unless verification reveals a bug.

- [ ] **Step 1: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Vite serves the app on `http://localhost:3000`.

- [ ] **Step 2: Open app and cast a result**

In browser, open:

```text
http://localhost:3000
```

Enter a normal question, submit, and wait for result.

Expected result page sections:

```text
01 排出三卦
02 分辨体用
03 五行生克论吉凶
04 时令与外应
05 综合断语与核心建议
```

- [ ] **Step 3: Confirm no external omen fabrication**

Check the `04 时令与外应` section.

Expected: it says external omen was not taken and does not mention observed sounds, images, people, money, weather, or other fabricated events.

- [ ] **Step 4: Confirm deterministic status wins**

Inspect the page status and API JSON.

Expected: `overallStatus` equals `relation.status`, even if Gemini text phrases the advice more softly.

- [ ] **Step 5: Stop dev server**

Stop the Vite process with `Ctrl+C`.

- [ ] **Step 6: Final commit if fixes were needed**

If runtime check required fixes, commit them:

```bash
git add src api README.md package.json
git commit -m "fix: stabilize meihua flow runtime"
```

If no fixes were needed, no commit is required for this task.

---

## Self-Review

- Spec coverage: Tasks cover deterministic body/use rules, five-element relation, seasonal support, omitted external omen, backend prompt constraints, UI flow C, Vercel env note, and verification.
- Placeholder scan: Plan contains no unresolved implementation markers.
- Type consistency: `body`, `use`, `relation`, `seasonal`, and `omen` are defined in Task 1, returned by Task 2, and consumed by Task 3 with matching property names.
