# Bilingual Language Switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent Chinese/English language switch where English mode renders the complete app and Gemini result experience in English.

**Architecture:** Add a small project-local i18n provider for frontend UI copy and a shared locale mapping module for backend response text. Send `locale` with every cast request, validate it in `/api/chat`, localize deterministic display fields at the API boundary, and make Gemini service failures return localized errors instead of substitute interpretations.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Node/Vercel serverless functions, Gemini SDK, `tsx` Node assertion tests.

---

## File Structure

- Create `src/i18n/types.ts`: supported locale constants and `Locale` type.
- Create `src/i18n/translations.ts`: frontend UI translation dictionary plus fail-fast translation helpers.
- Create `src/i18n/I18nProvider.tsx`: React context, `localStorage` persistence, `<html lang>` updates.
- Create `src/i18n/useI18n.ts`: exported hook for components.
- Create `api/locale.ts`: shared locale validation, English terminology maps, deterministic display helpers, service error text.
- Modify `src/main.tsx`: wrap `App` with `I18nProvider`.
- Modify `src/App.tsx`: read `locale`, send it to `/api/chat`, use localized request error text.
- Modify `src/components/Header.tsx`: add language segmented control.
- Modify `src/components/InputView.tsx`: replace static UI copy and number validation messages with translated copy.
- Modify `src/components/LoadingView.tsx`: make loading sequence locale-driven.
- Modify `src/components/ResultView.tsx`: translate static result labels and render English display names while keeping hexagram drawings correct.
- Modify `api/chat.ts`: require `locale`, localize validation/errors/prompts/response fields, fail fast when Gemini cannot provide an interpretation.
- Modify `src/utils/ui-contract.test.tsx`: add frontend i18n and English rendering contract tests.
- Modify `src/utils/chat-api.test.ts`: add backend locale contract tests and remove local substitute interpretation expectations.

---

### Task 1: Add Frontend I18n Foundation

**Files:**
- Create: `src/i18n/types.ts`
- Create: `src/i18n/translations.ts`
- Create: `src/i18n/I18nProvider.tsx`
- Create: `src/i18n/useI18n.ts`
- Modify: `src/main.tsx`
- Test: `src/utils/ui-contract.test.tsx`

- [ ] **Step 1: Write failing i18n foundation tests**

Add these imports near the top of `src/utils/ui-contract.test.tsx`:

```tsx
import { getTranslation, getTranslationKeys, translations } from '../i18n/translations';
import { SUPPORTED_LOCALES } from '../i18n/types';
```

Add these assertions near the beginning of the file, after the fixed `date` assertion:

```tsx
assert.deepEqual(SUPPORTED_LOCALES, ['zh-CN', 'en']);

const zhKeys = getTranslationKeys('zh-CN');
const enKeys = getTranslationKeys('en');
assert.deepEqual(enKeys, zhKeys);
assert.equal(getTranslation('zh-CN', 'header.language.zh'), '中文');
assert.equal(getTranslation('en', 'header.language.en'), 'EN');
assert.throws(
  () => getTranslation('en', 'missing.translation.key' as keyof typeof translations.en),
  /Missing translation/,
);
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test:meihua
```

Expected: FAIL because `src/i18n/*` does not exist yet.

- [ ] **Step 3: Add locale types**

Create `src/i18n/types.ts`:

```ts
export const SUPPORTED_LOCALES = ['zh-CN', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh-CN';

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
```

- [ ] **Step 4: Add translation dictionary and fail-fast lookup**

Create `src/i18n/translations.ts`:

