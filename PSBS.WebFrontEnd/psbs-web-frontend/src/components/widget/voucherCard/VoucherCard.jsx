import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
const VoucherCard = ({ name, discount, basePath, row, rowId }) => {
    const navigate = useNavigate();
    const handleOpen = () => {
        navigate(`${basePath}detail/${row[rowId]}`, { state: { rowData: row } });
      };
  return (
    <div className="relative bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg shadow-lg p-6 text-center transition-transform transform hover:scale-105 flex items-center space-x-2 overflow-hidden group cursor-pointer"
    onClick={handleOpen}>
      {/* Icon on the left */}
      <i className="bx bxs-gift text-white text-7xl opacity-30"></i>

      {/* Card content on the right */}
      <div className="text-white text-left flex-1">
        <h2 className="text-xl font-semibold truncate max-w-[180px]">{name}</h2> {/* Set max width */}
        <p className="text-3xl font-bold truncate">{discount}% OFF</p>
      </div>

      {/* Narrow Icon */}
      <i className="bx bx-chevron-right text-white text-4xl absolute bottom-1 right-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></i>
    </div>
  );
};

VoucherCard.propTypes = {
  name: PropTypes.string.isRequired,
  discount: PropTypes.number.isRequired,
};

export default VoucherCard;
