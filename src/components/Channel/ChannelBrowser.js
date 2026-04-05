import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Play,
  Search,
  Bell,
  BellOff,
  Eye,
  Calendar,
  Video,
  Loader2,
  AlertCircle,
  ExternalLink,
  Grid3X3,
  List,
  Filter,
  SortAsc,
  SortDesc,
  ArrowLeft
} from 'lucide-react';
import {
  getChannelDetails,
  getChannelVideos,
  searchChannels,
  formatViewCount,
  formatPublishDate,
  formatDuration,
  isApiKeyConfigured
} from '../../services/youtubeApi';
import {
  isSubscribedToChannel,
  toggleChannelSubscription,
  formatSubscriberCount,
  formatVideoCount
} from '../../services/subscriptionService';
import toast from 'react-hot-toast';

const ChannelBrowser = ({ channelId, onVideoSelect, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('date'); // date, title, views
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVideos, setFilteredVideos] = useState([]);

  useEffect(() => {
    if (channelId) {
      loadChannelData();
    }
  }, [channelId]);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    if (channel) {
      setIsSubscribed(isSubscribedToChannel(channel.id));
    }
  }, [channel]);

  const loadChannelData = async () => {
    if (!isApiKeyConfigured()) {
      setError('YouTube API key is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load channel details
      const channelResponse = await getChannelDetails(channelId);
      if (channelResponse.items && channelResponse.items.length > 0) {
        setChannel(channelResponse.items[0]);
        
        // Load channel videos
        setVideosLoading(true);
        const videosResponse = await getChannelVideos(channelId, {
          maxResults: 50,
          order: 'date'
        });
        
        if (videosResponse.items) {
          setVideos(videosResponse.items);
        }
      } else {
        setError('Channel not found');
      }
    } catch (err) {
      console.error('Error loading channel data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setVideosLoading(false);
    }
  };

  const filterAndSortVideos = () => {
    let filtered = [...videos];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video =>
        video.snippet.title.toLowerCase().includes(query) ||
        video.snippet.description.toLowerCase().includes(query)
      );
    }

    // Sort videos
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.snippet.title.toLowerCase();
          bValue = b.snippet.title.toLowerCase();
          break;
        case 'views':
          aValue = parseInt(a.statistics?.viewCount || 0);
          bValue = parseInt(b.statistics?.viewCount || 0);
          break;
        case 'date':
        default:
          aValue = new Date(a.snippet.publishedAt);
          bValue = new Date(b.snippet.publishedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredVideos(filtered);
  };

  const handleSubscriptionToggle = (e) => {
    e.stopPropagation();
    if (!channel) return;

    if (toggleChannelSubscription(channel)) {
      setIsSubscribed(!isSubscribed);
      toast.success(isSubscribed ? 'Unsubscribed successfully' : 'Subscribed successfully');
    } else {
      toast.error('Failed to update subscription');
    }
  };

  const handleVideoClick = (video) => {
    if (onVideoSelect) {
      const videoData = {
        id: video.id.videoId,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        channel: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails?.duration,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount
      };
      onVideoSelect(videoData);
      // Navigate to home page to play the video
      navigate('/');
    }
  };

  const VideoCard = ({ video }) => {
    const thumbnail = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
    const publishedAt = video.snippet.publishedAt;
    const isListView = viewMode === 'list';

    return (
      <div 
        className={`group relative bg-cinema-surface/20 border border-white/5 rounded-sm overflow-hidden transition-all duration-700 hover:scale-[1.01] hover:bg-cinema-surface/40 hover:border-white/20 cursor-pointer ${
          isListView ? 'flex h-32 md:h-40' : 'flex flex-col'
        }`}
        onClick={() => handleVideoClick(video)}
      >
        {/* Cinematic Thumbnail */}
        <div className={`relative overflow-hidden ${isListView ? 'w-48 md:w-64 h-full' : 'aspect-video w-full'}`}>
          <img 
            src={thumbnail} 
            alt={video.snippet.title}
            className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="p-4 bg-cinema-red/80 backdrop-blur-xl rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-500">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
        </div>
        
        {/* Cinematic Metadata */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-tight text-cinema-gray group-hover:text-white transition-colors line-clamp-2 leading-tight">
              {video.snippet.title}
            </h3>
            
            <div className="flex items-center space-x-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cinema-gray/40">Visual Frequency</span>
                <span className="text-[10px] font-bold text-white tabular-nums">{formatViewCount(video.statistics?.viewCount)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cinema-gray/40">Temporal Log</span>
                <span className="text-[10px] font-bold text-white tabular-nums">{formatPublishDate(publishedAt)}</span>
              </div>
            </div>
          </div>
          
          {isListView && (
            <p className="hidden md:block text-[10px] font-medium text-cinema-gray/30 line-clamp-2 leading-relaxed border-t border-white/5 pt-4 mt-4 uppercase tracking-wider">
              {video.snippet.description || 'No production metadata available.'}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (!isApiKeyConfigured()) {
    return (
      <div className="py-48 text-center space-y-12 animate-fade-in">
        <div className="space-y-6">
          <AlertCircle className="w-16 h-16 text-cinema-red/20 mx-auto" />
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-white">Neural Key Required</h3>
            <p className="text-[10px] font-medium text-cinema-gray uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Global synchronization requires high-level API authorization. Please configure your production credentials in the system console.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="px-12 py-5 bg-cinema-red text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-700 transition-all shadow-2xl shadow-cinema-red/20"
        >
          Initialize Console Sync
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-64 flex flex-col items-center justify-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-cinema-red/20 border-t-cinema-red rounded-full animate-spin" />
          <div className="absolute inset-0 bg-cinema-red blur-2xl opacity-10 animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white animate-pulse">Synchronizing Unit Dossier</p>
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-cinema-gray/40">Global Protocol Active</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-48 text-center space-y-12 animate-fade-in">
        <div className="space-y-6">
          <AlertCircle className="w-16 h-16 text-cinema-red/40 mx-auto" />
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-white">Synchronization Error</h3>
            <p className="text-[10px] font-medium text-cinema-red uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
              {error}
            </p>
          </div>
        </div>
        <button
          onClick={loadChannelData}
          className="px-12 py-5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all"
        >
          Re-engage Protocol
        </button>
      </div>
    );
  }

  if (!channel) return null;

  return (
    <div className="space-y-12 -mt-8 -mx-8 animate-fade-in relative">
      {/* Unit Identification Header */}
      <div className="relative h-[40vh] min-h-[400px] overflow-hidden group">
        {/* Banner with Parallax-esque Effect */}
        <div className="absolute inset-0">
          {channel.brandingSettings?.image?.bannerExternalUrl ? (
            <img 
              src={channel.brandingSettings.image.bannerExternalUrl}
              alt={channel.snippet.title}
              className="w-full h-full object-cover opacity-50 transition-all duration-1000 scale-105"
            />
          ) : (
            <div className="w-full h-full bg-cinema-surface/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/20" />
        </div>

        {/* Floating Dossier Controls */}
        <div className="absolute top-12 left-12 right-12 flex justify-between items-center z-20">
          <button
            onClick={onClose}
            className="p-4 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/30 text-white rounded-sm transition-all group/back"
          >
            <ArrowLeft className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleSubscriptionToggle}
              className={`flex items-center space-x-3 px-8 py-4 rounded-sm font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 shadow-2xl ${
                isSubscribed
                  ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                  : 'bg-cinema-red text-white shadow-cinema-red/20 border border-cinema-red/20 hover:bg-red-700'
              }`}
            >
              {isSubscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              <span>{isSubscribed ? 'Terminate Sync' : 'Synchronize Unit'}</span>
            </button>
            
            <a
              href={`https://youtube.com/channel/${channel.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/30 text-white rounded-sm transition-all"
              title="Global Protocol Link"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Channel Identity Core */}
        <div className="absolute bottom-12 left-12 right-12 z-10 flex items-end justify-between gap-12">
          <div className="flex items-end space-x-8">
            <div className="relative group/avatar">
              <div className="absolute inset-0 bg-cinema-red blur-3xl opacity-20 group-hover/avatar:opacity-40 transition-opacity" />
              <img 
                src={channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url}
                alt={channel.snippet.title}
                className="w-32 h-32 md:w-48 md:h-48 rounded-sm relative z-10 border-2 border-white/10 shadow-2xl transition-all duration-1000"
              />
            </div>
            
            <div className="space-y-6 pb-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-cinema-red mb-3 block">Authorized Production Unit</span>
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
                  {channel.snippet.title}
                </h1>
              </div>
              
              <div className="flex items-center flex-wrap gap-8">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray/40">Global Audience</span>
                  <span className="text-lg font-black text-white">{formatSubscriberCount(channel.statistics?.subscriberCount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray/40">Unit Assets</span>
                  <span className="text-lg font-black text-white">{formatVideoCount(channel.statistics?.videoCount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray/40">Accumulated Visuals</span>
                  <span className="text-lg font-black text-white">{formatViewCount(channel.statistics?.viewCount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Log Archive */}
      <div className="px-12 pb-24 space-y-16">
        {/* Logistics Control Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-white/5 pb-12">
          <div className="flex items-center space-x-6">
            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-sm">
              <Video className="w-5 h-5 text-cinema-red" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white leading-none mb-2">
                Production <span className="text-cinema-red">Archives</span>
              </h2>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-cinema-gray/40 leading-none">
                Metadata Logs // Registry Status: {filteredVideos.length} Extracted Units
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[300px]">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-cinema-gray/30 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SCAN PRODUCTION LOGS..."
                className="w-full pl-14 pr-6 py-4 bg-white/[0.02] border border-white/5 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] text-white focus:ring-0 focus:border-white/20 placeholder:text-cinema-gray/20 transition-all"
              />
            </div>

            <div className="flex items-center space-x-3 bg-white/[0.02] border border-white/5 rounded-sm p-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cinema-gray/40">Logic:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white focus:ring-0 cursor-pointer"
              >
                <option value="date">TEMPORAL</option>
                <option value="title">ALPHABETICAL</option>
                <option value="views">LUMINOSITY</option>
              </select>
              
              <div className="w-[1px] h-4 bg-white/10 mx-2" />
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-white hover:text-cinema-red transition-colors"
                title={sortOrder === 'asc' ? 'Descending' : 'Ascending'}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-4 bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white rounded-sm transition-all"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Grid/List Container */}
        {filteredVideos.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-8"
            : "max-w-5xl mx-auto space-y-6"
          }>
            {filteredVideos.map((video, index) => (
              <VideoCard key={`${video.id.videoId}-${index}`} video={video} />
            ))}
          </div>
        ) : (
          <div className="py-48 text-center space-y-6 border border-dashed border-white/5 rounded-sm">
            <Search className="w-16 h-16 text-cinema-gray/10 mx-auto" />
            <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white">Log Entry Missing</h3>
            <p className="text-[10px] font-medium text-cinema-gray uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
              No localized production matches detected in the current sector. Try a wider frequency sweep.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelBrowser;
