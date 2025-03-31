import { useState, useRef, useEffect } from 'react';
import { RoseLoader } from '../Loaders/RoseLoader';

const EnhancedMedia = ({ type, src, alt, thumbnail = true }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const mediaRef = useRef(null);
  const containerRef = useRef(null);

  const isImage = type === 'image';

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const toggleZoom = () => {
    if (hasError) return;

    setIsZoomed(!isZoomed);
    if (type === 'video' && isZoomed) {
      if (mediaRef.current) {
        mediaRef.current.pause();
        setIsPlaying(false);
      }
    }
  };
  const togglePlay = (e) => {
    e.stopPropagation();
    if (type === 'video' && isZoomed) {
      if (mediaRef.current) {
        if (isPlaying) {
          mediaRef.current.pause();
        } else {
          mediaRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  const handleError = () => {
    setHasError(true);
    if (type === 'image') {
      setIsLoaded(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsZoomed(false);
      if (type === 'video' && mediaRef.current) {
        mediaRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isZoomed) {
      setIsZoomed(false);
      if (type === 'video' && mediaRef.current) {
        mediaRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (isZoomed) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZoomed]);

  if (hasError) {
    return <RoseLoader />;
  }

  return (
    <>
      {/* Миниатюра */}
      <div
        className="cursor-pointer transition-transform hover:scale-105 relative"
        onClick={toggleZoom}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RoseLoader />
          </div>
        )}

        {isImage ? (
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

      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300">
          <div
            ref={containerRef}
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
          >
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RoseLoader />
              </div>
            )}

            {isImage ? (
              <img
                src={src}
                alt={alt || 'Увеличенное изображение'}
                className={`max-w-full max-h-[90vh] object-contain ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                onClick={toggleZoom}
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : (
              <div className="relative">
                <video
                  ref={mediaRef}
                  src={src}
                  className={`max-w-full max-h-[90vh] object-contain ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                  controls={false}
                  autoPlay={false}
                  onClick={togglePlay}
                  onLoadedData={handleLoad}
                  onError={handleError}
                >
                  <source src={src} type="video/mp4" />
                </video>

                {!isPlaying && isLoaded && (
                  <button
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-3 transition-opacity duration-200 hover:bg-opacity-70"
                    onClick={togglePlay}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}

                {isLoaded && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <button
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 transition-opacity duration-200 hover:bg-opacity-70"
              onClick={toggleZoom}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedMedia;
