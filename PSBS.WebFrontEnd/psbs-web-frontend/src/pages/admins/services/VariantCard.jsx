import React from 'react';
const VariantCard = ({ data }) => {

  return (
    <div className='p-5 border-customPrimary border-2 rounded-3xl mr-5 w-[300px]'>
        <p className='line-clamp-2 text-xl'>{data.serviceContent}</p>
        <p className='text-customDanger text-2xl font-bold'>{data.servicePrice}VND</p>
    </div>
  );
};

export default VariantCard;
