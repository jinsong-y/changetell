import { useState } from 'react';
import Header from './components/Header';
import InputView, {
  getTimeCastRepeatKey,
  isRepeatTimeCast,
  type CastOptions,
  type TimeCastRecord,
} from './components/InputView';
import ResultView from './components/ResultView';
import LoadingView from './components/LoadingView';

export default function App() {
  const [view, setView] = useState<'input' | 'loading' | 'result'>('input');
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState('');
  const [timeCastRecords, setTimeCastRecords] = useState<TimeCastRecord[]>([]);
  const [repeatWarning, setRepeatWarning] = useState('');
  const [forceNumbersMode, setForceNumbersMode] = useState(false);

  const submitCast = async (prompt: string, timestamp: string, options?: CastOptions) => {
    setView('loading');
    setError('');
    setRepeatWarning('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          timestamp,
          castMethod: options?.method ?? 'time',
          castPayload: {
            numbers: options?.numbers,
          },
        }),
      });

      const text = await response.text();
      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(response.ok ? '服务返回格式异常，请稍后再试' : text || '服务暂时不可用，请稍后再试');
      }

      if (data.error) throw new Error(data.error);
      if (!response.ok) throw new Error('服务暂时不可用，请稍后再试');
      
      setResultData(data);
      if ((options?.method ?? 'time') === 'time') {
        const key = getTimeCastRepeatKey(prompt, new Date(timestamp));
        setTimeCastRecords((records) => records.some((record) => record.key === key) ? records : [...records, { key }]);
      }
      setView('result');
    } catch (err: any) {
      console.error(err);
      setError(err.message || '获取解析失败，请重试');
      setView('input');
    }
  };

  const handleCast = async (prompt: string, timestamp: string, options?: CastOptions) => {
    setForceNumbersMode(false);

    if ((options?.method ?? 'time') === 'time' && isRepeatTimeCast(timeCastRecords, prompt, new Date(timestamp))) {
      setRepeatWarning('同一时辰内相同问题不宜重复起卦。若此念已变，可改用报数起卦。');
      return;
    }

    await submitCast(prompt, timestamp, options);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onViewChange={() => setView('input')} />
      
      <main className="flex-grow p-4 md:p-6 pb-6 max-w-7xl mx-auto w-full">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">{error}</div>}
        {view === 'input' && (
          <InputView
            onCast={handleCast}
            repeatWarning={repeatWarning}
            onUseNumbers={() => {
              setRepeatWarning('');
              setForceNumbersMode(true);
            }}
            onContinueTime={(prompt, timestamp) => {
              void submitCast(prompt, timestamp, { method: 'time' });
            }}
            forceNumbersMode={forceNumbersMode}
          />
        )}
        {view === 'loading' && <LoadingView />}
        {view === 'result' && <ResultView data={resultData} onRestart={() => setView('input')} />}
      </main>
    </div>
  );
}
