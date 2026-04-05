import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Settings,
  Info,
  Moon,
  Sun,
  Youtube,
  History,
  Heart,
  Users,
  Menu,
  X,
  Search,
  LogOut
} from 'lucide-react';

import { useTheme } from '../../contexts/ThemeContext';
import { useVideo } from '../../contexts/VideoContext';
import LanguageSelector from './LanguageSelector';
import QuickQualitySelector from './QuickQualitySelector';
import SearchBar from './SearchBar';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { setActiveTab } = useVideo();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { logout } = useAuth();
  const menuRef = useRef(null);

  const navItems = [
    { path: '/', icon: Play, label: t('common.home') },
    { path: '/history', icon: History, label: t('common.history') },
    { path: '/favorites', icon: Heart, label: t('common.library') },
    { path: '/subscriptions', icon: Users, label: t('common.trending') },
    { path: '/settings', icon: Settings, label: t('common.settings') },
    { path: '/about', icon: Info, label: t('common.more') },
  ];

  const handleSearchVideoSelect = (url) => {
    if (onVideoSelect) onVideoSelect(url);
    setMobileSearchOpen(false);
  };

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Main Header */}
      <header className="glass-header h-14 md:h-16 transition-all duration-500 z-50">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 h-full">
          <div className="flex items-center justify-between h-full gap-3">

            {/* Logo */}
            <Link 
              to="/" 
              onClick={() => setActiveTab('search')}
              className="flex items-center space-x-2.5 group flex-shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-cinema-red blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative p-0.5 bg-white/5 backdrop-blur-sm rounded-sm transform group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-white/5">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain shadow-2xl" />
                </div>
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className="text-sm md:text-base font-black tracking-tighter text-white uppercase font-display leading-none">
                  Cinema <span className="text-cinema-red">Flow</span>
                </span>
                <span className="hidden sm:block text-[9px] font-bold text-cinema-gray uppercase tracking-[0.2em]">
                  {t('settings.systemCore')}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center space-x-1 flex-shrink-0 px-4">
              {navItems.slice(0, 5).map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`relative flex items-center space-x-2 px-4 py-2 transition-all duration-300 group ${
                      isActive ? 'text-white' : 'text-cinema-gray hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 ${isActive ? 'text-cinema-red' : ''}`} />
                    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-cinema-red shadow-[0_0_10px_rgba(229,9,20,0.8)] animate-fade-in" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 justify-center max-w-2xl">
              <SearchBar onVideoSelect={handleSearchVideoSelect} />
            </div>

            {/* Action Suite - Desktop */}
            <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
              <div className="flex items-center space-x-2 border-r border-white/5 pr-3 mr-1">
                <QuickQualitySelector />
                <LanguageSelector />
              </div>
              <button
                onClick={toggleTheme}
                className="group relative p-2 overflow-hidden rounded-full hover:bg-white/5 transition-colors"
                title={t('header.toggleTheme')}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-cinema-gray group-hover:text-yellow-400 transition-colors" />
                ) : (
                  <Moon className="w-4 h-4 text-cinema-gray group-hover:text-blue-400 transition-colors" />
                )}
              </button>

              <button
                onClick={logout}
                className="p-2 text-cinema-gray hover:text-cinema-red transition-colors"
                title="Terminate Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center space-x-1 lg:hidden">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className={`p-2 rounded-sm transition-all ${
                  mobileSearchOpen ? 'bg-cinema-red text-white' : 'text-cinema-gray hover:text-white hover:bg-white/5'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                className="p-2 text-cinema-gray hover:text-white hover:bg-white/5 rounded-sm transition-all"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-sm transition-all ${
                  mobileMenuOpen ? 'bg-cinema-red text-white' : 'text-cinema-gray hover:text-white hover:bg-white/5'
                }`}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-white/5 bg-cinema-black/95 backdrop-blur-xl px-4 py-3 animate-slide-down">
            <SearchBar onVideoSelect={handleSearchVideoSelect} />
          </div>
        )}
      </header>

      {/* Mobile Slide-in Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-cinema-black/60 backdrop-blur-sm z-40 xl:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div
            ref={menuRef}
            className="fixed top-14 right-0 bottom-0 w-72 bg-cinema-black/98 backdrop-blur-3xl border-l border-white/10 z-50 xl:hidden flex flex-col overflow-y-auto"
          >
            {/* Nav Links */}
            <div className="p-4 space-y-1 flex-1">
              <div className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.4em] text-cinema-red border-b border-white/5 mb-3">
                Navigation
              </div>
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-4 px-4 py-4 rounded-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-cinema-red/10 border border-cinema-red/20 text-white'
                        : 'text-cinema-gray hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cinema-red' : ''}`} />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-cinema-red rounded-full" />}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Tools */}
            <div className="p-4 border-t border-white/5 space-y-3">
              <div className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.4em] text-cinema-red">
                Tools
              </div>
              <div className="flex items-center justify-between px-2">
                <QuickQualitySelector />
                <LanguageSelector />
              </div>
              
              <button
                onClick={logout}
                className="w-full flex items-center space-x-4 px-4 py-4 text-cinema-gray hover:text-cinema-red transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Terminate Session</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Mobile Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 xl:hidden bg-cinema-black/95 backdrop-blur-xl border-t border-white/5 safe-area-pb">
        <div className="grid grid-cols-5 h-14">
          {navItems.slice(0, 5).map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive ? 'text-cinema-red' : 'text-cinema-gray/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tight leading-none text-center px-1">
                  {label}
                </span>
                {isActive && <div className="absolute top-0 w-8 h-0.5 bg-cinema-red" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Header;
