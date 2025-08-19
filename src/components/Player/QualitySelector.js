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
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-white/20 text-white'
        }`}
        title={t('player.controls.quality')}
      >
        <Monitor className="w-4 h-4" />
        <span className="text-sm font-medium">{getCurrentQualityLabel()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute bottom-full right-0 mb-2 w-32 bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 overflow-hidden">
          <div className="py-1">
            {/* Auto Quality Option */}
            <button
              onClick={() => handleQualitySelect('auto')}
              className={`w-full text-left px-3 py-2 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between ${
                currentQuality === 'auto' ? 'bg-primary-600 text-white' : 'text-gray-200'
              }`}
            >
              <span className="text-sm">{t('player.quality.auto')}</span>
              {currentQuality === 'auto' && <Check className="w-4 h-4" />}
            </button>

            {/* Quality Options */}
            {qualityOptions.slice().reverse().map((quality) => (
              <button
                key={quality.label}
                onClick={() => handleQualitySelect(quality.label)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between ${
                  currentQuality === quality.label ? 'bg-primary-600 text-white' : 'text-gray-200'
                }`}
              >
                <span className="text-sm">{quality.label}</span>
                {currentQuality === quality.label && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualitySelector;
