import React, { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';

const ReportCircleCard = ({ data }) => {
  const generatePastelColors = (count) => {
    return Array.from({ length: count }, (_, i) => {
      const hue = (i * 360) / count;
      return `hsl(${hue}, 70%, 80%)`;
    });
  };

  const colorList = data.length > 0 ? generatePastelColors(data.length) : [];

  const total = data.reduce((sum, item) => sum + item.quantity, 0);

  console.log(total);

  const CustomTip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, quantity } = payload[0].payload;

      const percentage = ((quantity / total) * 100).toFixed(2) + '%';

      return (
        <div className='p-2 bg-white border rounded shadow-md text-sm'>
          <p className='font-semibold'>{name}</p>
          <p>Quantity: {quantity}</p>
          <p>Percentage: {percentage}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <PieChart width={450} height={450}>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          labelLine={false}
          outerRadius={200}
          fill='#8884d8'
          dataKey='quantity'
        >
          {data.map((item, index) => (
            <Cell key={`cell-${index}`} fill={colorList[index]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTip />} />
      </PieChart>
    </div>
  );
};

export default ReportCircleCard;
