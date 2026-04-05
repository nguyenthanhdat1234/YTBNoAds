import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  SortAsc,
  Clock,
  Eye,
  Calendar,
  Star,
  Play,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { searchVideos, getVideoDetails, formatDuration, formatViewCount, formatPublishDate, isApiKeyConfigured } from '../../services/youtubeApi';
import { parseYouTubeURL } from '../../utils/youtubeHelpers';
import toast from 'react-hot-toast';

const VideoSearch = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  
  // Search filters
  const [filters, setFilters] = useState({
    order: 'relevance', // relevance, date, rating, viewCount, title
    duration: 'any', // any, short, medium, long
    definition: 'any', // any, high, standard
    maxResults: 25
  });

  const orderOptions = [
    { value: 'relevance', label: 'Most Relevant', icon: Star },
    { value: 'date', label: 'Upload Date', icon: Calendar },
    { value: 'viewCount', label: 'View Count', icon: Eye },
    { value: 'rating', label: 'Rating', icon: Star },
    { value: 'title', label: 'Title A-Z', icon: SortAsc }
  ];

  const durationOptions = [
    { value: 'any', label: 'Any Duration' },
    { value: 'short', label: 'Under 4 minutes' },
    { value: 'medium', label: '4-20 minutes' },
    { value: 'long', label: 'Over 20 minutes' }
  ];

  const definitionOptions = [
    { value: 'any', label: 'Any Quality' },
    { value: 'high', label: 'HD (720p+)' },
    { value: 'standard', label: 'Standard (480p)' }
  ];

  const performSearch = useCallback(async (searchQuery, searchFilters, pageToken = null) => {
    if (!searchQuery.trim()) return;
    
    if (!isApiKeyConfigured()) {
      setError('YouTube API key is required. Please configure it in Settings.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchVideos(searchQuery, {
        ...searchFilters,
        pageToken
      });

      if (pageToken) {
        // Append to existing results for pagination
        setResults(prev => [...prev, ...response.items]);
      } else {
        // New search - replace results
        setResults(response.items);
      }

      setNextPageToken(response.nextPageToken);
      setHasMore(!!response.nextPageToken);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      toast.error(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Check if it's a YouTube URL
    const urlParsed = parseYouTubeURL(query);
    if (urlParsed.isValid && urlParsed.type === 'video') {
      setLoading(true);
      try {
        const response = await getVideoDetails(urlParsed.id);
        if (response.items && response.items.length > 0) {
          const video = response.items[0];
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
          setQuery(''); // Clear search after successful URL play
          return;
        }
      } catch (err) {
        toast.error(`Failed to load video: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    setResults([]);
    setNextPageToken(null);
    setHasMore(false);
    performSearch(query, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Re-search with new filters if we have a query
    if (query.trim()) {
      setResults([]);
      setNextPageToken(null);
      setHasMore(false);
      performSearch(query, newFilters);
    }
  };

  const handleLoadMore = () => {
    if (nextPageToken && !loading) {
      performSearch(query, filters, nextPageToken);
    }
  };

  const handleVideoClick = (video) => {
    if (onVideoSelect) {
      // Convert search result to video format expected by player
      const videoData = {
        id: video.id.videoId,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
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

  const VideoCard = ({ video }) => {
    const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
    const duration = video.contentDetails?.duration;
    const viewCount = video.statistics?.viewCount;
    const publishedAt = video.snippet.publishedAt;

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
          
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-sm border border-white/10 uppercase tabular-nums">
              {formatDuration(duration)}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100">
            <div className="w-12 h-12 bg-cinema-red rounded-full flex items-center justify-center shadow-2xl shadow-cinema-red/50 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
        
        {/* Cinematic Data Suite */}
        <div className="p-5 space-y-4">
          <h3 className="text-xs font-bold text-cinema-gray group-hover:text-white transition-colors line-clamp-2 leading-relaxed tracking-tight">
            {video.snippet.title}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray/40 truncate max-w-[140px]">
                {video.snippet.channelTitle}
              </span>
              
              <div className="flex items-center space-x-3 text-[9px] font-black text-cinema-gray/30 tabular-nums">
                {viewCount && (
                  <div className="flex items-center space-x-1">
                    <span>{formatViewCount(viewCount)}</span>
                  </div>
                )}
                {publishedAt && (
                   <div className="flex items-center space-x-1">
                     <span className="w-1 h-1 bg-white/10 rounded-full" />
                     <span>{formatPublishDate(publishedAt)}</span>
                   </div>
                )}
              </div>
            </div>
            
            <p className="text-[10px] font-medium text-cinema-gray/30 line-clamp-2 leading-relaxed border-t border-white/5 pt-3">
              {video.snippet.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!isApiKeyConfigured()) {
    return (
      <div className="py-24 text-center space-y-8 animate-fade-in">
        <div className="relative inline-block">
           <div className="absolute inset-0 bg-cinema-red blur-3xl opacity-10" />
           <AlertCircle className="w-16 h-16 text-cinema-red relative" />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">
            Access Protocol Needed
          </h3>
          <p className="text-sm font-medium text-cinema-gray max-w-sm mx-auto leading-relaxed">
            Global Search requires an authorized YouTube API Key. Update your credentials in the System Control Room.
          </p>
        </div>
        <a 
          href="/settings" 
          className="inline-flex items-center space-x-4 px-8 py-4 bg-cinema-red text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-red-700 transition-all shadow-xl shadow-cinema-red/20 active:scale-95"
        >
          <span>Open Control Room</span>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-12 p-8 animate-fade-in">
      {/* Master Search Bar */}
      <div className="relative group">
        <div className="absolute inset-x-0 -top-20 h-40 bg-cinema-red opacity-[0.02] blur-[120px] pointer-events-none" />
        
        <form onSubmit={handleSearch} className="space-y-8 relative">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-cinema-gray/30 w-4 h-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Paste YouTube link or scan for cinematic titles..."
                className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/5 rounded-sm text-white placeholder:text-cinema-gray/20 text-sm font-medium focus:ring-0 focus:border-white/10 focus:bg-white/[0.04] transition-all tracking-wide shadow-2xl"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className={`px-10 flex items-center space-x-3 rounded-sm transition-all duration-500 ${
                  loading || !query.trim()
                    ? 'bg-white/5 text-cinema-gray/30'
                    : 'bg-cinema-red text-white hover:bg-red-700 shadow-xl shadow-cinema-red/10 animate-hover-scale'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ignite Scan</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-8 flex items-center space-x-3 rounded-sm border border-white/5 transition-all ${
                  showFilters ? 'bg-white/5 text-white border-white/10' : 'text-cinema-gray hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Optimization</span>
                {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Precision Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white/[0.02] border border-white/5 rounded-sm animate-slide-up">
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray flex items-center space-x-2">
                  <div className="w-1 h-1 bg-cinema-red rounded-full" />
                  <span>Sort Logic</span>
                </label>
                <select
                  value={filters.order}
                  onChange={(e) => handleFilterChange('order', e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-4 text-xs font-bold text-white focus:ring-0 focus:border-cinema-red transition-all appearance-none"
                >
                  {orderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray flex items-center space-x-2">
                  <div className="w-1 h-1 bg-cinema-red rounded-full" />
                  <span>Chronology</span>
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-4 text-xs font-bold text-white focus:ring-0 focus:border-cinema-red transition-all appearance-none"
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray flex items-center space-x-2">
                  <div className="w-1 h-1 bg-cinema-red rounded-full" />
                  <span>Definition Quality</span>
                </label>
                <select
                  value={filters.definition}
                  onChange={(e) => handleFilterChange('definition', e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-4 text-xs font-bold text-white focus:ring-0 focus:border-cinema-red transition-all appearance-none"
                >
                  {definitionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Synchronized Results Grid */}
      {results.length > 0 && (
        <div className="space-y-12 pt-8 border-t border-white/5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray flex items-center space-x-3">
              <div className="w-2 h-[1px] bg-cinema-red" />
              <span>Captured Footage: {results.length} Units</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {results.map((video, index) => (
              <VideoCard key={`${video.id.videoId}-${index}`} video={video} />
            ))}
          </div>

          {/* Sequential Loading Integration */}
          {hasMore && (
            <div className="pt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="group flex items-center space-x-4 mx-auto px-12 py-4 border border-white/10 rounded-sm hover:border-cinema-red transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cinema-red" />
                ) : (
                  <Play className="w-4 h-4 text-cinema-gray group-hover:text-cinema-red transition-colors rotate-90" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-gray group-hover:text-white transition-colors">
                  Extend Library Scan
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Default/Empty States */}
      {!loading && query && results.length === 0 && !error && (
        <div className="py-32 text-center space-y-8 animate-fade-in border border-dashed border-white/5 rounded-sm">
          <div className="opacity-20">
             <Search className="w-16 h-16 text-cinema-gray mx-auto" />
          </div>
          <div className="space-y-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
              Zero Assets Located
            </h3>
            <p className="text-[9px] font-medium text-cinema-gray tracking-widest uppercase">
              Recalibrate search parameters and re-scan library
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSearch;
