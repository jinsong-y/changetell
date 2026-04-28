# Repeat Time Cast Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep time casting as the primary flow, warn on same-question same-hour repeat casts, and guide users to number casting with clear `1-999` validation.

**Architecture:** Add small pure helpers in `InputView.tsx` for number validation and repeat-hour detection so tests can cover behavior without a browser. Let `App.tsx` own the last successful time-cast record and pass repeat-warning state/actions into `InputView`. Keep backend validation in `api/chat.ts` as defense-in-depth for bypassed clients.

**Tech Stack:** React 19, TypeScript, Vite, Vercel serverless API routes, Node `assert` tests run via `tsx`.

---

## File Structure

- Modify `src/components/InputView.tsx`: number validation helpers, repeat-warning UI, time-primary copy, number guidance copy.
- Modify `src/App.tsx`: store last time-cast record, detect same-question same-hour repeat, pass warning/action props.
- Modify `api/chat.ts`: reject number payloads outside `1-999`.
- Modify `src/utils/ui-contract.test.tsx`: tests for number range validation, repeat helper behavior, and rendered guidance copy.
- Modify `src/utils/chat-api.test.ts`: backend validation tests for range limits.

---

### Task 1: Add Pure Validation And Repeat Helpers

**Files:**
- Modify: `src/components/InputView.tsx`
- Test: `src/utils/ui-contract.test.tsx`

- [ ] **Step 1: Write failing helper tests**

Add these assertions after the existing `getNumberCastPayload` assertions in `src/utils/ui-contract.test.tsx`:

```tsx
assert.deepEqual(getNumberCastPayload(['999', '1', '2']), { canCast: true, numbers: [999, 1, 2], error: '' });
assert.deepEqual(getNumberCastPayload(['1', '8', '']), { canCast: true, numbers: [1, 8], error: '' });
assert.equal(getNumberCastPayload(['0', '8', '']).error, '上卦数和下卦数需填写 1 到 999 的整数');
assert.equal(getNumberCastPayload(['1', '1000', '']).error, '上卦数和下卦数需填写 1 到 999 的整数');
assert.equal(getNumberCastPayload(['1', '8', '1000']).error, '动爻数如填写，也需是 1 到 999 的整数');
assert.equal(getNumberCastPayload(['1.5', '8', '']).canCast, false);

assert.equal(normalizePromptForRepeat('  去 上海   发展？ '), '去 上海 发展？');
assert.equal(getChineseZhiHourIndex(new Date('2026-04-28T23:30:00+08:00')), 0);
assert.equal(getChineseZhiHourIndex(new Date('2026-04-28T01:30:00+08:00')), 1);
assert.equal(getTimeCastRepeatKey('问事', new Date('2026-04-28T01:30:00+08:00')), '问事|2026-04-28:1');
assert.equal(
  isRepeatTimeCast(
    { key: '问事|2026-04-28:1' },
    ' 问事 ',
    new Date('2026-04-28T01:50:00+08:00'),
  ),
  true,
);
assert.equal(
  isRepeatTimeCast(
    { key: '问事|2026-04-28:1' },
    '另一件事',
    new Date('2026-04-28T01:50:00+08:00'),
  ),
  false,
);
assert.equal(
  isRepeatTimeCast(
    { key: '问事|2026-04-28:1' },
    '问事',
    new Date('2026-04-28T03:01:00+08:00'),
  ),
  false,
);
```

Update the import:

```tsx
import InputView, {
  getCastTimestamp,
  getChineseZhiHourIndex,
  getNumberCastPayload,
  getTimeCastRepeatKey,
  getVisualHexagram,
  isRepeatTimeCast,
  normalizePromptForRepeat,
} from '../components/InputView';
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test:meihua
```

Expected: FAIL because `getChineseZhiHourIndex`, `getTimeCastRepeatKey`, `isRepeatTimeCast`, and `normalizePromptForRepeat` are not exported, and `getNumberCastPayload` does not yet return `error`.

- [ ] **Step 3: Add minimal helper implementation**

In `src/components/InputView.tsx`, replace `parseNumberInput` and `getNumberCastPayload` with:

