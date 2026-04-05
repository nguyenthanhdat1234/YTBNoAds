import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, ChevronDown, Check } from 'lucide-react';
import { getQualityOptions } from '../../utils/youtubeHelpers';

const QualitySelector = ({ currentQuality, onQualityChange, disabled = false }) => {
  const { t } = useTranslation();
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
    onQualityChange(quality);
    setIsOpen(false);
  };

  const getCurrentQualityLabel = () => {
    if (currentQuality === 'auto') {
      return t('player.quality.auto');
    }
    const current = qualityOptions.find(q => q.label === currentQuality);
    return current ? current.label : t('player.quality.auto');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-2 px-3 py-1.5 transition-all duration-300 border border-white/5 hover:border-white/20 active:scale-95 ${
          disabled 
            ? 'opacity-30 cursor-not-allowed' 
            : 'bg-white/5 hover:bg-white/10 text-cinema-gray hover:text-white'
        }`}
        title={t('player.controls.quality')}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{getCurrentQualityLabel()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute bottom-full right-0 mb-3 w-40 bg-cinema-surface/90 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-slide-up">
          <div className="py-2">
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cinema-gray/60">Select Quality</span>
            </div>
            
            {/* Auto Quality Option */}
            <button
              onClick={() => handleQualitySelect('auto')}
              className={`w-full text-left px-4 py-2.5 hover:bg-cinema-red transition-all duration-300 flex items-center justify-between group ${
                currentQuality === 'auto' ? 'bg-cinema-red text-white' : 'text-cinema-gray'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white">{t('player.quality.auto')}</span>
              {currentQuality === 'auto' && <Check className="w-3 h-3" />}
            </button>

            {/* Quality Options */}
            {qualityOptions.slice().reverse().map((quality) => (
              <button
                key={quality.label}
                onClick={() => handleQualitySelect(quality.label)}
                className={`w-full text-left px-4 py-2.5 hover:bg-cinema-red transition-all duration-300 flex items-center justify-between group ${
                  currentQuality === quality.label ? 'bg-cinema-red text-white' : 'text-cinema-gray'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white">{quality.label}</span>
                {currentQuality === quality.label && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualitySelector;
