import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  SortDesc
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

  const handleSubscriptionToggle = () => {
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
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        channel: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails?.duration,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount
      };
      onVideoSelect(videoData);
    }
  };

  const VideoCard = ({ video }) => {
    const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
    const publishedAt = video.snippet.publishedAt;

    if (viewMode === 'list') {
      return (
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden group flex"
          onClick={() => handleVideoClick(video)}
        >
          <div className="relative w-48 flex-shrink-0">
            <img 
              src={thumbnail} 
              alt={video.snippet.title}
              className="w-full h-28 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
              {video.snippet.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
              {video.snippet.description}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
              {video.statistics?.viewCount && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViewCount(video.statistics.viewCount)}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatPublishDate(publishedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden group"
        onClick={() => handleVideoClick(video)}
      >
        <div className="relative">
          <img 
            src={thumbnail} 
            alt={video.snippet.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {video.snippet.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center space-x-3">
              {video.statistics?.viewCount && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViewCount(video.statistics.viewCount)}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatPublishDate(publishedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isApiKeyConfigured()) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          YouTube API Key Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          To browse channels, please configure your YouTube API key in Settings.
        </p>
        <a 
          href="/settings" 
          className="btn-primary inline-flex items-center space-x-2"
        >
          <span>Go to Settings</span>
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading channel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Error Loading Channel
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadChannelData}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Channel Not Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          The requested channel could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Channel Banner */}
        {channel.brandingSettings?.image?.bannerExternalUrl && (
          <div className="h-32 md:h-48 bg-gradient-to-r from-primary-600 to-primary-800 relative">
            <img 
              src={channel.brandingSettings.image.bannerExternalUrl}
              alt={`${channel.snippet.title} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Channel Info */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <img 
              src={channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url}
              alt={channel.snippet.title}
              className="w-20 h-20 rounded-full"
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {channel.snippet.title}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{formatSubscriberCount(channel.statistics?.subscriberCount)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Video className="w-4 h-4" />
                      <span>{formatVideoCount(channel.statistics?.videoCount)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatViewCount(channel.statistics?.viewCount)} views</span>
                    </div>
                  </div>
                  
                  {channel.snippet.description && (
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                      {channel.snippet.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSubscriptionToggle}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isSubscribed
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isSubscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    <span>{isSubscribed ? 'Unsubscribe' : 'Subscribe'}</span>
                  </button>
                  
                  <a
                    href={`https://youtube.com/channel/${channel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                      title="Close"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Videos ({filteredVideos.length})
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="btn-secondary flex items-center space-x-2"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search and Sort Controls */}
        {videos.length > 0 && (
          <div className="card p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
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
                  <option value="date">Upload Date</option>
                  <option value="title">Title</option>
                  <option value="views">View Count</option>
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

        {/* Videos Grid/List */}
        {videosLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading videos...</p>
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredVideos.map((video, index) => (
              <VideoCard key={`${video.id.videoId}-${index}`} video={video} />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="text-center py-8">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No videos found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No videos available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This channel doesn't have any public videos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelBrowser;
