import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Play,
  Eye,
  Clock,
  Calendar,
  Loader2,
  AlertCircle,
  Filter,
  Globe
} from 'lucide-react';
import { getTrendingVideos, getVideoCategories, formatDuration, formatViewCount, formatPublishDate, isApiKeyConfigured } from '../../services/youtubeApi';
import toast from 'react-hot-toast';

const TrendingVideos = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('US');

  const regions = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' }
  ];

  useEffect(() => {
    if (isApiKeyConfigured()) {
      loadTrendingVideos();
      loadCategories();
    }
  }, [selectedCategory, selectedRegion]);

  const loadTrendingVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getTrendingVideos({
        regionCode: selectedRegion,
        categoryId: selectedCategory || null,
        maxResults: 50
      });

      setVideos(response.items || []);
    } catch (err) {
      console.error('Error loading trending videos:', err);
      setError(err.message);
      toast.error(`Failed to load trending videos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getVideoCategories(selectedRegion);
      setCategories(response.items || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Don't show error for categories as it's not critical
    }
  };

  const handleVideoClick = (video) => {
    if (onVideoSelect) {
      const videoData = {
        id: video.id,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
        channel: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails?.duration,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount
      };
      onVideoSelect(videoData);
      // Video will be played in the current tab (MainPlayer handles tab switching)
    }
  };

  const VideoCard = ({ video, index }) => {
    const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
    const duration = video.contentDetails?.duration;
    const viewCount = video.statistics?.viewCount;
    const publishedAt = video.snippet.publishedAt;

    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
        onClick={() => handleVideoClick(video)}
      >
        <div className="relative">
          <img 
            src={thumbnail} 
            alt={video.snippet.title}
            className="w-full h-48 object-cover"
          />
          
          {/* Trending Rank */}
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            #{index + 1}
          </div>
          
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {video.snippet.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {video.snippet.channelTitle}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center space-x-3">
              {viewCount && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViewCount(viewCount)}</span>
                </div>
              )}
              {publishedAt && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatPublishDate(publishedAt)}</span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
            {video.snippet.description}
          </p>
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
          To view trending videos, please configure your YouTube API key in Settings.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trending Videos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Most popular videos right now
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {regions.map(region => (
                <option key={region.code} value={region.code}>
                  {region.flag} {region.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.snippet.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading trending videos...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && videos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top {videos.length} Trending Videos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && videos.length === 0 && !error && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No trending videos found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try selecting a different region or category.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendingVideos;
