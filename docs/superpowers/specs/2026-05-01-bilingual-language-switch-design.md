# Bilingual Language Switch Design

## Goal

Add a two-language experience for CHANGE_TELL: Simplified Chinese and English. Users can switch language from the page, and the choice persists after refresh. After switching to English, the entire interactive experience must be English: UI labels, placeholders, validation errors, loading text, result labels, deterministic local summaries, and Gemini-generated interpretation.

Only `zh-CN` and `en` are in scope. Additional languages are not part of this design.

## Non-Goals

- Do not add more than two languages.
- Do not redesign the visual style beyond adding a compact language switcher.
- Do not change the deterministic divination rules.
- Do not let Gemini decide hexagrams, moving line, body/use roles, five-element relation, or core status.
- Do not silently fall back to Chinese when English translations are missing.

## User Experience

The header gets a compact segmented language control on the right:

- `中文`
- `EN`

The default language is Chinese when no saved preference exists. When the user switches language, the page updates immediately and stores the selection in `localStorage`. On refresh, the app restores the saved language. The document language also updates through `document.documentElement.lang`, using `zh-CN` or `en`.

Chinese mode keeps the current product experience and wording as much as possible.

English mode is a pure English interface. It must not show Chinese characters in user-facing UI or result content. This includes:

- Header language state.
- Input panel copy.
- Cast method labels.
- Number cast guidance.
- Repeat-time warning and actions.
- Placeholders.
- Loading sequence.
- Error messages.
- Result page section labels.
- Trigram, hexagram, five-element, relation, status, season, and position terms.
- Gemini interpretation and any service error text.

## English Terminology

English mode uses English-only terminology, with no Chinese characters or pinyin in the interface.

Core labels:

- `起卦` -> `Cast`
- `时间起卦` -> `Time Cast`
- `报数起卦` -> `Number Cast`
- `掷爻` -> `Cast`
- `再起一卦` -> `Cast Again`
- `本卦` -> `Original Hexagram`
- `互卦` -> `Mutual Hexagram`
- `变卦` -> `Changed Hexagram`
- `体卦` -> `Body Trigram`
- `用卦` -> `Use Trigram`
- `上卦` -> `Upper Trigram`
- `下卦` -> `Lower Trigram`
- `五行` -> `Five Elements`

Five elements:

- `金` -> `Metal`
- `木` -> `Wood`
- `水` -> `Water`
- `火` -> `Fire`
- `土` -> `Earth`

Trigrams:

- `天` -> `Heaven`
- `泽` -> `Lake`
- `火` -> `Fire`
- `雷` -> `Thunder`
- `风` -> `Wind`
- `水` -> `Water`
- `山` -> `Mountain`
- `地` -> `Earth`

Statuses:

- `大吉` -> `Very Auspicious`
- `小吉` -> `Auspicious`
- `不利` -> `Unfavorable`
- `大凶` -> `Inauspicious`

Relation names:

- `比和` -> `Same Element`
- `用生体` -> `Use Generates Body`
- `体克用` -> `Body Controls Use`
- `体生用` -> `Body Generates Use`
- `用克体` -> `Use Controls Body`

The 64 hexagram names also need an English display mapping. English mode should use English-only names such as `Force`, `Field`, `Sprouting`, and `Enveloping`, not Chinese names or pinyin. The mapping should live in a central locale utility so both frontend rendering and backend response building use the same vocabulary.

## Frontend Architecture

Add a lightweight project-local i18n layer instead of introducing a large library.

New files:

- `src/i18n/types.ts`
  - Defines `Locale = 'zh-CN' | 'en'`.
  - Defines supported locale constants.

- `src/i18n/translations.ts`
  - Stores UI copy in a keyed dictionary.
  - Ensures `zh-CN` and `en` have the same translation keys.

- `src/i18n/I18nProvider.tsx`
  - Owns the current locale.
  - Reads the initial value from `localStorage`.
  - Writes changes back to `localStorage`.
  - Updates `document.documentElement.lang`.
  - Exposes `locale`, `setLocale`, and `t(key)`.

- `src/i18n/useI18n.ts`
  - Small hook for consuming the provider.

Translation lookup should fail fast. If a component asks for a missing key, `t(key)` throws rather than returning the key or a Chinese fallback.

Update `src/main.tsx` to wrap `<App />` in `I18nProvider`.

Update components to receive or read translations:

- `Header`
  - Renders the language segmented control.
  - Calls `setLocale`.

- `App`
  - Reads `locale`.
  - Includes `locale` in `/api/chat` requests.
  - Uses translated error text for failed requests.
  - Passes locale-sensitive text or translation access to child views.

- `InputView`
  - Replaces static UI copy with translation keys.
  - Keeps cast method logic unchanged.
  - Keeps number validation logic unchanged, but returns translated error keys or translated error messages.

- `LoadingView`
  - Builds the loading sequence from translations instead of a hardcoded Chinese constant.

- `ResultView`
  - Uses translated labels for all section headers and static descriptions.
  - Displays already-localized API fields for computed and AI-generated result content.
  - Uses locale mappings for any local labels it still derives in the component, such as position labels.

## Backend Architecture

