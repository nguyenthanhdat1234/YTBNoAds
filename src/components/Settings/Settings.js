import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  Video,
  Volume2,
  Palette,
  Sliders,
  RotateCcw,
  Monitor
} from 'lucide-react';

import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getQualityOptions } from '../../utils/youtubeHelpers';
import QualitySettings from './QualitySettings';
import toast from 'react-hot-toast';

const Settings = () => {
  const { t } = useTranslation();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { theme, accent, toggleTheme, changeAccent } = useTheme();
  const [activeTab, setActiveTab] = useState('video');

  const qualityOptions = getQualityOptions();
  const bitrateOptions = ['128', '192', '256', '320'];
  const accentOptions = ['blue', 'red', 'green', 'purple', 'orange'];

  const handleResetSettings = () => {
    if (window.confirm(t('settings.confirmReset'))) {
      resetSettings();
      toast.success(t('success.settingsReset'));
    }
  };

  const SettingSection = ({ icon: Icon, title, children }) => (
    <div className="card p-6 space-y-4">
      <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const SettingItem = ({ label, description, children }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
        checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const Select = ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field w-32 text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const tabs = [
    { id: 'video', label: 'Video Quality', icon: Monitor },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'interface', label: 'Interface', icon: Palette },
    { id: 'advanced', label: 'Advanced', icon: Sliders }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your YouTube Web Player experience
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="card p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors duration-200 flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'video' && (
          <QualitySettings settings={settings} updateSetting={updateSetting} />
        )}

        {activeTab === 'audio' && (
          <SettingSection icon={Volume2} title={t('settings.audio.title')}>
            <SettingItem
              label={t('settings.audio.audioOnly')}
              description="Enable audio-only mode for music playback"
            >
              <Toggle
                checked={settings.audioOnly}
                onChange={(value) => updateSetting('audioOnly', value)}
              />
            </SettingItem>

            <SettingItem
              label={t('settings.audio.bitrate')}
              description="Audio quality bitrate (kbps)"
            >
              <Select
                value={settings.bitrate}
                onChange={(value) => updateSetting('bitrate', value)}
                options={bitrateOptions.map(b => ({ value: b, label: `${b} kbps` }))}
              />
            </SettingItem>
          </SettingSection>
        )}

        {activeTab === 'interface' && (
          <SettingSection icon={Palette} title={t('settings.interface.title')}>
            <SettingItem
              label={t('settings.interface.theme')}
              description="Choose your preferred theme"
            >
              <button
                onClick={toggleTheme}
                className="btn-secondary capitalize"
              >
                {theme}
              </button>
            </SettingItem>

            <SettingItem
              label={t('settings.interface.accent')}
              description="Choose accent color"
            >
              <div className="flex space-x-2">
                {accentOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => changeAccent(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      accent === color
                        ? 'border-gray-900 dark:border-white scale-110'
                        : 'border-gray-300 dark:border-gray-600'
                    } ${
                      color === 'blue' ? 'bg-blue-500' :
                      color === 'red' ? 'bg-red-500' :
                      color === 'green' ? 'bg-green-500' :
                      color === 'purple' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`}
                  />
                ))}
              </div>
            </SettingItem>
          </SettingSection>
        )}

        {activeTab === 'advanced' && (
          <SettingSection icon={Sliders} title={t('settings.advanced.title')}>
            <SettingItem
              label={t('settings.advanced.tagAudioFile')}
              description="Extract metadata from video titles"
            >
              <Toggle
                checked={settings.tagAudioFile}
                onChange={(value) => updateSetting('tagAudioFile', value)}
              />
            </SettingItem>

            <SettingItem
              label={t('settings.advanced.filenamePattern')}
              description="Pattern for generating filenames"
            >
              <input
                type="text"
                value={settings.filenamePattern}
                onChange={(e) => updateSetting('filenamePattern', e.target.value)}
                className="input-field w-48 text-sm"
                placeholder="$title"
              />
            </SettingItem>

            <SettingItem
              label={t('settings.advanced.resetSettings')}
              description="Reset all settings to default values"
            >
              <button
                onClick={handleResetSettings}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </SettingItem>
          </SettingSection>
        )}
      </div>

    </div>
  );
};

export default Settings;