```ts
import type { Locale } from './types';

export const translations = {
  'zh-CN': {
    'header.language.zh': '中文',
    'header.language.en': 'EN',
    'app.error.badResponse': '服务返回格式异常，请稍后再试',
    'app.error.serviceUnavailable': '服务暂时不可用，请稍后再试',
    'app.error.castFailed': '获取解析失败，请重试',
    'input.panel.title': '起卦',
    'input.panel.subtitle': '诚心正意',
    'input.intro.primary': '优先以当前时辰起卦。凡占卜者，必诚心正意。',
    'input.intro.prompt': '请在此默念所求之事...',
    'input.intro.warningLine1': '“初筮告，再三渎，渎则不告。”',
    'input.intro.warningLine2': '同一时辰内，不要反复起卦。',
    'input.repeat.useNumbers': '改用报数起卦',
    'input.repeat.continueTime': '仍用时辰起卦',
    'input.method.time': '时间起卦',
    'input.method.numbers': '报数起卦',
    'input.numbers.guidance': '静心后，随心写下 2 到 3 个整数。不必计算，不必选吉数。范围 1-999。',
    'input.numbers.upper': '上卦数',
    'input.numbers.lower': '下卦数',
    'input.numbers.moving': '动爻数',
    'input.numbers.required': '必填',
    'input.numbers.optional': '可选',
    'input.numbers.upperHint': '随心第一个整数',
    'input.numbers.lowerHint': '随心第二个整数',
    'input.numbers.movingHint': '可选，不填则以前两数相加定动爻',
    'input.numbers.requiredError': '上卦数和下卦数需填写 1 到 999 的整数',
    'input.numbers.movingError': '动爻数如填写，也需是 1 到 999 的整数',
    'input.prompt.placeholder': '输入求问之事...',
    'input.matrix.title': '念起卦生',
    'input.matrix.upperLower': '{upper}上 // {lower}下',
    'input.castButton': '掷爻',
    'loading.title': '正在起卦',
    'loading.step.1': '心诚则灵，正在感应...',
    'loading.step.2': '排布天干地支...',
    'loading.step.3': '演化六十四卦象...',
    'loading.step.4': '定体用生克...',
    'loading.step.5': '起卦完成，排图呈现中。',
    'result.status.success': '天机已现，感应成功',
    'result.status.formula': '推演公式',
    'result.status.movingLine': '动爻：第{line}爻',
    'result.section.hexagrams': '排出三卦',
    'result.section.bodyUse': '分辨体用',
    'result.section.fiveElements': '五行生克论吉凶',
    'result.section.seasonOmen': '时令与外应',
    'result.section.summary': '综合断语与核心建议',
    'result.hex.originalSubtitle': '主卦 -- 开始/当前',
    'result.hex.mutualSubtitle': '互卦 -- 中间/隐情',
    'result.hex.changedSubtitle': '变卦 -- 最终/趋势',
    'result.role.body': '体卦',
    'result.role.use': '用卦',
    'result.role.bodyDescription': '动爻不在之经卦，代表我方、求测者、主方。',
    'result.role.useDescription': '动爻所在之经卦，代表事情、对方、客方。',
    'result.position.upper': '上卦',
    'result.position.lower': '下卦',
    'result.elementPrefix': '五行属',
    'result.relation.label': '关系',
    'result.status.label': '核心吉凶',
    'result.bodyUseElements.label': '体用五行',
    'result.bodyUseElements.value': '体{body} / 用{use}',
    'result.season.label': '旺相休囚',
    'result.season.value': '{season} · 体气{strength}',
    'result.omen.label': '外应',
    'result.omen.unused': '未取外应',
    'result.advice.title': '【核心建议】',
    'result.overallStatus': '总体状态: {status}',
    'result.restart': '再起一卦',
  },
  en: {
    'header.language.zh': '中文',
    'header.language.en': 'EN',
    'app.error.badResponse': 'The service returned an invalid response. Please try again later.',
    'app.error.serviceUnavailable': 'The service is temporarily unavailable. Please try again later.',
    'app.error.castFailed': 'Unable to get an interpretation. Please try again.',
    'input.panel.title': 'Cast',
    'input.panel.subtitle': 'Focused Intent',
    'input.intro.primary': 'Time Cast is preferred. Hold the question with sincerity and focus.',
    'input.intro.prompt': 'Enter the matter you wish to ask about...',
    'input.intro.warningLine1': 'The first casting speaks; repeated casting clouds the answer.',
    'input.intro.warningLine2': 'Avoid repeating the same question within the same two-hour period.',
    'input.repeat.useNumbers': 'Use Number Cast',
    'input.repeat.continueTime': 'Continue Time Cast',
    'input.method.time': 'Time Cast',
    'input.method.numbers': 'Number Cast',
    'input.numbers.guidance': 'After settling your mind, enter 2 to 3 whole numbers. Do not calculate or choose lucky numbers. Range: 1-999.',
    'input.numbers.upper': 'Upper Number',
    'input.numbers.lower': 'Lower Number',
    'input.numbers.moving': 'Moving Line Number',
    'input.numbers.required': 'Required',
    'input.numbers.optional': 'Optional',
    'input.numbers.upperHint': 'First number from intuition',
    'input.numbers.lowerHint': 'Second number from intuition',
    'input.numbers.movingHint': 'Optional; blank uses the sum of the first two',
    'input.numbers.requiredError': 'Upper and lower numbers must be whole numbers from 1 to 999',
    'input.numbers.movingError': 'The moving line number, if entered, must be a whole number from 1 to 999',
    'input.prompt.placeholder': 'Enter your question...',
    'input.matrix.title': 'Intent Becomes Hexagram',
    'input.matrix.upperLower': 'Upper {upper} // Lower {lower}',
    'input.castButton': 'Cast',
    'loading.title': 'Casting',
    'loading.step.1': 'Attuning to the question...',
    'loading.step.2': 'Arranging stems and branches...',
    'loading.step.3': 'Evolving the sixty-four hexagrams...',
    'loading.step.4': 'Determining body, use, and five elements...',
    'loading.step.5': 'Cast complete. Preparing the chart.',
    'result.status.success': 'The pattern has formed',
    'result.status.formula': 'Formula',
    'result.status.movingLine': 'Moving Line: Line {line}',
    'result.section.hexagrams': 'Three Hexagrams',
    'result.section.bodyUse': 'Body And Use',
    'result.section.fiveElements': 'Five-Element Judgment',
    'result.section.seasonOmen': 'Season And Omens',
    'result.section.summary': 'Summary And Advice',
    'result.hex.originalSubtitle': 'Original Hexagram -- beginning / current state',
    'result.hex.mutualSubtitle': 'Mutual Hexagram -- inner process / hidden condition',
    'result.hex.changedSubtitle': 'Changed Hexagram -- final tendency',
    'result.role.body': 'Body Trigram',
    'result.role.use': 'Use Trigram',
    'result.role.bodyDescription': 'The trigram without the moving line, representing the querent or main side.',
    'result.role.useDescription': 'The trigram containing the moving line, representing the matter or counterpart.',
    'result.position.upper': 'Upper Trigram',
    'result.position.lower': 'Lower Trigram',
    'result.elementPrefix': 'Element: ',
    'result.relation.label': 'Relation',
    'result.status.label': 'Core Status',
    'result.bodyUseElements.label': 'Body / Use Elements',
    'result.bodyUseElements.value': 'Body {body} / Use {use}',
    'result.season.label': 'Seasonal Strength',
    'result.season.value': '{season} · Body is {strength}',
    'result.omen.label': 'Omen',
    'result.omen.unused': 'No Omen Taken',
    'result.advice.title': 'Core Advice',
    'result.overallStatus': 'Overall Status: {status}',
    'result.restart': 'Cast Again',
  },
} as const;

export type TranslationKey = keyof typeof translations['zh-CN'];

export const getTranslationKeys = (locale: Locale): TranslationKey[] =>
  Object.keys(translations[locale]).sort() as TranslationKey[];

export const getTranslation = (locale: Locale, key: TranslationKey): string => {
  const value = translations[locale][key];
  if (!value) {
    throw new Error(`Missing translation for ${locale}:${String(key)}`);
  }
  return value;
};

export const formatTranslation = (
  locale: Locale,
  key: TranslationKey,
  values: Record<string, string | number>,
) =>
  getTranslation(locale, key).replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = values[token];
    if (value === undefined) {
      throw new Error(`Missing interpolation value ${token} for ${locale}:${String(key)}`);
    }
    return String(value);
  });
```

