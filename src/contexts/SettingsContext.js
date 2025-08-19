import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const defaultSettings = {
  // Video Settings
  quality: '720p',
  autoplay: false,
  preferHighestFPS: false,
  
  // Audio Settings
  audioOnly: false,
  bitrate: '192',
  
  // Download Settings (for future use)
  saveFormat: 'mp4',
  videoSaveFormat: 'mp4',
  
  // Captions
  downloadCaptions: false,
  captionsLanguage: 'en',
  
  // UI Settings
  openDestinationFolderWhenDone: false,
  tagAudioFile: true,
  
  // Filter Settings
  filterVideosByLength: false,
  filterMode: false, // true = longer than, false = shorter than
  filterByLengthValue: 4.0,
  
  // Filename Pattern
  filenamePattern: '$title',
  skipExisting: false,
  
  // Language
  language: 'en'
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('ytPlayerSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('ytPlayerSettings', JSON.stringify(newSettings));
  };

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('ytPlayerSettings', JSON.stringify(updatedSettings));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('ytPlayerSettings', JSON.stringify(defaultSettings));
  };

  const value = {
    settings,
    updateSetting,
    updateSettings,
    resetSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
