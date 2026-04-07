import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Play,
  Eye,
  Plus,
  X,
  Loader2,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { searchVideos, formatDuration, formatViewCount, isApiKeyConfigured } from '../../services/youtubeApi';

const YouTubeSearch = ({ onVideoSelect, onAddToPlaylist, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLiveOnly, setIsLiveOnly] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    if (!isApiKeyConfigured()) {
      toast.error('YouTube API key is required. Please set it in Settings.');
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchVideos(searchQuery, {
        maxResults: 20,
        eventType: isLiveOnly ? 'live' : null,
        type: 'video'
      });
      
      const formattedResults = response.items.map(item => {
        const isLive = item.snippet?.liveBroadcastContent === 'live';
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          views: formatViewCount(item.statistics?.viewCount),
          duration: isLive ? 'LIVE' : formatDuration(item.contentDetails?.duration),
          publishedAt: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          description: item.snippet.description,
          isLive
        };
      });
      
      setSearchResults(formattedResults);
      if (formattedResults.length === 0) toast.info('No videos found.');
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleVideoPlay = (video) => {
    setSelectedVideo(video);
    onVideoSelect(video.url);
    toast.success('Playing video');
    onClose();
  };

  const handleAddToPlaylist = (video) => {
    if (onAddToPlaylist) {
      onAddToPlaylist(video);
      toast.success('Added to playlist');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal */}
      <div className="bg-cinema-black/98 backdrop-blur-3xl border border-white/10 rounded-t-2xl sm:rounded-sm shadow-[0_-20px_60px_rgba(0,0,0,0.8)] sm:shadow-[0_30px_100px_rgba(0,0,0,0.9)] w-full sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-cinema-red/10 border border-cinema-red/20 rounded-sm">
              <Search className="w-4 h-4 text-cinema-red" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                Search Library
              </h2>
              <p className="text-[9px] font-bold text-cinema-gray/40 uppercase tracking-[0.3em]">
                Global Asset Discovery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-cinema-gray/40 hover:text-white hover:bg-white/5 rounded-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 py-4 md:px-6 border-b border-white/5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-gray/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search videos, live streams..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-sm text-sm text-white placeholder:text-cinema-gray/30 focus:outline-none focus:border-cinema-red/40 focus:bg-white/10 transition-all font-medium"
                disabled={isSearching}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsLiveOnly(!isLiveOnly)}
                className={`px-3 py-3 border transition-all flex items-center space-x-2 rounded-sm ${
                  isLiveOnly 
                    ? 'bg-cinema-red/20 border-cinema-red text-cinema-red' 
                    : 'bg-white/5 border-white/5 text-cinema-gray/40'
                }`}
                title="Search Live Streams Only"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isLiveOnly ? 'bg-cinema-red animate-pulse' : 'bg-cinema-gray/20'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Live Only</span>
              </button>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-cinema-red hover:bg-red-700 text-white rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {isSearching ? 'Scanning...' : 'Search'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {searchResults.length > 0 && !isSearching && (
            <div className="p-4 md:p-5 space-y-3">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray/40 px-1 mb-4">
                {searchResults.length} Results Found
              </div>
              {searchResults.map((video) => (
                <div
                  key={video.id}
                  className={`group flex space-x-4 p-3 rounded-sm transition-all duration-300 border ${
                    selectedVideo?.id === video.id
                      ? 'bg-cinema-red/10 border-cinema-red/20'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-28 md:w-36 aspect-video rounded-sm overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = `https://img.youtube.com/vi/${video.id}/default.jpg`; }}
                    />
                    <div className={`absolute bottom-1 right-1 ${video.isLive ? 'bg-cinema-red' : 'bg-black/80'} text-white text-[8px] font-black px-1 py-0.5 rounded-sm tracking-widest uppercase`}>
                      {video.duration}
                    </div>
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
                    <h3 className="text-xs font-bold text-cinema-gray group-hover:text-white transition-colors line-clamp-2 leading-snug tracking-tight">
                      {video.title}
                    </h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cinema-gray/40">
                      {video.channel}
                    </p>
                    <div className="flex items-center space-x-3 text-[9px] font-bold text-cinema-gray/30">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-2.5 h-2.5" />
                        <span>{video.views} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 flex-shrink-0 justify-center">
                    <button
                      onClick={() => handleVideoPlay(video)}
                      className="flex items-center space-x-2 px-3 py-2 bg-cinema-red hover:bg-red-700 text-white rounded-sm transition-all text-[9px] font-black uppercase tracking-widest"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">Play</span>
                    </button>
                    <button
                      onClick={() => handleAddToPlaylist(video)}
                      className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-cinema-gray hover:text-white rounded-sm transition-all text-[9px] font-black uppercase tracking-widest border border-white/5"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="py-16 text-center px-4">
              <Search className="w-12 h-12 text-cinema-gray/10 mx-auto mb-4" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-2">No Results</h3>
              <p className="text-[10px] text-cinema-gray/40 uppercase tracking-widest">Try different keywords</p>
            </div>
          )}

          {/* Idle state */}
          {!searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="py-16 text-center px-4">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-cinema-red blur-2xl opacity-10" />
                <TrendingUp className="w-12 h-12 text-cinema-gray/20 relative" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-2">Search YouTube</h3>
              <p className="text-[10px] text-cinema-gray/40 uppercase tracking-widest">
                Enter keywords to find videos, music, and more
              </p>
            </div>
          )}

          {/* Searching state */}
          {isSearching && (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-2 border-cinema-red border-t-transparent rounded-full animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cinema-gray/40 animate-pulse">
                Scanning global archives...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeSearch;
