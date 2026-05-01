import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import InputView, {
  getCastTimestamp,
  getChineseZhiHourIndex,
  getNumberCastPayload,
  getTimeCastRepeatKey,
  getVisualHexagram,
  isRepeatTimeCast,
  normalizePromptForRepeat,
  type InputViewProps,
} from '../components/InputView';
import LoadingView, { LOADING_SEQUENCE_KEYS } from '../components/LoadingView';
import ResultView from '../components/ResultView';
import { I18nProvider } from '../i18n/I18nProvider';
import { formatTranslation, getTranslation, getTranslationKeys, translate, translations } from '../i18n/translations';
import { SUPPORTED_LOCALES } from '../i18n/types';
import { castMeihua } from './meihua';

const date = new Date('2026-04-28T08:09:10.000Z');
const renderWithLocale = (locale: 'zh-CN' | 'en', element: React.ReactElement) =>
  renderToStaticMarkup(<I18nProvider initialLocale={locale}>{element}</I18nProvider>);

assert.equal(getCastTimestamp(date), '2026-04-28T08:09:10.000Z');
assert.deepEqual(SUPPORTED_LOCALES, ['zh-CN', 'en']);

const zhKeys = getTranslationKeys('zh-CN');
const enKeys = getTranslationKeys('en');
assert.deepEqual(enKeys, zhKeys);
assert.equal(getTranslation('zh-CN', 'header.language.zh'), '中文');
assert.equal(getTranslation('en', 'header.language.en'), 'EN');
assert.throws(() => translate('en', 'result.status.movingLine'), /Missing interpolation value line/);
assert.equal(formatTranslation('en', 'result.status.movingLine', { line: 3 }), 'Moving Line: Line 3');
assert.equal(getTranslation('zh-CN', 'input.repeat.warning'), '同一时辰内相同问题不宜重复起卦。若此念已变，可改用报数起卦。');
assert.equal(
  getTranslation('en', 'input.repeat.warning'),
  'The same question should not be cast again within the same two-hour period. If your intent has changed, use Number Cast.',
);
assert.equal(getTranslation('zh-CN', 'result.stability.timeRepeatNote'), '本卦由农历年月日时推得，同一时辰内相同问题不宜重复起卦。');
assert.equal(
  getTranslation('en', 'result.stability.timeRepeatNote'),
  'This hexagram is derived from the lunar year, month, day, and hour. Avoid repeating the same question within the same two-hour period.',
);
assert.throws(
  () => getTranslation('en', 'missing.translation.key' as keyof typeof translations.en),
  /Missing translation/,
);

assert.equal(getVisualHexagram([7, 7, 7, 8, 8, 8]).name, '天地否');
assert.equal(getVisualHexagram([8, 8, 8, 7, 7, 7]).name, '地天泰');

assert.deepEqual(getNumberCastPayload(['1', '8', '6']), { canCast: true, numbers: [1, 8, 6], error: '' });
assert.deepEqual(getNumberCastPayload(['1', '8', '']), { canCast: true, numbers: [1, 8], error: '' });
assert.equal(getNumberCastPayload(['1', '', '6']).canCast, false);
assert.deepEqual(getNumberCastPayload(['999', '1', '2']), { canCast: true, numbers: [999, 1, 2], error: '' });
assert.deepEqual(getNumberCastPayload(['1', '8', '']), { canCast: true, numbers: [1, 8], error: '' });
assert.equal(getNumberCastPayload(['0', '8', '']).error, '上卦数和下卦数需填写 1 到 999 的整数');
assert.equal(getNumberCastPayload(['1', '1000', '']).error, '上卦数和下卦数需填写 1 到 999 的整数');
assert.equal(getNumberCastPayload(['1', '8', '1000']).error, '动爻数如填写，也需是 1 到 999 的整数');
assert.equal(getNumberCastPayload(['1.5', '8', '']).canCast, false);

assert.equal(normalizePromptForRepeat('  去 上海   发展？ '), '去 上海 发展？');
assert.equal(getChineseZhiHourIndex(new Date(2026, 3, 28, 23, 30)), 0);
assert.equal(getChineseZhiHourIndex(new Date(2026, 3, 29, 0, 30)), 0);
assert.equal(getChineseZhiHourIndex(new Date(2026, 3, 28, 1, 30)), 1);
assert.equal(getTimeCastRepeatKey('问事', new Date(2026, 3, 28, 1, 30)), '问事|2026-04-28:1');
assert.equal(
  getTimeCastRepeatKey('问事', new Date(2026, 3, 28, 23, 30)),
  getTimeCastRepeatKey(' 问事 ', new Date(2026, 3, 29, 0, 30)),
);
assert.equal(
  isRepeatTimeCast(
    { key: getTimeCastRepeatKey('问事', new Date(2026, 3, 28, 23, 30)) },
    ' 问事 ',
    new Date(2026, 3, 29, 0, 30),
  ),
  true,
);
assert.equal(
  isRepeatTimeCast(
    { key: '问事|2026-04-28:1' },
    ' 问事 ',
    new Date(2026, 3, 28, 1, 50),
  ),
  true,
);
assert.equal(
  isRepeatTimeCast(
    { key: '问事|2026-04-28:1' },
    '另一件事',
    new Date(2026, 3, 28, 1, 50),
  ),
  false,
);
assert.equal(
  isRepeatTimeCast(
    { key: '问事|2026-04-28:1' },
    '问事',
    new Date(2026, 3, 28, 3, 1),
  ),
  false,
);
assert.equal(
  isRepeatTimeCast(
    [
      { key: getTimeCastRepeatKey('问事一', new Date(2026, 3, 28, 1, 30)) },
      { key: getTimeCastRepeatKey('问事二', new Date(2026, 3, 28, 1, 40)) },
    ],
    '问事一',
    new Date(2026, 3, 28, 1, 50),
  ),
  true,
);
assert.equal(
  isRepeatTimeCast(
    [
      { key: getTimeCastRepeatKey('问事一', new Date(2026, 3, 28, 1, 30)) },
      { key: getTimeCastRepeatKey('问事二', new Date(2026, 3, 28, 1, 40)) },
    ],
    '问事三',
    new Date(2026, 3, 28, 1, 50),
  ),
  false,
);

