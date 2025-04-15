import React, { useEffect, useState } from "react";
import ReportSquareCard from "./ReportSquareCard";

const ReportBookingStatusList = () => {
  // Vibrant, modern color palette
  const modernColors = [
    "#3B82F6", // blue-500
    "#EC4899", // pink-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#8B5CF6", // violet-500
    "#EF4444", // red-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalBookings, setTotalBookings] = useState(0);

  const fetchDataFunction = async () => {
    setLoading(true);
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

      if (!fetchData.ok) {
        throw new Error("Failed to fetch booking status data");
      }

      const response = await fetchData.json();

      const result = response.data.map((item, index) => ({
        bookingStatusName: item.bookingStatusName,
        quantity: item.reportBookings.length,
        color: modernColors[index % modernColors.length],
        ...item,
      }));

      // Calculate total bookings
      const total = result.reduce((sum, item) => sum + item.quantity, 0);
      setTotalBookings(total);

      setData(result);
      setError(null);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError("Failed to load booking status data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-center">
        <p>{error}</p>
        <button
          onClick={fetchDataFunction}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-lg">
          No booking status data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Booking Status Summary
        </h3>
        <p className="text-gray-600">
          Total of{" "}
          <span className="font-bold text-blue-700">{totalBookings}</span>{" "}
          bookings across {data.length} different statuses
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((item) => (
          <div
            key={item.bookingStatusName}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100"
          >
            <div className="h-2" style={{ backgroundColor: item.color }}></div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 truncate">
                  {item.bookingStatusName}
                </h3>
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
                  style={{ backgroundColor: item.color }}
                >
                  {item.quantity}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${(item.quantity / totalBookings) * 100}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-right">
                {Math.round((item.quantity / totalBookings) * 100)}% of total
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution chart */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Status Distribution
        </h3>
        <div className="h-8 w-full rounded-lg overflow-hidden flex">
          {data.map((item, index) => (
            <div
              key={`chart-${item.bookingStatusName}`}
              className="h-full relative group"
              style={{
                width: `${(item.quantity / totalBookings) * 100}%`,
                backgroundColor: item.color,
                minWidth: "4px",
              }}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.bookingStatusName}: {item.quantity}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {data.map((item) => (
            <div
              key={`legend-${item.bookingStatusName}`}
              className="flex items-center"
            >
              <div
                className="w-3 h-3 rounded-sm mr-1"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-gray-600">
                {item.bookingStatusName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportBookingStatusList;
