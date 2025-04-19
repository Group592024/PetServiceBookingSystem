import React, { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import ReportCircleCard from './ReportCircleCard';

const ReportRoomType = () => {
  const [data, setData] = useState([]);

  const fetchDataFunction = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        'http://localhost:5050/api/ReportFacility/activeRoomType',
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
        name: item.roomTypeName,
        quantity: item.quantity,
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);

  console.log(data);

  return (
    <div>
      <ReportCircleCard data={data} type="Rooms"
        element="Room Types" />
    </div>
  );
};

export default ReportRoomType;
