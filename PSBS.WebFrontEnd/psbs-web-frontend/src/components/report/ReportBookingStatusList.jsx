import React, { useEffect, useState } from 'react';
import ReportSquareCard from './ReportSquareCard';

const ReportBookingStatusList = () => {
  const pastelColors = [
    '#B39CD0',
    '#F48FB1',
    '#FFB74D',
    '#90CAF9',
    '#A5D6A7',
    '#FFCC80',
    '#80CBC4',
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

  const fetchDataFunction = async () => {
    try {
      const fetchData = await fetch(
        'http://localhost:5115/api/ReportBooking/bookingStatus'
      );
      const response = await fetchData.json();

      const result = response.data.map((item, index) => ({
        bookingStatusName: item.bookingStatusName,
        quantity: item.reportBookings.length,
        color: shuffledColors[index % shuffledColors.length],
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

  return (
    <div className='flex w-full flex-wrap'> 
      {data.map((item) => (
        <ReportSquareCard
          key={item.bookingStatusName}                                               
          name={item.bookingStatusName}
          quantity={item.quantity}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default ReportBookingStatusList;
