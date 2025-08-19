import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import URLInput from './URLInput';
import VideoPlayer from './VideoPlayer';
import EnhancedVideoInfo from './EnhancedVideoInfo';
import PlaylistManager from '../Playlist/PlaylistManager';
import LoadingSpinner from '../UI/LoadingSpinner';
import SuggestedVideos from '../Home/SuggestedVideos';

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

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
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

  return (
    <div className="max-w-8xl mx-auto space-y-6">
      {/* URL Input */}
      <div className="card p-6">
        <URLInput onSubmit={handleURLSubmit} loading={loading} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-700 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
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
          </div>
        </div>
      )}

      {/* Suggested Videos */}
      {!currentVideo && !loading && !error && (
        <SuggestedVideos />
      )}
    </div>
  );
};

export default MainPlayer;
