import React, { useState, useEffect } from "react";
import BookingServiceChoice from "./BookingServiceChoice";
import { useBookingContext } from "./BookingContext";
import axios from "axios";
import {
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  FormGroup,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Grid,
  Paper,
  Alert,
} from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";

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
    return sessionStorage.getItem("token");
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
  const [voucherSearchCode, setVoucherSearchCode] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/Service", {
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
          const response = await fetch(
            `http://localhost:5050/api/pet/available/${formData.cusId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
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
        const response = await axios.get(
          "http://localhost:5050/api/Voucher/valid-voucher",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
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
    const updatedTotalPrice = bookingServices.reduce(
      (acc, service) => acc + (service.price || 0),
      0
    );
    setTotalPrice(updatedTotalPrice);
  }, [bookingServices, setTotalPrice]);

  useEffect(() => {
    const selectedVoucher = vouchers.find((v) => v.voucherId === voucherId);
    if (selectedVoucher) {
      if (totalPrice >= selectedVoucher.voucherMinimumSpend) {
        const discountAmount =
          (totalPrice * selectedVoucher.voucherDiscount) / 100;
        const appliedDiscount = Math.min(
          discountAmount,
          selectedVoucher.voucherMaximum
        );
        setFinalDiscount(appliedDiscount);
        setDiscountedPrice(totalPrice - appliedDiscount);
        setVoucherError("");
      } else {
        setVoucherError(
          `Minimum spend required: ${new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(selectedVoucher.voucherMinimumSpend)}`
        );
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
        setSelectedServices(services.map((s) => s.serviceId));
      } else {
        setSelectedServices([]);
      }
    } else {
      setSelectAllServices(false);
      setSelectedServices((prev) =>
        prev.includes(serviceId)
          ? prev.filter((id) => id !== serviceId)
          : [...prev, serviceId]
      );
    }
  };

  const handlePetSelect = (petId) => {
    if (petId === "all") {
      setSelectAllPets(!selectAllPets);
      if (!selectAllPets) {
        setSelectedPets(pets.map((p) => p.petId));
      } else {
        setSelectedPets([]);
      }
    } else {
      setSelectAllPets(false);
      setSelectedPets((prev) =>
        prev.includes(petId)
          ? prev.filter((id) => id !== petId)
          : [...prev, petId]
      );
    }
  };

  const handleCreateBookingServices = () => {
    const newBookingServices = [];

    // If "All" is selected for both services and pets
    if (selectAllServices && selectAllPets) {
      services.forEach((service) => {
        pets.forEach((pet) => {
          newBookingServices.push({
            service: service.serviceId,
            pet: pet.petId,
            price: 0, // Initialize to 0, will be updated when variant is selected
            serviceVariant: null, // Initialize as null
          });
        });
      });
    }
    // If "All" is selected for services only
    else if (selectAllServices) {
      services.forEach((service) => {
        selectedPets.forEach((petId) => {
          newBookingServices.push({
            service: service.serviceId,
            pet: petId,
            price: 0,
            serviceVariant: null,
          });
        });
      });
    }
    // If "All" is selected for pets only
    else if (selectAllPets) {
      selectedServices.forEach((serviceId) => {
        pets.forEach((pet) => {
          newBookingServices.push({
            service: serviceId,
            pet: pet.petId,
            price: 0,
            serviceVariant: null,
          });
        });
      });
    }
    // If specific services and pets are selected
    else {
      selectedServices.forEach((serviceId) => {
        selectedPets.forEach((petId) => {
          newBookingServices.push({
            service: serviceId,
            pet: petId,
            price: 0,
            serviceVariant: null,
          });
        });
      });
    }

    setbookingServices(newBookingServices);
  };

  const handleSearchVoucher = async () => {
    if (!voucherSearchCode.trim()) {
      setSearchError("Please enter a voucher code");
      return;
    }

    setSearchLoading(true);
    setSearchError("");

    try {
      const response = await axios.get(
        `http://localhost:5050/api/Voucher/search-gift-code?voucherCode=${voucherSearchCode}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.data.flag && response.data.data) {
        // Check if this voucher is already in our list
        const existingVoucher = vouchers.find(v => v.voucherId === response.data.data.voucherId);

        if (!existingVoucher) {
          // Add the found voucher to our list
          setVouchers([...vouchers, response.data.data]);
        }

        // Set the selected voucher
        setVoucherId(response.data.data.voucherId);
      } else {
        setSearchError(response.data.message || "Voucher not found");
      }
    } catch (error) {
      console.error("Error searching voucher:", error);
      setSearchError(error.response?.data?.message || "Error searching voucher");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: "auto", p: 4, my: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Book Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select services and pets for your booking
        </Typography>
      </Box>

      {/* Date & Time Selection */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Booking Date & Time
          </Typography>
          <TextField
            type="datetime-local"
            value={bookingServicesDate}
            onChange={handleDateChange}
            min={minDateTime}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </CardContent>
      </Card>

      {/* Services Selection */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Select Services
          </Typography>
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
            <Grid container spacing={2} sx={{ ml: 1 }}>
              {services.map((service) => (
                <Grid item xs={12} sm={6} key={service.serviceId}>
                  <FormControlLabel
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
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </CardContent>
      </Card>

      {/* Pets Selection */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Select Pets
          </Typography>
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
            <Grid container spacing={2} sx={{ ml: 1 }}>
              {pets.map((pet) => (
                <Grid item xs={12} sm={6} key={pet.petId}>
                  <FormControlLabel
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
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </CardContent>
      </Card>

      {/* Create Booking Button */}
      <Box textAlign="center" mb={4}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddCircleOutline />}
          onClick={handleCreateBookingServices}
          disabled={
            (!selectAllServices && selectedServices.length === 0) ||
            (!selectAllPets && selectedPets.length === 0)
          }
          sx={{ px: 4, py: 1.5 }}
        >
          Create Booking Services
        </Button>
      </Box>

      {/* Selected Services */}
      {bookingServices.map((serviceData, index) => (
        <Card
          key={index}
          variant="outlined"
          sx={{ mb: 3, position: "relative" }}
        >
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteOutline />}
              onClick={() =>
                setbookingServices(
                  bookingServices.filter((_, i) => i !== index)
                )
              }
            >
              Remove
            </Button>
          </Box>
          <CardContent sx={{ pt: 6 }}>
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
          </CardContent>
        </Card>
      ))}

      {/* Voucher Selection */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Apply Voucher
          </Typography>

          {/* Voucher Search Section */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Search Voucher by Code"
              value={voucherSearchCode}
              onChange={(e) => setVoucherSearchCode(e.target.value)}
              variant="outlined"
              disabled={searchLoading}
            />
            <Button
              variant="contained"
              onClick={handleSearchVoucher}
              disabled={searchLoading || !voucherSearchCode.trim()}
            >
              {searchLoading ? "Searching..." : "Apply Voucher"}
            </Button>
          </Box>

          {searchError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {searchError}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Or select from available vouchers:
          </Typography>

          <TextField
            select
            fullWidth
            label="Select a Voucher"
            value={voucherId}
            onChange={(e) => setVoucherId(e.target.value)}
            variant="outlined"
          >
            <MenuItem value="">None</MenuItem>
            {vouchers.map((voucher) => (
              <MenuItem key={voucher.voucherId} value={voucher.voucherId}>
                {voucher.voucherName} - {voucher.voucherCode} (
                {voucher.voucherDiscount}% Off, Max{" "}
                {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(voucher.voucherMaximum)})
              </MenuItem>
            ))}
          </TextField>

          {voucherError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {voucherError}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Order Summary
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Typography>Original Price:</Typography>
              </Grid>
              <Grid item>
                <Typography>{new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(totalPrice)}</Typography>
              </Grid>
            </Grid>
          </Box>

          {finalDiscount > 0 && (
            <Box sx={{ mb: 1 }}>
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Typography color="success.main">
                    Discount (
                    {
                      vouchers.find((v) => v.voucherId === voucherId)
                        ?.voucherDiscount
                    }
                    %):
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography color="success.main">
                    -{new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(finalDiscount)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Typography variant="h6" fontWeight="bold">
                  Total Price:
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(discountedPrice)} 
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default BookingServiceForm;
