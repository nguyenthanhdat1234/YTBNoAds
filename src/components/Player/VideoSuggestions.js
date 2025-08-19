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
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'entertainment', label: 'Entertainment', icon: Film },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'education', label: 'Education', icon: BookOpen }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Suggested Videos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Discover popular content or try something random
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              selectedCategory === category.id
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        ))}
        
        <button
          onClick={handleRandomVideo}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors duration-200"
        >
          <Shuffle className="w-4 h-4" />
          <span className="text-sm font-medium">Random</span>
        </button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoClick(video)}
            className="card p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                }}
              />
              
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-900 ml-1" />
                </div>
              </div>
              
              {/* Duration */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>

            {/* Video Info */}
            <div className="p-3 space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight">
                {video.title}
              </h3>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {video.channel}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {video.views} views
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentVideos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No videos in this category
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try selecting a different category or use the random button
          </p>
        </div>
      )}

      {/* Quick Tip */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs">💡</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Quick Tip
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              You can also paste any YouTube URL in the search box above to play any video you want.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSuggestions;
