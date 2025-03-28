import React from "react";
const VariantCard = ({ data }) => {
  return (
    <div
      className="p-4 border-2 border-customPrimary rounded-3xl w-full bg-white shadow-md 
                    hover:shadow-lg transition-all duration-300"
    >
      <p className="line-clamp-2 text-lg text-gray-800 font-medium">
        {data.serviceContent}
      </p>

      <p className="text-customDanger text-2xl font-bold mt-3">
        {data.servicePrice} VND
      </p>
    </div>
  );
};

export default VariantCard;
