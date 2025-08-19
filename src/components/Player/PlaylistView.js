import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Clock, List } from 'lucide-react';

const PlaylistView = ({ playlist, currentVideo, onVideoSelect }) => {
  const { t } = useTranslation();

  if (!playlist || !playlist.videos || playlist.videos.length === 0) {
    return null;
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card p-4 space-y-4">
      {/* Playlist Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <List className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {playlist.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {playlist.videos.length} videos
          </p>
        </div>
      </div>

      {/* Video List */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
        {playlist.videos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => onVideoSelect(video)}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
              currentVideo?.id === video.id
                ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
              <img
                src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/default.jpg`}
                alt={video.title}
                className="w-16 h-12 object-cover rounded"
              />
              {currentVideo?.id === video.id ? (
                <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/30 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <Play className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium truncate ${
                currentVideo?.id === video.id
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {video.title}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {video.author?.name || 'Unknown'}
                </span>
                {video.duration && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Index */}
            <div className="flex-shrink-0">
              <span className={`text-xs font-mono ${
                currentVideo?.id === video.id
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400'
              }`}>
                {(index + 1).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Playlist Stats */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Total videos: {playlist.videos.length}</span>
          {playlist.totalDuration && (
            <span>Duration: {formatDuration(playlist.totalDuration)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
