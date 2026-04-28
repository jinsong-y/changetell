import assert from 'node:assert/strict';
import {
  AI_BUSY_NOTICE,
  buildLocalFallbackResponse,
  getCastRequestValidationError,
  isGeminiHighDemandError,
  withGeminiHighDemandRetry,
} from '../../api/chat';
import { castMeihua } from './meihua';

assert.equal(getCastRequestValidationError({ prompt: '问事', castMethod: 'time' }), null);
assert.equal(
  getCastRequestValidationError({
    prompt: '问事',
    castMethod: 'numbers',
    castPayload: { numbers: [1, 8] },
  }),
  null,
);
assert.equal(
  getCastRequestValidationError({
    prompt: '问事',
    castMethod: 'numbers',
    castPayload: { numbers: [1] },
  }),
  '报数起卦至少需要填写上卦数和下卦数',
);
assert.equal(
  getCastRequestValidationError({
    prompt: '问事',
    castMethod: 'numbers',
    castPayload: { numbers: [1, undefined, 6] },
  }),
  '报数起卦至少需要填写上卦数和下卦数',
);
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
for (const numbers of [[true, 8], [[1], 8], ['1', 8], [1, false], [1, 8, true]]) {
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

const fallback = buildLocalFallbackResponse(castMeihua('2026-04-28T13:34:52+08:00'));
assert.equal(fallback.serviceNotice, AI_BUSY_NOTICE);
assert.ok(fallback.serviceNotice.includes('5 分钟后再试'));
assert.equal(fallback.mainHex.name, fallback.mainHexName);
assert.equal(fallback.overallStatus, fallback.relation.status);
assert.ok(fallback.meaning.includes(fallback.relation.summary));

console.log('chat request validation tests passed');
