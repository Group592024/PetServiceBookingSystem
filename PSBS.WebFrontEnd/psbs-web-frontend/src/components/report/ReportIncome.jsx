import React, { useState, useEffect } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useTimeStore from "../../lib/timeStore";
import formatCurrency from "../../Utilities/formatCurrency.js";

const ReportIncome = () => {
  const [data, setData] = useState([]);
  const { type, year, month, startDate, endDate } = useTimeStore();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState({
    roomTotal: 0,
    serviceTotal: 0,
    total: 0,
  });

  const fetchDataIncome = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:5050/api/ReportBooking/getIncome?";

      if (type === "year") url += `year=${year}`;
      if (type === "month") url += `year=${year}&month=${month}`;
      if (type === "day") url += `startDate=${startDate}&endDate=${endDate}`;

      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await fetchData.json();

      const transformedData = response.data[0].amountDTOs.map(
        (item, index) => ({
          label: item.label,
          roomAmount:
            response.data.find((type) => type.bookingTypeName === "Hotel")
              ?.amountDTOs[index]?.amount || 0,
          serviceAmount:
            response.data.find((type) => type.bookingTypeName === "Service")
              ?.amountDTOs[index]?.amount || 0,
        })
      );

      let roomTotalAmount = 0;
      let serviceTotalAmount = 0;

      transformedData.forEach((item) => {
        roomTotalAmount += item.roomAmount;
        serviceTotalAmount += item.serviceAmount;
      });

      setTotal({
        roomTotal: roomTotalAmount,
        serviceTotal: serviceTotalAmount,
        total: roomTotalAmount + serviceTotalAmount,
      });

      setData(transformedData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataIncome();
  }, [year, month, startDate, endDate]);

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : total.total === 0 ? (
        <div className="flex justify-center items-center py-16 bg-gray-800 bg-opacity-50 rounded-lg">
          <p className="text-xl text-gray-300 italic">
            No data available for this period
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-indigo-100 text-sm">Total Income</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(total.total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-red-100 text-sm">Room Income</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(total.roomTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-green-100 text-sm">Service Income</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(total.serviceTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white bg-opacity-10 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Income Trend
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    stroke="rgba(255,255,255,0.3)"
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    stroke="rgba(255,255,255,0.3)"
                    tickFormatter={(value) => `${formatCurrency(value)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                    formatter={(value) => [`${formatCurrency(value)}`, ""]}
                    labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                  />
                  <Legend
                    wrapperStyle={{ color: "white", paddingTop: "10px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="serviceAmount"
                    stroke="#4ade80"
                    strokeWidth={3}
                    name="Service Income"
                    dot={{ r: 4, strokeWidth: 2, fill: "#4ade80" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#4ade80" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="roomAmount"
                    stroke="#f87171"
                    strokeWidth={3}
                    name="Room Income"
                    dot={{ r: 4, strokeWidth: 2, fill: "#f87171" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#f87171" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Income Distribution */}
          <div className="bg-white bg-opacity-10 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Income Distribution
            </h3>
            <div className="flex flex-col md:flex-row justify-around items-center">
              <div className="flex flex-col items-center mb-4 md:mb-0">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f87171"
                      strokeWidth="3"
                      strokeDasharray={`${(total.roomTotal / total.total) * 100
                        }, 100`}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-xl font-bold text-white">
                      {total.roomTotal > 0 ? Math.round((total.roomTotal / total.total) * 100) : 0}%

                    </div>
                    <div className="text-xs text-white opacity-70">Room</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="3"
                      strokeDasharray={`${(total.serviceTotal / total.total) * 100
                        }, 100`}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-xl font-bold text-white">
                      {total.serviceTotal > 0 ? Math.round((total.serviceTotal / total.total) * 100) : 0}%
                    </div>
                    <div className="text-xs text-white opacity-70">Service</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIncome;