```tsx
const NUMBER_CAST_MIN = 1;
const NUMBER_CAST_MAX = 999;
const REQUIRED_NUMBER_ERROR = '上卦数和下卦数需填写 1 到 999 的整数';
const MOVING_NUMBER_ERROR = '动爻数如填写，也需是 1 到 999 的整数';

const parseNumberInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return Number.NaN;

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= NUMBER_CAST_MIN && parsed <= NUMBER_CAST_MAX
    ? parsed
    : Number.NaN;
};

export const getNumberCastPayload = (inputs: string[]) => {
  const upper = parseNumberInput(inputs[0] ?? '');
  const lower = parseNumberInput(inputs[1] ?? '');
  const moving = parseNumberInput(inputs[2] ?? '');
  const hasRequiredNumbers = upper !== null && lower !== null;
  const requiredNumbersValid = hasRequiredNumbers && Number.isFinite(upper) && Number.isFinite(lower);
  const movingValid = moving === null || Number.isFinite(moving);
  const canCast = requiredNumbersValid && movingValid;

  let error = '';
  if (!requiredNumbersValid && (inputs[0]?.trim() || inputs[1]?.trim())) {
    error = REQUIRED_NUMBER_ERROR;
  } else if (requiredNumbersValid && !movingValid) {
    error = MOVING_NUMBER_ERROR;
  }

  return {
    canCast,
    numbers: canCast ? [upper as number, lower as number, ...(moving === null ? [] : [moving as number])] : [],
    error,
  };
};
```

Add these exported helpers below `getCastTimestamp`:

```tsx
export interface TimeCastRecord {
  key: string;
}

export const normalizePromptForRepeat = (prompt: string) => prompt.trim().replace(/\s+/g, ' ');

export const getChineseZhiHourIndex = (date = new Date()) => {
  const hour = date.getHours();
  return hour === 23 ? 0 : Math.floor((hour + 1) / 2);
};

export const getTimeCastRepeatKey = (prompt: string, date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${normalizePromptForRepeat(prompt)}|${year}-${month}-${day}:${getChineseZhiHourIndex(date)}`;
};

export const isRepeatTimeCast = (lastRecord: TimeCastRecord | null, prompt: string, date = new Date()) =>
  Boolean(lastRecord && normalizePromptForRepeat(prompt) && lastRecord.key === getTimeCastRepeatKey(prompt, date));
```

- [ ] **Step 4: Run helper tests**

Run:

```bash
npm run test:meihua
```

Expected: PASS for helper tests and existing tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/InputView.tsx src/utils/ui-contract.test.tsx
git commit -m "test: cover time repeat and number validation helpers"
```

---

### Task 2: Add Half-Intercept UI And App State

**Files:**
- Modify: `src/components/InputView.tsx`
- Modify: `src/App.tsx`
- Test: `src/utils/ui-contract.test.tsx`

- [ ] **Step 1: Write failing UI contract tests**

In `src/utils/ui-contract.test.tsx`, add:

```tsx
const repeatWarningHtml = renderToStaticMarkup(
  <InputView
    onCast={() => {}}
    repeatWarning="同一时辰内相同问题不宜重复起卦。若此念已变，可改用报数起卦。"
    onUseNumbers={() => {}}
    onContinueTime={() => {}}
  />,
);
assert.ok(repeatWarningHtml.includes('同一时辰内相同问题不宜重复起卦'));
assert.ok(repeatWarningHtml.includes('改用报数起卦'));
assert.ok(repeatWarningHtml.includes('仍用时辰起卦'));
assert.ok(inputHtml.includes('优先以当前时辰起卦'));
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test:meihua
```

Expected: FAIL because `InputView` does not accept `repeatWarning`, `onUseNumbers`, or `onContinueTime`, and copy is missing.

- [ ] **Step 3: Update `InputView` props and copy**

Replace the component signature with:

```tsx
interface InputViewProps {
  onCast: (prompt: string, timestamp: string, options?: CastOptions) => void;
  repeatWarning?: string;
  onUseNumbers?: () => void;
  onContinueTime?: () => void;
  forceNumbersMode?: boolean;
  initialCastMethod?: CastMethod;
}

export default function InputView({
  onCast,
  repeatWarning,
  onUseNumbers,
  onContinueTime,
  forceNumbersMode,
  initialCastMethod = 'time',
}: InputViewProps) {
```

Change the cast method state initialization:

```tsx
const [castMethod, setCastMethod] = useState<CastMethod>(initialCastMethod);
```

Replace the current guidance block text with:

```tsx
优先以当前时辰起卦。凡占卜者，必诚心正意。
```

Add this repeat-warning block above the method selector:

```tsx
{repeatWarning && (
  <div className="border border-[#e0af68] bg-[#e0af68]/10 p-3 text-sm text-[#e0af68] flex flex-col gap-3">
    <p className="leading-relaxed break-words">{repeatWarning}</p>
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        type="button"
        onClick={onUseNumbers}
        className="border border-[#73daca] bg-[#73daca]/10 px-3 py-2 text-xs font-bold tracking-widest text-[#73daca]"
      >
        改用报数起卦
      </button>
      <button
        type="button"
        onClick={onContinueTime}
        className="border border-[#414868] bg-[#1a1b26] px-3 py-2 text-xs font-bold tracking-widest text-[#8a98c9]"
      >
        仍用时辰起卦
      </button>
    </div>
  </div>
)}
```

Add this effect below existing state declarations:

```tsx
useEffect(() => {
  if (forceNumbersMode) {
    setCastMethod('numbers');
  }
}, [forceNumbersMode]);
```

- [ ] **Step 4: Wire repeat detection in `App.tsx`**

In `src/App.tsx`, change imports:

```tsx
import InputView, {
  getCastTimestamp,
  getTimeCastRepeatKey,
  isRepeatTimeCast,
  type CastOptions,
  type TimeCastRecord,
} from './components/InputView';
```

Add state:

```tsx
const [lastTimeCast, setLastTimeCast] = useState<TimeCastRecord | null>(null);
const [repeatWarning, setRepeatWarning] = useState('');
const [pendingTimeCast, setPendingTimeCast] = useState<{ prompt: string; timestamp: string } | null>(null);
const [forceNumbersMode, setForceNumbersMode] = useState(false);
```

Add helper:

```tsx
const submitCast = async (prompt: string, timestamp: string, options?: CastOptions) => {
  setView('loading');
  setError('');
  setRepeatWarning('');
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        timestamp,
        castMethod: options?.method ?? 'time',
        castPayload: {
          numbers: options?.numbers,
        },
      }),
    });

    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(response.ok ? '服务返回格式异常，请稍后再试' : text || '服务暂时不可用，请稍后再试');
    }

    if (data.error) throw new Error(data.error);
    if (!response.ok) throw new Error('服务暂时不可用，请稍后再试');

    if ((options?.method ?? 'time') === 'time') {
      setLastTimeCast({ key: getTimeCastRepeatKey(prompt, new Date(timestamp)) });
    }

    setResultData(data);
    setView('result');
  } catch (err: any) {
    console.error(err);
    setError(err.message || '获取解析失败，请重试');
    setView('input');
  }
};
```

Replace `handleCast` with:

```tsx
const handleCast = async (prompt: string, timestamp: string, options?: CastOptions) => {
  setForceNumbersMode(false);

  if ((options?.method ?? 'time') === 'time' && isRepeatTimeCast(lastTimeCast, prompt, new Date(timestamp))) {
    setPendingTimeCast({ prompt, timestamp });
    setRepeatWarning('同一时辰内相同问题不宜重复起卦。若此念已变，可改用报数起卦。');
    return;
  }

  await submitCast(prompt, timestamp, options);
};
```

Pass props:

```tsx
{view === 'input' && (
  <InputView
    onCast={handleCast}
    repeatWarning={repeatWarning}
    onUseNumbers={() => {
      setRepeatWarning('');
      setPendingTimeCast(null);
      setForceNumbersMode(true);
    }}
    onContinueTime={() => {
      if (!pendingTimeCast) return;
      void submitCast(pendingTimeCast.prompt, pendingTimeCast.timestamp, { method: 'time' });
      setPendingTimeCast(null);
    }}
    forceNumbersMode={forceNumbersMode}
  />
)}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm run test:meihua
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/InputView.tsx src/utils/ui-contract.test.tsx
git commit -m "feat: warn on repeated time casts"
```

---

### Task 3: Add Number Guidance And Range UI

**Files:**
- Modify: `src/components/InputView.tsx`
- Test: `src/utils/ui-contract.test.tsx`

- [ ] **Step 1: Write failing copy tests**

Add to `src/utils/ui-contract.test.tsx`:

```tsx
const numberInputHtml = renderToStaticMarkup(<InputView onCast={() => {}} initialCastMethod="numbers" />);
for (const text of [
  '静心后，随心写下 2 到 3 个整数。不必计算，不必选吉数。',
  '随心第一个整数',
  '随心第二个整数',
  '可选，不填则以前两数相加定动爻',
  '1-999',
]) {
  assert.ok(numberInputHtml.includes(text), `missing ${text}`);
}
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test:meihua
```

Expected: FAIL because guidance copy is not rendered yet.

- [ ] **Step 3: Add guidance copy and input attributes**

In `InputView.tsx`, replace the number input block with:

```tsx
{castMethod === 'numbers' && (
  <div className="flex flex-col gap-3">
    <p className="text-xs text-[#8a98c9] leading-relaxed">
      静心后，随心写下 2 到 3 个整数。不必计算，不必选吉数。范围 1-999。
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {[
        { label: '上卦数', hint: '随心第一个整数', required: true },
        { label: '下卦数', hint: '随心第二个整数', required: true },
        { label: '动爻数', hint: '可选，不填则以前两数相加定动爻', required: false },
      ].map((field, index) => (
        <label key={field.label} className="border border-[#414868] bg-[#24283b] p-2 flex flex-col gap-1 focus-within:border-[#bb9af7] transition-colors">
          <span className="text-[10px] text-[#565f89] tracking-widest">
            {field.label}{field.required ? ' · 必填' : ' · 可选'}
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={numberInputs[index]}
            onChange={(event) => {
              const next = [...numberInputs];
              next[index] = event.target.value.replace(/\D/g, '').slice(0, 3);
              setNumberInputs(next);
            }}
            className="bg-transparent border-none outline-none text-[#c0caf5] text-sm placeholder-[#565f89] focus:ring-0"
            placeholder={field.hint}
            aria-label={field.label}
          />
        </label>
      ))}
    </div>
    {numberCastPayload.error && (
      <p className="text-xs text-[#f7768e] leading-relaxed">{numberCastPayload.error}</p>
    )}
  </div>
)}
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm run test:meihua
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/InputView.tsx src/utils/ui-contract.test.tsx
git commit -m "feat: clarify number cast inputs"
```

---

### Task 4: Add Backend `1-999` Defense

**Files:**
- Modify: `api/chat.ts`
- Test: `src/utils/chat-api.test.ts`

- [ ] **Step 1: Write failing backend validation tests**

Add to `src/utils/chat-api.test.ts`:

```ts
for (const numbers of [[0, 8], [1, 1000], [1.5, 8], [1, 8, 1000], [1, 8, 0]]) {
  assert.equal(
    getCastRequestValidationError({
      prompt: '问事',
      castMethod: 'numbers',
      castPayload: { numbers },
    }),
    '报数起卦数字需为 1 到 999 的整数',
  );
}
assert.equal(
  getCastRequestValidationError({
    prompt: '问事',
    castMethod: 'numbers',
    castPayload: { numbers: [999, 1, 999] },
  }),
  null,
);
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test:meihua
```

Expected: FAIL because backend validation currently only checks numeric existence for first two values.

- [ ] **Step 3: Add backend range validator**

In `api/chat.ts`, add above `getCastRequestValidationError`:

```ts
const isValidNumberCastValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 999;
};
```

Replace the number validation block inside `getCastRequestValidationError` with:

```ts
if (input.castMethod === 'numbers') {
  const numbers = input.castPayload?.numbers;
  const upper = Array.isArray(numbers) ? numbers[0] : undefined;
  const lower = Array.isArray(numbers) ? numbers[1] : undefined;
  const moving = Array.isArray(numbers) ? numbers[2] : undefined;

  if (upper === undefined || lower === undefined) {
    return '报数起卦至少需要填写上卦数和下卦数';
  }

  if (!isValidNumberCastValue(upper) || !isValidNumberCastValue(lower) || (moving !== undefined && !isValidNumberCastValue(moving))) {
    return '报数起卦数字需为 1 到 999 的整数';
  }
}
```

- [ ] **Step 4: Run backend tests**

Run:

```bash
npm run test:meihua
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add api/chat.ts src/utils/chat-api.test.ts
git commit -m "fix: validate number cast range in api"
```

---

### Task 5: Final Verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run full local verification**

Run:

```bash
npm run test:meihua
npm run lint
npm run build
git diff --check
```

Expected:

- `npm run test:meihua` prints `meihua deterministic rules passed`, `ui contract tests passed`, and `chat request validation tests passed`.
- `npm run lint` exits 0.
- `npm run build` exits 0.
- `git diff --check` exits 0 with no output.

- [ ] **Step 2: Run Vercel build check**

Run:

```bash
npx vercel build
find .vercel/output/functions -maxdepth 2 -type d -print 2>/dev/null | sort
```

Expected function list:

```text
.vercel/output/functions
.vercel/output/functions/api
.vercel/output/functions/api/chat.func
.vercel/output/functions/api/iching.func
.vercel/output/functions/api/meihua.func
```

- [ ] **Step 3: Commit final verification notes only if files changed**

If no files changed after verification, do not commit. If verification generated tracked changes, inspect them first:

```bash
git status --short
```

Expected: only intentional source/test files are modified or nothing is modified.
