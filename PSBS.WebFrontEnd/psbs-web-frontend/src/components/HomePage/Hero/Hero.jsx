import React, { useState } from 'react';
import heroBg from '../../../assets/HomePage/hero/blue-pattern.png';
import Pet1Img from '../../../assets/HomePage/hero/shiba.jpg';
import Pet2Img from '../../../assets/HomePage/hero/beagle.jpg';
import Pet3Img from '../../../assets/HomePage/hero/Bengal.jpg';
import Pet4Img from '../../../assets/HomePage/hero/British Longhair.jpg';
import Pet5Img from '../../../assets/HomePage/hero/Burmilla.jpg';
import Pet6Img from '../../../assets/HomePage/hero/Canis lupus familiaris.jpg';
import Pet7Img from '../../../assets/HomePage/hero/Chartreux.jpg';
import Pet9Img from '../../../assets/HomePage/hero/LaPerm.jpg';
import Pet10Img from '../../../assets/HomePage/hero/pomeranian.jpg';

const pets = [
  { id: 1, category: 'dog', name: 'shiba', image: Pet1Img },
  { id: 2, category: 'dog', name: 'beagle', image: Pet2Img },
  { id: 3, category: 'cat', name: 'Bengal', image: Pet3Img },
  { id: 4, category: 'cat', name: 'British Longhair', image: Pet4Img },
  { id: 5, category: 'cat', name: 'Burmilla', image: Pet5Img },
  { id: 6, category: 'dog', name: 'Bulldog', image: Pet6Img },
  { id: 7, category: 'cat', name: 'Chartreux', image: Pet7Img },
  { id: 8, category: 'cat', name: 'LaPerm', image: Pet9Img },
  { id: 9, category: 'dog', name: 'pomeranian', image: Pet10Img },
];

const Hero = () => {
  const [petDetails, setPetDetails] = useState(pets[0]);
  const [petIndex, setPetIndex] = useState(0);

  const getPetDetails = (id) => {
    const pet = pets.find((pet) => pet.id === id);
    setPetDetails(pet);
  };

  return (
    <section
      className="bg-cover bg-center min-h-[650px] flex items-start px-10 py-10 relative"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="flex w-full justify-between items-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase leading-tight">
          Unleash the <br />
            <span className="text-orange-500 inline-block animate-pulse">Power</span>
            <br />of PetEase 
          </h1>
          <button className="mt-6 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md transition-transform hover:bg-orange-600 hover:-translate-y-1">
            Learn more
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div
            className="text-2xl font-bold capitalize bg-gradient-to-l from-[#ff9933] via-[#d2691e] to-[#8B4513] bg-clip-text text-transparent"
          >
            {petDetails.category}
          </div>
          <div
            className="text-lg uppercase mb-4 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 bg-clip-text text-transparent"
          >
            {petDetails.name}
          </div>
          <div className="w-48 h-48 border-4 border-white rounded-full overflow-hidden">
            <img src={petDetails.image} alt={petDetails.name} className="w-full h-auto" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 justify-center max-w-md">
          {pets.map((pet, index) => (
            <div
              key={pet.id}
              onClick={() => {
                getPetDetails(pet.id);
                setPetIndex(index);
              }}
              className="relative cursor-pointer w-24 h-24 rounded-full overflow-hidden transition-transform hover:scale-110 shadow-lg"
            >
              <div className={`absolute inset-0 rounded-full ${petIndex === index ? 'bg-white/40 border-4 border-white' : 'bg-black/40'}`}></div>
              <img src={pet.image} alt={pet.name} className="w-full h-full object-cover rounded-full" draggable="false" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
