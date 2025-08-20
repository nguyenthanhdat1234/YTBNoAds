/**
 * Subscription Service
 * Manages channel subscriptions and related data
 */

const STORAGE_KEY = 'ytb_subscriptions';

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
 * Normalize channel data for consistent storage
 */
const normalizeChannelData = (channel) => {
  return {
    id: channel.id,
    title: channel.snippet?.title || channel.title,
    description: channel.snippet?.description?.substring(0, 500) || channel.description || '',
    thumbnail: channel.snippet?.thumbnails?.medium?.url || 
               channel.snippet?.thumbnails?.default?.url || 
               channel.thumbnail,
    subscriberCount: channel.statistics?.subscriberCount,
    videoCount: channel.statistics?.videoCount,
    viewCount: channel.statistics?.viewCount,
    customUrl: channel.snippet?.customUrl,
    publishedAt: channel.snippet?.publishedAt,
    subscribedAt: new Date().toISOString()
  };
};

// ==================== SUBSCRIPTIONS ====================

/**
 * Get all subscriptions
 */
export const getSubscriptions = () => {
  const subscriptions = getStorageData(STORAGE_KEY, []);
  // Sort by most recent first
  return subscriptions.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));
};

/**
 * Subscribe to a channel
 */
export const subscribeToChannel = (channel) => {
  const subscriptions = getStorageData(STORAGE_KEY, []);
  const normalizedChannel = normalizeChannelData(channel);
  
  // Check if already subscribed
  if (subscriptions.some(sub => sub.id === channel.id)) {
    return false; // Already subscribed
  }
  
  const newSubscriptions = [normalizedChannel, ...subscriptions];
  return setStorageData(STORAGE_KEY, newSubscriptions);
};

/**
 * Unsubscribe from a channel
 */
export const unsubscribeFromChannel = (channelId) => {
  const subscriptions = getStorageData(STORAGE_KEY, []);
  const filteredSubscriptions = subscriptions.filter(sub => sub.id !== channelId);
  return setStorageData(STORAGE_KEY, filteredSubscriptions);
};

/**
 * Check if subscribed to a channel
 */
export const isSubscribedToChannel = (channelId) => {
  const subscriptions = getStorageData(STORAGE_KEY, []);
  return subscriptions.some(sub => sub.id === channelId);
};

/**
 * Toggle subscription to a channel
 */
export const toggleChannelSubscription = (channel) => {
  if (isSubscribedToChannel(channel.id)) {
    return unsubscribeFromChannel(channel.id);
  } else {
    return subscribeToChannel(channel);
  }
};

/**
 * Get subscription by channel ID
 */
export const getSubscriptionById = (channelId) => {
  const subscriptions = getStorageData(STORAGE_KEY, []);
  return subscriptions.find(sub => sub.id === channelId);
};

/**
 * Update subscription data
 */
export const updateSubscription = (channelId, updates) => {
  const subscriptions = getStorageData(STORAGE_KEY, []);
  const updatedSubscriptions = subscriptions.map(sub => 
    sub.id === channelId ? { ...sub, ...updates, updatedAt: new Date().toISOString() } : sub
  );
  return setStorageData(STORAGE_KEY, updatedSubscriptions);
};

/**
 * Clear all subscriptions
 */
export const clearAllSubscriptions = () => {
  return setStorageData(STORAGE_KEY, []);
};

/**
 * Get subscription statistics
 */
export const getSubscriptionStats = () => {
  const subscriptions = getSubscriptions();
  
  const totalSubscriptions = subscriptions.length;
  const totalSubscribers = subscriptions.reduce((total, sub) => {
    return total + (parseInt(sub.subscriberCount) || 0);
  }, 0);
  
  const totalVideos = subscriptions.reduce((total, sub) => {
    return total + (parseInt(sub.videoCount) || 0);
  }, 0);
  
  const recentSubscriptions = subscriptions.slice(0, 5);
  
  // Most subscribed channels
  const topChannels = subscriptions
    .filter(sub => sub.subscriberCount)
    .sort((a, b) => parseInt(b.subscriberCount) - parseInt(a.subscriberCount))
    .slice(0, 5);
  
  return {
    totalSubscriptions,
    totalSubscribers,
    totalVideos,
    recentSubscriptions,
    topChannels
  };
};

