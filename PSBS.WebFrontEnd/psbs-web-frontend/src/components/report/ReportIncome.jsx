import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const ReportIncome = () => {
  const [data, setData] = useState([]);
  const [type, setType] = useState('year');
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [total, setTotal] = useState({
    roomTotal: 0,
    serviceTotal: 0,
    total: 0,
  });

  const fetchDataIncome = async () => {
    try {
      let url = 'http://localhost:5115/api/ReportBooking/getIncome?';

      if (type === 'year') url += `year=${year}`;
      if (type === 'month') url += `year=${year}&month=${month}`;
      if (type === 'day') url += `startDate=${startDate}&endDate=${endDate}`;

      const fetchData = await fetch(url);
      console.log(url);
      const response = await fetchData.json();

      const transformedData = response.data[0].amountDTOs.map(
        (item, index) => ({
          label: item.label,
          roomAmount:
            response.data.find((type) => type.bookingTypeName === 'room')
              ?.amountDTOs[index]?.amount || 0,
          serviceAmount:
            response.data.find((type) => type.bookingTypeName === 'service')
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
      console.error('Error fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchDataIncome();
  }, [year, month, startDate, endDate]);

  const generateYears = () => {
    for (var i = 1; i <= 10; i++) {
      const currentYear = parseInt(format(new Date(), 'yyyy'));
      return Array.from({ length: 10 }, (_, i) => currentYear - i);
    }
  };

  const selectedYears = generateYears();
  const selectedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className=''>
      <div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className='p-3 rounded-xl'
        >
          <option value='year'>By year</option>
          <option value='month'>By month</option>
          <option value='day'>By a specific time</option>
        </select>

        {type === 'year' && (
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className='ml-3 p-3 rounded-xl'
          >
            {selectedYears.map((item) => (
              <option value={item}>{item}</option>
            ))}
          </select>
        )}

        {type === 'month' && (
          <div className='mt-3'>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className='p-3 rounded-xl'
            >
              {selectedYears.map((item) => (
                <option value={item}>{item}</option>
              ))}
            </select>

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className='ml-3 p-3 rounded-xl'
            >
              {selectedMonths.map((item) => (
                <option value={item}>{item}</option>
              ))}
            </select>
          </div>
        )}

        {type === 'day' && (
          <div className='mt-3'>
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='p-3 rounded-xl'
            />

            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='ml-3 p-3 rounded-xl'
            />
          </div>
        )}

        {console.log(year)}
        {console.log(month)}
        {console.log(startDate)}
        {console.log(endDate)}
        {console.log(endDate)}
      </div>
      <div>
        <div className='p-3'>
          <p className='text-white'>
            Total income in this time is:{' '}
            <span className='font-bold text-red-600'>{total.total}</span>
          </p>
          <p className='text-white'>
            Total income of room is:{' '}
            <span className='font-bold text-red-600'>{total.roomTotal}</span>
          </p>
          <p className='text-white'>
            Total income of service is:{' '}
            <span className='font-bold text-red-600'>{total.serviceTotal}</span>
          </p>
        </div>
        <ResponsiveContainer width='100%' height={400}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='label' tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip formatter={(value) => [`Total: ${value}`]} />
            <Legend />

            <Line
              type='monotone'
              dataKey='serviceAmount'
              stroke='#7FFF00'
              strokeWidth={2}
              name={`Total income of Service`}
            />

            <Line
              type='monotone'
              dataKey='roomAmount'
              stroke='#FF3300'
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
