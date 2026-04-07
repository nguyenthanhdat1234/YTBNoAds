import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Film, 
  TrendingUp, 
  Calendar, 
  Star, 
  Play, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  X,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  searchMovies, 
  getTrendingMovies, 
  getMoviePoster, 
  getMovieBackdrop, 
  isMovieApiConfigured,
  getMovieDetails
} from '../../services/movieApi';

const MovieExplorer = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (isMovieApiConfigured()) {
      fetchTrending();
    }
  }, []);

  const fetchTrending = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrendingMovies(p);
      if (p === 1) {
        setTrending(data.results);
      } else {
        setTrending(prev => [...prev, ...data.results]);
      }
      setHasMore(data.page < data.total_pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const data = await searchMovies(query);
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    if (query) {
      // search more...
    } else {
      fetchTrending(nextPage);
    }
  };

  const handleMovieClick = async (movie) => {
    setLoading(true);
    try {
      const details = await getMovieDetails(movie.id);
      setSelectedMovie(details);
      // Smooth scroll to top of details
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const startWatching = (movie) => {
    // Strategy: Search for Full Movie on YouTube via the existing player
    const searchString = `${movie.title} full movie`;
    // We pass this as a "virtual" video or just trigger a search in MainPlayer
    // But since MovieExplorer is a tab, we can use onVideoSelect with a special search protocol
    
    // For now, let's create a "Search Video" metadata
    const videoData = {
      isSearchQuery: true,
      query: searchString,
      title: movie.title,
      description: movie.overview,
      thumbnail: getMoviePoster(movie.poster_path),
      isMovie: true,
      movieId: movie.id
    };
    
    onVideoSelect(videoData);
  };

  if (!isMovieApiConfigured()) {
    return (
      <div className="py-24 text-center space-y-12 animate-fade-in flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-cinema-red blur-3xl opacity-10 animate-pulse" />
          <Film className="w-20 h-20 text-cinema-red relative mb-8" />
        </div>
        <div className="space-y-4 max-w-lg mx-auto">
          <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-white">
            Cinema Protocol Unavailable
          </h2>
          <p className="text-sm font-medium text-cinema-gray/60 leading-relaxed uppercase tracking-widest">
            To activate professional movie discovery, please configure your TMDb Movie API Key in the System Control Room.
          </p>
        </div>
        <a 
          href="/settings"
          className="btn-cinema px-12 py-4 text-[10px] font-black uppercase tracking-[0.4em]"
        >
          Configure Nexus Key
        </a>
      </div>
    );
  }

  const MovieCard = ({ movie }) => (
    <div 
      className="group relative bg-white/[0.02] border border-white/5 rounded-sm overflow-hidden transition-all duration-700 hover:scale-[1.05] hover:bg-white/[0.05] hover:border-white/10 cursor-pointer shadow-2xl"
      onClick={() => handleMovieClick(movie)}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={getMoviePoster(movie.poster_path) || 'https://placehold.co/500x750/000000/FFFFFF/png?text=No+Poster'} 
          alt={movie.title}
          className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xl border border-white/10 px-2 py-1 flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-[10px] font-black text-white tabular-nums">{movie.vote_average?.toFixed(1)}</span>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-sm">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-2xl">
             <Info className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-white truncate group-hover:text-cinema-red transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-[9px] font-black text-cinema-gray uppercase tracking-tighter">
          <div className="flex items-center space-x-1">
            <Calendar className="w-2.5 h-2.5" />
            <span>{movie.release_date?.split('-')[0]}</span>
          </div>
          <span className="px-1.5 py-0.5 border border-white/5 rounded-sm">MOVIE</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      {/* Search Hub */}
      <div className="bg-cinema-surface/50 backdrop-blur-3xl border border-white/5 p-8 rounded-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-cinema-red" />
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-cinema-gray group-focus-within:text-cinema-red transition-colors w-4 h-4" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="QUÉT TẦN SỐ PHIM (TITLES, GENRES, YEARS)..."
              className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/5 rounded-sm text-white placeholder:text-cinema-gray/20 text-[10px] font-black uppercase tracking-[0.2em] focus:ring-0 focus:border-white/10 focus:bg-white/[0.04] transition-all"
            />
          </div>
          <button 
            type="submit"
            className="btn-cinema py-5 px-12 text-[10px] font-black uppercase tracking-[0.4em]"
          >
            KÍCH HOẠT QUÉT
          </button>
        </form>
      </div>

      {/* Movie Detail Spotlight Overlay (Inline) */}
      {selectedMovie && (
        <div className="relative group animate-slide-up bg-black border border-white/5 rounded-sm overflow-hidden shadow-2xl">
          <div className="absolute inset-0">
             <img 
               src={getMovieBackdrop(selectedMovie.backdrop_path)} 
               alt="" 
               className="w-full h-full object-cover opacity-30 blur-sm"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10 p-10">
            <div className="md:col-span-3">
              <img 
                src={getMoviePoster(selectedMovie.poster_path)} 
                alt={selectedMovie.title}
                className="w-full rounded-sm shadow-2xl border border-white/10"
              />
            </div>
            
            <div className="md:col-span-9 space-y-8 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-white">
                    {selectedMovie.title}
                  </h2>
                  <button 
                    onClick={() => setSelectedMovie(null)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-cinema-gray">
                  <div className="flex items-center space-x-2">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-white">{selectedMovie.vote_average.toFixed(1)} Rating</span>
                  </div>
                  <div className="flex items-center space-x-2 border-l border-white/10 pl-6">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{selectedMovie.release_date}</span>
                  </div>
                  <div className="flex items-center space-x-2 border-l border-white/10 pl-6">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedMovie.runtime} MINS</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm font-medium text-cinema-gray/80 leading-relaxed max-w-2xl line-clamp-4">
                {selectedMovie.overview}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => startWatching(selectedMovie)}
                  className="flex items-center space-x-4 px-10 py-4 bg-cinema-red text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-sm hover:scale-105 transition-all shadow-2xl shadow-cinema-red/20"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>XEM NGAY (YOUTUBE)</span>
                </button>
                <button className="flex items-center space-x-4 px-10 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-white/10 transition-all">
                  <ExternalLink className="w-4 h-4" />
                  <span>TRAILER</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray flex items-center space-x-4">
            <div className="w-3 h-[1px] bg-cinema-red" />
            <span>{results.length > 0 ? 'KẾT QUẢ QUÉT' : 'TOP PHIM THỊNH HÀNH'}</span>
          </h2>
          <div className="flex items-center space-x-2 text-[9px] font-black text-cinema-gray/30 tracking-[0.2em] uppercase">
            <span>Protocol v3.0</span>
          </div>
        </div>

        {loading && !trending.length && (
          <div className="py-32 flex flex-col items-center space-y-6">
            <Loader2 className="w-10 h-10 text-cinema-red animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray animate-pulse">Initializing Cinema Link...</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {(results.length > 0 ? results : trending).map((movie, index) => (
            <MovieCard key={`${movie.id}-${index}`} movie={movie} />
          ))}
        </div>

        {hasMore && !loading && (
          <div className="pt-16 text-center">
            <button 
              onClick={loadMore}
              className="px-16 py-5 border border-white/5 hover:border-cinema-red rounded-sm text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray hover:text-white transition-all group"
            >
              <span className="flex items-center space-x-4">
                <span>EXTEND SCAN AREA</span>
                <TrendingUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieExplorer;
