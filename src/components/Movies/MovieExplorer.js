import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useVideo } from '../../contexts/VideoContext';
import { 
  fetchTrending, 
  searchMovies, 
  getMovieStream 
} from '../../services/movieApi';

import MovieCard from './MovieCard';
import MovieDetails from './MovieDetails';
import MovieHero from './MovieHero';

const MovieExplorer = ({ onVideoSelect }) => {
  const { setIsMinimized } = useVideo();
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const loadTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTrending();
      setMovies(data);
      if (data.length > 0) {
        setTrending(data[0]);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      loadTrending();
      setIsSearching(false);
      return;
    }

    if (query.trim().length < 2) return;

    try {
      setIsSearching(true);
      const results = await searchMovies(query);
      setMovies(results);
    } catch (err) {
       console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMovieClick = useCallback((movie) => {
    setSelectedMovie(movie);
  }, []);

  const startWatching = useCallback(async (movie) => {
    const toastId = toast.loading('Đang khởi tạo phòng chiếu...');
    try {
      const streamData = await getMovieStream(movie.id, movie.title);
      if (streamData && streamData.url) {
        onVideoSelect({
          ...movie,
          url: streamData.url,
          isMovie: true,
          streamUrls: streamData.mirrors || []
        });
        setSelectedMovie(null);
        toast.success(`Đang mở: ${movie.title}`, { id: toastId });
      } else {
        throw new Error('Không tìm thấy nguồn phim');
      }
    } catch (err) {
      console.error('Playback error:', err);
      toast.error('Xin lỗi, không thể phát phim này lúc này.', { id: toastId });
    }
  }, [onVideoSelect]);

  if (error) {
    return (
      <div className="py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-cinema-red/10 border border-cinema-red/20 rounded-full flex items-center justify-center mx-auto">
          <X className="w-8 h-8 text-cinema-red" />
        </div>
        <p className="text-cinema-gray font-black uppercase tracking-widest">{error}</p>
        <button 
          onClick={loadTrending}
          className="btn-cinema py-3 px-8 text-[10px] font-black tracking-widest uppercase flex items-center space-x-3 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>THỬ LẠI</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 animate-fade-in no-scrollbar overflow-x-hidden">
      
      {/* Cinematic Hero Section - Isolated for Performance */}
      {!searchQuery && trending && (
        <div className="animate-fade-in no-scrollbar overflow-x-hidden">
          <MovieHero 
            movie={trending} 
            onPlay={startWatching} 
            onInfo={handleMovieClick}
          />
        </div>
      )}

      {/* Modern High-Fidelity Search Bar */}
      <div className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-0 bg-cinema-red blur-2xl opacity-10 group-focus-within:opacity-20 transition-opacity" />
        <div className="relative flex items-center bg-cinema-surface border border-white/5 p-4 rounded-xl group-focus-within:border-cinema-red/40 transition-all shadow-2xl">
          <Search className={`w-5 h-5 mr-4 transition-colors ${isSearching ? 'text-cinema-red animate-pulse' : 'text-cinema-gray'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="TÌM KIẾM PHIM, SERIES, HOẠT HÌNH..."
            className="w-full bg-transparent border-none focus:ring-0 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white placeholder-cinema-gray/40"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-cinema-red animate-spin" />}
        </div>
      </div>

      {/* Dynamic Catalog Grid */}
      <div className="space-y-8 no-scrollbar overflow-x-hidden">
        <div className="flex items-center justify-between border-l-2 border-cinema-red pl-4">
          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white">
            {searchQuery ? `KẾT QUẢ CHO: ${searchQuery}` : 'DANH SÁCH THỊNH HÀNH'}
          </h2>
          <span className="text-[9px] font-bold text-cinema-gray uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full border border-white/5">
            {movies.length} Tác phẩm
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-video bg-cinema-surface-lowest animate-shimmer rounded-xl border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 no-scrollbar overflow-x-hidden">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={handleMovieClick} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Cinematic Detail Transition */}
      {selectedMovie && (
        <MovieDetails 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)}
          onPlay={startWatching}
        />
      )}
    </div>
  );
};

export default MovieExplorer;
