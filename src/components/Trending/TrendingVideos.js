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
  Globe,
  ChevronDown
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
        author: { name: video.snippet.channelTitle, channelId: video.snippet.channelId },
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
        className="group relative bg-cinema-surface/20 border border-white/5 rounded-sm overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:bg-cinema-surface/40 hover:border-white/20 cursor-pointer"
        onClick={() => handleVideoClick(video)}
      >
        {/* Cinematic Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={thumbnail} 
            alt={video.snippet.title}
            className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110"
          />
          
          {/* Enhanced Cinematic Rank */}
          <div className="absolute top-0 left-0 bg-cinema-red px-3 py-1.5 flex items-center space-x-2 shadow-2xl">
            <span className="text-[9px] font-black tracking-tighter text-white/50 uppercase">Top</span>
            <span className="text-xs font-black text-white tabular-nums">{(index + 1).toString().padStart(2, '0')}</span>
          </div>

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
        <div className="p-3 md:p-5 space-y-3 md:space-y-4">
          <h3 className="text-[10px] md:text-xs font-bold text-cinema-gray group-hover:text-white transition-colors line-clamp-2 leading-relaxed tracking-tight">
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
            
            <p className="hidden md:block text-[10px] font-medium text-cinema-gray/30 line-clamp-2 leading-relaxed border-t border-white/5 pt-3">
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
            Global Trends requires an authorized YouTube API Key. Update your credentials in the System Control Room.
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
    <div className="space-y-12 p-8 animate-fade-in relative">
      {/* Editorial Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/5 pb-12">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="absolute inset-0 bg-cinema-red blur-2xl opacity-20 animate-pulse" />
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-sm relative">
              <TrendingUp className="w-6 h-6 text-cinema-red" />
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black uppercase tracking-[0.2em] text-white leading-none mb-2 md:mb-3">
              Live <span className="text-cinema-red">Trends</span>
            </h1>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-cinema-gray">
              Global Stream Velocity Data // Synchronized Every Minute
            </p>
          </div>
        </div>

        {/* Precision Controllers */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="space-y-3">
            <label className="text-[8px] font-black uppercase tracking-[0.3em] text-cinema-gray flex items-center space-x-2 ml-1">
              <Globe className="w-3 h-3 text-cinema-red" />
              <span>Region Hub</span>
            </label>
            <div className="relative group">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full sm:w-48 bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-sm py-3 px-5 text-[10px] font-bold text-white focus:ring-0 focus:bg-white/[0.05] transition-all appearance-none tracking-widest cursor-pointer"
              >
                {regions.map(region => (
                  <option key={region.code} value={region.code} className="bg-[#141414]">
                    {region.flag} {region.name.toUpperCase()}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[8px] font-black uppercase tracking-[0.3em] text-cinema-gray flex items-center space-x-2 ml-1">
              <Filter className="w-3 h-3 text-cinema-red" />
              <span>Genre Sector</span>
            </label>
            <div className="relative group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-sm py-3 px-5 text-[10px] font-bold text-white focus:ring-0 focus:bg-white/[0.05] transition-all appearance-none tracking-widest cursor-pointer"
              >
                <option value="" className="bg-[#141414]">ALL SECTORS</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="bg-[#141414]">
                    {category.snippet.title.toUpperCase()}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Result Grid */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-8">
           <div className="w-12 h-12 border-2 border-cinema-red border-t-transparent rounded-full animate-spin shadow-2xl shadow-cinema-red/20" />
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-cinema-gray animate-pulse">Processing Stream Data</p>
        </div>
      ) : error ? (
        <div className="py-32 text-center space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-red">Synchronization Refused</p>
          <button
            onClick={loadTrendingVideos}
            className="px-10 py-4 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-all rounded-sm border border-white/5"
          >
            Reconnect System
          </button>
        </div>
      ) : videos.length > 0 ? (
        <div className="space-y-12">
          <div className="flex items-center space-x-6">
             <div className="h-[2px] w-12 bg-cinema-red shadow-[0_0_15px_rgba(229,9,20,0.6)]" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray">
                Units Captured: {videos.length}
             </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {videos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
          
          {/* Dynamic Scroll Indicator */}
          <div className="flex justify-center pt-8">
             <div className="flex items-center space-x-4 opacity-20">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
             </div>
          </div>
        </div>
      ) : (
        <div className="py-32 text-center border border-dashed border-white/5 rounded-sm">
          <TrendingUp className="w-16 h-16 text-cinema-gray/10 mx-auto mb-8" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray/40">
            Sector Empty // No High-Velocity Data Found
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendingVideos;
