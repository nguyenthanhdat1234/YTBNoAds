import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'pt', name: 'Portuguese (BR)', nativeName: 'Português (BR)' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('language', languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 px-4 py-2.5 rounded-sm transition-all duration-500 border ${
          isOpen 
            ? 'bg-white/10 border-white/20 text-white shadow-2xl' 
            : 'bg-white/[0.02] border-white/5 text-cinema-gray/60 hover:text-white hover:bg-white/5'
        }`}
        title={t('header.changeLanguage')}
      >
        <Languages className={`w-4 h-4 transition-colors ${isOpen ? 'text-cinema-red' : 'text-current'}`} />
        <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em]">
          {currentLanguage.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${isOpen ? 'rotate-180 text-cinema-red' : 'text-current opacity-40'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-cinema-surface/95 backdrop-blur-3xl border border-white/10 rounded-sm shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-50 max-h-[70vh] overflow-y-auto no-scrollbar animate-slide-up">
          <div className="p-2 space-y-1">
            <div className="px-4 py-3 border-b border-white/5 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-red">Protocol Translation</span>
            </div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-5 py-4 rounded-sm transition-all duration-300 relative group overflow-hidden ${
                  currentLanguage.code === language.code
                    ? 'bg-cinema-red/10 border border-cinema-red/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex flex-col space-y-0.5">
                    <span className={`text-[12px] font-black uppercase tracking-widest ${currentLanguage.code === language.code ? 'text-white' : 'text-cinema-gray/80 group-hover:text-white'}`}>
                      {language.nativeName}
                    </span>
                    <span className="text-[9px] font-bold text-cinema-gray/40 uppercase tracking-[0.2em]">
                      {language.name} Region
                    </span>
                  </div>
                  {currentLanguage.code === language.code && (
                    <div className="w-1.5 h-1.5 bg-cinema-red rounded-full shadow-[0_0_10px_rgba(229,9,20,1)]" />
                  )}
                </div>
                {currentLanguage.code === language.code && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-cinema-red" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
