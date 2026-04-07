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
  AlertCircle,
  Globe
} from 'lucide-react';
import { searchVideos, getVideoDetails, formatDuration, formatViewCount, formatPublishDate, isApiKeyConfigured } from '../../services/youtubeApi';
import { parseYouTubeURL } from '../../utils/youtubeHelpers';
import toast from 'react-hot-toast';
import { useVideo } from '../../contexts/VideoContext';

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
    maxResults: 25,
    eventType: 'any' // any, live
  });

  const { searchQuery, setSearchQuery } = useVideo();

  const orderOptions = [
    { value: 'relevance', label: t('search.options.relevance'), icon: Star },
    { value: 'date', label: t('search.options.date'), icon: Calendar },
    { value: 'viewCount', label: t('search.options.viewCount'), icon: Eye },
    { value: 'rating', label: t('search.options.rating'), icon: Star },
    { value: 'title', label: t('search.options.title'), icon: SortAsc }
  ];

  const durationOptions = [
    { value: 'any', label: t('search.options.any') },
    { value: 'short', label: t('search.options.short') },
    { value: 'medium', label: t('search.options.medium') },
    { value: 'long', label: t('search.options.long') }
  ];

  const definitionOptions = [
    { value: 'any', label: t('search.options.any') },
    { value: 'high', label: t('search.options.hd') },
    { value: 'standard', label: t('search.options.sd') }
  ];

  const eventTypeOptions = [
    { value: 'any', label: 'All Content' },
    { value: 'live', label: 'Live Streams' }
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
        pageToken,
        eventType: searchFilters.eventType === 'any' ? null : searchFilters.eventType
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

  // Watch for external search triggers (e.g. from Movie Explorer)
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      setQuery(searchQuery);
      setResults([]);
      setNextPageToken(null);
      setHasMore(false);
      performSearch(searchQuery, filters);
      
      // Clear the trigger so it doesn't re-run in undesirable ways
      // but keep the local state 'query' filled
      setSearchQuery('');
    }
  }, [searchQuery, filters, performSearch, setSearchQuery]);

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
        likeCount: video.statistics?.likeCount,
        isLive: video.snippet?.liveBroadcastContent === 'live'
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-30 group-hover:opacity-50 transition-opacity" />
          
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
                placeholder={t('search.placeholder')}
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
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('search.igniteScan')}</span>
              </button>

            </div>
          </div>
        </form>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-[0.2em] text-cinema-gray/40 mr-2">
            <Filter className="w-3 h-3" />
            <span>Quick Filters</span>
          </div>
          {[
            { id: 'any', label: 'All Content', icon: Globe },
            { id: 'live', label: 'Live Now', icon: Play, color: 'text-cinema-red border-cinema-red/20' },
            { id: 'gaming', label: 'Gaming', query: 'gaming' },
            { id: 'music', label: 'Music', query: 'music' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => {
                if (chip.id === 'live') {
                  handleFilterChange('eventType', filters.eventType === 'live' ? 'any' : 'live');
                } else if (chip.query) {
                  setQuery(chip.query);
                  performSearch(chip.query, filters);
                } else {
                  handleFilterChange('eventType', 'any');
                }
              }}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border rounded-sm transition-all flex items-center space-x-2 ${
                (chip.id === 'live' && filters.eventType === 'live') || (chip.id === 'any' && filters.eventType === 'any' && !query.includes(chip.query || ''))
                  ? 'bg-cinema-red text-white border-cinema-red shadow-lg shadow-cinema-red/20'
                  : 'bg-white/5 border-white/5 text-cinema-gray/60 hover:text-white hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {chip.icon && <chip.icon className="w-3 h-3" />}
              {chip.id === 'live' && <div className={`w-1 h-1 rounded-full bg-current ${filters.eventType === 'live' ? 'animate-pulse' : ''}`} />}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Synchronized Results Grid */}
      {results.length > 0 && (
        <div className="space-y-12 pt-8 border-t border-white/5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray flex items-center space-x-3">
              <div className="w-2 h-[1px] bg-cinema-red" />
              <span>{t('search.capturedFootage', { count: results.length })}</span>
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
                  {t('search.extendScan')}
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
              {t('search.zeroAssets')}
            </h3>
            <p className="text-[9px] font-medium text-cinema-gray tracking-widest uppercase">
              {t('search.recalibrate')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSearch;
