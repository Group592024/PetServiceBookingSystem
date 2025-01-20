import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
const ServiceCard = ({ data }) => {
  const baseline = 'http://localhost:5023';
  const navigate = useNavigate();

  return (
    <div className='w-[45%] flex justify-start gap-5 p-10 bg-customLightPrimary rounded-3xl '>
      <div className='bg-customPrimary p-5 flex justify-center rounded-3xl'>
        <img
          className='rounded-3xl w-[300px] h-[300px] object-cover'
          src={`${baseline}${data.serviceImage}`}
          alt={data.serviceName}
        />
      </div>

      <div className='ml-10 w-1/2 flex flex-col justify-between'>
        <div className='flex flex-col gap-5 '>
          <p className='text-3xl font-semibold'>{data.serviceName}</p>
          <p className='text-customPrimary italic'>
            {data.serviceType.typeName} Service
          </p>
          <p className='line-clamp-6'>{data.serviceDescription}</p>
        </div>
        <Link to={`/customer/services/${data.serviceId}`}
          className='mt-3 bg-customDark p-3 w-full rounded-3xl text-customLight text-xl font-semibold 
                  hover:bg-customLight hover:text-customPrimary text-center'
        >
          See more
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
