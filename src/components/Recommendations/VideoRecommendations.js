import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Play,
  Clock,
  Eye,
  Calendar,
  TrendingUp,
  History,
  Heart,
  Loader2,
  RefreshCw,
  Filter,
  ChevronRight
} from 'lucide-react';
import {
  searchVideos,
  getTrendingVideos,
  formatDuration,
  formatViewCount,
  formatPublishDate,
  isApiKeyConfigured
} from '../../services/youtubeApi';
import { getWatchHistory, getFavorites } from '../../services/userDataService';
import toast from 'react-hot-toast';

const VideoRecommendations = ({ currentVideo, onVideoSelect }) => {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('related'); // related, trending, history, favorites
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadRecommendations();
    setShowAll(false); // Reset show all when tab changes
  }, [currentVideo, activeTab]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      let data = [];

      switch (activeTab) {
        case 'related':
          data = await getRelatedVideos();
          break;
        case 'trending':
          data = await getTrendingRecommendations();
          break;
        case 'history':
          data = getHistoryRecommendations();
          break;
        case 'favorites':
          data = getFavoritesRecommendations();
          break;
        default:
          data = [];
      }

      setRecommendations(data);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRelatedVideos = async () => {
    if (!isApiKeyConfigured() || !currentVideo) {
      return [];
    }

    // Extract keywords from current video title and description
    const keywords = extractKeywords(currentVideo.title, currentVideo.description);
    const searchQuery = keywords.slice(0, 3).join(' '); // Use top 3 keywords

    if (!searchQuery) {
      return [];
    }

    const response = await searchVideos(searchQuery, {
      maxResults: 12,
      order: 'relevance'
    });

    // Filter out current video
    return response.items.filter(video => video.id.videoId !== currentVideo.id);
  };

  const getTrendingRecommendations = async () => {
    if (!isApiKeyConfigured()) {
      return [];
    }

    const response = await getTrendingVideos({
      maxResults: 12,
      regionCode: 'US'
    });

    return response.items.map(video => ({
      id: { videoId: video.id },
      snippet: video.snippet,
      statistics: video.statistics,
      contentDetails: video.contentDetails
    }));
  };

  const getHistoryRecommendations = () => {
    const history = getWatchHistory();
    return history.slice(0, 12).map(video => ({
      id: { videoId: video.id },
      snippet: {
        title: video.title,
        channelTitle: video.channel,
        thumbnails: { medium: { url: video.thumbnail } },
        publishedAt: video.publishedAt,
        description: video.description
      },
      statistics: { viewCount: video.viewCount },
      contentDetails: { duration: video.duration },
      isFromHistory: true,
      watchedAt: video.watchedAt
    }));
  };

  const getFavoritesRecommendations = () => {
    const favorites = getFavorites();
    return favorites.slice(0, 12).map(video => ({
      id: { videoId: video.id },
      snippet: {
        title: video.title,
        channelTitle: video.channel,
        thumbnails: { medium: { url: video.thumbnail } },
        publishedAt: video.publishedAt,
        description: video.description
      },
      statistics: { viewCount: video.viewCount },
      contentDetails: { duration: video.duration },
      isFromFavorites: true,
      addedAt: video.addedAt
    }));
  };

  const extractKeywords = (title, description) => {
    const text = `${title} ${description || ''}`.toLowerCase();
    
    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
      'his', 'her', 'its', 'our', 'their', 'video', 'youtube', 'watch', 'subscribe', 'like', 'comment'
    ]);

    // Extract words and filter
    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter(word => !/^\d+$/.test(word)); // Remove pure numbers

    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .map(([word]) => word)
      .slice(0, 10);
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
      // Video will be played in the current context (sidebar recommendations)
    }
  };

  const VideoCard = ({ video }) => {
    const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
    const duration = video.contentDetails?.duration;
    const viewCount = video.statistics?.viewCount;
    const publishedAt = video.snippet.publishedAt;

    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden group h-full"
        onClick={() => handleVideoClick(video)}
      >
        <div className="relative">
          <img
            src={thumbnail}
            alt={video.snippet.title}
            className="w-full h-36 object-cover"
          />
          {duration && (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
              {formatDuration(duration)}
            </div>
          )}

          {video.isFromHistory && (
            <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded flex items-center space-x-1">
              <History className="w-3 h-3" />
            </div>
          )}

          {video.isFromFavorites && (
            <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded flex items-center space-x-1">
              <Heart className="w-3 h-3" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>

        <div className="p-3 flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm mb-2 leading-tight">
            {video.snippet.title}
          </h3>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
            {video.snippet.channelTitle}
          </p>

          <div className="space-y-1">
            {viewCount && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                <Eye className="w-3 h-3" />
                <span>{formatViewCount(viewCount)}</span>
              </div>
            )}

            {publishedAt && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {formatPublishDate(publishedAt)}
              </div>
            )}
          </div>

          {video.watchedAt && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Watched {formatPublishDate(video.watchedAt)}
            </div>
          )}

          {video.addedAt && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              Favorited {formatPublishDate(video.addedAt)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'related', label: 'Related', icon: Sparkles, requiresVideo: true },
    { id: 'trending', label: 'Trending', icon: TrendingUp, requiresApi: true },
    { id: 'history', label: 'History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Heart }
  ];

  const availableTabs = tabs.filter(tab => {
    if (tab.requiresVideo && !currentVideo) return false;
    if (tab.requiresApi && !isApiKeyConfigured()) return false;
    return true;
  });

  if (availableTabs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommendations
          </h2>
        </div>
        
        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          title="Refresh recommendations"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {availableTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading recommendations...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">
            Failed to load recommendations
          </div>
          <button
            onClick={loadRecommendations}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-4">
          {/* Single row with horizontal scroll */}
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {(showAll ? recommendations : recommendations.slice(0, 10)).map((video, index) => (
              <div key={`${video.id.videoId}-${index}`} className="flex-shrink-0 w-64">
                <VideoCard video={video} />
              </div>
            ))}
          </div>

          {/* View More/Less Button */}
          {recommendations.length > 10 && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="btn-secondary flex items-center space-x-2 mx-auto"
              >
                <span>{showAll ? 'Show Less' : `View More (${recommendations.length - 10} more)`}</span>
                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showAll ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}

          {/* Grid view when showing all */}
          {showAll && recommendations.length > 10 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              {recommendations.slice(10).map((video, index) => (
                <VideoCard key={`${video.id.videoId}-${index + 10}`} video={video} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            No recommendations available
          </div>
          {activeTab === 'related' && !currentVideo && (
            <p className="text-sm text-gray-400">
              Play a video to see related recommendations
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoRecommendations;
