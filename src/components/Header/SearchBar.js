import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Mic } from 'lucide-react';

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
    <div className="relative flex-1 max-w-2xl mx-4">
      {/* Search Input */}
      <div className="relative">
        <div className="flex">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              placeholder="Search YouTube videos..."
              className="w-full px-4 py-2 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-l-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            
            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
          
          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-full transition-colors duration-200 disabled:opacity-50"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Mic Button */}
          <button className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200">
            <Mic className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Search Suggestions/Results Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Show suggestions when typing but no search performed yet */}
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 font-medium">
                Search suggestions
              </div>
              {mockSuggestions
                .filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-3 transition-colors duration-200"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{suggestion}</span>
                  </button>
                ))
              }
              {/* Show all suggestions if no match */}
              {mockSuggestions.filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                mockSuggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-3 transition-colors duration-200"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{suggestion}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Show search results when available */}
          {searchResults.length > 0 && !isSearching && (
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 font-medium">
                Search results ({searchResults.length} found)
              </div>
              {searchResults.slice(0, 5).map((video) => (
                <button
                  key={video.id}
                  onClick={() => handleResultClick(video)}
                  className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-3 transition-colors duration-200"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${video.id}/default.jpg`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {video.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {video.channel}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {video.views} views
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {video.duration}
                  </div>
                </button>
              ))}
            </div>
          )}

          {isSearching && (
            <div className="p-4 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Searching...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
