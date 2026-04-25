import { Terminal } from 'lucide-react';

export default function Header({ onViewChange }: { onViewChange: () => void }) {
  return (
    <header className="bg-[#1a1b26] font-bold uppercase tracking-tighter w-full top-0 border-b border-[#414868] flex justify-between items-center px-4 h-12 sticky z-50">
      <div className="flex items-center gap-2">
        <Terminal className="text-[#7aa2f7] w-5 h-5 transition-opacity" />
        <span className="text-lg text-[#7aa2f7] tracking-widest transition-opacity">CHANGE_TELL</span>
      </div>
    </header>
  );
}
