import React from 'react';

const ReportSquareCard = ({ name, quantity, color }) => {

  console.log(name);

  return (
    <div className='p-5 w-[30%]'>
      <div
        className='p-3 rounded-3xl shadow-[0_20px_30px]'
        style={{
          backgroundColor: color,
        }}
      >
        <p className='text-xl p-3 font-semibold text-center'>{name}</p>
        <p className='text-5xl p-3 font-bold text-center'>{quantity}</p>
      </div>
    </div>
  );
};

export default ReportSquareCard;