`/api/chat` accepts a new `locale` body field. Valid values:

- `zh-CN`
- `en`

After the frontend is updated, `locale` is a required request field. If `locale` is missing or unsupported, return a 400 error. Do not guess or silently fall back.

Add backend locale helpers near the existing deterministic response builders:

- `normalizeLocale(value)`
  - Returns `zh-CN` or `en` for supported values.
  - Returns a validation error for missing or unsupported values.

- `localizeCastResult(divinationData, locale)`
  - Converts deterministic data that is displayed to users into the requested language.
  - Keeps internal Chinese enum values intact where needed for deterministic logic.

- `buildSystemPrompt(divinationData, locale)`
  - Produces the current Chinese Gemini prompt for `zh-CN`.
  - Produces an English-only Gemini prompt for `en`.

- `buildDivinationResponse(divinationData, aiPayload, locale)`
  - Returns the same response shape as today.
  - Localizes every user-facing string according to `locale`.
  - Uses deterministic local text only as field-level defaults when Gemini omits optional text in an otherwise successful JSON response.

The deterministic rules remain unchanged:

- `castMeihua`
- `castByNumbers`
- `getBodyUseRoles`
- `analyzeRelation`
- `getSeasonalAnalysis`

These functions can continue using Chinese internal names because the existing hexagram and trigram tables are Chinese. The language layer translates only at the display and API response boundary.

## Gemini Prompt Rules

Chinese mode keeps the current prompt behavior.

English mode prompt requirements:

- Output only English.
- Do not include Chinese characters.
- Keep the deterministic hexagrams, moving line, body/use roles, five-element relation, and overall status unchanged.
- Follow the same JSON shape used today.
- Do not invent omens.
- Explain the result in clear English, with a slightly classical but readable tone.
- Make advice practical and related to the user's question.

The user question may be written in Chinese even when the interface is English. The prompt should still require English output.

If Gemini is busy or fails, the API should fail fast with a localized error response rather than returning a local substitute interpretation. English mode returns an English error message; Chinese mode returns a Chinese error message.

## Data Flow

Language initialization:

1. App starts.
2. `I18nProvider` reads `localStorage`.
3. If the saved locale is `zh-CN` or `en`, use it.
4. Otherwise use `zh-CN`.
5. Set `<html lang>` to the active locale.

Language switching:

1. User clicks `中文` or `EN` in the header.
2. Provider updates current locale.
3. Provider writes the locale to `localStorage`.
4. UI rerenders with translated copy.
5. Future cast requests include the selected locale.

Cast request:

1. User enters a question.
2. User casts with time or numbers.
3. `App` posts `locale` with the existing request fields.
4. Backend validates `locale`, prompt, cast method, and number payload.
5. Backend computes deterministic result.
6. Backend builds a language-specific Gemini prompt.
7. Backend returns a localized response.
8. `ResultView` displays localized static labels and localized response fields.

## Error Handling

Frontend translation errors:

- Missing translation key throws.
- Missing saved locale uses the product default, `zh-CN`.
- Unsupported saved locale in `localStorage` is treated as invalid state and throws so the bad value is noticed immediately.

API locale errors:

- Missing `locale`: return 400.
- Unsupported `locale`: return 400.

API service errors:

- Gemini high-demand and internal service errors are localized.
- Backend validation errors are localized.
- Generic internal error is localized.

No user-facing English mode path should return Chinese text as a fallback.

## Testing

Run all verification commands:

```bash
npm run test:meihua
npm run lint
npm run build
```

Add or update tests in `src/utils/ui-contract.test.tsx`:

- Translation dictionaries for `zh-CN` and `en` have identical keys.
- Missing translation lookup throws.
- `InputView` renders English labels such as `Time Cast`, `Number Cast`, and `Cast`.
- `LoadingView` renders English loading steps in English mode.
- `ResultView` renders English static labels such as `Original Hexagram`, `Body Trigram`, `Five Elements`, and `Cast Again`.
- English UI contract output does not include key Chinese static labels such as `起卦`, `报数起卦`, `排出三卦`, or `综合断语`.
- Existing Chinese rendering assertions keep passing.

Add or update tests in `src/utils/chat-api.test.ts`:

- Missing locale returns a validation error.
- `locale: 'en'` service errors are English.
- Gemini high-demand errors do not return a substitute interpretation.
- English response maps trigram, element, relation, status, and season labels to English.
- Unsupported locale returns a validation error.
- English prompt includes the English-only instruction and no-Chinese-character instruction.
- Existing number-cast validation tests keep passing.

## Acceptance Criteria

- Header lets users switch between Chinese and English.
- The selected language persists after refresh.
- Chinese mode preserves the current experience.
- English mode has pure English UI, errors, loading text, result labels, deterministic summaries, and Gemini interpretation.
- English mode does not show Chinese characters in user-facing result content.
- Backend requires `locale` and accepts only `zh-CN` and `en`.
- Missing translations fail fast.
- Missing or invalid API locales fail fast instead of silently falling back.
- Deterministic divination logic remains unchanged.
- `npm run test:meihua`, `npm run lint`, and `npm run build` pass after implementation.
