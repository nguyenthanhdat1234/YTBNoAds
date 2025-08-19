import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  Music, 
  Gamepad2, 
  GraduationCap, 
  Tv, 
  Shuffle,
  Play,
  Clock,
  Eye
} from 'lucide-react';
import { useVideo } from '../../contexts/VideoContext';

const SuggestedVideos = () => {
  const { t } = useTranslation();
  const { selectVideo } = useVideo();
  const [selectedCategory, setSelectedCategory] = useState('trending');

  const categories = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'entertainment', label: 'Entertainment', icon: Tv },
    { id: 'random', label: 'Random', icon: Shuffle }
  ];

  const suggestedVideos = {
    trending: [
      {
        id: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
        channel: 'Rick Astley',
        views: '1.4B',
        duration: '3:33',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishedAt: '12 years ago'
      },
      {
        id: 'kJQP7kiw5Fk',
        title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
        channel: 'Luis Fonsi',
        views: '8.1B',
        duration: '4:42',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        publishedAt: '6 years ago'
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Queen – Bohemian Rhapsody (Official Video)',
        channel: 'Queen Official',
        views: '1.9B',
        duration: '5:55',
        thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        publishedAt: '15 years ago'
      },
      {
        id: 'YQHsXMglC9A',
        title: 'Adele - Hello (Official Music Video)',
        channel: 'Adele',
        views: '3.2B',
        duration: '6:07',
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
        publishedAt: '8 years ago'
      }
    ],
    music: [
      {
        id: 'kJQP7kiw5Fk',
        title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
        channel: 'Luis Fonsi',
        views: '8.1B',
        duration: '4:42',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        publishedAt: '6 years ago'
      },
      {
        id: 'YQHsXMglC9A',
        title: 'Adele - Hello (Official Music Video)',
        channel: 'Adele',
        views: '3.2B',
        duration: '6:07',
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
        publishedAt: '8 years ago'
      }
    ],
    gaming: [
      {
        id: 'dQw4w9WgXcQ',
        title: 'Epic Gaming Moments Compilation',
        channel: 'Gaming Channel',
        views: '500K',
        duration: '10:30',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishedAt: '2 days ago'
      }
    ],
    education: [
      {
        id: 'fJ9rUzIMcZQ',
        title: 'How to Learn Programming in 2024',
        channel: 'Tech Education',
        views: '1.2M',
        duration: '15:45',
        thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        publishedAt: '1 week ago'
      }
    ],
    entertainment: [
      {
        id: 'YQHsXMglC9A',
        title: 'Funny Moments Compilation 2024',
        channel: 'Entertainment Hub',
        views: '2.5M',
        duration: '8:20',
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
        publishedAt: '3 days ago'
      }
    ],
    random: [
      {
        id: 'dQw4w9WgXcQ',
        title: 'Random Interesting Video',
        channel: 'Random Channel',
        views: '750K',
        duration: '7:15',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        publishedAt: '5 days ago'
      }
    ]
  };

  const handleVideoClick = (video) => {
    selectVideo(video.url);
  };

  const currentVideos = suggestedVideos[selectedCategory] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Discover Popular Content
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Explore trending videos or try something random
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${
              selectedCategory === id
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoClick(video)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${video.id}/default.jpg`;
                }}
              />
              
              {/* Duration */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>

              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                {video.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {video.channel}
              </p>
              
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{video.views} views</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{video.publishedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentVideos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tv className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No videos available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try selecting a different category
          </p>
        </div>
      )}
    </div>
  );
};

export default SuggestedVideos;
