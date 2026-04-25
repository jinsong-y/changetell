import { Loader2, RefreshCw, CheckCircle2, Grid, Compass, List, BookOpen, Activity, Waypoints, Zap, Star } from 'lucide-react';
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

interface DivinationResult {
  timeAnalysis: string;
  mainHex: HexInfo;
  mutualHex: HexInfo;
  changedHex: HexInfo;
  movingLines: string;
  judgment: string;
  meaning: string;
  advice: string;
  overallStatus: string;
}

export default function ResultView({ data, onRestart }: { data: DivinationResult, onRestart: () => void }) {
  if (!data) return null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Status Bar */}
      <motion.section variants={itemVariants} className="border border-[#414868] bg-[#24283b]/50 p-3 flex flex-col gap-1 relative overflow-hidden group hover:bg-[#24283b]/80 transition-colors">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#73daca]"></div>
        <div className="text-xs font-medium text-[#7aa2f7] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>天机已现，感应成功</span>
        </div>
        <div className="text-xs font-medium text-[#c0caf5] flex items-center gap-2 opacity-80 mt-1">
          <span className="w-4 text-center">·</span>
          <span>时间起卦：{data.timeAnalysis}</span>
        </div>
      </motion.section>

      {/* Data Layout */}
      <div className="flex flex-col gap-6">
        
        {/* Analyses */}
        <div className="flex flex-col gap-6">
          
          {/* Main Hexagram Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#7aa2f7]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <Grid className="w-4 h-4 group-hover:text-[#7aa2f7] transition-colors" />
                主卦 -- 事之初
              </span>
              <span className="text-[10px] text-[#565f89] italic">代表当前局势与事物的初始状态</span>
            </div>
            <div className="p-0 sm:p-6 flex flex-col sm:flex-row gap-0 sm:gap-6 items-stretch">
              <div className="w-full sm:w-[260px] shrink-0 border-b border-[#414868]/50 sm:border-b-0">
                <BigHexagram name={data.mainHex.name} title={data.mainHex.name} subtitle="现状之象" />
              </div>
              <div className="flex-1 p-6 sm:p-0 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-[#7aa2f7] mb-4">{data.mainHex.name}</h3>
                <p className="text-sm text-[#8a98c9] leading-relaxed">
                  {data.mainHex.meaning}
                </p>
              </div>
            </div>
          </motion.article>

          {/* Oracle & Lines Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#bb9af7]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 group-hover:text-[#bb9af7] transition-colors" />
                爻辞卜辞解析
              </span>
              <span className="text-[10px] text-[#565f89] italic">圣人遗言，指引当下之吉凶悔吝</span>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {/* Oracle Text */}
              <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <h3 className="text-base font-bold text-[#bb9af7] mb-2 tracking-widest">【卜辞】</h3>
                <p className="text-sm text-[#c0caf5] leading-relaxed border-l-2 border-[#bb9af7] pl-4 bg-[#bb9af7]/5 py-3">
                  {data.judgment}
                </p>
              </motion.div>

              {/* Line Text Summary */}
              <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <h3 className="text-base font-bold text-[#e0af68] mb-2 tracking-widest">【动爻】</h3>
                <p className="text-sm text-[#c0caf5] leading-relaxed border-l-2 border-[#e0af68] pl-4 bg-[#e0af68]/5 py-3">
                  {data.movingLines}
                </p>
              </motion.div>
            </div>
          </motion.article>

          {/* Mutual Hexagram Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#e0af68]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <Waypoints className="w-4 h-4 group-hover:text-[#e0af68] transition-colors" />
                互卦 -- 中间之应
              </span>
              <span className="text-[10px] text-[#565f89] italic">事中之变，揭示事物发展的内在交互</span>
            </div>
            <div className="p-0 sm:p-6 flex flex-col sm:flex-row gap-0 sm:gap-6 items-stretch">
              <div className="w-full sm:w-[260px] shrink-0 border-b border-[#414868]/50 sm:border-b-0">
                <BigHexagram name={data.mutualHex.name} title={data.mutualHex.name} subtitle="过程之象" />
              </div>
              <div className="flex-1 p-6 sm:p-0 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-[#e0af68] mb-4">{data.mutualHex.name}</h3>
                <p className="text-sm text-[#8a98c9] leading-relaxed">
                  {data.mutualHex.meaning}
                </p>
              </div>
            </div>
          </motion.article>

          {/* Changed Hexagram Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#f7768e]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <RefreshCw className="w-4 h-4 group-hover:text-[#f7768e] transition-colors" />
                变卦 -- 事之终应
              </span>
              <span className="text-[10px] text-[#565f89] italic">最终趋向，预示事态发展的最终归宿</span>
            </div>
            <div className="p-0 sm:p-6 flex flex-col sm:flex-row gap-0 sm:gap-6 items-stretch">
              <div className="w-full sm:w-[260px] shrink-0 border-b border-[#414868]/50 sm:border-b-0">
                <BigHexagram name={data.changedHex.name} title={data.changedHex.name} subtitle="趋势之象" />
              </div>
              <div className="flex-1 p-6 sm:p-0 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-[#f7768e] mb-4">{data.changedHex.name}</h3>
                <p className="text-sm text-[#8a98c9] leading-relaxed">
                  {data.changedHex.meaning}
                </p>
              </div>
            </div>
          </motion.article>

          {/* Macro Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#73daca]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 group-hover:text-[#73daca] transition-colors" />
                总体解析与核心建议
              </span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-[#8a98c9] leading-relaxed">
                {data.meaning}
              </p>
              <div className="bg-[#7aa2f7]/5 border-l-4 border-[#7aa2f7] p-4">
                <h4 className="text-[#7aa2f7] font-bold mb-2 tracking-wider">【核心建议】</h4>
                <p className="text-[#c0caf5] leading-relaxed">{data.advice}</p>
              </div>
              <div className="flex gap-3 text-xs font-medium mt-2">
                <span className="border border-[#73daca] text-[#73daca] px-3 py-1.5 bg-[#73daca]/10 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#73daca] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#73daca]"></span>
                  </span>
                  总体状态: {data.overallStatus}
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
