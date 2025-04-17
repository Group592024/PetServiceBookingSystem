import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "../../../assets/HomePage/hero/blue-pattern.png";
import Pet1Img from "../../../assets/HomePage/hero/shiba.jpg";
import Pet2Img from "../../../assets/HomePage/hero/beagle.jpg";
import Pet3Img from "../../../assets/HomePage/hero/Bengal.jpg";
import Pet4Img from "../../../assets/HomePage/hero/British Longhair.jpg";
import Pet5Img from "../../../assets/HomePage/hero/Burmilla.jpg";
import Pet6Img from "../../../assets/HomePage/hero/Canis lupus familiaris.jpg";
import Pet7Img from "../../../assets/HomePage/hero/Chartreux.jpg";
import Pet9Img from "../../../assets/HomePage/hero/LaPerm.jpg";
import Pet10Img from "../../../assets/HomePage/hero/pomeranian.jpg";

const pets = [
  { id: 1, category: "dog", name: "Shiba Inu", image: Pet1Img, description: "A loyal and spirited Japanese breed." },
  { id: 2, category: "dog", name: "Beagle", image: Pet2Img, description: "Friendly and curious, perfect for families." },
  { id: 3, category: "cat", name: "Bengal", image: Pet3Img, description: "Playful, energetic, with wild markings." },
  { id: 4, category: "cat", name: "British Longhair", image: Pet4Img, description: "A fluffy and affectionate breed." },
  { id: 5, category: "cat", name: "Burmilla", image: Pet5Img, description: "A rare breed with a shimmering coat." },
  { id: 6, category: "dog", name: "Bulldog", image: Pet6Img, description: "A calm and courageous companion." },
  { id: 7, category: "cat", name: "Chartreux", image: Pet7Img, description: "A quiet, intelligent French cat breed." },
  { id: 8, category: "cat", name: "LaPerm", image: Pet9Img, description: "Known for its curly coat and affection." },
  { id: 9, category: "dog", name: "Pomeranian", image: Pet10Img, description: "A tiny but bold fluffy companion." },
];

const Hero = () => {
  const [petDetails, setPetDetails] = useState(pets[0]);
  const [petIndex, setPetIndex] = useState(0);

  const getPetDetails = (id) => {
    const pet = pets.find((pet) => pet.id === id);
    setPetDetails(pet);
  };

  return (
    <motion.section
      className="bg-cover bg-center min-h-[650px] flex items-center px-4 sm:px-8 md:px-12 lg:px-16 py-12 relative select-none"
      style={{ backgroundImage: `url(${heroBg})` }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="flex flex-col lg:flex-row w-full justify-between items-center gap-8 lg:gap-0 mt-[-30px]">
        {/* Left - Text */}
        <motion.div
          className="max-w-3xl text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase leading-tight">
            Unleash<br />
            <span className="text-orange-500 inline-block animate-pulse">
              the Power
            </span>
            <br />
            of PetEase
          </h1>
          <Link to="/customer/services">
            <button className="mt-6 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md transition-transform hover:bg-orange-600 hover:-translate-y-1">
              Start Your Journey
            </button>
          </Link>
        </motion.div>

        {/* Center - Pet Details */}
        <motion.div className="flex flex-col items-center space-y-4 mt-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold capitalize bg-gradient-to-l from-[#ff9933] via-[#d2691e] to-[#8B4513] bg-clip-text text-transparent">
            {petDetails.category}
          </div>
          <div className="text-lg sm:text-xl uppercase mb-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
            {petDetails.name}
          </div>
          <div className="text-sm sm:text-md text-center bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent px-4 sm:px-6 mt-2 sm:mt-4">
            {petDetails.description}
          </div>
          <div className="w-44 h-44 sm:w-56 sm:h-56 border-4 border-white rounded-full overflow-hidden">
            <img
              src={petDetails.image}
              alt={petDetails.name}
              className="w-full h-full object-cover"
              draggable="false"
            />
          </div>
        </motion.div>

        {/* Right - Pet Thumbnails */}
        <motion.div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mt-6 lg:mt-0">
          {pets.map((pet, index) => (
            <div
              key={pet.id}
              onClick={() => {
                getPetDetails(pet.id);
                setPetIndex(index);
              }}
              className="relative cursor-pointer w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden transition-transform hover:scale-110 shadow-lg"
            >
              <div
                className={`absolute inset-0 rounded-full ${petIndex === index
                  ? "bg-white/40 border-4 border-white"
                  : "bg-black/40"
                  }`}
              ></div>
              <img
                src={pet.image}
                alt={pet.name}
                className="w-full h-full object-cover rounded-full"
                draggable="false"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;
