/**
 * Metadata extraction utilities
 * Based on the original C# metadata extraction logic
 */

// Artist separators from the original code
const ARTIST_SEPARATORS = [',', '&', 'feat.', 'ft.', 'featuring', 'vs.', 'vs', 'x'];

// Video title separators
const VIDEO_TITLE_SEPARATORS = ['-', '–', '—', '|', '•'];

// Ignored genres (converted from original C# code)
const IGNORED_GENRES = [
  'official', 'video', 'music', 'audio', 'lyric', 'lyrics', 'live', 'remix', 'cover',
  'acoustic', 'instrumental', 'karaoke', 'piano', 'guitar', 'bass', 'drum', 'vocal',
  'hd', 'hq', '4k', '1080p', '720p', 'full', 'complete', 'extended', 'radio', 'edit',
  'version', 'mix', 'original', 'remaster', 'remastered', 'deluxe', 'special', 'bonus'
];

/**
 * Cleans a filename by removing invalid characters
 * @param {string} filename - The filename to clean
 * @returns {string} - Cleaned filename
 */
export const cleanFileName = (filename) => {
  if (!filename) return '';
  
  // Remove invalid filename characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/g;
  return filename.replace(invalidChars, '').trim();
};

/**
 * Tries to extract song title and performers from a video title
 * Based on the original TryGetSongTitleAndPerformersFromTitle method
 * @param {string} title - The video title
 * @returns {object} - { success: boolean, songTitle: string, performers: string[] }
 */
export const tryGetSongTitleAndPerformersFromTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { success: false, songTitle: null, performers: [] };
  }

  // Find the last occurrence of a separator
  let separatorIndex = -1;
  let foundSeparator = '';
  
  for (const separator of VIDEO_TITLE_SEPARATORS) {
    const index = title.lastIndexOf(separator);
    if (index > separatorIndex) {
      separatorIndex = index;
      foundSeparator = separator;
    }
  }

  if (separatorIndex > 0) {
    let songTitle = title.substring(separatorIndex + foundSeparator.length).trim();
    
    // If song title is empty, try the first occurrence
    if (!songTitle) {
      separatorIndex = title.indexOf(foundSeparator);
      if (separatorIndex > 0) {
        songTitle = title.substring(separatorIndex + foundSeparator.length).trim();
      }
    }

    if (songTitle) {
      const performersText = title.substring(0, separatorIndex).trim();
      const performers = splitArtists(performersText);
      
      return {
        success: true,
        songTitle: songTitle,
        performers: performers
      };
    }
  }

  return { success: false, songTitle: null, performers: [] };
};

/**
 * Splits artist text into individual artists
 * @param {string} artistsText - Text containing artist names
 * @returns {string[]} - Array of artist names
 */
const splitArtists = (artistsText) => {
  if (!artistsText) return [];
  
  let result = [artistsText];
  
  for (const separator of ARTIST_SEPARATORS) {
    const newResult = [];
    for (const artist of result) {
      const split = artist.split(separator).map(a => a.trim()).filter(a => a);
      newResult.push(...split);
    }
    result = newResult;
  }
  
  return result.filter(artist => artist.length > 0);
};

/**
 * Extracts genre from video title (text within brackets)
 * @param {string} title - The video title
 * @returns {string} - Extracted genre or empty string
 */
const extractGenre = (title) => {
  if (!title) return '';
  
  // Look for text within square brackets or Japanese brackets
  const genreMatch = title.match(/\[([^\]]+)\]|【([^】]+)】/);
  if (genreMatch) {
    const genre = genreMatch[1] || genreMatch[2];
    
    // Check if it's not an ignored genre
    if (genre && !IGNORED_GENRES.some(ignored => 
      genre.toLowerCase().includes(ignored.toLowerCase())
    )) {
      return genre;
    }
  }
  
  return '';
};

