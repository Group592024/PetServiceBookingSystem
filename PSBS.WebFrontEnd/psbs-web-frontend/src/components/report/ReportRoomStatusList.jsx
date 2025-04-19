import React, { useEffect, useState } from "react";
import ReportSquareCard from "./ReportSquareCard";
import { motion } from "framer-motion";

const ReportRoomStatusList = () => {
  const pastelColors = [
    "#B39CD0", // Purple
    "#F48FB1", // Pink
    "#FFB74D", // Orange
    "#90CAF9", // Blue
    "#A5D6A7", // Green
    "#FFCC80", // Light Orange
    "#80CBC4", // Teal
  ];

  // Shuffle array function (Fisher-Yates)
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledColors = shuffleArray(pastelColors);

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDataRoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/ReportFacility/roomStatus",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!fetchData.ok) {
        throw new Error(`HTTP error! Status: ${fetchData.status}`);
      }

      const response = await fetchData.json();

      const result = response.data.map((item, index) => ({
        roomStatusName: item.status,
        quantity: item.quantity,
        color: shuffledColors[index % shuffledColors.length],
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError(error.message || "Failed to fetch room status data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataRoom();
  }, []);

  // Animation variants for staggered children
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

  // Calculate total rooms
  const totalRooms = data.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Room Status Overview
            </h2>
            <p className="text-gray-600 mt-1">
              Current status of all rooms in the system
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={fetchDataRoom}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="relative">
              <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
              <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
            <svg
              className="w-12 h-12 mx-auto text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchDataRoom}
              className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Room Status Data
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There is no room status data available. Please try again later.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Total rooms</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {totalRooms}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Status Categories</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {data.length}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Most Common Status</p>
                  <p className="text-2xl font-bold text-gray-800 truncate">
                    {data.sort((a, b) => b.quantity - a.quantity)[0]
                      ?.roomStatusName || "N/A"}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Last Updated</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Room Status Cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {data.map((item) => (
                <motion.div key={item.roomStatusName} variants={item}>
                  <div
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: item.color,
                    }}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.roomStatusName}
                        </h3>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p
                            className="text-3xl font-bold"
                            style={{ color: item.color }}
                          >
                            {item.quantity}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {((item.quantity / totalRooms) * 100).toFixed(1)}%
                            of total
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${item.color}20`,
                              color: item.color,
                            }}
                          >
                            {item.quantity > 0 ? "Active" : "None"}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(item.quantity / totalRooms) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportRoomStatusList;
