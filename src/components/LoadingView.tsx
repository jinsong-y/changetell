import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/useI18n';

export const LOADING_SEQUENCE_KEYS = [
  'loading.step.1',
  'loading.step.2',
  'loading.step.3',
  'loading.step.4',
  'loading.step.5',
] as const;

export type LoadingSequenceKey = (typeof LOADING_SEQUENCE_KEYS)[number];

export const getLoadingSequenceStep = (index: number): LoadingSequenceKey | null =>
  LOADING_SEQUENCE_KEYS[index] ?? null;

export default function LoadingView() {
  const { t } = useI18n();
  const [steps, setSteps] = useState<LoadingSequenceKey[]>([]);
  
  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      const step = getLoadingSequenceStep(currentStep);
      if (!step) {
        clearInterval(interval);
        return;
      }

      setSteps(prev => [...prev, step]);
      currentStep++;
    }, 500); 
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex border border-[#414868] bg-[#1a1b26] min-h-[400px] flex-col animate-in fade-in duration-300">
      <div className="bg-[#24283b] border-b border-[#414868] p-2 flex justify-between items-center">
        <span className="font-bold text-[#7aa2f7] text-xl tracking-wider">{t('loading.title')}</span>
        <Loader2 className="animate-spin text-[#7aa2f7] w-5 h-5" />
      </div>
      <div className="p-6 flex flex-col gap-3 font-medium text-base text-[#73daca]">
        {steps.map((step, idx) => (
          <div key={idx} className="animate-pulse">{t(step)}</div>
        ))}
        {steps.length < LOADING_SEQUENCE_KEYS.length && (
          <div className="flex items-center gap-1 text-[#565f89]">
            <span>_</span>
            <span className="animate-blink w-2 h-4 bg-[#565f89] block"></span>
          </div>
        )}
      </div>
    </div>
  );
}
