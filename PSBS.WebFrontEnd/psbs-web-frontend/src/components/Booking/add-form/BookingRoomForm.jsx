import React, { useEffect, useState } from "react";
import BookingRoomChoose from "./BookingRoomChoose";
import { useBookingContext } from "./BookingContext";
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
    setDiscountedPrice,
  } = useBookingContext();

  const getToken = () => {
    return sessionStorage.getItem('token');
  };

  const [vouchers, setVouchers] = useState([]);
  const [voucherError, setVoucherError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);
  const [selectAllRooms, setSelectAllRooms] = useState(false);
  const [selectAllPets, setSelectAllPets] = useState(false);
  const [error, setError] = useState("");
  const [petNames, setPetNames] = useState({});
  const [roomTypes, setRoomTypes] = useState({});
  const [voucherSearchCode, setVoucherSearchCode] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isCreatingRooms, setIsCreatingRooms] = useState(false);

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/Room/available",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          });
        const result = await response.json();
        if (result.flag) {
          setRooms(result.data);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, []);
  // Fetch rooms and their prices
  useEffect(() => {
    const fetchRoomsAndPrices = async () => {
      try {
        // Fetch available rooms
        const roomResponse = await fetch("http://localhost:5050/api/Room/available", {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const roomData = await roomResponse.json();

        if (roomData.flag) {
          setRooms(roomData.data);

          // Fetch prices for each room type
          const types = {};
          for (const room of roomData.data) {
            if (!types[room.roomTypeId]) {
              const typeResponse = await fetch(
                `http://localhost:5050/api/RoomType/${room.roomTypeId}`,
                { headers: { Authorization: `Bearer ${getToken()}` } }
              );
              const typeData = await typeResponse.json();
              if (typeData.flag) {
                types[room.roomTypeId] = typeData.data.price;
              }
            }
          }
          setRoomTypes(types);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRoomsAndPrices();
  }, []);

  // Fetch pets from API
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
            // Initialize pet names
            const names = {};
            result.data.forEach(pet => {
              names[pet.petId] = pet.petName;
            });
            setPetNames(names);
          }
        } catch (error) {
          console.error("Error fetching pets:", error);
        }
      }
    };
    fetchPets();
  }, [formData.cusId]);

  // Fetch pet names for booking rooms
  useEffect(() => {
    const fetchPetNames = async () => {
      const updatedPetNames = { ...petNames };
      for (const room of bookingRooms) {
        if (room.pet && !petNames[room.pet]) {
          try {
            const response = await fetch(`http://localhost:5050/api/pet/${room.pet}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedPetNames[room.pet] = data.data.petName;
            }
          } catch (error) {
            console.error(`Error fetching pet name for ID ${room.pet}:`, error);
          }
        }
      }
      setPetNames(updatedPetNames);
    };

    if (bookingRooms.length > 0) {
      fetchPetNames();
    }
  }, [bookingRooms]);

  // Fetch vouchers from API
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

  const handleRoomSelect = (roomId) => {
    if (roomId === "all") {
      setSelectAllRooms(!selectAllRooms);
      if (!selectAllRooms) {
        setSelectedRooms(rooms.map(r => r.roomId));
      } else {
        setSelectedRooms([]);
      }
    } else {
      setSelectAllRooms(false);
      setSelectedRooms(prev =>
        prev.includes(roomId)
          ? prev.filter(id => id !== roomId)
          : [...prev, roomId]
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

  const checkTimeOverlap = (start1, end1, start2, end2) => {
    return (start1 < end2 && end1 > start2);
  };

  const handleCreateBookingRooms = () => {
    setError("");
    setIsCreatingRooms(true);

    // First, clear all existing booking rooms immediately
    setBookingRooms([]);

    // Then proceed with creating new ones after state has cleared
    setTimeout(() => {
      // Get fresh copies of the selected items
      const currentSelectedRooms = selectAllRooms ? rooms : rooms.filter(r => selectedRooms.includes(r.roomId));
      const currentSelectedPets = selectAllPets ? pets : pets.filter(p => selectedPets.includes(p.petId));

      // Check if number of rooms is sufficient
      if (currentSelectedRooms.length < currentSelectedPets.length) {
        setError("Number of rooms must be greater than or equal to the number of pets");
        setIsCreatingRooms(false);
        return;
      }

      const newBookingRooms = [];

      // Create booking entries
      currentSelectedPets.forEach((pet, index) => {
        if (index < currentSelectedRooms.length) {
          newBookingRooms.push({
            room: currentSelectedRooms[index].roomId,
            pet: pet.petId,
            start: "",
            end: "",
            price: 0,
            camera: false
          });
        }
      });

      // Check for time overlaps
      const hasOverlap = newBookingRooms.some((booking1, i) => {
        return newBookingRooms.some((booking2, j) => {
          if (i !== j && booking1.room === booking2.room) {
            return checkTimeOverlap(
              booking1.start,
              booking1.end,
              booking2.start,
              booking2.end
            );
          }
          return false;
        });
      });

      if (hasOverlap) {
        setError("Time slots cannot overlap for the same room");
        return;
      }

      setBookingRooms(newBookingRooms);
      //Reset selections after creating booking rooms
      setSelectedRooms([]);
      setSelectedPets([]);
      setSelectAllRooms(false);
      setSelectAllPets(false);

      // Reset total price and discounts since we're starting fresh
      setTotalPrice(0);
      setFinalDiscount(0);
      setDiscountedPrice(0);
      setIsCreatingRooms(false);
    }, 0); // Using 0ms timeout to let React process the state change
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
        setDiscountedPrice(totalPrice - appliedDiscount);
        setVoucherError("");
      } else {
        setVoucherError(`Minimum spend required: ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(selectedVoucherData.voucherMinimumSpend)}`);
        setFinalDiscount(0);
        setDiscountedPrice(totalPrice);
      }
    } else {
      setFinalDiscount(0);
      setDiscountedPrice(totalPrice);
    }
  }, [voucherId, totalPrice, vouchers, setFinalDiscount, setDiscountedPrice]);

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: "auto", p: 4, my: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Book Rooms
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select rooms and pets for your booking
        </Typography>
      </Box>

      {/* Modified Rooms Selection section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Select Rooms
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAllRooms}
                  onChange={() => handleRoomSelect("all")}
                  color="primary"
                />
              }
              label="All Rooms"
            />
            <Grid container spacing={2} sx={{ ml: 1 }}>
              {rooms.map((room) => (
                <Grid item xs={12} sm={6} key={room.roomId}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedRooms.includes(room.roomId)}
                        onChange={() => handleRoomSelect(room.roomId)}
                        color="primary"
                        disabled={selectAllRooms}
                      />
                    }
                    label={`${room.roomName} - ${new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(roomTypes[room.roomTypeId]) || '0'}`}
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Create Booking Button */}
      <Box textAlign="center" mb={4}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddCircleOutline />}
          onClick={handleCreateBookingRooms}
          disabled={
            (!selectAllRooms && selectedRooms.length === 0) ||
            (!selectAllPets && selectedPets.length === 0) ||
            isCreatingRooms
          }
          sx={{ px: 4, py: 1.5 }}
        >
          {isCreatingRooms ? "Creating..." : "Create Booking Rooms"}
        </Button>
      </Box>

      {/* Selected Rooms */}
      {bookingRooms.map((roomData, index) => (
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
                setBookingRooms(bookingRooms.filter((_, i) => i !== index))
              }
            >
              Remove
            </Button>
          </Box>
          <CardContent sx={{ pt: 6 }}>
            <BookingRoomChoose
              bookingData={{
                ...roomData,
                petName: petNames[roomData.pet] || "Loading..."
              }}
              data={formData}
              onBookingDataChange={(newData) => {
                const updatedRooms = [...bookingRooms];
                updatedRooms[index] = newData;
                setBookingRooms(updatedRooms);
              }}
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
                    {vouchers.find((v) => v.voucherId === voucherId)?.voucherDiscount}%):
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

export default BookingRoomForm;
