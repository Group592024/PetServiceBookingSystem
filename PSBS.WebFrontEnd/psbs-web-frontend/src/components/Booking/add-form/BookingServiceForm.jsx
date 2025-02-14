import React, { useState, useEffect } from "react";
import BookingServiceChoice from "./BookingServiceChoice";
import { useBookingContext } from "./BookingContext";
import axios from "axios";
import { TextField, MenuItem } from "@mui/material";

const fakePetsData = [
  { petId: "1BFCD3F7-27AD-4415-9B1A-56F0248564E5", petName: "Max" },
  { petId: "6AE2F8F6-5502-4CB2-A6CC-86B1A3142BF3", petName: "Buddy" },
  { petId: "1EA82E00-00E8-4E28-AD68-C858B4D44888", petName: "Bella" },
];

const BookingServiceForm = ({ pets = fakePetsData }) => {
  const {
    bookingServices,
    setbookingServices,
    bookingServicesDate,
    setbookingServicesDate,
    totalPrice,
    setTotalPrice,
    finalDiscount,
    setFinalDiscount,
    discountedPrice,
    setDiscountedPrice,
    voucherId,
    setVoucherId,
  } = useBookingContext();

  const [services, setServices] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [voucherError, setVoucherError] = useState(null);
  const [minDateTime, setMinDateTime] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("http://localhost:5023/api/Service");
        const result = await response.json();
        if (result.flag) {
          setServices(result.data);
        } else {
          console.error("Failed to fetch services:", result.message);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await axios.get("http://localhost:5022/api/Voucher/valid-voucher");
        if (response.data.flag && response.data.data) {
          setVouchers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };
    fetchVouchers();
  }, []);

  useEffect(() => {
    const updatedTotalPrice = bookingServices.reduce((acc, service) => acc + (service.price || 0), 0);
    setTotalPrice(updatedTotalPrice);
  }, [bookingServices, setTotalPrice]);

  useEffect(() => {
    const selectedVoucher = vouchers.find((v) => v.voucherId === voucherId);
    if (selectedVoucher) {
      if (totalPrice >= selectedVoucher.voucherMinimumSpend) {
        const discountAmount = (totalPrice * selectedVoucher.voucherDiscount) / 100;
        const appliedDiscount = Math.min(discountAmount, selectedVoucher.voucherMaximum);
        setFinalDiscount(appliedDiscount);
        setDiscountedPrice(totalPrice - appliedDiscount);
        setVoucherError("");
      } else {
        setVoucherError(`Minimum spend required: ${selectedVoucher.voucherMinimumSpend.toLocaleString()} VND`);
        setFinalDiscount(0);
        setDiscountedPrice(totalPrice);
      }
    } else {
      setFinalDiscount(0);
      setDiscountedPrice(totalPrice);
    }
  }, [voucherId, totalPrice, vouchers, setFinalDiscount, setDiscountedPrice]);
  
  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16);
    setMinDateTime(now);
    if (!bookingServicesDate || bookingServicesDate < now) {
      setbookingServicesDate(now);
    }
  }, []);

  const handleDateChange = (e) => {
    setbookingServicesDate(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold">Choose Service</h2>
        <p>Select the service you want to book from our offerings.</p>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Booking Date & Time</label>
        <input
          type="datetime-local"
          value={bookingServicesDate}
          onChange={handleDateChange}
          min={minDateTime}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <button onClick={() => setbookingServices([...bookingServices, { service: "", pet: "", price: 0 }])} className="mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
        New Booking Service
      </button>

      {bookingServices.map((serviceData, index) => (
        <div key={index} className="relative mb-6">
          <BookingServiceChoice
            formData={serviceData}
            handleChange={(e) => {
              const { name, value } = e.target;
              const updatedServices = [...bookingServices];
              updatedServices[index][name] = value;
              setbookingServices(updatedServices);
            }}
            services={services}
            pets={pets}
          />
          <button onClick={() => setbookingServices(bookingServices.filter((_, i) => i !== index))} className="absolute top-0 right-0 mt-2 mr-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
            ✕
          </button>
        </div>
      ))}

      <TextField select label="Select a Voucher" value={voucherId} onChange={(e) => setVoucherId(e.target.value)} fullWidth>
        <MenuItem value="">None</MenuItem>
        {vouchers.map((voucher) => (
          <MenuItem key={voucher.voucherId} value={voucher.voucherId}>
            {voucher.voucherName} - {voucher.voucherCode} ({voucher.voucherDiscount}% Off, Max {voucher.voucherMaximum.toLocaleString()} VND)
          </MenuItem>
        ))}
      </TextField>
      {voucherError && <p className="text-red-500 mt-2">{voucherError}</p>}

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

export default BookingServiceForm;
