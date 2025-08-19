import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  List,
  Plus,
  Play,
  Pause,
  Trash2,
  Shuffle,
  Repeat,
  SkipForward,
  SkipBack,
  Clock,
  X,
  ChevronUp,
  ChevronDown,
  Search
} from 'lucide-react';

import YouTubeSearch from '../Search/YouTubeSearch';
import { parseYouTubeURL } from '../../utils/youtubeHelpers';
import { extractVideoMetadata } from '../../utils/metadataExtractor';
import toast from 'react-hot-toast';

const PlaylistManager = ({ currentVideo, onVideoSelect, onVideoRemove }) => {
  const { t } = useTranslation();
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [autoplay, setAutoplay] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  // Load playlist from localStorage on mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('ytPlayerPlaylist');
    if (savedPlaylist) {
      try {
        const parsed = JSON.parse(savedPlaylist);
        setPlaylist(parsed);
      } catch (error) {
        console.error('Error loading playlist:', error);
      }
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ytPlayerPlaylist', JSON.stringify(playlist));
  }, [playlist]);

  // Update current index when current video changes
  useEffect(() => {
    if (currentVideo) {
      const index = playlist.findIndex(video => video.id === currentVideo.id);
      setCurrentIndex(index);
    }
  }, [currentVideo, playlist]);

  const addToPlaylist = (video) => {
    if (!video) return;

    const exists = playlist.find(v => v.id === video.id);
    if (!exists) {
      setPlaylist(prev => [...prev, video]);
      toast.success('Video added to playlist');
    } else {
      toast.info('Video already in playlist');
    }
  };

  const handleSearchVideoSelect = (url) => {
    // Parse the URL and add to playlist
    const parseResult = parseYouTubeURL(url);
    if (parseResult.isValid && parseResult.type === 'video') {
      const videoData = {
        id: parseResult.id,
        title: 'Loading...',
        url: url,
        thumbnail: `https://img.youtube.com/vi/${parseResult.id}/maxresdefault.jpg`,
        duration: null,
        author: {
          name: 'Loading...',
          channelId: null
        }
      };

      addToPlaylist(videoData);
      setShowSearch(false);
    }
  };

  const handleSearchAddToPlaylist = (video) => {
    const videoData = {
      id: video.id,
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration,
      author: {
        name: video.channel,
        channelId: null
      }
    };

    addToPlaylist(videoData);
  };

  const removeFromPlaylist = (videoId) => {
    setPlaylist(prev => prev.filter(video => video.id !== videoId));
    if (onVideoRemove) {
      onVideoRemove(videoId);
    }
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setCurrentIndex(-1);
  };

  const moveVideo = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    const newPlaylist = [...playlist];
    const [movedVideo] = newPlaylist.splice(fromIndex, 1);
    newPlaylist.splice(toIndex, 0, movedVideo);
    setPlaylist(newPlaylist);
  };

  const getNextVideo = () => {
    if (playlist.length === 0) return null;
    
    if (shuffle) {
      const availableIndices = playlist.map((_, index) => index).filter(i => i !== currentIndex);
      if (availableIndices.length === 0) return repeat ? playlist[0] : null;
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      return playlist[randomIndex];
    }
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      return playlist[nextIndex];
    } else if (repeat && playlist.length > 0) {
      return playlist[0];
    }
    
    return null;
  };

  const getPreviousVideo = () => {
    if (playlist.length === 0) return null;
    
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      return playlist[prevIndex];
    } else if (repeat && playlist.length > 0) {
      return playlist[playlist.length - 1];
    }
    
    return null;
  };

  const playNext = () => {
    const nextVideo = getNextVideo();
    if (nextVideo && onVideoSelect) {
      onVideoSelect(nextVideo);
    }
  };

  const playPrevious = () => {
    const prevVideo = getPreviousVideo();
    if (prevVideo && onVideoSelect) {
      onVideoSelect(prevVideo);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return playlist.reduce((total, video) => total + (video.duration || 0), 0);
  };

  // Auto-add current video to playlist
  useEffect(() => {
    if (currentVideo && autoplay) {
      addToPlaylist(currentVideo);
    }
  }, [currentVideo, autoplay]);

  return (
    <div className="card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <List className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('playlist.title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {playlist.length} {t('playlist.videos')}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors duration-200"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={playPrevious}
                disabled={!getPreviousVideo()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={playNext}
                disabled={!getNextVideo()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 rounded-lg transition-colors duration-200"
                title="Search YouTube Videos"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShuffle(!shuffle)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  shuffle
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={t('playlist.shuffle')}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setRepeat(!repeat)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  repeat
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={t('playlist.repeat')}
              >
                <Repeat className="w-4 h-4" />
              </button>

              <button
                onClick={clearPlaylist}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors duration-200"
                title={t('playlist.clear')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>



          {/* Add Current Video Button */}
          {currentVideo && !playlist.find(v => v.id === currentVideo.id) && (
            <button
              onClick={() => addToPlaylist(currentVideo)}
              className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">{t('playlist.addCurrent')}</span>
            </button>
          )}

          {/* Playlist Items */}
          {playlist.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
              {playlist.map((video, index) => (
                <div
                  key={video.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    currentIndex === index
                      ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/default.jpg`}
                      alt={video.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    {currentIndex === index && (
                      <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => onVideoSelect && onVideoSelect(video)}
                  >
                    <h4 className={`text-sm font-medium truncate ${
                      currentIndex === index
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {video.author?.name || 'Unknown'}
                      </span>
                      {video.duration && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDuration(video.duration)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveVideo(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => moveVideo(index, Math.min(playlist.length - 1, index + 1))}
                      disabled={index === playlist.length - 1}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => removeFromPlaylist(video.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('playlist.empty')}</p>
            </div>
          )}

          {/* Stats */}
          {playlist.length > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{playlist.length} {t('playlist.videos')}</span>
                <span>{formatDuration(getTotalDuration())}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* YouTube Search Modal */}
      <YouTubeSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onVideoSelect={handleSearchVideoSelect}
        onAddToPlaylist={handleSearchAddToPlaylist}
      />
    </div>
  );
};

export default PlaylistManager;
