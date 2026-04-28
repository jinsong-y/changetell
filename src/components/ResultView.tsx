import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getBinaryByHexName } from '../utils/iching';

type LineType = 'yin' | 'yang';

const BigHexagram = ({ name, title, subtitle }: { name: string, title: string, subtitle: string }) => {
  const binary = getBinaryByHexName(name);
  // 转换二进制到 LineType，注意易经从下往上，渲染从上往下
  const lines: LineType[] = binary 
    ? binary.split('').reverse().map(b => b === '1' ? 'yang' : 'yin')
    : ['yang', 'yang', 'yang', 'yang', 'yang', 'yang'];

  return (
    <div className="p-6 md:p-8 flex flex-col items-center justify-center gap-4 bg-[#0c0e13] relative border border-[#414868]/50 w-full h-full group/hex transition-colors hover:border-[#7aa2f7]/30">
      <div className="absolute inset-0 bg-gradient-to-t from-[#bb9af7]/5 to-transparent opacity-0 group-hover/hex:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="w-full max-w-[160px] min-w-[120px] flex flex-col gap-3 relative z-10 mx-auto">
        {lines.map((l, i) => l === 'yin' ? (
          <div key={i} className="flex gap-4 w-full h-5">
            <div className="flex-1 hex-bar-tertiary"></div>
            <div className="flex-1 hex-bar-tertiary"></div>
          </div>
        ) : (
          <div key={i} className="w-full h-5 hex-bar-primary"></div>
        ))}
      </div>

      <div className="text-center mt-4 md:mt-6 w-full border-t border-[#414868] pt-4 z-10 group-hover/hex:border-[#7aa2f7]/30 transition-colors">
        <h2 className="text-2xl md:text-3xl font-bold text-[#c0caf5] flex items-center justify-center gap-2 tracking-widest">
          <span>{title}</span>
        </h2>
        <p className="text-xs font-medium text-[#565f89] mt-2 tracking-widest">{subtitle}</p>
      </div>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      ease: "easeOut",
      duration: 0.4
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

interface HexInfo {
  name: string;
  meaning: string;
}

interface TrigramRole {
  name: string;
  position: 'upper' | 'lower';
  element: string;
  role?: '体' | '用';
  description?: string;
}

interface RelationAnalysis {
  relation: string;
  status: string;
  summary: string;
}

interface SeasonalAnalysis {
  bodyElement: string;
  season?: string;
  seasonName?: string;
  strength: string;
  summary: string;
}

interface OmenAnalysis {
  used: boolean;
  summary: string;
}

interface DivinationResult {
  castMethod?: 'time' | 'numbers';
  castMethodLabel?: string;
  timeAnalysis: string;
  formula?: string;
  stabilityNote?: string;
  serviceNotice?: string;
  mainHex: HexInfo;
  mutualHex: HexInfo;
  changedHex: HexInfo;
  movingLine?: number;
  body: TrigramRole;
  use: TrigramRole;
  relation: RelationAnalysis;
  seasonal: SeasonalAnalysis;
  omen: OmenAnalysis;
  bodyUseAnalysis: string;
  fiveElementAnalysis: string;
  seasonalAnalysis: string;
  omenAnalysis: string;
  meaning: string;
  advice: string;
  overallStatus: string;
}

const positionLabel = (position: 'upper' | 'lower') => position === 'upper' ? '上卦' : '下卦';

const SectionLabel = ({ step, title, tone }: { step: string; title: string; tone: string }) => (
  <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center justify-between">
    <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
      <span className={`text-[10px] border px-2 py-0.5 ${tone}`}>{step}</span>
      {title}
    </span>
  </div>
);

export default function ResultView({ data, onRestart }: { data: DivinationResult, onRestart: () => void }) {
  if (!data) return null;

  const roleCards = [
    {
      key: 'body',
      role: data.body,
      label: '体卦',
      description: '动爻不在之经卦，代表我方、求测者、主方。'
    },
    {
      key: 'use',
      role: data.use,
      label: '用卦',
      description: '动爻所在之经卦，代表事情、对方、客方。'
    }
  ];
  const seasonLabel = data.seasonal.season ?? data.seasonal.seasonName ?? '时令';
  const castMethodLabel = data.castMethodLabel ?? '时间起卦';
  const stabilityNote = data.stabilityNote ?? (data.castMethod === 'numbers' ? '' : '本卦由农历年月日时推得，同一时辰内相同问题不宜重复起卦。');

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 min-w-0"
    >
      {/* Status Bar */}
      <motion.section variants={itemVariants} className="border border-[#414868] bg-[#24283b]/50 p-3 flex flex-col gap-1 relative overflow-hidden group hover:bg-[#24283b]/80 transition-colors min-w-0">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#73daca]"></div>
        <div className="text-xs font-medium text-[#7aa2f7] flex items-center gap-2 min-w-0">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="min-w-0 break-words">天机已现，感应成功</span>
        </div>
        <div className="text-xs font-medium text-[#c0caf5] flex items-start gap-2 opacity-80 mt-1 min-w-0">
          <span className="w-4 text-center shrink-0">·</span>
          <span className="min-w-0 break-words">{castMethodLabel}：{data.timeAnalysis}</span>
        </div>
        {data.formula && (
          <div className="text-xs font-medium text-[#565f89] flex items-start gap-2 opacity-80 min-w-0">
            <span className="w-4 text-center shrink-0">·</span>
            <span className="min-w-0 break-words">推演公式：{data.formula}</span>
          </div>
        )}
        {data.movingLine && (
          <div className="text-xs font-medium text-[#e0af68] flex items-start gap-2 opacity-90 min-w-0">
            <span className="w-4 text-center shrink-0">·</span>
            <span className="min-w-0 break-words">动爻：第{data.movingLine}爻</span>
          </div>
        )}
        {stabilityNote && (
          <div className="text-xs font-medium text-[#73daca] flex items-start gap-2 opacity-90 min-w-0">
            <span className="w-4 text-center shrink-0">·</span>
            <span className="min-w-0 break-words">{stabilityNote}</span>
          </div>
        )}
        {data.serviceNotice && (
          <div className="text-xs font-medium text-[#e0af68] flex items-start gap-2 opacity-95 min-w-0">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="min-w-0 break-words">{data.serviceNotice}</span>
          </div>
        )}
      </motion.section>

      {/* Data Layout */}
      <div className="flex flex-col gap-6 min-w-0">
        
        {/* Analyses */}
        <div className="flex flex-col gap-6 min-w-0">
          
          {/* Step 01: Three Hexagrams */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#7aa2f7]/40 transition-colors duration-500 min-w-0">
            <SectionLabel step="01" title="排出三卦" tone="border-[#7aa2f7] text-[#7aa2f7]" />
            <div className="grid grid-cols-1 xl:grid-cols-3 min-w-0">
              <div className="border-b xl:border-b-0 xl:border-r border-[#414868]/50 min-w-0">
                <BigHexagram name={data.mainHex.name} title={data.mainHex.name} subtitle="主卦 -- 开始/当前" />
                <div className="p-6 border-t border-[#414868]/50 min-w-0">
                  <p className="text-sm text-[#8a98c9] leading-relaxed break-words">{data.mainHex.meaning}</p>
                </div>
              </div>
              <div className="border-b xl:border-b-0 xl:border-r border-[#414868]/50 min-w-0">
                <BigHexagram name={data.mutualHex.name} title={data.mutualHex.name} subtitle="互卦 -- 中间/隐情" />
                <div className="p-6 border-t border-[#414868]/50 min-w-0">
                  <p className="text-sm text-[#8a98c9] leading-relaxed break-words">{data.mutualHex.meaning}</p>
                </div>
              </div>
              <div className="min-w-0">
                <BigHexagram name={data.changedHex.name} title={data.changedHex.name} subtitle="变卦 -- 最终/趋势" />
                <div className="p-6 border-t border-[#414868]/50 min-w-0">
                  <p className="text-sm text-[#8a98c9] leading-relaxed break-words">{data.changedHex.meaning}</p>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Step 02: Body and Use */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#bb9af7]/40 transition-colors duration-500 min-w-0">
            <SectionLabel step="02" title="分辨体用" tone="border-[#bb9af7] text-[#bb9af7]" />
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              {roleCards.map(({ key, role, label, description }) => (
                <div key={key} className="border border-[#414868]/70 bg-[#0c0e13] p-5 transition-colors hover:border-[#bb9af7]/40 min-w-0">
                  <div className="text-xs text-[#565f89] tracking-widest mb-2">{label}</div>
                  <div className="flex items-end justify-between gap-3">
                    <h3 className="text-2xl font-bold text-[#c0caf5] break-words min-w-0">{role.name}</h3>
                    <span className="text-sm text-[#e0af68] shrink-0">五行属{role.element}</span>
                  </div>
                  <p className="text-xs text-[#7aa2f7] mt-2 break-words">{positionLabel(role.position)} · {description}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 min-w-0">
              <p className="text-sm text-[#8a98c9] leading-relaxed border-l-2 border-[#bb9af7] pl-4 bg-[#bb9af7]/5 py-3 break-words">
                {data.bodyUseAnalysis}
              </p>
            </div>
          </motion.article>

          {/* Step 03: Five Element Relation */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#73daca]/40 transition-colors duration-500 min-w-0">
            <SectionLabel step="03" title="五行生克论吉凶" tone="border-[#73daca] text-[#73daca]" />
            <div className="p-6 flex flex-col gap-4 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-w-0">
                <div className="border border-[#414868]/70 bg-[#0c0e13] p-4 transition-colors hover:border-[#73daca]/40 min-w-0">
                  <div className="text-xs text-[#565f89] tracking-widest">关系</div>
                  <div className="text-xl font-bold text-[#73daca] mt-2 break-words">{data.relation.relation}</div>
                </div>
                <div className="border border-[#414868]/70 bg-[#0c0e13] p-4 transition-colors hover:border-[#e0af68]/40 min-w-0">
                  <div className="text-xs text-[#565f89] tracking-widest">核心吉凶</div>
                  <div className="text-xl font-bold text-[#e0af68] mt-2 break-words">{data.relation.status}</div>
                </div>
                <div className="border border-[#414868]/70 bg-[#0c0e13] p-4 transition-colors hover:border-[#7aa2f7]/40 min-w-0">
                  <div className="text-xs text-[#565f89] tracking-widest">体用五行</div>
                  <div className="text-xl font-bold text-[#c0caf5] mt-2 break-words">体{data.body.element} / 用{data.use.element}</div>
                </div>
              </div>
              <p className="text-sm text-[#8a98c9] leading-relaxed break-words">
                {data.fiveElementAnalysis || data.relation.summary}
              </p>
            </div>
          </motion.article>

          {/* Step 04: Season and Omen */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#e0af68]/40 transition-colors duration-500 min-w-0">
            <SectionLabel step="04" title="时令与外应" tone="border-[#e0af68] text-[#e0af68]" />
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              <div className="border border-[#414868]/70 bg-[#0c0e13] p-5 transition-colors hover:border-[#e0af68]/40 min-w-0">
                <div className="text-xs text-[#565f89] tracking-widest mb-2">旺相休囚</div>
                <h3 className="text-xl font-bold text-[#e0af68] break-words">{seasonLabel} · 体气{data.seasonal.strength}</h3>
                <p className="text-sm text-[#8a98c9] leading-relaxed mt-3 break-words">
                  {data.seasonalAnalysis || data.seasonal.summary}
                </p>
              </div>
              <div className="border border-[#414868]/70 bg-[#0c0e13] p-5 transition-colors hover:border-[#c0caf5]/40 min-w-0">
                <div className="text-xs text-[#565f89] tracking-widest mb-2">外应</div>
                <h3 className="text-xl font-bold text-[#c0caf5] break-words">未取外应</h3>
                <p className="text-sm text-[#8a98c9] leading-relaxed mt-3 break-words">
                  {data.omenAnalysis || data.omen.summary}
                </p>
              </div>
            </div>
          </motion.article>

          {/* Step 05: Macro Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#73daca]/40 transition-colors duration-500 min-w-0">
            <SectionLabel step="05" title="综合断语与核心建议" tone="border-[#f7768e] text-[#f7768e]" />
            <div className="p-6 flex flex-col gap-4 min-w-0">
              <p className="text-sm text-[#8a98c9] leading-relaxed break-words">
                {data.meaning}
              </p>
              <div className="bg-[#7aa2f7]/5 border-l-4 border-[#7aa2f7] p-4 min-w-0">
                <h4 className="text-[#7aa2f7] font-bold mb-2 tracking-wider">【核心建议】</h4>
                <p className="text-[#c0caf5] leading-relaxed break-words">{data.advice}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-medium mt-2 min-w-0">
                <span className="border border-[#73daca] text-[#73daca] px-3 py-1.5 bg-[#73daca]/10 flex flex-wrap items-center gap-2 min-w-0 break-words">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#73daca] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#73daca]"></span>
                  </span>
                  <span className="min-w-0 break-words">总体状态: {data.overallStatus}</span>
                </span>
              </div>
            </div>
          </motion.article>

          {/* Restart Button */}
          <motion.div variants={itemVariants} className="mt-4 flex justify-center pb-8">
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "#7aa2f7", color: "#1a1b26", boxShadow: "0 0 20px rgba(122, 162, 247, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              onClick={onRestart}
              className="pulse-effect border border-[#7aa2f7] bg-[#1a1b26] text-[#7aa2f7] text-lg font-bold py-3 px-12 tracking-widest uppercase transition-colors duration-300"
            >
              再起一卦
            </motion.button>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
