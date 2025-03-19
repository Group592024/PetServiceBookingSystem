import React, { useState, useEffect } from "react";
import BookingServiceChoice from "./BookingServiceChoice";
import { useBookingContext } from "./BookingContext";
import axios from "axios";
import { TextField, MenuItem, Checkbox, FormControlLabel, Button, FormGroup } from "@mui/material";

const BookingServiceForm = () => {
  const {
    formData, 
    setFormData,
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

  const getToken = () => {
    return sessionStorage.getItem('token');
  };

  const [services, setServices] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [voucherError, setVoucherError] = useState(null);
  const [minDateTime, setMinDateTime] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectAllServices, setSelectAllServices] = useState(false);
  const [selectAllPets, setSelectAllPets] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/Service",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          });
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
    const fetchPets = async () => {
      if (formData.cusId) {
        try {
          const response = await fetch(`http://localhost:5050/api/pet/available/${formData.cusId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            });
          const result = await response.json();
          if (result.flag) {
            setPets(result.data);
          }
        } catch (error) {
          console.error("Error fetching pets:", error);
        }
      }
    };
    fetchPets();
  }, [formData.cusId]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await axios.get("http://localhost:5050/api/Voucher/valid-voucher",
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

  const handleServiceSelect = (serviceId) => {
    if (serviceId === "all") {
      setSelectAllServices(!selectAllServices);
      if (!selectAllServices) {
        setSelectedServices(services.map(s => s.serviceId));
      } else {
        setSelectedServices([]);
      }
    } else {
      setSelectAllServices(false);
      setSelectedServices(prev => 
        prev.includes(serviceId) 
          ? prev.filter(id => id !== serviceId)
          : [...prev, serviceId]
      );
    }
  };

  const handlePetSelect = (petId) => {
    if (petId === "all") {
      setSelectAllPets(!selectAllPets);
      if (!selectAllPets) {
        setSelectedPets(pets.map(p => p.petId));
      } else {
        setSelectedPets([]);
      }
    } else {
      setSelectAllPets(false);
      setSelectedPets(prev => 
        prev.includes(petId) 
          ? prev.filter(id => id !== petId)
          : [...prev, petId]
      );
    }
  };

  const handleCreateBookingServices = () => {
    const newBookingServices = [];
    
    // If "All" is selected for both services and pets
    if (selectAllServices && selectAllPets) {
      services.forEach(service => {
        pets.forEach(pet => {
          newBookingServices.push({
            service: service.serviceId,
            pet: pet.petId,
            price: 0
          });
        });
      });
    }
    // If "All" is selected for services only
    else if (selectAllServices) {
      services.forEach(service => {
        selectedPets.forEach(petId => {
          newBookingServices.push({
            service: service.serviceId,
            pet: petId,
            price: 0
          });
        });
      });
    }
    // If "All" is selected for pets only
    else if (selectAllPets) {
      selectedServices.forEach(serviceId => {
        pets.forEach(pet => {
          newBookingServices.push({
            service: serviceId,
            pet: pet.petId,
            price: 0
          });
        });
      });
    }
    // If specific services and pets are selected
    else {
      selectedServices.forEach(serviceId => {
        selectedPets.forEach(petId => {
          newBookingServices.push({
            service: serviceId,
            pet: petId,
            price: 0
          });
        });
      });
    }

    setbookingServices(newBookingServices);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold">Choose Service</h2>
        <p>Select the services and pets you want to book.</p>
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

      {/* Services Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Services</h3>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectAllServices}
                onChange={() => handleServiceSelect("all")}
                color="primary"
              />
            }
            label="All Services"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
            {services.map((service) => (
              <FormControlLabel
                key={service.serviceId}
                control={
                  <Checkbox
                    checked={selectedServices.includes(service.serviceId)}
                    onChange={() => handleServiceSelect(service.serviceId)}
                    color="primary"
                    disabled={selectAllServices}
                  />
                }
                label={service.serviceName}
              />
            ))}
          </div>
        </FormGroup>
      </div>

      {/* Pets Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Pets</h3>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectAllPets}
                onChange={() => handlePetSelect("all")}
                color="primary"
              />
            }
            label="All Pets"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
            {pets.map((pet) => (
              <FormControlLabel
                key={pet.petId}
                control={
                  <Checkbox
                    checked={selectedPets.includes(pet.petId)}
                    onChange={() => handlePetSelect(pet.petId)}
                    color="primary"
                    disabled={selectAllPets}
                  />
                }
                label={pet.petName}
              />
            ))}
          </div>
        </FormGroup>
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateBookingServices}
        disabled={(!selectAllServices && selectedServices.length === 0) || (!selectAllPets && selectedPets.length === 0)}
        className="mb-6"
      >
        Create Booking Services
      </Button>

      {bookingServices.map((serviceData, index) => (
        <div key={index} className="relative mb-6">
          <BookingServiceChoice
            data={formData}
            formData={serviceData}
            handleChange={(e) => {
              const { name, value } = e.target;
              const updatedServices = [...bookingServices];
              updatedServices[index][name] = value;
              setbookingServices(updatedServices);
            }}
            services={services}
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
