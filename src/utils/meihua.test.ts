import assert from 'node:assert/strict';
import {
  analyzeRelation,
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

console.log('meihua deterministic rules passed');
