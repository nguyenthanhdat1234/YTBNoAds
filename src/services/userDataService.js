/**
 * User Data Service
 * Manages watch history, favorites, and user preferences
 */

const STORAGE_KEYS = {
  WATCH_HISTORY: 'ytb_watch_history',
  FAVORITES: 'ytb_favorites',
  USER_PREFERENCES: 'ytb_user_preferences'
};

const MAX_HISTORY_ITEMS = 100; // Limit history to prevent storage bloat

/**
 * Get data from localStorage with error handling
 */
const getStorageData = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Set data to localStorage with error handling
 */
const setStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

/**
 * Normalize video data for consistent storage
 */
const normalizeVideoData = (video) => {
  return {
    id: video.id,
    url: video.url,
    title: video.title,
    description: video.description?.substring(0, 200) || '', // Limit description length
    thumbnail: video.thumbnail,
    channel: video.channel,
    channelId: video.channelId,
    duration: video.duration,
    viewCount: video.viewCount,
    publishedAt: video.publishedAt,
    addedAt: new Date().toISOString()
  };
};

// ==================== WATCH HISTORY ====================

/**
 * Get watch history
 */
export const getWatchHistory = () => {
  const history = getStorageData(STORAGE_KEYS.WATCH_HISTORY, []);
  // Sort by most recent first
  return history.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
};

/**
 * Add video to watch history
 */
export const addToWatchHistory = (video) => {
  const history = getStorageData(STORAGE_KEYS.WATCH_HISTORY, []);
  const normalizedVideo = normalizeVideoData(video);
  
  // Remove existing entry if it exists
  const filteredHistory = history.filter(item => item.id !== video.id);
  
  // Add new entry at the beginning
  const newHistory = [{
    ...normalizedVideo,
    watchedAt: new Date().toISOString(),
    watchCount: (history.find(item => item.id === video.id)?.watchCount || 0) + 1
  }, ...filteredHistory];
  
  // Limit history size
  const limitedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
  
  return setStorageData(STORAGE_KEYS.WATCH_HISTORY, limitedHistory);
};

/**
 * Remove video from watch history
 */
export const removeFromWatchHistory = (videoId) => {
  const history = getStorageData(STORAGE_KEYS.WATCH_HISTORY, []);
  const filteredHistory = history.filter(item => item.id !== videoId);
  return setStorageData(STORAGE_KEYS.WATCH_HISTORY, filteredHistory);
};

/**
 * Clear all watch history
 */
export const clearWatchHistory = () => {
  return setStorageData(STORAGE_KEYS.WATCH_HISTORY, []);
};

/**
 * Get watch history statistics
 */
export const getWatchHistoryStats = () => {
  const history = getWatchHistory();
  
  const totalVideos = history.length;
  const totalWatchTime = history.reduce((total, video) => {
    if (video.duration) {
      // Parse ISO 8601 duration (PT1H2M3S) to seconds
      const match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        return total + (hours * 3600 + minutes * 60 + seconds);
      }
    }
    return total;
  }, 0);
  
  const uniqueChannels = new Set(history.map(video => video.channelId)).size;
  const mostWatchedChannel = history.reduce((acc, video) => {
    acc[video.channel] = (acc[video.channel] || 0) + 1;
    return acc;
  }, {});
  
  const topChannel = Object.entries(mostWatchedChannel)
    .sort(([,a], [,b]) => b - a)[0];
  
  return {
    totalVideos,
    totalWatchTime, // in seconds
    uniqueChannels,
    topChannel: topChannel ? { name: topChannel[0], count: topChannel[1] } : null,
    recentActivity: history.slice(0, 5)
  };
};

// ==================== FAVORITES ====================

/**
 * Get favorites list
 */
export const getFavorites = () => {
  const favorites = getStorageData(STORAGE_KEYS.FAVORITES, []);
  // Sort by most recent first
  return favorites.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
};

/**
 * Add video to favorites
 */
export const addToFavorites = (video) => {
  const favorites = getStorageData(STORAGE_KEYS.FAVORITES, []);
  const normalizedVideo = normalizeVideoData(video);
  
  // Check if already in favorites
  if (favorites.some(item => item.id === video.id)) {
    return false; // Already in favorites
  }
  
  const newFavorites = [normalizedVideo, ...favorites];
  return setStorageData(STORAGE_KEYS.FAVORITES, newFavorites);
};

/**
 * Remove video from favorites
 */
