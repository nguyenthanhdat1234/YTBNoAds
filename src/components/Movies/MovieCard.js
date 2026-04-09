import React, { useCallback, useEffect } from 'react';
import { Play, Plus, Info } from 'lucide-react';
import { getMoviePoster } from '../../services/movieApi';
import toast from 'react-hot-toast';

const MovieCard = ({ movie, onClick }) => {
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
      onClick={() => onClick(movie)}
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
                 <button 
                  onClick={(e) => { e.stopPropagation(); toast.success('Đã thêm vào danh sách'); }}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    <Plus className="w-4 h-4 text-white" />
                 </button>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
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

export default MovieCard;
