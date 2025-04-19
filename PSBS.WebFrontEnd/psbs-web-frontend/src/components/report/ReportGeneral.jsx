import React, { useEffect, useState } from "react";
import ReportSquareCard from "./ReportSquareCard";
import { motion } from "framer-motion"; // You'll need to install framer-motion

const ReportGeneral = () => {
  // Modern pastel colors with better contrast
  const pastelColors = [
    "#6366F1", // Indigo
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#8B5CF6", // Violet
    "#14B8A6", // Teal
  ];

  // Hàm xáo trộn mảng (Fisher-Yates Shuffle)
  const shuffleArray = (array) => {
    let shuffled = [...array]; // Tạo bản sao để không thay đổi mảng gốc
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledColors = shuffleArray(pastelColors);

  const [staff, setStaff] = useState(0);
  const [customer, setCustomer] = useState(0);
  const [pet, setPet] = useState(0);
  const [booking, setBooking] = useState(0);
  const [service, setService] = useState(0);
  const [room, setRoom] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDataStaff = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/ReportAccount/countStaff",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();
      const result = response.data.length;
      setStaff(result);
    } catch (error) {
      console.error("Error fetching staff data: ", error);
    }
  };

  const fetchDataCustomer = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/ReportAccount/countCustomer",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();
      const result = response.data.length;
      setCustomer(result);
    } catch (error) {
      console.error("Error fetching customer data: ", error);
    }
  };

  const fetchDataPet = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch("http://localhost:5050/api/Pet/available", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await fetchData.json();
      const result = response.data.length;
      setPet(result);
    } catch (error) {
      console.error("Error fetching pet data: ", error);
    }
  };

  const fetchDataBooking = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/ReportBooking/bookingStatus",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        bookingStatusName: item.bookingStatusName,
        quantity: item.reportBookings.length,
        ...item,
      }));

      let bookingQuantity = 0;
      result.forEach((item) => (bookingQuantity += item.quantity));
      setBooking(bookingQuantity);
    } catch (error) {
      console.error("Error fetching booking data: ", error);
    }
  };

  const fetchDataService = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/Service?showAll=false",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();
      const result = response.data.length;
      setService(result);
    } catch (error) {
      console.error("Error fetching service data: ", error);
    }
  };

  const fetchDataRoom = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/ReportFacility/availableRoom",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();
      const result = response.data.length;
      setRoom(result);
    } catch (error) {
      console.error("Error fetching room data: ", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDataStaff(),
        fetchDataCustomer(),
        fetchDataPet(),
        fetchDataBooking(),
        fetchDataService(),
        fetchDataRoom(),
      ]);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  // Card data for easier mapping
  const cardData = [
    {
      name: "Staff Members",
      quantity: staff,
      icon: "👨‍💼",
      color: shuffledColors[0],
    },
    {
      name: "Customers",
      quantity: customer,
      icon: "👥",
      color: shuffledColors[1],
    },
    { name: "Pets", quantity: pet, icon: "🐾", color: shuffledColors[2] },
    {
      name: "Bookings",
      quantity: booking,
      icon: "📅",
      color: shuffledColors[3],
    },
    {
      name: "Services",
      quantity: service,
      icon: "🧰",
      color: shuffledColors[4],
    },
    {
      name: "Available Rooms",
      quantity: room,
      icon: "🏠",
      color: shuffledColors[5],
    },
  ];

  // Animation variants for staggered animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h2>

      {isLoading ? (
        <div className="w-full flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {cardData.map((card, index) => (
            <motion.div key={index} variants={item}>
              <div
                className="rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: card.color + "15" }} // Light background based on the color
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-semibold text-gray-800">
                      {card.name}
                    </div>
                    <div className="text-2xl">{card.icon}</div>
                  </div>
                  <div className="flex items-end">
                    <div
                      className="text-4xl font-bold"
                      style={{ color: card.color }}
                    >
                      {card.quantity}
                    </div>
                    <div className="ml-2 text-gray-500 text-sm">total</div>
                  </div>
                  <div
                    className="w-full h-1 mt-4 rounded-full"
                    style={{ backgroundColor: card.color }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ReportGeneral;
