import React from "react";

const BookingServiceChoice = ({ formData, handleChange, services, pets }) => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Selection */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Service</label>
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pet Selection */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Pet</label>
          <select
            name="pet"
            value={formData.pet}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price (Read-Only) */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-semibold mb-2">Price</label>
          <input
            type="text"
            name="price"
            value={`${formData.price} VND`}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
          />
        </div>
      </div>
    </div>
  );
};

export default BookingServiceChoice;
