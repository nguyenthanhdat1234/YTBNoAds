import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Components
import Header from './components/Header/Header';
import MainPlayer from './components/Player/MainPlayer';
import Settings from './components/Settings/Settings';
import About from './components/About/About';

// Context
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { VideoProvider, useVideo } from './contexts/VideoContext';

// Inner App component that uses VideoContext
const AppContent = () => {
  const { selectVideo } = useVideo();

  const handleVideoSelect = (url) => {
    selectVideo(url);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header onVideoSelect={handleVideoSelect} />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<MainPlayer />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Set initial language from localStorage or browser
    const savedLanguage = localStorage.getItem('language') ||
                          navigator.language.split('-')[0] || 'en';
    setCurrentLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  return (
    <ThemeProvider>
      <SettingsProvider>
        <VideoProvider>
          <AppContent />

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
        </VideoProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
