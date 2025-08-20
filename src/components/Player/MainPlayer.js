import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

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
  const { currentVideo: contextVideo, selectVideo } = useVideo();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('url'); // url, search, trending
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleURLSubmit = useCallback(async (url) => {
    // Ensure url is a string and handle video objects
    let videoUrl = '';

    if (typeof url === 'string') {
      videoUrl = url.trim();
    } else if (url && typeof url === 'object' && url.url) {
      // Handle video object from context
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
      // If we received a video object, use it directly
      if (typeof url === 'object' && url.url) {
        setCurrentVideo(url);
        toast.success(t('success.videoLoaded'));
        return;
      }

      // Parse YouTube URL string
      const parseResult = parseYouTubeURL(videoUrl);

      if (!parseResult.isValid) {
        throw new Error(t('errors.invalidUrl'));
      }

      // Handle different types of URLs
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

      toast.success(t('success.videoLoaded'));
    } catch (err) {
      console.error('Error loading video:', err);
      setError(err.message);
      toast.error(err.message || t('errors.loadingFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Listen for video selection from context
  useEffect(() => {
    if (contextVideo && contextVideo !== currentVideo) {
      // If contextVideo is a video object, set it directly
      if (typeof contextVideo === 'object' && contextVideo.url) {
        setCurrentVideo(contextVideo);
        setActiveTab('url'); // Switch to player view
        setError(null);
      } else if (typeof contextVideo === 'string') {
        // If it's a URL string, process it
        handleURLSubmit(contextVideo);
      }
    }
  }, [contextVideo, currentVideo, handleURLSubmit]);

  const handleSingleVideo = async (videoId) => {
    // For now, we'll create a simple video object
    // In a real implementation, you'd fetch video details from YouTube API
    const videoData = {
      id: videoId,
      title: 'Loading video...',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: null,
      author: {
        name: 'Loading...',
        channelId: null
      }
    };

    // Extract metadata from title (this would be enhanced with actual API data)
    const metadata = extractVideoMetadata(videoData.title);
    videoData.metadata = metadata;

    setCurrentVideo(videoData);
    setPlaylist(null);
  };

  const handlePlaylist = async (playlistId) => {
    // Placeholder for playlist handling
    toast.info(t('info.playlistSupport'));
  };

  const handleChannel = async (channelId) => {
    // Placeholder for channel handling
    toast.info(t('info.channelSupport'));
  };

  const handleAddToPlaylist = (video) => {
    // This will be handled by the PlaylistManager component
    console.log('Adding to playlist:', video);
  };

  const handleVideoRemove = (videoId) => {
    if (currentVideo && currentVideo.id === videoId) {
      setCurrentVideo(null);
    }
  };

  // Handle video selection from search or trending
  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    selectVideo(video); // Update context as well
    setActiveTab('url'); // Switch back to player view
    setError(null);
    setIsMinimized(false); // Expand if minimized
  };

  // Mini player controls
  const handleMinimize = () => {
    setIsMinimized(true);
    setShowMiniPlayer(true);
  };

  const handleExpandFromMini = () => {
    setIsMinimized(false);
    setShowMiniPlayer(false);
  };

  const handleCloseMini = () => {
    setShowMiniPlayer(false);
    setIsMinimized(false);
  };

  const tabs = [
    { id: 'url', label: 'Player', icon: '▶️' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'trending', label: 'Trending', icon: '🔥' }
  ];

  return (
    <>
      <div className={`max-w-8xl mx-auto transition-all duration-300 ${isMinimized ? 'space-y-4' : 'space-y-6'}`}>
        {/* Simplified Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'url' && !isMinimized && (
          <>
            {/* Simplified URL Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <URLInput onSubmit={handleURLSubmit} loading={loading} />
            </div>
          </>
        )}

        {activeTab === 'search' && !isMinimized && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <VideoSearch onVideoSelect={handleVideoSelect} />
          </div>
        )}

        {activeTab === 'trending' && !isMinimized && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <TrendingVideos onVideoSelect={handleVideoSelect} />
          </div>
        )}

        {/* Error Display - Only show for URL tab */}
        {activeTab === 'url' && error && !isMinimized && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading State - Only show for URL tab */}
        {activeTab === 'url' && loading && !isMinimized && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <LoadingSpinner message={t('loading.video')} />
          </div>
        )}

        {/* Video Player and Info */}
        {currentVideo && !loading && !isMinimized && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Player */}
            <div className="xl:col-span-2 space-y-4">
              {/* Video Player with Minimize Button */}
              <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Minimize Button */}
                <button
                  onClick={handleMinimize}
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors duration-200"
                  title="Minimize to mini player"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                <VideoPlayer video={currentVideo} />
              </div>

              {/* Video Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <EnhancedVideoInfo
                  video={currentVideo}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <PlaylistManager
                  currentVideo={currentVideo}
                  onVideoSelect={handleVideoSelect}
                  onVideoRemove={handleVideoRemove}
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <VideoRecommendations
                  currentVideo={currentVideo}
                  onVideoSelect={handleVideoSelect}
                />
              </div>
            </div>
          </div>
      )}

        {/* Welcome Message & Suggested Videos - Only show for URL tab when no video */}
        {activeTab === 'url' && !currentVideo && !loading && !error && !isMinimized && (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Welcome to YouTube No Ads!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Experience YouTube without interruptions. Search, watch, and enjoy unlimited content.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <span>✅</span>
                      <span>No Ads</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <span>🔍</span>
                      <span>Smart Search</span>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                      <span>📱</span>
                      <span>Mini Player</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                      <span>🔥</span>
                      <span>Trending</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('search')}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      🔍 Start Searching
                    </button>
                    <button
                      onClick={() => setActiveTab('trending')}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      🔥 Browse Trending
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <SuggestedVideos />
            </div>
          </>
        )}

        {/* Minimized State Message */}
        {isMinimized && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Video is playing in mini player
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your video continues playing in the floating mini player. You can drag it around or expand it back.
            </p>
            <button
              onClick={handleExpandFromMini}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              ↗️ Expand Player
            </button>
          </div>
        )}
      </div>

      {/* Mini Player */}
      <MiniPlayer
        video={currentVideo}
        isVisible={showMiniPlayer}
        onClose={handleCloseMini}
        onExpand={handleExpandFromMini}
      />
    </>
  );
};

export default MainPlayer;
