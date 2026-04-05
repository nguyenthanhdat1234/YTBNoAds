import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Mic } from 'lucide-react';
import { parseYouTubeURL } from '../../utils/youtubeHelpers';

const SearchBar = ({ onSearch, onVideoSelect }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Mock search suggestions and results
  const mockSuggestions = [
    'rick astley',
    'despacito',
    'queen bohemian',
    'music 2024',
    'funny videos',
    'tutorial',
    'gaming highlights',
    'movie trailers'
  ];

  const mockSearchResults = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
      channel: 'Rick Astley',
      views: '1.4B',
      duration: '3:33',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channel: 'Luis Fonsi',
      views: '8.1B',
      duration: '4:42',
      thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
    },
    {
      id: 'fJ9rUzIMcZQ',
      title: 'Queen – Bohemian Rhapsody (Official Video)',
      channel: 'Queen Official',
      views: '1.9B',
      duration: '5:55',
      thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
    }
  ];

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowSuggestions(true); // Show dropdown during search

    // Check if it's a YouTube URL
    const urlParsed = parseYouTubeURL(query);
    if (urlParsed.isValid && urlParsed.type === 'video') {
      if (onVideoSelect) {
        onVideoSelect(query);
        setShowSuggestions(false);
        setSearchQuery('');
        setIsSearching(false);
        return;
      }
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter mock results - make search more flexible
      const filteredResults = mockSearchResults.filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.channel.toLowerCase().includes(query.toLowerCase()) ||
        // Add more search terms for easier testing
        (query.toLowerCase().includes('rick') && video.id === 'dQw4w9WgXcQ') ||
        (query.toLowerCase().includes('music') && video.channel.toLowerCase().includes('luis')) ||
        (query.toLowerCase().includes('queen') && video.channel.toLowerCase().includes('queen')) ||
        (query.toLowerCase().includes('never') && video.id === 'dQw4w9WgXcQ')
      );

      setSearchResults(filteredResults);

      if (onSearch) {
        onSearch(query, filteredResults);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleResultClick = (video) => {
    if (onVideoSelect) {
      onVideoSelect(video.url);
    }
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative flex-1 max-w-2xl mx-4 group">
      {/* Search Input - Cinematic Glass */}
      <div className="relative flex items-center h-10 px-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-sm transition-all duration-300 focus-within:bg-white/10 focus-within:border-white/20 focus-within:shadow-[0_0_20px_rgba(229,9,20,0.1)]">
        <Search className="w-4 h-4 text-cinema-gray mr-3 group-focus-within:text-cinema-red transition-colors" />
        
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(searchQuery.length > 0)}
          placeholder="Search cinematic content..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-cinema-gray/50"
        />

        {searchQuery && (
          <button
            onClick={clearSearch}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5 text-cinema-gray" />
          </button>
        )}
        
        <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-white/10">
          <button className="p-1.5 text-cinema-gray hover:text-white transition-colors">
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Suggestions/Results Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-cinema-surface/95 backdrop-blur-2xl border border-white/10 rounded-sm shadow-2xl z-50 max-h-[70vh] overflow-y-auto hide-scrollbar animate-slide-up">
          {/* Show suggestions when typing but no search performed yet */}
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-cinema-gray px-3 py-2 mb-1">
                Suggestions
              </div>
              {mockSuggestions
                .filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-sm flex items-center space-x-3 transition-colors group"
                  >
                    <Search className="w-3.5 h-3.5 text-cinema-gray group-hover:text-cinema-red transition-colors" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">{suggestion}</span>
                  </button>
                ))
              }
            </div>
          )}

          {/* Show search results when available */}
          {searchResults.length > 0 && !isSearching && (
            <div className="p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-cinema-gray px-3 py-2 mb-2">
                Results ({searchResults.length})
              </div>
              <div className="grid gap-2">
                {searchResults.slice(0, 6).map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleResultClick(video)}
                    className="w-full text-left p-2 hover:bg-white/5 rounded-sm flex items-center space-x-4 transition-all group"
                  >
                    <div className="relative w-24 h-14 flex-shrink-0 overflow-hidden rounded-sm">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${video.id}/default.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-200 group-hover:text-white truncate">
                        {video.title}
                      </h4>
                      <p className="text-[10px] text-cinema-gray uppercase tracking-widest mt-0.5">
                        {video.channel} • {video.views} Views
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-cinema-gray tabular-nums">
                      {video.duration}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-cinema-red border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cinema-gray">Indexing Cinema...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
