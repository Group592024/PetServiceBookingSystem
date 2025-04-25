import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WalkingImg from '../../../assets/HomePage/services/dog-walking.png';
import GroomingImg from '../../../assets/HomePage/services/grooming.png';
import TrainingImg from '../../../assets/HomePage/services/training.png';
import PetTaxiImg from '../../../assets/HomePage/services/pet-taxi.png';
import PetHealthImg from '../../../assets/HomePage/services/veterinary.png';
import PetHotelImg from '../../../assets/HomePage/services/pet-hotel.png';
import ArrowImg from '../../../assets/HomePage/services/right-arrow.png';

// Map service titles to the expected service types in the ServiceListPage
const serviceTypeMapping = {
    'Pet Grooming': 'Grooming',
    'Health & Wellness': 'Medical',
    'Pet Hotel': 'Room',
    'Walking & Sitting': 'Walking',
    'Pet Training': 'Pet Training',
    'Pet Taxi': 'Pet Taxi'
};

const services = [
    { title: 'Pet Grooming', image: GroomingImg, content: 'Professional grooming services for your pet.', price: 'From 150.000₫ / package' },
    { title: 'Health & Wellness', image: PetHealthImg, content: "Routine vet checkups to ensure your pet's health.", price: 'From 200.000₫ / visit' },
    { title: 'Pet Hotel', image: PetHotelImg, content: 'Daily care for your pet while you are away.', price: 'From 120.000₫ / night' },
    { title: 'Walking & Sitting', image: WalkingImg, content: 'Daily pet walking service to keep your pet active.', price: 'From 50.000₫ / hour' },
    { title: 'Pet Training', image: TrainingImg, content: 'Behavioral training for your pet by experts.', price: 'From 180.000₫ / session' },
    { title: 'Pet Taxi', image: PetTaxiImg, content: 'Safe and comfortable transport services for your pet.', price: 'From 100.000₫ / trip' },
];

const AllService = () => {
    const navigate = useNavigate();

    const handleServiceClick = (serviceTitle) => {
        const serviceType = serviceTypeMapping[serviceTitle];

        if (serviceType === 'Room') {
            navigate('/customerRoom');
        } else {
            navigate(`/customer/services?type=${serviceType}`);
        }
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 0);
    };

    return (
        <motion.div
            className="px-4 py-10 bg-gradient-to-b from-gray-50 to-blue-100 select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <motion.h2
                className="text-3xl font-bold text-center text-[#2aa6df] mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                Our Pet Ease Services
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 select-none
                                    hover:bg-[#1182c5] hover:text-white group"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <img src={service.image} alt={service.title} className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 group-hover:text-white">
                            {service.title}
                        </h3>
                        <p className="text-gray-500 mt-2 group-hover:text-white">
                            {service.content}
                        </p>
                        {/* <p className="text-lg font-bold text-blue-600 mt-3 group-hover:text-orange-400">
                            {service.price}
                        </p> */}
                        <motion.button
                            className="flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleServiceClick(service.title)}
                        >
                            Get Service
                            <img src={ArrowImg} alt="Arrow" className="w-6 h-6" />
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default AllService;
