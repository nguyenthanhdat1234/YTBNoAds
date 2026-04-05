import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
    const isListView = viewMode === 'list';

    return (
      <div 
        className={`group relative bg-cinema-surface/20 border border-white/5 rounded-sm overflow-hidden transition-all duration-700 hover:scale-[1.01] hover:bg-cinema-surface/40 hover:border-white/20 cursor-pointer ${
          isListView ? 'flex h-32' : 'flex flex-col'
        }`}
        onClick={() => setSelectedChannel(channel.id)}
      >
        {/* Cinematic Avatar/Banner */}
        <div className={`relative overflow-hidden ${isListView ? 'w-48 h-full' : 'aspect-video w-full'}`}>
          <img 
            src={channel.thumbnail} 
            alt={channel.title}
            className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <a
              href={`https://youtube.com/channel/${channel.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/30 text-white rounded-sm transition-all"
              title="Global Protocol"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={(e) => handleUnsubscribe(channel.id, e)}
              className="p-2 bg-cinema-red/80 backdrop-blur-md border border-cinema-red/20 hover:bg-cinema-red text-white rounded-sm transition-all"
              title="Terminate Protocol"
            >
              <BellOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        {/* Cinematic Channel Data */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-tight text-cinema-gray group-hover:text-white transition-colors line-clamp-1 leading-none">
              {channel.title}
            </h3>
            
            <div className="flex items-center space-x-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cinema-gray/40">Affiliates</span>
                <span className="text-[10px] font-bold text-white tabular-nums">{formatSubscriberCount(channel.subscriberCount)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cinema-gray/40">Unit Count</span>
                <span className="text-[10px] font-bold text-white tabular-nums">{formatVideoCount(channel.videoCount)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] font-medium text-cinema-gray/30 line-clamp-2 leading-relaxed border-t border-white/5 pt-4 mt-4 uppercase tracking-wider">
            {channel.description || 'No description available in the production log.'}
          </p>
        </div>
      </div>
    );
  };

  const StatsPanel = () => {
    if (!stats) return null;

    const statTiles = [
      { label: 'Active Channels', value: stats.totalSubscriptions, icon: Users, color: 'text-blue-400' },
      { label: 'Total Audience', value: formatSubscriberCount(stats.totalSubscribers), icon: Bell, color: 'text-cinema-red' },
      { label: 'Asset Library', value: formatVideoCount(stats.totalVideos), icon: Video, color: 'text-purple-400' },
      { label: 'Top Production', value: stats.topChannels[0]?.title || 'N/A', icon: BarChart3, color: 'text-orange-400' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up">
        {statTiles.map((tile, i) => (
          <div key={i} className="relative group overflow-hidden bg-white/[0.02] border border-white/5 p-6 rounded-sm">
            <div className={`absolute top-0 left-0 w-1 h-full bg-current ${tile.color} opacity-20`} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray/50">{tile.label}</span>
              <tile.icon className={`w-4 h-4 ${tile.color} opacity-40`} />
            </div>
            <div className="text-xl font-black text-white uppercase tracking-tight truncate">
              {tile.value}
            </div>
          </div>
        ))}
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
    <div className="space-y-12 p-8 animate-fade-in relative">
      {/* Master Protocol Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 border-b border-white/5 pb-12">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="absolute inset-0 bg-cinema-red blur-2xl opacity-10" />
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-sm">
              <Users className="w-6 h-6 text-cinema-red" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-white leading-none mb-3">
              Director's <span className="text-cinema-red">Portfolio</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray">
              Synchronized Channel Network // Registry Status: {subscriptions.length} Units
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-6 py-3 rounded-sm flex items-center space-x-3 transition-all ${
              showStats ? 'bg-white/10 text-white' : 'bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Analytics</span>
          </button>

          <button
            onClick={() => setShowChannelSearch(!showChannelSearch)}
            className="px-6 py-3 bg-cinema-red text-white rounded-sm flex items-center space-x-3 hover:bg-red-700 transition-all shadow-xl shadow-cinema-red/10"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Expand Network</span>
          </button>

          <div className="w-[1px] h-8 bg-white/5 mx-2" />

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-3 bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white rounded-sm transition-all"
          >
            {viewMode === 'grid' ? <List className="w-3.5 h-3.5" /> : <Grid3X3 className="w-3.5 h-3.5" />}
          </button>

          {subscriptions.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                className="p-3 bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white rounded-sm transition-all"
                title="Backup Local Database"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <label className="p-3 bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white rounded-sm transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              <button
                onClick={handleClearAll}
                className="p-3 bg-white/[0.02] border border-white/5 text-cinema-red/40 hover:text-cinema-red hover:bg-cinema-red/5 rounded-sm transition-all"
                title="Wipe Local Registry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Analytics Panel */}
      {showStats && <StatsPanel />}

      {/* Recruitment Hub (Channel Search) */}
      {showChannelSearch && (
        <div className="p-8 bg-white/[0.01] border border-white/5 rounded-sm animate-slide-up space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white flex items-center space-x-3">
             <div className="w-2 h-2 bg-cinema-red rounded-full animate-pulse" />
             <span>Subsidized Unit Recruitment</span>
          </h3>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-cinema-gray/30 w-4 h-4" />
              <input
                type="text"
                value={channelSearchQuery}
                onChange={(e) => setChannelSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChannelSearch()}
                placeholder="Scan global frequency for production channels..."
                className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-sm text-sm font-medium text-white placeholder:text-cinema-gray/20 focus:ring-0 focus:border-white/20 transition-all"
              />
            </div>
            <button
              onClick={handleChannelSearch}
              disabled={channelSearchLoading || !channelSearchQuery.trim()}
              className="px-12 bg-white/5 hover:bg-white/10 text-white rounded-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                {channelSearchLoading ? 'Scanning...' : 'Engage'}
              </span>
            </button>
          </div>

          {channelSearchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {channelSearchResults.map((channel) => (
                <div key={channel.id.channelId} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-sm hover:border-white/10 transition-all">
                  <div className="flex items-center space-x-6">
                    <img 
                      src={channel.snippet.thumbnails.default?.url}
                      alt={channel.snippet.title}
                      className="w-14 h-14 rounded-sm grayscale group-hover:grayscale-0 border border-white/5"
                    />
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-tight text-white leading-none">
                        {channel.snippet.title}
                      </h4>
                      <p className="text-[9px] font-medium text-cinema-gray/40 line-clamp-1 uppercase tracking-widest leading-none">
                         Synchronizing...
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChannelSubscribe({
                      id: channel.id.channelId,
                      snippet: channel.snippet
                    })}
                    className="px-6 py-3 bg-cinema-red/10 border border-cinema-red/20 text-cinema-red text-[9px] font-black uppercase tracking-[0.2em] hover:bg-cinema-red hover:text-white transition-all rounded-sm"
                  >
                    Integrate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid Controls: Logistics & Synchronization */}
      {subscriptions.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-6 p-6 bg-white/[0.01] border border-white/5 rounded-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-cinema-gray/20 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER LOCAL NETWORK..."
              className="w-full pl-14 pr-6 py-4 bg-transparent border border-white/5 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] text-white focus:ring-0 focus:border-white/20 placeholder:text-cinema-gray/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cinema-gray/40">Sector:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/60 border border-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:ring-0 focus:border-cinema-red rounded-sm appearance-none min-w-[140px]"
              >
                <option value="all">ALL SECTORS</option>
                {Object.entries(categories).map(([category, channels]) => (
                  channels.length > 0 && (
                    <option key={category} value={category}>
                      {category.toUpperCase()} ({channels.length})
                    </option>
                  )
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cinema-gray/40">Logic:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/60 border border-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:ring-0 focus:border-cinema-red rounded-sm appearance-none min-w-[140px]"
              >
                <option value="subscribedAt">DEPLOYMENT DATE</option>
                <option value="title">UNIT IDENTIFIER</option>
                <option value="subscribers">AUDIENCE SIZE</option>
                <option value="videos">ASSET VOLUME</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-3 px-4 py-2 hover:bg-white/5 transition-all text-cinema-gray hover:text-white rounded-sm"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Master Portfolio Display */}
      {filteredSubscriptions.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-slide-up"
          : "space-y-6 animate-slide-up"
        }>
          {filteredSubscriptions.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="py-32 text-center space-y-6 border border-dashed border-white/5 rounded-sm">
          <Search className="w-12 h-12 text-cinema-gray/10 mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray/40">
            No matching units found in localized portfolio
          </p>
        </div>
      ) : (
        <div className="py-48 text-center space-y-12">
          <div className="space-y-6">
            <Users className="w-16 h-16 text-cinema-gray/10 mx-auto" />
            <div className="space-y-3">
              <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white">Registry Empty</h3>
              <p className="text-[10px] font-medium text-cinema-gray uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                Connect and synchronize production channels to initialize your creative director dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowChannelSearch(true)}
            className="px-12 py-5 bg-cinema-red text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-700 transition-all shadow-2xl shadow-cinema-red/20"
          >
            Engage Network Recruitment
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsManager;
