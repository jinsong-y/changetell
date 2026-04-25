import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const TRIGRAMS: Record<string, string> = {
  '111': '天', '011': '泽', '101': '火', '001': '雷',
  '110': '风', '010': '水', '100': '山', '000': '地'
};

const HEXAGRAMS: Record<string, Record<string, string>> = {
  '天': { '天': '乾为天', '泽': '天泽履', '火': '天火同人', '雷': '天雷无妄', '风': '天风姤', '水': '天水讼', '山': '天山遁', '地': '天地否' },
  '泽': { '天': '泽天夬', '泽': '兑为泽', '火': '泽火革', '雷': '泽雷随', '风': '泽风大过', '水': '泽水困', '山': '泽山咸', '地': '泽地萃' },
  '火': { '天': '火天大有', '泽': '火泽睽', '火': '离为火', '雷': '火雷噬嗑', '风': '火风鼎', '水': '火水未济', '山': '火山旅', '地': '火地晋' },
  '雷': { '天': '雷天大壮', '泽': '雷泽归妹', '火': '雷火丰', '雷': '震为雷', '风': '雷风恒', '水': '雷水解', '山': '雷山小过', '地': '雷地豫' },
  '风': { '天': '风天小畜', '泽': '风泽中孚', '火': '风火家人', '雷': '风雷益', '风': '巽为风', '水': '风水涣', '山': '风山渐', '地': '风地观' },
  '水': { '天': '水天需', '泽': '水泽节', '火': '水火既济', '雷': '水雷屯', '风': '水风井', '水': '坎为水', '山': '水山蹇', '地': '水地比' },
  '山': { '天': '山天大畜', '泽': '山泽损', '火': '山火贲', '雷': '山雷颐', '风': '山风蛊', '水': '山水蒙', '山': '艮为山', '地': '山地剥' },
  '地': { '天': '地天泰', '泽': '地泽临', '火': '地火明夷', '雷': '地雷复', '风': '地风升', '水': '地水师', '山': '地山谦', '地': '坤为地' }
};

export default function InputView({ onCast }: { onCast: (prompt: string, timestamp: string) => void }) {
  const [inputVal, setInputVal] = useState('');
  const [animKey, setAnimKey] = useState(0);

  // 仅保留视觉动画，不作为实际计算依据
  const [visualLines, setVisualLines] = useState<number[]>([7, 8, 7, 8, 7, 8]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisualLines(Array(6).fill(0).map(() => Math.random() > 0.5 ? 7 : 8));
      setAnimKey(prev => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCastClick = () => {
    if (inputVal.trim()) {
      const now = new Date();
      // 传递本地 ISO 时间字符串，以便后端进行梅花易数推演
      onCast(inputVal, now.toLocaleString('zh-CN', { hour12: false }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        ease: "easeOut",
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      className="max-w-3xl mx-auto flex flex-col gap-6 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Terminal Input + Matrix */}
      
        {/* Input Block */}
        <motion.div variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7aa2f7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          <div className="bg-[#24283b] border-b border-[#414868] p-2 flex justify-between items-center z-10">
          <span className="font-bold text-[#7aa2f7] text-xl tracking-wider">起卦</span>
          <span className="text-[#565f89] font-medium text-xs tracking-widest text-right">诚心正意</span>
        </div>
        <div className="p-4 flex flex-col gap-4 min-h-[150px] z-10">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3, duration: 1 }} 
            className="text-[#73daca] text-base"
          >
            凡占卜者，必诚心正意。
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8, duration: 1 }} 
            className="text-[#73daca] text-base"
          >
            请在此默念所求之事...
          </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 1.2, duration: 0.8 }} 
              className="mt-auto pt-2"
            >
              <div className="flex items-center gap-2 border border-[#414868] p-2 bg-[#24283b] focus-within:border-[#7aa2f7] focus-within:[box-shadow:0_0_15px_rgba(122,162,247,0.15)] transition-all duration-300">
                <span className="text-[#bb9af7] font-bold">&gt;</span>
                <input 
                  type="text" 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCastClick();
                    }
                  }}
                  autoFocus
                  placeholder="输入求问之事..." 
                  className="bg-transparent border-none outline-none text-[#c0caf5] w-full text-base placeholder-[#565f89] focus:ring-0" 
                />
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-2 h-5 bg-[#7aa2f7] block"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

      {/* Divination Matrix */}
      <motion.div variants={itemVariants} className="border border-[#414868] bg-[#1a1b26] flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#bb9af7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        <div className="bg-[#24283b] border-b border-[#414868] p-2 flex justify-between items-center z-10">
          <span className="font-bold text-[#bb9af7] text-xs tracking-wider">念起卦生</span>
        </div>
        <div className="p-6 flex flex-col items-center justify-center gap-6 min-h-[200px] z-10">
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={animKey}
              initial={{ filter: "blur(4px)", opacity: 0, scale: 0.98 }}
              animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-3 w-full max-w-[160px]"
            >
              {lines.map((line, idx) => {
                const isYin = line === 6 || line === 8;
                const isMoving = line === 6 || line === 9;
                return isYin ? (
                  <div key={idx} className="flex gap-4 w-full h-5 relative group/line">
                    <div className={`flex-1 ${isMoving ? 'bg-[#f7768e]' : 'hex-bar-tertiary'}`}></div>
                    <div className={`flex-1 ${isMoving ? 'bg-[#f7768e]' : 'hex-bar-tertiary'}`}></div>
                    {isMoving && <span className="absolute -right-6 text-[#f7768e] text-xs">●</span>}
                  </div>
                ) : (
                  <div key={idx} className={`w-full h-5 relative group/line ${isMoving ? 'bg-[#e0af68]' : 'hex-bar-primary'}`}>
                    {isMoving && <span className="absolute -right-6 text-[#e0af68] text-xs">○</span>}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div 
              key={hexName}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center w-full border-t border-[#414868] pt-4 mb-2"
            >
              <h2 className="text-2xl font-bold text-[#c0caf5] tracking-widest drop-shadow-sm">
                <span>{hexName}</span>
              </h2>
              <p className="text-xs font-medium text-[#565f89] mt-2 tracking-widest">{upperTri}上 // {lowerTri}下</p>
            </motion.div>
          </AnimatePresence>

          <motion.button 
            whileHover={inputVal.trim() ? { scale: 1.02, backgroundColor: "#73daca", color: "#1a1b26", boxShadow: "0 0 20px rgba(115, 218, 202, 0.4)" } : {}}
            whileTap={inputVal.trim() ? { scale: 0.98 } : {}}
            transition={{ ease: "easeOut", duration: 0.2 }}
            onClick={handleCastClick}
            disabled={!inputVal.trim()}
            className="pulse-effect disabled:opacity-50 disabled:[animation:none] disabled:border-[#565f89] disabled:text-[#565f89] disabled:cursor-not-allowed border border-[#73daca] bg-[#1a1b26] text-[#73daca] text-xl font-bold py-4 px-12 tracking-widest uppercase transition-colors duration-300"
          >
            掷爻
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
