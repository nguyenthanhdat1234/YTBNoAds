import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Play,
  Trash2,
  Clock,
  Eye,
  Calendar,
  BarChart3,
  Search,
  Filter,
  X,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import {
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
  getWatchHistoryStats,
  exportUserData,
  importUserData
} from '../../services/userDataService';
import { formatDuration, formatViewCount, formatPublishDate } from '../../services/youtubeApi';
import toast from 'react-hot-toast';

const WatchHistory = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, searchQuery]);

  const loadHistory = () => {
    setLoading(true);
    try {
      const historyData = getWatchHistory();
      const statsData = getWatchHistoryStats();
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading watch history:', error);
      toast.error('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    if (!searchQuery.trim()) {
      setFilteredHistory(history);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = history.filter(video =>
      video.title.toLowerCase().includes(query) ||
      video.channel.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query)
    );
    setFilteredHistory(filtered);
  };

  const handleVideoClick = (video) => {
    if (onVideoSelect) {
      onVideoSelect(video);
      // Navigate to home page to play the video
      navigate('/');
    }
  };

  const handleRemoveVideo = (videoId, event) => {
    event.stopPropagation();
    if (removeFromWatchHistory(videoId)) {
      setHistory(prev => prev.filter(video => video.id !== videoId));
      toast.success('Video removed from history');
    } else {
      toast.error('Failed to remove video');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all watch history? This action cannot be undone.')) {
      if (clearWatchHistory()) {
        setHistory([]);
        setStats(getWatchHistoryStats());
        toast.success('Watch history cleared');
      } else {
        toast.error('Failed to clear history');
      }
    }
  };

  const handleExportData = () => {
    try {
      const data = exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ytb-noads-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (importUserData(data)) {
          loadHistory();
          toast.success('Data imported successfully');
        } else {
          toast.error('Failed to import data');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const formatWatchTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const VideoCard = ({ video }) => {
    return (
      <div 
        className="group relative bg-cinema-surface/20 border border-white/5 rounded-sm overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:bg-cinema-surface/40 hover:border-white/20 cursor-pointer"
        onClick={() => handleVideoClick(video)}
      >
        {/* Cinematic Thumbnail */}
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
        
        {/* Cinematic Log Data */}
        <div className="p-5 space-y-4">
          <h3 className="text-xs font-bold text-cinema-gray group-hover:text-white transition-colors line-clamp-2 leading-relaxed tracking-tight">
            {video.title}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray/40 truncate max-w-[140px]">
                {video.channel}
              </span>
              
              <div className="flex items-center space-x-3 text-[9px] font-black text-cinema-gray/30 tabular-nums">
                {video.viewCount && (
                  <div className="flex items-center space-x-1">
                    <span>{formatViewCount(video.viewCount)}</span>
                  </div>
                )}
                {video.publishedAt && (
                   <div className="flex items-center space-x-1">
                     <span className="w-1 h-1 bg-white/10 rounded-full" />
                     <span>{formatPublishDate(video.publishedAt)}</span>
                   </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[9px] font-black text-cinema-gray/40 border-t border-white/5 pt-3 uppercase tracking-widest">
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 text-cinema-red opacity-40" />
                <span>Last Scan: {formatPublishDate(video.watchedAt)}</span>
              </div>
              {video.watchCount > 1 && (
                <span className="bg-white/5 px-2 py-1 rounded-sm text-white border border-white/5">
                  ID: {video.watchCount}x
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatsPanel = () => {
    if (!stats) return null;

    const statTiles = [
      { label: 'Total Logs', value: stats.totalVideos, icon: Play, color: 'text-blue-400' },
      { label: 'Air Time', value: formatWatchTime(stats.totalWatchTime), icon: Clock, color: 'text-cinema-red' },
      { label: 'Network Spread', value: stats.uniqueChannels, icon: Eye, color: 'text-purple-400' },
      { label: 'Primary Frequency', value: stats.topChannel?.name || 'N/A', icon: BarChart3, color: 'text-orange-400' }
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
            {i === 3 && stats.topChannel && (
              <div className="mt-2 text-[9px] font-bold text-cinema-gray/30 uppercase tracking-widest">
                Unit Match: {stats.topChannel.count} Assets
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-48 flex flex-col items-center justify-center space-y-8 animate-fade-in">
        <div className="w-12 h-12 border-2 border-cinema-red border-t-transparent rounded-full animate-spin shadow-2xl shadow-cinema-red/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cinema-gray animate-pulse">Retrieving Historical Records</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 px-4 py-5 md:p-8 pb-24 xl:pb-8 animate-fade-in relative">
      {/* Editorial Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-8 border-b border-white/5 pb-5 md:pb-8">
        <div className="flex items-center space-x-4">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-cinema-red blur-2xl opacity-10" />
            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-sm">
              <History className="w-5 h-5 text-cinema-red" />
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black uppercase tracking-[0.1em] md:tracking-[0.3em] text-white leading-none mb-1">
              Director's <span className="text-cinema-red">Archive</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-cinema-gray/60">
              {history.length} Entries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2.5 rounded-sm flex items-center space-x-2 transition-all ${
              showStats ? 'bg-white/10 text-white' : 'bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Stats</span>
          </button>
          
          <button
            onClick={handleExportData}
            className="p-2.5 bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white rounded-sm transition-all"
            title="Export"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <label className="p-2.5 bg-white/[0.02] border border-white/5 text-cinema-gray hover:text-white rounded-sm transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2.5 bg-white/[0.02] border border-white/5 text-cinema-red/40 hover:text-cinema-red hover:bg-cinema-red/5 rounded-sm transition-all"
              title="Clear History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Global Analytics Panel */}
      {showStats && <StatsPanel />}

      {/* High-Fidelity Archive Filter */}
      {history.length > 0 && (
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-cinema-gray/20 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SCAN ARCHIVE RECORDS..."
            className="w-full pl-14 pr-6 py-5 bg-white/[0.01] border border-white/5 rounded-sm text-[11px] font-black uppercase tracking-[0.4em] text-white focus:ring-0 focus:border-white/20 focus:bg-white/[0.02] transition-all placeholder:text-cinema-gray/10"
          />
        </div>
      )}

      {/* Synchronized Archive Grid */}
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 animate-slide-up">
          {filteredHistory.map((video) => (
            <VideoCard key={`${video.id}-${video.watchedAt}`} video={video} />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="py-32 text-center border border-dashed border-white/5 rounded-sm">
          <Search className="w-12 h-12 text-cinema-gray/10 mx-auto mb-6" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray/40">
            No matching records found in system archive
          </p>
        </div>
      ) : (
        <div className="py-48 text-center space-y-12">
          <div className="space-y-6">
            <History className="w-16 h-16 text-cinema-gray/10 mx-auto" />
            <div className="space-y-3">
              <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white">Archive Null</h3>
              <p className="text-[10px] font-medium text-cinema-gray uppercase tracking-widest max-w-sm mx-auto">
                System awaiting first production session to initialize archival logging protocols.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-12 py-5 bg-cinema-red text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-700 transition-all shadow-2xl shadow-cinema-red/20"
          >
            Initiate Stream Frequency
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
