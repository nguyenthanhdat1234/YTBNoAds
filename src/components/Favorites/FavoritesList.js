import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Play,
  Trash2,
  Clock,
  Eye,
  Calendar,
  Search,
  Filter,
  X,
  Share2,
  Download,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import {
  getFavorites,
  removeFromFavorites,
  clearFavorites,
  isInFavorites
} from '../../services/userDataService';
import { formatDuration, formatViewCount, formatPublishDate } from '../../services/youtubeApi';
import toast from 'react-hot-toast';

const FavoritesList = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('addedAt'); // addedAt, title, channel, duration
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterAndSortFavorites();
  }, [favorites, searchQuery, sortBy, sortOrder]);

  const loadFavorites = () => {
    setLoading(true);
    try {
      const favoritesData = getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFavorites = () => {
    let filtered = [...favorites];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.channel.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'channel':
          aValue = a.channel.toLowerCase();
          bValue = b.channel.toLowerCase();
          break;
        case 'duration':
          aValue = parseDuration(a.duration) || 0;
          bValue = parseDuration(b.duration) || 0;
          break;
        case 'addedAt':
        default:
          aValue = new Date(a.addedAt);
          bValue = new Date(b.addedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredFavorites(filtered);
  };

  const parseDuration = (isoDuration) => {
    if (!isoDuration) return 0;
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleVideoClick = (video) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  const handleRemoveVideo = (videoId, event) => {
    event.stopPropagation();
    if (removeFromFavorites(videoId)) {
      setFavorites(prev => prev.filter(video => video.id !== videoId));
      toast.success('Video removed from favorites');
    } else {
      toast.error('Failed to remove video');
    }
  };

  const handleClearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
      if (clearFavorites()) {
        setFavorites([]);
        toast.success('Favorites cleared');
      } else {
        toast.error('Failed to clear favorites');
      }
    }
  };

  const handleShareFavorites = async () => {
    try {
      const favoritesUrls = favorites.map(video => video.url).join('\n');
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Favorite Videos',
          text: `Check out my ${favorites.length} favorite videos:`,
          url: window.location.origin
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(favoritesUrls);
        toast.success('Favorite video URLs copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share favorites');
    }
  };

  const handleExportFavorites = () => {
    try {
      const data = {
        favorites,
        exportedAt: new Date().toISOString(),
        totalCount: favorites.length
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Favorites exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export favorites');
    }
  };

  const VideoCard = ({ video }) => {
    if (viewMode === 'list') {
      return (
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden group flex"
          onClick={() => handleVideoClick(video)}
        >
          <div className="relative w-48 flex-shrink-0">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full h-28 object-cover"
            />
            {video.duration && (
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4 flex justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                {video.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {video.channel}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                {video.viewCount && (
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{formatViewCount(video.viewCount)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>Added {formatPublishDate(video.addedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <button
                onClick={(e) => handleRemoveVideo(video.id, e)}
                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                title="Remove from favorites"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden group"
        onClick={() => handleVideoClick(video)}
      >
        <div className="relative">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-48 object-cover"
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => handleRemoveVideo(video.id, e)}
              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors duration-200"
              title="Remove from favorites"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {video.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {video.channel}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center space-x-3">
              {video.viewCount && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViewCount(video.viewCount)}</span>
                </div>
              )}
              {video.publishedAt && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatPublishDate(video.publishedAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500 mt-2">
            <Heart className="w-3 h-3 text-red-500" />
            <span>Added {formatPublishDate(video.addedAt)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {favorites.length} favorite videos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="btn-secondary flex items-center space-x-2"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>

          {favorites.length > 0 && (
            <>
              <button
                onClick={handleShareFavorites}
                className="btn-secondary flex items-center space-x-2"
                title="Share favorites"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportFavorites}
                className="btn-secondary flex items-center space-x-2"
                title="Export favorites"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleClearFavorites}
                className="btn-secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      {favorites.length > 0 && (
        <div className="card p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your favorites..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="addedAt">Date Added</option>
                <option value="title">Title</option>
                <option value="channel">Channel</option>
                <option value="duration">Duration</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Favorites Grid/List */}
      {filteredFavorites.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredFavorites.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No videos found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search terms.
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Videos you favorite will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoritesList;
