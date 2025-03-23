import RosePhoto from "./RoseMediaPhoto";
import RoseVideo from "./RoseMediaVideo";
import { useState,useContext } from "react";
import RoseContext from "../../../context/RoseContext";
import { RoseLoader } from "../../../utils/Loaders/RoseLoader";
import { Helmet } from 'react-helmet';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

const RoseMedia = () => {
    const { rose } = useContext(RoseContext);
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (itemKey) => {
        setImageErrors(prev => ({
            ...prev,
            [itemKey]: true
        }));
    };
    const mediaItems = [];
    
    if (rose.photo) {
        mediaItems.push({
            type: 'photo',
            src: rose.photo,
            alt: rose.title,
            key: 'main-photo'
        });
    }
    
    if (rose.rosephotos && rose.rosephotos.length > 0) {
        rose.rosephotos.forEach((photo, index) => {
            if (photo && photo.photo) {
                mediaItems.push({
                    type: 'photo',
                    src: photo.photo,
                    alt: photo.descr || `${rose.title} - фото ${index + 1}`,
                    key: `photo-${index}`
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
                    key: `video-${index}`
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
                <div className="flex justify-center items-center animate-fade-in">
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
                                }
                            }
                        }}
                    >
                        
                        {mediaItems.map(item => (
                            <SplideSlide key={item.key}>
                                <div className="flex justify-center items-center h-full">
                                    {item.type === 'photo' ? (
                                        imageErrors[item.key] ? (
                                            <RoseLoader />
                                        ) : (
                                            <img 
                                                src={item.src} 
                                                alt={item.alt}
                                                className="max-h-full max-w-full object-contain"
                                                onError={() => handleImageError(item.key)}
                                            />
                                        )
                                    ) : (
                                        <video 
                                            controls
                                            className="max-h-full max-w-full"
                                        >
                                            <source src={item.src} type="video/mp4" />
                                            Ваш браузер не поддерживает видео.
                                        </video>
                                    )}
                                </div>
                            </SplideSlide>
                        ))}
                    </Splide>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    Медиа контент отсутствует
                </div>
            )}
            
            <RosePhoto />
            <RoseVideo />
        </>
    );
};

export default RoseMedia