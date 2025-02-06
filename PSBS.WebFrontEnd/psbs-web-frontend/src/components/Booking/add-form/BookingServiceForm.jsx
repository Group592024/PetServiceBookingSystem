import React, { useState } from 'react';
import BookingServiceChoice from './BookingServiceChoice';

const BookingServiceForm = ({ services = [], pets = [] }) => {
  const [bookingServices, setBookingServices] = useState([]);

  // Function to add a new BookingServiceChoice
  const addNewBookingService = () => {
    setBookingServices([
      ...bookingServices,
      { service: "", pet: "", price: "" },
    ]);
  };

  // Function to remove a specific BookingServiceChoice by index
  const removeBookingService = (index) => {
    const updatedServices = bookingServices.filter((_, i) => i !== index);
    setBookingServices(updatedServices);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold">Choose Service</h2>
        <p>Select the service you want to book from our offerings.</p>
      </div>

      {/* Button to add new BookingServiceChoice */}
      <button
        onClick={addNewBookingService}
        className="mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        New Booking Service
      </button>

      {/* Render multiple BookingServiceChoice components */}
      {bookingServices.map((serviceData, index) => (
        <div key={index} className="relative mb-6">
          <BookingServiceChoice
            formData={serviceData}
            handleChange={(e) => {
              const { name, value } = e.target;
              const updatedServices = [...bookingServices];
              updatedServices[index][name] = value;
              setBookingServices(updatedServices);
            }}
            services={services}
            pets={pets}
          />
          {/* Remove button with SVG icon */}
          <button
            onClick={() => removeBookingService(index)}
            className="absolute top-0 right-0 mt-2 mr-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "white" }}>
              <path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default BookingServiceForm;
