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
      return 'Auto';
    }
    const current = qualityOptions.find(q => q.label === settings.quality);
    return current ? current.label : 'Auto';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        title={t('player.controls.quality')}
      >
        <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {getCurrentQualityLabel()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="py-1">
            {/* Auto Quality Option */}
            <button
              onClick={() => handleQualitySelect('auto')}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                settings.quality === 'auto'
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Adaptive</span>
              </div>
            </button>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* Quality Options */}
            {qualityOptions.slice().reverse().map((quality) => (
              <button
                key={quality.label}
                onClick={() => handleQualitySelect(quality.label)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  settings.quality === quality.label
                    ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{quality.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {quality.height}p
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickQualitySelector;
