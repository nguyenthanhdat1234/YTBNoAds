import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Components
import Header from './components/Header/Header';
import MainPlayer from './components/Player/MainPlayer';
import Settings from './components/Settings/Settings';
import About from './components/About/About';
import MobileControlsTest from './components/Debug/MobileControlsTest';
import MobileResponsiveTest from './components/Debug/MobileResponsiveTest';
import WatchHistory from './components/History/WatchHistory';
import FavoritesList from './components/Favorites/FavoritesList';
import SubscriptionsManager from './components/Subscriptions/SubscriptionsManager';
import MiniPlayer from './components/Player/MiniPlayer';
import LoginPage from './components/Auth/LoginPage';


// Context
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { VideoProvider, useVideo } from './contexts/VideoContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen bg-cinema-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-cinema-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Inner App component that uses VideoContext
const AppContent = () => {
  const { selectVideo } = useVideo();
  const { isAuthenticated } = useAuth();

  const handleVideoSelect = (url) => {
    selectVideo(url);
  };

  return (
    <Router>
      <div className="min-h-screen bg-cinema-black text-gray-100 selection:bg-cinema-red selection:text-white transition-colors duration-300">
        {isAuthenticated && <Header onVideoSelect={handleVideoSelect} />}

        <main className={`${isAuthenticated ? 'pt-14 md:pt-16' : ''} min-h-screen`}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainPlayer />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/about" element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            } />
            <Route path="/test-mobile" element={
              <ProtectedRoute>
                <MobileControlsTest />
              </ProtectedRoute>
            } />
            <Route path="/test-responsive" element={
              <ProtectedRoute>
                <MobileResponsiveTest />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <WatchHistory onVideoSelect={handleVideoSelect} />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <FavoritesList onVideoSelect={handleVideoSelect} />
              </ProtectedRoute>
            } />
            <Route path="/subscriptions" element={
              <ProtectedRoute>
                <SubscriptionsManager onVideoSelect={handleVideoSelect} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        {/* Global MiniPlayer for persistent playback across routes */}
        {isAuthenticated && <MiniPlayer />}
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
        <AuthProvider>
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
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
