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
    <div className="bg-cinema-surface/40 backdrop-blur-2xl rounded-sm border border-white/10 p-6 space-y-8 animate-fade-in relative overflow-hidden">
      {/* Editorial Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-full">
            <List className="w-4 h-4 text-cinema-red" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {t('playlist.title')}
            </h3>
            <p className="text-[10px] font-bold text-cinema-gray uppercase tracking-widest">
              {playlist.length} {t('playlist.videos')} // Production Log
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/5 rounded-full transition-all text-cinema-gray hover:text-white"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-8 animate-slide-up">
          {/* Master Controls */}
          <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-full border border-white/5">
            <div className="flex items-center space-x-1">
              <button
                onClick={playPrevious}
                disabled={!getPreviousVideo()}
                className="p-2.5 text-cinema-gray hover:text-white hover:bg-white/5 rounded-full transition-all disabled:opacity-20"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={playNext}
                disabled={!getNextVideo()}
                className="p-2.5 text-cinema-gray hover:text-white hover:bg-white/5 rounded-full transition-all disabled:opacity-20"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-1 pr-1">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2.5 text-cinema-gray hover:text-white hover:bg-white/5 rounded-full transition-all"
                title="Search Library"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShuffle(!shuffle)}
                className={`p-2.5 rounded-full transition-all ${
                  shuffle
                    ? 'bg-cinema-red text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                    : 'text-cinema-gray hover:text-white hover:bg-white/5'
                }`}
                title={t('playlist.shuffle')}
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setRepeat(!repeat)}
                className={`p-2.5 rounded-full transition-all ${
                  repeat
                    ? 'bg-cinema-red text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                    : 'text-cinema-gray hover:text-white hover:bg-white/5'
                }`}
                title={t('playlist.repeat')}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearPlaylist}
                className="p-2.5 text-cinema-gray hover:text-cinema-red hover:bg-cinema-red/5 rounded-full transition-all"
                title={t('playlist.clear')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rapid Add Trigger */}
          {currentVideo && !playlist.find(v => v.id === currentVideo.id) && (
            <button
              onClick={() => addToPlaylist(currentVideo)}
              className="w-full group flex items-center justify-center space-x-3 py-4 border border-dashed border-white/10 rounded-sm hover:border-cinema-red transition-all hover:bg-cinema-red/5"
            >
              <Plus className="w-4 h-4 text-cinema-gray group-hover:text-cinema-red transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray group-hover:text-white transition-colors">
                {t('playlist.addCurrent')}
              </span>
            </button>
          )}

          {/* Sequential Assets Stack */}
          {playlist.length > 0 ? (
            <div className="space-y-3 max-h-[480px] pr-2 overflow-y-auto custom-scrollbar">
              {playlist.map((video, index) => (
                <div
                  key={video.id}
                  className={`group relative flex items-center space-x-4 p-3 rounded-sm transition-all duration-300 border ${
                    currentIndex === index
                      ? 'bg-cinema-red/10 border-cinema-red/30'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  {/* Cinematic Index Indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] transition-all bg-cinema-red opacity-0 group-hover:opacity-40" />
                  {currentIndex === index && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cinema-red shadow-[0_0_10px_rgba(229,9,20,1)]" />}

                  {/* High-Contrast Thumbnail Overlay */}
                  <div className="relative flex-shrink-0 w-24 aspect-video rounded-sm overflow-hidden border border-white/10">
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/default.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {currentIndex === index && (
                      <div className="absolute inset-0 bg-cinema-red/20 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                      </div>
                    )}
                  </div>

                  {/* Asset Descriptive Suite */}
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => onVideoSelect && onVideoSelect(video)}
                  >
                    <h4 className={`text-[11px] font-bold tracking-tight truncate mb-1 transition-colors ${
                      currentIndex === index ? 'text-white' : 'text-cinema-gray group-hover:text-white'
                    }`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-widest text-cinema-gray/60 group-hover:text-cinema-gray transition-colors">
                      <span className="truncate max-w-[100px]">{video.author?.name || 'Unknown Source'}</span>
                      {video.duration && (
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1 h-1 bg-white/10 rounded-full" />
                          <span className="tabular-nums">{formatDuration(video.duration)} // TC</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sequence Re-Ordering Cluster */}
                  <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveVideo(index, Math.max(0, index - 1)); }}
                      disabled={index === 0}
                      className="p-1 hover:text-cinema-red disabled:opacity-0"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromPlaylist(video.id); }}
                      className="p-1 hover:text-cinema-red"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); moveVideo(index, Math.min(playlist.length - 1, index + 1)); }}
                      disabled={index === playlist.length - 1}
                      className="p-1 hover:text-cinema-red disabled:opacity-0"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-6 border border-dashed border-white/5 rounded-sm">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-cinema-red blur-2xl opacity-10" />
                <List className="w-10 h-10 text-cinema-gray/20 relative" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-gray/40">
                {t('playlist.empty')}
              </p>
            </div>
          )}

          {/* Production Totals */}
          {playlist.length > 0 && (
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray">
                <span className="flex items-center space-x-2">
                   <div className="w-1 h-1 bg-cinema-red rounded-full" />
                   <span>Total Load: {playlist.length} Assets</span>
                </span>
                <span className="tabular-nums text-white/40">{formatDuration(getTotalDuration())} Remaining</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Asset Search Overlay */}
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
