/**
 * YouTube Data API v3 Service
 * Provides methods to interact with YouTube API for searching videos, getting video details, etc.
 */

// YouTube API configuration
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// API Key - Pre-configured for immediate use
const getApiKey = () => {
  // Use the provided API key directly
  const API_KEY = 'AIzaSyDjdLoS-BvhzeY_J7fLkpUThv9Y-Yxa9Pw';

  // Try to get from environment variable first (for development flexibility)
  if (process.env.REACT_APP_YOUTUBE_API_KEY) {
    return process.env.REACT_APP_YOUTUBE_API_KEY;
  }

  // Try to get from localStorage (user can override in settings)
  const storedKey = localStorage.getItem('youtube_api_key');
  if (storedKey) {
    return storedKey;
  }

  // Return the pre-configured API key
  return API_KEY;
};

/**
 * Make a request to YouTube API
 */
const makeApiRequest = async (endpoint, params = {}) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('YouTube API key is required. Please set it in Settings.');
  }
  
  const url = new URL(`${YOUTUBE_API_BASE_URL}/${endpoint}`);
  
  // Add API key and common parameters
  const searchParams = {
    key: apiKey,
    ...params
  };
  
  Object.keys(searchParams).forEach(key => {
    if (searchParams[key] !== undefined && searchParams[key] !== null) {
      url.searchParams.append(key, searchParams[key]);
    }
  });
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('YouTube API request failed:', error);
    throw error;
  }
};

/**
 * Search for videos
 */
export const searchVideos = async (query, options = {}) => {
  const {
    maxResults = 25,
    order = 'relevance', // relevance, date, rating, viewCount, title
    type = 'video',
    videoDuration = 'any', // any, short, medium, long
    videoDefinition = 'any', // any, high, standard
    regionCode = 'US',
    pageToken = null
  } = options;
  
  const params = {
    part: 'snippet',
    q: query,
    type,
    maxResults,
    order,
    videoDuration,
    videoDefinition,
    regionCode
  };
  
  if (pageToken) {
    params.pageToken = pageToken;
  }
  
  const response = await makeApiRequest('search', params);
  
  // Get additional video details for the search results
  if (response.items && response.items.length > 0) {
    const videoIds = response.items
      .filter(item => item.id.kind === 'youtube#video')
      .map(item => item.id.videoId)
      .join(',');
    
    if (videoIds) {
      const videoDetails = await getVideoDetails(videoIds);
      
      // Merge search results with video details
      response.items = response.items.map(item => {
        if (item.id.kind === 'youtube#video') {
          const details = videoDetails.items.find(detail => detail.id === item.id.videoId);
          return {
            ...item,
            statistics: details?.statistics,
            contentDetails: details?.contentDetails
          };
        }
        return item;
      });
    }
  }
  
  return response;
};

/**
 * Get video details by ID(s)
 */
export const getVideoDetails = async (videoIds) => {
  const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoIds;
  
  const params = {
    part: 'snippet,statistics,contentDetails,status',
    id: ids
  };
  
  return await makeApiRequest('videos', params);
};

/**
 * Get channel details by ID(s)
 */
export const getChannelDetails = async (channelIds) => {
  const ids = Array.isArray(channelIds) ? channelIds.join(',') : channelIds;
  
  const params = {
    part: 'snippet,statistics,brandingSettings',
    id: ids
  };
  
  return await makeApiRequest('channels', params);
};

/**
 * Get playlist details by ID
 */
export const getPlaylistDetails = async (playlistId) => {
  const params = {
    part: 'snippet,status',
    id: playlistId
  };
  
  return await makeApiRequest('playlists', params);
};

/**
 * Get playlist items (videos in a playlist)
 */
export const getPlaylistItems = async (playlistId, options = {}) => {
  const {
    maxResults = 50,
    pageToken = null
  } = options;
  
  const params = {
    part: 'snippet,contentDetails',
    playlistId,
    maxResults
  };
  
  if (pageToken) {
    params.pageToken = pageToken;
  }
  
  return await makeApiRequest('playlistItems', params);
};

/**
 * Get trending videos
 */
export const getTrendingVideos = async (options = {}) => {
  const {
    maxResults = 25,
    regionCode = 'US',
    categoryId = null
  } = options;
  
  const params = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    maxResults,
    regionCode
  };
  
  if (categoryId) {
    params.videoCategoryId = categoryId;
  }
  
  return await makeApiRequest('videos', params);
};

/**
 * Get video categories
 */
export const getVideoCategories = async (regionCode = 'US') => {
  const params = {
    part: 'snippet',
    regionCode
  };
  
  return await makeApiRequest('videoCategories', params);
};

/**
 * Search channels
 */
export const searchChannels = async (query, options = {}) => {
  const {
    maxResults = 25,
    order = 'relevance',
    pageToken = null
  } = options;
  
  const params = {
    part: 'snippet',
    q: query,
    type: 'channel',
    maxResults,
    order
  };
  
  if (pageToken) {
    params.pageToken = pageToken;
  }
  
  return await makeApiRequest('search', params);
};

/**
 * Get videos from a channel
 */
export const getChannelVideos = async (channelId, options = {}) => {
  const {
    maxResults = 25,
    order = 'date',
    pageToken = null
  } = options;
  
  const params = {
    part: 'snippet',
    channelId,
    type: 'video',
    maxResults,
    order
  };
  
  if (pageToken) {
    params.pageToken = pageToken;
  }
  
  return await makeApiRequest('search', params);
};

/**
 * Utility function to format video duration from ISO 8601 to readable format
 */
export const formatDuration = (isoDuration) => {
  if (!isoDuration) return '0:00';
  
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Utility function to format view count
 */
export const formatViewCount = (viewCount) => {
  if (!viewCount) return '0 views';
  
  const count = parseInt(viewCount);
  
  if (count >= 1000000000) {
    return `${(count / 1000000000).toFixed(1)}B views`;
  } else if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  } else {
    return `${count} views`;
  }
};

/**
 * Utility function to format publish date
 */
export const formatPublishDate = (publishedAt) => {
  if (!publishedAt) return '';
  
  const date = new Date(publishedAt);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
};

/**
 * Check if API key is configured
 */
export const isApiKeyConfigured = () => {
  const apiKey = getApiKey();
  return apiKey !== null && apiKey.trim() !== '';
};

/**
 * Set API key in localStorage
 */
export const setApiKey = (apiKey) => {
  if (apiKey && apiKey.trim()) {
    localStorage.setItem('youtube_api_key', apiKey.trim());
  } else {
    localStorage.removeItem('youtube_api_key');
  }
};
