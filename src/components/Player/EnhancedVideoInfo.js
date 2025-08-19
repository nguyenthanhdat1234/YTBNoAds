import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Eye,
  ThumbsUp,
  Share,
  Download,
  Copy,
  Users,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

import { formatMetadataForDisplay } from '../../utils/metadataExtractor';

const EnhancedVideoInfo = ({ video, onAddToPlaylist }) => {
  const { t } = useTranslation();
  const [showMetadata, setShowMetadata] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [videoDetails, setVideoDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const metadata = video ? formatMetadataForDisplay(video.metadata) : null;

  // Simulate fetching video details from YouTube API
  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!video?.id) {
        setVideoDetails(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // In a real implementation, you would fetch from YouTube API
        // For now, we'll simulate with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));

        setVideoDetails({
          views: Math.floor(Math.random() * 10000000),
          likes: Math.floor(Math.random() * 100000),
          publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          description: `This is a sample description for the video "${video.title}". In a real implementation, this would be fetched from the YouTube API along with other metadata like view count, likes, and publish date.`,
          channel: {
            name: video.author?.name || 'Unknown Channel',
            subscribers: Math.floor(Math.random() * 1000000),
            verified: Math.random() > 0.5
          }
        });
      } catch (error) {
        console.error('Error fetching video details:', error);
        setVideoDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [video?.id, video?.title, video?.author]);

  if (!video) return null;

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

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

  const copyVideoLink = () => {
    navigator.clipboard.writeText(video.url);
    toast.success('Video link copied to clipboard');
  };

  const shareVideo = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        url: video.url
      });
    } else {
      copyVideoLink();
    }
  };

  return (
    <div className="card p-6 space-y-6">
      {/* Video Title and Basic Info */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {metadata.title || video.title}
        </h1>
        
        {/* Video Stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {loading ? (
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
          ) : videoDetails ? (
            <>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{formatNumber(videoDetails.views)} {t('metadata.views')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4" />
                <span>{formatNumber(videoDetails.likes)} {t('metadata.likes')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(videoDetails.publishedAt)}</span>
              </div>
            </>
          ) : null}
          
          {video.duration && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          )}
        </div>

        {/* Channel Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {videoDetails?.channel?.name || video.author?.name || 'Unknown Channel'}
                </span>
                {videoDetails?.channel?.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              {videoDetails?.channel?.subscribers && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{formatNumber(videoDetails.channel.subscribers)} subscribers</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {onAddToPlaylist && (
              <button
                onClick={() => onAddToPlaylist(video)}
                className="flex items-center space-x-2 px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-lg transition-colors duration-200"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">{t('playlist.addToQueue')}</span>
              </button>
            )}
            
            <button
              onClick={shareVideo}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              title={t('videoInfo.share')}
            >
              <Share className="w-4 h-4" />
            </button>
            
            <button
              onClick={copyVideoLink}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              title={t('videoInfo.copyLink')}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {videoDetails?.description && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                {t('metadata.description')}
              </span>
            </div>
            {showDescription ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {showDescription && (
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-slide-up">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {videoDetails.description}
              </p>
            </div>
          )}
        </div>
      )}

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
          <span>{t('videoInfo.openOnYoutube')}</span>
        </a>
      </div>
    </div>
  );
};

export default EnhancedVideoInfo;
