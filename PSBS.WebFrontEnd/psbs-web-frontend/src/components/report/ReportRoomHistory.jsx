import React, { useEffect, useState } from "react";
import ReportCircleCard from "./ReportCircleCard";
import useTimeStore from "../../lib/timeStore";

const ReportRoomHistory = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { type, year, month, startDate, endDate } = useTimeStore();

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

  const fetchDataFunction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      let url = "http://localhost:5050/api/ReportFacility/roomHistory?";

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
      setError(error.message || "Failed to fetch room history data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, [type, year, month, startDate, endDate]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Room Usage History
            </h2>
            <p className="text-gray-600 mt-1">
              Distribution of room usage by type
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700 font-medium flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {getTimePeriodText()}
            </div>

            <button
              onClick={fetchDataFunction}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
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
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
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
              onClick={fetchDataFunction}
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
              No Room History Data
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There is no room usage data for the selected time period. Try
              selecting a different time range or check back later.
            </p>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Total Room Types</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {data.length}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Total Usage Count</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {data.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Most Used Room Type</p>
                  <p className="text-2xl font-bold text-gray-800 truncate">
                    {data.sort((a, b) => b.quantity - a.quantity)[0]?.name ||
                      "N/A"}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Average Usage</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {data.length > 0
                      ? Math.round(
                          data.reduce((sum, item) => sum + item.quantity, 0) /
                            data.length
                        )
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="transition-all duration-300">
              <ReportCircleCard data={data} type="Rooms" element="Room Types" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportRoomHistory;
