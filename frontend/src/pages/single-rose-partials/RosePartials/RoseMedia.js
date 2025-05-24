import RosePhoto from './RoseMediaPhoto';
import RoseVideo from './RoseMediaVideo';
import EnhancedMedia from '../../../utils/RoseComponents/EnhancedMedia';
import { useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import RoseContext from '../../../context/RoseContext';
import { Helmet } from 'react-helmet';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

const RoseMedia = () => {
  const { rose } = useContext(RoseContext);
  const [currentMedia, setCurrentViewIndex] = useState(null);

  const mediaItems = [];

  if (rose.photo) {
    mediaItems.push({
      type: 'image',
      src: rose.photo,
      alt: rose.title,
      key: 'main-photo',
    });
  }

  if (rose.rosephotos && rose.rosephotos.length > 0) {
    rose.rosephotos.forEach((photo, index) => {
      if (photo && photo.photo) {
        mediaItems.push({
          type: 'image',
          src: photo.photo,
          alt: photo.descr || `${rose.title} - фото ${index + 1}`,
          key: `photo-${index}`,
          description: photo.descr,
          year: photo.year,
        });
      }
    });
  }

  if (rose.videos && rose.videos.length > 0) {
    rose.videos.forEach((video, index) => {
      if (video && video.video) {
        mediaItems.push({
          type: 'video',
          src: video.video,
          key: `video-${index}`,
          description: video.descr,
          year: video.year,
        });
      }
    });
  }

  const hasMedia = mediaItems.length > 0;
  const showArrows = mediaItems.length > 1;

  const handleNext = () => {
    setCurrentViewIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handlePrevious = () => {
    setCurrentViewIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentMedia === null) return;

      if (e.key === 'ArrowRight' && mediaItems.length > 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && mediaItems.length > 1) {
        handlePrevious();
      } else if (e.key === 'Escape') {
        setCurrentViewIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentMedia, mediaItems.length]);

  useEffect(() => {
    if (currentMedia !== null) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [currentMedia]);

  return (
    <>
      <Helmet>
        <title>{`${rose.title} | Медиа`}</title>
      </Helmet>

      {hasMedia ? (
        <div className="flex flex-col space-y-4 animate-fade-in">
          <h2 className="text-xl font-semibold mb-2">Галерея медиа</h2>

          <Splide
            aria-label="Медиа галерея"
            options={{
              width: '100%',
              height: '20rem',
              gap: '1rem',
              perPage: 1,
              pagination: mediaItems.length > 1,
              arrows: showArrows,
              lazyLoad: 'nearby',
              breakpoints: {
                640: {
                  height: '15rem',
                },
              },
            }}
          >
            {mediaItems.map((item, index) => (
              <SplideSlide key={item.key}>
                <div className="flex justify-center items-center h-full">
                  <div className="flex flex-col items-center">
                    <div
                      onClick={() => setCurrentViewIndex(index)}
                      className="cursor-pointer"
                    >
                      <EnhancedMedia type={item.type} src={item.src} alt={item.alt} />
                    </div>
                    {(item.description || item.year) && (
                      <div className="mt-2 text-center">
                        {item.description && (
                          <p className="text-sm">{item.description}</p>
                        )}
                        {item.year && (
                          <p className="text-xs text-gray-500">Год: {item.year}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </SplideSlide>
            ))}
          </Splide>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaItems.map((item, index) => (
              <div
                key={`thumb-${item.key}`}
                className="flex flex-col items-center"
                onClick={() => setCurrentViewIndex(index)}
              >
                <EnhancedMedia type={item.type} src={item.src} alt={item.alt} />
                {item.year && <p className="text-xs text-gray-500 mt-1">{item.year}</p>}
              </div>
            ))}
          </div>

          {currentMedia !== null &&
            createPortal(
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300"
                style={{ isolation: 'isolate' }}
              >
                {mediaItems.length > 1 && (
                  <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-3 transition-all hover:bg-opacity-70 hover:scale-110 z-[10000]"
                    onClick={handlePrevious}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center my-8">
                  {mediaItems[currentMedia].type === 'image' ? (
                    <img
                      src={mediaItems[currentMedia].src}
                      alt={mediaItems[currentMedia].alt || 'Увеличенное изображение'}
                      className="max-w-full max-h-[90vh] object-contain"
                    />
                  ) : (
                    <video
                      src={mediaItems[currentMedia].src}
                      className="max-w-full max-h-[90vh] object-contain"
                      controls
                      autoPlay
                    >
                      <source src={mediaItems[currentMedia].src} type="video/mp4" />
                    </video>
                  )}

                  {(mediaItems[currentMedia].description ||
                    mediaItems[currentMedia].year) && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 p-2 rounded text-white text-center">
                      {mediaItems[currentMedia].description && (
                        <p className="text-sm">
                          {mediaItems[currentMedia].description}
                        </p>
                      )}
                      {mediaItems[currentMedia].year && (
                        <p className="text-xs text-gray-300">
                          Год: {mediaItems[currentMedia].year}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Кнопка закрытия */}
                  <button
                    className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 transition-opacity duration-200 hover:bg-opacity-70"
                    onClick={() => setCurrentViewIndex(null)}
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

                {mediaItems.length > 1 && (
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-3 transition-all hover:bg-opacity-70 hover:scale-110 z-[10000]"
                    onClick={handleNext}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
                {mediaItems.length > 1 && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {mediaItems.map((_, index) => (
                      <button
                        key={`indicator-${index}`}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentMedia
                            ? 'bg-white'
                            : 'bg-gray-500 hover:bg-gray-300'
                        }`}
                        onClick={() => setCurrentViewIndex(index)}
                        aria-label={`Перейти к изображению ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>,
              document.body
            )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">Медиа контент отсутствует</div>
      )}

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Управление медиа</h2>
        <div className="bg-gray-50 rounded-lg">
          <RosePhoto />
        </div>
        <div className="bg-gray-50 rounded-lg mt-4">
          <RoseVideo />
        </div>
      </div>
    </>
  );
};

export default RoseMedia;
