import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
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

const MiniPlayer = ({ 
  video, 
  isVisible, 
  onClose, 
  onExpand, 
  position = { bottom: 20, right: 20 } 
}) => {
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);
  
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleProgress = (state) => {
    if (!isDragging) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
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

  if (!isVisible || !video) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        right: `${currentPosition.right}px`,
        bottom: `${currentPosition.bottom}px`,
        width: '320px',
        height: '200px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Video Player */}
      <div className="relative w-full h-full">
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
                controls: 0
              }
            }
          }}
          className="absolute inset-0"
        />

        {/* Overlay Controls */}
        <div className="mini-player-controls absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between">
            <div className="text-white text-xs font-medium truncate flex-1 mr-2">
              {video.title}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                className="p-1 text-white hover:bg-white/20 rounded transition-colors duration-200"
                title="Expand to full player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 text-white hover:bg-white/20 rounded transition-colors duration-200"
                title="Close mini player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Play/Pause */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPlaying(!playing);
              }}
              className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
            >
              {playing ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
            {/* Progress Bar */}
            <div 
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
              onClick={handleSeekChange}
            >
              <div 
                className="h-full bg-red-600 rounded-full transition-all duration-100"
                style={{ width: `${played * 100}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeekBack();
                  }}
                  className="p-1 text-white hover:bg-white/20 rounded transition-colors duration-200"
                  title="Rewind 10s"
                >
                  <SkipBack className="w-3 h-3" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeekForward();
                  }}
                  className="p-1 text-white hover:bg-white/20 rounded transition-colors duration-200"
                  title="Forward 10s"
                >
                  <SkipForward className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted(!muted);
                  }}
                  className="p-1 text-white hover:bg-white/20 rounded transition-colors duration-200"
                >
                  {muted ? (
                    <VolumeX className="w-3 h-3" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </button>

                <div className="text-white text-xs">
                  {formatTime(duration * played)} / {formatTime(duration)}
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
