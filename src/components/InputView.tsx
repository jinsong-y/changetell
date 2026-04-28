import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HEXAGRAMS_TABLE, TRIGRAMS, type TrigramName } from '../utils/iching';

const getTrigramByCode = (code: string): TrigramName => {
  const found = Object.entries(TRIGRAMS).find(([, binary]) => binary === code);
  return (found?.[0] as TrigramName | undefined) ?? '天';
};

export const getCastTimestamp = (date = new Date()) => date.toISOString();

export interface TimeCastRecord {
  key: string;
}

export const normalizePromptForRepeat = (prompt: string) => prompt.trim().replace(/\s+/g, ' ');

export const getChineseZhiHourIndex = (date = new Date()) => {
  const hour = date.getHours();
  return hour === 23 ? 0 : Math.floor((hour + 1) / 2);
};

const getTimeCastDateKey = (date: Date) => {
  const keyDate = new Date(date);
  if (date.getHours() === 23) {
    keyDate.setDate(keyDate.getDate() + 1);
  }

  const year = keyDate.getFullYear();
  const month = String(keyDate.getMonth() + 1).padStart(2, '0');
  const day = String(keyDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTimeCastRepeatKey = (prompt: string, date = new Date()) => {
  return `${normalizePromptForRepeat(prompt)}|${getTimeCastDateKey(date)}:${getChineseZhiHourIndex(date)}`;
};

export const isRepeatTimeCast = (
  records: TimeCastRecord | TimeCastRecord[] | null,
  prompt: string,
  date = new Date(),
) => {
  if (!records || !normalizePromptForRepeat(prompt)) return false;
  const repeatKey = getTimeCastRepeatKey(prompt, date);
  return Array.isArray(records)
    ? records.some((record) => record.key === repeatKey)
    : records.key === repeatKey;
};

export type CastMethod = 'time' | 'numbers';

export interface CastOptions {
  method: CastMethod;
  numbers?: number[];
}

export interface InputViewProps {
  onCast: (prompt: string, timestamp: string, options?: CastOptions) => void;
  repeatWarning?: string;
  onUseNumbers?: () => void;
  onContinueTime?: (prompt: string, timestamp: string) => void;
  forceNumbersMode?: boolean;
  initialCastMethod?: CastMethod;
}

const NUMBER_CAST_MIN = 1;
const NUMBER_CAST_MAX = 999;
const REQUIRED_NUMBER_ERROR = '上卦数和下卦数需填写 1 到 999 的整数';
const MOVING_NUMBER_ERROR = '动爻数如填写，也需是 1 到 999 的整数';

const parseNumberInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return Number.NaN;

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= NUMBER_CAST_MIN && parsed <= NUMBER_CAST_MAX
    ? parsed
    : Number.NaN;
};

export const getNumberCastPayload = (inputs: string[]) => {
  const upper = parseNumberInput(inputs[0] ?? '');
  const lower = parseNumberInput(inputs[1] ?? '');
  const moving = parseNumberInput(inputs[2] ?? '');
  const hasRequiredNumbers = upper !== null && lower !== null;
  const requiredNumbersValid = hasRequiredNumbers && Number.isFinite(upper) && Number.isFinite(lower);
  const movingValid = moving === null || Number.isFinite(moving);
  const canCast = requiredNumbersValid && movingValid;

  let error = '';
  if (!requiredNumbersValid && (inputs[0]?.trim() || inputs[1]?.trim())) {
    error = REQUIRED_NUMBER_ERROR;
  } else if (requiredNumbersValid && !movingValid) {
    error = MOVING_NUMBER_ERROR;
  }

  return {
    canCast,
    numbers: canCast ? [upper as number, lower as number, ...(moving === null ? [] : [moving as number])] : [],
    error,
  };
};

export const getVisualHexagram = (lines: number[]) => {
  const upperCode = lines.slice(0, 3).map(l => l >= 8 ? '0' : '1').join('');
  const lowerCode = lines.slice(3, 6).map(l => l >= 8 ? '0' : '1').join('');
  const upperTri = getTrigramByCode(upperCode);
  const lowerTri = getTrigramByCode(lowerCode);

  return {
    upperTri,
    lowerTri,
    name: HEXAGRAMS_TABLE[upperTri][lowerTri],
  };
};

export default function InputView({
  onCast,
  repeatWarning,
  onUseNumbers,
  onContinueTime,
  forceNumbersMode,
  initialCastMethod = 'time',
}: InputViewProps) {
  const [inputVal, setInputVal] = useState('');
  const [castMethod, setCastMethod] = useState<CastMethod>(initialCastMethod);
  const [numberInputs, setNumberInputs] = useState(['', '', '']);
  const [animKey, setAnimKey] = useState(0);

  // 仅保留视觉动画，不作为实际计算依据
  const [visualLines, setVisualLines] = useState<number[]>([7, 8, 7, 8, 7, 8]);

  useEffect(() => {
    if (forceNumbersMode) {
      setCastMethod('numbers');
    }
  }, [forceNumbersMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisualLines(Array(6).fill(0).map(() => Math.random() > 0.5 ? 7 : 8));
      setAnimKey(prev => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const { upperTri, lowerTri, name: hexName } = getVisualHexagram(visualLines);
  const numberCastPayload = getNumberCastPayload(numberInputs);
  const canCast = Boolean(inputVal.trim()) && (castMethod === 'time' || numberCastPayload.canCast);

  const handleCastClick = () => {
    if (canCast) {
      onCast(inputVal, getCastTimestamp(), {
        method: castMethod,
        numbers: castMethod === 'numbers' ? numberCastPayload.numbers : undefined,
      });
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
            className="text-[#73daca] text-base font-medium"
          >
            优先以当前时辰起卦。凡占卜者，必诚心正意。
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
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 1.3, duration: 1 }} 
            className="text-[#7aa2f7]/60 text-xs leading-relaxed"
          >
            “初筮告，再三渎，渎则不告。”<br/>
            同一时辰内，不要反复起卦。
          </motion.div>

            {repeatWarning && (
              <div className="border border-[#e0af68] bg-[#e0af68]/10 p-3 text-sm text-[#e0af68] flex flex-col gap-3">
                <p className="leading-relaxed break-words">{repeatWarning}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={onUseNumbers}
                    className="border border-[#73daca] bg-[#73daca]/10 px-3 py-2 text-xs font-bold tracking-widest text-[#73daca]"
                  >
                    改用报数起卦
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!inputVal.trim()) return;
                      onContinueTime?.(inputVal, getCastTimestamp());
                    }}
                    className="border border-[#414868] bg-[#1a1b26] px-3 py-2 text-xs font-bold tracking-widest text-[#8a98c9]"
                  >
                    仍用时辰起卦
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'time', label: '时间起卦' },
                { key: 'numbers', label: '报数起卦' },
              ].map((method) => (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => setCastMethod(method.key as CastMethod)}
                  className={`border px-3 py-2 text-xs font-bold tracking-widest transition-colors ${
                    castMethod === method.key
                      ? 'border-[#73daca] bg-[#73daca]/10 text-[#73daca]'
                      : 'border-[#414868] bg-[#1a1b26] text-[#8a98c9] hover:border-[#7aa2f7] hover:text-[#7aa2f7]'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            {castMethod === 'numbers' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['上卦数', '下卦数', '动爻数(可选)'].map((label, index) => (
                  <label key={label} className="border border-[#414868] bg-[#24283b] p-2 flex flex-col gap-1 focus-within:border-[#bb9af7] transition-colors">
                    <span className="text-[10px] text-[#565f89] tracking-widest">{label}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={numberInputs[index]}
                      onChange={(event) => {
                        const next = [...numberInputs];
                        next[index] = event.target.value.replace(/[^\d-]/g, '');
                        setNumberInputs(next);
                      }}
                      className="bg-transparent border-none outline-none text-[#c0caf5] text-sm placeholder-[#565f89] focus:ring-0"
                      placeholder={index < 2 ? '必填' : '可空'}
                    />
                  </label>
                ))}
              </div>
            )}
            
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
              {visualLines.map((line, idx) => {
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
            whileHover={canCast ? { scale: 1.02, backgroundColor: "#73daca", color: "#1a1b26", boxShadow: "0 0 20px rgba(115, 218, 202, 0.4)" } : {}}
            whileTap={canCast ? { scale: 0.98 } : {}}
            transition={{ ease: "easeOut", duration: 0.2 }}
            onClick={handleCastClick}
            disabled={!canCast}
            className="pulse-effect disabled:opacity-50 disabled:[animation:none] disabled:border-[#565f89] disabled:text-[#565f89] disabled:cursor-not-allowed border border-[#73daca] bg-[#1a1b26] text-[#73daca] text-xl font-bold py-4 px-12 tracking-widest uppercase transition-colors duration-300"
          >
            掷爻
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
