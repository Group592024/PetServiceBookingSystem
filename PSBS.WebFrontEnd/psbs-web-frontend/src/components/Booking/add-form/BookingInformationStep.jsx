import React, { useContext, useEffect, useState } from "react";
import { TextField, MenuItem } from "@mui/material";
import { BookingContext } from "../../../components/Booking/add-form/BookingContext";
import axios from "axios";

const BookingInformationStep = () => {
  const { formData, setFormData, loading } = useContext(BookingContext);
  const [paymentTypes, setPaymentTypes] = useState([]);

  // Fetch payment types from the API
  useEffect(() => {
    const fetchPaymentTypes = async () => {
      try {
        const response = await axios.get("http://localhost:5115/api/PaymentType");
        if (response.data.flag && response.data.data) {
          setPaymentTypes(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching payment types:", error);
      }
    };

    fetchPaymentTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-center mb-4">Booking Information</h2>
      {loading ? (
        <p className="text-center">Fetching user data...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <TextField
            name="name"
            label="Name"
            variant="outlined"
            value={formData.name || ""}
            // onChange={handleChange}
            fullWidth
          />
          <TextField
            name="address"
            label="Address"
            variant="outlined"
            value={formData.address || ""}
            // onChange={handleChange}
            fullWidth
          />
          <TextField
            name="phone"
            label="Phone number"
            variant="outlined"
            value={formData.phone || ""}
            // onChange={handleChange}
            fullWidth
          />
          
          {/* Payment Method Selection Dropdown */}
          <TextField
            name="paymentMethod"
            label="Payment Method"
            select
            value={formData.paymentMethod || ""}
            onChange={handleChange}
            fullWidth
          >
            {paymentTypes.map((type) => (
              <MenuItem key={type.paymentTypeId} value={type.paymentTypeId}>
                {type.paymentTypeName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="note"
            label="Note"
            variant="outlined"
            multiline
            rows={4}
            value={formData.note || ""}
            onChange={handleChange}
            className="col-span-2"
            fullWidth
          />
        </div>
      )}
    </div>
  );
};

export default BookingInformationStep;
