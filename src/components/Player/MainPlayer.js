import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Search, TrendingUp, Clapperboard } from 'lucide-react';

import URLInput from './URLInput';
import VideoPlayer from './VideoPlayer';
import EnhancedVideoInfo from './EnhancedVideoInfo';
import PlaylistManager from '../Playlist/PlaylistManager';
import LoadingSpinner from '../UI/LoadingSpinner';
import SuggestedVideos from '../Home/SuggestedVideos';
import VideoSearch from '../Search/VideoSearch';
import TrendingVideos from '../Trending/TrendingVideos';
import VideoRecommendations from '../Recommendations/VideoRecommendations';
import MiniPlayer from './MiniPlayer';

import { useVideo } from '../../contexts/VideoContext';
import { parseYouTubeURL } from '../../utils/youtubeHelpers';
import { extractVideoMetadata } from '../../utils/metadataExtractor';

const MainPlayer = () => {
  const { t } = useTranslation();
  const { 
    currentVideo, 
    selectVideo, 
    isMinimized, 
    setIsMinimized,
    activeTab,
    setActiveTab,
    setPlaying
  } = useVideo();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleURLSubmit = useCallback(async (url) => {
    let videoUrl = '';
    if (typeof url === 'string') {
      videoUrl = url.trim();
    } else if (url && typeof url === 'object' && url.url) {
      videoUrl = url.url.trim();
    } else {
      toast.error(t('errors.emptyUrl'));
      return;
    }

    if (!videoUrl) {
      toast.error(t('errors.emptyUrl'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (typeof url === 'object' && url.url) {
        selectVideo(url);
        return;
      }

      const parseResult = parseYouTubeURL(videoUrl);
      if (!parseResult.isValid) {
        throw new Error(t('errors.invalidUrl'));
      }

      switch (parseResult.type) {
        case 'video':
          await handleSingleVideo(parseResult.id);
          break;
        case 'playlist':
          await handlePlaylist(parseResult.id);
          break;
        case 'channel':
          await handleChannel(parseResult.id);
          break;
        default:
          throw new Error(t('errors.unsupportedUrlType'));
      }
    } catch (err) {
      console.error('Error loading video:', err);
      setError(err.message);
      toast.error(err.message || t('errors.loadingFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // We use currentVideo directly from context now. 
  // But handleURLSubmit still needs to be able to set it.

  const handleSingleVideo = async (videoId) => {
    const videoData = {
      id: videoId,
      title: 'Loading video...',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: null,
      author: { name: 'Loading...', channelId: null }
    };
    const metadata = extractVideoMetadata(videoData.title);
    videoData.metadata = metadata;
    selectVideo(videoData);
    setPlaylist(null);
  };

  const handlePlaylist = async (playlistId) => {
    toast.info(t('info.playlistSupport'));
  };

  const handleChannel = async (channelId) => {
    toast.info(t('info.channelSupport'));
  };

  const handleAddToPlaylist = (video) => {
    console.log('Adding to playlist:', video);
  };

  const handleVideoRemove = (videoId) => {
    if (currentVideo && currentVideo.id === videoId) {
      selectVideo(null);
    }
  };

  const handleVideoSelect = (video) => {
    selectVideo(video);
    setActiveTab('search');
    setError(null);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleExpandFromMini = () => {
    setIsMinimized(false);
  };

  const handleCloseMini = () => {
    setIsMinimized(false);
    selectVideo(null);
  };


  const tabs = [
    { id: 'search', label: 'Director', shortLabel: 'Director', icon: Clapperboard },
    { id: 'trending', label: 'Trends', shortLabel: 'Trends', icon: TrendingUp },
  ];

  return (
    <>
      {/* Main wrapper — adds bottom padding on mobile for bottom nav bar */}
      <div className="max-w-[1700px] mx-auto px-4 md:px-6 py-4 md:py-8 pb-20 xl:pb-8 transition-all duration-500">

        {/* Cinematic Tab Nav */}
        <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-white/5 overflow-x-auto no-scrollbar">
          <div className="flex space-x-1 md:space-x-8 flex-shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative py-2 px-3 md:px-0 transition-all duration-300 flex-shrink-0 ${
                  activeTab === tab.id ? 'text-white' : 'text-cinema-gray hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${activeTab === tab.id ? 'text-cinema-red' : ''}`} />
                  <span className="hidden sm:block text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap">{tab.label}</span>
                  <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest">{tab.shortLabel}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-cinema-red shadow-[0_0_15px_rgba(229,9,20,0.4)]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-shrink-0 pl-4">
            <span className="text-[9px] font-black tracking-widest text-cinema-gray/30 uppercase hidden md:block">
              Production Ready
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 md:space-y-8 animate-fade-in">

          {/* Search/Director Tab - Now at the Top when active */}
          {activeTab === 'search' && !isMinimized && (
            <div className="animate-fade-in">
              <div className="bg-cinema-surface rounded-sm overflow-hidden border border-white/5 shadow-2xl">
                <VideoSearch onVideoSelect={handleVideoSelect} />
              </div>
            </div>
          )}

          {/* Player Grid */}
          {currentVideo && !loading && !isMinimized && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start mb-12">
              {/* Main Content */}
              <div className="xl:col-span-8 space-y-6 md:space-y-8">
                {/* Video Wrapper */}
                <div className="relative group rounded-sm overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/5">
                  <button
                    onClick={handleMinimize}
                    className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-xl border border-white/10 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    title="Minimize"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  <VideoPlayer video={currentVideo} />
                </div>

                {/* Video Info */}
                <div className="bg-cinema-surface p-5 md:p-8 rounded-sm border border-white/5">
                  <EnhancedVideoInfo
                    video={currentVideo}
                    onAddToPlaylist={handleAddToPlaylist}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-4 space-y-6 md:space-y-8">
                {/* Mobile toggle for sidebar */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="xl:hidden w-full flex items-center justify-between p-4 bg-cinema-surface border border-white/5 rounded-sm"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray">Queue & Recommendations</span>
                  <svg className={`w-4 h-4 text-cinema-gray transition-transform ${showSidebar ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className={`space-y-6 md:space-y-8 ${showSidebar ? 'block' : 'hidden xl:block'}`}>
                  <div className="bg-cinema-surface rounded-sm border border-white/5 overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray">Production Queue</h3>
                    </div>
                    <PlaylistManager
                      currentVideo={currentVideo}
                      onVideoSelect={handleVideoSelect}
                      onVideoRemove={handleVideoRemove}
                    />
                  </div>

                  <div className="bg-cinema-surface rounded-sm border border-white/5 overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray">Curated For You</h3>
                    </div>
                    <VideoRecommendations
                      currentVideo={currentVideo}
                      onVideoSelect={handleVideoSelect}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Spotlight Section (Suggested Videos) */}
          {activeTab === 'search' && !isMinimized && !currentVideo && !loading && !error && (
            <div className="pt-8 md:pt-12 border-t border-white/5">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-gray">Cinema Spotlight</h3>
              </div>
              <div className="bg-cinema-surface rounded-sm border border-white/5 p-2">
                <SuggestedVideos />
              </div>
            </div>
          )}

          {/* Trending Tab Content */}
          {activeTab === 'trending' && !isMinimized && (
            <div className="bg-cinema-surface rounded-sm overflow-hidden border border-white/5 shadow-2xl">
              <TrendingVideos onVideoSelect={handleVideoSelect} />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-xl mx-auto p-4 bg-cinema-red/10 border border-cinema-red/20 rounded-sm flex items-center space-x-3">
              <div className="w-1.5 h-1.5 bg-cinema-red rounded-full animate-pulse flex-shrink-0" />
              <p className="text-xs font-bold text-cinema-red uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-2 border-cinema-red border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-gray animate-pulse">
                Initializing Cinema Engine
              </span>
            </div>
          )}

        </div>

        {/* Minimized State */}
        {isMinimized && (
          <div className="max-w-2xl mx-auto py-16 md:py-20 text-center space-y-6 md:space-y-8 animate-in slide-in-from-bottom-5 duration-700">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-cinema-red blur-3xl opacity-10" />
              <div className="relative p-5 bg-cinema-surface border border-white/5 rounded-full inline-flex items-center justify-center">
                <span className="text-2xl md:text-3xl">📱</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-display font-black uppercase text-white tracking-widest">Cinema in Motion</h3>
              <p className="text-cinema-gray text-sm max-w-sm mx-auto font-medium leading-relaxed">
                Your production continues in the floating mini-player.
              </p>
            </div>
            <button
              onClick={handleExpandFromMini}
              className="btn-cinema py-3 px-8 text-[10px] font-black tracking-[0.3em] uppercase hover:scale-105 transition-transform"
            >
              Recall to Main Screen
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MainPlayer;
