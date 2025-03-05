import React from 'react';
import { motion } from 'framer-motion';
import phoneImg from '../../../assets/HomePage/footer/phone.png';
import arrowImg from '../../../assets/HomePage/footer/arrows.png';

const Footer = () => {
  return (
    <motion.footer
      className="bg-gradient-to-b from-[#48CAE4] to-cyan-100 py-12 px-6 select-none"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-gray-900">
        <motion.div
          className="bg-[#90E0EF] rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <a href="#" className="flex items-center text-[#1976D2] text-2xl font-bold">
            <i className="bx bxs-cat text-[2.2rem] mr-2"></i>
            <div className="logo-name">
              <span className="text-[#333333]">Pet</span>Ease
            </div>
          </a>
          <p className="mt-4 text-sm text-black">
            Contact us via phone, email, or by visiting our store. We value your feedback and are committed to excellent service.
          </p>
          <div className="flex items-center mt-4 bg-white/50 p-3 rounded-lg">
            <img src={phoneImg} alt="phone" className="w-12 h-12" />
            <div className="ml-4">
              <p className="text-lg font-bold text-black">+123456789</p>
              <p className="text-sm text-black">Got Questions?</p>
              <p className="text-sm text-black"> Call us 24/7</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-black">Useful Links</h3>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { name: "Home", link: "#" },
              { name: "About", link: "#" },
              { name: "Service", link: "#" },
              { name: "Room", link: "#" },
              { name: "Contact", link: "#" },
              { name: "Support", link: "#" }
            ].map((item, index) => (
              <div key={index} className="flex items-center group">
                <span className="relative before:content-[''] before:absolute before:left-[-10px] before:top-[50%] before:translate-y-[-50%] before:w-2 before:h-2 before:bg-black before:rounded-full group-hover:before:bg-[#1182c5]"></span>
                <a href={item.link} className="ml-2 text-gray-700 group-hover:text-[#0e6ba8] font-medium group-hover:font-extrabold transition-all duration-300">
                  {item.name}
                </a>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-black">Working Hours</h3>
          <div className="mt-2 space-y-2 text-gray-700">
            <div className="flex justify-between">
              <p>Mon - Fri:</p>
              <p className="font-bold">9:00 AM - 6:00 PM</p>
            </div>
            <div className="flex justify-between">
              <p>Saturday:</p>
              <p className="font-bold">10:00 AM - 4:00 PM</p>
            </div>
            <div className="flex justify-between">
              <p>Sunday:</p>
              <p className="text-red-500 font-bold">Closed</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-lg font-bold text-black">Book Service</h3>
          <p className="mt-2 text-sm text-gray-700">Let's book your services right now!</p>
          <a href="#" className="mt-4 flex items-center cursor-pointer group">
            <p className="text-gray-900 font-bold text-lg group-hover:text-[#1182c5] group-hover:font-extrabold transition-all duration-300">
              Get Started
            </p>
            <img src={arrowImg} alt="arrow" className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
