import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import InputView, { getCastTimestamp, getVisualHexagram } from '../components/InputView';
import LoadingView, { LOADING_SEQUENCE } from '../components/LoadingView';
import ResultView from '../components/ResultView';
import { castMeihua } from './meihua';

const date = new Date('2026-04-28T08:09:10.000Z');
assert.equal(getCastTimestamp(date), '2026-04-28T08:09:10.000Z');

assert.equal(getVisualHexagram([7, 7, 7, 8, 8, 8]).name, '天地否');
assert.equal(getVisualHexagram([8, 8, 8, 7, 7, 7]).name, '地天泰');

assert.ok(LOADING_SEQUENCE.includes('定体用生克...'));
assert.ok(!LOADING_SEQUENCE.some((step) => step.includes('爻辞')));

const cast = castMeihua('2020-05-23T12:00:00+08:00');
const relationSummary = {
  比和: '体用同气，主客同频，事情较易相合。',
  用生体: '事情助我，外部条件生扶主方，最为有利。',
  体克用: '我能制事，虽需费力推动，仍有可成之象。',
  体生用: '我去生事，主方耗泄，易有投入多、回收慢之象。',
  用克体: '事情克我，阻力压身，宜谨慎退守或先化解冲突。',
}[cast.relation.relation];
const seasonalSummary = `体卦属${cast.seasonal.bodyElement}，时令为${cast.seasonal.seasonName}，体气为${cast.seasonal.strength}。时令只作辅助，不覆盖体用生克主断。`;

const resultHtml = renderToStaticMarkup(
  <ResultView
    data={{
      timeAnalysis: cast.timeInfo,
      formula: cast.formula,
      mainHex: { name: cast.mainHex.name, meaning: '本卦表示当前。' },
      mutualHex: { name: cast.mutualHex.name, meaning: '互卦表示隐情。' },
      changedHex: { name: cast.changedHex.name, meaning: '变卦表示趋势。' },
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

for (const text of ['01', '排出三卦', '02', '分辨体用', '03', '五行生克论吉凶', '04', '时令与外应', '05', '综合断语与核心建议', '未取外应']) {
  assert.ok(resultHtml.includes(text), `missing ${text}`);
}
assert.ok(!resultHtml.includes('undefined'));

const inputHtml = renderToStaticMarkup(<InputView onCast={() => {}} />);
assert.ok(inputHtml.includes('输入求问之事'));

const loadingHtml = renderToStaticMarkup(<LoadingView />);
assert.ok(loadingHtml.includes('正在起卦'));

console.log('ui contract tests passed');
