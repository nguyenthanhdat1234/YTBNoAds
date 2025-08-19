import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Info, 
  Music, 
  User, 
  Calendar, 
  Clock, 
  Tag,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

import { formatMetadataForDisplay } from '../../utils/metadataExtractor';

const VideoInfo = ({ video }) => {
  const { t } = useTranslation();
  const [showMetadata, setShowMetadata] = useState(false);
  
  if (!video) return null;

  const metadata = formatMetadataForDisplay(video.metadata);

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card p-6 space-y-4">
      {/* Video Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {metadata.title || video.title}
        </h1>
        
        {/* Channel Info */}
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="font-medium">{video.author?.name || 'Unknown Channel'}</span>
          </div>
          
          {video.duration && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      {metadata.hasMetadata && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="flex items-center space-x-2">
              <Music className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {t('metadata.extracted')}
              </span>
            </div>
            {showMetadata ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {showMetadata && (
            <div className="mt-3 space-y-3 animate-slide-up">
              {metadata.artist && (
                <div className="flex items-start space-x-3">
                  <User className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('metadata.artist')}:
                    </span>
                    <p className="text-gray-900 dark:text-white">{metadata.artist}</p>
                  </div>
                </div>
              )}

              {metadata.album && (
                <div className="flex items-start space-x-3">
                  <Info className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('metadata.album')}:
                    </span>
                    <p className="text-gray-900 dark:text-white">{metadata.album}</p>
                  </div>
                </div>
              )}

              {metadata.genre && (
                <div className="flex items-start space-x-3">
                  <Tag className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('metadata.genre')}:
                    </span>
                    <p className="text-gray-900 dark:text-white">{metadata.genre}</p>
                  </div>
                </div>
              )}

              {metadata.performers && metadata.performers.length > 0 && (
                <div className="flex items-start space-x-3">
                  <Music className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Performers:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {metadata.performers.map((performer, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                        >
                          {performer}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Original Title */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('metadata.original')}:
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {video.title}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Video ID: {video.id}
          </span>
        </div>
        
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open on YouTube</span>
        </a>
      </div>
    </div>
  );
};

export default VideoInfo;
