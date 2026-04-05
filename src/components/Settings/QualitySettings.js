import React from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, Zap, Eye } from 'lucide-react';
import { getQualityOptions } from '../../utils/youtubeHelpers';

const QualitySettings = ({ settings, updateSetting }) => {
  const { t } = useTranslation();
  const qualityOptions = getQualityOptions();

  const QualityCard = ({ quality, isSelected, onClick }) => {
    const getQualityInfo = (label) => {
      switch (label) {
        case '144p': return { color: 'text-cinema-gray/40', desc: 'DATA CONSERVATION' };
        case '240p': return { color: 'text-cinema-gray/60', desc: 'LOW FIDELITY' };
        case '360p': return { color: 'text-blue-400', desc: 'STANDARD DEFINITION' };
        case '480p': return { color: 'text-blue-500', desc: 'ENHANCED DEFINITION' };
        case '720p': return { color: 'text-green-500', desc: 'HIGH DEFINITION' };
        case '1080p': return { color: 'text-green-600', desc: 'FULL HD RESOLUTION' };
        case '1440p': return { color: 'text-purple-500', desc: 'QHD PRECISION' };
        case '2160p': return { color: 'text-cinema-red', desc: '4K ULTRA FIDELITY' };
        case 'Auto': return { color: 'text-white', desc: 'ADAPTIVE PROTOCOL' };
        default: return { color: 'text-cinema-gray', desc: 'PRODUCTION STANDARD' };
      }
    };

    const info = getQualityInfo(quality.label);

    return (
      <button
        onClick={onClick}
        className={`p-6 rounded-sm border transition-all duration-700 text-left w-full group relative overflow-hidden ${
          isSelected
            ? 'border-cinema-red bg-cinema-red/[0.02] shadow-[0_0_30px_rgba(229,9,20,0.05)]'
            : 'border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xl font-black uppercase tracking-tighter ${info.color} group-hover:scale-105 transition-transform duration-500`}>
            {quality.label}
          </span>
          {isSelected && (
            <div className="w-1.5 h-1.5 bg-cinema-red rounded-full animate-pulse shadow-[0_0_10px_#E50914]" />
          )}
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cinema-gray/40 mb-1">
          {info.desc}
        </p>
        <div className="text-[8px] font-bold text-cinema-gray/20 uppercase tracking-[0.1em] tabular-nums">
          {quality.height === 'adaptive' ? 'DYNAMIC SCALING ACTIVE' : `${quality.height} LINE VERTICAL SCAN`}
        </div>
        {isSelected && (
           <div className="absolute top-0 right-0 w-24 h-24 bg-cinema-red/5 blur-[40px] rounded-full -mr-12 -mt-12" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-12 animate-slide-up">
      {/* Vision Calibration Header */}
      <div className="flex items-center space-x-6 border-b border-white/5 pb-8">
        <div className="p-4 bg-white/[0.02] border border-white/10 rounded-sm">
          <Monitor className="w-6 h-6 text-cinema-red" />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white leading-none mb-3">
            Vision <span className="text-cinema-red">Calibration</span>
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray/40">
            Define global resolution protocol for all production streams.
          </p>
        </div>
      </div>

      {/* Adaptive Protocol Activation */}
      <div className="max-w-md">
        <QualityCard
          quality={{ label: 'Auto', height: 'adaptive' }}
          isSelected={settings.quality === 'auto'}
          onClick={() => updateSetting('quality', 'auto')}
        />
      </div>

      {/* Fixed Definition Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {qualityOptions.slice().reverse().map((quality) => (
          <QualityCard
            key={quality.label}
            quality={quality}
            isSelected={settings.quality === quality.label}
            onClick={() => updateSetting('quality', quality.label)}
          />
        ))}
      </div>

      {/* Logic Overrides */}
      <div className="space-y-8 pt-12 border-t border-white/5">
        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-cinema-gray mb-8">System Overrides</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm group-hover:border-cinema-red transition-colors">
                <Zap className="w-4 h-4 text-cinema-gray/40 group-hover:text-cinema-red transition-colors" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-cinema-gray/60 group-hover:text-white transition-colors">
                  Frame Rate Priority
                </label>
                <p className="text-[9px] font-medium text-cinema-gray/30 uppercase tracking-widest mt-1">
                  Enforce maximum temporal resolution (FPS) regardless of bit-budget.
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('preferHighestFPS', !settings.preferHighestFPS)}
              className={`relative inline-flex h-6 w-12 items-center rounded-sm transition-all duration-500 ${
                settings.preferHighestFPS ? 'bg-cinema-red' : 'bg-white/10'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-sm bg-white transition-all duration-500 ${
                settings.preferHighestFPS ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm group-hover:border-cinema-red transition-colors">
                <Eye className="w-4 h-4 text-cinema-gray/40 group-hover:text-cinema-red transition-colors" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-cinema-gray/60 group-hover:text-white transition-colors">
                  Fidelity Bias
                </label>
                <p className="text-[9px] font-medium text-cinema-gray/30 uppercase tracking-widest mt-1">
                  Prioritize spatial resolution over temporal buffering speed.
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('preferQuality', !settings.preferQuality)}
              className={`relative inline-flex h-6 w-12 items-center rounded-sm transition-all duration-500 ${
                settings.preferQuality ? 'bg-cinema-red' : 'bg-white/10'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-sm bg-white transition-all duration-500 ${
                settings.preferQuality ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Logic Alert Panel */}
      <div className="relative group overflow-hidden bg-cinema-gray/[0.02] border border-white/5 rounded-sm p-8">
        <div className="absolute top-0 left-0 w-1 h-full bg-cinema-gray/20" />
        <div className="flex items-start space-x-6">
          <Monitor className="w-5 h-5 text-cinema-gray/20 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-gray/60">
              Protocol Impact Report
            </h4>
            <p className="text-[9px] font-medium text-cinema-gray/40 uppercase tracking-[0.2em] leading-relaxed">
              Extended definitions require high-bandwidth neural connection protocols. Adaptive definitions (Auto) will dynamically adjust to maintain persistent production uptime based on network frequency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualitySettings;
