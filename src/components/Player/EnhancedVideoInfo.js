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
    <div className="bg-cinema-surface/30 backdrop-blur-xl rounded-sm p-8 border border-white/5 space-y-10 animate-fade-in relative overflow-hidden">
      {/* Cinematic Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cinema-red/5 blur-[120px] pointer-events-none" />
      
      {/* Video Headline Suite */}
      <div className="space-y-6 relative z-10">
        <h1 className="text-3xl font-black tracking-tight text-white leading-[1.1] font-display">
          {metadata.title || video.title}
        </h1>
        
        {/* Editorial Stats Bar */}
        <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray">
          {loading ? (
            <div className="flex space-x-6">
              <div className="h-2 bg-white/5 rounded w-24 animate-pulse"></div>
              <div className="h-2 bg-white/5 rounded w-16 animate-pulse"></div>
            </div>
          ) : videoDetails ? (
            <>
              <div className="flex items-center space-x-2 group">
                <Eye className="w-3.5 h-3.5 transition-colors group-hover:text-white" />
                <span className="group-hover:text-white transition-colors">{formatNumber(videoDetails.views)} Views</span>
              </div>
              
              <div className="flex items-center space-x-2 group border-l border-white/10 pl-8">
                <ThumbsUp className="w-3.5 h-3.5 transition-colors group-hover:text-white" />
                <span className="group-hover:text-white transition-colors">{formatNumber(videoDetails.likes)} Likes</span>
              </div>
              
              <div className="flex items-center space-x-2 group border-l border-white/10 pl-8">
                <Calendar className="w-3.5 h-3.5 transition-colors group-hover:text-white" />
                <span className="group-hover:text-white transition-colors">{formatDate(videoDetails.publishedAt)}</span>
              </div>
            </>
          ) : null}
          
          {video.duration && (
            <div className="flex items-center space-x-2 group border-l border-white/10 pl-8">
              <Clock className="w-3.5 h-3.5 transition-colors group-hover:text-white" />
              <span className="group-hover:text-white transition-colors">{formatDuration(video.duration)}</span>
            </div>
          )}
        </div>

        {/* Director / Channel Signature */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6 border-t border-white/5">
          <div className="flex items-center space-x-5">
            <div className="group relative">
              <div className="absolute inset-0 bg-cinema-red blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="w-14 h-14 bg-cinema-surface border border-white/10 rounded-full flex items-center justify-center relative overflow-hidden">
                <User className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-tr from-cinema-red/10 to-transparent" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white tracking-tight leading-none">
                  {videoDetails?.channel?.name || video.author?.name || 'Unknown Channel'}
                </span>
                {videoDetails?.channel?.verified && (
                  <div className="w-4 h-4 bg-cinema-red rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white font-black">✓</span>
                  </div>
                )}
              </div>
              {videoDetails?.channel?.subscribers && (
                <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-cinema-gray">
                  <Users className="w-3 h-3" />
                  <span>{formatNumber(videoDetails.channel.subscribers)} Subscribers</span>
                </div>
              )}
            </div>
          </div>

          {/* Premium Interaction Suite */}
          <div className="flex items-center space-x-3">
            {onAddToPlaylist && (
              <button
                onClick={() => onAddToPlaylist(video)}
                className="flex items-center space-x-3 px-6 py-3 bg-white text-black hover:bg-cinema-red hover:text-white transition-all duration-500 rounded-sm font-black text-xs uppercase tracking-widest active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t('playlist.addToQueue')}</span>
              </button>
            )}
            
            <button
              onClick={shareVideo}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-sm transition-all text-cinema-gray hover:text-white"
              title={t('videoInfo.share')}
            >
              <Share className="w-4 h-4" />
            </button>
            
            <button
              onClick={copyVideoLink}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-sm transition-all text-cinema-gray hover:text-white"
              title={t('videoInfo.copyLink')}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Narrative Section (Description) */}
      {videoDetails?.description && (
        <div className="space-y-4">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="flex items-center justify-between w-full py-4 text-left border-b border-white/5 group"
          >
            <div className="flex items-center space-x-3">
              <Info className="w-4 h-4 text-cinema-red" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                {t('metadata.description')}
              </span>
            </div>
            {showDescription ? (
              <ChevronUp className="w-4 h-4 text-cinema-gray group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-cinema-gray group-hover:text-white transition-colors" />
            )}
          </button>

          {showDescription && (
            <div className="p-8 bg-black/40 border border-white/5 rounded-sm animate-slide-up">
              <p className="text-sm leading-relaxed text-cinema-gray font-medium selection:bg-cinema-red/30 selection:text-white">
                {videoDetails.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Technical Data (Metadata) */}
      {metadata.hasMetadata && (
        <div className="space-y-4">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex items-center justify-between w-full py-4 text-left border-b border-white/5 group"
          >
            <div className="flex items-center space-x-3">
              <Music className="w-4 h-4 text-cinema-red" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                {t('metadata.extracted')}
              </span>
            </div>
            {showMetadata ? (
              <ChevronUp className="w-4 h-4 text-cinema-gray group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-cinema-gray group-hover:text-white transition-colors" />
            )}
          </button>

          {showMetadata && (
            <div className="p-8 bg-black/40 border border-white/5 rounded-sm animate-slide-up space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {metadata.artist && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cinema-gray block">
                      {t('metadata.artist')}
                    </span>
                    <p className="text-white font-bold">{metadata.artist}</p>
                  </div>
                )}

                {metadata.album && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cinema-gray block">
                      {t('metadata.album')}
                    </span>
                    <p className="text-white font-bold">{metadata.album}</p>
                  </div>
                )}

                {metadata.genre && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cinema-gray block">
                      {t('metadata.genre')}
                    </span>
                    <p className="text-white font-bold">{metadata.genre}</p>
                  </div>
                )}
              </div>

              {metadata.performers && metadata.performers.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cinema-gray block">
                    Key Performers
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {metadata.performers.map((performer, index) => (
                      <span
                        key={index}
                        className="px-4 py-1.5 bg-white/5 text-white text-[10px] uppercase font-black border border-white/10 rounded-sm hover:bg-cinema-red hover:border-cinema-red transition-colors"
                      >
                        {performer}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Source Footnote */}
      <div className="flex items-center justify-between pt-10">
        <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-cinema-gray">
          <div className="w-1.5 h-1.5 bg-cinema-red rounded-full" />
          <span>System ID: {video.id}</span>
        </div>
        
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-cinema-gray hover:text-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t('videoInfo.openOnYoutube')}</span>
        </a>
      </div>
    </div>
  );
};

export default EnhancedVideoInfo;
