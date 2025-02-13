import React from "react";

const BookingChooseServiceStep = ({ selectedOption, handleOptionChange }) => {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Choose Service</h2>
      <p className="text-gray-600 mb-6">Select the service you want to book from our offerings.</p>

      <div className="flex justify-center space-x-6">
        <label
          className={`px-6 py-3 rounded-lg border cursor-pointer transition ${
            selectedOption === "Room"
              ? "bg-green-500 text-white border-green-500 shadow-lg"
              : "bg-white text-gray-800 border-gray-300 hover:border-green-500"
          }`}
        >
          <input
            type="radio"
            name="selectedOption"
            value="Room"
            checked={selectedOption === "Room"}
            onChange={handleOptionChange}
            className="hidden"
          />
          Room
        </label>

        <label
          className={`px-6 py-3 rounded-lg border cursor-pointer transition ${
            selectedOption === "Service"
              ? "bg-green-500 text-white border-green-500 shadow-lg"
              : "bg-white text-gray-800 border-gray-300 hover:border-green-500"
          }`}
        >
          <input
            type="radio"
            name="selectedOption"
            value="Service"
            checked={selectedOption === "Service"}
            onChange={handleOptionChange}
            className="hidden"
          />
          Service
        </label>
      </div>
    </div>
  );
};

export default BookingChooseServiceStep;
