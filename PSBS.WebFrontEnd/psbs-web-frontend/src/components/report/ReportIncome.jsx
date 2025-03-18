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

const ReportIncome = () => {
  const [data, setData] = useState([]);
  const { type, year, month, startDate, endDate, changeTime } = useTimeStore();
  // const [type, setType] = useState("year");
  // const [year, setYear] = useState(new Date().getFullYear());
  // const [month, setMonth] = useState("");
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  const [total, setTotal] = useState({
    roomTotal: 0,
    serviceTotal: 0,
    total: 0,
  });

  const fetchDataIncome = async () => {
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
      console.log(url);
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

      transformedData.map((item) => {
        roomTotalAmount += item.roomAmount;
        serviceTotalAmount += item.serviceAmount;
      });

      setTotal({
        roomTotal: roomTotalAmount,
        serviceTotal: serviceTotalAmount,
        total: roomTotalAmount + serviceTotalAmount,
      });

      console.log(transformedData);

      setData(transformedData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchDataIncome();
  }, [year, month, startDate, endDate]);

  
  return (
    <div className="">
      
      <div>
        <div className="p-3">
          <p className="text-white">
            Total income in this time is:{" "}
            <span className="font-bold text-yellow-400">{total.total}</span>
          </p>
          <p className="text-white">
            Total income of room is:{" "}
            <span className="font-bold text-yellow-400">{total.roomTotal}</span>
          </p>
          <p className="text-white">
            Total income of service is:{" "}
            <span className="font-bold text-yellow-400">
              {total.serviceTotal}
            </span>
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip formatter={(value) => [`Total: ${value}`]} />
            <Legend />

            <Line
              type="monotone"
              dataKey="serviceAmount"
              stroke="#00CC00"
              strokeWidth={2}
              name={`Total income of Service`}
            />

            <Line
              type="monotone"
              dataKey="roomAmount"
              stroke="#FF3300"
              strokeWidth={2}
              name={`Total income of Room`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportIncome;
