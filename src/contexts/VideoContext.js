import { createContext, useContext, useState } from 'react';

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

  const selectVideo = (videoUrl) => {
    setCurrentVideo(videoUrl);
  };

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
    selectVideo,
    addToPlaylist,
    removeFromPlaylist,
    playFromPlaylist,
    playNext,
    playPrevious,
    setPlaylist
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};

export default VideoContext;
