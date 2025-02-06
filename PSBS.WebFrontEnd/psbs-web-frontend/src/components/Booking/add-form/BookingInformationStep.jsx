import React from "react";
import { TextField, MenuItem } from "@mui/material";

const BookingInformationStep = ({ formData, handleChange, loading }) => {
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
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="address"
            label="Address"
            variant="outlined"
            value={formData.address}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="phone"
            label="Phone number"
            variant="outlined"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="paymentMethod"
            label="Payment Method"
            select
            value={formData.paymentMethod}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="In Cash">In Cash</MenuItem>
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="Online Payment">Online Payment</MenuItem>
          </TextField>
          <TextField
            name="note"
            label="Note"
            variant="outlined"
            multiline
            rows={4}
            value={formData.note}
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
