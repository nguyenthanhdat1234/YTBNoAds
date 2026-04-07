import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
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
      order: 'relevance',
      eventType: currentVideo?.isLive ? 'live' : null,
      type: 'video'
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
      'his', 'her', 'its', 'our', 'their', 'video', 'youtube', 'watch', 'subscribe', 'like', 'comment',
      // Vietnamese stop words
      'của', 'và', 'là', 'có', 'trong', 'được', 'cho', 'với', 'không', 'các', 'này', 'đến', 'mà', 'như',
      'nhân', 'nhà', 'trước', 'sau', 'một', 'nhiều', 'khi', 'hoặc', 'nếu', 'về', 'tới', 'tại', 'vẫn', 'đang'
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
        likeCount: video.statistics?.likeCount,
        isLive: video.snippet?.liveBroadcastContent === 'live'
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
    const isLive = video.snippet?.liveBroadcastContent === 'live';

    return (
      <div
        className="group relative bg-cinema-surface/20 border border-white/5 rounded-sm overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:bg-cinema-surface/40 hover:border-white/20 cursor-pointer"
        onClick={() => handleVideoClick(video)}
      >
        {/* Cinematic Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail}
            alt={video.snippet.title}
            className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          {duration && !isLive && (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-sm border border-white/10 uppercase tabular-nums">
              {formatDuration(duration)}
            </div>
          )}

          {isLive && (
            <div className="absolute bottom-2 right-2 bg-cinema-red text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-sm border border-white/10 uppercase animate-pulse">
              ● LIVE
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100">
            <div className="w-12 h-12 bg-cinema-red rounded-full flex items-center justify-center shadow-2xl shadow-cinema-red/50 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Cinematic Data Suite */}
        <div className="p-4 space-y-3">
          <h3 className="text-xs font-bold text-cinema-gray group-hover:text-white transition-colors line-clamp-2 leading-relaxed tracking-tight">
            {video.snippet.title}
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray/40 truncate max-w-[140px]">
              {video.snippet.channelTitle}
            </span>
            
            <div className="flex items-center space-x-2 text-[9px] font-black text-cinema-gray/30 tabular-nums">
              {viewCount && (
                <div className="flex items-center space-x-1">
                  <span>{formatViewCount(viewCount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'related', label: 'Related Footage', icon: Zap, requiresVideo: true },
    { id: 'trending', label: 'Global Trends', icon: TrendingUp, requiresApi: true },
    { id: 'history', label: 'Recent Archive', icon: History },
    { id: 'favorites', label: 'Curated Picks', icon: Heart }
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
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-2">
        <div className="flex items-center space-x-8">
          {availableTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative pb-4 transition-all duration-300 ${
                  activeTab === tab.id ? 'text-white' : 'text-cinema-gray hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-3.5 h-3.5 transition-colors ${activeTab === tab.id ? 'text-cinema-red' : 'text-cinema-gray group-hover:text-white'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-cinema-red shadow-[0_0_15px_rgba(229,9,20,0.4)]" />
                )}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-cinema-gray hover:text-white transition-colors disabled:opacity-30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Feed</span>
        </button>
      </div>

      {/* Cinematic Asset Feed */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-6">
          <div className="w-10 h-10 border-2 border-cinema-red border-t-transparent rounded-full animate-spin" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-cinema-gray animate-pulse">Scanning Recommendations</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-red">Synchronization Error</p>
          <button
            onClick={loadRecommendations}
            className="text-[9px] font-black uppercase tracking-widest text-white border-b border-white/20 hover:border-white transition-all pb-1"
          >
            Reconnect System
          </button>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-12">
          {/* Liquid Glass Horizontal Feed */}
          <div className="flex space-x-6 overflow-x-auto pb-6 custom-scrollbar group/feed">
            {(showAll ? recommendations : recommendations.slice(0, 10)).map((video, index) => (
              <div key={`${video.id.videoId}-${index}`} className="flex-shrink-0 w-80">
                <VideoCard video={video} />
              </div>
            ))}
          </div>

          {/* Toggle Suite */}
          {recommendations.length > 10 && (
            <div className="flex items-center justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="group flex items-center space-x-4 px-8 py-3 border border-white/10 hover:border-cinema-red/50 hover:bg-cinema-red/5 transition-all rounded-sm"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-gray group-hover:text-white transition-colors">
                  {showAll ? 'Collapse Reel' : `Expand Library (${recommendations.length - 10} More)`}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 text-cinema-gray group-hover:text-cinema-red transition-all duration-500 ${showAll ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}

          {/* Expanded Grid Architecture */}
          {showAll && recommendations.length > 10 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
              {recommendations.slice(10).map((video, index) => (
                <VideoCard key={`${video.id.videoId}-${index + 10}`} video={video} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-white/5 rounded-sm">
          <div className="mb-6 opacity-20">
            <Zap className="w-12 h-12 text-cinema-gray mx-auto" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-gray/40">
            System Idle // No Recommendations Located
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoRecommendations;
