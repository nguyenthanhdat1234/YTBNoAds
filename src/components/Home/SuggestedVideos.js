import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, TrendingUp, Music, Film, Gamepad2, BookOpen, Shuffle, Eye, Clock } from 'lucide-react';
import { useVideo } from '../../contexts/VideoContext';

const SuggestedVideos = () => {
  const { t } = useTranslation();
  const { selectVideo } = useVideo();
  const [selectedCategory, setSelectedCategory] = useState('trending');

  const categories = [
    { id: 'trending', label: t('discover.trending') || 'Trending', icon: TrendingUp },
    { id: 'music', label: t('discover.music') || 'Music', icon: Music },
    { id: 'gaming', label: t('discover.gaming') || 'Gaming', icon: Gamepad2 },
    { id: 'education', label: t('discover.education') || 'Learn', icon: BookOpen },
    { id: 'entertainment', label: t('discover.entertainment') || 'Cinema', icon: Film },
    { id: 'random', label: t('discover.random') || 'Random', icon: Shuffle },
  ];

  const suggestedVideos = {
    trending: [
      {
        id: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up',
        channel: 'Rick Astley',
        views: '1.4B',
        duration: '3:33',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishedAt: '12 years ago',
      },
      {
        id: 'kJQP7kiw5Fk',
        title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
        channel: 'Luis Fonsi',
        views: '8.1B',
        duration: '4:42',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        publishedAt: '6 years ago',
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Queen – Bohemian Rhapsody',
        channel: 'Queen Official',
        views: '1.9B',
        duration: '5:55',
        thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        publishedAt: '15 years ago',
      },
      {
        id: 'YQHsXMglC9A',
        title: 'Adele - Hello (Official Music Video)',
        channel: 'Adele',
        views: '3.2B',
        duration: '6:07',
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
        publishedAt: '8 years ago',
      },
    ],
  };

  const handleVideoClick = (v) => {
    // Ensure author field is present for consistency
    const videoData = {
      ...v,
      author: { name: v.channel || 'Unknown Channel' }
    };
    selectVideo(videoData);
  };

  const currentVideos = suggestedVideos[selectedCategory] || suggestedVideos.trending;

  return (
    <div className="space-y-6 md:space-y-12 py-4 md:py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4 px-2">
        <div className="inline-flex items-center space-x-3 px-4 py-1 bg-cinema-red/10 border border-cinema-red/20 rounded-full mb-2 md:mb-4">
          <TrendingUp className="w-3 h-3 text-cinema-red animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cinema-red">Signal Discovery</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-white leading-none">
          Global <span className="text-cinema-red">Frequencies</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-cinema-gray/40 max-w-lg mx-auto">
          Curated metadata across localized sectors.
        </p>
      </div>

      {/* Category Filters — horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`flex items-center space-x-2 px-4 md:px-6 py-2.5 md:py-3 rounded-sm border transition-all duration-500 flex-shrink-0 relative group ${
              selectedCategory === id
                ? 'bg-cinema-red border-cinema-red shadow-[0_0_20px_rgba(229,9,20,0.3)] text-white'
                : 'bg-white/[0.02] border-white/5 text-cinema-gray/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className={`w-3 h-3 flex-shrink-0 ${selectedCategory === id ? 'text-white' : 'text-current group-hover:text-cinema-red'}`} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 md:gap-8">
        {currentVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoClick(video)}
            className="group relative bg-cinema-surface/20 border border-white/5 rounded-sm overflow-hidden transition-all duration-700 hover:scale-[1.03] hover:bg-cinema-surface/40 hover:border-white/20 cursor-pointer shadow-2xl"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${video.id}/default.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[8px] md:text-[9px] font-black tracking-widest px-1.5 md:px-2 py-0.5 md:py-1 rounded-sm border border-white/10 uppercase tabular-nums">
                {video.duration}
              </div>

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-cinema-red rounded-full flex items-center justify-center shadow-2xl shadow-cinema-red/50 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <Play className="w-4 h-4 md:w-6 md:h-6 text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-3 md:p-6 space-y-2 md:space-y-4">
              <h3 className="text-[10px] md:text-xs font-black text-cinema-gray group-hover:text-white transition-colors line-clamp-2 leading-snug tracking-[0.03em] uppercase">
                {video.title}
              </h3>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] text-cinema-gray/30 group-hover:text-cinema-red transition-colors truncate max-w-[70%]">
                  {video.channel}
                </span>
                <div className="flex items-center space-x-1 text-[8px] md:text-[9px] font-black text-cinema-gray/20 tabular-nums flex-shrink-0">
                  <Eye className="w-2.5 h-2.5 opacity-40" />
                  <span>{video.views}</span>
                </div>
              </div>
            </div>

            {/* Scanning line hover effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-cinema-red opacity-0 group-hover:opacity-100 group-hover:top-full transition-all duration-[2000ms] pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentVideos.length === 0 && (
        <div className="py-24 text-center border border-dashed border-white/5 rounded-sm bg-white/[0.01]">
          <Film className="w-12 h-12 text-cinema-gray/10 mx-auto mb-6 animate-pulse" />
          <h3 className="text-lg font-black uppercase tracking-[0.4em] text-white mb-3">Signal Null</h3>
          <p className="text-[10px] font-medium text-cinema-gray/40 uppercase tracking-widest max-w-sm mx-auto">
            No frequencies found for this sector.
          </p>
        </div>
      )}
    </div>
  );
};

export default SuggestedVideos;
