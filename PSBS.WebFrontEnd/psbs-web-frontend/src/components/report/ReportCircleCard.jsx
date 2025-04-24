import React, { useState, useEffect } from "react";
import {
  Cell,
  Pie,
  PieChart,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion"; // You'll need to install framer-motion

const ReportCircleCard = ({ data, type, element }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Generate vibrant but pleasant colors for the chart
  const generateColors = (count) => {
    return Array.from({ length: count }, (_, i) => {
      // Use a golden ratio approach for better color distribution
      const hue = (i * 137.5) % 360;
      return `hsl(${hue}, 75%, 65%)`;
    });
  };

  // Handle window resize for responsive chart
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate chart dimensions based on window width
  const getChartDimensions = () => {
    if (windowWidth < 640) return { width: windowWidth - 20, height: 250 };
    if (windowWidth < 1024) return { width: windowWidth - 60, height: 350 };
    return { width: Math.min(windowWidth - 100, 900), height: 450 };
  };

  const { width, height } = getChartDimensions();
  const colorList = data.length > 0 ? generateColors(data.length) : [];
  const total = data.reduce((sum, item) => sum + item.quantity, 0);

  // Enhanced tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, quantity, income } = payload[0].payload;
      const percentage = ((quantity / total) * 100).toFixed(1);

      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg"
        >
          <h3 className="font-bold text-gray-800 text-lg mb-2">{name}</h3>
          <div className="space-y-1">
            <p className="text-gray-600 flex justify-between">
              <span>{type}</span>
              <span className="font-semibold text-gray-800 ml-4">
                {quantity}
              </span>
            </p>
            <p className="text-gray-600 flex justify-between">
              <span>Percentage:</span>
              <span className="font-semibold text-gray-800 ml-4">
                {percentage}%
              </span>
            </p>
            {income !== undefined && (
              <p className="text-gray-600 flex justify-between">
                <span>Revenue:</span>
                <span className="font-semibold text-gray-800 ml-4">
                  ${income.toLocaleString()}
                </span>
              </p>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom label for the pie chart
  const customLabel = ({
    name,
    value,
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    index,
  }) => {
    if (value === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show labels if there's enough space (fewer items or larger screen)
    if (data.length > 8 && windowWidth < 1024) return null;

    const shortName = name.length > 20 ? name.slice(0, 20) + "…" : name;

    return (
      <text
        x={x}
        y={y}
        fill={colorList[index % colorList.length]}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-medium"
        fontSize={windowWidth < 768 ? "12px" : "14px"}
      >
        {`${shortName} (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  // Custom legend that's more interactive
  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-6 px-4">
        {payload.map((entry, index) => (
          <motion.li
            key={`legend-${index}`}
            className="flex items-center cursor-pointer rounded-full px-3 py-1.5"
            style={{
              backgroundColor:
                activeIndex === index ? `${entry.color}30` : "transparent",
              border: `1px solid ${entry.color}`,
            }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          >
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {entry.value}
            </span>
          </motion.li>
        ))}
      </ul>
    );
  };

  // Handle pie sector click
  const handlePieClick = (_, index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl">
        <svg
          className="w-16 h-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-4 text-xl font-medium text-gray-500">
          No Data Available
        </h3>
        <p className="mt-2 text-gray-400 text-center max-w-md">
          There is no booking data to display for the selected time period. Try
          adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white rounded-xl p-4 shadow-sm"
    >
      <div className="flex flex-col items-center">
        <div className="w-full overflow-hidden">
          <ResponsiveContainer width={"100%"} height={600}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={data.length <= 8 || windowWidth >= 1024}
                label={customLabel}
                outerRadius={Math.min(width, height) / 3}
                innerRadius={Math.min(width, height) / 6} // Create a donut chart
                fill="#8884d8"
                dataKey="quantity"
                paddingAngle={2}
                onClick={handlePieClick}
                activeIndex={activeIndex}
                activeShape={(props) => {
                  const RADIAN = Math.PI / 180;
                  const {
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    startAngle,
                    endAngle,
                    fill,
                    name,
                    quantity,
                  } = props;

                  return (
                    <g>
                      <text
                        x={cx}
                        y={cy}
                        dy={8}
                        textAnchor="middle"
                        fill={fill}
                        className="font-bold"
                      >
                        {name}
                      </text>
                      <text
                        x={cx}
                        y={cy + 20}
                        textAnchor="middle"
                        fill="#999"
                        className="text-sm"
                      >
                        {quantity} {type}
                      </text>
                      <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius + 10}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        fill={fill}
                        opacity={0.8}
                      />
                    </g>
                  );
                }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorList[index % colorList.length]}
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.5
                    }
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-sm">Total {type}</p>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-sm">{element}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {data.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-sm">Most Popular</p>
                <p className="text-2xl font-bold text-gray-800 truncate">
                  {data.sort((a, b) => b.quantity - a.quantity)[0]?.name ||
                    "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Add the Sector component for the active shape
const Sector = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * startAngle);
  const cos = Math.cos(-RADIAN * startAngle);
  const sin2 = Math.sin(-RADIAN * endAngle);
  const cos2 = Math.cos(-RADIAN * endAngle);
  const dx = cos * outerRadius - cos * innerRadius;
  const dy = sin * outerRadius - sin * innerRadius;
  const dx2 = cos2 * outerRadius - cos2 * innerRadius;
  const dy2 = sin2 * outerRadius - sin2 * innerRadius;

  const path = [
    `M ${cx + cos * outerRadius} ${cy + sin * outerRadius}`,
    `A ${outerRadius} ${outerRadius} 0 ${endAngle - startAngle >= 180 ? 1 : 0
    } 0 ${cx + cos2 * outerRadius} ${cy + sin2 * outerRadius}`,
    `L ${cx + cos2 * innerRadius} ${cy + sin2 * innerRadius}`,
    `A ${innerRadius} ${innerRadius} 0 ${endAngle - startAngle >= 180 ? 1 : 0
    } 1 ${cx + cos * innerRadius} ${cy + sin * innerRadius}`,
    "Z",
  ].join(" ");

  return <path d={path} fill={fill} />;
};

export default ReportCircleCard;
