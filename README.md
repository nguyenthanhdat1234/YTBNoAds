# YouTube Web Player

A modern web application for streaming YouTube videos without advertisements, featuring automatic metadata extraction and multi-language support.

## ✨ Features

- **🚫 Ad-Free Streaming**: Watch YouTube videos without any advertisements or interruptions
- **🎵 Metadata Extraction**: Automatically extract artist, album, and title information from video titles
- **📋 Playlist Management**: Create and manage custom playlists with auto-play, shuffle, and repeat
- **🖥️ Fullscreen Support**: Immersive fullscreen video experience with custom controls
- **📺 Enhanced Video Info**: Detailed video information including views, likes, description, and channel data
- **🎛️ Quality Control**: Multiple quality selection options from 144p to 4K with auto-adaptive streaming
- **🌍 Multi-Language Support**: Support for 14 languages including English, Arabic, Chinese, Dutch, French, German, Hebrew, Italian, Polish, Portuguese, Romanian, Russian, Spanish, and Turkish
- **🎨 Beautiful Themes**: Dark and light themes with customizable accent colors
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **⚡ Modern Tech Stack**: Built with React.js, Tailwind CSS, and modern web technologies
- **🔧 Customizable Settings**: Adjust video quality, audio settings, captions, and interface preferences
- **🎯 URL Support**: Support for YouTube videos, playlists, channels, and user URLs
- **🚫 No Annotations**: Automatically removes video annotations and unwanted overlays

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd youtube-web-player
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🎯 Usage

1. **Enter YouTube URL**: Paste any YouTube video, playlist, or channel URL in the input field
2. **Start Streaming**: Click the "Play" button to start streaming the video without ads
3. **Customize Settings**: Access the settings page to adjust video quality, themes, and other preferences
4. **Enjoy Metadata**: View automatically extracted metadata including artist, album, and genre information

### Supported URL Formats

- **Single video**: `youtube.com/watch?v=VIDEO_ID`
- **Playlist**: `youtube.com/playlist?list=PLAYLIST_ID`
- **Channel**: `youtube.com/channel/CHANNEL_ID`
- **User channel**: `youtube.com/user/USERNAME`
- **Handle**: `youtube.com/@HANDLE`

## 🛠️ Technology Stack

- **Frontend**: React.js 18
- **Styling**: Tailwind CSS
- **Video Player**: React Player
- **Internationalization**: i18next
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 🌐 Supported Languages

- 🇺🇸 English
- 🇸🇦 العربية (Arabic)
- 🇨🇳 中文 (Chinese)
- 🇳🇱 Nederlands (Dutch)
- 🇫🇷 Français (French)
- 🇩🇪 Deutsch (German)
- 🇮🇱 עברית (Hebrew)
- 🇮🇹 Italiano (Italian)
- 🇵🇱 Polski (Polish)
- 🇧🇷 Português (Portuguese)
- 🇷🇴 Română (Romanian)
- 🇷🇺 Русский (Russian)
- 🇪🇸 Español (Spanish)
- 🇹🇷 Türkçe (Turkish)

## ⚙️ Configuration

The application supports various configuration options through the settings panel:

### Video Settings
- Default video quality (144p to 4320p)
- Autoplay functionality
- Highest FPS preference

### Audio Settings
- Audio-only mode
- Audio bitrate selection (128-320 kbps)

### Interface Settings
- Theme selection (Light/Dark)
- Language selection
- Accent color customization

### Advanced Settings
- Metadata extraction toggle
- Filename pattern customization
- Settings reset functionality

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Header/         # Navigation and header components
│   ├── Player/         # Video player and related components
│   ├── Settings/       # Settings page components
│   ├── About/          # About page components
│   └── UI/             # Reusable UI components
├── contexts/           # React contexts for state management
├── i18n/              # Internationalization files
│   └── locales/       # Translation files
├── utils/             # Utility functions
│   ├── youtubeHelpers.js    # YouTube URL parsing
│   └── metadataExtractor.js # Metadata extraction logic
└── App.js             # Main application component
```

### Adding New Languages

1. Create a new translation file in `src/i18n/locales/[language-code].json`
2. Add the language to the imports in `src/i18n/i18n.js`
3. Update the language selector in `src/components/Header/LanguageSelector.js`

### Customizing Themes

Themes are managed through Tailwind CSS classes and the ThemeContext. To add new themes:

1. Update the theme configuration in `src/contexts/ThemeContext.js`
2. Add corresponding CSS classes in `src/index.css`
3. Update the theme selector in the settings component

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Based on the original YouTube Playlist Downloader application, reimagined as a modern web streaming platform.

## ⚠️ Disclaimer

This application is not affiliated with YouTube or Google. YouTube is a trademark of Google Inc. This tool is for educational and personal use only. Please respect YouTube's Terms of Service and copyright laws.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
