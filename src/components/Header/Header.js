import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Settings,
  Info,
  Moon,
  Sun,
  Youtube
} from 'lucide-react';

import { useTheme } from '../../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import QuickQualitySelector from './QuickQualitySelector';
import SearchBar from './SearchBar';

const Header = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Play, label: t('nav.player') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
    { path: '/about', icon: Info, label: t('nav.about') }
  ];

  const handleSearchVideoSelect = (url) => {
    if (onVideoSelect) {
      onVideoSelect(url);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="p-2 bg-youtube-red rounded-lg group-hover:scale-105 transition-transform duration-200">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gradient">
                Video YTB no Ads
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('header.subtitle')}
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <SearchBar onVideoSelect={handleSearchVideoSelect} />

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1 flex-shrink-0">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Quick Quality Selector */}
            <QuickQualitySelector />

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              title={t('header.toggleTheme')}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <nav className="flex items-center justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === path
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
