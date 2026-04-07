import { createContext, useContext, useState, useCallback } from 'react';
import { parseYouTubeURL } from '../utils/youtubeHelpers';
import { getVideoDetails } from '../services/youtubeApi';

const VideoContext = createContext();

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

export const VideoProvider = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');

  const selectVideo = useCallback(async (video) => {
    if (!video) {
      setCurrentVideo(null);
      setPlaying(false);
      return;
    }

    // If it's a string (URL), fetch details
    if (typeof video === 'string') {
      const urlParsed = parseYouTubeURL(video);
      if (urlParsed.isValid && urlParsed.id) {
        try {
          const response = await getVideoDetails(urlParsed.id);
          if (response.items && response.items.length > 0) {
            const v = response.items[0];
            const videoData = {
              id: v.id,
              url: `https://www.youtube.com/watch?v=${v.id}`,
              title: v.snippet.title,
              description: v.snippet.description,
              thumbnail: v.snippet.thumbnails?.maxresdefault?.url || v.snippet.thumbnails?.high?.url,
              channel: v.snippet.channelTitle,
              author: { name: v.snippet.channelTitle, channelId: v.snippet.channelId },
              duration: v.contentDetails?.duration,
              isLive: v.snippet.liveBroadcastContent === 'live'
            };
            setCurrentVideo(videoData);
          } else {
            // Fallback for when API fails but we have the URL
            setCurrentVideo({ id: urlParsed.id, url: video, title: 'YouTube Video' });
          }
        } catch (error) {
          console.error('Error fetching video details in context:', error);
          setCurrentVideo({ id: urlParsed.id, url: video, title: 'YouTube Video' });
        }
      } else {
        setCurrentVideo({ url: video, title: 'Unknown Video' });
      }
    } else {
      // It's already an object
      setCurrentVideo(video);
    }

    setPlaying(true);
    setPlayed(0); // Reset progress for new video
  }, []);

  const addToPlaylist = (video) => {
    setPlaylist(prev => {
      // Check if video already exists
      const exists = prev.find(v => v.id === video.id);
      if (exists) {
        return prev;
      }
      return [...prev, video];
    });
  };

  const removeFromPlaylist = (videoId) => {
    setPlaylist(prev => prev.filter(v => v.id !== videoId));
  };

  const playFromPlaylist = (index) => {
    if (playlist[index]) {
      setCurrentIndex(index);
      setCurrentVideo(playlist[index].url);
    }
  };

  const playNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      playFromPlaylist(nextIndex);
    }
  };

  const playPrevious = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      playFromPlaylist(prevIndex);
    }
  };

  const value = {
    currentVideo,
    playlist,
    currentIndex,
    playing,
    played,
    duration,
    volume,
    muted,
    isMinimized,
    selectVideo,
    setPlaying,
    setPlayed,
    setDuration,
    setVolume,
    setMuted,
    setIsMinimized,
    activeTab,
    setActiveTab,
    addToPlaylist,
    removeFromPlaylist,
    playFromPlaylist,
    playNext,
    playPrevious,
    setPlaylist,
    searchQuery,
    setSearchQuery
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};

export default VideoContext;
