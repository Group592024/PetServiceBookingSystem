import React, { useState, useEffect } from "react";
import { 
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider
} from "@mui/material";

const BookingServiceChoice = ({ formData, handleChange, services, data }) => {
  const [serviceVariants, setServiceVariants] = useState([]);
  const [pets, setPets] = useState([]);

  const getToken = () => sessionStorage.getItem('token');

  // Fetch service variants
  useEffect(() => {
    if (formData.service) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5050/api/ServiceVariant/service/${formData.service}`,
            { headers: { Authorization: `Bearer ${getToken()}` } }
          );
          const result = await response.json();
          if (result.flag) {
            setServiceVariants(result.data);
            // Auto-select first variant
            if (result.data.length > 0 && !formData.serviceVariant) {
              const first = result.data[0];
              handleChange({ target: { name: "serviceVariant", value: first.serviceVariantId } });
              handleChange({ target: { name: "price", value: first.servicePrice } });
            }
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };
      fetchData();
    }
  }, [formData.service]);

  // Fetch pets
  useEffect(() => {
    if (data.cusId) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5050/api/pet/available/${data.cusId}`,
            { headers: { Authorization: `Bearer ${getToken()}` } }
          );
          const result = await response.json();
          if (result.flag) setPets(result.data);
        } catch (error) {
          console.error("Error:", error);
        }
      };
      fetchData();
    }
  }, [data.cusId]);

  const selectedService = services.find(s => s.serviceId === formData.service);
  const selectedPet = pets.find(p => p.petId === formData.pet);

  return (
    <Box sx={{ 
      border: '1px solid #ddd', 
      borderRadius: 2, 
      p: 2, 
      mb: 2,
      backgroundColor: '#f9f9f9'
    }}>
      <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">Service</Typography>
          <TextField
            value={selectedService?.serviceName || ""}
            fullWidth
            size="small"
            disabled
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">Pet</Typography>
          <TextField
            value={selectedPet?.petName || ""}
            fullWidth
            size="small"
            disabled
          />
        </Box>
      </Box>

      {serviceVariants.length > 0 && (
        <>
          <Typography variant="subtitle2">Variant</Typography>
          <Select
            value={formData.serviceVariant || ""}
            onChange={(e) => {
              const variant = serviceVariants.find(v => v.serviceVariantId === e.target.value);
              handleChange({ target: { name: "serviceVariant", value: e.target.value } });
              handleChange({ target: { name: "price", value: variant?.servicePrice || 0 } });
            }}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          >
            {serviceVariants.map((v) => (
              <MenuItem key={v.serviceVariantId} value={v.serviceVariantId}>
                {v.serviceContent} ({v.servicePrice.toLocaleString()} VND)
              </MenuItem>
            ))}
          </Select>
        </>
      )}

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography>Price:</Typography>
        <Typography fontWeight="bold">
          {formData.price?.toLocaleString() || "0"} VND
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingServiceChoice;