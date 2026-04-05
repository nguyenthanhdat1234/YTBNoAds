import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, TrendingUp, Music, Film, Gamepad2, BookOpen, Shuffle } from 'lucide-react';

const VideoSuggestions = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('trending');

  // Sample video suggestions - in real app, these would come from an API
  const videoSuggestions = {
    trending: [
      {
        id: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
        channel: 'Rick Astley',
        views: '1.4B',
        duration: '3:33',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: 'kJQP7kiw5Fk',
        title: 'Despacito ft. Daddy Yankee',
        channel: 'Luis Fonsi',
        views: '8.1B',
        duration: '4:42',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Queen – Bohemian Rhapsody (Official Video)',
        channel: 'Queen Official',
        views: '1.9B',
        duration: '5:55',
        thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
      },
      {
        id: 'YQHsXMglC9A',
        title: 'Adele - Hello (Official Music Video)',
        channel: 'Adele',
        views: '3.2B',
        duration: '6:07',
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=YQHsXMglC9A'
      }
    ],
    music: [
      {
        id: 'JGwWNGJdvx8',
        title: 'Ed Sheeran - Shape of You (Official Video)',
        channel: 'Ed Sheeran',
        views: '5.8B',
        duration: '3:53',
        thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8'
      },
      {
        id: 'RgKAFK5djSk',
        title: 'Wiz Khalifa - See You Again ft. Charlie Puth',
        channel: 'Wiz Khalifa',
        views: '5.9B',
        duration: '3:57',
        thumbnail: 'https://img.youtube.com/vi/RgKAFK5djSk/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=RgKAFK5djSk'
      }
    ],
    entertainment: [
      {
        id: 'M7lc1UVf-VE',
        title: 'MrBeast - I Gave My 40,000,000th Subscriber 40 Cars',
        channel: 'MrBeast',
        views: '180M',
        duration: '15:39',
        thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE'
      }
    ]
  };

  const categories = [
    { id: 'trending', label: t('discover.categories.trending'), icon: TrendingUp },
    { id: 'music', label: t('discover.categories.music'), icon: Music },
    { id: 'entertainment', label: t('discover.categories.entertainment'), icon: Film },
    { id: 'gaming', label: t('discover.categories.gaming'), icon: Gamepad2 },
    { id: 'education', label: t('discover.categories.education'), icon: BookOpen }
  ];

  const handleVideoClick = (video) => {
    onVideoSelect(video.url);
  };

  const handleRandomVideo = () => {
    const allVideos = Object.values(videoSuggestions).flat();
    const randomVideo = allVideos[Math.floor(Math.random() * allVideos.length)];
    onVideoSelect(randomVideo.url);
  };

  const currentVideos = videoSuggestions[selectedCategory] || videoSuggestions.trending;

  return (
    <div className="space-y-10 py-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
             <div className="w-1 h-4 bg-cinema-red rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-red">{t('discover.signal')}</span>
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
            {t('discover.title')}
          </h2>
          <p className="text-sm text-cinema-gray max-w-md font-medium leading-relaxed">
            {t('discover.subtitle')}
          </p>
        </div>

        <button
          onClick={handleRandomVideo}
          className="btn-cinema bg-white/5 border-white/10 hover:bg-cinema-red group h-12 px-6"
        >
          <Shuffle className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('discover.randomButton')}</span>
        </button>
      </div>

      {/* Category Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 p-1 bg-white/5 border border-white/5 rounded-sm">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-5 py-2 rounded-sm transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-cinema-red text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]'
                  : 'text-cinema-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <category.icon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{category.label}</span>
            </button>
          ))}
        </div>
        
        <div className="hidden md:flex items-center space-x-2 text-[10px] font-black text-cinema-gray uppercase tracking-widest opacity-40">
           <span>{t('discover.available', { count: currentVideos.length })}</span>
        </div>
      </div>

      {/* High-Fidelity Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentVideos.map((video, index) => (
          <div
            key={video.id + index}
            onClick={() => handleVideoClick(video)}
            className="group relative bg-cinema-surface/50 border border-white/5 rounded-sm overflow-hidden cursor-pointer transition-all duration-500 hover:border-cinema-red/50 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          >
            {/* Thumbnail Composite */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                }}
              />
              
              {/* Cinematic Grade Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-transparent opacity-60" />
              <div className="absolute inset-0 bg-cinema-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Focus Action */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl">
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
              </div>
              
              {/* Meta Indicators */}
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-black text-white px-2 py-1 rounded-sm tracking-widest">
                {video.duration}
              </div>
              
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <div className="bg-cinema-red text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
                   Ready to Stream
                 </div>
              </div>
            </div>

            {/* Content Metallurgy */}
            <div className="p-5 space-y-3">
              <div className="space-y-1.5">
                <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-cinema-red transition-colors duration-300">
                  {video.title}
                </h3>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-cinema-gray uppercase tracking-widest">{video.channel}</span>
                   <span className="text-[9px] font-medium text-cinema-gray/60">{video.views} Interactions</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-cinema-red group-hover:animate-pulse transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Reports / Empty State */}
      {currentVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6 border border-dashed border-white/10 rounded-sm bg-white/2">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center relative">
            <Film className="w-10 h-10 text-cinema-gray/30" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cinema-red rounded-full" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t('discover.categoryOffline')}</h3>
            <p className="text-xs text-cinema-gray uppercase tracking-[0.2em]">{t('discover.noModules')}</p>
          </div>
          <button 
            onClick={() => setSelectedCategory('trending')}
            className="btn-cinema text-[10px]"
          >
            {t('discover.resetSignal')}
          </button>
        </div>
      )}

      {/* Knowledge Proclamation (Footer Tip) */}
      <div className="glass-card bg-cinema-surface/30 p-6 border-l-4 border-l-cinema-red rounded-sm">
        <div className="flex items-start space-x-5">
          <div className="w-10 h-10 bg-cinema-red/20 border border-cinema-red/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
             <BookOpen className="w-5 h-5 text-cinema-red" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Operational Protocol</h4>
            <p className="text-xs text-cinema-gray font-medium leading-relaxed">
              Inject specific YouTube identifiers into the central command console (Search Bar) to override discovery and initialize direct transmission of any global asset.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSuggestions;
