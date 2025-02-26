import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Stars from '../../../assets/HomePage/review/Stars.jpg';
import P1 from '../../../assets/HomePage/review/1.jpg';
import P2 from '../../../assets/HomePage/review/2.jpg';
import P3 from '../../../assets/HomePage/review/3.jpg';
import P4 from '../../../assets/HomePage/review/4.jpg';
import P5 from '../../../assets/HomePage/review/5.jpg';

const reviews = [
  { image: P1, name: 'Alex Smith', description: 'The veterinary team is professional and caring, providing excellent health check-ups and vaccinations. Highly recommend!' },
  { image: P2, name: 'Daniel Tuner', description: 'Great experience! The vets are knowledgeable and explain everything clearly about my pet health.' },
  { image: P3, name: 'Jacey Maragrett', description: 'Outstanding pet care services! The staff is friendly and my pet always looks great after grooming.' },
  { image: P4, name: 'Elizebeth Swan', description: 'I love their grooming services! My pet comes home clean and happy every time.' },
  { image: P5, name: 'Ethan Dane', description: 'The pet grooming service exceeded my expectations! The staff was attentive and made my dog feel comfortable. He looked fantastic after the grooming session. Highly recommend for anyone looking to pamper their pets!' },
];

const ReviewSlider = () => {
  return (
    <div className="relative">
      <Swiper
        spaceBetween={20}
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        className="py-8 !pb-12" 
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform relative">
              <div className="flex flex-col items-center">
                <img className="w-24 h-24 rounded-full mb-4" src={review.image} alt={review.name} />
                <div className="text-xl font-semibold text-gray-700">{review.name}</div>
              </div>
              <div className="my-2">
                <img src={Stars} alt="stars" className="w-28" />
              </div>
              <p className="text-gray-600 text-center">{review.description}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewSlider;
