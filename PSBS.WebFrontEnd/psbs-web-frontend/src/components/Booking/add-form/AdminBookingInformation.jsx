import React, { useContext, useEffect, useState } from "react";
import { TextField, MenuItem } from "@mui/material";
import { BookingContext } from "../../../components/Booking/add-form/BookingContext";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2

const AdminBookingInformation = () => {
  const { formData, setFormData, loading } = useContext(BookingContext);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false); // State to track "Not Found" message

  // Fetch payment types from API
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

  // Handle phone search when pressing Enter
  const handlePhoneKeyPress = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const phone = formData.phone;

      if (phone.length >= 3) {
        setSearching(true);
        setNotFound(false); // Reset "Not Found" state

        try {
          const response = await axios.get(`http://localhost:5000/api/Account/by-phone/${phone}`);

          if (response.data.flag && response.data.data) {
            const user = response.data.data;
            setFormData({
              ...formData,
              cusId: user.accountId,
              name: user.accountName,
              address: user.accountAddress,
              phone: user.accountPhoneNumber,
            });
          } else {
            setFormData({ ...formData, cusId: "", name: "", address: "" });
            setNotFound(true); 
            Swal.fire({
              icon: "error",
              title: "User Not Found",
              text: "No user found with this phone number.",
            });
          }
        } catch (error) {
          console.error("Error fetching user by phone:", error);
          if (error.response && error.response.status === 404) {
            setNotFound(true); // Show "Not Found" message
            Swal.fire({
              icon: "warning",
              title: "User Not Found",
              text: "No user found with this phone number.",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "An error occurred while fetching user details.",
            });
          }
          setFormData({ ...formData, cusId: "", name: "", address: ""});
        }
        setSearching(false);
      }
    }
  };
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
          {/* Phone Input - Press Enter to Search */}
          <TextField
            name="phone"
            label="Phone number"
            variant="outlined"
            value={formData.phone || ""}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              setNotFound(false); // Reset "Not Found" message when typing
            }}
            onKeyPress={handlePhoneKeyPress}
            fullWidth
            error={notFound} // Highlight red if not found
            helperText={notFound ? "User not found!" : ""} // Show error message below field
          />

          {/* Display Searching Message */}
          {searching && <p>Searching...</p>}

          {/* User Details */}
          <TextField name="name" label="Name" variant="outlined" value={formData.name || ""} fullWidth />
          <TextField name="address" label="Address" variant="outlined" value={formData.address || ""} fullWidth />

          {/* Payment Method Selection */}
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

export default AdminBookingInformation;
