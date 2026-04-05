import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Info, 
  Star, 
  Github, 
  Heart, 
  Zap,
  Globe,
  Palette,
  Music,
  Shield,
  Code
} from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      title: t('about.features.noAds') || 'Zero Frequency Interruption',
      description: 'Experience a pure signal without commercials, sponsors, or transmission breaks.'
    },
    {
      icon: Music,
      title: t('about.features.metadata') || 'Neural Asset Extraction',
      description: 'Automated identification of sonic properties and high-fidelity archival data.'
    },
    {
      icon: Globe,
      title: t('about.features.multiLanguage') || 'Global Protocol Support',
      description: 'Multi-lingual interfaces synchronized across 14 international frequency sectors.'
    },
    {
      icon: Palette,
      title: t('about.features.themes') || 'Aesthetic Calibration',
      description: 'Bespoke chromatic profiles including Cinema Noir and Production Glassmorphism.'
    },
    {
      icon: Zap,
      title: t('about.features.formats') || 'Format Versatility',
      description: 'Support for a broad spectrum of visual and sonic output resolutions up to 8K.'
    },
    {
      icon: Code,
      title: t('about.features.openSource') || 'Open Access Genesis',
      description: 'Open source architecture designed for transparency and community innovation.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-12 px-6 animate-fade-in relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cinema-red/5 blur-[150px] -z-10 rounded-full" />
      
      {/* Editorial Production Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-cinema-red/10 border border-cinema-red/20 rounded-full animate-bounce-subtle">
           <Info className="w-3.5 h-3.5 text-cinema-red" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-red">Project Manifest</span>
        </div>
        <h1 className="text-6xl font-black uppercase tracking-tighter italic text-white flex flex-col sm:flex-row items-center justify-center sm:space-x-4">
          <span className="text-cinema-red">Cinema</span>
          <span className="opacity-20">//</span>
          <span>Flow</span>
        </h1>
        <p className="text-sm font-medium text-cinema-gray max-w-2xl mx-auto uppercase tracking-widest leading-relaxed opacity-60">
          {t('about.description') || 'A precision-engineered audiovisual environment for uninhibited transmission and discovery.'}
        </p>
      </div>

      {/* Production Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="group glass-card bg-cinema-surface/30 p-8 border border-white/5 rounded-sm hover:border-cinema-red/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500"
          >
            <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-sm flex items-center justify-center mb-6 group-hover:bg-cinema-red/10 group-hover:border-cinema-red/20 transition-colors">
              <feature.icon className="w-6 h-6 text-cinema-gray group-hover:text-cinema-red transition-colors duration-500" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] group-hover:text-cinema-red transition-colors">
                {feature.title}
              </h3>
              <p className="text-[11px] font-medium text-cinema-gray/60 uppercase tracking-widest leading-loose">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Blueprint Integration */}
      <div className="glass-card bg-cinema-surface/50 p-10 border border-white/5 rounded-sm space-y-10">
        <div className="flex items-center space-x-6 pb-6 border-b border-white/5">
          <div className="p-3 bg-cinema-red/10 border border-cinema-red/20 rounded-sm">
            <Code className="w-6 h-6 text-cinema-red" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white">System Architecture</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-red">Tech Stack Protocol</h3>
            <div className="space-y-4">
              {[
                { label: 'React.js 18', detail: 'High-Frequency Composition', color: 'bg-blue-500' },
                { label: 'Tailwind CSS', detail: 'Utility-Scale Visual Engine', color: 'bg-cyan-500' },
                { label: 'React Player', detail: 'Transmission Multi-Link', color: 'bg-green-500' },
                { label: 'i18next', detail: 'Universal Signal Translator', color: 'bg-purple-500' }
              ].map((tech, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-sm group hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-1 h-4 ${tech.color} rounded-full`} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{tech.label}</span>
                  </div>
                  <span className="text-[8px] font-bold text-cinema-gray/40 uppercase tracking-[0.2em]">{tech.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-red">Broadcast Regions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                'English', 'العربية', '中文', 'Nederlands', 'Français', 
                'Deutsch', 'עברית', 'Italiano', 'Polski', 'Português', 
                'Română', 'Русский', 'Español', 'Türkçe'
              ].map((lang, i) => (
                <div key={i} className="px-3 py-2 bg-white/2 border border-white/5 rounded-sm text-[9px] font-black text-cinema-gray/60 uppercase tracking-tighter hover:text-white hover:border-white/20 transition-all cursor-default">
                  {lang}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Production Signature */}
      <div className="glass-card bg-cinema-surface/20 p-10 border border-white/5 rounded-sm text-center space-y-8">
        <div className="flex items-center justify-center space-x-4 text-[10px] font-black text-cinema-gray uppercase tracking-[0.5em]">
          <Heart className="w-4 h-4 text-cinema-red animate-pulse-fast fill-cinema-red" />
          <span>ENGINEERED WITH PASSION FOR PRODUCTION</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
          <span className="hover:text-cinema-red cursor-default transition-colors">{t('about.version') || 'FINAL BUILD 1.0.4'}</span>
          <span className="text-white/5">•</span>
          <span className="hover:text-cinema-red cursor-default transition-colors">MIT LICENSE</span>
          <span className="text-white/5">•</span>
          <span className="hover:text-cinema-red cursor-default transition-colors">OPEN SOURCE ASSET</span>
        </div>

        <div className="pt-8 border-t border-white/5 max-w-2xl mx-auto">
          <p className="text-[9px] font-medium text-cinema-gray/30 uppercase tracking-widest leading-loose">
            Cinematic Transmission Engine is an independent production. No affiliation with frequency providers Google Inc. or YouTube. All identifiers registered trademarks of their respective sectors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
