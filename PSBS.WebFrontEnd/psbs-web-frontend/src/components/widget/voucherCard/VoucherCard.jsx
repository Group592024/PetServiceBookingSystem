import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const VoucherCard = ({ name, discount, basePath, row, rowId }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`${basePath}detail/${row[rowId]}`, { state: { rowData: row } });
  };

  return (
    <div className="group cursor-pointer my-3" onClick={handleOpen}>
      <div className="relative flex h-32 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        {/* Left section - blue colored part */}
        <div className="w-1/3 bg-blue-600 flex items-center justify-center">
          <div className="text-center text-white">
            <span className="block text-4xl font-bold">{discount}%</span>
            <span className="text-sm uppercase font-semibold tracking-wider">
              DISCOUNT
            </span>
          </div>
        </div>

        {/* Dotted line separator */}
        <div className="absolute h-full left-1/3 flex items-center">
          <div className="h-full border-l-2 border-dashed border-blue-300"></div>
        </div>

        {/* Right section - content */}
        <div className="w-2/3 bg-white p-5 flex flex-col justify-center">
          <h3 className="font-semibold text-xl text-blue-800 truncate">
            {name}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-blue-500">
              Tap to view this voucher
            </span>
            <span className="text-blue-600 group-hover:translate-x-1 transition-transform duration-300">
              <i className="bx bx-chevron-right text-xl"></i>
            </span>
          </div>
        </div>

        {/* Scissors icon for the coupon effect */}
        <div className="absolute left-1/3 -ml-3 -top-1">
          <i className="bx bxs-scissors text-blue-400 rotate-90 text-xl"></i>
        </div>
        <div className="absolute left-1/3 -ml-3 -bottom-1">
          <i className="bx bxs-scissors text-blue-400 rotate-90 text-xl"></i>
        </div>

        {/* Blue accent elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 opacity-10 rounded-full -mr-5 -mt-5"></div>
        <div className="absolute bottom-0 right-10 w-8 h-8 bg-blue-500 opacity-10 rounded-full -mb-2"></div>
      </div>
    </div>
  );
};

VoucherCard.propTypes = {
  name: PropTypes.string.isRequired,
  discount: PropTypes.number.isRequired,
  basePath: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
  rowId: PropTypes.string.isRequired,
};

export default VoucherCard;
