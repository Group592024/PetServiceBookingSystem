import React from "react";
import { motion } from "framer-motion";
import ReviewSlider from "./ReviewSlider";

const Review = () => {
  return (
    <motion.section
      className="py-20 bg-gradient-to-b from-cyan-100 to-cyan-200"
      style={{ userSelect: "none" }} 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, ease: "easeOut" }} 
      viewport={{ once: true }} 
    >
      <div className="max-w-5xl mx-auto text-center px-6">
        <motion.h3
          className="text-lg text-[#1182c5] font-semibold tracking-wide uppercase"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Our Reviews
        </motion.h3>
        <motion.h1
          className="text-4xl font-bold text-gray-900 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          What People Say
        </motion.h1>
        <div className="mt-6">
          <ReviewSlider />
        </div>
      </div>
    </motion.section>
  );
};

export default Review;
