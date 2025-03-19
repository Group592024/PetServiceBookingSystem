import React, { useContext, useEffect, useState } from "react";
import { BookingContext } from "./BookingContext";

const BookingConfirmStep = ({ formData, selectedOption }) => {
  const { bookingRooms, bookingServices,bookingServicesDate, voucherId, totalPrice, discountedPrice, finalDiscount } = useContext(BookingContext);
  const [roomNames, setRoomNames] = useState({});
  const [voucherDetails, setVoucherDetails] = useState(null);
  const [paymentTypeName, setPaymentTypeName] = useState("");
  const [serviceNames, setserviceNames] = useState({});
  const [serviceVariantNames, setServiceVariantNames] = useState({}); 
  const [petNames, setPetNames] = useState({});

  const getToken = () => {
    return sessionStorage.getItem('token');
};

  // Fetch voucher details based on selected voucher ID
  useEffect(() => {
    const fetchVoucherDetails = async () => {
      if (voucherId) {
        try {
          const response = await fetch(`http://localhost:5050/api/Voucher/${voucherId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            });
          const data = await response.json();
          if (data.flag) {
            setVoucherDetails(data.data);
          }
        } catch (error) {
          console.error("Error fetching voucher details:", error);
        }
      }
    };

    fetchVoucherDetails();
  }, [voucherId]);

  // Fetch payment type name based on formData.paymentMethod
  useEffect(() => {
    const fetchPaymentType = async () => {
      if (formData.paymentMethod) {
        try {
          const response = await fetch(`http://localhost:5050/api/PaymentType/${formData.paymentMethod}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            });
          const data = await response.json();
          if (data.flag) {
            setPaymentTypeName(data.data.paymentTypeName);
          }
        } catch (error) {
          console.error("Error fetching payment type:", error);
        }
      }
    };

    fetchPaymentType();
  }, [formData.paymentMethod]);

  // Fetch room names based on room IDs
  useEffect(() => {
    const fetchRoomNames = async () => {
      const updatedRoomNames = { ...roomNames };
      for (const room of bookingRooms) {
        if (!roomNames[room.room]) {
          try {
            const response = await fetch(`http://localhost:5050/api/Room/${room.room}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedRoomNames[room.room] = data.data.roomName;
            }
          } catch (error) {
            console.error(`Error fetching room name for ID ${room.room}:`, error);
          }
        }
      }
      setRoomNames(updatedRoomNames);
    };

    if (bookingRooms.length > 0) {
      fetchRoomNames();
    }
  }, [bookingRooms]);

  // Fetch room names based on room IDs
  useEffect(() => {
    const fetchServiceNames = async () => {
      const updatedServiceNames = { ...serviceNames };
      for (const service of bookingServices) {
        if (!serviceNames[service.service]) {
          try {
            const response = await fetch(`http://localhost:5050/api/Service/${service.service}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedServiceNames[service.service] = data.data.serviceName;
            }
          } catch (error) {
            console.error(`Error fetching room name for ID ${service.service}:`, error);
          }
        }
      }
      setserviceNames(updatedServiceNames);
    };

    if (bookingServices.length > 0) {
      fetchServiceNames();
    }
  }, [bookingServices]);

  // Fetch Service Variant Names
  useEffect(() => {
    const fetchServiceVariantNames = async () => {
      const updatedVariantNames = { ...serviceVariantNames };
      for (const service of bookingServices) {
        if (service.serviceVariant && !serviceVariantNames[service.serviceVariant]) {
          try {
            const response = await fetch(`http://localhost:5050/api/ServiceVariant/${service.serviceVariant}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedVariantNames[service.serviceVariant] = data.data.serviceContent;
            }
          } catch (error) {
            console.error(`Error fetching service variant name for ID ${service.serviceVariant}:`, error);
          }
        }
      }
      setServiceVariantNames(updatedVariantNames);
    };

    if (bookingServices.length > 0) {
      fetchServiceVariantNames();
    }
  }, [bookingServices]);

  // Fetch pet names for both rooms and services
  useEffect(() => {
    const fetchPetNames = async () => {
      const updatedPetNames = { ...petNames };
      
      // Fetch pet names for room bookings
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

      // Fetch pet names for service bookings
      for (const service of bookingServices) {
        if (service.pet && !petNames[service.pet]) {
          try {
            const response = await fetch(`http://localhost:5050/api/pet/${service.pet}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              });
            const data = await response.json();
            if (data.flag) {
              updatedPetNames[service.pet] = data.data.petName;
            }
          } catch (error) {
            console.error(`Error fetching pet name for ID ${service.pet}:`, error);
          }
        }
      }
      setPetNames(updatedPetNames);
    };

    if (bookingRooms.length > 0 || bookingServices.length > 0) {
      fetchPetNames();
    }
  }, [bookingRooms, bookingServices]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Confirm Booking</h2>

      {/* User Information */}
      <div className="space-y-4 mb-6">
        <p className="text-lg"><strong>Name:</strong> {formData.name}</p>
        <p className="text-lg"><strong>Phone:</strong> {formData.phone}</p>
        <p className="text-lg"><strong>Address:</strong> {formData.address}</p>
        <p className="text-lg"><strong>Note:</strong> {formData.note || "None"}</p>
        <p className="text-lg"><strong>Payment Method:</strong> {paymentTypeName || "Loading..."}</p>

        {/* Display Selected Voucher */}
        {voucherDetails && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium">Voucher Applied:</h3>
            <p><strong>Name:</strong> {voucherDetails.voucherName}</p>
            <p><strong>Discount:</strong> {voucherDetails.voucherDiscount}%</p>
            <p><strong>Code:</strong> {voucherDetails.voucherCode}</p>
            <p><strong>Valid Until:</strong> {formatDateTime(voucherDetails.voucherEndDate)}</p>
          </div>
        )}
      </div>

      {/* Dynamically Rendered Services or Rooms */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium mb-4">
          {selectedOption === "Room" ? "Rooms Selected" : "Services Selected"}
        </h3>

        {selectedOption === "Room" && bookingRooms.length > 0 ? (
          <ul className="list-disc pl-5 space-y-4">
            {bookingRooms.map((room, index) => (
              <li key={index} className="text-lg border p-4 rounded-lg bg-gray-100">
                <p><strong>Room:</strong> {roomNames[room.room] || "Loading..."}</p>
                <p><strong>Pet:</strong> {petNames[room.pet] || "Loading..."}</p>
                <p><strong>Start Date & Time:</strong> {formatDateTime(room.start)}</p>
                <p><strong>End Date & Time:</strong> {formatDateTime(room.end)}</p>
                <p><strong>Price:</strong> {room.price.toLocaleString()} VND</p>
                <p><strong>Camera:</strong> {room.camera ? "Yes" : "No"}</p>
              </li>
            ))}
          </ul>
        ) : selectedOption === "Service" && bookingServices.length > 0 ? (
          <ul className="list-disc pl-5 space-y-4">
            <p><strong>Booking Date:</strong> {formatDateTime(bookingServicesDate)}</p>
            {bookingServices.map((service, index) => (
              <li key={index} className="text-lg border p-4 rounded-lg bg-gray-100">
                <p><strong>Service:</strong> {serviceNames[service.service] || "Loading..."}</p>
                <p><strong>Service variant:</strong> {serviceVariantNames[service.serviceVariant] || "Loading..."}</p>
                <p><strong>Pet:</strong> {petNames[service.pet] || "Loading..."}</p>
                <p><strong>Price:</strong> {service.price.toLocaleString()} VND</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg text-red-500">No {selectedOption === "Room" ? "rooms" : "services"} selected.</p>
        )}
      </div>

      {/* Total Price Section */}
      <div className="mt-6 text-lg font-semibold">
        <p>Original Price: <span className="text-gray-700">{totalPrice.toLocaleString()} VND</span></p>
        {finalDiscount > 0 && (
          <p className="text-green-600">
            Discount Applied: -{finalDiscount.toLocaleString()} VND
          </p>
        )}
        <p className="text-blue-600">Total Price After Discount: {discountedPrice.toLocaleString()} VND</p>
      </div>
    </div>
  );
};

export default BookingConfirmStep;
