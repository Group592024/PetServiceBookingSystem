import React, { useState, useEffect } from "react";
import BookingRoomChoose from "./BookingRoomChoose";

const BookingRoomForm = ({ rooms = [], formData, handleChange }) => {
  const [bookingRooms, setBookingRooms] = useState([
    { room: "", pet: "", start: "", end: "", price: "", camera: false },
  ]);

  // Function to add a new BookingRoomChoose
  const addNewBookingRoom = () => {
    setBookingRooms([
      ...bookingRooms,
      { room: "", pet: "", start: "", end: "", price: "", camera: false },
    ]);
  };

  // Function to remove a specific BookingRoomChoose by index
  const removeBookingRoom = (index) => {
    const updatedRooms = bookingRooms.filter((_, i) => i !== index);
    setBookingRooms(updatedRooms);
  };

  // Save form data to localStorage whenever bookingRooms change
  useEffect(() => {
    localStorage.setItem("bookingRooms", JSON.stringify(bookingRooms));
  }, [bookingRooms]);

  // Retrieve form data from localStorage on page load
  useEffect(() => {
    const savedRooms = JSON.parse(localStorage.getItem("bookingRooms"));
    if (savedRooms) {
      setBookingRooms(savedRooms);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Room Booking Details</h2>
      <p className="text-gray-600 mb-6">Please provide details for your room booking.</p>

      {/* Button to add new BookingRoomChoose */}
      <button
        onClick={addNewBookingRoom}
        className="mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        New Booking Room
      </button>

      {/* Render multiple BookingRoomChoose components */}
      {bookingRooms.map((roomData, index) => (
        <div key={index} className="relative">
          <BookingRoomChoose
            formData={roomData}
            handleChange={(e) => {
              const { name, value } = e.target;
              const updatedRooms = [...bookingRooms];
              updatedRooms[index][name] = value;
              setBookingRooms(updatedRooms);
            }}
            rooms={rooms}
          />
          {/* Remove button with SVG icon */}
          <button
            onClick={() => removeBookingRoom(index)}
            className="absolute top-0 right-0 mt-2 mr-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "white" }}>
              <path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242-1.414-1.414z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default BookingRoomForm;