- [ ] **Step 5: Add provider and hook**

Create `src/i18n/I18nProvider.tsx`:

```tsx
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, isLocale, type Locale } from './types';
import { formatTranslation, getTranslation, type TranslationKey } from './translations';

const STORAGE_KEY = 'change-tell-locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

const readInitialLocale = (initialLocale?: Locale): Locale => {
  if (initialLocale) return initialLocale;
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_LOCALE;
  if (!isLocale(saved)) {
    throw new Error(`Unsupported saved locale: ${saved}`);
  }
  return saved;
};

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => readInitialLocale(initialLocale));

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: setLocaleState,
    t: (key, values) => values ? formatTranslation(locale, key, values) : getTranslation(locale, key),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
```

Create `src/i18n/useI18n.ts`:

```ts
import { useContext } from 'react';
import { I18nContext } from './I18nProvider';

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
};
```

- [ ] **Step 6: Wrap the app provider**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { I18nProvider } from './i18n/I18nProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
```

- [ ] **Step 7: Run tests to verify i18n foundation passes**

Run:

```bash
npm run test:meihua
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/i18n src/main.tsx src/utils/ui-contract.test.tsx
git commit -m "feat: add frontend i18n foundation"
```

---

### Task 2: Localize Frontend UI Components

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/InputView.tsx`
- Modify: `src/components/LoadingView.tsx`
- Modify: `src/components/ResultView.tsx`
- Modify: `src/App.tsx`
- Test: `src/utils/ui-contract.test.tsx`

- [ ] **Step 1: Write failing English UI contract tests**

Add this helper to `src/utils/ui-contract.test.tsx` after imports:

```tsx
import { I18nProvider } from '../i18n/I18nProvider';

const renderWithLocale = (locale: 'zh-CN' | 'en', element: React.ReactElement) =>
  renderToStaticMarkup(<I18nProvider initialLocale={locale}>{element}</I18nProvider>);
```

Add these assertions near the existing `inputHtml`, `numberInputHtml`, `loadingHtml`, and `resultHtml` checks:

