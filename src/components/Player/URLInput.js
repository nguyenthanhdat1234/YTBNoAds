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
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('urlInput.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('urlInput.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LinkIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('urlInput.placeholder')}
            className="input-field pl-10 pr-20 text-lg"
            disabled={loading}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
            <button
              type="button"
              onClick={handlePaste}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              disabled={loading}
            >
              {t('urlInput.paste')}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={!url.trim() || loading}
            className="btn-primary flex-1 flex items-center justify-center space-x-2 text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('urlInput.loading')}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>{t('urlInput.play')}</span>
              </>
            )}
          </button>
        </div>
      </form>


    </div>
  );
};

export default URLInput;
