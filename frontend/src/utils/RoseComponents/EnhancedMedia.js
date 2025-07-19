import { useState } from 'react';
import { RoseLoader } from '../Loaders/RoseLoader';

const EnhancedMedia = ({ type, src, alt }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    setHasError(true);
    if (type === 'image') {
      setIsLoaded(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  if (hasError) {
    return <RoseLoader />;
  }

  return (
    <div className="cursor-pointer transition-transform hover:scale-105 relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <RoseLoader />
        </div>
      )}

      {type === 'image' ? (
        <img
          src={src}
          alt={alt || 'Изображение'}
          className={`w-auto h-auto max-h-32 object-contain rounded shadow-sm ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="relative">
          <video
            src={src}
            className={`w-auto h-auto max-h-32 object-contain rounded shadow-sm ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            muted
            onLoadedData={handleLoad}
            onError={handleError}
          >
            <source src={src} type="video/mp4" />
          </video>
          {isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white opacity-80"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedMedia;
