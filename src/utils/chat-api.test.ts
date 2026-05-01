import assert from 'node:assert/strict';
import {
  buildDivinationResponse,
  buildSystemPrompt,
  getCastRequestValidationError,
  getServiceErrorMessage,
  isGeminiHighDemandError,
  normalizeLocale,
  withGeminiHighDemandRetry,
} from '../../api/chat';
import { displayRequired } from '../../api/locale';
import { castMeihua } from './meihua';

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
assert.equal(
  getCastRequestValidationError({
    prompt: '问事',
    locale: 'zh-CN',
    castMethod: 'numbers',
    castPayload: { numbers: [1, 8] },
  }),
  null,
);
assert.equal(
  getCastRequestValidationError({
    prompt: '问事',
    locale: 'zh-CN',
    castMethod: 'numbers',
    castPayload: { numbers: [1] },
  }),
  '报数起卦至少需要填写上卦数和下卦数',
);
assert.equal(
  getCastRequestValidationError({
    prompt: '问事',
    locale: 'zh-CN',
    castMethod: 'numbers',
    castPayload: { numbers: [1, undefined, 6] },
  }),
  '报数起卦至少需要填写上卦数和下卦数',
);
for (const numbers of [[0, 8], [1, 1000], [1.5, 8], [1, 8, 1000], [1, 8, 0]]) {
  assert.equal(
    getCastRequestValidationError({
      prompt: '问事',
      locale: 'zh-CN',
      castMethod: 'numbers',
      castPayload: { numbers },
    }),
    '报数起卦数字需为 1 到 999 的整数',
  );
}
for (const numbers of [[true, 8], [[1], 8], ['1', 8], [1, false], [1, 8, true]]) {
  assert.equal(
    getCastRequestValidationError({
      prompt: '问事',
      locale: 'zh-CN',
      castMethod: 'numbers',
      castPayload: { numbers },
    }),
    '报数起卦数字需为 1 到 999 的整数',
  );
}
assert.equal(
  getCastRequestValidationError({
    prompt: '问事',
    locale: 'zh-CN',
    castMethod: 'numbers',
    castPayload: { numbers: [999, 1, 999] },
  }),
  null,
);

assert.equal(isGeminiHighDemandError({ status: 503 }), true);
assert.equal(isGeminiHighDemandError(new Error('503 Service Unavailable: high demand')), true);
assert.equal(isGeminiHighDemandError({ status: 429 }), false);

let retryAttempts = 0;
const retryResult = await withGeminiHighDemandRetry(async () => {
  retryAttempts += 1;
  if (retryAttempts === 1) {
    throw Object.assign(new Error('temporary high demand'), { status: 503 });
  }
  return 'ok';
});
assert.equal(retryResult, 'ok');
assert.equal(retryAttempts, 2);

const englishCast = castMeihua('2026-04-28T13:34:52+08:00');
const englishResponse = buildDivinationResponse(englishCast, {}, 'en');
assert.equal(englishResponse.castMethodLabel, 'Time Cast');
assert.equal(englishResponse.body.element, 'Water');
assert.equal(englishResponse.mainHexName, englishCast.mainHex.name);
assert.ok(!/[\u4e00-\u9fff]/.test(englishResponse.timeAnalysis));
assert.ok(!/[\u4e00-\u9fff]/.test(englishResponse.mainHex.name));
assert.ok(englishResponse.omenAnalysis.includes('No external omen'));
assert.equal(getServiceErrorMessage('en'), 'The interpretation service is temporarily unavailable. Please try again later.');
assert.equal(getServiceErrorMessage('zh-CN'), '天机运转受阻，请稍后再试');
assert.throws(
  () => buildDivinationResponse(englishCast, { meaning: '这是中文泄漏', mainHex: { meaning: '本卦中文' } }, 'en'),
  /English AI payload contains Chinese/,
);
assert.throws(
  () => buildDivinationResponse(englishCast, { meaning: '㐀' }, 'en'),
  /English AI payload contains Chinese/,
);
assert.throws(
  () => displayRequired('en', '未映射中文', 'hexagram'),
  /Missing English display mapping/,
);
assert.throws(
  () => displayRequired('en', '㐀', 'hexagram'),
  /Missing English display mapping/,
);

const englishPrompt = buildSystemPrompt(castMeihua('2026-04-28T13:34:52+08:00'), 'en');
assert.ok(englishPrompt.includes('Output only English'));
assert.ok(englishPrompt.includes('Do not include Chinese characters'));

console.log('chat request validation tests passed');
