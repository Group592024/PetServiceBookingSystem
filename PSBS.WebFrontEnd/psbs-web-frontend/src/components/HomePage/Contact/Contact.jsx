import React from "react";
import { motion } from "framer-motion";
import PhoneImg from "../../../assets/HomePage/contact/phone.png";
import MailImg from "../../../assets/HomePage/contact/email.png";
import AddressImg from "../../../assets/HomePage/contact/marker.png";
import HourImg from "../../../assets/HomePage/contact/clock.png";

const Contact = () => {
  return (
    <div className="py-20 bg-gradient-to-b from-cyan-200 to-[#48cae4] select-none">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <p className="font-semibold text-lg tracking-wide text-[#1182c5]">OUR CONTACTS</p>
        <h2 className="font-bold text-4xl mt-2 mb-4 text-[#0077B6]">Get in Touch</h2>
        <p className="max-w-xl mx-auto text-lg text-gray-800">
          Have a question or need assistance? Reach out to us anytime!
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {contactInfo.map((contact, index) => (
          <motion.div
            key={index}
            className="relative bg-white rounded-2xl p-8 text-center shadow-lg transform transition-all duration-300 
                      hover:scale-105 hover:bg-[#1182c5] hover:shadow-2xl group"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white flex items-center justify-center 
                        rounded-full shadow-md transition-all duration-300 group-hover:bg-[#1182c5]">
              <img src={contact.icon} alt={contact.title} className="w-8 h-8" />
            </div>
            <h3 className="mt-10 text-xl font-semibold text-[#FFC107] transition-all duration-300 group-hover:text-white">
              {contact.title}
            </h3>
            {contact.details.map((detail, i) => (
              <p key={i} className="mt-2 text-gray-600 transition-all duration-300 group-hover:text-white">{detail}</p>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const contactInfo = [
  { title: "Phone", icon: PhoneImg, details: ["+123456789", "+987654321"] },
  { title: "Email", icon: MailImg, details: ["example@example.com", "example@gmail.com"] },
  { title: "Address", icon: AddressImg, details: ["123 Main St, City, Country"] },
  { title: "Open Hours", icon: HourImg, details: ["Mon - Fri: 7 AM - 6 PM", "Saturday: 9 AM - 4 PM"] }
];

export default Contact;
