import { Terminal } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import { SUPPORTED_LOCALES, type Locale } from '../i18n/types';

export default function Header({ onViewChange }: { onViewChange: () => void }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="bg-[#1a1b26] font-bold uppercase tracking-tighter w-full top-0 border-b border-[#414868] flex justify-between items-center px-4 h-12 sticky z-50">
      <button
        type="button"
        onClick={onViewChange}
        className="flex items-center gap-2"
        aria-label="CHANGE_TELL"
      >
        <Terminal className="text-[#7aa2f7] w-5 h-5 transition-opacity" />
        <span className="text-lg text-[#7aa2f7] tracking-widest transition-opacity">CHANGE_TELL</span>
      </button>
      <div className="flex border border-[#414868] bg-[#0c0e13] text-xs tracking-widest">
        {SUPPORTED_LOCALES.map((item: Locale) => (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            className={`px-3 py-1.5 transition-colors ${
              locale === item
                ? 'bg-[#7aa2f7] text-[#1a1b26]'
                : 'text-[#8a98c9] hover:text-[#c0caf5]'
            }`}
          >
            {t(item === 'zh-CN' ? 'header.language.zh' : 'header.language.en')}
          </button>
        ))}
      </div>
    </header>
  );
}
