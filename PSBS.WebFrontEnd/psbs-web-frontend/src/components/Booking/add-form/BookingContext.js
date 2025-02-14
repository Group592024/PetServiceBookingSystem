import React, { createContext, useContext, useState } from "react";

// Create BookingContext
export const BookingContext = createContext(null);

// Booking Provider
export const BookingProvider = ({ children }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [bookingData, setBookingData] = useState({});
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [bookingRooms, setBookingRooms] = useState([]);
  const [voucherId, setVoucherId] = useState(null); // New state for voucherId
  const [totalPrice, setTotalPrice] = useState(0); // New state for totalPrice
  const [finalDiscount, setFinalDiscount] = useState(0); 
  const [discountedPrice, setDiscountedPrice] = useState(totalPrice);
  const [bookingServices, setbookingServices] = useState([]);
  const [bookingServicesDate, setbookingServicesDate] = useState([]);
  

  return (
    <BookingContext.Provider
      value={{
        selectedOption,
        setSelectedOption,
        bookingData,
        setBookingData,
        formData,
        setFormData,
        loading,
        setLoading,
        bookingRooms, 
        setBookingRooms ,
        voucherId,
        setVoucherId,  
        totalPrice,
        setTotalPrice,
        finalDiscount,
        setFinalDiscount,
        discountedPrice,
        setDiscountedPrice ,
        bookingServices,
         setbookingServices,
         bookingServicesDate, 
         setbookingServicesDate,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// Custom Hook to Use BookingContext
export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingContext must be used within a BookingProvider");
  }
  return context;
};
