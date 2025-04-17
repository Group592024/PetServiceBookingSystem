import React from "react";
import formatCurrency from "../../../Utilities/formatCurrency";

const VariantCard = ({ data }) => {
  return (
    <div
      className="p-5 border border-gray-200 rounded-xl w-full bg-white shadow-sm 
                  hover:shadow-md hover:border-customPrimary transition-all duration-300
                  flex flex-col justify-between h-full transform hover:-translate-y-1"
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-800">
            {data.serviceContent}
          </h3>
          <span className="bg-customPrimary/10 text-customPrimary text-xs px-2 py-1 rounded-full">
            Variant
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-customDanger font-bold flex items-center">
          <span className="text-2xl">{formatCurrency(data.servicePrice)}</span>
        </p>
      </div>
    </div>
  );
};

export default VariantCard;
