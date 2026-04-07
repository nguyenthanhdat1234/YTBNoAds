import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ExternalLink,
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  searchMovies, 
  getTrendingMovies, 
  getMoviePoster, 
  getMovieBackdrop, 
  isMovieApiConfigured,
  getMovieDetails,
  getOPhimTrending,
  searchOPhim,
  getOPhimDetails
} from '../../services/movieApi';
import { useVideo } from '../../contexts/VideoContext';

const MovieExplorer = ({ onVideoSelect }) => {
  const { t } = useTranslation();
  const { isMinimized, setIsMinimized } = useVideo();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [heroMovie, setHeroMovie] = useState(null);
  const [heroImgSrc, setHeroImgSrc] = useState('');
  const [heroMirrorIndex, setHeroMirrorIndex] = useState(0);
  const resultsRef = useRef(null);

  const handleBackToList = useCallback(() => {
    setSelectedMovie(null);
    setIsMinimized(true);
    // Smooth scroll back to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setIsMinimized]);

  const fetchTrending = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = isMovieApiConfigured() 
        ? await getTrendingMovies(p)
        : await getOPhimTrending(p);

      setTrending(data.results);
      setTotalPages(data.total_pages || 1);
      if (p === 1 && data.results.length > 0) {
        setHeroMovie(data.results[0]);
      }
    } catch (err) {
      setError(t('movies.fetchError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);
  
  useEffect(() => {
    if (heroMovie) {
        setHeroImgSrc(getMovieBackdrop(heroMovie.backdrop_path || heroMovie.poster_path));
        setHeroMirrorIndex(0);
    }
  }, [heroMovie]);

  const handleHeroImgError = () => {
    const mirrors = heroMovie?.image_mirrors || [];
    if (heroMirrorIndex < mirrors.length - 1) {
      const nextIndex = heroMirrorIndex + 1;
      setHeroMirrorIndex(nextIndex);
      setHeroImgSrc(mirrors[nextIndex]);
    }
  };

  const performSearch = useCallback(async (p = 1) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = isMovieApiConfigured()
        ? await searchMovies(query, p)
        : await searchOPhim(query, p);
      setResults(data.results);
      setTotalPages(data.total_pages || 1);
      
      if (p === 1 && data.results.length > 0) {
        setHeroMovie(data.results[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (!query) {
      fetchTrending(page);
    } else {
      performSearch(page);
    }
  }, [page, query, fetchTrending, performSearch]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMovieClick = async (movie) => {
    setLoading(true);
    try {
      const details = isMovieApiConfigured()
        ? await getMovieDetails(movie.id)
        : await getOPhimDetails(movie.id);
      setSelectedMovie(details);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const startWatching = (movie) => {
    let embedUrl = null;
    if (movie.source === 'ophim' && movie.episodes) {
      if (Array.isArray(movie.episodes)) {
        for (const ep of movie.episodes) {
          if (ep.link_embed) {
            embedUrl = ep.link_embed;
            break;
          }
        }
      }
    }

    if (embedUrl) {
      onVideoSelect({
        id: movie.id,
        title: movie.title,
        description: movie.description || movie.overview,
        thumbnail: movie.poster_path,
        url: embedUrl,
        isEmbed: true,
        embedUrl: embedUrl,
        movieSource: 'ophim'
      });
      setSelectedMovie(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Không tìm thấy nguồn phát trực tiếp cho phim này. Vui lòng thử lại sau.');
    }
  };

  const MovieCard = ({ movie }) => {
    const [imgSrc, setImgSrc] = React.useState(getMoviePoster(movie.poster_path));
    const [mirrorIndex, setMirrorIndex] = React.useState(0);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const mirrors = movie.image_mirrors || [];

    const handleImgError = useCallback(() => {
      if (mirrorIndex < mirrors.length - 1) {
        const nextIndex = mirrorIndex + 1;
        setMirrorIndex(nextIndex);
        setImgSrc(mirrors[nextIndex]);
      }
    }, [mirrorIndex, mirrors]);

    useEffect(() => {
      if (!isLoaded && mirrorIndex < mirrors.length - 1) {
        const timeout = setTimeout(() => {
          if (!isLoaded) handleImgError();
        }, 5000);
        return () => clearTimeout(timeout);
      }
    }, [mirrorIndex, isLoaded, handleImgError]);

    return (
      <div 
        className="group relative surface-low rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl"
        onClick={() => handleMovieClick(movie)}
      >
        <div className="aspect-video relative overflow-hidden bg-cinema-surface-lowest">
          {!isLoaded && <div className="absolute inset-0 animate-shimmer" />}
          <img 
            src={imgSrc} 
            alt={movie.title}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={handleImgError}
            className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-110`}
          />
          <div className="absolute inset-0 thumbnail-fade opacity-80" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <Play className="w-4 h-4 text-black fill-black" />
                   </div>
                   <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                   </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                   <Info className="w-4 h-4 text-white" />
                </div>
             </div>
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="text-[11px] font-bold text-white truncate uppercase tracking-wider">
            {movie.title}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-[9px] font-bold text-cinema-red">{movie.vote_average?.toFixed(1)} / 10</span>
            <span className="text-[9px] text-white/40">•</span>
            <span className="text-[9px] text-white/40">{movie.release_date?.split('-')[0]}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen surface-lowest text-white pb-20 animate-fade-in relative overflow-hidden">
      {/* Hero Section */}
      {heroMovie && (
        <div className="relative h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <img 
              key={`${heroMovie.id}-${heroMirrorIndex}`}
              src={heroImgSrc} 
              onError={handleHeroImgError}
              className="w-full h-full object-cover opacity-60 scale-105 transition-all duration-1000 ease-in-out animate-ken-burns"
              alt={heroMovie.title}
            />
            <div className="absolute inset-0 hero-fade" />
            <div className="absolute inset-0 bg-gradient-to-r from-cinema-black via-cinema-black/60 to-transparent" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-20 space-y-6 max-w-4xl">
            {/* Back Button for Detail View */}
            {selectedMovie && (
              <button 
                onClick={handleBackToList}
                className="group flex items-center space-x-2 text-white/60 hover:text-white transition-colors duration-300 w-fit"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">QUAY LẠI DANH SÁCH</span>
              </button>
            )}

            <div className="flex items-center space-x-4 text-cinema-red font-bold tracking-[0.3em] text-[10px]">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>SỰ KIỆN NỔI BẬT HÔM NAY</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center space-x-2 text-white">
                <Star className="w-3 h-3 text-cinema-red fill-cinema-red" />
                <span>{heroMovie.vote_average?.toFixed(1)} / 10</span>
              </div>
            </div>
            
            <h1 className="display-lg text-white">
              {heroMovie.title}
            </h1>
            
            <p className="body-variant max-w-xl line-clamp-3 md:line-clamp-none">
              {heroMovie.overview || "Khám phá câu chuyện điện ảnh đầy mê hoặc với những cảnh quay đỉnh cao và diễn xuất ấn tượng."}
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={() => handleMovieClick(heroMovie)}
                className="btn-cinema"
              >
                <Play className="w-5 h-5 mr-3 fill-white" />
                CHI TIẾT PHIM
              </button>
              <button 
                className="btn-cinema-ghost"
                onClick={() => toast.success('Đã thêm vào danh sách yêu thích')}
              >
                <Plus className="w-5 h-5 mr-3" />
                YÊU THÍCH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Glass Search */}
      <div className={`sticky top-20 z-40 px-10 md:px-20 transition-all duration-500 ${selectedMovie ? 'opacity-0 pointer-events-none' : 'opacity-100 py-8'}`}>
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-cinema-gray group-focus-within:text-cinema-red transition-colors w-4 h-4" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tên phim, thể loại, diễn viên..."
              className="w-full pl-14 pr-6 py-4 bg-transparent border-b border-white/10 text-white placeholder:text-cinema-gray-variant/30 text-xs font-bold uppercase tracking-[0.2em] focus:ring-0 focus:border-cinema-red focus:bg-white/[0.02] transition-all outline-none"
            />
            {query && (
                <button 
                    type="button"
                    onClick={() => { setQuery(''); setResults([]); setPage(1); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
          </div>
        </form>
      </div>

      {/* Detailed Movie View (Modified Overlay Style) */}
      {selectedMovie && (
        <div className="relative z-50 animate-slide-up px-10 md:px-20 py-10">
          <div className="glass-card grid grid-cols-1 md:grid-cols-12 gap-0">
             <div className="md:col-span-4 relative aspect-[2/3]">
                <img 
                    src={getMoviePoster(selectedMovie.poster_path)} 
                    className="w-full h-full object-cover"
                    alt={selectedMovie.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-transparent" />
             </div>
             
             <div className="md:col-span-8 p-10 flex flex-col justify-center space-y-8 surface-low">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="display-lg text-white">
                      {selectedMovie.title}
                    </h2>
                    <button 
                      onClick={() => setSelectedMovie(null)}
                      className="p-3 hover:bg-white/10 rounded-full transition-all"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold uppercase tracking-[0.2em] text-cinema-gray-variant">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-cinema-red fill-cinema-red" />
                      <span className="text-white">{selectedMovie.vote_average?.toFixed(1)} / 10</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{selectedMovie.release_date}</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{selectedMovie.runtime} MINS</span>
                  </div>
                </div>
                
                <p className="body-variant text-base leading-relaxed max-w-2xl">
                  {selectedMovie.overview || selectedMovie.description}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => startWatching(selectedMovie)}
                    className="btn-cinema px-12 py-4"
                  >
                    <Play className="w-5 h-5 mr-3 fill-white" />
                    PHÁT NGAY
                  </button>
                  <button 
                    className="btn-cinema-ghost px-12 py-4"
                    onClick={() => setSelectedMovie(null)}
                  >
                    QUAY LẠI
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="px-10 md:px-20 space-y-20 relative z-10" id="cinema-hub-results" ref={resultsRef}>
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="headline-sm m-0">
              {results.length > 0 ? 'KẾT QUẢ TÌM KIẾM' : 'DANH SÁCH THỜI THƯỢNG'}
            </h2>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-cinema-red tracking-[0.2em]">
               <div className="w-2 h-2 rounded-full bg-cinema-red animate-pulse" />
               <span>TRỰC TIẾP TỪ SERVER</span>
            </div>
          </div>

          {loading && !trending.length && !results.length ? (
            <div className="py-32 flex flex-col items-center space-y-6">
              <Loader2 className="w-12 h-12 text-cinema-red animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-cinema-gray animate-pulse">Initializing Cinematic Buffer...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-6">
              {(results.length > 0 ? results : trending).map((movie, index) => (
                <MovieCard key={`${movie.id}-${index}`} movie={movie} />
              ))}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="pt-16 flex flex-col items-center space-y-8">
              <div className="flex items-center space-x-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pNum;
                    if (totalPages <= 5) pNum = i + 1;
                    else if (page <= 3) pNum = i + 1;
                    else if (page >= totalPages - 2) pNum = totalPages - 4 + i;
                    else pNum = page - 2 + i;
                    
                    return (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all text-sm font-bold ${
                          page === pNum 
                            ? 'bg-cinema-red border-cinema-red text-white shadow-lg shadow-cinema-red/20' 
                            : 'border-white/10 hover:border-white/30 text-cinema-gray'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20">
                FRAME {page} // {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cinema-red/40 to-transparent z-50 pointer-events-none" />
    </div>
  );
};

export default MovieExplorer;
