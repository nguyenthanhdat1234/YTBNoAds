import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Play, 
  Clock, 
  Eye, 
  Plus,
  X,
  Loader2,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const YouTubeSearch = ({ onVideoSelect, onAddToPlaylist, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const searchInputRef = useRef(null);

  // Mock search results - in real app, this would use YouTube API
  const mockSearchResults = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
      channel: 'Rick Astley',
      views: '1.4B',
      duration: '3:33',
      publishedAt: '2009-10-25',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'The official video for "Never Gonna Give You Up" by Rick Astley.'
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channel: 'Luis Fonsi',
      views: '8.1B',
      duration: '4:42',
      publishedAt: '2017-01-12',
      thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      description: 'Despacito" available everywhere now!'
    },
    {
      id: 'fJ9rUzIMcZQ',
      title: 'Queen – Bohemian Rhapsody (Official Video)',
      channel: 'Queen Official',
      views: '1.9B',
      duration: '5:55',
      publishedAt: '2008-08-01',
      thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      description: 'Taken from A Night At The Opera, 1975.'
    },
    {
      id: 'YQHsXMglC9A',
      title: 'Adele - Hello (Official Music Video)',
      channel: 'Adele',
      views: '3.2B',
      duration: '6:07',
      publishedAt: '2015-10-22',
      thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
      description: 'Hello" is taken from the new album, 25, out November 20.'
    }
  ];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock results based on search query
      const filteredResults = mockSearchResults.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.channel.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        toast.info('No videos found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVideoPlay = (video) => {
    setSelectedVideo(video);
    onVideoSelect(video.url);
    toast.success('Playing video');
  };

  const handleAddToPlaylist = (video) => {
    if (onAddToPlaylist) {
      onAddToPlaylist(video);
      toast.success('Added to playlist');
    }
  };

  const formatViews = (views) => {
    return views;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.getFullYear();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Search className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search YouTube Videos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for videos, artists, songs..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isSearching}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {searchResults.length > 0 ? (
            <div className="p-4 space-y-3">
              {searchResults.map((video) => (
                <div
                  key={video.id}
                  className={`flex space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${
                    selectedVideo?.id === video.id ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${video.id}/default.jpg`;
                      }}
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {video.channel}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(video.views)} views</span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(video.publishedAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {video.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleVideoPlay(video)}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                    >
                      <Play className="w-4 h-4" />
                      <span>Play</span>
                    </button>
                    <button
                      onClick={() => handleAddToPlaylist(video)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try searching with different keywords
              </p>
            </div>
          ) : !searchQuery && !isSearching ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Search YouTube Videos
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter keywords to find videos, music, and more
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default YouTubeSearch;
