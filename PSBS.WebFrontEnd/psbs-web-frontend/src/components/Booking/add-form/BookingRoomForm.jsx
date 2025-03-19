import React, { useEffect, useState } from "react";
import BookingRoomChoose from "./BookingRoomChoose";
import { useBookingContext } from "./BookingContext";
import { TextField, MenuItem, Checkbox, FormControlLabel, Button, FormGroup, Alert } from "@mui/material";
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

  const checkTimeOverlap = (start1, end1, start2, end2) => {
    return (start1 < end2 && end1 > start2);
  };

  const handleCreateBookingRooms = () => {
    setError("");
    
    // Check if number of rooms is sufficient
    const numRooms = selectAllRooms ? rooms.length : selectedRooms.length;
    const numPets = selectAllPets ? pets.length : selectedPets.length;
    
    if (numRooms < numPets) {
      setError("Number of rooms must be greater than or equal to the number of pets");
      return;
    }

    const newBookingRooms = [];
    const selectedRoomsList = selectAllRooms ? rooms : rooms.filter(r => selectedRooms.includes(r.roomId));
    const selectedPetsList = selectAllPets ? pets : pets.filter(p => selectedPets.includes(p.petId));

    // Create booking entries
    selectedPetsList.forEach((pet, index) => {
      if (index < selectedRoomsList.length) {
        newBookingRooms.push({
          room: selectedRoomsList[index].roomId,
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
        setVoucherError(`Minimum spend required: ${selectedVoucherData.voucherMinimumSpend.toLocaleString()} VND`);
        setFinalDiscount(0);
        setDiscountedPrice(totalPrice);
      }
    } else {
      setFinalDiscount(0);
      setDiscountedPrice(totalPrice);
    }
  }, [voucherId, totalPrice, vouchers, setFinalDiscount, setDiscountedPrice]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Room Booking Details</h2>

      {/* Rooms Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Rooms</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
            {rooms.map((room) => (
              <FormControlLabel
                key={room.roomId}
                control={
                  <Checkbox
                    checked={selectedRooms.includes(room.roomId)}
                    onChange={() => handleRoomSelect(room.roomId)}
                    color="primary"
                    disabled={selectAllRooms}
                  />
                }
                label={`${room.roomName} - ${room.description}`}
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

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateBookingRooms}
        disabled={(!selectAllRooms && selectedRooms.length === 0) || (!selectAllPets && selectedPets.length === 0)}
        className="mb-6"
      >
        Create Booking Rooms
      </Button>

      {bookingRooms.map((roomData, index) => (
        <div key={index} className="relative">
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
          <button
            onClick={() => setBookingRooms(bookingRooms.filter((_, i) => i !== index))}
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
          value={voucherId}
          onChange={(e) => setVoucherId(e.target.value)}
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
