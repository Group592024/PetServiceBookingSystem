import React, { useContext, useEffect, useState } from "react";
import { TextField, MenuItem, CircularProgress, Typography } from "@mui/material";
import { BookingContext } from "../../../components/Booking/add-form/BookingContext";
import axios from "axios";
import Swal from "sweetalert2";

const AdminBookingInformation = () => {
  const { formData, setFormData, loading } = useContext(BookingContext);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = () => {
    return sessionStorage.getItem('token');
  };

  // Fetch payment types from API
  useEffect(() => {
    const fetchPaymentTypes = async () => {
      try {
        const response = await axios.get("http://localhost:5050/api/PaymentType",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          });
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
        setIsLoading(true);
        setSearching(true);
        setNotFound(false);

        try {
          const response = await axios.get(`http://localhost:5050/api/Account/by-phone/${phone}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            });

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
            setNotFound(true);
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
        } finally {
          setIsLoading(false);
          setSearching(false);
        }
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
      <h2 className="text-lg font-semibold text-center mb-1">Booking Information</h2>
      <Typography variant="body2" color="textSecondary" className="text-center mb-4">
        Please enter the phone number of user and press Enter
      </Typography>
      
      {loading ? (
        <div className="text-center">
          <CircularProgress />
          <p>Fetching user data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-4" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
          
          <div className="relative">
            <TextField
              name="phone"
              label="Phone number"
              variant="outlined"
              value={formData.phone || ""}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                setNotFound(false);
              }}
              onKeyPress={handlePhoneKeyPress}
              fullWidth
              error={notFound}
              helperText={notFound ? "User not found!" : ""}
              disabled={isLoading}
            />
            {isLoading && (
              <CircularProgress 
                size={24}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  marginTop: '-12px',
                }}
              />
            )}
          </div>

          {/* User Details */}
          <TextField 
            name="name" 
            label="Name" 
            variant="outlined" 
            value={formData.name || ""} 
            fullWidth 
            disabled={isLoading}
          />
          <TextField 
            name="address" 
            label="Address" 
            variant="outlined" 
            value={formData.address || ""} 
            fullWidth 
            disabled={isLoading}
          />

          {/* Payment Method Selection */}
          <TextField
            name="paymentMethod"
            label="Payment Method"
            select
            value={formData.paymentMethod || ""}
            onChange={handleChange}
            fullWidth
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default AdminBookingInformation;