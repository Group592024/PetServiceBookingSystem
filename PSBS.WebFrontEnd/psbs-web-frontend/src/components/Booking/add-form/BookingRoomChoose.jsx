import React, { useEffect, useState } from "react";

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

  const getToken = () => {
    return sessionStorage.getItem('token');
};

  // Fetch available rooms and pets
  // useEffect(() => {
  //   const fetchRooms = async () => {
  //     try {
  //       const response = await fetch("http://localhost:5023/api/Room/available");
  //       const data = await response.json();
  //       if (data.flag) {
  //         setRooms(data.data);
  //       } else {
  //         setError("Failed to fetch rooms.");
  //       }
  //     } catch (err) {
  //       setError("Error fetching rooms.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   const fetchPets = async () => {
  //     const fakePetsData = [
  //       { petId: "1BFCD3F7-27AD-4415-9B1A-56F0248564E5", petName: "Max" },
  //       { petId: "6AE2F8F6-5502-4CB2-A6CC-86B1A3142BF3", petName: "Buddy" },
  //       { petId: "1EA82E00-00E8-4E28-AD68-C858B4D44888", petName: "Bella" },
  //     ];
  //     setPets(fakePetsData);
  //   };
  //   fetchRooms();
  //   fetchPets();
  // }, []);
  useEffect(() => {
    const fetchRoomsAndPets = async () => {
      try {
        // Fetch rooms
        const roomResponse = await fetch("http://localhost:5050/api/Room/available",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          });
        const roomData = await roomResponse.json();
        if (roomData.flag) {
          setRooms(roomData.data);
        } else {
          setError("Failed to fetch rooms.");
        }

        // Fetch pets (only if cusId exists)
        if (data.cusId) {
          const petResponse = await fetch(`http://localhost:5050/api/pet/available/${data.cusId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            });
          const petData = await petResponse.json();
          if (petData.flag && Array.isArray(petData.data)) {
            setPets(petData.data);
          } else {
            setError("Failed to fetch pets.");
          }
        }
      } catch (err) {
        setError("Error fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomsAndPets();
  }, [formData.cusId]);


  // Fetch room type details when a room is selected
  useEffect(() => {
    if (formData.room) {
      const selectedRoom = rooms.find((room) => room.roomId === formData.room);
      if (selectedRoom) {
        const fetchRoomType = async () => {
          try {
            const response = await fetch(`http://localhost:5050/api/RoomType/${selectedRoom.roomTypeId}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag && data.data) {
              setSelectedRoomType(data.data);
            } else {
              setError("Failed to fetch room type.");
            }
          } catch (err) {
            setError("Error fetching room type.");
          }
        };
        fetchRoomType();
      }
    }
  }, [formData.room, rooms]);

  // Recalculate price whenever formData or selectedRoomType changes
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

      // Add 50,000 VND if camera is selected
      if (formData.camera) {
      totalPrice += 50000;
      }

      setFormData((prevData) => ({
        ...prevData,
        price: totalPrice,
      }));
  
      onBookingDataChange({ ...formData, price: totalPrice }); 

      // Update formData with the new price
      // const updatedData = { ...formData, price: totalPrice };
      // setFormData(updatedData);
      // onBookingDataChange(updatedData); // Notify parent of the change
    }
  }, [formData.start, formData.end, selectedRoomType, formData.camera]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData(updatedData);
    onBookingDataChange(updatedData); // Notify parent of the change
  };

  // Get current date and time for min attribute
  const now = new Date().toISOString().slice(0, 16);

  // Find the selected pet's name
  const selectedPet = pets.find(pet => pet.petId === formData.pet);
  const petName = selectedPet ? selectedPet.petName : "Loading...";

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Selection */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Room</label>
          <select
            name="room"
            value={formData.room}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isLoading}
          >
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room.roomId} value={room.roomId}>
                {room.roomName} - {room.description}
              </option>
            ))}
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
            <option value="">Select a pet</option>
            {pets.map((pet) => (
              <option key={pet.petId} value={pet.petId}>
                {pet.petName}
              </option>
            ))}
          </select>
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Start</label>
          <input
            type="datetime-local"
            name="start"
            value={formData.start}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            min={now}
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">End</label>
          <input
            type="datetime-local"
            name="end"
            value={formData.end}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            min={now}
          />
        </div>

        {/* Price (Read-Only) */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-semibold mb-2">Total Price</label>
          <input
            type="text"
            name="price"
            value={formData.price ? `${formData.price.toLocaleString()} VND` : "N/A"}
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
              onChange={handleChange}
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