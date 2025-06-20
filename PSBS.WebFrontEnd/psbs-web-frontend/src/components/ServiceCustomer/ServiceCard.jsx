import React from "react";
import { Link, useNavigate } from "react-router-dom";
const ServiceCard = ({ data }) => {
  const baseline = "http://localhost:5023";
  const navigate = useNavigate();

  return (
    <div
      data-testid="service-card"
      className="w-[42%] h-[320px] flex gap-10 p-10 mx-5 my-5 bg-gradient-to-r from-customLightPrimary to-customSecondary 
                    rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-3xl"
    >
      {/* Image Section */}
      <div className="relative rounded-3xl flex justify-center items-center">
        <img
          className="rounded-2xl w-[280px] h-[200px] object-cover transition-transform duration-300 hover:scale-110"
          src={`${baseline}${data.serviceImage}`}
          alt={data.serviceName}
        />
        <div className="absolute top-4 right-3 bg-white px-3 py-1 rounded-xl text-xs font-semibold text-customDark shadow-md">
          {data.serviceType.typeName}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-between w-2/3 h-full">
        {/* Service Details */}
        <div className="space-y-4 overflow-hidden">
          <p className="text-xl line-clamp-2 font-extrabold text-customDark leading-tight">
            {data.serviceName}
          </p>

          <p className="text-gray-700 text-base line-clamp-3 leading-relaxed">
            {data.serviceDescription}
          </p>
        </div>

        {/* Button */}
        <Link
          to={`/customer/services/${data.serviceId}`}
          className="mt-auto bg-customDark px-6 py-3 rounded-full text-customLight text-lg font-semibold text-center 
                    hover:bg-customLight hover:text-customPrimary transition-all duration-300 shadow-lg 
                    hover:shadow-xl transform hover:scale-105"
        >
          See More →
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
