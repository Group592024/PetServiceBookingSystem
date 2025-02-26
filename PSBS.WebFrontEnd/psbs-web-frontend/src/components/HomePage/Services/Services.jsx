import React from "react";
import { motion } from "framer-motion";
import ServiceSlider from "../Services/ServiceSlider";

const Services = () => {
  return (
    <motion.section
      className="bg-gray-50 py-16 min-h-[600px] flex justify-center items-center px-6 select-none"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="max-w-5xl w-full flex flex-col items-center">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-[#2aa6df] mb-6 text-center"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          Our Services
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 text-center max-w-3xl mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
          We provide top-notch services to ensure your pets receive the best care. 
          From grooming to medical check-ups, we've got everything covered!
        </motion.p>
        <ServiceSlider />
      </div>
    </motion.section>
  );
};

export default Services;
