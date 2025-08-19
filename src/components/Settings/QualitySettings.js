import React from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, Zap, Eye } from 'lucide-react';
import { getQualityOptions } from '../../utils/youtubeHelpers';

const QualitySettings = ({ settings, updateSetting }) => {
  const { t } = useTranslation();
  const qualityOptions = getQualityOptions();

  const QualityCard = ({ quality, isSelected, onClick }) => {
    const getQualityInfo = (label) => {
      switch (label) {
        case '144p': return { color: 'text-gray-500', desc: 'Low quality, data saving' };
        case '240p': return { color: 'text-gray-500', desc: 'Low quality' };
        case '360p': return { color: 'text-blue-500', desc: 'Standard quality' };
        case '480p': return { color: 'text-blue-600', desc: 'Good quality' };
        case '720p': return { color: 'text-green-500', desc: 'HD quality' };
        case '1080p': return { color: 'text-green-600', desc: 'Full HD quality' };
        case '1440p': return { color: 'text-purple-500', desc: '2K quality' };
        case '2160p': return { color: 'text-red-500', desc: '4K Ultra HD' };
        default: return { color: 'text-gray-500', desc: 'Standard quality' };
      }
    };

    const info = getQualityInfo(quality.label);

    return (
      <button
        onClick={onClick}
        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left w-full ${
          isSelected
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-lg font-bold ${info.color}`}>
            {quality.label}
          </span>
          {isSelected && (
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {info.desc}
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {quality.height}p resolution
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <Monitor className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('settings.video.quality')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose your preferred video quality for playback
          </p>
        </div>
      </div>

      {/* Auto Quality Option */}
      <QualityCard
        quality={{ label: 'Auto', height: 'adaptive' }}
        isSelected={settings.quality === 'auto'}
        onClick={() => updateSetting('quality', 'auto')}
      />

      {/* Quality Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {qualityOptions.slice().reverse().map((quality) => (
          <QualityCard
            key={quality.label}
            quality={quality}
            isSelected={settings.quality === quality.label}
            onClick={() => updateSetting('quality', quality.label)}
          />
        ))}
      </div>

      {/* Additional Settings */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-gray-500" />
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.video.preferHighestFPS')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Prefer highest frame rate when available
              </p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('preferHighestFPS', !settings.preferHighestFPS)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              settings.preferHighestFPS ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                settings.preferHighestFPS ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-gray-500" />
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Prefer Quality over Speed
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Prioritize video quality over loading speed
              </p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('preferQuality', !settings.preferQuality)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              settings.preferQuality ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                settings.preferQuality ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Quality Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Quality Information
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Higher quality videos require more bandwidth and may take longer to load. 
              Auto quality automatically adjusts based on your connection speed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualitySettings;
