import React from "react";
import ServiceCard from "./ServiceCard";

const ServiceCardList = ({ data }) => {
  if (data.length === 0) {
    return (
      <p className="text-center w-full text-lg mt-10">No services found.</p>
    );
  }

  return (
    <div className="flex justify-start items-center flex-wrap translate-x-[5%]">
      {data.map((item) => (
        <ServiceCard
          data-testid="service-card"
          key={item.serviceId}
          data={item}
        />
      ))}
    </div>
  );
};

export default ServiceCardList;
