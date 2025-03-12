import React, { useEffect, useState } from "react";
import ReportSquareCard from "./ReportSquareCard";

const ReportRoomStatusList = () => {
  const pastelColors = [
    "#B39CD0",
    "#F48FB1",
    "#FFB74D",
    "#90CAF9",
    "#A5D6A7",
    "#FFCC80",
    "#80CBC4",
  ];

  // Hàm xáo trộn mảng (Fisher-Yates Shuffle)
  const shuffleArray = (array) => {
    let shuffled = [...array]; // Tạo bản sao để không thay đổi mảng gốc
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledColors = shuffleArray(pastelColors);

  const [data, setData] = useState([]);

  const fetchDataRoom = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/ReportFacility/roomStatus",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.map((item, index) => ({
        roomStatusName: item.status,
        quantity: item.quantity,
        color: shuffledColors[index % shuffledColors.length],
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchDataRoom();
  }, []);

  return (
    <div className="flex w-full">
      {data.map((item) => (
        <ReportSquareCard
          key={item.roomStatusName}
          name={item.roomStatusName}
          quantity={item.quantity}
          color={item.color}
          sx={{ width: "17%" }}
        />
      ))}
    </div>
  );
};

export default ReportRoomStatusList;
