import React, { useEffect, useState } from 'react';
import ReportSquareCard from './ReportSquareCard';

const ReportAccountList = () => {
  const pastelColors = [
    '#B39CD0',
    '#F48FB1',
    '#FFB74D',
    '#90CAF9',
    '#A5D6A7',
    '#FFCC80',
    '#80CBC4',
  ];

  const randomColorForStaff =
    pastelColors[Math.floor(Math.random() * pastelColors.length)];

    const randomColorForCustomer =
      pastelColors[Math.floor(Math.random() * pastelColors.length)];

  const [staff, setStaff] = useState(0);
  const [customer, setCustomer] = useState(0);

  const fetchDataStaff = async () => {
    try {
      const fetchData = await fetch(
        'http://localhost:5000/api/ReportAccount/countStaff'
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
      const fetchData = await fetch(
        'http://localhost:5000/api/ReportAccount/countCustomer'
      );
      const response = await fetchData.json();

      const result = response.data.length;

      setCustomer(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchDataStaff();
    fetchDataCustomer();
  }, []);

  return (
    <div className='flex w-full'>
      <ReportSquareCard
        name='Number of Staffs'
        quantity={staff}
        color={randomColorForStaff}
        sx={{ width: '17%' }}
      />
      <ReportSquareCard
        name='Number of Customers'
        quantity={customer}
        color={randomColorForCustomer}
        sx={{ width: '17%' }}
      />
    </div>
  );
};

export default ReportAccountList;
