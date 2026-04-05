import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  Video,
  Volume2,
  Palette,
  Sliders,
  RotateCcw,
  Monitor,
  Key,
  Search
} from 'lucide-react';

import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getQualityOptions } from '../../utils/youtubeHelpers';
import { isApiKeyConfigured, setApiKey } from '../../services/youtubeApi';
import QualitySettings from './QualitySettings';
import toast from 'react-hot-toast';

const Settings = () => {
  const { t } = useTranslation();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { theme, accent, toggleTheme, changeAccent } = useTheme();
  const [activeTab, setActiveTab] = useState('video');
  const [apiKey, setApiKeyState] = useState(localStorage.getItem('youtube_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const qualityOptions = getQualityOptions();
  const bitrateOptions = ['128', '192', '256', '320'];
  const accentOptions = ['blue', 'red', 'green', 'purple', 'orange'];

  const handleResetSettings = () => {
    if (window.confirm(t('settings.confirmReset'))) {
      resetSettings();
      toast.success(t('success.settingsReset'));
    }
  };

  const handleApiKeySave = () => {
    try {
      setApiKey(apiKey);
      toast.success('YouTube API key saved successfully!');
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  const handleApiKeyTest = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key first');
      return;
    }

    try {
      const originalKey = localStorage.getItem('youtube_api_key');
      setApiKey(apiKey);

      const { searchVideos } = await import('../../services/youtubeApi');
      await searchVideos('test', { maxResults: 1 });

      toast.success('API key is valid!');
    } catch (error) {
      toast.error(`API key test failed: ${error.message}`);
      const originalKey = localStorage.getItem('youtube_api_key');
      if (originalKey) {
        setApiKey(originalKey);
      } else {
        setApiKey('');
      }
    }
  };

  const SettingSection = ({ icon: Icon, title, children }) => (
    <div className="space-y-6 md:space-y-8 animate-slide-up">
      <div className="flex items-center space-x-4 border-b border-white/5 pb-5">
        <div className="p-2.5 bg-white/[0.02] border border-white/10 rounded-sm flex-shrink-0">
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-cinema-red" />
        </div>
        <h2 className="text-base md:text-xl font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-white">
          {title}
        </h2>
      </div>
      <div className="space-y-6 md:space-y-8 pl-0 md:pl-4">
        {children}
      </div>
    </div>
  );

  const SettingItem = ({ label, description, children }) => (
    <div className="flex flex-col gap-3 md:gap-4 group">
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-cinema-gray group-hover:text-white transition-colors">
          {label}
        </label>
        {description && (
          <p className="text-[10px] font-medium text-cinema-gray/40 uppercase tracking-widest leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-12 items-center rounded-sm transition-all duration-500 focus:outline-none ${
        checked ? 'bg-cinema-red shadow-[0_0_20px_rgba(229,9,20,0.3)]' : 'bg-white/10'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-sm bg-white transition-all duration-500 ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const tabs = [
    { id: 'video', label: t('settings.tabs.visual'), fullLabel: t('settings.tabs.visualFull'), icon: Monitor },
    { id: 'audio', label: t('settings.tabs.sonic'), fullLabel: t('settings.tabs.sonicFull'), icon: Volume2 },
    { id: 'api', label: t('settings.tabs.api'), fullLabel: t('settings.tabs.apiFull'), icon: Key },
    { id: 'interface', label: t('settings.tabs.theme'), fullLabel: t('settings.tabs.themeFull'), icon: Palette },
    { id: 'advanced', label: t('settings.tabs.system'), fullLabel: t('settings.tabs.systemFull'), icon: Sliders },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-16 px-4 md:px-8 py-6 md:py-8 pb-24 xl:pb-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4">
        <div className="inline-flex items-center space-x-3 px-4 py-1 bg-cinema-red/10 border border-cinema-red/20 rounded-full mb-3">
          <SettingsIcon className="w-3 h-3 text-cinema-red animate-spin-slow" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cinema-red">{t('settings.systemCore')}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white leading-none">
          {t('settings.productionConsole').split(' ')[0]} <span className="text-cinema-red">{t('settings.productionConsole').split(' ')[1]}</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-cinema-gray/40 max-w-lg mx-auto">
          {t('settings.syncParams')}
        </p>
      </div>

      {/* Tab Navigation — scrollable on mobile */}
      <div className="bg-white/[0.01] border border-white/5 p-1.5 md:p-2 rounded-sm backdrop-blur-3xl">
        <nav className="flex items-center overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 md:space-x-4 px-4 md:px-8 py-3 md:py-5 rounded-sm transition-all duration-500 flex-shrink-0 relative group ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-cinema-gray/40 hover:text-white'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-all duration-500 ${activeTab === tab.id ? 'text-cinema-red' : 'text-current'}`} />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">
                <span className="md:hidden">{tab.label}</span>
                <span className="hidden md:inline">{tab.fullLabel}</span>
              </span>
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-white/5 rounded-sm -z-10 animate-fade-in" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white/[0.01] border border-white/5 p-5 md:p-12 rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-cinema-red/5 blur-[120px] rounded-full -mr-16 -mt-16 md:-mr-32 md:-mt-32" />

        {activeTab === 'video' && (
          <QualitySettings settings={settings} updateSetting={updateSetting} />
        )}

        {activeTab === 'audio' && (
          <SettingSection icon={Volume2} title={t('settings.sonic.title')}>
            <SettingItem
              label={t('settings.sonic.pureAudio')}
              description={t('settings.sonic.pureAudioDesc')}
            >
              <Toggle
                checked={settings.audioOnly}
                onChange={(value) => updateSetting('audioOnly', value)}
              />
            </SettingItem>
            <SettingItem
              label={t('settings.sonic.bitrate')}
              description={t('settings.sonic.bitrateDesc')}
            >
              <select
                value={settings.bitrate}
                onChange={(e) => updateSetting('bitrate', e.target.value)}
                className="bg-black/60 border border-white/10 px-4 py-2.5 md:px-6 md:py-3 text-[10px] font-black uppercase tracking-widest text-white focus:ring-0 focus:border-cinema-red rounded-sm appearance-none w-full md:w-auto md:min-w-[160px]"
              >
                {bitrateOptions.map(b => (
                  <option key={b} value={b}>{b} {t('player.bitrate').toUpperCase()}</option>
                ))}
              </select>
            </SettingItem>
          </SettingSection>
        )}

        {activeTab === 'api' && (
          <SettingSection icon={Key} title={t('settings.api.title')}>
            <div className="space-y-8 md:space-y-12">
              <div className="relative group overflow-hidden bg-cinema-red/[0.02] border border-cinema-red/10 rounded-sm p-5 md:p-8">
                <div className="absolute top-0 left-0 w-1 h-full bg-cinema-red opacity-20" />
                <div className="flex items-start space-x-4 md:space-x-6">
                  <div className="p-2.5 bg-cinema-red/10 rounded-sm flex-shrink-0">
                    <Search className="w-5 h-5 text-cinema-red" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-2">
                       {t('settings.api.globalLink')}
                    </h4>
                    <p className="text-[10px] font-medium text-cinema-gray/60 uppercase tracking-widest leading-relaxed">
                      {t('settings.api.globalLinkDesc')}
                    </p>
                    <div className="mt-4 flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500">{t('settings.api.protocolReady')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <SettingItem
                label={t('settings.api.neuralOverride')}
                description={t('settings.api.neuralOverrideDesc')}
              >
                <div className="space-y-4 w-full">
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKeyState(e.target.value)}
                      placeholder={t('settings.api.enterKey')}
                      className="w-full pl-4 pr-12 py-3.5 bg-black/40 border border-white/5 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] text-white placeholder:text-cinema-gray/20 focus:ring-0 focus:border-white/20 transition-all font-mono"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cinema-gray/30 hover:text-white transition-colors"
                    >
                      {showApiKey ? '🙈' : '👁️'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleApiKeySave}
                      disabled={!apiKey.trim()}
                      className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-sm transition-all disabled:opacity-20"
                    >
                      {t('settings.api.syncKey')}
                    </button>
                    <button
                      onClick={handleApiKeyTest}
                      disabled={!apiKey.trim()}
                      className="px-4 py-3.5 bg-cinema-red text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-sm transition-all disabled:opacity-20 shadow-lg shadow-cinema-red/10"
                    >
                      {t('settings.api.verifyLink')}
                    </button>
                  </div>
                </div>
              </SettingItem>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  t('settings.api.features.scan'),
                  t('settings.api.features.calibrate'),
                  t('settings.api.features.retrieve'),
                  t('settings.api.features.archive'),
                  t('settings.api.features.analyze'),
                  t('settings.api.features.manage')
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3.5 bg-white/[0.01] border border-white/5 rounded-sm">
                    <div className="w-1.5 h-1.5 bg-cinema-red opacity-40 rounded-full flex-shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cinema-gray/60">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </SettingSection>
        )}

        {activeTab === 'interface' && (
          <SettingSection icon={Palette} title={t('settings.aesthetic.title')}>
            <SettingItem
              label={t('settings.aesthetic.visionCore')}
              description={t('settings.aesthetic.visionCoreDesc')}
            >
              <button
                onClick={toggleTheme}
                className="w-full md:w-auto px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all rounded-sm"
              >
                {theme} Mode
              </button>
            </SettingItem>

            <SettingItem
              label={t('settings.aesthetic.accent')}
              description={t('settings.aesthetic.accentDesc')}
            >
              <div className="flex items-center space-x-4 md:space-x-6 flex-wrap gap-y-2">
                {accentOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => changeAccent(color)}
                    className={`w-9 h-9 rounded-sm border transition-all duration-700 relative group overflow-hidden ${
                      accent === color
                        ? 'border-white border-opacity-100 scale-110 shadow-2xl'
                        : 'border-white border-opacity-5 hover:border-opacity-30'
                    } ${
                      color === 'blue' ? 'bg-blue-600' :
                      color === 'red' ? 'bg-cinema-red' :
                      color === 'green' ? 'bg-green-600' :
                      color === 'purple' ? 'bg-purple-600' :
                      'bg-orange-600'
                    }`}
                  >
                    {accent === color && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </SettingItem>
          </SettingSection>
        )}

        {activeTab === 'advanced' && (
          <SettingSection icon={Sliders} title={t('settings.logic.title')}>
            <SettingItem
              label={t('settings.logic.metadata')}
              description={t('settings.logic.metadataDesc')}
            >
              <Toggle
                checked={settings.tagAudioFile}
                onChange={(value) => updateSetting('tagAudioFile', value)}
              />
            </SettingItem>

            <SettingItem
              label={t('settings.logic.idProtocol')}
              description={t('settings.logic.idProtocolDesc')}
            >
              <input
                type="text"
                value={settings.filenamePattern}
                onChange={(e) => updateSetting('filenamePattern', e.target.value)}
                className="w-full md:w-auto bg-black/60 border border-white/5 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.4em] text-white focus:ring-0 focus:border-cinema-red rounded-sm md:min-w-[240px] font-mono"
                placeholder="$LOG_TITLE"
              />
            </SettingItem>

            <SettingItem
              label={t('common.wipe').toUpperCase()}
              description={t('settings.logic.wipeDesc')}
            >
              <button
                onClick={handleResetSettings}
                className="w-full md:w-auto flex items-center justify-center space-x-3 px-6 py-3.5 bg-cinema-red/10 border border-cinema-red/20 text-cinema-red hover:bg-cinema-red hover:text-white transition-all duration-500 rounded-sm"
              >
                <RotateCcw className="w-4 h-4 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('settings.logic.initWipe')}</span>
              </button>
            </SettingItem>
          </SettingSection>
        )}
      </div>
    </div>
  );
};

export default Settings;
