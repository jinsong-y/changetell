import { useState } from 'react';
import Header from './components/Header';
import InputView from './components/InputView';
import ResultView from './components/ResultView';
import LoadingView from './components/LoadingView';

export default function App() {
  const [view, setView] = useState<'input' | 'loading' | 'result'>('input');
  
  const handleCast = () => {
    setView('loading');
    setTimeout(() => {
      setView('result');
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onViewChange={() => setView('input')} />
      
      <main className="flex-grow p-4 md:p-6 pb-6 max-w-7xl mx-auto w-full">
        {view === 'input' && <InputView onCast={handleCast} />}
        {view === 'loading' && <LoadingView />}
        {view === 'result' && <ResultView onRestart={() => setView('input')} />}
      </main>
    </div>
  );
}
