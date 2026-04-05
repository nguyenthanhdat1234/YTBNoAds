import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Play,
  Trash2,
  Clock,
  Eye,
  Calendar,
  Search,
  Filter,
  X,
  Share2,
  Download,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import {
  getFavorites,
  removeFromFavorites,
  clearFavorites,
  isInFavorites
} from '../../services/userDataService';
import { formatDuration, formatViewCount, formatPublishDate } from '../../services/youtubeApi';
import toast from 'react-hot-toast';

const FavoritesList = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('addedAt'); // addedAt, title, channel, duration
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterAndSortFavorites();
  }, [favorites, searchQuery, sortBy, sortOrder]);

  const loadFavorites = () => {
    setLoading(true);
    try {
      const favoritesData = getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to access regional vaults');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFavorites = () => {
    let filtered = [...favorites];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.channel.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'channel':
          aValue = a.channel.toLowerCase();
          bValue = b.channel.toLowerCase();
          break;
        case 'duration':
          aValue = parseDuration(a.duration) || 0;
          bValue = parseDuration(b.duration) || 0;
          break;
        case 'addedAt':
        default:
          aValue = new Date(a.addedAt);
          bValue = new Date(b.addedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredFavorites(filtered);
  };

  const parseDuration = (isoDuration) => {
    if (!isoDuration) return 0;
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleVideoClick = (video) => {
    if (onVideoSelect) {
      onVideoSelect(video);
      navigate('/');
    }
  };

  const handleRemoveVideo = (videoId, event) => {
    event.stopPropagation();
    if (removeFromFavorites(videoId)) {
      setFavorites(prev => prev.filter(video => video.id !== videoId));
      toast.success('Asset removed from vault');
    } else {
      toast.error('Failed to update archival logic');
    }
  };

  const handleClearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
      if (clearFavorites()) {
        setFavorites([]);
        toast.success('Vault cleared successfully');
      } else {
        toast.error('Failed to clear vault');
      }
    }
  };

  const handleShareFavorites = async () => {
    try {
      const favoritesUrls = favorites.map(video => video.url).join('\n');
      
      if (navigator.share) {
        await navigator.share({
          title: 'Collector\'s Vault | YTBNoAds',
          text: `Reviewing my ${favorites.length} elite assets:`,
          url: window.location.origin
        });
      } else {
        await navigator.clipboard.writeText(favoritesUrls);
        toast.success('Asset registry copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to coordinate sharing protocol');
    }
  };

  const handleExportFavorites = () => {
    try {
      const data = {
        favorites,
        exportedAt: new Date().toISOString(),
        totalCount: favorites.length
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cinema-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Vault backup archived');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Backup protocol failed');
    }
  };

  const VideoCard = ({ video }) => {
    if (viewMode === 'list') {
      return (
        <div 
          className="group relative bg-cinema-surface/10 border border-white/5 rounded-sm overflow-hidden transition-all duration-500 hover:bg-white/[0.03] hover:border-white/20 cursor-pointer flex items-center p-3"
          onClick={() => handleVideoClick(video)}
        >
          <div className="relative w-48 h-28 flex-shrink-0 overflow-hidden rounded-sm">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700"
            />
            {video.duration && (
              <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-sm tabular-nums">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
          
          <div className="flex-1 px-5 py-2 flex justify-between items-center group/info">
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-black uppercase tracking-tight text-white mb-2 line-clamp-1 group-hover:text-cinema-red transition-colors">
                {video.title}
              </h4>
              
              <div className="flex items-center space-x-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cinema-gray/40">
                  {video.channel}
                </span>
                <span className="text-[9px] font-black text-cinema-gray/20 tabular-nums">
                  ADDED {formatPublishDate(video.addedAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
               <button
                onClick={(e) => handleRemoveVideo(video.id, e)}
                className="p-2.5 text-cinema-red/40 hover:text-cinema-red transition-colors"
                title="Eject Asset"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="group relative bg-cinema-surface/20 border border-white/5 rounded-sm overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:bg-cinema-surface/40 hover:border-white/20 cursor-pointer"
        onClick={() => handleVideoClick(video)}
      >
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-sm border border-white/10 uppercase tabular-nums">
              {formatDuration(video.duration)}
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={(e) => handleRemoveVideo(video.id, e)}
              className="p-2 bg-cinema-red/80 backdrop-blur-md border border-cinema-red/20 hover:bg-cinema-red text-white rounded-sm transition-all shadow-2xl"
              title="Purge Entry"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100">
            <div className="w-12 h-12 bg-cinema-red rounded-full flex items-center justify-center shadow-2xl shadow-cinema-red/50 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <h3 className="text-xs font-bold text-cinema-gray group-hover:text-white transition-colors line-clamp-2 leading-relaxed tracking-tight">
            {video.title}
          </h3>
          
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray/40 truncate max-w-[140px]">
              {video.channel}
            </span>
            <div className="flex items-center space-x-1 text-[9px] font-black text-cinema-gray/30 uppercase tracking-widest tabular-nums">
               <Heart className="w-2.5 h-2.5 text-cinema-red/60" />
               <span>{formatPublishDate(video.addedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-48 flex flex-col items-center justify-center space-y-8 animate-fade-in">
        <div className="w-12 h-12 border-2 border-cinema-red border-t-transparent rounded-full animate-spin shadow-2xl shadow-cinema-red/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cinema-gray animate-pulse">Decrypting Collectors Vault</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 p-8 animate-fade-in relative">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 border-b border-white/5 pb-10">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="absolute inset-0 bg-cinema-red blur-2xl opacity-10" />
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-sm">
              <Heart className="w-6 h-6 text-cinema-red" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-white leading-none mb-3">
              Collector's <span className="text-cinema-red">Vault</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray">
              Curated Production Grid // Registry Size: {favorites.length} Units
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-3 bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white rounded-sm transition-all"
            title="Toggle Protocol"
          >
            {viewMode === 'grid' ? <List className="w-3.5 h-3.5" /> : <Grid3X3 className="w-3.5 h-3.5" />}
          </button>

          {favorites.length > 0 && (
            <>
              <button
                onClick={handleShareFavorites}
                className="p-3 bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white rounded-sm transition-all"
                title="Broadcast Registry"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExportFavorites}
                className="p-3 bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white rounded-sm transition-all"
                title="Archive Backup"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-8 bg-white/5 mx-2" />

              <button
                onClick={handleClearFavorites}
                className="px-6 py-3 bg-white/[0.02] border border-white/5 text-cinema-red/40 hover:text-cinema-red hover:bg-cinema-red/5 rounded-sm transition-all flex items-center space-x-3 group"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Purge Vault</span>
              </button>
            </>
          )}
        </div>
      </div>

      {favorites.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-6 animate-slide-up">
          <div className="relative flex-1">
             <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-cinema-gray/20 w-4 h-4" />
             <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SCAN VAULT REGISTRY..."
                className="w-full pl-14 pr-6 py-5 bg-white/[0.01] border border-white/5 rounded-sm text-[11px] font-black uppercase tracking-[0.4em] text-white focus:ring-0 focus:border-white/20 focus:bg-white/[0.02] transition-all placeholder:text-cinema-gray/10"
              />
          </div>

          <div className="flex items-center space-x-3 px-6 py-2 bg-white/[0.02] border border-white/5 rounded-sm">
             <Filter className="w-3.5 h-3.5 text-cinema-red opacity-30" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cinema-gray/40 mr-4">Sequence:</span>
             <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.2em] text-white cursor-pointer hover:text-cinema-red transition-colors p-0 focus:ring-0"
              >
                <option value="addedAt" className="bg-[#141414]">Registry Date</option>
                <option value="title" className="bg-[#141414]">Production Title</option>
                <option value="channel" className="bg-[#141414]">Director Sector</option>
                <option value="duration" className="bg-[#141414]">Air Time</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-cinema-gray hover:text-white transition-colors"
                title={sortOrder === 'asc' ? 'Ascending Sequence' : 'Descending Sequence'}
              >
                 {sortOrder === 'asc' ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
              </button>
          </div>
        </div>
      )}

      {filteredFavorites.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-slide-up"
          : "space-y-4 animate-slide-up"
        }>
          {filteredFavorites.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="py-48 text-center space-y-12">
          <div className="space-y-6">
            <Heart className="w-16 h-16 text-cinema-gray/10 mx-auto" />
            <div className="space-y-3">
              <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white">Vault Static</h3>
              <p className="text-[10px] font-medium text-cinema-gray uppercase tracking-widest max-w-sm mx-auto">
                {favorites.length > 0 
                  ? 'Current query parameters returned null results in vault registry.' 
                  : 'Registry awaiting first asset collection session to initialize vault protocols.'
                }
              </p>
            </div>
          </div>
          {!favorites.length && (
            <button
               onClick={() => navigate('/')}
               className="px-12 py-5 bg-cinema-red text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-700 transition-all shadow-2xl shadow-cinema-red/20"
            >
               Browse Production Feed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritesList;
