import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Pagination, Navigation, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { MovieDetails } from '../utils/types';

SwiperCore.use([Pagination, Navigation, Autoplay]);
  
interface CarouselProps {
    newMovies: MovieDetails[];
}
  
const Carousel = ({ newMovies }: CarouselProps) => {

return (
    <Swiper
      spaceBetween={0}
      slidesPerView={1}
      breakpoints={{
        380: {
          slidesPerView: 1,
        },
        500: {
          slidesPerView: 2,
        },
        960: {
          slidesPerView: 3,
        },
        1280: {
          slidesPerView: 4,
        },
        1600: {
          slidesPerView: 5,
        },
        1920: {
          slidesPerView: 6,
        },
      }}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      loop
    >
      {newMovies.map(movie => (
        <SwiperSlide key={movie.id}>
          <img
            src={
              movie.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
              : "/no-image2.jpg"
            }
            alt={movie.title}
            width="480"
            height="270"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;
