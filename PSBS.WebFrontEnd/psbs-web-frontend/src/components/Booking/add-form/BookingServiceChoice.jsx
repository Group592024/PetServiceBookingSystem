import React, { useState, useEffect } from "react";

const BookingServiceChoice = ({ formData, handleChange, services ,data}) => {
  const [serviceVariants, setServiceVariants] = useState([]);
    const [pets, setPets] = useState([]); 
    const [error, setError] = useState(""); 
    const getToken = () => {
      return sessionStorage.getItem('token');
  };

  // Fetch service variants when a service is selected
  useEffect(() => {
    if (formData.service) {
      const fetchServiceVariants = async () => {
        try {
          const response = await fetch(`http://localhost:5050/api/ServiceVariant/service/${formData.service}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            });
          const result = await response.json();

          if (result.flag) {
            setServiceVariants(result.data);
          } else {
            console.error("Failed to fetch service variants:", result.message);
            setServiceVariants([]);
          }
        } catch (error) {
          console.error("Error fetching service variants:", error);
          setServiceVariants([]);
        }
      };

      fetchServiceVariants();
    }
  }, [formData.service]);

  useEffect(() => {
    const fetchPets = async () => {
      if (data.cusId) {
        try {
          const petResponse = await fetch(`http://localhost:5050/api/pet/available/${data.cusId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            });
          const petData = await petResponse.json();
          if (petData.flag && Array.isArray(petData.data)) {
            setPets(petData.data);
          } else {
            console.error("Failed to fetch pets.");
            setError("Failed to fetch pets.");
          }
        } catch (error) {
          console.error("Error fetching pets:", error);
          setError("Error fetching pets.");
        }
      }
    };

    fetchPets();
  }, [data.cusId, formData.service]);

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
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.serviceId} value={service.serviceId}>
                {service.serviceName}
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
            <option value="">Select a pet</option>
            {pets.map((pet) => (
              <option key={pet.petId} value={pet.petId}>
                {pet.petName}
              </option>
            ))}
          </select>
        </div>

        {/* Service Variant Selection */}
        {serviceVariants.length > 0 && (
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Service Variant</label>
            <select
              name="serviceVariant"
              value={formData.serviceVariant}
              onChange={(e) => {
                const selectedVariant = serviceVariants.find(
                  (variant) => variant.serviceVariantId === e.target.value
                );
                handleChange({
                  target: {
                    name: "serviceVariant",
                    value: e.target.value,
                  },
                });
                handleChange({
                  target: {
                    name: "price",
                    value: selectedVariant ? selectedVariant.servicePrice : "",
                  },
                });
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select a variant</option>
              {serviceVariants.map((variant) => (
                <option key={variant.serviceVariantId} value={variant.serviceVariantId}>
                  {variant.serviceContent} - {variant.servicePrice} VND
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price (Read-Only) */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-semibold mb-2">Price</label>
          <input
            type="text"
            name="price"
            value={formData.price ? `${formData.price} VND` : ""}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
          />
        </div>
      </div>
    </div>
  );
};

export default BookingServiceChoice;
