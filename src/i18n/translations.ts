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
    'input.repeat.warning': '同一时辰内相同问题不宜重复起卦。若此念已变，可改用报数起卦。',
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
    'result.stability.timeRepeatNote': '本卦由农历年月日时推得，同一时辰内相同问题不宜重复起卦。',
    'result.restart': '再起一卦',
  },
  en: {
    'header.language.zh': 'Chinese',
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
    'input.repeat.warning': 'The same question should not be cast again within the same two-hour period. If your intent has changed, use Number Cast.',
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
    'result.stability.timeRepeatNote': 'This hexagram is derived from the lunar year, month, day, and hour. Avoid repeating the same question within the same two-hour period.',
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

const getInterpolationTokens = (template: string) =>
  Array.from(new Set(Array.from(template.matchAll(/\{(\w+)\}/g), ([, token]) => token)));

export const translate = (
  locale: Locale,
  key: TranslationKey,
  values?: Record<string, string | number>,
): string => {
  const template = getTranslation(locale, key);
  const tokens = getInterpolationTokens(template);

  for (const token of tokens) {
    if (!values || values[token] === undefined) {
      throw new Error(`Missing interpolation value ${token} for ${locale}:${String(key)}`);
    }
  }

  if (tokens.length === 0) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token: string) => String(values?.[token]));
};

export const formatTranslation = (
  locale: Locale,
  key: TranslationKey,
  values: Record<string, string | number>,
) => translate(locale, key, values);
