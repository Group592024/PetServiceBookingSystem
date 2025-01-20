import React from 'react';
import ServiceCard from './ServiceCard';

const ServiceCardList = ({ data }) => {
  return (
    <div className='flex justify-center items-center flex-wrap gap-4'>
      {data.map((item) => (
        <ServiceCard key={data.serviceId} data={item} />
      ))}
    </div>
  );
};

export default ServiceCardList;