const continueTimeContract: InputViewProps['onContinueTime'] = (prompt: string, timestamp: string) => {
  assert.equal(typeof prompt, 'string');
  assert.equal(typeof timestamp, 'string');
};
continueTimeContract?.('当前问题', getCastTimestamp(date));

assert.ok(LOADING_SEQUENCE_KEYS.includes('loading.step.4'));
assert.ok(!LOADING_SEQUENCE_KEYS.some((step) => step.includes('爻辞')));

const cast = castMeihua('2020-05-23T12:00:00+08:00');
const relationSummary = {
  比和: '体用同气，主客同频，事情较易相合。',
  用生体: '事情助我，外部条件生扶主方，最为有利。',
  体克用: '我能制事，虽需费力推动，仍有可成之象。',
  体生用: '我去生事，主方耗泄，易有投入多、回收慢之象。',
  用克体: '事情克我，阻力压身，宜谨慎退守或先化解冲突。',
}[cast.relation.relation];
const seasonalSummary = `体卦属${cast.seasonal.bodyElement}，时令为${cast.seasonal.seasonName}，体气为${cast.seasonal.strength}。时令只作辅助，不覆盖体用生克主断。`;

const resultHtml = renderWithLocale(
  'zh-CN',
  <ResultView
    data={{
      timeAnalysis: cast.timeInfo,
      formula: cast.formula,
      serviceNotice: '天机文辞服务暂时繁忙，已先按本地卦象给出基础解读；若需更完整解读，请 5 分钟后再试。',
      mainHex: { name: cast.mainHex.name, meaning: '本卦表示当前。' },
      mutualHex: { name: cast.mutualHex.name, meaning: '互卦表示隐情。' },
      changedHex: { name: cast.changedHex.name, meaning: '变卦表示趋势。' },
      mainHexName: cast.mainHex.name,
      mutualHexName: cast.mutualHex.name,
      changedHexName: cast.changedHex.name,
      movingLine: cast.movingLine,
      body: cast.body,
      use: cast.use,
      relation: { ...cast.relation, summary: relationSummary },
      seasonal: { ...cast.seasonal, summary: seasonalSummary },
      omen: cast.omen,
      bodyUseAnalysis: '体用定位测试。',
      fiveElementAnalysis: '五行生克测试。',
      seasonalAnalysis: seasonalSummary,
      omenAnalysis: cast.omen.summary,
      meaning: '综合断语测试。',
      advice: '建议测试。',
      overallStatus: cast.relation.status,
    }}
    onRestart={() => {}}
  />,
);

for (const text of ['01', '排出三卦', '02', '分辨体用', '03', '五行生克论吉凶', '04', '时令与外应', '05', '综合断语与核心建议', '未取外应', '同一时辰内相同问题不宜重复起卦', '5 分钟后再试']) {
  assert.ok(resultHtml.includes(text), `missing ${text}`);
}
assert.ok(!resultHtml.includes('undefined'));

const inputHtml = renderWithLocale('zh-CN', <InputView onCast={() => {}} />);
assert.ok(inputHtml.includes('输入求问之事'));
assert.ok(inputHtml.includes('报数起卦'));
assert.ok(inputHtml.includes('优先以当前时辰起卦'));

const repeatWarningHtml = renderWithLocale(
  'zh-CN',
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

const numberInputHtml = renderWithLocale('zh-CN', <InputView onCast={() => {}} initialCastMethod="numbers" />);
for (const text of [
  '静心后，随心写下 2 到 3 个整数。不必计算，不必选吉数。',
  '随心第一个整数',
  '随心第二个整数',
  '可选，不填则以前两数相加定动爻',
  '1-999',
]) {
  assert.ok(numberInputHtml.includes(text), `missing ${text}`);
}

const loadingHtml = renderWithLocale('zh-CN', <LoadingView />);
assert.ok(loadingHtml.includes('正在起卦'));

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

assert.throws(
  () => renderWithLocale(
    'en',
    <ResultView
      data={{
        timeAnalysis: 'Time Cast',
        mainHex: { name: 'Force', meaning: 'Meaning' },
        mutualHex: { name: 'Field', meaning: 'Meaning' },
        changedHex: { name: 'Sprouting', meaning: 'Meaning' },
        mainHexName: 'Force',
        mutualHexName: cast.mutualHex.name,
        changedHexName: cast.changedHex.name,
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
  ),
  /Unknown hexagram name for rendering: Force/,
);

console.log('ui contract tests passed');
