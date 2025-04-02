import React, { useEffect, useState } from "react";
import { 
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel
} from "@mui/material";

const BookingRoomChoose = ({ bookingData, onBookingDataChange, data }) => {
  const [rooms, setRooms] = useState([]);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [formData, setFormData] = useState(bookingData || {
    room: "",
    pet: "",
    start: "",
    end: "",
    price: "",
    camera: false,
  });

  const getToken = () => sessionStorage.getItem('token');

  // [Keep all your existing useEffect hooks and logic exactly as is]
  useEffect(() => {
    const fetchRoomsAndPets = async () => {
      try {
        const roomResponse = await fetch("http://localhost:5050/api/Room/available", {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const roomData = await roomResponse.json();
        if (roomData.flag) setRooms(roomData.data);
        else setError("Failed to fetch rooms.");

        if (data.cusId) {
          const petResponse = await fetch(
            `http://localhost:5050/api/pet/available/${data.cusId}`,
            { headers: { Authorization: `Bearer ${getToken()}` } }
          );
          const petData = await petResponse.json();
          if (petData.flag) setPets(petData.data);
          else setError("Failed to fetch pets.");
        }
      } catch (err) {
        setError("Error fetching data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomsAndPets();
  }, [data.cusId]);

  useEffect(() => {
    if (formData.room) {
      const selectedRoom = rooms.find((room) => room.roomId === formData.room);
      if (selectedRoom) {
        const fetchRoomType = async () => {
          try {
            const response = await fetch(
              `http://localhost:5050/api/RoomType/${selectedRoom.roomTypeId}`,
              { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            const data = await response.json();
            if (data.flag && data.data) setSelectedRoomType(data.data);
            else setError("Failed to fetch room type.");
          } catch (err) {
            setError("Error fetching room type.");
          }
        };
        fetchRoomType();
      }
    }
  }, [formData.room, rooms]);

  useEffect(() => {
    if (formData.start && formData.end && selectedRoomType) {
      const startDate = new Date(formData.start);
      const endDate = new Date(formData.end);
      if (startDate >= endDate) {
        setError("End date must be after start date.");
        return;
      }
      setError(null);
      const daysDifference = Math.ceil((endDate - startDate) / (1000 * 3600 * 24));
      let totalPrice = selectedRoomType.price * daysDifference;
      if (formData.camera) totalPrice += 50000;
      
      const updatedData = { ...formData, price: totalPrice };
      setFormData(updatedData);
      onBookingDataChange(updatedData);
    }
  }, [formData.start, formData.end, selectedRoomType, formData.camera]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData(updatedData);
    onBookingDataChange(updatedData);
  };

  const now = new Date().toISOString().slice(0, 16);
  const selectedPet = pets.find(p => p.petId === formData.pet);

  return (
    <Box sx={{ 
      border: '1px solid #ddd', 
      borderRadius: 2, 
      p: 2, 
      mb: 2,
      backgroundColor: '#f9f9f9'
    }}>
      <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">Room</Typography>
          <Select
            name="room"
            value={formData.room}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={isLoading}
          >
            <MenuItem value="">Select room</MenuItem>
            {rooms.map(room => (
              <MenuItem key={room.roomId} value={room.roomId}>
                {room.roomName} - {room.description}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">Pet</Typography>
          <Select
            name="pet"
            value={formData.pet}
            onChange={handleChange}
            fullWidth
            size="small"
          >
            <MenuItem value="">Select pet</MenuItem>
            {pets.map(pet => (
              <MenuItem key={pet.petId} value={pet.petId}>
                {pet.petName}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">Start</Typography>
          <TextField
            type="datetime-local"
            name="start"
            value={formData.start}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            min={now}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">End</Typography>
          <TextField
            type="datetime-local"
            name="end"
            value={formData.end}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            min={now}
          />
        </Box>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            name="camera"
            checked={formData.camera}
            onChange={handleChange}
            size="small"
          />
        }
        label="Camera (+50,000 VND)"
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography>Price:</Typography>
        <Typography fontWeight="bold">
          {formData.price?.toLocaleString() || "0"} VND
        </Typography>
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default BookingRoomChoose;