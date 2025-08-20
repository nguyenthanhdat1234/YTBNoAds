import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Play,
  Trash2,
  Clock,
  Eye,
  Calendar,
  BarChart3,
  Search,
  Filter,
  X,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import {
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
  getWatchHistoryStats,
  exportUserData,
  importUserData
} from '../../services/userDataService';
import { formatDuration, formatViewCount, formatPublishDate } from '../../services/youtubeApi';
import toast from 'react-hot-toast';

const WatchHistory = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, searchQuery]);

  const loadHistory = () => {
    setLoading(true);
    try {
      const historyData = getWatchHistory();
      const statsData = getWatchHistoryStats();
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading watch history:', error);
      toast.error('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    if (!searchQuery.trim()) {
      setFilteredHistory(history);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = history.filter(video =>
      video.title.toLowerCase().includes(query) ||
      video.channel.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query)
    );
    setFilteredHistory(filtered);
  };

  const handleVideoClick = (video) => {
    if (onVideoSelect) {
      onVideoSelect(video);
      // Navigate to home page to play the video
      navigate('/');
    }
  };

  const handleRemoveVideo = (videoId, event) => {
    event.stopPropagation();
    if (removeFromWatchHistory(videoId)) {
      setHistory(prev => prev.filter(video => video.id !== videoId));
      toast.success('Video removed from history');
    } else {
      toast.error('Failed to remove video');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all watch history? This action cannot be undone.')) {
      if (clearWatchHistory()) {
        setHistory([]);
        setStats(getWatchHistoryStats());
        toast.success('Watch history cleared');
      } else {
        toast.error('Failed to clear history');
      }
    }
  };

  const handleExportData = () => {
    try {
      const data = exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ytb-noads-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (importUserData(data)) {
          loadHistory();
          toast.success('Data imported successfully');
        } else {
          toast.error('Failed to import data');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const formatWatchTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const VideoCard = ({ video }) => {
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
              title="Remove from history"
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
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-2">
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

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Watched {formatPublishDate(video.watchedAt)}</span>
            </div>
            {video.watchCount > 1 && (
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full">
                {video.watchCount}x
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const StatsPanel = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Videos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalVideos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Watch Time</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatWatchTime(stats.totalWatchTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unique Channels</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.uniqueChannels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Top Channel</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                {stats.topChannel?.name || 'N/A'}
              </p>
              {stats.topChannel && (
                <p className="text-xs text-gray-500">{stats.topChannel.count} videos</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading watch history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Watch History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {history.length} videos watched
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn-secondary flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </button>
          
          <button
            onClick={handleExportData}
            className="btn-secondary flex items-center space-x-2"
            title="Export data"
          >
            <Download className="w-4 h-4" />
          </button>

          <label className="btn-secondary flex items-center space-x-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="btn-secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && <StatsPanel />}

      {/* Search */}
      {history.length > 0 && (
        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your watch history..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* History Grid */}
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHistory.map((video) => (
            <VideoCard key={`${video.id}-${video.watchedAt}`} video={video} />
          ))}
        </div>
      ) : history.length > 0 ? (
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
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No watch history yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Videos you watch will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
