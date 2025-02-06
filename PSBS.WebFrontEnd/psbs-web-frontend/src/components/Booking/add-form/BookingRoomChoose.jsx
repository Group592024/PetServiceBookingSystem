import React, { useEffect, useState } from "react";

const BookingRoomChoose = ({ formData, handleChange }) => {
  const [rooms, setRooms] = useState([]);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null); // For storing room type details (including price)
  const [totalPrice, setTotalPrice] = useState(null); // To store calculated total price

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:5023/api/Room/available");
      const data = await response.json();

      if (data.flag) {
        setRooms(data.data);
      } else {
        setError("Failed to fetch rooms.");
      }
    } catch (err) {
      setError("Error fetching rooms.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPets = async () => {
    // Simulating a fake API response for pets
    const fakePetsData = [
      { petId: "1", petName: "Buddy" },
      { petId: "2", petName: "Milo" },
      { petId: "3", petName: "Bella" },
      { petId: "4", petName: "Charlie" },
      { petId: "5", petName: "Lucy" },
    ];

    // Simulating the structure of a response with a flag and data
    const data = { flag: true, data: fakePetsData };

    if (data.flag) {
      setPets(data.data);
    } else {
      setError("Failed to fetch pets.");
    }
  };

  // Fetch available rooms and pets from the fake API
  useEffect(() => {
    fetchRooms();
    fetchPets();
  }, []);

  // Fetch room type details when the room is selected
  const fetchRoomType = async (roomTypeId) => {
    try {
      const response = await fetch(`http://localhost:5023/api/RoomType/${roomTypeId}`);
      const data = await response.json();
      if (data.flag && data.data) {
        setSelectedRoomType(data.data); // Set the selected room type details (including price)
      } else {
        setError("Failed to fetch room type.");
      }
    } catch (err) {
      setError("Error fetching room type.");
    }
  };

  // Handle room selection and fetch corresponding room type details
  const handleRoomChange = (e) => {
    handleChange(e); // Call the passed handleChange function
    const selectedRoom = rooms.find(room => room.roomId === e.target.value);
    if (selectedRoom) {
      fetchRoomType(selectedRoom.roomTypeId); // Fetch room type details for the selected room
      // Recalculate the price whenever room is changed
      if (formData.start && formData.end) {
        if (validateDates(formData.start, formData.end)) {
          calculatePrice(formData.start, formData.end);
        }
      }
    }
  };

  // Validate start and end dates
  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Ensure start date is not after end date
    if (startDate >= endDate) {
      setError("End date must be after start date.");
      return false;
    }

    // Reset the error if dates are valid
    setError(null);
    return true;
  };

  // Calculate total price based on start and end dates
  const calculatePrice = (start, end) => {
    if (!selectedRoomType) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    // If start date and end date are on the same day
    if (startDate.toDateString() === endDate.toDateString()) {
      setTotalPrice(selectedRoomType.price); // Price * 1 (same day)
    } else {
      const daysDifference = Math.ceil((endDate - startDate) / (1000 * 3600 * 24));
      setTotalPrice(selectedRoomType.price * daysDifference); // Price * 2 (multiple days)
    }
  };

  // Handle changes to start and end dates
  const handleDateChange = (e) => {
    handleChange(e); // Call the passed handleChange function

    // Only validate and calculate if both start and end dates are provided
    if (formData.start && formData.end) {
      if (validateDates(formData.start, formData.end)) {
        calculatePrice(formData.start, formData.end);
      }
    }
  };

  // Get current date and time for min attribute
  const now = new Date().toISOString().slice(0, 16);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Selection */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Room</label>
          <select
            name="room"
            value={formData.room}
            onChange={handleRoomChange} // Use custom handleRoomChange
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isLoading}
          >
            {isLoading ? (
              <option>Loading...</option>
            ) : error ? (
              <option>{error}</option>
            ) : (
              rooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.roomName} - {room.description}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Pet Selection */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Pet</label>
          <select
            name="pet"
            value={formData.pet}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {isLoading ? (
              <option>Loading...</option>
            ) : error ? (
              <option>{error}</option>
            ) : (
              pets.map((pet) => (
                <option key={pet.petId} value={pet.petId}>
                  {pet.petName}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Start</label>
          <input
            type="datetime-local"
            name="start"
            value={formData.start}
            onChange={handleDateChange} // Use custom handleDateChange
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            min={now} // Set the minimum date/time to now
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">End</label>
          <input
            type="datetime-local"
            name="end"
            value={formData.end}
            onChange={handleDateChange} // Use custom handleDateChange
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            min={now} // Set the minimum date/time to now
          />
        </div>

        {/* Price (Read-Only) */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-semibold mb-2">Total Price</label>
          <input
            type="text"
            name="price"
            value={totalPrice !== null ? `${totalPrice} VND` : 'N/A'}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
          />
        </div>

        {/* Camera Checkbox */}
        <div className="col-span-2">
          <label className="inline-flex items-center text-gray-700 font-semibold">
            <input
              type="checkbox"
              name="camera"
              checked={formData.camera}
              onChange={handleChange} // Toggle the checkbox state on change
              className="form-checkbox h-5 w-5 text-blue-500 transition-all"
            />
            <span className="ml-2">Camera</span>
          </label>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default BookingRoomChoose;
