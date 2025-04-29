import RosePhoto from './RoseMediaPhoto';
import RoseVideo from './RoseMediaVideo';
import EnhancedMedia from '../../../utils/RoseComponents/EnhancedMedia';
import { useContext } from 'react';
import RoseContext from '../../../context/RoseContext';
import { Helmet } from 'react-helmet';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

const RoseMedia = () => {
  const { rose } = useContext(RoseContext);

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
            {mediaItems.map((item) => (
              <SplideSlide key={item.key}>
                <div className="flex justify-center items-center h-full">
                  <div className="flex flex-col items-center">
                    <EnhancedMedia type={item.type} src={item.src} alt={item.alt} />
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
            {mediaItems.map((item) => (
              <div key={`thumb-${item.key}`} className="flex flex-col items-center">
                <EnhancedMedia type={item.type} src={item.src} alt={item.alt} />
                {item.year && <p className="text-xs text-gray-500 mt-1">{item.year}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">Медиа контент отсутствует</div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Управление медиа</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <RosePhoto />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <RoseVideo />
        </div>
      </div>
    </>
  );
};

export default RoseMedia;
