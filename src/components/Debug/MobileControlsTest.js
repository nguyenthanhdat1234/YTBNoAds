import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const MobileControlsTest = () => {
  const [showControls, setShowControls] = useState(true);
  const [playing, setPlaying] = useState(false);
  const controlsTimeoutRef = useRef(null);

  const showControlsTemporarily = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
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

  useEffect(() => {
    if (playing) {
      showControlsTemporarily();
    } else {
      keepControlsVisible();
    }
  }, [playing]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mobile Controls Test</h2>
      
      <div
        className="relative bg-black aspect-video rounded-lg overflow-hidden"
        onMouseEnter={keepControlsVisible}
        onMouseLeave={hideControlsImmediately}
        onTouchStart={toggleControls}
        onClick={toggleControls}
      >
        {/* Fake video content */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-white text-center">
            <h3 className="text-xl font-bold mb-2">Test Video Player</h3>
            <p className="text-sm opacity-75">
              {playing ? 'Playing...' : 'Paused'}
            </p>
          </div>
        </div>

        {/* Controls Overlay */}
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
            className="absolute bottom-0 left-0 right-0 p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-mono">0:00</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={0.3}
                onChange={showControlsTemporarily}
                onTouchStart={showControlsTemporarily}
                className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-sm font-mono">3:45</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
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

                <button
                  onClick={showControlsTemporarily}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="text-white text-sm">
                Controls: {showControls ? 'Visible' : 'Hidden'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">Test Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>Desktop:</strong> Hover to show controls, move mouse away to hide</li>
          <li>• <strong>Mobile/Tablet:</strong> Tap to toggle controls (show/hide)</li>
          <li>• <strong>First tap:</strong> Shows controls for 3 seconds</li>
          <li>• <strong>Second tap:</strong> Hides controls immediately</li>
          <li>• <strong>Playing:</strong> Controls auto-hide after 3 seconds when playing</li>
          <li>• <strong>Paused:</strong> Controls stay visible when paused</li>
          <li>• <strong>Button clicks:</strong> Reset the 3-second timer</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileControlsTest;
