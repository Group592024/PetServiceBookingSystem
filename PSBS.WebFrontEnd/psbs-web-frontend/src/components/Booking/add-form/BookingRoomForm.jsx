import React, { useEffect, useState } from "react";
import BookingRoomChoose from "./BookingRoomChoose";
import { useBookingContext } from "./BookingContext";
import { TextField, MenuItem } from "@mui/material";
import axios from "axios";

const BookingRoomForm = () => {
  const {
    formData, 
    setFormData,
    bookingRooms,
    setBookingRooms,
    voucherId,
    setVoucherId,
    totalPrice,
    setTotalPrice,
    finalDiscount,
    setFinalDiscount,
    discountedPrice,
    setDiscountedPrice ,
  } = useBookingContext();

  const getToken = () => {
    return sessionStorage.getItem('token');
};

  const [vouchers, setVouchers] = useState([]);
  const [voucherError, setVoucherError] = useState("");
  // const [discountedPrice, setDiscountedPrice] = useState(totalPrice);

  // Fetch vouchers from API
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await axios.get("http://localhost:5022/api/Voucher/valid-voucher",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          });
        if (response.data.flag && response.data.data) {
          setVouchers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };

    fetchVouchers();
  }, []);

  const addNewBookingRoom = () => {
    setBookingRooms([
      ...bookingRooms,
      { room: "", pet: "", start: "", end: "", price: 0, camera: false },
    ]);
  };

  const removeBookingRoom = (index) => {
    const updatedRooms = bookingRooms.filter((_, i) => i !== index);
    setBookingRooms(updatedRooms);
  };

  // Calculate total price before discount
  useEffect(() => {
    const updatedTotalPrice = bookingRooms.reduce((acc, room) => acc + (room.price || 0), 0);
    setTotalPrice(updatedTotalPrice);
  }, [bookingRooms, setTotalPrice]);

  // Apply voucher logic
  useEffect(() => {
    const selectedVoucherData = vouchers.find((v) => v.voucherId === voucherId);
  
    if (selectedVoucherData) {
      if (totalPrice >= selectedVoucherData.voucherMinimumSpend) {
        const discountAmount = (totalPrice * selectedVoucherData.voucherDiscount) / 100;
        const appliedDiscount = Math.min(discountAmount, selectedVoucherData.voucherMaximum);
        setFinalDiscount(appliedDiscount);
        setDiscountedPrice(totalPrice - appliedDiscount); // UPDATE CONTEXT
        setVoucherError("");
      } else {
        setVoucherError(`Minimum spend required: ${selectedVoucherData.voucherMinimumSpend.toLocaleString()} VND`);
        setFinalDiscount(0);
        setDiscountedPrice(totalPrice); // RESET DISCOUNT
      }
    } else {
      setFinalDiscount(0);
      setDiscountedPrice(totalPrice);
    }
  }, [voucherId, totalPrice, vouchers, setFinalDiscount, setDiscountedPrice]);
  

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Room Booking Details</h2>

      <button
        onClick={addNewBookingRoom}
        className="mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
      >
        New Booking Room
      </button>

      {bookingRooms.map((roomData, index) => (
        <div key={index} className="relative">
          <BookingRoomChoose
            bookingData={roomData}
            data = {formData}
            onBookingDataChange={(newData) => {
              const updatedRooms = [...bookingRooms];
              updatedRooms[index] = newData;
              setBookingRooms(updatedRooms);
            }}
          />
          <button
            onClick={() => removeBookingRoom(index)}
            className="absolute top-0 right-0 mt-2 mr-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Voucher Selection */}
      <div className="mt-4">
        <TextField
          name="selectedVoucher"
          label="Select a Voucher"
          select
          value={voucherId} // Get from context
          onChange={(e) => setVoucherId(e.target.value)} // Save to context
          fullWidth
        >
          <MenuItem value="">None</MenuItem>
          {vouchers.map((voucher) => (
            <MenuItem key={voucher.voucherId} value={voucher.voucherId}>
              {voucher.voucherName} - {voucher.voucherCode} ({voucher.voucherDiscount}% Off, Max {voucher.voucherMaximum.toLocaleString()} VND)
            </MenuItem>
          ))}
        </TextField>
        {voucherError && <p className="text-red-500 mt-2">{voucherError}</p>}
      </div>

      {/* Price Calculation */}
      <div className="mt-6 text-lg font-semibold">
        <p>Original Price: <span className="text-gray-700">{totalPrice.toLocaleString()} VND</span></p>
        {finalDiscount > 0 && (
          <p className="text-green-600">
            Discount ({vouchers.find((v) => v.voucherId === voucherId)?.voucherDiscount}%): -{finalDiscount.toLocaleString()} VND
          </p>
        )}
        <p>Total Price: <span className="text-blue-600">{discountedPrice.toLocaleString()} VND</span></p>
      </div>
    </div>
  );
};

export default BookingRoomForm;
