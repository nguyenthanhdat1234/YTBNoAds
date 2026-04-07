const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

let MOVIE_API_KEY = localStorage.getItem('tmdb_api_key') || '';

export const setMovieApiKey = (key) => {
  MOVIE_API_KEY = key;
  localStorage.setItem('tmdb_api_key', key);
};

export const getMovieApiKey = () => MOVIE_API_KEY;

export const isMovieApiConfigured = () => !!MOVIE_API_KEY;

export const searchMovies = async (query, page = 1) => {
  if (!MOVIE_API_KEY) throw new Error('TMDb API Key not configured');
  
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${MOVIE_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=vi-VN&include_adult=false`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.status_message || 'Failed to search movies');
  }
  
  return response.json();
};

export const getTrendingMovies = async (page = 1) => {
  if (!MOVIE_API_KEY) throw new Error('TMDb API Key not configured');
  
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/movie/week?api_key=${MOVIE_API_KEY}&page=${page}&language=vi-VN`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.status_message || 'Failed to fetch trending movies');
  }
  
  return response.json();
};

export const getMovieDetails = async (movieId) => {
  if (!MOVIE_API_KEY) throw new Error('TMDb API Key not configured');
  
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${MOVIE_API_KEY}&append_to_response=videos,credits,similar,recommendations&language=vi-VN`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.status_message || 'Failed to fetch movie details');
  }
  
  return response.json();
};

export const getMoviePoster = (path, size = 'w500') => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getMovieBackdrop = (path, size = 'original') => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getMovieGenres = async () => {
    if (!MOVIE_API_KEY) throw new Error('TMDb API Key not configured');
    
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${MOVIE_API_KEY}&language=vi-VN`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.status_message || 'Failed to fetch genres');
    }
    
    return response.json();
};

// OPhim API - Keyless Fallback for Vietnamese Users
const OPHIM_BASE_URL = 'https://ophim1.com';
const OPHIM_IMAGE_MIRRORS = [
  'https://img.ophim.cc/uploads/movies/',
  'https://img.ophim.live/uploads/movies/',
  'https://img.ophim.pm/uploads/movies/',
  'https://img.ophim1.com/uploads/movies/'
];
const OPHIM_IMAGE_URL = OPHIM_IMAGE_MIRRORS[0]; 
const IMAGE_LOAD_TIMEOUT = 5000; 

export const getOPhimTrending = async (page = 1) => {
  const response = await fetch(`${OPHIM_BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`);
  if (!response.ok) throw new Error('Failed to fetch OPhim trending');
  const data = await response.json();
  
  // Normalize OPhim data to match TMDB-like structure for the UI
  return {
    results: data.items.map(item => ({
      id: item.slug,
      slug: item.slug,
      title: item.name,
      original_title: item.origin_name,
      overview: item.content || '',
      poster_path: item.poster_url ? (item.poster_url.startsWith('http') ? item.poster_url : `${OPHIM_IMAGE_MIRRORS[0]}${item.poster_url}`) : null,
      backdrop_path: item.thumb_url ? (item.thumb_url.startsWith('http') ? item.thumb_url : `${OPHIM_IMAGE_MIRRORS[0]}${item.thumb_url}`) : null,
      image_mirrors: item.poster_url ? OPHIM_IMAGE_MIRRORS.map(m => `${m}${item.poster_url}`) : [],
      release_date: item.year?.toString() || '2024',
      vote_average: item.tmdb?.vote_average || item.imdb?.vote_average || 8.0,
      source: 'ophim',
      original_item: item
    })),
    total_pages: data.pagination?.totalPages || data.params?.pagination?.totalPages || 1,
    page: data.pagination?.currentPage || data.params?.pagination?.currentPage || 1
  };
};

export const searchOPhim = async (query, page = 1) => {
  // OPhim search API: https://ophim1.com/v1/api/tim-kiem?keyword={keyword}&page={page}&limit=24
  const response = await fetch(`${OPHIM_BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}&page=${page}&limit=24`);
  if (!response.ok) throw new Error('Search failed');
  const data = await response.json();
  
  if (!data.status || !data.data || !data.data.items) {
      return { results: [], total_pages: 1, page: 1 };
  }

  const pagination = data.data.params?.pagination;

  return {
    results: data.data.items.map(item => ({
      id: item.slug,
      slug: item.slug,
      title: item.name,
      original_title: item.origin_name,
      poster_path: item.poster_url ? (item.poster_url.startsWith('http') ? item.poster_url : `${OPHIM_IMAGE_MIRRORS[0]}${item.poster_url}`) : null,
      backdrop_path: item.thumb_url ? (item.thumb_url.startsWith('http') ? item.thumb_url : `${OPHIM_IMAGE_MIRRORS[0]}${item.thumb_url}`) : null,
      image_mirrors: item.poster_url ? OPHIM_IMAGE_MIRRORS.map(m => `${m}${item.poster_url}`) : [],
      vote_average: item.tmdb?.vote_average || item.imdb?.vote_average || 8.0,
      release_date: item.year?.toString() || '2024',
      source: 'ophim'
    })),
    total_pages: pagination?.totalPages || 1,
    page: pagination?.currentPage || page
  };
};

export const getOPhimDetails = async (slug) => {
  const response = await fetch(`${OPHIM_BASE_URL}/phim/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch movie details');
  const data = await response.json();
  
  const movie = data.movie;
  const episodes = data.episodes?.[0]?.server_data || [];
  
  return {
    ...movie,
    id: movie.slug,
    title: movie.name,
    original_title: movie.origin_name,
    description: movie.content,
    poster_path: movie.poster_url ? (movie.poster_url.startsWith('http') ? movie.poster_url : `${OPHIM_IMAGE_MIRRORS[0]}${movie.poster_url}`) : null,
    backdrop_path: movie.thumb_url ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : `${OPHIM_IMAGE_MIRRORS[0]}${movie.thumb_url}`) : null,
    // Provide a failover image list for the UI to attempt if primary fails
    image_mirrors: movie.poster_url ? OPHIM_IMAGE_MIRRORS.map(m => `${m}${movie.poster_url}`) : [],
    runtime: movie.time,
    genres: movie.category?.map(c => ({ name: c.name })) || [],
    episodes: episodes, // Store episodes for streaming
    source: 'ophim',
    vote_average: movie.tmdb?.vote_average || movie.imdb?.vote_average || 0
  };
};