export const removeFromFavorites = (videoId) => {
  const favorites = getStorageData(STORAGE_KEYS.FAVORITES, []);
  const filteredFavorites = favorites.filter(item => item.id !== videoId);
  return setStorageData(STORAGE_KEYS.FAVORITES, filteredFavorites);
};

/**
 * Check if video is in favorites
 */
export const isInFavorites = (videoId) => {
  const favorites = getStorageData(STORAGE_KEYS.FAVORITES, []);
  return favorites.some(item => item.id === videoId);
};

/**
 * Toggle video in favorites
 */
export const toggleFavorite = (video) => {
  if (isInFavorites(video.id)) {
    return removeFromFavorites(video.id);
  } else {
    return addToFavorites(video);
  }
};

/**
 * Clear all favorites
 */
export const clearFavorites = () => {
  return setStorageData(STORAGE_KEYS.FAVORITES, []);
};

// ==================== USER PREFERENCES ====================

/**
 * Get user preferences
 */
export const getUserPreferences = () => {
  return getStorageData(STORAGE_KEYS.USER_PREFERENCES, {
    autoAddToHistory: true,
    historyRetentionDays: 30,
    favoritesSyncEnabled: false,
    showWatchProgress: true,
    defaultVideoQuality: 'auto'
  });
};

/**
 * Update user preferences
 */
export const updateUserPreferences = (preferences) => {
  const currentPrefs = getUserPreferences();
  const newPrefs = { ...currentPrefs, ...preferences };
  return setStorageData(STORAGE_KEYS.USER_PREFERENCES, newPrefs);
};

// ==================== SEARCH HISTORY ====================

/**
 * Get search history
 */
export const getSearchHistory = () => {
  const prefs = getUserPreferences();
  if (!prefs.saveSearchHistory) return [];
  
  return getStorageData('ytb_search_history', [])
    .sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt))
    .slice(0, 20); // Limit to 20 recent searches
};

/**
 * Add search query to history
 */
export const addToSearchHistory = (query) => {
  const prefs = getUserPreferences();
  if (!prefs.saveSearchHistory || !query.trim()) return false;
  
  const searchHistory = getStorageData('ytb_search_history', []);
  
  // Remove existing entry if it exists
  const filteredHistory = searchHistory.filter(item => 
    item.query.toLowerCase() !== query.toLowerCase()
  );
  
  // Add new entry at the beginning
  const newHistory = [{
    query: query.trim(),
    searchedAt: new Date().toISOString()
  }, ...filteredHistory];
  
  // Limit to 20 items
  const limitedHistory = newHistory.slice(0, 20);
  
  return setStorageData('ytb_search_history', limitedHistory);
};

/**
 * Clear search history
 */
export const clearSearchHistory = () => {
  return setStorageData('ytb_search_history', []);
};

// ==================== DATA EXPORT/IMPORT ====================

/**
 * Export all user data
 */
export const exportUserData = () => {
  return {
    watchHistory: getWatchHistory(),
    favorites: getFavorites(),
    preferences: getUserPreferences(),
    searchHistory: getSearchHistory(),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
};

/**
 * Import user data
 */
export const importUserData = (data) => {
  try {
    if (data.watchHistory) {
      setStorageData(STORAGE_KEYS.WATCH_HISTORY, data.watchHistory);
    }
    if (data.favorites) {
      setStorageData(STORAGE_KEYS.FAVORITES, data.favorites);
    }
    if (data.preferences) {
      setStorageData(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
    }
    if (data.searchHistory) {
      setStorageData('ytb_search_history', data.searchHistory);
    }
    return true;
  } catch (error) {
    console.error('Error importing user data:', error);
    return false;
  }
};

// ==================== CLEANUP UTILITIES ====================

/**
 * Clean up old data based on retention settings
 */
export const cleanupOldData = () => {
  const prefs = getUserPreferences();
  const retentionDays = prefs.historyRetentionDays || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  // Clean watch history
  const history = getWatchHistory();
  const filteredHistory = history.filter(item => 
    new Date(item.watchedAt) > cutoffDate
  );
  setStorageData(STORAGE_KEYS.WATCH_HISTORY, filteredHistory);
  
  // Clean search history
  const searchHistory = getSearchHistory();
  const filteredSearchHistory = searchHistory.filter(item => 
    new Date(item.searchedAt) > cutoffDate
  );
  setStorageData('ytb_search_history', filteredSearchHistory);
  
  return {
    historyItemsRemoved: history.length - filteredHistory.length,
    searchItemsRemoved: searchHistory.length - filteredSearchHistory.length
  };
};
