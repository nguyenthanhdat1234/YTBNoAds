import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Loader2, Link as LinkIcon } from 'lucide-react';

const URLInput = ({ onSubmit, loading }) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      onSubmit(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute inset-0 bg-cinema-red opacity-[0.03] blur-[100px] group-focus-within:opacity-[0.08] transition-opacity duration-1000" />
        
        <div className="relative flex flex-col sm:flex-row items-center gap-4 p-2 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-sm group-focus-within:border-white/10 group-focus-within:bg-white/[0.04] transition-all duration-500 shadow-2xl">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <LinkIcon className={`h-4 w-4 transition-colors duration-500 ${url ? 'text-cinema-red' : 'text-cinema-gray/30'}`} />
            </div>
            
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('urlInput.placeholder')}
              className="w-full bg-transparent border-none text-white placeholder:text-cinema-gray/20 pl-14 pr-32 py-5 text-sm font-medium focus:ring-0 transition-all tracking-wide"
              disabled={loading}
            />
            
            <button
              type="button"
              onClick={handlePaste}
              className="absolute inset-y-0 right-4 flex items-center px-4 text-[10px] font-black uppercase tracking-[0.2em] text-cinema-gray hover:text-white transition-all border-l border-white/5 h-1/2 my-auto"
              disabled={loading}
            >
              {t('urlInput.syncClip')}
            </button>
          </div>

          <button
            type="submit"
            disabled={!url.trim() || loading}
            className={`w-full sm:w-auto px-10 py-5 rounded-sm flex items-center justify-center space-x-3 transition-all duration-500 shadow-xl ${
              !url.trim() || loading 
                ? 'bg-white/5 text-cinema-gray/40 pointer-events-none opacity-50' 
                : 'bg-cinema-red text-white hover:bg-red-700 hover:scale-[1.02] shadow-cinema-red/20 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('urlInput.processingAssets')}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('urlInput.initializeSession')}</span>
              </>
            )}
          </button>
        </div>
        
        {/* Tracking Metadata */}
        <div className="mt-6 flex items-center justify-center space-x-8 opacity-40">
           <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-cinema-gray">
              <div className="w-1 h-1 bg-cinema-red rounded-full animate-pulse" />
              <span>{t('urlInput.engineActive')}</span>
           </div>
           <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-cinema-gray">
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <span>{t('urlInput.directorsCut')}</span>
           </div>
        </div>
      </form>
    </div>
  );
};

export default URLInput;
