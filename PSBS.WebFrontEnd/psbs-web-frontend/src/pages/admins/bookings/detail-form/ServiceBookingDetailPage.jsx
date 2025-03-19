import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import BookingServiceStatus from "../../../../components/Booking/booking-status/BookingServiceStatus";
import { motion } from "framer-motion";

const ServiceBookingDetailPage = () => {
  const sidebarRef = useRef(null);
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [serviceItems, setServiceItems] = useState([]);
  const [paymentTypeName, setPaymentTypeName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bookingStatusName, setBookingStatusName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [petNames, setPetNames] = useState({});
  const [serviceVariantInfo, setServiceVariantInfo] = useState({});

  const getToken = () => {
    return sessionStorage.getItem("token");
  };

  const fetchPetName = async (petId) => {
    try {
      const response = await fetch(`http://localhost:5050/api/pet/${petId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        }
      });

      const data = await response.json();
      if (data.flag) {
        setPetNames(prev => ({
          ...prev,
          [petId]: data.data.petName
        }));
      }
    } catch (error) {
      console.error("Error fetching pet name:", error);
    }
  };

  const fetchServiceVariantInfo = async (serviceVariantId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/ServiceVariant/${serviceVariantId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (response.data.flag) {
        setServiceVariantInfo(prev => ({
          ...prev,
          [serviceVariantId]: response.data.data
        }));
      }
    } catch (error) {
      console.error("Error fetching service variant info:", error);
    }
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const bookingResponse = await axios.get(
          `http://localhost:5115/Bookings/${bookingId}`
        );
        setBooking(bookingResponse.data.data);

        // Fetch payment type name
        const paymentResponse = await axios.get(
          `http://localhost:5050/api/PaymentType/${bookingResponse.data.data.paymentTypeId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        setPaymentTypeName(
          paymentResponse.data?.data?.paymentTypeName || "Unknown"
        );

        // Fetch account name using accountId
        const accountResponse = await axios.get(
          `http://localhost:5050/api/Account?AccountId=${bookingResponse.data.data.accountId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        setAccountName(accountResponse.data?.accountName || "Unknown");

        // Fetch booking status name using bookingStatusId
        const statusResponse = await axios.get(
          `http://localhost:5050/api/BookingStatus/${bookingResponse.data.data.bookingStatusId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        setBookingStatusName(
          statusResponse.data?.data?.bookingStatusName || "Unknown"
        );
      } catch (err) {
        setError("Failed to fetch booking details or related data");
      }
    };

    const fetchBookingServiceItems = async () => {
      try {
        const itemsResponse = await axios.get(
          `http://localhost:5050/api/BookingServiceItems/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (itemsResponse.data && itemsResponse.data.data.length > 0) {
          const item = itemsResponse.data.data[0];
          const serviceVariantId = item.serviceVariantId;

          if (
            serviceVariantId &&
            serviceVariantId !== "00000000-0000-0000-0000-000000000000"
          ) {
            const serviceVariantResponse = await axios.get(
              `http://localhost:5050/api/ServiceVariant/${serviceVariantId}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              }
            );
            const serviceId = serviceVariantResponse.data?.data?.serviceId;

            if (serviceId) {
              const serviceResponse = await axios.get(
                `http://localhost:5050/api/Service/${serviceId}`,
                {
                  headers: {
                    Authorization: `Bearer ${getToken()}`,
                  },
                }
              );
              setServiceName(
                serviceResponse.data?.data?.serviceName || "Unknown"
              );
            }
          } else {
            setError("Invalid service variant ID");
          }

          setServiceItems(itemsResponse.data.data);
          // Fetch pet names and service variant info for all items
          itemsResponse.data.data.forEach(item => {
            fetchPetName(item.petId);
            if (item.serviceVariantId) {
              fetchServiceVariantInfo(item.serviceVariantId);
            }
          });
        }
      } catch (err) {
        setError("Failed to fetch booking service items");
      }
    };

    fetchBookingDetails();
    fetchBookingServiceItems();
    setLoading(false);
  }, [bookingId]);

  // Function to cancel booking
  const handleCancelBooking = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(
            `http://localhost:5115/Bookings/cancel/${bookingId}`
          );

          if (response.data.flag) {
            Swal.fire(
              "Cancelled!",
              "The booking has been cancelled.",
              "success"
            );
            setBookingStatusName("Cancelled"); // Update status in UI
          } else {
            Swal.fire("Error!", response.data.message, "error");
          }
        } catch (err) {
          Swal.fire("Error!", "Failed to cancel the booking.", "error");
        }
      }
    });
  };
  const handleNextStatus = async () => {
    const statusOrder = ["Pending", "Confirmed", "Processing", "Completed"];
    const currentIndex = statusOrder.indexOf(bookingStatusName);

    if (currentIndex === -1 || bookingStatusName === "Cancelled") return; // Do nothing if cancelled or unknown status

    const nextStatus = statusOrder[currentIndex + 1];

    try {
      const response = await axios.put(
        `http://localhost:5115/Bookings/updateServiceStatus/${bookingId}`,
        {
          status: nextStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.data.flag) {
        setBookingStatusName(nextStatus);
        Swal.fire(
          "Success!",
          `Booking status updated to ${nextStatus}.`,
          "success"
        );
      } else {
        Swal.fire(
          "Failed!",
          response.data.message || "Could not update status.",
          "error"
        );
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        "An error occurred while updating the status.",
        "error"
      );
    }
  };
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (error) return <p className="text-center text-xl text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto p-4"
        >
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold mb-6 text-center text-gray-800"
          >
            Service Booking Details
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <BookingServiceStatus bookingStatus={bookingStatusName} />
          </motion.div>

          {["Pending", "Confirmed", "Processing"].includes(bookingStatusName) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 mb-8 text-center"
            >
              <div className="inline-flex items-center space-x-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-semibold text-lg">Current Status:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    bookingStatusName === "Completed" ? "bg-green-100 text-green-800" :
                    bookingStatusName === "Cancelled" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {bookingStatusName}
                  </span>
                </div>
                <div className="h-8 w-px bg-gray-300 mx-2"></div>
                <button
                  onClick={handleNextStatus}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-3"
                >
                  <span className="text-lg">Move to Next Status</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {booking && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4 p-8 bg-white shadow-xl rounded-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-lg">
                    <span className="font-semibold text-gray-700">Booking Code:</span>{" "}
                    <span className="text-blue-600">{booking.bookingCode}</span>
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold text-gray-700">Account Name:</span>{" "}
                    <span className="text-gray-800">{accountName}</span>
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold text-gray-700">Payment Type:</span>{" "}
                    <span className="text-gray-800">{paymentTypeName}</span>
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-lg">
                    <span className="font-semibold text-gray-700">Total Amount:</span>{" "}
                    <span className="text-green-600 font-bold">{booking.totalAmount.toLocaleString()} VND</span>
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold text-gray-700">Status:</span>{" "}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      bookingStatusName === "Completed" ? "bg-green-100 text-green-800" :
                      bookingStatusName === "Cancelled" ? "bg-red-100 text-red-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {bookingStatusName}
                    </span>
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold text-gray-700">Service:</span>{" "}
                    <span className="text-gray-800">{serviceName}</span>
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-lg">
                  <span className="font-semibold text-gray-700">Booking Date:</span>{" "}
                  <span className="text-gray-800">
                    {new Date(booking.bookingDate).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }).replace(',', '')}
                  </span>
                </p>
                <p className="text-lg mt-2">
                  <span className="font-semibold text-gray-700">Notes:</span>{" "}
                  <span className="text-gray-800">{booking.notes || "No notes"}</span>
                </p>
                <p className="text-lg mt-2">
                  <span className="font-semibold text-gray-700">Payment Status:</span>{" "}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {booking.isPaid ? "Paid" : "Pending"}
                  </span>
                </p>
              </div>
            </motion.div>
          )}

          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-2xl font-semibold mt-8 mb-4 text-center text-gray-800"
          >
            Service Items
          </motion.h3>

          {serviceItems.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {serviceItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Service Item #{index + 1}</h4>
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      <span className="font-semibold">Service Name:</span>{" "}
                      <span className="text-blue-600">{serviceName}</span>
                    </p>
                    {serviceVariantInfo[item.serviceVariantId] && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700">
                          <span className="font-semibold">Service Variant:</span>{" "}
                          <span className="text-gray-800">
                            {serviceVariantInfo[item.serviceVariantId].serviceContent}
                          </span>
                        </p>
                        <p className="text-gray-700 mt-1">
                          <span className="font-semibold">Variant Price:</span>{" "}
                          <span className="text-green-600 font-semibold">
                            {serviceVariantInfo[item.serviceVariantId].servicePrice.toLocaleString()} VND
                          </span>
                        </p>
                      </div>
                    )}
                    <p className="text-gray-700">
                      <span className="font-semibold">Pet:</span>{" "}
                      <span className="text-gray-800">
                        {petNames[item.petId] || "Loading..."}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Final Price:</span>{" "}
                      <span className="text-green-600 font-semibold">
                        {item.price.toLocaleString()} VND
                      </span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center text-gray-600 text-lg"
            >
              No service items found for this booking.
            </motion.p>
          )}

          {(bookingStatusName === "Pending" || bookingStatusName === "Confirmed") && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-8 text-center"
            >
              <button
                onClick={handleCancelBooking}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                Cancel Booking
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceBookingDetailPage;
