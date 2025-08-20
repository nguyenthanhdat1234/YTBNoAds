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

  // Listen for video selection from search
  useEffect(() => {
    if (contextVideo && contextVideo !== currentVideo) {
      handleURLSubmit(contextVideo);
    }
  }, [contextVideo]);

  const handleURLSubmit = useCallback(async (url) => {
    if (!url.trim()) {
      toast.error(t('errors.emptyUrl'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse YouTube URL
      const parseResult = parseYouTubeURL(url);
      
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
    setActiveTab('url'); // Switch back to player view
    setError(null);
  };

  const tabs = [
    { id: 'url', label: 'Enter URL', icon: '🔗' },
    { id: 'search', label: 'Search Videos', icon: '🔍' },
    { id: 'trending', label: 'Trending', icon: '🔥' }
  ];

  return (
    <div className="max-w-8xl mx-auto space-y-6">
      {/* Tab Navigation */}
      <div className="card p-1">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'url' && (
        <>
          {/* URL Input */}
          <div className="card p-6">
            <URLInput onSubmit={handleURLSubmit} loading={loading} />
          </div>
        </>
      )}

      {activeTab === 'search' && (
        <VideoSearch onVideoSelect={handleVideoSelect} />
      )}

      {activeTab === 'trending' && (
        <TrendingVideos onVideoSelect={handleVideoSelect} />
      )}

      {/* Error Display - Only show for URL tab */}
      {activeTab === 'url' && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-700 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Loading State - Only show for URL tab */}
      {activeTab === 'url' && loading && (
        <div className="card p-8">
          <LoadingSpinner message={t('loading.video')} />
        </div>
      )}

      {/* Video Player and Info */}
      {currentVideo && !loading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="xl:col-span-2 space-y-4">
            <VideoPlayer video={currentVideo} />
            <EnhancedVideoInfo
              video={currentVideo}
              onAddToPlaylist={handleAddToPlaylist}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PlaylistManager
              currentVideo={currentVideo}
              onVideoSelect={handleVideoSelect}
              onVideoRemove={handleVideoRemove}
            />

            <VideoRecommendations
              currentVideo={currentVideo}
              onVideoSelect={handleVideoSelect}
            />
          </div>
        </div>
      )}

      {/* Welcome Message & Suggested Videos - Only show for URL tab when no video */}
      {activeTab === 'url' && !currentVideo && !loading && !error && (
        <>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Welcome to YouTube No Ads!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-3">
                  Your app is ready to use with full YouTube API access. You can now:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-600 dark:text-green-400">
                  <div>✅ Search unlimited YouTube videos</div>
                  <div>✅ Browse trending content</div>
                  <div>✅ Get smart recommendations</div>
                  <div>✅ Manage subscriptions & favorites</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('search')}
                    className="btn-primary text-sm"
                  >
                    🔍 Start Searching
                  </button>
                  <button
                    onClick={() => setActiveTab('trending')}
                    className="btn-secondary text-sm"
                  >
                    🔥 Browse Trending
                  </button>
                </div>
              </div>
            </div>
          </div>
          <SuggestedVideos />
        </>
      )}
    </div>
  );
};

export default MainPlayer;
