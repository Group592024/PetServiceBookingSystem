import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/autoplay";
import Service1Icon from "../../../assets/HomePage/services/service-icon1.svg";
import Service2Icon from "../../../assets/HomePage/services/service-icon2.svg";
import Service3Icon from "../../../assets/HomePage/services/pet-boarding.png";

const services = [
  {
    image: Service1Icon,
    name: "Medical",
    description:
      "Includes regular veterinary check-ups, vaccinations, and other medical services to keep your pets healthy.",
    btnText: "Explore",
    type: "Medical",
  },
  {
    image: Service2Icon,
    name: "Grooming",
    description:
      "Offers bathing, haircuts, nail trimming, and ear cleaning to keep your pets clean and well-groomed.",
    btnText: "Explore",
    type: "Grooming",
  },
  {
    image: Service3Icon,
    name: "Hotel",
    description:
      "Book short-term or long-term stays at our pet shop, ensuring your pets are well cared for while you are away.",
    btnText: "Explore",
    type: "Room",
  },
];

const ServiceSlider = () => {
  const navigate = useNavigate();

  const handleExploreClick = (type) => {
    if (type === "Room") {
      navigate("/customerRoom");
    } else {
      navigate(`/customer/services?type=${type}`);
    }

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="w-full"
    >
      <Swiper
        slidesPerView={1}
        spaceBetween={20}
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 30 },
          1024: { slidesPerView: 2, spaceBetween: 40 },
        }}
        className="w-full"
      >
        {services.map((service, index) => (
          <SwiperSlide key={index}>
            <motion.div
              className="flex flex-col items-center bg-[#2aa6df] rounded-3xl p-6 max-w-lg mx-auto transition-transform duration-300 hover:scale-105"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <img className="w-24 mb-4" src={service.image} alt={service.name} />
              <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
              <p className="text-base text-white mb-4 text-center">{service.description}</p>
              <button
                className="bg-[#4A90E2] hover:bg-[#357ABD] text-white px-6 py-2 rounded-full transition-all duration-300"
                onClick={() => handleExploreClick(service.type)}
              >
                {service.btnText}
              </button>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default ServiceSlider;
