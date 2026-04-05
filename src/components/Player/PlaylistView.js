import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Clock, List } from 'lucide-react';

const PlaylistView = ({ playlist, currentVideo, onVideoSelect }) => {
  const { t } = useTranslation();

  if (!playlist || !playlist.videos || playlist.videos.length === 0) {
    return null;
  }

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card bg-cinema-surface/40 p-6 space-y-6 border border-white/5 rounded-sm">
      {/* Playlist Sector Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-cinema-red/10 border border-cinema-red/20 rounded-sm">
            <List className="w-5 h-5 text-cinema-red" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] truncate max-w-[200px]">
              {playlist.title}
            </h3>
            <span className="text-[10px] font-bold text-cinema-gray uppercase tracking-widest mt-0.5">
              Sequence: {playlist.videos.length} Modules
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
           <div className="w-1.5 h-1.5 bg-cinema-red rounded-full animate-pulse" />
           <span className="text-[9px] font-black text-cinema-gray uppercase tracking-widest">Active Queue</span>
        </div>
      </div>

      {/* Production Sequence List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {playlist.videos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => onVideoSelect(video)}
            className={`group flex items-center space-x-4 p-3 rounded-sm cursor-pointer transition-all duration-300 border ${
              currentVideo?.id === video.id
                ? 'bg-cinema-red/10 border-cinema-red/30 shadow-[inset_0_0_20px_rgba(229,9,20,0.1)]'
                : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10'
            }`}
          >
            {/* Visual Identifier */}
            <div className="relative flex-shrink-0 w-24 aspect-video overflow-hidden rounded-sm border border-white/5">
              <img
                src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/default.jpg`}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {currentVideo?.id === video.id ? (
                <div className="absolute inset-0 bg-cinema-red/40 backdrop-blur-[2px] flex items-center justify-center">
                   <div className="flex space-x-0.5 items-end h-3">
                      <div className="w-1 bg-white animate-music-bar-1" />
                      <div className="w-1 bg-white animate-music-bar-2" />
                      <div className="w-1 bg-white animate-music-bar-3" />
                   </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white scale-75 group-hover:scale-100 transition-transform" />
                </div>
              )}
            </div>

            {/* Asset Metadata */}
            <div className="flex-1 min-w-0 space-y-1">
              <h4 className={`text-[11px] font-black uppercase tracking-wider truncate transition-colors duration-300 ${
                currentVideo?.id === video.id
                  ? 'text-white'
                  : 'text-cinema-gray group-hover:text-white'
              }`}>
                {video.title}
              </h4>
              <div className="flex items-center space-x-3">
                <span className="text-[9px] font-bold text-cinema-gray/60 uppercase tracking-widest whitespace-nowrap">
                  {video.author?.name || 'Asset Origin Unknown'}
                </span>
                {video.duration && (
                  <div className="flex items-center space-x-1.5 text-cinema-gray/40">
                    <span className="text-[10px]">•</span>
                    <Clock className="w-2.5 h-2.5" />
                    <span className="text-[9px] tabular-nums font-medium">
                      {formatTime(video.duration)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Temporal Index */}
            <div className="flex-shrink-0 pr-2">
              <span className={`text-[10px] font-black italic tracking-tighter ${
                currentVideo?.id === video.id
                  ? 'text-cinema-red'
                  : 'text-white/10 group-hover:text-white/30'
              }`}>
                #{(index + 1).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Queue Diagnostics */}
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-[8px] font-black text-cinema-gray/40 uppercase tracking-[0.3em]">
          <span>Total Payload: {playlist.videos.length} Units</span>
          {playlist.totalDuration && (
            <span>Temporal Density: {formatTime(playlist.totalDuration)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
