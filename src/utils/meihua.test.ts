import assert from 'node:assert/strict';
import {
  analyzeRelation,
  castByNumbers,
  castMeihua,
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

const lowerMoving = getBodyUseRoles({ upperName: '天', lowerName: '雷', movingLine: 2 });
assert.equal(lowerMoving.body.name, '天');
assert.equal(lowerMoving.body.position, 'upper');
assert.equal(lowerMoving.use.name, '雷');
assert.equal(lowerMoving.use.position, 'lower');

const upperMoving = getBodyUseRoles({ upperName: '火', lowerName: '水', movingLine: 5 });
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

const leapMonthCast = castMeihua(new Date('2020-05-23T12:00:00+08:00'));
assert.ok(leapMonthCast.mainHex.name);
assert.ok(leapMonthCast.body);
assert.ok(leapMonthCast.use);
assert.ok(leapMonthCast.relation);

const numberCast = castByNumbers({
  numbers: [1, 8, 6],
  timestamp: '2020-05-23T12:00:00+08:00',
});
assert.equal(numberCast.castMethod, 'numbers');
assert.equal(numberCast.castMethodLabel, '报数起卦');
assert.equal(numberCast.mainHex.name, '天地否');
assert.equal(numberCast.movingLine, 6);
assert.ok(numberCast.formula.includes('报数'));

console.log('meihua deterministic rules passed');
