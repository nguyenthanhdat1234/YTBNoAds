import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVideo } from '../../contexts/VideoContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  SkipBack,
  SkipForward
} from 'lucide-react';

const MiniPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentVideo: video, 
    playing, 
    setPlaying, 
    played, 
    setPlayed, 
    duration, 
    setDuration, 
    volume, 
    muted, 
    setMuted,
    isMinimized,
    setIsMinimized,
    selectVideo
  } = useVideo();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ bottom: 20, right: 20 });
  
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const handleProgress = (state) => {
    if (!isDragging) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (dur) => {
    setDuration(dur);
  };

  const handleSeekChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPlayed = clickX / rect.width;
    setPlayed(newPlayed);
    playerRef.current?.seekTo(newPlayed);
  };

  const handleSeekBack = () => {
    const newTime = Math.max(0, played - 10 / duration);
    setPlayed(newTime);
    playerRef.current?.seekTo(newTime);
  };

  const onExpand = () => {
    setIsMinimized(false);
    navigate('/');
  };

  const onClose = () => {
    selectVideo(null); // Clear video
    setIsMinimized(false);
  };

  // Visible when not on main player route OR when manually minimized
  const isVisible = video && (location.pathname !== '/' || isMinimized);

  const handleSeekForward = () => {
    const newTime = Math.min(1, played + 10 / duration);
    setPlayed(newTime);
    playerRef.current?.seekTo(newTime);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Drag functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.mini-player-controls')) return;
    
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 200;
    
    setCurrentPosition({
      right: Math.max(20, Math.min(maxX, window.innerWidth - newX - 320)),
      bottom: Math.max(20, Math.min(maxY, window.innerHeight - newY - 200))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Sync logic: Resume from global progress if available
  useEffect(() => {
    if (isVisible && playerRef.current && played > 0) {
      setTimeout(() => {
        playerRef.current?.seekTo(played);
      }, 500);
    }
  }, [isVisible, video?.id]);

  if (!isVisible || !video) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 bg-cinema-surface/80 backdrop-blur-3xl rounded-sm shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden transition-all duration-500 hover:border-white/20 ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-[1.02]'
      }`}
      style={{
        right: window.innerWidth < 400 ? '10px' : `${currentPosition.right}px`,
        bottom: window.innerWidth < 400 ? '70px' : `${currentPosition.bottom}px`,
        width: window.innerWidth < 400 ? '280px' : '360px',
        height: window.innerWidth < 400 ? '160px' : '210px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Video Player Engine */}
      <div className="relative w-full h-full group">
        <div className="absolute inset-0 bg-black">
          <ReactPlayer
            ref={playerRef}
            url={video.url}
            width="100%"
            height="100%"
            playing={playing}
            volume={muted ? 0 : volume}
            onProgress={handleProgress}
            onDuration={handleDuration}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0,
                  controls: 0,
                  iv_load_policy: 3
                }
              }
            }}
            className="absolute inset-0"
          />
        </div>

        {/* Cinematic Interface Overlay */}
        <div className="mini-player-controls absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500">
          {/* Header Action Row */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex flex-col -space-y-0.5 min-w-0 mr-4">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cinema-red animate-pulse">Live Mini</span>
              <h4 className="text-[10px] font-bold text-white truncate uppercase tracking-wider">
                {video.title}
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                className="p-1.5 bg-white/10 hover:bg-cinema-red text-white rounded-sm transition-all duration-300"
                title="Expand to Production"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1.5 bg-white/10 hover:bg-cinema-red text-white rounded-sm transition-all duration-300"
                title="Terminate Session"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Central Command */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPlaying(!playing);
              }}
              className="pointer-events-auto w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-2xl transition-all duration-300 hover:scale-110 active:scale-95"
            >
              {playing ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Control Platform */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            {/* Precision Progress */}
            <div className="relative group/progress">
               <div className="flex justify-between items-center mb-1 opacity-0 group-hover/progress:opacity-100 transition-opacity">
                  <span className="text-[8px] font-black text-white tabular-nums">{formatTime(duration * played)}</span>
                  <span className="text-[8px] font-black text-cinema-gray tabular-nums">{formatTime(duration)}</span>
               </div>
               <div 
                className="w-full h-0.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden group-hover/progress:h-1 transition-all"
                onClick={handleSeekChange}
              >
                <div 
                  className="h-full bg-cinema-red shadow-[0_0_10px_rgba(229,9,20,0.8)] transition-all duration-100"
                  style={{ width: `${played * 100}%` }}
                />
              </div>
            </div>

            {/* Bottom Tools */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeekBack();
                  }}
                  className="p-1 text-cinema-gray hover:text-white transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeekForward();
                  }}
                  className="p-1 text-cinema-gray hover:text-white transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted(!muted);
                  }}
                  className={`p-1 transition-colors ${muted ? 'text-cinema-red' : 'text-cinema-gray hover:text-white'}`}
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="text-[10px] font-black text-cinema-gray bg-white/5 px-2 py-0.5 rounded-sm border border-white/5 tabular-nums">
                  {Math.round(played * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
