import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward, RotateCcw, RotateCw } from 'lucide-react';

const MobileResponsiveTest = () => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    setMuted(false);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Mobile Responsive Controls Test</h1>
          <p className="text-gray-300 text-sm">Test video controls trên các kích thước màn hình khác nhau</p>
        </div>

        {/* Screen Size Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs text-center">
          <div className="block xs:hidden bg-red-500 text-white p-2 rounded">
            &lt; 475px (XS)
          </div>
          <div className="hidden xs:block sm:hidden bg-orange-500 text-white p-2 rounded">
            475px+ (XS)
          </div>
          <div className="hidden sm:block md:hidden bg-yellow-500 text-white p-2 rounded">
            640px+ (SM)
          </div>
          <div className="hidden md:block lg:hidden bg-green-500 text-white p-2 rounded">
            768px+ (MD)
          </div>
          <div className="hidden lg:block xl:hidden bg-blue-500 text-white p-2 rounded">
            1024px+ (LG)
          </div>
          <div className="hidden xl:block bg-purple-500 text-white p-2 rounded">
            1280px+ (XL)
          </div>
        </div>

        {/* Test Video Player */}
        <div className="card overflow-hidden">
          <div
            className={`relative bg-black group aspect-video focus:outline-none`}
            onClick={toggleControls}
            tabIndex={0}
          >
            {/* Fake Video Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">📺</div>
                <div className="text-lg">Test Video Player</div>
                <div className="text-sm text-gray-300">Click để toggle controls</div>
              </div>
            </div>

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
              >
                {/* Progress Bar */}
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-mono">2:30</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={0.4}
                    className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white text-sm font-mono">10:00</span>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                  {/* Mobile: First row - Main controls */}
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2 w-full sm:w-auto">
                    {/* Seek Backward 30s - Hidden on very small screens */}
                    <button
                      onClick={() => {}}
                      className="hidden xs:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                      title="Tua lùi 30 giây"
                    >
                      <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </button>

                    {/* Seek Backward 10s */}
                    <button
                      onClick={() => {}}
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
                      onClick={() => {}}
                      className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                      title="Tua tới 10 giây"
                    >
                      <SkipForward className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
                    </button>

                    {/* Seek Forward 30s - Hidden on very small screens */}
                    <button
                      onClick={() => {}}
                      className="hidden xs:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                      title="Tua tới 30 giây"
                    >
                      <RotateCw className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </button>

                    {/* Volume - Hidden on mobile, shown on tablet+ */}
                    <div className="hidden md:flex items-center space-x-2">
                      <button
                        onClick={handleToggleMute}
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
                        onChange={handleVolumeChange}
                        className="w-16 lg:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Mobile: Second row / Desktop: Right side - Secondary controls */}
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {/* Volume button only on mobile */}
                    <button
                      onClick={handleToggleMute}
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
                      <button className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-xs">
                        720p
                      </button>
                    </div>

                    {/* Settings - Hidden on very small screens */}
                    <button
                      onClick={() => {}}
                      className="hidden sm:block p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                    >
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>

                    {/* Fullscreen - Always visible but smaller on mobile */}
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                      title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
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
          </div>
        </div>

        {/* Control States */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Control States:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-300">Playing: <span className="text-white">{playing ? 'Yes' : 'No'}</span></div>
            <div className="text-gray-300">Muted: <span className="text-white">{muted ? 'Yes' : 'No'}</span></div>
            <div className="text-gray-300">Volume: <span className="text-white">{Math.round(volume * 100)}%</span></div>
            <div className="text-gray-300">Fullscreen: <span className="text-white">{isFullscreen ? 'Yes' : 'No'}</span></div>
            <div className="text-gray-300">Controls: <span className="text-white">{showControls ? 'Visible' : 'Hidden'}</span></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/50 p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-2">📱 Test Instructions:</h3>
          <ul className="text-blue-100 text-sm space-y-1">
            <li>• Resize browser window để test responsive breakpoints</li>
            <li>• Trên mobile (&lt;768px): Volume slider ẩn, chỉ có volume button</li>
            <li>• Trên very small (&lt;475px): 30s seek buttons ẩn</li>
            <li>• Trên very small (&lt;640px): Quality và Settings buttons ẩn</li>
            <li>• Fullscreen button luôn hiển thị nhưng nhỏ hơn trên mobile</li>
            <li>• Controls layout: 1 row trên desktop, 2 rows trên mobile</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileResponsiveTest;
