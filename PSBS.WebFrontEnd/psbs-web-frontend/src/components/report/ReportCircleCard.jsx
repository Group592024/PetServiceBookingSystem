import React, { useEffect, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

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

  if (total === 0) {
    return (
      <div className="flex justify-center">
        <div className="text-xl italic text-customPrimary h-10">
          No data found
        </div>
      </div>
    );
  }

  const customLabel = ({ name, value, cx, cy, midAngle, outerRadius }) => {
    if (value === 0) return null;
    const radian = Math.PI / 180;
    const x = cx + (outerRadius + 20) * Math.cos(-midAngle * radian);
    const y = cy + (outerRadius + 20) * Math.sin(-midAngle * radian);

    const percentage = ((value / total) * 100).toFixed(2) + "%";
    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="14px"
        fontWeight="bold"
      >
        {name} ({percentage})
      </text>
    );
  };

  return (
    <div>
      <PieChart width={1200} height={600}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={customLabel}
          outerRadius={250}
          fill="#8884d8"
          dataKey="quantity"
        >
          {data.map((item, index) => (
            <Cell key={`cell-${index}`} fill={colorList[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default ReportCircleCard;