```tsx
const englishInputHtml = renderWithLocale('en', <InputView onCast={() => {}} initialCastMethod="numbers" />);
for (const text of ['Cast', 'Time Cast', 'Number Cast', 'Enter your question', 'Upper Number', 'Range: 1-999']) {
  assert.ok(englishInputHtml.includes(text), `missing English input text: ${text}`);
}
for (const text of ['起卦', '报数起卦', '输入求问之事']) {
  assert.ok(!englishInputHtml.includes(text), `English input leaked Chinese text: ${text}`);
}

const englishLoadingHtml = renderWithLocale('en', <LoadingView />);
assert.ok(englishLoadingHtml.includes('Casting'));
assert.ok(!englishLoadingHtml.includes('正在起卦'));

const englishResultHtml = renderWithLocale(
  'en',
  <ResultView
    data={{
      timeAnalysis: 'Time Cast: Jia-Zi year, first month, first day, Zi hour.',
      formula: 'Upper: (1+1+1)%8=3; Lower: (1+1+1+1)%8=4; Moving Line: 4',
      mainHex: { name: 'Force', meaning: 'The original pattern shows active force.' },
      mutualHex: { name: 'Field', meaning: 'The inner process asks for receptivity.' },
      changedHex: { name: 'Sprouting', meaning: 'The final tendency is early growth.' },
      mainHexName: cast.mainHex.name,
      mutualHexName: cast.mutualHex.name,
      changedHexName: cast.changedHex.name,
      movingLine: cast.movingLine,
      body: { ...cast.body, name: 'Heaven', element: 'Metal' },
      use: { ...cast.use, name: 'Lake', element: 'Metal' },
      relation: { relation: 'Same Element', status: 'Very Auspicious', summary: 'Body and use share the same element.' },
      seasonal: { ...cast.seasonal, bodyElement: 'Metal', seasonName: 'Spring', strength: 'Resting', summary: 'Seasonal force is supportive only as context.' },
      omen: { used: false, summary: 'No omen was taken.' },
      bodyUseAnalysis: 'Body and use are clearly positioned.',
      fiveElementAnalysis: 'The five-element relation is favorable.',
      seasonalAnalysis: 'Season is considered as secondary context.',
      omenAnalysis: 'No external omen was collected.',
      meaning: 'The reading is coherent.',
      advice: 'Proceed steadily.',
      overallStatus: 'Very Auspicious',
    }}
    onRestart={() => {}}
  />,
);
for (const text of ['Three Hexagrams', 'Body Trigram', 'Five-Element Judgment', 'Core Advice', 'Cast Again']) {
  assert.ok(englishResultHtml.includes(text), `missing English result text: ${text}`);
}
for (const text of ['排出三卦', '体卦', '五行生克论吉凶', '再起一卦']) {
  assert.ok(!englishResultHtml.includes(text), `English result leaked Chinese text: ${text}`);
}
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test:meihua
```

Expected: FAIL because components still render hardcoded Chinese and do not use `I18nProvider`.

- [ ] **Step 3: Add language switcher to `Header`**

Replace `src/components/Header.tsx` with:

```tsx
import { Terminal } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import type { Locale } from '../i18n/types';

export default function Header({ onViewChange }: { onViewChange: () => void }) {
  const { locale, setLocale, t } = useI18n();
  const options: Locale[] = ['zh-CN', 'en'];

  return (
    <header className="bg-[#1a1b26] font-bold uppercase tracking-tighter w-full top-0 border-b border-[#414868] flex justify-between items-center px-4 h-12 sticky z-50">
      <button type="button" onClick={onViewChange} className="flex items-center gap-2">
        <Terminal className="text-[#7aa2f7] w-5 h-5 transition-opacity" />
        <span className="text-lg text-[#7aa2f7] tracking-widest transition-opacity">CHANGE_TELL</span>
      </button>
      <div className="grid grid-cols-2 border border-[#414868] bg-[#24283b] text-[11px] font-bold tracking-widest">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            className={`px-3 py-1 transition-colors ${
              locale === option
                ? 'bg-[#7aa2f7] text-[#1a1b26]'
                : 'text-[#8a98c9] hover:text-[#7aa2f7]'
            }`}
          >
            {option === 'zh-CN' ? t('header.language.zh') : t('header.language.en')}
          </button>
        ))}
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Localize `App` request and errors**

In `src/App.tsx`, import `useI18n`:

```tsx
import { useI18n } from './i18n/useI18n';
```

Inside `App`, add:

```tsx
const { locale, t } = useI18n();
```

In the request body, add `locale`:

```tsx
body: JSON.stringify({
  prompt,
  timestamp,
  locale,
  castMethod: options?.method ?? 'time',
  castPayload: {
    numbers: options?.numbers,
  },
}),
```

Replace hardcoded client error messages:

```tsx
throw new Error(response.ok ? t('app.error.badResponse') : text || t('app.error.serviceUnavailable'));
```

```tsx
if (!response.ok) throw new Error(t('app.error.serviceUnavailable'));
```

```tsx
setError(err.message || t('app.error.castFailed'));
```

Replace repeat warning assignment:

```tsx
setRepeatWarning(
  locale === 'zh-CN'
    ? '同一时辰内相同问题不宜重复起卦。若此念已变，可改用报数起卦。'
    : 'The same question should not be cast again within the same two-hour period. If your intent has changed, use Number Cast.',
);
```

- [ ] **Step 5: Localize `InputView`**

Import `useI18n`:

```tsx
import { useI18n } from '../i18n/useI18n';
```

Inside `InputView`, add:

```tsx
const { locale, t } = useI18n();
```

Replace number validation constants with locale-keyed constants:

```tsx
const REQUIRED_NUMBER_ERROR_KEY = 'input.numbers.requiredError';
const MOVING_NUMBER_ERROR_KEY = 'input.numbers.movingError';
```

Keep `getNumberCastPayload` returning the existing Chinese error strings for current tests, and add a helper for rendering:

```tsx
const getNumberCastErrorText = (error: string, t: ReturnType<typeof useI18n>['t']) => {
  if (error === REQUIRED_NUMBER_ERROR) return t(REQUIRED_NUMBER_ERROR_KEY);
  if (error === MOVING_NUMBER_ERROR) return t(MOVING_NUMBER_ERROR_KEY);
  return error;
};
```

Replace static JSX text with translation calls:

```tsx
<span className="font-bold text-[#7aa2f7] text-xl tracking-wider">{t('input.panel.title')}</span>
<span className="text-[#565f89] font-medium text-xs tracking-widest text-right">{t('input.panel.subtitle')}</span>
```

```tsx
{t('input.intro.primary')}
{t('input.intro.prompt')}
{t('input.intro.warningLine1')}<br />
{t('input.intro.warningLine2')}
```

Use translated cast method labels:

```tsx
[
  { key: 'time', label: t('input.method.time') },
  { key: 'numbers', label: t('input.method.numbers') },
]
```

Use translated number field labels and hints:

```tsx
[
  { label: t('input.numbers.upper'), hint: t('input.numbers.upperHint'), required: true },
  { label: t('input.numbers.lower'), hint: t('input.numbers.lowerHint'), required: true },
  { label: t('input.numbers.moving'), hint: t('input.numbers.movingHint'), required: false },
]
```

Render required/optional text:

```tsx
{field.label}{field.required ? ` · ${t('input.numbers.required')}` : ` · ${t('input.numbers.optional')}`}
```

Render matrix trigram names according to locale:

```tsx
const displayUpperTri = locale === 'en' ? getTrigramDisplayName(upperTri, locale) : upperTri;
const displayLowerTri = locale === 'en' ? getTrigramDisplayName(lowerTri, locale) : lowerTri;
```

Render the upper/lower line:

```tsx
<p className="text-xs font-medium text-[#565f89] mt-2 tracking-widest">
  {t('input.matrix.upperLower', { upper: displayUpperTri, lower: displayLowerTri })}
