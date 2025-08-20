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
  BellOff
} from 'lucide-react';

import { useSettings } from '../../contexts/SettingsContext';
import { addToWatchHistory, isInFavorites, toggleFavorite } from '../../services/userDataService';
import { isSubscribedToChannel, toggleChannelSubscription } from '../../services/subscriptionService';
import QualitySelector from './QualitySelector';
import toast from 'react-hot-toast';

const VideoPlayer = ({ video }) => {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const playerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [currentQuality, setCurrentQuality] = useState(settings.quality || 'auto');
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [wasPlayingBeforeHidden, setWasPlayingBeforeHidden] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasAddedToHistory, setHasAddedToHistory] = useState(false);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

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

  const toggleControls = () => {
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

  return (
    <div className={`card overflow-hidden ${theaterMode ? 'fixed inset-x-0 top-0 z-40 rounded-none' : ''}`}>
      <div
        ref={playerContainerRef}
        className={`relative bg-black group focus:outline-none ${
          isFullscreen
            ? 'fixed inset-0 z-50'
            : theaterMode
              ? 'h-screen w-full'
              : 'aspect-video'
        }`}
        onMouseEnter={keepControlsVisible}
        onMouseLeave={hideControlsImmediately}
        onTouchStart={toggleControls}
        onClick={toggleControls}
        tabIndex={0}
      >
        {/* React Player */}
        <ReactPlayer
          key={`${video.url}-${settings.quality}`} // Force re-render when quality changes
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
          onEnded={() => {
            if (!loop) {
              setPlaying(false);
            }
          }}
          config={playerConfig}
          className="absolute inset-0"
        />

        {/* Custom Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110"
            >
              {playing ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div
            className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-mono">
                {formatTime(duration * played)}
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={played}
                onChange={(e) => {
                  handleSeekChange(e);
                  showControlsTemporarily();
                }}
                onTouchStart={showControlsTemporarily}
                className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-sm font-mono">
                {formatTime(duration)}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              {/* Mobile: First row - Main controls */}
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 w-full sm:w-auto">
                {/* Seek Backward 30s - Hidden on very small screens */}
                <button
                  onClick={() => {
                    handleSeekBackward30();
                    showControlsTemporarily();
                  }}
                  className="hidden xs:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  title="Tua lùi 30 giây"
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </button>

                {/* Seek Backward 10s */}
                <button
                  onClick={() => {
                    handleSeekBackward();
                    showControlsTemporarily();
                  }}
                  className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  title="Tua lùi 10 giây"
                >
                  <SkipBack className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  {playing ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* Seek Forward 10s */}
                <button
                  onClick={() => {
                    handleSeekForward();
                    showControlsTemporarily();
                  }}
                  className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  title="Tua tới 10 giây"
                >
                  <SkipForward className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
                </button>

                {/* Seek Forward 30s - Hidden on very small screens */}
                <button
                  onClick={() => {
                    handleSeekForward30();
                    showControlsTemporarily();
                  }}
                  className="hidden xs:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  title="Tua tới 30 giây"
                >
                  <RotateCw className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </button>

                {/* Volume - Hidden on mobile, shown on tablet+ */}
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    onClick={() => {
                      handleToggleMute();
                      showControlsTemporarily();
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      handleVolumeChange(e);
                      showControlsTemporarily();
                    }}
                    onTouchStart={showControlsTemporarily}
                    className="w-16 lg:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Mobile: Second row / Desktop: Right side - Secondary controls */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Volume button only on mobile */}
                <button
                  onClick={() => {
                    handleToggleMute();
                    showControlsTemporarily();
                  }}
                  className="md:hidden p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Quality Selector - Hidden on very small screens */}
                <div className="hidden sm:block">
                  <QualitySelector
                    currentQuality={currentQuality}
                    onQualityChange={handleQualityChange}
                  />
                </div>

                {/* Subscribe - Hidden on very small screens */}
                {video.channelId && (
                  <button
                    onClick={() => {
                      handleToggleSubscription();
                      showControlsTemporarily();
                    }}
                    className="hidden sm:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                    title={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                  >
                    {isSubscribed ? (
                      <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    ) : (
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </button>
                )}

                {/* Favorite - Hidden on very small screens */}
                <button
                  onClick={() => {
                    handleToggleFavorite();
                    showControlsTemporarily();
                  }}
                  className="hidden sm:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} />
                </button>

                {/* Settings - Hidden on very small screens */}
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    showControlsTemporarily();
                  }}
                  className="hidden sm:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>

                {/* Picture-in-Picture - Hidden on mobile */}
                {isPiPSupported && (
                  <button
                    onClick={() => {
                      handlePictureInPicture();
                      showControlsTemporarily();
                    }}
                    className="hidden sm:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                    title={isPiPActive ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}
                  >
                    <PictureInPicture className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${isPiPActive ? 'text-primary-400' : ''}`} />
                  </button>
                )}

                {/* Theater Mode - Hidden on mobile */}
                <button
                  onClick={() => {
                    handleTheaterMode();
                    showControlsTemporarily();
                  }}
                  className="hidden md:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  title={theaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
                >
                  <Monitor className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${theaterMode ? 'text-primary-400' : ''}`} />
                </button>

                {/* Fullscreen - Always visible but smaller on mobile */}
                <button
                  onClick={() => {
                    handleFullscreen();
                    showControlsTemporarily();
                  }}
                  className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  title={isFullscreen ? t('player.controls.exitFullscreen') : t('player.controls.fullscreen')}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute bottom-16 right-4 w-72 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 p-4 space-y-3">
            <h3 className="text-white font-medium text-sm mb-3">{t('player.settings.title')}</h3>

            {/* Quality Setting */}
            <div className="space-y-2">
              <label className="text-gray-300 text-xs">{t('player.settings.quality')}</label>
              <QualitySelector
                currentQuality={currentQuality}
                onQualityChange={handleQualityChange}
              />
            </div>

            {/* Autoplay Setting */}
            <div className="flex items-center justify-between">
              <label className="text-gray-300 text-xs">{t('player.settings.autoplay')}</label>
              <button
                onClick={() => {/* Handle autoplay toggle */}}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                  settings.autoplay ? 'bg-primary-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                    settings.autoplay ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Captions Setting */}
            <div className="flex items-center justify-between">
              <label className="text-gray-300 text-xs">{t('player.settings.captions')}</label>
              <button
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                  captionsEnabled ? 'bg-primary-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                    captionsEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Playback Speed */}
            <div className="space-y-2">
              <label className="text-gray-300 text-xs flex items-center space-x-1">
                <Gauge className="w-3 h-3" />
                <span>Playback Speed</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                      playbackRate === rate
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Loop Setting */}
            <div className="flex items-center justify-between">
              <label className="text-gray-300 text-xs flex items-center space-x-1">
                <Repeat className="w-3 h-3" />
                <span>Loop Video</span>
              </label>
              <button
                onClick={handleLoop}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                  loop ? 'bg-primary-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                    loop ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="pt-3 border-t border-gray-700">
              <h4 className="text-gray-300 text-xs font-medium mb-2">Keyboard Shortcuts</h4>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Play/Pause</span>
                  <span className="font-mono">Space, K</span>
                </div>
                <div className="flex justify-between">
                  <span>Seek ±10s</span>
                  <span className="font-mono">← → J L</span>
                </div>
                <div className="flex justify-between">
                  <span>Fullscreen</span>
                  <span className="font-mono">F</span>
                </div>
                <div className="flex justify-between">
                  <span>Mute</span>
                  <span className="font-mono">M</span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors duration-200"
            >
              {t('player.settings.close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
