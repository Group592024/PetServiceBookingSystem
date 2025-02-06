import React from 'react';

const BookingConfirmStep = ({ formData, selectedOption, servicesOrRooms }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Confirm Booking</h2>
      
      {/* User Information */}
      <div className="space-y-4 mb-6">
        <p className="text-lg"><strong>Name:</strong> {formData.name}</p>
        <p className="text-lg"><strong>Phone:</strong> {formData.phone}</p>
        <p className="text-lg"><strong>Address:</strong> {formData.address}</p>
        <p className="text-lg"><strong>Note:</strong> {formData.note || "None"} </p>
        <p className="text-lg"><strong>Payment Method:</strong> {formData.paymentMethod}</p>
      </div>

      {/* Dynamically Rendered Services or Rooms */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium mb-4">
          {selectedOption === 'Room' ? 'Rooms Selected' : 'Services Selected'}
        </h3>
        
        {servicesOrRooms && servicesOrRooms.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {servicesOrRooms.map((item, index) => (
              <li key={index} className="text-lg">
                <span className="font-semibold">{item.name}</span> - {item.description}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg text-red-500">No {selectedOption === 'Room' ? 'rooms' : 'services'} selected.</p>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmStep;
