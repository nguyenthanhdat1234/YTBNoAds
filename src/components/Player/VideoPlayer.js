import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  PictureInPicture,
  Monitor,
  Repeat,
  Shuffle,
  Gauge,
  Heart,
  Bell,
  BellOff,
  MessageSquare,
  X
} from 'lucide-react';

import { useSettings } from '../../contexts/SettingsContext';
import { addToWatchHistory, isInFavorites, toggleFavorite } from '../../services/userDataService';
import { isSubscribedToChannel, toggleChannelSubscription } from '../../services/subscriptionService';
import QualitySelector from './QualitySelector';
import toast from 'react-hot-toast';
import { useVideo } from '../../contexts/VideoContext';

const VideoPlayer = ({ video }) => {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // States that are now global-synced
  const { 
    playing, 
    setPlaying, 
    played, 
    setPlayed, 
    duration, 
    setDuration, 
    volume, 
    setVolume, 
    muted, 
    setMuted 
  } = useVideo();

  // Local-only states
  const [showControls, setShowControls] = useState(true);
  const [currentQuality, setCurrentQuality] = useState(settings.quality || 'auto');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [wasPlayingBeforeHidden, setWasPlayingBeforeHidden] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hasAddedToHistory, setHasAddedToHistory] = useState(false);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const originalPlaybackRateRef = useRef(1);

  const isLive = video.isLive || duration === Infinity || duration === 0;

  // Sync logic: Resume from global progress if available
  useEffect(() => {
    if (playerRef.current && played > 0) {
      setTimeout(() => {
        playerRef.current?.seekTo(played);
      }, 500);
    }
  }, [video.id]);

  // Auto-hide controls functions
  const showControlsTemporarily = () => {
    setShowControls(true);

    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Set new timeout to hide controls after 3 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) { // Only hide if video is playing
        setShowControls(false);
      }
    }, 3000);
  };

  const lastToggleTimeRef = useRef(0);

  const handleToggleControls = (e) => {
    // If we are currently fast-forwarding or just finished, don't toggle
    if (isFastForwarding) return;
    
    // If there's an active long press timer that we just cleared, 
    // it means it was a short tap, so we proceed.
    // If the timer was already triggered and cleared, we don't proceed.
    
    // Prevent rapid toggling (debounce)
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 300) return;
    lastToggleTimeRef.current = now;

    // If the click/touch started on an interactive element, ignore it here
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('absolute')) {
      // Buttons etc.
    }

    if (showControls) {
      // If controls are visible, hide them immediately
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(false);
    } else {
      // If controls are hidden, show them temporarily
      showControlsTemporarily();
    }
  };

  const keepControlsVisible = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const hideControlsImmediately = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (playing) {
      setShowControls(false);
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    showControlsTemporarily();
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    setMuted(false);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
  };

  const handleSeekChange = (e) => {
    const seekTo = parseFloat(e.target.value);
    setPlayed(seekTo);
    playerRef.current?.seekTo(seekTo);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleQualityChange = (quality) => {
    setCurrentQuality(quality);

    // Update settings to persist quality choice
    updateSetting('quality', quality);

    // Force player reload with new quality
    if (playerRef.current) {
      const currentTime = duration * played;
      const wasPlaying = playing;

      // Reload player with new quality
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.seekTo(currentTime / duration);
          if (wasPlaying) {
            setPlaying(true);
          }
        }
      }, 100);
    }
  };

  const handleSeekBackward = () => {
    if (playerRef.current) {
      const currentTime = duration * played;
      const newTime = Math.max(0, currentTime - 10); // Tua lùi 10 giây
      playerRef.current.seekTo(newTime / duration);
    }
  };

  const handleSeekForward = () => {
    if (playerRef.current) {
      const currentTime = duration * played;
      const newTime = Math.min(duration, currentTime + 10); // Tua tới 10 giây
      playerRef.current.seekTo(newTime / duration);
    }
  };

  const handleSeekBackward30 = () => {
    if (playerRef.current) {
      const currentTime = duration * played;
      const newTime = Math.max(0, currentTime - 30); // Tua lùi 30 giây
      playerRef.current.seekTo(newTime / duration);
    }
  };

  const handleSeekForward30 = () => {
    if (playerRef.current) {
      const currentTime = duration * played;
      const newTime = Math.min(duration, currentTime + 30); // Tua tới 30 giây
      playerRef.current.seekTo(newTime / duration);
    }
  };

  // Advanced player features
  const handleTheaterMode = () => {
    setTheaterMode(!theaterMode);
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
  };

  const handleLoop = () => {
    setLoop(!loop);
  };

  const handleToggleFavorite = () => {
    if (toggleFavorite(video)) {
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } else {
      toast.error('Failed to update favorites');
    }
  };

  const handleToggleSubscription = () => {
    if (!video.channelId) {
      toast.error('Channel information not available');
      return;
    }

    const channelData = {
      id: video.channelId,
      title: video.channel,
      thumbnail: video.thumbnail, // Use video thumbnail as fallback
      description: `Channel: ${video.channel}`
    };

    if (toggleChannelSubscription(channelData)) {
      setIsSubscribed(!isSubscribed);
      toast.success(isSubscribed ? 'Unsubscribed successfully' : 'Subscribed successfully');
    } else {
      toast.error('Failed to update subscription');
    }
  };

  const longPressTimerRef = useRef(null);

  const handleSpeedBoostStart = (e) => {
    if (isLive) return;

    // We use a timer to distinguish between a tap and a long press
    const rect = playerContainerRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const isRightSide = x > rect.width * 0.6;

    if (isRightSide) {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      
      longPressTimerRef.current = setTimeout(() => {
        originalPlaybackRateRef.current = playbackRate;
        setPlaybackRate(2);
        setIsFastForwarding(true);
        setShowControls(false); // Hide controls for cleaner view during 2x
      }, 500); // 500ms hold to activate 2x
    }
  };

  const handleSpeedBoostEnd = (e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isFastForwarding) {
      setPlaybackRate(originalPlaybackRateRef.current);
      setIsFastForwarding(false);
      // Optional: Prevent the subsequent click event if we were fast forwarding
      if (e) e.preventDefault();
    }
  };

  const handlePictureInPicture = async () => {
    if (!isPiPSupported) return;

    try {
      const videoElement = playerRef.current?.getInternalPlayer();
      if (videoElement && videoElement.requestPictureInPicture) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoElement.requestPictureInPicture();
        }
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
    }
  };

  const handleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      } else if (playerContainerRef.current.webkitRequestFullscreen) {
        playerContainerRef.current.webkitRequestFullscreen();
      } else if (playerContainerRef.current.msRequestFullscreen) {
        playerContainerRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement === playerContainerRef.current ||
        document.webkitFullscreenElement === playerContainerRef.current ||
        document.msFullscreenElement === playerContainerRef.current
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls when video starts playing
  useEffect(() => {
    if (playing) {
      showControlsTemporarily();
    } else {
      keepControlsVisible();
    }
  }, [playing]);

  // Handle Page Visibility API để video tiếp tục phát khi chuyển tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - remember playing state but DON'T pause the video
        setWasPlayingBeforeHidden(playing);
        // Video will continue playing in background
      } else {
        // Tab is visible again - ensure video is still playing if it was before
        if (wasPlayingBeforeHidden) {
          // Force video to continue playing
          setPlaying(true);
          // Also ensure ReactPlayer internal state is correct
          if (playerRef.current) {
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.playVideo === 'function') {
              // For YouTube player
              setTimeout(() => {
                if (internalPlayer.getPlayerState() !== 1) { // 1 = playing
                  internalPlayer.playVideo();
                }
              }, 100);
            }
          }
        }
      }
    };

    // Also handle focus/blur events for additional reliability
    const handleWindowFocus = () => {
      if (wasPlayingBeforeHidden && !playing) {
        setPlaying(true);
      }
    };

    const handleWindowBlur = () => {
      setWasPlayingBeforeHidden(playing);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [playing, wasPlayingBeforeHidden]);

  // Check Picture-in-Picture support
  useEffect(() => {
    setIsPiPSupported('pictureInPictureEnabled' in document);

    const handlePiPChange = () => {
      setIsPiPActive(!!document.pictureInPictureElement);
    };

    document.addEventListener('enterpictureinpicture', handlePiPChange);
    document.addEventListener('leavepictureinpicture', handlePiPChange);

    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiPChange);
      document.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Check if video is in favorites and subscribed to channel when video changes
  useEffect(() => {
    if (video) {
      setIsFavorite(isInFavorites(video.id));
      setIsSubscribed(video.channelId ? isSubscribedToChannel(video.channelId) : false);
      setHasAddedToHistory(false);
    }
  }, [video]);

  // Add to watch history when video starts playing
  useEffect(() => {
    if (playing && video && !hasAddedToHistory) {
      addToWatchHistory(video);
      setHasAddedToHistory(true);
    }
  }, [playing, video, hasAddedToHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle shortcuts when player container is focused or in fullscreen
      if (!playerContainerRef.current || (!isFullscreen && document.activeElement !== playerContainerRef.current)) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeekBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeekForward();
          break;
        case 'j':
          e.preventDefault();
          handleSeekBackward();
          break;
        case 'l':
          e.preventDefault();
          handleSeekForward();
          break;
        case 'f':
          e.preventDefault();
          handleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          handleToggleMute();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [playing, isFullscreen, muted]);

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  // Map quality settings to YouTube quality
  const getYouTubeQuality = (quality) => {
    if (quality === 'auto') return 'auto';

    const qualityMap = {
      '144p': 'tiny',
      '240p': 'small',
      '360p': 'medium',
      '480p': 'large',
      '720p': 'hd720',
      '1080p': 'hd1080',
      '1440p': 'hd1440',
      '2160p': 'hd2160'
    };

    return qualityMap[quality] || 'auto';
  };

  const youtubeQuality = getYouTubeQuality(settings.quality);
  const isHD = ['720p', '1080p', '1440p', '2160p'].includes(settings.quality);

  const playerConfig = {
    youtube: {
      playerVars: {
        autoplay: settings.autoplay ? 1 : 0,
        controls: 0, // We'll use custom controls
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3, // Hide video annotations
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        cc_load_policy: captionsEnabled ? 1 : 0, // Control captions
        hl: 'en', // Interface language
        cc_lang_pref: 'en', // Preferred caption language
        vq: youtubeQuality, // Video quality
        hd: isHD ? 1 : 0,
        // Force quality
        suggestedQuality: youtubeQuality,
        // Prevent auto-pause when tab is hidden
        playsinline: 1
      }
    },
    // Additional config to prevent auto-pause
    file: {
      attributes: {
        crossOrigin: 'anonymous'
      }
    }
  };

  // Create URL with quality parameter for better quality control
  const getVideoUrlWithQuality = (url, quality) => {
    try {
      const urlObj = new URL(url);
      if (quality !== 'auto') {
        urlObj.searchParams.set('vq', youtubeQuality);
        urlObj.searchParams.set('hd', isHD ? '1' : '0');
      }
      return urlObj.toString();
    } catch {
      return url;
    }
  };

  const videoUrlWithQuality = getVideoUrlWithQuality(video.url, settings.quality);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className={`relative flex flex-col lg:flex-row gap-4 ${theaterMode ? 'fixed inset-0 z-40 bg-black pt-16 px-4 pb-4' : 'w-full'}`}>
      <div className={`relative overflow-hidden group shadow-2xl flex-1 ${theaterMode ? 'rounded-none' : 'rounded-sm'}`}>
        <div
          ref={playerContainerRef}
          className={`relative bg-black group focus:outline-none transition-all duration-500 ${
            isFullscreen
              ? 'fixed inset-0 z-50'
              : theaterMode
                ? 'h-full w-full'
                : 'aspect-video'
          }`}
          onMouseEnter={showControlsTemporarily}
          onMouseMove={showControlsTemporarily}
          onMouseLeave={() => {
            hideControlsImmediately();
            handleSpeedBoostEnd();
          }}
          onClick={handleToggleControls}
          onMouseDown={handleSpeedBoostStart}
          onMouseUp={handleSpeedBoostEnd}
          onTouchStart={handleSpeedBoostStart}
          onTouchEnd={(e) => {
            handleSpeedBoostEnd(e);
            handleToggleControls(e);
          }}
          tabIndex={0}
        >
          {/* 2X Speed Indicator */}
          {isFastForwarding && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 animate-pulse pointer-events-none">
              <Gauge className="w-4 h-4 text-cinema-red" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">2X SPEED CONTENT</span>
            </div>
          )}

          {/* React Player Engine */}
          <div className="absolute inset-0 z-0">
            {video.isEmbed ? (
              <iframe
                src={video.embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media"
                className="absolute inset-0 w-full h-full"
                title={video.title}
              />
            ) : (
              <ReactPlayer
                key={`${video.url}-${settings.quality}`}
                ref={playerRef}
                url={videoUrlWithQuality}
                width="100%"
                height="100%"
                playing={playing}
                volume={muted ? 0 : volume}
                playbackRate={playbackRate}
                loop={loop}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onEnded={() => !loop && setPlaying(false)}
                config={playerConfig}
                className="absolute inset-0"
              />
            )}
          </div>

          {/* Cinematic Interface Overlay */}
          <div 
            className={`absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-opacity duration-700 ease-out pointer-events-none ${
              showControls && !video.isEmbed ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Central Play/Pause State Indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
                className="w-14 h-14 md:w-20 md:h-20 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-3xl transition-all duration-500 hover:scale-110 active:scale-95 group/play"
              >
                <div className="absolute inset-0 bg-cinema-red blur-2xl opacity-0 group-hover/play:opacity-20 transition-opacity" />
                {playing ? (
                  <Pause className="w-6 h-6 md:w-8 md:h-8 text-white fill-white" />
                ) : (
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white ml-0.5 md:ml-1" />
                )}
              </button>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6 pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Precision Scrub Bar */}
              <div className="flex flex-col space-y-1 md:space-y-2 group/scrub">
                <div className="flex justify-between items-center opacity-70 md:opacity-0 group-hover/scrub:opacity-100 transition-opacity duration-300">
                  <span className={`text-[10px] md:text-[10px] font-black tracking-widest uppercase tabular-nums ${isLive ? 'text-cinema-red animate-pulse' : 'text-white'}`}>
                    {isLive ? '● LIVE' : formatTime(duration * played)}
                  </span>
                  {!isLive && (
                    <span className="text-[10px] md:text-[10px] font-black tracking-widest text-cinema-gray uppercase tabular-nums">
                      {formatTime(duration)}
                    </span>
                  )}
                </div>
                
                <div className={`relative h-1 w-full bg-white/10 overflow-hidden rounded-full transition-all ${!isLive ? 'cursor-pointer group-hover/scrub:h-1.5' : 'opacity-30'}`}>
                  <div 
                    className={`absolute top-0 left-0 h-full bg-cinema-red shadow-[0_0_10px_rgba(229,9,20,0.8)] z-20 ${isLive ? 'w-full' : ''}`} 
                    style={!isLive ? { width: `${played * 100}%` } : {}}
                  />
                  {!isLive && (
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.001}
                      value={played}
                      onChange={handleSeekChange}
                      className="absolute inset-0 w-full opacity-0 z-30 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              {/* Navigation & Preferences Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 md:space-x-6">
                  {/* Playback Cluster */}
                  <div className="flex items-center -space-x-1 md:space-x-2">
                    {!isLive && (
                      <button onClick={handleSeekBackward} className="p-2 text-cinema-gray hover:text-white transition-colors">
                        <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    )}
                    <button onClick={handlePlayPause} className="p-2 text-white hover:scale-110 transition-all">
                      {playing ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
                    </button>
                    {!isLive && (
                      <button onClick={handleSeekForward} className="p-2 text-cinema-gray hover:text-white transition-colors">
                        <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    )}
                  </div>

                  {/* Audio Cluster - Hidden on mobile to save space, shown on md+ */}
                  <div className="hidden md:flex items-center space-x-4 group/vol">
                    <button onClick={handleToggleMute} className="text-cinema-gray hover:text-white transition-colors">
                      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="w-0 group-hover/vol:w-24 overflow-hidden transition-all duration-500">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Metadata Sneak Peak */}
                  <div className="hidden lg:block border-l border-white/10 pl-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray mb-1 block">
                      {isLive ? <span className="text-cinema-red">LIVE Content</span> : 'Cinema Playback'}
                    </span>
                    <span className="text-xs font-bold text-white max-w-xs truncate block">{video.title}</span>
                  </div>
                </div>

                {/* Advanced Utility Cluster */}
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="scale-75 md:scale-100 origin-right">
                    <QualitySelector
                      currentQuality={currentQuality}
                      onQualityChange={handleQualityChange}
                    />
                  </div>
                  
                  <div className="flex items-center bg-white/5 p-0.5 md:p-1 rounded-sm border border-white/5">
                    <button onClick={handleToggleFavorite} className={`p-1.5 md:p-2 transition-colors ${isFavorite ? 'text-cinema-red' : 'text-cinema-gray hover:text-white'}`}>
                      <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    {isLive && (
                      <button onClick={toggleChat} className={`p-1.5 md:p-2 transition-colors ${showChat ? 'text-cinema-red' : 'text-cinema-gray hover:text-white'}`}>
                        <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    )}
                    <button onClick={handleTheaterMode} className="hidden sm:block p-1.5 md:p-2 text-cinema-gray hover:text-white transition-colors">
                      <Monitor className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                    <button onClick={handleFullscreen} className="p-1.5 md:p-2 text-cinema-gray hover:text-white transition-colors">
                      <Maximize className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Chat Panel */}
        {isLive && showChat && (
          <div className={`bg-cinema-surface border border-white/5 flex flex-col animate-slide-left ${theaterMode ? 'w-full lg:w-96' : 'w-full lg:w-80 rounded-sm overflow-hidden'}`}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Chat</span>
              <button onClick={toggleChat} className="text-cinema-gray hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-[400px] bg-black">
              <iframe
                src={`https://www.youtube.com/live_chat?v=${video.id}&embed_domain=${window.location.hostname}&dark_theme=1`}
                className="w-full h-full border-none"
                title="YouTube Live Chat"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
