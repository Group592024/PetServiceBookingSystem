import React, { useEffect, useState } from "react";
import ReportCircleCard from "./ReportCircleCard";

const ReportServiceType = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDataFunction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/ReportFacility/activeServiceType",
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
        name: item.roomTypeName,
        quantity: item.quantity,
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError(error.message || "Failed to fetch service type data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Service Type Distribution
        </h2>
        <div className="mt-2 md:mt-0 flex space-x-2">
          <button
            onClick={fetchDataFunction}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-200 flex items-center"
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Service Types Found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are currently no active service types to display. Check back
            later or contact an administrator.
          </p>
        </div>
      ) : (
        <div>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex flex-wrap justify-between items-center">
              <div className="mb-2 md:mb-0">
                <span className="text-gray-500 text-sm">
                  Total Service Types:
                </span>
                <span className="ml-2 font-bold text-gray-800">
                  {data.length}
                </span>
              </div>
              <div className="mb-2 md:mb-0">
                <span className="text-gray-500 text-sm">Total Services:</span>
                <span className="ml-2 font-bold text-gray-800">
                  {data.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="transition-all duration-300">
            <ReportCircleCard
              data={data}
              type="Services"
              element="Service Types"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportServiceType;
