import React, { useEffect, useRef, useState } from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import { useNavigate } from "react-router-dom";
import ServiceCardList from "../../../components/ServiceCustomer/ServiceCardList";
import { motion, AnimatePresence } from "framer-motion";
import banner1 from "../../../assets/Service/banner1.jpeg";
import banner2 from "../../../assets/Service/banner2.jpg";
import banner3 from "../../../assets/Service/banner3.jpg";

const banners = [
  {
    id: 1,
    image: banner1,
    title: "Premium Pet Care Services",
    description:
      "Providing the best care and love for your pets with professional services.",
  },
  {
    id: 2,
    image: banner2,
    title: "Luxury Grooming & Spa",
    description:
      "Give your pets a luxurious experience with our top-notch grooming services.",
  },
  {
    id: 3,
    image: banner3,
    title: "24/7 Veterinary Support",
    description:
      "Ensuring your pet's health with round-the-clock veterinary support and care.",
  },
];

const ServiceListPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000); // Change banner every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDataFunction = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/Service?showAll=false",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        id: item.serviceId,
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);

  return (
    <div>
      <NavbarCustomer />

      {/* Banner Slider */}
      <div className="relative w-full h-[400px] overflow-hidden rounded-b-3xl shadow-lg">
        <AnimatePresence>
          {banners.map(
            (banner, index) =>
              index === currentIndex && (
                <motion.div
                  key={banner.id}
                  className="absolute inset-0 flex items-center justify-center bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.image})` }}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 1 }}
                >
                  <div className="bg-black bg-opacity-50 p-10 rounded-xl text-center text-white max-w-2xl">
                    <h2 className="text-4xl font-bold">{banner.title}</h2>
                    <p className="text-xl mt-3">{banner.description}</p>
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Service Section */}
      <div className="flex justify-center p-5">
        <p className="text-3xl font-bold" data-testid="test-ne">
          Services For Your Pets
        </p>
      </div>
      <ServiceCardList data={data} />
    </div>
  );
};

export default ServiceListPage;
