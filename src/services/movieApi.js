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
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getMovieBackdrop = (path, size = 'original') => {
  if (!path) return null;
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
