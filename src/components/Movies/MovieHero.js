import React, { useState, useEffect } from 'react';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { getMoviePoster } from '../../services/movieApi';

const MovieHero = ({ movie, onPlay, onInfo }) => {
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [bgSrc, setBgSrc] = useState('');

  useEffect(() => {
    if (movie) {
      setBackdropLoaded(false);
      setBgSrc(movie.backdrop_path || getMoviePoster(movie.poster_path));
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="relative group/hero h-[400px] md:h-[650px] overflow-hidden rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 bg-cinema-surface-lowest">
      {/* Background with cinematic fade */}
      <div className={`absolute inset-0 transition-all duration-1000 ${backdropLoaded ? 'scale-100 opacity-60' : 'scale-110 opacity-0'} group-hover/hero:scale-105 group-hover/hero:opacity-70 transition-transform duration-[12s] ease-linear`}>
        <img 
          src={bgSrc}
          alt="Hero Backdrop"
          onLoad={() => setBackdropLoaded(true)}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-surface via-cinema-surface/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cinema-surface-lowest via-cinema-surface-lowest/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-8 md:p-16 flex flex-col items-start space-y-6 max-w-4xl animate-slide-up">
        <div className="flex items-center space-x-3 mb-2 animate-fade-in delay-300">
           <span className="px-3 py-1 bg-cinema-red text-[10px] font-black uppercase text-white tracking-[0.2em] rounded-sm shadow-lg shadow-cinema-red/30">HÔM NAY CÓ GÌ</span>
           <div className="flex items-center space-x-1 px-3 py-1 bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gold rounded-sm border border-gold/40">
              <Star className="w-3 h-3 fill-gold" />
              <span>{movie.vote_average?.toFixed(1)} / 10</span>
           </div>
        </div>
        
        <h1 className="text-4xl md:text-8xl font-display font-black uppercase tracking-tighter text-white leading-[0.9] transition-all duration-700 hover:tracking-normal drop-shadow-2xl">
          {movie.title}
        </h1>
        
        <p className="text-sm md:text-xl text-white/70 max-w-2xl line-clamp-3 font-medium leading-relaxed drop-shadow-xl">
          {movie.overview}
        </p>

        <div className="flex items-center gap-4 pt-6">
          <button 
            onClick={() => onPlay(movie)}
            className="btn-cinema py-3 px-8 md:px-12 text-[11px] font-black tracking-[0.3em] uppercase flex items-center space-x-3 transition-transform hover:scale-105 active:scale-95 shadow-2xl shadow-cinema-red/30 group/play"
          >
            <Play className="w-4 h-4 fill-white group-hover/play:scale-110 transition-transform" />
            <span>XEM NGAY</span>
          </button>
          
          <button 
            onClick={() => onInfo(movie)}
            className="p-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/20 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group/info"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;
