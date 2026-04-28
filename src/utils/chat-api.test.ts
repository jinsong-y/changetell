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

console.log('chat request validation tests passed');
