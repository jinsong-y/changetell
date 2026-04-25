import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LoadingView() {
  const [steps, setSteps] = useState<string[]>([]);
  
  useEffect(() => {
    const sequences = [
      "心诚则灵，正在感应...",
      "排布天干地支...",
      "演化六十四卦象...",
      "推演爻辞变动...",
      "起卦完成，排图呈现中。"
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < sequences.length) {
        setSteps(prev => [...prev, sequences[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 500); 
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex border border-[#414868] bg-[#1a1b26] min-h-[400px] flex-col animate-in fade-in duration-300">
      <div className="bg-[#24283b] border-b border-[#414868] p-2 flex justify-between items-center">
        <span className="font-bold text-[#7aa2f7] text-xl tracking-wider">正在起卦</span>
        <Loader2 className="animate-spin text-[#7aa2f7] w-5 h-5" />
      </div>
      <div className="p-6 flex flex-col gap-3 font-medium text-base text-[#73daca]">
        {steps.map((step, idx) => (
          <div key={idx} className="animate-pulse">{step}</div>
        ))}
        {steps.length < 5 && (
          <div className="flex items-center gap-1 text-[#565f89]">
            <span>_</span>
            <span className="animate-blink w-2 h-4 bg-[#565f89] block"></span>
          </div>
        )}
      </div>
    </div>
  );
}
