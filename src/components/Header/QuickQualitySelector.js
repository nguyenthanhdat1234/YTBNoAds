import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, ChevronDown } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { getQualityOptions } from '../../utils/youtubeHelpers';

const QuickQualitySelector = () => {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const qualityOptions = getQualityOptions();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQualitySelect = (quality) => {
    updateSetting('quality', quality);
    setIsOpen(false);
  };

  const getCurrentQualityLabel = () => {
    if (settings.quality === 'auto') {
      return 'AUTO';
    }
    const current = qualityOptions.find(q => q.label === settings.quality);
    return current ? current.label.toUpperCase() : 'AUTO';
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
        title={t('player.controls.quality')}
      >
        <Monitor className={`w-4 h-4 transition-colors ${isOpen ? 'text-cinema-red' : 'text-current'}`} />
        <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em]">
          {getCurrentQualityLabel()}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${isOpen ? 'rotate-180 text-cinema-red' : 'text-current opacity-40'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-cinema-surface/95 backdrop-blur-3xl border border-white/10 rounded-sm shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-slide-up">
          <div className="p-2 space-y-1">
            <div className="px-4 py-3 border-b border-white/5 mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cinema-red">Visual Fidelity</span>
            </div>
            
            {/* Auto Quality Option */}
            <button
              onClick={() => handleQualitySelect('auto')}
              className={`w-full text-left px-4 py-3.5 rounded-sm transition-all duration-300 relative group overflow-hidden ${
                settings.quality === 'auto'
                  ? 'bg-cinema-red/10 border border-cinema-red/20'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col space-y-0.5">
                  <span className={`text-[11px] font-black uppercase tracking-widest ${settings.quality === 'auto' ? 'text-white' : 'text-cinema-gray/80 group-hover:text-white'}`}>
                    AUTO
                  </span>
                  <span className="text-[8px] font-bold text-cinema-gray/40 uppercase tracking-[0.2em]">
                    Adaptive Protocol
                  </span>
                </div>
                {settings.quality === 'auto' && (
                  <div className="w-1.5 h-1.5 bg-cinema-red rounded-full shadow-[0_0_10px_rgba(229,9,20,1)]" />
                )}
              </div>
              {settings.quality === 'auto' && (
                <div className="absolute left-0 top-0 w-1 h-full bg-cinema-red" />
              )}
            </button>

            {/* Quality Options */}
            {qualityOptions.slice().reverse().map((quality) => (
              <button
                key={quality.label}
                onClick={() => handleQualitySelect(quality.label)}
                className={`w-full text-left px-4 py-3.5 rounded-sm transition-all duration-300 relative group overflow-hidden ${
                  settings.quality === quality.label
                    ? 'bg-cinema-red/10 border border-cinema-red/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex flex-col space-y-0.5">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${settings.quality === quality.label ? 'text-white' : 'text-cinema-gray/80 group-hover:text-white'}`}>
                      {quality.label}
                    </span>
                    <span className="text-[8px] font-bold text-cinema-gray/40 uppercase tracking-[0.2em]">
                      {quality.height}P Resolution
                    </span>
                  </div>
                  {settings.quality === quality.label && (
                    <div className="w-1.5 h-1.5 bg-cinema-red rounded-full shadow-[0_0_10px_rgba(229,9,20,1)]" />
                  )}
                </div>
                {settings.quality === quality.label && (
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

export default QuickQualitySelector;
