/**
 * YouTube URL parsing utilities
 * Based on the original C# YoutubeHelpers class
 */

// Video ID validation regex - YouTube video IDs are 11 characters
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

// URL patterns for different YouTube URL types
const URL_PATTERNS = {
  // Video URLs
  video: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ],
  
  // Playlist URLs
  playlist: [
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?.*list=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?.*list=([a-zA-Z0-9_-]+)/
  ],
  
  // Channel URLs
  channel: [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/
  ],
  
  // User URLs
  user: [
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/
  ],
  
  // Handle URLs (@username)
  handle: [
    /youtube\.com\/@([a-zA-Z0-9_-]+)/
  ]
};

/**
 * Validates a YouTube video ID
 * @param {string} videoId - The video ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateVideoId = (videoId) => {
  if (!videoId || typeof videoId !== 'string') {
    return false;
  }
  
  // Video IDs are always 11 characters
  if (videoId.length !== 11) {
    return false;
  }
  
  return VIDEO_ID_REGEX.test(videoId);
};

/**
 * Tries to parse a video ID from a YouTube URL
 * @param {string} url - The URL to parse
 * @returns {object} - { success: boolean, videoId: string|null }
 */
export const tryParseVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    return { success: false, videoId: null };
  }
  
  for (const pattern of URL_PATTERNS.video) {
    const match = url.match(pattern);
    if (match && match[1] && validateVideoId(match[1])) {
      return { success: true, videoId: match[1] };
    }
  }
  
  return { success: false, videoId: null };
};

/**
 * Validates a YouTube playlist ID
 * @param {string} playlistId - The playlist ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validatePlaylistId = (playlistId) => {
  if (!playlistId || typeof playlistId !== 'string') {
    return false;
  }
  
  // Playlist IDs typically start with 'PL' and are longer than video IDs
  return playlistId.length > 11 && /^[a-zA-Z0-9_-]+$/.test(playlistId);
};

/**
 * Tries to parse a playlist ID from a YouTube URL
 * @param {string} url - The URL to parse
 * @returns {object} - { success: boolean, playlistId: string|null }
 */
export const tryParsePlaylistId = (url) => {
  if (!url || typeof url !== 'string') {
    return { success: false, playlistId: null };
  }
  
  for (const pattern of URL_PATTERNS.playlist) {
    const match = url.match(pattern);
    if (match && match[1] && validatePlaylistId(match[1])) {
      return { success: true, playlistId: match[1] };
    }
  }
  
  return { success: false, playlistId: null };
};

/**
 * Tries to parse a channel ID from a YouTube URL
 * @param {string} url - The URL to parse
 * @returns {object} - { success: boolean, channelId: string|null }
 */
export const tryParseChannelId = (url) => {
  if (!url || typeof url !== 'string') {
    return { success: false, channelId: null };
  }
  
  for (const pattern of URL_PATTERNS.channel) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { success: true, channelId: match[1] };
    }
  }
  
  return { success: false, channelId: null };
};

/**
 * Tries to parse a username from a YouTube URL
 * @param {string} url - The URL to parse
 * @returns {object} - { success: boolean, username: string|null }
 */
export const tryParseUsername = (url) => {
  if (!url || typeof url !== 'string') {
    return { success: false, username: null };
  }
  
  for (const pattern of URL_PATTERNS.user) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { success: true, username: match[1] };
    }
  }
  
  return { success: false, username: null };
};

/**
 * Tries to parse a handle from a YouTube URL
 * @param {string} url - The URL to parse
 * @returns {object} - { success: boolean, handle: string|null }
 */
export const tryParseHandle = (url) => {
  if (!url || typeof url !== 'string') {
    return { success: false, handle: null };
  }
  
  for (const pattern of URL_PATTERNS.handle) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { success: true, handle: match[1] };
    }
  }
  
  return { success: false, handle: null };
};

/**
 * Main function to parse any YouTube URL
 * @param {string} url - The URL to parse
 * @returns {object} - { isValid: boolean, type: string, id: string, originalUrl: string }
 */
export const parseYouTubeURL = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, type: null, id: null, originalUrl: url };
  }
  
  // Clean up the URL
  const cleanUrl = url.trim();
  
  // Try to parse as video
  const videoResult = tryParseVideoId(cleanUrl);
  if (videoResult.success) {
    return {
      isValid: true,
      type: 'video',
      id: videoResult.videoId,
      originalUrl: cleanUrl
    };
  }
  
  // Try to parse as playlist
  const playlistResult = tryParsePlaylistId(cleanUrl);
  if (playlistResult.success) {
    return {
      isValid: true,
      type: 'playlist',
      id: playlistResult.playlistId,
      originalUrl: cleanUrl
    };
  }
  
  // Try to parse as channel
  const channelResult = tryParseChannelId(cleanUrl);
  if (channelResult.success) {
    return {
      isValid: true,
      type: 'channel',
      id: channelResult.channelId,
      originalUrl: cleanUrl
    };
  }
  
  // Try to parse as user
  const userResult = tryParseUsername(cleanUrl);
  if (userResult.success) {
    return {
      isValid: true,
      type: 'user',
      id: userResult.username,
      originalUrl: cleanUrl
    };
  }
  
  // Try to parse as handle
  const handleResult = tryParseHandle(cleanUrl);
  if (handleResult.success) {
    return {
      isValid: true,
      type: 'handle',
      id: handleResult.handle,
      originalUrl: cleanUrl
    };
  }
  
  return { isValid: false, type: null, id: null, originalUrl: cleanUrl };
};

/**
 * Quality definitions matching the original app
 */
export const VideoQuality = {
  Low144: { height: 144, label: '144p' },
  Low240: { height: 240, label: '240p' },
  Medium360: { height: 360, label: '360p' },
  Medium480: { height: 480, label: '480p' },
  High720: { height: 720, label: '720p' },
  High1080: { height: 1080, label: '1080p' },
  High1440: { height: 1440, label: '1440p' },
  High2160: { height: 2160, label: '2160p' },
  High2880: { height: 2880, label: '2880p' },
  High3072: { height: 3072, label: '3072p' },
  High4320: { height: 4320, label: '4320p' }
};

/**
 * Get available quality options
 * @returns {Array} - Array of quality options
 */
export const getQualityOptions = () => {
  return Object.values(VideoQuality);
};
