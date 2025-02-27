import React, { useState } from "react";
import { motion } from "framer-motion";
import Img1 from "../../../assets/HomePage/about/img1.png";
import Arrow from "../../../assets/HomePage/about/icons8-arrow-down-50.png";

const About = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const abouts = [
    {
      Title: "How Our Shop Pet Care Started",
      content:
        "We started our pet care shop from a deep passion for animals. Initially, we offered basic care services and gradually expanded into other services such as health care and pet training. We are committed to providing a safe and friendly environment for every pet we serve.",
    },
    {
      Title: "Mission Statement",
      content:
        "Our mission is to provide high-quality pet care services, ensuring the satisfaction of both pets and their owners. We not only care for pets but also educate owners on the best ways to care for their pets, creating a community that loves animals.",
    },
    {
      Title: "Value Added Services",
      content:
        "We offer a variety of value-added services to ensure that your pets are always healthy and happy. This includes services such as bathing, grooming, nutritional consulting, and training. We continuously update the latest trends in the pet care industry to serve our customers best.",
    },
    {
      Title: "Social Responsibility",
      content:
        "We believe in contributing to the community and society. We participate in animal protection activities and support charities related to pets. In this way, we not only help animals but also raise community awareness about the responsibility of caring for animals.",
    },
  ];

  return (
    <section
      className="bg-gradient-to-b from-blue-100 to-cyan-100 min-h-[760px] flex justify-center items-center text-white py-16 px-4 sm:px-6"
      style={{ userSelect: "none" }}
    >
      <motion.div
        className="max-w-6xl flex flex-col md:flex-row gap-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6 text-center md:text-left text-[#1182c5]">
            Welcome To Our Family
          </h2>
          <p className="mb-6 text-lg text-gray-800 leading-relaxed text-center md:text-left">
            We are dedicated to providing exceptional pet care. Our journey
            began with basic services and has expanded to include grooming,
            health care, training, and many more. We strive to create a
            nurturing environment for pets while educating their owners on
            proper care, enhancing their well-being, and strengthening the bond
            between pets and their families.
          </p>
          <ul className="space-y-5">
            {abouts.map((about, index) => (
              <li key={index} className="border-b border-gray-400 pb-3">
                <button
                  className="w-full flex justify-between items-center text-lg font-semibold focus:outline-none transition-all duration-300 text-[#2aa6df] hover:text-orange-500"
                  onClick={() => toggleDropdown(index)}
                >
                  {about.Title}
                  <motion.img
                    src={Arrow}
                    width={30}
                    height={30}
                    alt="dropdown icon"
                    animate={{
                      rotate: openDropdown === index ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: openDropdown === index ? "auto" : 0,
                    opacity: openDropdown === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden mt-2 text-gray-800 text-base leading-relaxed"
                >
                  {about.content}
                </motion.div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <motion.img
            src={Img1}
            width={520}
            height={520}
            alt="Pet Care"
            className="rounded-2xl w-full max-w-sm md:max-w-md"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default About;