// ==================== CHANNEL CATEGORIES ====================

/**
 * Categorize channels by type (based on title/description keywords)
 */
export const categorizeChannels = () => {
  const subscriptions = getSubscriptions();
  
  const categories = {
    music: [],
    gaming: [],
    tech: [],
    education: [],
    entertainment: [],
    news: [],
    sports: [],
    lifestyle: [],
    other: []
  };
  
  const keywords = {
    music: ['music', 'song', 'album', 'artist', 'band', 'concert', 'audio'],
    gaming: ['gaming', 'game', 'gameplay', 'gamer', 'esports', 'stream', 'twitch'],
    tech: ['tech', 'technology', 'programming', 'coding', 'software', 'hardware', 'review'],
    education: ['education', 'tutorial', 'learn', 'course', 'lesson', 'teach', 'university'],
    entertainment: ['comedy', 'funny', 'entertainment', 'movie', 'film', 'tv', 'show'],
    news: ['news', 'politics', 'current', 'breaking', 'report', 'journalism'],
    sports: ['sports', 'football', 'basketball', 'soccer', 'baseball', 'fitness', 'workout'],
    lifestyle: ['lifestyle', 'vlog', 'travel', 'food', 'cooking', 'fashion', 'beauty']
  };
  
  subscriptions.forEach(channel => {
    const text = `${channel.title} ${channel.description}`.toLowerCase();
    let categorized = false;
    
    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      if (categoryKeywords.some(keyword => text.includes(keyword))) {
        categories[category].push(channel);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categories.other.push(channel);
    }
  });
  
  return categories;
};

// ==================== EXPORT/IMPORT ====================

/**
 * Export subscriptions data
 */
export const exportSubscriptions = () => {
  return {
    subscriptions: getSubscriptions(),
    stats: getSubscriptionStats(),
    categories: categorizeChannels(),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
};

/**
 * Import subscriptions data
 */
export const importSubscriptions = (data) => {
  try {
    if (data.subscriptions && Array.isArray(data.subscriptions)) {
      setStorageData(STORAGE_KEY, data.subscriptions);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing subscriptions:', error);
    return false;
  }
};

// ==================== UTILITIES ====================

/**
 * Format subscriber count
 */
export const formatSubscriberCount = (count) => {
  if (!count) return '0 subscribers';
  
  const num = parseInt(count);
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B subscribers`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M subscribers`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K subscribers`;
  } else {
    return `${num} subscribers`;
  }
};

/**
 * Format video count
 */
export const formatVideoCount = (count) => {
  if (!count) return '0 videos';
  
  const num = parseInt(count);
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M videos`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K videos`;
  } else {
    return `${num} videos`;
  }
};

/**
 * Search subscriptions
 */
export const searchSubscriptions = (query) => {
  if (!query.trim()) return getSubscriptions();

  const subscriptions = getSubscriptions();
  const searchTerm = query.toLowerCase();

  return subscriptions.filter(channel =>
    channel.title.toLowerCase().includes(searchTerm) ||
    channel.description.toLowerCase().includes(searchTerm)
  );
};

/**
 * Get recent activity from subscribed channels
 * This would typically fetch latest videos from subscribed channels
 * For now, we'll return a placeholder structure
 */
export const getSubscriptionActivity = () => {
  const subscriptions = getSubscriptions();

  // In a real implementation, this would fetch latest videos from each channel
  // For now, return channel info with placeholder activity
  return subscriptions.map(channel => ({
    ...channel,
    latestVideo: null, // Would be populated with actual latest video data
    lastActivity: channel.subscribedAt,
    hasNewContent: false // Would be determined by comparing with last check
  }));
};
