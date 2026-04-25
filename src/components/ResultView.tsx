import { Loader2, RefreshCw, CheckCircle2, Grid, Compass, List, BookOpen, Activity, Waypoints } from 'lucide-react';
import { motion } from 'motion/react';

type LineType = 'yin' | 'yang';

const BigHexagram = ({ lines, title, subtitle }: { lines: LineType[], title: string, subtitle: string }) => (
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
        <span>{title} 卦</span>
      </h2>
      <p className="text-xs font-medium text-[#565f89] mt-2 tracking-widest">{subtitle}</p>
    </div>
  </div>
);

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

export default function ResultView({ onRestart }: { onRestart: () => void }) {
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
          <span>起卦完成，感应天机...</span>
        </div>
        <div className="text-xs font-medium text-[#c0caf5] flex items-center gap-2 opacity-80 mt-1">
          <span className="w-4 text-center">·</span>
          <span>得到主卦：地天泰，无动爻</span>
        </div>
      </motion.section>

      {/* Data Layout */}
      <div className="flex flex-col gap-6">
        
        {/* Analyses */}
        <div className="flex flex-col gap-6">
          
          {/* Main Hexagram Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#7aa2f7]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <Grid className="w-4 h-4 group-hover:text-[#7aa2f7] transition-colors" />
                主卦 -- 事之初
              </span>
            </div>
            <div className="p-0 sm:p-6 flex flex-col sm:flex-row gap-0 sm:gap-6 items-stretch">
              <div className="w-full sm:w-[260px] shrink-0 border-b border-[#414868]/50 sm:border-b-0">
                <BigHexagram title="泰" subtitle="坤上乾下 // 通达交融" lines={['yin', 'yin', 'yin', 'yang', 'yang', 'yang']} />
              </div>
              <div className="flex-1 p-6 sm:p-0 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-[#7aa2f7] mb-4">地天泰（坤上乾下）</h3>
                <p className="text-sm text-[#8a98c9] leading-relaxed">
                  主卦为地天泰。外卦为坤（地），内卦为乾（天）。天本高地本低，但此时地高天低，地气下降而天气上升，天地交合，代表顺畅沟通与事物蓬勃发展。象征求侧者面临的局面十分康泰，各方面顺风顺水。
                </p>
              </div>
            </div>
          </motion.article>

          {/* Oracle & Lines Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#bb9af7]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 group-hover:text-[#bb9af7] transition-colors" />
                爻辞卜辞解析
              </span>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {/* Oracle Text */}
              <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <h3 className="text-base font-bold text-[#bb9af7] mb-2 tracking-widest">【卜辞】泰：小往大来，吉亨。</h3>
                <p className="text-sm text-[#c0caf5] leading-relaxed border-l-2 border-[#bb9af7] pl-4 bg-[#bb9af7]/5 py-3">
                  天地之气交和，阴阳调和，万物顺随。付出较小而收获颇大，非常吉祥亨通。这是一个充满生机与和谐的好卦，提示你顺应天时，把握当下良好机遇。
                </p>
              </motion.div>

              {/* Line Text Summary */}
              <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <h3 className="text-base font-bold text-[#7aa2f7] mb-2 tracking-widest">【爻辞】无平不陂，无往不复。</h3>
                <p className="text-sm text-[#c0caf5] leading-relaxed border-l-2 border-[#7aa2f7] pl-4 bg-[#7aa2f7]/5 py-3">
                  天下没有平地不变成陡坡的，没有去了不回来的。在顺利时要居安思危，坚守正道，这样才不会有灾祸。爻辞着重提醒，极盛之时暗藏衰退的法则，切不可因一时的顺境而骄傲放纵。
                </p>
              </motion.div>
            </div>
          </motion.article>

          {/* Mutual Hexagram Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#e0af68]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <Waypoints className="w-4 h-4 group-hover:text-[#e0af68] transition-colors" />
                互卦 -- 中间之应
              </span>
            </div>
            <div className="p-0 sm:p-6 flex flex-col sm:flex-row gap-0 sm:gap-6 items-stretch">
              <div className="w-full sm:w-[260px] shrink-0 border-b border-[#414868]/50 sm:border-b-0">
                <BigHexagram title="归妹" subtitle="震上兑下 // 隐藏冲动" lines={['yin', 'yin', 'yang', 'yin', 'yang', 'yang']} />
              </div>
              <div className="flex-1 p-6 sm:p-0 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-[#7aa2f7] mb-4">雷泽归妹</h3>
                <p className="text-sm text-[#8a98c9] leading-relaxed">
                  互卦为雷泽归妹。反映了事物发展过程中的隐藏动态。归妹卦有欲望冲动、违反常规之意，提示在泰卦的太平顺境中，内部可能暗藏情感冲动或因骄傲而导致不守规矩的隐患。不可得意忘形。
                </p>
              </div>
            </div>
          </motion.article>

          {/* Changed Hexagram Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#f7768e]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <RefreshCw className="w-4 h-4 group-hover:text-[#f7768e] transition-colors" />
                变卦 -- 事之终应
              </span>
            </div>
            <div className="p-0 sm:p-6 flex flex-col sm:flex-row gap-0 sm:gap-6 items-stretch">
              <div className="w-full sm:w-[260px] shrink-0 border-b border-[#414868]/50 sm:border-b-0">
                <BigHexagram title="明夷" subtitle="坤上离下 // 光明受损" lines={['yin', 'yin', 'yin', 'yang', 'yin', 'yang']} />
              </div>
              <div className="flex-1 p-6 sm:p-0 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-[#7aa2f7] mb-4">地火明夷</h3>
                <p className="text-sm text-[#8a98c9] leading-relaxed">
                  变卦为地火明夷。代表事物最终的发展趋势或结果的变化。明夷意为光明受损、艰难隐忍。预示着长远来看，如果不能在顺境中保持警惕，最终会转入阶段性的低谷。需学会韬光养晦，方能度过难关。
                </p>
              </div>
            </div>
          </motion.article>

          {/* Macro Analysis */}
          <motion.article variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col group hover:border-[#73daca]/40 transition-colors duration-500">
            <div className="bg-[#24283b] border-b border-[#414868] px-3 py-2 flex items-center">
              <span className="text-xs font-medium text-[#c0caf5] tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 group-hover:text-[#73daca] transition-colors" />
                总体解析
              </span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-[#7aa2f7]">天地交泰，内阳外阴</h3>
              <p className="text-sm text-[#8a98c9] leading-relaxed">
                坤（地）在天之上，地气向下，天气向上，阴阳二气相互交感，代表着事物处于极其和谐、顺利的状态。此时无论求财、谋事皆能如愿。但《易经》强调用发展的眼光看问题，泰极否来，在顺境中更要居安思危，保持谦虚与警惕，方能长久。
              </p>
              <div className="flex gap-3 text-xs font-medium mt-2">
                <span className="border border-[#73daca] text-[#73daca] px-3 py-1.5 bg-[#73daca]/10 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#73daca] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#73daca]"></span>
                  </span>
                  总体状态: 大吉
                </span>
                <span className="border border-[#565f89] text-[#565f89] px-3 py-1.5 flex items-center gap-1 group-hover:border-[#7aa2f7]/50 group-hover:text-[#7aa2f7] transition-colors duration-300">
                  发展趋向: 平顺
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
              卜卦
            </motion.button>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
