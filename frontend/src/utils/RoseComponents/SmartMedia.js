import { useState } from 'react';
import { RoseLoader } from '../Loaders/RoseLoader';

const SmartMedia = ({
  type,
  src,
  alt,
  className,
  loaderId,
  controls = true,
  ...props
}) => {
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
    <div className="relative w-full h-full flex items-center justify-center">
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          id={loaderId || `loader-${alt?.replace(/\s+/g, '-') || 'media'}`}
        >
          <RoseLoader />
        </div>
      )}

      {type === 'image' ? (
        <img
          src={src}
          alt={alt || 'Изображение'}
          className={`${className || ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 max-h-full`}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      ) : (
        <video
          className={`${className || ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          controls={controls}
          onError={handleError}
          onLoadedData={handleLoad}
          {...props}
        >
          <source src={src} type="video/mp4" />
          <RoseLoader />
        </video>
      )}
    </div>
  );
};

export default SmartMedia;
