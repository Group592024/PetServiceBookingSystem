import React, { useEffect, useState } from "react";
import ReportCircleCard from "./ReportCircleCard";
import useTimeStore from "../../lib/timeStore";

const ReportRoomHistory = () => {
  const [data, setData] = useState([]);
  const { type, year, month, startDate, endDate, changeTime } = useTimeStore();

  const fetchDataFunction = async () => {
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
      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        name: item.roomTypeName,
        quantity: item.quantity,
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, [type, year, month, startDate, endDate]);

  console.log(data);

  return (
    <div>
      <ReportCircleCard data={data} />
    </div>
  );
};

export default ReportRoomHistory;
