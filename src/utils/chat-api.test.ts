import assert from 'node:assert/strict';
import { getCastRequestValidationError } from '../../api/chat';

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

console.log('chat request validation tests passed');
