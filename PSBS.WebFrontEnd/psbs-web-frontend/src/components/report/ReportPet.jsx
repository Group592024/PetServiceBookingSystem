import React, { useEffect, useRef, useState } from "react";
import ReportCircleCard from "./ReportCircleCard";
import { useNavigate } from "react-router-dom";
import { Autocomplete, TextField } from "@mui/material";
import useTimeStore from "../../lib/timeStore";
import { motion } from "framer-motion";

const ReportPet = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const { type, year, month, startDate, endDate } = useTimeStore();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDataServices = async () => {
    setIsLoading(true);
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

      if (!fetchData.ok) {
        throw new Error(`HTTP error! Status: ${fetchData.status}`);
      }

      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        id: item.serviceId,
        ...item,
      }));

      setServices(result);

      // Auto-select first service if available
      if (result.length > 0 && !selectedService) {
        setSelectedService(result[0]);
      }
    } catch (error) {
      console.error("Error fetching services: ", error);
      setError("Failed to load services. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataServices();
  }, []);

  const handleServiceChange = (event, newValue) => {
    setSelectedService(newValue);
  };

  const fetchDataCountPet = async () => {
    if (!selectedService) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      let url = `http://localhost:5050/api/ReportPet/${selectedService.serviceId}?`;

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
        if (fetchData.status === 404) {
          setData([]);
          return;
        }
        throw new Error(`HTTP error! Status: ${fetchData.status}`);
      }

      const response = await fetchData.json();

      const listDictionary = response.data;

      const result = Object.entries(listDictionary).map(([key, value]) => ({
        name: key,
        quantity: value,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching pet data: ", error);
      setError("Failed to load pet statistics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataCountPet();
  }, [selectedService, type, year, month, startDate, endDate]);

  // Get time period display text
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
    if (type === "day") return `${startDate} to ${endDate}`;
    return "All time";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Pet Statistics by service
            </h2>
            <p className="text-gray-600 mt-1">
              Analysis of pet breeds using each service for{" "}
              {getTimePeriodText()}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1 text-sm text-gray-600 flex items-center mr-3">
              <svg
                className="w-4 h-4 mr-1 text-indigo-500"
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
              onClick={fetchDataCountPet}
              className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
              disabled={isLoading || !selectedService}
            >
              <svg
                className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
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
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Service Selector */}
      <div className="p-6 bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a service to view pet statistics:
          </label>
          <div className="relative">
            <Autocomplete
              options={services}
              getOptionLabel={(option) => option.serviceName || ""}
              value={selectedService}
              onChange={handleServiceChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Choose a service to analyze pet statistics"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <div className="mr-2 text-indigo-500">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "0.5rem",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6366F1",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4F46E5",
                  },
                },
              }}
              loading={isLoading}
              loadingText="Loading services..."
              noOptionsText="No services available"
            />
            {services.length === 0 && !isLoading && (
              <div className="mt-2 text-sm text-red-600">
                No services available. Please add services first.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full absolute border-4 border-solid border-gray-200"></div>
                <div className="w-16 h-16 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading pet statistics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-lg text-center">
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
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchDataCountPet}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : !selectedService ? (
          <div className="bg-blue-50 p-8 rounded-lg text-center">
            <svg
              className="w-16 h-16 mx-auto text-blue-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-blue-700 mb-2">
              Select a Service
            </h3>
            <p className="text-blue-600 max-w-md mx-auto">
              Please select a service from the dropdown above to view pet
              statistics.
            </p>
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Pet Data Available
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There is no pet data available for the selected service and time period
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <div className="bg-indigo-50 rounded-lg p-4 flex items-start">
                <div className="bg-indigo-100 rounded-full p-2 mr-4">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-indigo-800">
                    About This Chart
                  </h3>
                  <p className="text-indigo-600 text-sm mt-1">
                    This chart shows the distribution of pet breeds that have
                    used the
                    <span className="font-semibold">
                      {" "}
                      {selectedService?.serviceName}
                    </span>{" "}
                    service during {getTimePeriodText()}.
                  </p>
                </div>
              </div>
            </div>

            <ReportCircleCard data={data} type="Pets" element="Pet Breeds" />

            {/* Additional Statistics */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Key Insights
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Most Popular Pet Type */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-purple-100 rounded-md mr-3">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-700">
                      Most Popular Pet Breed
                    </h4>
                  </div>
                  <div className="ml-10">
                    <p className="text-2xl font-bold text-gray-800">
                      {data.sort((a, b) => b.quantity - a.quantity)[0]?.name ||
                        "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {data.sort((a, b) => b.quantity - a.quantity)[0]
                        ?.quantity || 0}{" "}
                      bookings
                    </p>
                  </div>
                </div>

                {/* Total Pets */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-blue-100 rounded-md mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-700">
                      Total Pet Bookings
                    </h4>
                  </div>
                  <div className="ml-10">
                    <p className="text-2xl font-bold text-gray-800">
                      {data.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      For {selectedService?.serviceName}
                    </p>
                  </div>
                </div>

                {/* Pet Type Diversity */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-green-100 rounded-md mr-3">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-700">
                      Pet Breed Diversity
                    </h4>
                  </div>
                  <div className="ml-10">
                    <p className="text-2xl font-bold text-gray-800">
                      {data.length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Different pet breeds
                    </p>
                  </div>
                </div>
              </div>

              {/* Pet Type Distribution Table */}
              {data.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Pet Breed
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Bookings
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data
                        .sort((a, b) => b.quantity - a.quantity)
                        .map((item, index) => {
                          const total = data.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          );
                          const percentage = (
                            (item.quantity / total) *
                            100
                          ).toFixed(1);

                          // Generate a color based on index
                          const hue = (index * 137.5) % 360;
                          const color = `hsl(${hue}, 70%, 65%)`;

                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: color }}
                                  ></div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-900 mr-2">
                                    {percentage}%
                                  </span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="h-2 rounded-full"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: color,
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
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReportPet;