</p>
```

Use translated placeholder and button:

```tsx
placeholder={t('input.prompt.placeholder')}
```

```tsx
{t('input.castButton')}
```

- [ ] **Step 6: Localize `LoadingView`**

Replace `LOADING_SEQUENCE` in `src/components/LoadingView.tsx` with:

```tsx
export const LOADING_SEQUENCE_KEYS = [
  'loading.step.1',
  'loading.step.2',
  'loading.step.3',
  'loading.step.4',
  'loading.step.5',
] as const;
```

Import and use `useI18n`:

```tsx
import { useI18n } from '../i18n/useI18n';
```

Inside `LoadingView`:

```tsx
const { t } = useI18n();
```

Render title and steps:

```tsx
<span className="font-bold text-[#7aa2f7] text-xl tracking-wider">{t('loading.title')}</span>
```

```tsx
setSteps(prev => [...prev, t(LOADING_SEQUENCE_KEYS[currentStep])]);
```

Update existing tests to import `LOADING_SEQUENCE_KEYS` instead of `LOADING_SEQUENCE` and assert it includes `'loading.step.4'`.

- [ ] **Step 7: Localize `ResultView` static labels and preserve hexagram drawing**

Import `useI18n`:

```tsx
import { useI18n } from '../i18n/useI18n';
```

Update `BigHexagram` signature:

```tsx
const BigHexagram = ({
  name,
  title,
  subtitle,
}: {
  name: string;
  title: string;
  subtitle: string;
}) => {
```

Continue using `name` only for `getBinaryByHexName(name)`, and use `title` for visible display. In `ResultView`, pass internal Chinese lookup fields to `name` and localized display names to `title`:

```tsx
<BigHexagram name={data.mainHexName ?? data.mainHex.name} title={data.mainHex.name} subtitle={t('result.hex.originalSubtitle')} />
```

Do the same for mutual and changed hexagrams.

Inside `ResultView`, add:

```tsx
const { t } = useI18n();
```

Replace `positionLabel` with an inner function using translations:

```tsx
const positionLabel = (position: 'upper' | 'lower') =>
  position === 'upper' ? t('result.position.upper') : t('result.position.lower');
```

Replace section labels with translations:

```tsx
<SectionLabel step="01" title={t('result.section.hexagrams')} tone="border-[#7aa2f7] text-[#7aa2f7]" />
```

Replace all remaining static labels with `t(...)`, including `result.status.success`, `result.status.formula`, `result.status.movingLine`, `result.role.body`, `result.role.use`, `result.relation.label`, `result.status.label`, `result.bodyUseElements.label`, `result.season.label`, `result.omen.label`, `result.advice.title`, `result.overallStatus`, and `result.restart`.

- [ ] **Step 8: Run frontend contract tests**

Run:

```bash
npm run test:meihua
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx src/components/Header.tsx src/components/InputView.tsx src/components/LoadingView.tsx src/components/ResultView.tsx src/utils/ui-contract.test.tsx
git commit -m "feat: localize frontend interface"
```

---

### Task 3: Add Backend Locale Maps And English Response Builder

**Files:**
- Create: `api/locale.ts`
- Modify: `api/chat.ts`
- Test: `src/utils/chat-api.test.ts`

- [ ] **Step 1: Write failing backend locale tests**

Update imports in `src/utils/chat-api.test.ts`:

```ts
import {
  buildDivinationResponse,
  buildSystemPrompt,
  getCastRequestValidationError,
  getServiceErrorMessage,
  isGeminiHighDemandError,
  normalizeLocale,
  withGeminiHighDemandRetry,
} from '../../api/chat';
```

Replace current `buildLocalFallbackResponse` assertions with:

```ts
assert.equal(normalizeLocale('zh-CN'), 'zh-CN');
assert.equal(normalizeLocale('en'), 'en');
assert.equal(normalizeLocale(undefined), null);
assert.equal(normalizeLocale('fr'), null);

assert.equal(
  getCastRequestValidationError({ prompt: '问事', castMethod: 'time' }),
  'Locale is required',
);
assert.equal(
  getCastRequestValidationError({ prompt: '问事', locale: 'fr', castMethod: 'time' }),
  'Unsupported locale',
);
assert.equal(getCastRequestValidationError({ prompt: '问事', locale: 'zh-CN', castMethod: 'time' }), null);
assert.equal(getCastRequestValidationError({ prompt: 'Question', locale: 'en', castMethod: 'time' }), null);
assert.equal(
  getCastRequestValidationError({ prompt: '', locale: 'en', castMethod: 'time' }),
  'Prompt is required',
);
assert.equal(
  getCastRequestValidationError({
    prompt: 'Question',
    locale: 'en',
    castMethod: 'numbers',
    castPayload: { numbers: [1] },
  }),
  'Number Cast requires at least upper and lower numbers',
);

const englishResponse = buildDivinationResponse(castMeihua('2026-04-28T13:34:52+08:00'), {}, 'en');
assert.equal(englishResponse.castMethodLabel, 'Time Cast');
assert.equal(englishResponse.body.element, 'Metal');
assert.ok(!/[\\u4e00-\\u9fff]/.test(englishResponse.timeAnalysis));
assert.ok(!/[\\u4e00-\\u9fff]/.test(englishResponse.mainHex.name));
assert.ok(englishResponse.omenAnalysis.includes('No external omen'));
assert.equal(getServiceErrorMessage('en'), 'The interpretation service is temporarily unavailable. Please try again later.');
assert.equal(getServiceErrorMessage('zh-CN'), '天机运转受阻，请稍后再试');

const englishPrompt = buildSystemPrompt(castMeihua('2026-04-28T13:34:52+08:00'), 'en');
assert.ok(englishPrompt.includes('Output only English'));
assert.ok(englishPrompt.includes('Do not include Chinese characters'));
```

Update existing validation assertions to pass `locale: 'zh-CN'`:

```ts
assert.equal(getCastRequestValidationError({ prompt: '问事', locale: 'zh-CN', castMethod: 'time' }), null);
```

- [ ] **Step 2: Run backend tests to verify failure**

Run:

```bash
npm run test:meihua
```

Expected: FAIL because backend locale helpers do not exist and validation still allows missing locale.

- [ ] **Step 3: Add backend locale helpers**

Create `api/locale.ts`:

```ts
import type { ElementName, RelationName, RelationStatus, SeasonalStrength } from './meihua.js';
import type { TrigramName } from './iching.js';

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
```

- [ ] **Step 4: Export locale helpers from `api/chat.ts`**

At the top of `api/chat.ts`, import:

```ts
import {
  display,
  ELEMENT_EN,
  HEXAGRAM_EN,
  RELATION_EN,
  SEASON_EN,
  STATUS_EN,
  STRENGTH_EN,
  TRIGRAM_EN,
  normalizeLocale,
  type Locale,
} from './locale.js';
```

Re-export `normalizeLocale`:

```ts
export { normalizeLocale };
```

Add localized service error text:

```ts
export const getServiceErrorMessage = (locale: Locale) =>
  locale === 'en'
    ? 'The interpretation service is temporarily unavailable. Please try again later.'
    : '天机运转受阻，请稍后再试';
```

- [ ] **Step 5: Update request validation**

Change `getCastRequestValidationError` signature:

```ts
export function getCastRequestValidationError(input: {
  prompt?: unknown;
  locale?: unknown;
  castMethod?: unknown;
  castPayload?: { numbers?: unknown[] };
}) {
  const locale = normalizeLocale(input.locale);
  if (!input.locale) return 'Locale is required';
  if (!locale) return 'Unsupported locale';
  if (!input.prompt) return locale === 'en' ? 'Prompt is required' : 'Prompt is required';

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
```

- [ ] **Step 6: Localize deterministic summaries and response fields**

Change `withDeterministicSummaries` to accept `locale: Locale`:

```ts
function withDeterministicSummaries(divinationData: DivinationData, locale: Locale) {
  const relationSummaryZh = RELATION_SUMMARY[divinationData.relation.relation];
  const relationSummaryEn: Record<string, string> = {
    比和: 'Body and use share the same element, showing alignment between the querent and the matter.',
    用生体: 'Use generates body, so the matter supports the querent and conditions are favorable.',
    体克用: 'Body controls use, so the querent can shape the matter, though effort is required.',
    体生用: 'Body generates use, so the querent may spend energy and see slower returns.',
    用克体: 'Use controls body, so the matter presses against the querent and calls for caution.',
  };
  const relation = {
    ...divinationData.relation,
    relation: display(locale, divinationData.relation.relation),
    status: display(locale, divinationData.relation.status),
    summary: locale === 'en' ? relationSummaryEn[divinationData.relation.relation] : relationSummaryZh,
  };
  const seasonal = {
    ...divinationData.seasonal,
    seasonName: display(locale, divinationData.seasonal.seasonName),
    seasonElement: display(locale, divinationData.seasonal.seasonElement),
    bodyElement: display(locale, divinationData.seasonal.bodyElement),
    strength: display(locale, divinationData.seasonal.strength),
    summary: locale === 'en'
      ? `The body trigram belongs to ${display(locale, divinationData.seasonal.bodyElement)}. The season is ${display(locale, divinationData.seasonal.seasonName)}, and the body force is ${display(locale, divinationData.seasonal.strength)}. Season is secondary context and does not override the body/use relation.`
      : `体卦属${divinationData.seasonal.bodyElement}，时令为${divinationData.seasonal.seasonName}，体气为${divinationData.seasonal.strength}。时令只作辅助，不覆盖体用生克主断。`,
  };

  return {
    ...divinationData,
    castMethodLabel: locale === 'en'
      ? (divinationData.castMethod === 'numbers' ? 'Number Cast' : 'Time Cast')
      : divinationData.castMethodLabel,
    mainHexName: divinationData.mainHex.name,
    mutualHexName: divinationData.mutualHex.name,
    changedHexName: divinationData.changedHex.name,
    mainHexDisplayName: display(locale, divinationData.mainHex.name),
    mutualHexDisplayName: display(locale, divinationData.mutualHex.name),
    changedHexDisplayName: display(locale, divinationData.changedHex.name),
    body: {
      ...divinationData.body,
      name: display(locale, divinationData.body.name),
      element: display(locale, divinationData.body.element),
    },
    use: {
      ...divinationData.use,
      name: display(locale, divinationData.use.name),
      element: display(locale, divinationData.use.element),
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
```

In `buildDivinationResponse`, accept `locale: Locale` and call `withDeterministicSummaries` before building text. Make English field defaults:

```ts
timeAnalysis: asText(
  aiPayload.timeAnalysis,
  locale === 'en'
    ? `${castMethodLabel}: ${timeInfo}. The formula gives Original Hexagram ${mainHexDisplayName}, Mutual Hexagram ${mutualHexDisplayName}, Changed Hexagram ${changedHexDisplayName}, with moving line ${movingLine}.`
    : `${castMethodLabel}：${timeInfo}，按公式${formula}排出本卦${mainHexName}、互卦${mutualHexName}、变卦${changedHexName}，动爻为第${movingLine}爻。`,
),
```

Use `mainHexDisplayName`, `mutualHexDisplayName`, and `changedHexDisplayName` for visible `mainHex.name`, `mutualHex.name`, and `changedHex.name`.

- [ ] **Step 7: Add localized Gemini prompt builder**

Extract prompt construction into:

```ts
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
- Body Trigram: ${divinationData.body.name} (${divinationData.body.position === 'upper' ? 'Upper Trigram' : 'Lower Trigram'}, element ${divinationData.body.element}), representing the querent/main side
- Use Trigram: ${divinationData.use.name} (${divinationData.use.position === 'upper' ? 'Upper Trigram' : 'Lower Trigram'}, element ${divinationData.use.element}), representing the matter/counterpart
- Body/use relation: ${divinationData.relation.relation}
- Core status: ${divinationData.relation.status}
- Relation summary: ${divinationData.relation.summary}
- Season: ${divinationData.seasonal.summary}
- Omen: ${divinationData.omen.summary}
${divinationData.stabilityNote ? `- Casting note: ${divinationData.stabilityNote}` : ''}

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
- 体卦：${divinationData.body.name}（${divinationData.body.position === 'upper' ? '上卦' : '下卦'}，五行属${divinationData.body.element}），代表我、求测者、主方
- 用卦：${divinationData.use.name}（${divinationData.use.position === 'upper' ? '上卦' : '下卦'}，五行属${divinationData.use.element}），代表事、对方、客方
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
```

Move the existing Chinese prompt text into the Chinese return branch exactly as it works today, using localized `divinationData` values for Chinese.

- [ ] **Step 8: Make Gemini failure fail fast**

In `handler`, destructure `locale`:

```ts
const { prompt, timestamp, locale: localeInput, castMethod, castPayload } = req.body;
const locale = normalizeLocale(localeInput);
const validationError = getCastRequestValidationError({ prompt, locale: localeInput, castMethod, castPayload });
if (validationError) return res.status(400).json({ error: validationError });
```

Build the prompt:

```ts
const rawDivinationData = castByRequest({ castMethod, castPayload, timestamp });
const systemPrompt = buildSystemPrompt(rawDivinationData, locale);
```

When Gemini high demand occurs, return an error instead of a substitute interpretation:

```ts
if (isGeminiHighDemandError(error)) {
  console.warn('Gemini high demand:', error);
  return res.status(503).json({ error: getServiceErrorMessage(locale) });
}
```

For outer errors:

```ts
return res.status(500).json({ error: getServiceErrorMessage(locale ?? 'zh-CN') });
```

- [ ] **Step 9: Run backend tests**

Run:

```bash
npm run test:meihua
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add api/locale.ts api/chat.ts src/utils/chat-api.test.ts
git commit -m "feat: localize divination api"
```

---

### Task 4: Verify English Rendering And Full Build

**Files:**
- Modify: `src/utils/ui-contract.test.tsx`
- Modify: `src/utils/chat-api.test.ts`

- [ ] **Step 1: Add broad no-Chinese checks for English user-facing HTML**

Add this helper to `src/utils/ui-contract.test.tsx`:

```tsx
const assertNoChinese = (html: string, label: string) => {
  assert.ok(!/[\\u4e00-\\u9fff]/.test(html), `${label} contains Chinese characters`);
};
```

Use it for `englishInputHtml`, `englishLoadingHtml`, and `englishResultHtml`:

```tsx
assertNoChinese(englishInputHtml, 'English input HTML');
assertNoChinese(englishLoadingHtml, 'English loading HTML');
assertNoChinese(englishResultHtml, 'English result HTML');
```

- [ ] **Step 2: Add broad no-Chinese checks for English response display fields**

Add this helper to `src/utils/chat-api.test.ts`:

```ts
const assertNoChineseText = (value: string, label: string) => {
  assert.ok(!/[\\u4e00-\\u9fff]/.test(value), `${label} contains Chinese characters`);
};
```

Add checks for English response fields:

```ts
for (const [label, value] of Object.entries({
  timeAnalysis: englishResponse.timeAnalysis,
  mainHexName: englishResponse.mainHex.name,
  mutualHexName: englishResponse.mutualHex.name,
  changedHexName: englishResponse.changedHex.name,
  bodyName: englishResponse.body.name,
  bodyElement: englishResponse.body.element,
  useName: englishResponse.use.name,
  useElement: englishResponse.use.element,
  relation: englishResponse.relation.relation,
  relationStatus: englishResponse.relation.status,
  seasonalSummary: englishResponse.seasonal.summary,
  omenAnalysis: englishResponse.omenAnalysis,
  advice: englishResponse.advice,
  overallStatus: englishResponse.overallStatus,
})) {
  assertNoChineseText(String(value), label);
}
```

- [ ] **Step 3: Run contract tests**

Run:

```bash
npm run test:meihua
```

Expected: PASS.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run lint
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Run production build**

Run:

```bash
npm run build
```

Expected: PASS and Vite writes the production bundle to `dist/`.

- [ ] **Step 6: Commit verification test hardening**

```bash
git add src/utils/ui-contract.test.tsx src/utils/chat-api.test.ts
git commit -m "test: verify pure english language mode"
```

---

### Task 5: Browser Smoke Test

**Files:**
- No code changes expected

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected: Vite starts on `http://localhost:3000`.

- [ ] **Step 2: Open app**

Open:

```text
http://localhost:3000
```

Expected: The Chinese UI loads by default if no saved locale exists.

- [ ] **Step 3: Verify language persistence manually**

In the browser:

1. Click `EN`.
2. Refresh the page.
3. Confirm the header still shows English selected.
4. Confirm the visible UI is English.
5. Click `中文`.
6. Refresh the page.
7. Confirm Chinese is selected.

Expected: Language selection survives refresh in both directions.

- [ ] **Step 4: Verify English input flow manually**

In English mode:

1. Confirm the input panel says `Cast`.
2. Confirm cast methods say `Time Cast` and `Number Cast`.
3. Select `Number Cast`.
4. Confirm fields say `Upper Number`, `Lower Number`, and `Moving Line Number`.
5. Confirm no Chinese characters appear on the input screen.

Expected: English input flow is pure English.

- [ ] **Step 5: Stop dev server**

Stop the Vite process with `Ctrl+C`.

Expected: No dev server process remains running.

---

## Self-Review Checklist

- Spec coverage: This plan covers the persistent header switch, frontend translation layer, English-only UI, API `locale` validation, English deterministic display mapping, English Gemini prompt, localized service errors, fail-fast locale behavior, and final verification commands.
- Scope check: The work is one cohesive feature and does not need decomposition into separate specs.
- Placeholder scan: The plan contains concrete files, commands, code snippets, tests, and commit points with no open implementation placeholders.
- Type consistency: `Locale` is consistently `zh-CN | en`; frontend translation keys are centralized in `translations`; backend locale validation is `normalizeLocale`; Gemini prompt construction is `buildSystemPrompt`; response building receives the localized `locale` argument.
