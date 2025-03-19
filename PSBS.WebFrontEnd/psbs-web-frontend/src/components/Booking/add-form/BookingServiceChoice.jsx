import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";

const BookingServiceChoice = ({ formData, handleChange, services, data }) => {
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

  // Get the selected service name
  const selectedService = services.find(s => s.serviceId === formData.service);
  const selectedPet = pets.find(p => p.petId === formData.pet);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Display */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Service</label>
          <TextField
            value={selectedService ? selectedService.serviceName : ""}
            fullWidth
            disabled
            className="bg-white"
          />
        </div>

        {/* Pet Display */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Pet</label>
          <TextField
            value={selectedPet ? selectedPet.petName : ""}
            fullWidth
            disabled
            className="bg-white"
          />
        </div>

        {/* Service Variant Selection */}
        {serviceVariants.length > 0 && (
          <div className="col-span-2">
            <FormControl fullWidth>
              <InputLabel>Service Variant</InputLabel>
              <Select
                value={formData.serviceVariant || ""}
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
                      value: selectedVariant ? selectedVariant.servicePrice : 0,
                    },
                  });
                }}
                label="Service Variant"
              >
                {serviceVariants.map((variant) => (
                  <MenuItem key={variant.serviceVariantId} value={variant.serviceVariantId}>
                    {variant.serviceContent} - {variant.servicePrice.toLocaleString()} VND
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Price Display */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-semibold mb-2">Price</label>
          <TextField
            value={formData.price ? `${formData.price.toLocaleString()} VND` : ""}
            fullWidth
            disabled
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default BookingServiceChoice;
