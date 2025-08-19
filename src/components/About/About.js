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
      title: t('about.features.noAds'),
      description: 'Stream YouTube videos without any advertisements or interruptions'
    },
    {
      icon: Music,
      title: t('about.features.metadata'),
      description: 'Automatically extract artist, album, and title information from video titles'
    },
    {
      icon: Globe,
      title: t('about.features.multiLanguage'),
      description: 'Support for 14 languages including English, Arabic, Chinese, and more'
    },
    {
      icon: Palette,
      title: t('about.features.themes'),
      description: 'Beautiful dark and light themes with customizable accent colors'
    },
    {
      icon: Zap,
      title: t('about.features.formats'),
      description: 'Support for multiple video and audio formats with quality selection'
    },
    {
      icon: Code,
      title: t('about.features.openSource'),
      description: 'Open source and free to use, built with modern web technologies'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
          <Info className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gradient">
          {t('about.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('about.description')}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="card p-6 space-y-4 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Details */}
      <div className="card p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
          <Code className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <span>Technical Details</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Built With
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>React.js 18 - Modern UI framework</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Tailwind CSS - Utility-first styling</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>React Player - Video streaming</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>i18next - Internationalization</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Supported Languages
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div>🇺🇸 English</div>
              <div>🇸🇦 العربية</div>
              <div>🇨🇳 中文</div>
              <div>🇳🇱 Nederlands</div>
              <div>🇫🇷 Français</div>
              <div>🇩🇪 Deutsch</div>
              <div>🇮🇱 עברית</div>
              <div>🇮🇹 Italiano</div>
              <div>🇵🇱 Polski</div>
              <div>🇧🇷 Português</div>
              <div>🇷🇴 Română</div>
              <div>🇷🇺 Русский</div>
              <div>🇪🇸 Español</div>
              <div>🇹🇷 Türkçe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="card p-6 text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {t('about.credits')}
          </span>
        </div>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <span>{t('about.version')}</span>
          <span>•</span>
          <span>MIT License</span>
          <span>•</span>
          <span>Open Source</span>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This application is not affiliated with YouTube or Google. 
            YouTube is a trademark of Google Inc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
