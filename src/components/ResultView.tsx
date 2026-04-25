import { CheckCircle2, BookOpen, RefreshCw, Grid, Star, Layers, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { getBinaryByHexName } from '../utils/iching';

const HexLines = ({ name, colorClass }: { name: string, colorClass: string }) => {
  const binary = getBinaryByHexName(name);
  if (!binary) return null;

  // binary 是从下往上 (0-2是下卦, 3-5是上卦)
  // 渲染时我们需要从上往下排，所以要 reverse
  const lines = binary.split('').reverse();

  return (
    <div className="flex flex-col gap-2 w-full max-w-[100px] mx-auto py-4">
      {lines.map((line, i) => (
        line === '0' ? (
          <div key={i} className="flex gap-2 w-full h-3">
            <div className={`flex-1 ${colorClass} opacity-80`}></div>
            <div className={`flex-1 ${colorClass} opacity-80`}></div>
          </div>
        ) : (
          <div key={i} className={`w-full h-3 ${colorClass}`}></div>
        )
      ))}
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, ease: "easeOut", duration: 0.4 }
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
      className="flex flex-col gap-6 max-w-5xl mx-auto w-full"
    >
      <motion.section variants={itemVariants} className="border border-[#414868] bg-[#24283b]/50 p-3 flex flex-col gap-1 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#73daca]"></div>
        <div className="text-xs font-medium text-[#7aa2f7] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>天机已现，感应成功</span>
        </div>
        <div className="text-[10px] text-[#565f89] mt-1 ml-6 uppercase italic">
          梅花易数时间起卦：{data.timeAnalysis}
        </div>
      </motion.section>

      {/* Hexagram Trio Layout with Visual Lines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] p-6 flex flex-col gap-3 relative overflow-hidden group hover:border-[#7aa2f7]/40">
          <div className="flex items-center gap-2 text-[#7aa2f7] mb-2 border-b border-[#414868] pb-2">
            <Grid className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">主卦 (现状)</span>
          </div>
          <HexLines name={data.mainHex.name} colorClass="bg-[#7aa2f7]" />
          <h3 className="text-xl font-bold text-[#c0caf5] text-center mt-2">{data.mainHex.name}</h3>
          <p className="text-xs text-[#8a98c9] leading-relaxed italic text-center">{data.mainHex.meaning}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] p-6 flex flex-col gap-3 relative overflow-hidden group hover:border-[#bb9af7]/40">
          <div className="flex items-center gap-2 text-[#bb9af7] mb-2 border-b border-[#414868] pb-2">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">互卦 (过程)</span>
          </div>
          <HexLines name={data.mutualHex.name} colorClass="bg-[#bb9af7]" />
          <h3 className="text-xl font-bold text-[#c0caf5] text-center mt-2">{data.mutualHex.name}</h3>
          <p className="text-xs text-[#8a98c9] leading-relaxed italic text-center">{data.mutualHex.meaning}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] p-6 flex flex-col gap-3 relative overflow-hidden group hover:border-[#f7768e]/40">
          <div className="flex items-center gap-2 text-[#f7768e] mb-2 border-b border-[#414868] pb-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">变卦 (趋向)</span>
          </div>
          <HexLines name={data.changedHex.name} colorClass="bg-[#f7768e]" />
          <h3 className="text-xl font-bold text-[#c0caf5] text-center mt-2">{data.changedHex.name}</h3>
          <p className="text-xs text-[#8a98c9] leading-relaxed italic text-center">{data.changedHex.meaning}</p>
        </motion.div>
      </div>

      <div className="flex flex-col gap-6">
        <motion.article variants={itemVariants} className="border border-[#414868] bg-[#24283b]/30 p-4 flex items-center gap-4">
          <Zap className="w-5 h-5 text-[#e0af68]" />
          <p className="text-sm text-[#c0caf5] font-medium tracking-wide">
            <span className="text-[#e0af68] mr-2">动爻启示:</span> {data.movingLines}
          </p>
        </motion.article>

        <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#7aa2f7]/40 transition-colors">
          <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center">
            <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#7aa2f7]" />
              微言大义
            </span>
          </div>
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div>
              <h4 className="text-[#bb9af7] font-bold mb-3 tracking-wider">【卜辞】</h4>
              <p className="text-[#c0caf5] text-lg font-medium leading-relaxed">{data.judgment}</p>
            </div>
            <div className="border-t border-[#414868]/50 pt-6">
              <h4 className="text-[#73daca] font-bold mb-3 tracking-wider">【深度解析】</h4>
              <p className="text-[#c0caf5] leading-relaxed text-base">{data.meaning}</p>
            </div>
            <div className="bg-[#7aa2f7]/5 border-l-4 border-[#7aa2f7] p-4">
              <h4 className="text-[#7aa2f7] font-bold mb-2 tracking-wider">【核心建议】</h4>
              <p className="text-[#c0caf5] leading-relaxed">{data.advice}</p>
            </div>
          </div>
        </motion.article>

        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          <div className="border border-[#73daca] text-[#73daca] px-8 py-4 bg-[#73daca]/10 flex items-center gap-4">
            <Star className="w-6 h-6 fill-[#73daca]" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-tighter opacity-70">总体考量</span>
              <span className="text-2xl font-bold tracking-[0.2em]">{data.overallStatus}</span>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "#7aa2f7", color: "#1a1b26", boxShadow: "0 0 30px rgba(122, 162, 247, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="pulse-effect border border-[#7aa2f7] bg-[#1a1b26] text-[#7aa2f7] text-lg font-bold py-4 px-12 tracking-widest uppercase transition-all flex items-center gap-3"
          >
            <RefreshCw className="w-5 h-5" />
            再起一卦
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
