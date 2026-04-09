import React, { useState, useEffect } from 'react';
import { X, Play, Share2, Plus, Star, Calendar, Clock, Globe } from 'lucide-react';
import { getMoviePoster, searchMovies, getMovieStream } from '../../services/movieApi';

const MovieDetails = ({ movie, onClose, onPlay }) => {
  const [details, setDetails] = useState(movie);
  const [loading, setLoading] = useState(false);
  const [backdropLoaded, setBackdropLoaded] = useState(false);

  // Auto-close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    // If the movie object is from TMDb but low detail, we can enrich it
    // But for simplicity in this refactor, we already have good data from state
    if (movie) {
      setDetails(movie);
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-3xl transition-all duration-700"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto no-scrollbar bg-cinema-surface border border-white/5 shadow-[0_40px_120px_rgba(0,0,0,1)] rounded-sm group/details">
        {/* Background Image Banner */}
        <div className="relative h-[300px] md:h-[500px] overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-1000 ${backdropLoaded ? 'opacity-40' : 'opacity-0'}`}>
            <img 
              src={details.backdrop_path || getMoviePoster(details.poster_path)}
              alt="Backdrop"
              onLoad={() => setBackdropLoaded(true)}
              className="w-full h-full object-cover scale-105 group-hover/details:scale-110 transition-transform duration-[15s] ease-linear"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-surface via-cinema-surface/60 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 bg-black/40 hover:bg-cinema-red text-white backdrop-blur-xl border border-white/10 rounded-full transition-all duration-300 z-10 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="relative -mt-[150px] md:-mt-[250px] px-6 md:px-12 pb-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            
            {/* Poster Pillar */}
            <div className="flex-shrink-0 w-48 md:w-72 hidden md:block animate-slide-up">
              <div className="aspect-[2/3] rounded-sm overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/5 relative group/poster">
                <img 
                  src={getMoviePoster(details.poster_path)} 
                  alt={details.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-110"
                />
              </div>
            </div>

            {/* Content Pillar */}
            <div className="flex-grow space-y-6 md:space-y-8 py-4">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                   <span className="px-2 py-1 bg-cinema-red text-[9px] font-black uppercase text-white tracking-widest rounded-sm shadow-lg shadow-cinema-red/20 opacity-90 animate-pulse">Phổ biến</span>
                   <span className="flex items-center space-x-1 px-2 py-1 bg-white/10 text-[9px] font-black uppercase tracking-widest text-gold rounded-sm border border-gold/20">
                      <Star className="w-2.5 h-2.5 fill-gold" />
                      <span>{details.vote_average?.toFixed(1)} / 10</span>
                   </span>
                </div>
                <h2 className="text-4xl md:text-7xl font-display font-black uppercase tracking-tight text-white leading-tight animate-slide-up">
                  {details.title}
                </h2>
                <p className="text-[10px] md:text-sm font-bold text-cinema-gray uppercase tracking-[0.2em]">
                  {details.tagline || details.original_title}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 py-2 border-y border-white/5">
                <div className="flex items-center space-x-2 text-cinema-gray">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{details.release_date?.split('-')[0]}</span>
                </div>
                <div className="flex items-center space-x-2 text-cinema-gray border-l border-white/5 pl-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{details.runtime || 120} Phút</span>
                </div>
                <div className="flex items-center space-x-2 text-cinema-gray border-l border-white/5 pl-4">
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Việt Nam</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cinema-red">Nội dung tóm tắt</h3>
                <p className="text-sm md:text-lg text-white/70 leading-relaxed font-medium max-w-3xl">
                  {details.overview || 'Đang cập nhật nội dung cho tác phẩm này...'}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-4 pt-8 md:pt-12">
                <button 
                  onClick={() => onPlay(details)}
                  className="btn-cinema py-3 px-8 text-[11px] font-black tracking-[0.3em] uppercase flex items-center space-x-3 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-cinema-red/10"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>XEM NGAY</span>
                </button>
                <button className="flex items-center space-x-3 py-3 px-8 text-[11px] font-black text-white hover:text-cinema-red tracking-[0.3em] uppercase bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-all">
                  <Plus className="w-4 h-4" />
                  <span>Lưu lại</span>
                </button>
                <button className="p-3 text-cinema-gray hover:text-white transition-colors border border-white/5 rounded-full hover:bg-white/5">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
