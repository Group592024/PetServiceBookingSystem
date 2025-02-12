import React, { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import ReportCircleCard from './ReportCircleCard';

const ReportRoomType = () => {
  const [data, setData] = useState([]);

  const fetchDataFunction = async () => {
    try {
      const fetchData = await fetch('http://localhost:5023/api/RoomType');
      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        name: item.name,
        quantity: item.rooms.length,
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
      <ReportCircleCard data={data} />
    </div>
  );
};

export default ReportRoomType;
