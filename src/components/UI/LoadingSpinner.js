import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message, size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600 dark:text-primary-400`} />
        <div className="absolute inset-0 rounded-full border-2 border-primary-200 dark:border-primary-800 animate-pulse"></div>
      </div>
      {message && (
        <p className="text-gray-600 dark:text-gray-400 text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
