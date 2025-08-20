import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Bell,
  BellOff,
  Search,
  Grid3X3,
  List,
  BarChart3,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  Eye,
  Video,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  Plus
} from 'lucide-react';
import {
  getSubscriptions,
  getSubscriptionStats,
  categorizeChannels,
  toggleChannelSubscription,
  clearAllSubscriptions,
  exportSubscriptions,
  importSubscriptions,
  formatSubscriberCount,
  formatVideoCount,
  searchSubscriptions
} from '../../services/subscriptionService';
import { searchChannels, isApiKeyConfigured } from '../../services/youtubeApi';
import ChannelBrowser from '../Channel/ChannelBrowser';
import toast from 'react-hot-toast';

const SubscriptionsManager = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('subscribedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showStats, setShowStats] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showChannelSearch, setShowChannelSearch] = useState(false);
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [channelSearchResults, setChannelSearchResults] = useState([]);
  const [channelSearchLoading, setChannelSearchLoading] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterAndSortSubscriptions();
  }, [subscriptions, searchQuery, selectedCategory, sortBy, sortOrder]);

  const loadSubscriptions = () => {
    setLoading(true);
    try {
      const subsData = getSubscriptions();
      const statsData = getSubscriptionStats();
      const categoriesData = categorizeChannels();
      
      setSubscriptions(subsData);
      setStats(statsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSubscriptions = () => {
    let filtered = [...subscriptions];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = searchSubscriptions(searchQuery);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryChannels = categories[selectedCategory] || [];
      const categoryIds = new Set(categoryChannels.map(ch => ch.id));
      filtered = filtered.filter(sub => categoryIds.has(sub.id));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'subscribers':
          aValue = parseInt(a.subscriberCount) || 0;
          bValue = parseInt(b.subscriberCount) || 0;
          break;
        case 'videos':
          aValue = parseInt(a.videoCount) || 0;
          bValue = parseInt(b.videoCount) || 0;
          break;
        case 'subscribedAt':
        default:
          aValue = new Date(a.subscribedAt);
          bValue = new Date(b.subscribedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSubscriptions(filtered);
  };

  const handleUnsubscribe = (channelId, event) => {
    event.stopPropagation();
    if (toggleChannelSubscription({ id: channelId })) {
      loadSubscriptions();
      toast.success('Unsubscribed successfully');
    } else {
      toast.error('Failed to unsubscribe');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to unsubscribe from all channels? This action cannot be undone.')) {
      if (clearAllSubscriptions()) {
        loadSubscriptions();
        toast.success('All subscriptions cleared');
      } else {
        toast.error('Failed to clear subscriptions');
      }
    }
  };

  const handleExport = () => {
    try {
      const data = exportSubscriptions();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Subscriptions exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export subscriptions');
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (importSubscriptions(data)) {
          loadSubscriptions();
          toast.success('Subscriptions imported successfully');
        } else {
          toast.error('Failed to import subscriptions');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleChannelSearch = async () => {
    if (!channelSearchQuery.trim() || !isApiKeyConfigured()) return;

    setChannelSearchLoading(true);
    try {
      const response = await searchChannels(channelSearchQuery, { maxResults: 10 });
      setChannelSearchResults(response.items || []);
    } catch (error) {
      console.error('Channel search error:', error);
      toast.error('Failed to search channels');
    } finally {
      setChannelSearchLoading(false);
    }
  };

  const handleChannelSubscribe = (channel) => {
    if (toggleChannelSubscription(channel)) {
      loadSubscriptions();
      toast.success('Subscribed successfully');
      setShowChannelSearch(false);
      setChannelSearchQuery('');
      setChannelSearchResults([]);
    } else {
      toast.error('Failed to subscribe');
    }
  };

  const ChannelCard = ({ channel }) => {
    if (viewMode === 'list') {
      return (
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden group flex"
          onClick={() => setSelectedChannel(channel.id)}
        >
          <div className="relative w-20 h-20 flex-shrink-0">
            <img 
              src={channel.thumbnail} 
              alt={channel.title}
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          
          <div className="flex-1 p-4 flex justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                {channel.title}
              </h3>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500 mb-1">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{formatSubscriberCount(channel.subscriberCount)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Video className="w-3 h-3" />
                  <span>{formatVideoCount(channel.videoCount)}</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {channel.description}
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <a
                href={`https://youtube.com/channel/${channel.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                title="Open on YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              
              <button
                onClick={(e) => handleUnsubscribe(channel.id, e)}
                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                title="Unsubscribe"
              >
                <BellOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden group"
        onClick={() => setSelectedChannel(channel.id)}
      >
        <div className="relative">
          <img 
            src={channel.thumbnail} 
            alt={channel.title}
            className="w-full h-32 object-cover"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
            <a
              href={`https://youtube.com/channel/${channel.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 bg-black/50 hover:bg-black/70 text-white rounded transition-colors duration-200"
              title="Open on YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={(e) => handleUnsubscribe(channel.id, e)}
              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
              title="Unsubscribe"
            >
              <BellOff className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {channel.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{formatSubscriberCount(channel.subscriberCount)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Video className="w-3 h-3" />
                <span>{formatVideoCount(channel.videoCount)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {channel.description}
          </p>
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
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Subscriptions</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscribers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatSubscriberCount(stats.totalSubscribers)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Videos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatVideoCount(stats.totalVideos)}
              </p>
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
                {stats.topChannels[0]?.title || 'N/A'}
              </p>
              {stats.topChannels[0] && (
                <p className="text-xs text-gray-500">
                  {formatSubscriberCount(stats.topChannels[0].subscriberCount)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedChannel) {
    return (
      <ChannelBrowser
        channelId={selectedChannel}
        onVideoSelect={onVideoSelect}
        onClose={() => setSelectedChannel(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Subscriptions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {subscriptions.length} subscribed channels
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
            onClick={() => setShowChannelSearch(!showChannelSearch)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Channel</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="btn-secondary flex items-center space-x-2"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>

          {subscriptions.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center space-x-2"
                title="Export subscriptions"
              >
                <Download className="w-4 h-4" />
              </button>

              <label className="btn-secondary flex items-center space-x-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleClearAll}
                className="btn-secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && <StatsPanel />}

      {/* Channel Search */}
      {showChannelSearch && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search Channels to Subscribe
          </h3>
          
          <div className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={channelSearchQuery}
                onChange={(e) => setChannelSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChannelSearch()}
                placeholder="Search for channels..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleChannelSearch}
              disabled={channelSearchLoading || !channelSearchQuery.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {channelSearchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {channelSearchResults.length > 0 && (
            <div className="space-y-2">
              {channelSearchResults.map((channel) => (
                <div key={channel.id.channelId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={channel.snippet.thumbnails.default?.url}
                      alt={channel.snippet.title}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {channel.snippet.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {channel.snippet.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChannelSubscribe({
                      id: channel.id.channelId,
                      snippet: channel.snippet
                    })}
                    className="btn-primary"
                  >
                    Subscribe
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      {subscriptions.length > 0 && (
        <div className="card p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {Object.entries(categories).map(([category, channels]) => (
                  channels.length > 0 && (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)} ({channels.length})
                    </option>
                  )
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="subscribedAt">Date Subscribed</option>
                <option value="title">Channel Name</option>
                <option value="subscribers">Subscriber Count</option>
                <option value="videos">Video Count</option>
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

      {/* Subscriptions Grid/List */}
      {filteredSubscriptions.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredSubscriptions.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No channels found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search terms or filters.
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No subscriptions yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start by searching and subscribing to channels you like.
          </p>
          <button
            onClick={() => setShowChannelSearch(true)}
            className="btn-primary"
          >
            Search Channels
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsManager;
