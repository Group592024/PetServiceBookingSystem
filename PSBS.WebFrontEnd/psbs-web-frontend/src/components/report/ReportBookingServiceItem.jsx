import React, { useEffect, useState } from "react";
import ReportCircleCard from "./ReportCircleCard";
import useTimeStore from "../../lib/timeStore";
import { motion } from "framer-motion"; // You'll need to install framer-motion

const ReportBookingServiceItem = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { type, year, month, startDate, endDate } = useTimeStore();

  const fetchDataFunction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      let url = "http://localhost:5050/api/ReportFacility/bookingServiceItem?";

      if (type === "year") url += `year=${year}`;
      if (type === "month") url += `year=${year}&month=${month}`;
      if (type === "day") url += `startDate=${startDate}&endDate=${endDate}`;

      const fetchData = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!fetchData.ok) {
        throw new Error(`HTTP error! Status: ${fetchData.status}`);
      }

      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        name: item.roomTypeName,
        quantity: item.quantity,
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError(error.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, [type, year, month, startDate, endDate]);

  // Format the time period for display
  const getTimePeriodText = () => {
    if (type === "year") return `Year ${year}`;
    if (type === "month") {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${monthNames[month - 1]} ${year}`;
    }
    if (type === "day") {
      const start = new Date(startDate).toLocaleDateString();
      const end = new Date(endDate).toLocaleDateString();
      return `${start} to ${end}`;
    }
    return "All Time";
  };

  return (
    <div className="w-full p-4 bg-white rounded-xl shadow-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Service Booking Distribution
          </h2>
          <div className="mt-2 md:mt-0 px-4 py-2 bg-indigo-50 rounded-lg text-indigo-700 font-medium">
            {getTimePeriodText()}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchDataFunction}
              className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-700">
              No data available
            </h3>
            <p className="mt-2 text-gray-500">
              There are no service bookings for the selected time period.
            </p>
          </div>
        ) : (
          <div className="transition-all duration-300 ease-in-out">
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <div className="flex flex-wrap justify-between items-center">
                <div className="mb-2 md:mb-0">
                  <span className="text-gray-500 text-sm">Total Bookings</span>
                  <span className="ml-2 font-bold text-gray-800">
                    {data.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchDataFunction}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="transition-all duration-500 ease-in-out">
              <ReportCircleCard
                data={data}
                type="Bookings"
                element="Services"
              />
            </div>

            {data.length > 0 && (
              <div className="mt-8 overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((item, index) => {
                      const total = data.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      );
                      const percentage =
                        total > 0
                          ? ((item.quantity / total) * 100).toFixed(1)
                          : 0;

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {item.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-800 mr-2">
                                {percentage}%
                              </span>
                              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: `hsl(${
                                      index * 30
                                    }, 70%, 60%)`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportBookingServiceItem;
