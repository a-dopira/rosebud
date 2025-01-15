import RosePhoto from "./RoseMediaPhoto";
import RoseVideo from "./RoseMediaVideo";
import { useContext } from "react";
import RoseContext from "../../context/RoseContext";
import { Helmet } from 'react-helmet';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

const RoseMedia = () => {

    const { rose } = useContext(RoseContext)

    return (
        <>
            <Helmet>
                <title>{`${rose.title} | Медиа`}</title>
            </Helmet>
            <div className="flex justify-center items-center animate-fade-in">
            <Splide
                aria-label="My Favorite Images"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                options={{
                    width: "20rem",
                    height: "20rem",
                    gap: "2rem",
                }}
            >
                <SplideSlide>
                    <img 
                        src={rose.photo} 
                        alt={rose.title}
                        style={{
                            objectFit: "contain",
                            width: "100%",
                            height: "100%"
                        }} 
                    />
                </SplideSlide>
                { 
                   rose.rosephotos && rose.rosephotos.length ? (
                        rose.rosephotos.map(photo => {
                            return (
                                <SplideSlide>
                                    {photo && photo.photo && <img src={photo.photo} alt={photo.descr} />}
                                </SplideSlide>
                            )
                        })
                        ) : null
                }
                { 
                    rose.videos && rose.videos.length ? (
                        rose.videos.map(video => {
                            return (
                                <SplideSlide key={video.id}>
                                    {video && video.video && 
                                        <video width="320" height="240" controls>
                                            <source src={video.video} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    }
                                </SplideSlide>
                            )
                        })
                    ) : null
                }
            </Splide>
            </div>
            <RosePhoto/>
            <RoseVideo/>
        </>
    )
}

export default RoseMedia