/**
 * Cleans title by removing genre brackets and other metadata
 * @param {string} title - The original title
 * @returns {string} - Cleaned title
 */
const cleanTitle = (title) => {
  if (!title) return '';
  
  let cleaned = title.replace(/—/g, '-'); // Replace em dash with regular dash
  
  // Remove genre brackets
  const genre = extractGenre(cleaned);
  if (genre) {
    cleaned = cleaned.replace(`[${genre}]`, '').replace(`【${genre}】`, '');
    
    // Remove any additional brackets that might be empty or contain ignored content
    const additionalBrackets = cleaned.match(/\[([^\]]+)\]|【([^】]+)】/);
    if (additionalBrackets) {
      const content = additionalBrackets[1] || additionalBrackets[2];
      cleaned = cleaned.replace(`[${content}]`, '').replace(`【${content}】`, '');
    }
  }
  
  return cleaned.replace(/^\s*[-\[\]]*\s*|\s*[-\[\]]*\s*$/g, '').trim();
};

/**
 * Main metadata extraction function
 * Based on the original TagFileBasedOnTitle method
 * @param {string} videoTitle - The video title
 * @param {object} options - Additional options
 * @returns {object} - Extracted metadata
 */
export const extractVideoMetadata = (videoTitle, options = {}) => {
  if (!videoTitle) {
    return {
      title: '',
      artist: '',
      songTitle: '',
      performers: [],
      genre: '',
      album: options.album || '',
      albumArtist: options.albumArtist || ''
    };
  }

  const originalTitle = videoTitle;
  const genre = extractGenre(originalTitle);
  const cleanedTitle = cleanTitle(originalTitle);
  
  // Try to extract song title and performers
  const extractionResult = tryGetSongTitleAndPerformersFromTitle(cleanedTitle);
  
  let title = cleanedTitle;
  let artist = '';
  let songTitle = '';
  let performers = [];
  
  if (extractionResult.success) {
    songTitle = extractionResult.songTitle;
    performers = extractionResult.performers;
    artist = performers.join(', ');
    title = songTitle; // Use the extracted song title as the main title
  }
  
  return {
    title: title,
    artist: artist,
    songTitle: songTitle,
    performers: performers,
    genre: genre,
    album: options.album || '',
    albumArtist: options.albumArtist || '',
    originalTitle: originalTitle,
    cleanedTitle: cleanedTitle
  };
};

/**
 * Generates filename based on pattern
 * Similar to the original GetFilenameByPattern method
 * @param {object} video - Video object
 * @param {number} index - Video index
 * @param {string} pattern - Filename pattern
 * @param {object} playlist - Playlist object (optional)
 * @returns {string} - Generated filename
 */
export const generateFilename = (video, index, pattern = '$title', playlist = null) => {
  if (!video || !video.title) return 'untitled';
  
  const metadata = video.metadata || extractVideoMetadata(video.title);
  
  const replacements = {
    '$title': metadata.title || video.title,
    '$index': (index + 1).toString(),
    '$artist': metadata.artist || '',
    '$songtitle': metadata.songTitle || '',
    '$channel': video.author?.name || '',
    '$videoid': video.id || '',
    '$playlist': playlist?.title || '',
    '$genre': metadata.genre || ''
  };
  
  let result = pattern;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder.replace('$', '\\$'), 'g'), value);
  }
  
  return cleanFileName(result) || metadata.title || video.title || 'untitled';
};

/**
 * Formats metadata for display
 * @param {object} metadata - Metadata object
 * @returns {object} - Formatted metadata for display
 */
export const formatMetadataForDisplay = (metadata) => {
  if (!metadata) return {};
  
  return {
    title: metadata.title || metadata.originalTitle || '',
    artist: metadata.artist || '',
    album: metadata.album || '',
    genre: metadata.genre || '',
    performers: metadata.performers || [],
    hasMetadata: !!(metadata.artist || metadata.songTitle || metadata.genre)
  };
};
