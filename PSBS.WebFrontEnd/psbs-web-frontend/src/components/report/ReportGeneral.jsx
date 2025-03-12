import React, { useEffect, useState } from 'react';
import ReportSquareCard from './ReportSquareCard';

const ReportGeneral = () => {
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

  const [staff, setStaff] = useState(0);
  const [customer, setCustomer] = useState(0);
  const [pet, setPet] = useState(0);
  const [booking, setBooking] = useState(0);
  const [service, setService] = useState(0);
  const [room, setRoom] = useState(0);

  const fetchDataStaff = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        'http://localhost:5050/api/ReportAccount/countStaff',
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.length;

      setStaff(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const fetchDataCustomer = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        'http://localhost:5050/api/ReportAccount/countCustomer',
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.length;

      setCustomer(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const fetchDataPet = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        'http://localhost:5050/api/Pet',
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.length;

      setPet(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const fetchDataBooking = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        'http://localhost:5050/api/ReportBooking/bookingStatus',
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
        bookingStatusName: item.bookingStatusName,
        quantity: item.reportBookings.length,
        ...item,
      }));

      let bookingQuantity=0;
      result.map((item)=>(
        bookingQuantity+=item.quantity
      ))

      setBooking(bookingQuantity);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const fetchDataService = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch('http://localhost:5050/api/Service?showAll=false',
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.length;

      setService(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const fetchDataRoom = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        'http://localhost:5050/api/ReportFacility/availableRoom',
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.length;

      setRoom(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };


  useEffect(() => {
    fetchDataStaff();
    fetchDataCustomer();
    fetchDataPet();
    fetchDataBooking();
    fetchDataService();
    fetchDataRoom();
  }, []);

  return (
    <div className='flex w-full flex-wrap'>
      <ReportSquareCard
        name='Number of Staffs'
        quantity={staff}
        color={shuffledColors[0]}
        
      />
      <ReportSquareCard
        name='Number of Customers'
        quantity={customer}
        color={shuffledColors[1]}
        sx={{ width: '30%' }}
      />
      <ReportSquareCard
        name='Number of Pets'
        quantity={pet}
        color={shuffledColors[2]}
        sx={{ width: '30%' }}
      />
      <ReportSquareCard
        name='Number of Bookings'
        quantity={booking}
        color={shuffledColors[3]}
        sx={{ width: '30%' }}
      />
      <ReportSquareCard
        name='Number of Services'
        quantity={service}
        color={shuffledColors[4]}
        sx={{ width: '30%' }}
      />
      <ReportSquareCard
        name='Number of Rooms'
        quantity={room}
        color={shuffledColors[5]}
        sx={{ width: '30%' }}
      />
    </div>
  );
};

export default ReportGeneral;
