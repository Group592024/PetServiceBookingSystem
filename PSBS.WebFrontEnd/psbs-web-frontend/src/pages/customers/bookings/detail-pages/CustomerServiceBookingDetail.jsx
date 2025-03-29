import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import BookingServiceStatus from "../../../../components/Booking/booking-status/BookingServiceStatus";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import { motion } from "framer-motion";

const CustomerServiceBookingDetail = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [serviceItems, setServiceItems] = useState([]);
  const [paymentTypeName, setPaymentTypeName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bookingStatusName, setBookingStatusName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [petNames, setPetNames] = useState({});
  const [serviceInfo, setServiceInfo] = useState({}); // Stores both service and variant info

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

  const fetchServiceDetails = async (serviceVariantId) => {
    try {
      // First get the variant details
      const variantResponse = await axios.get(
        `http://localhost:5050/api/ServiceVariant/${serviceVariantId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (variantResponse.data.flag) {
        const variantData = variantResponse.data.data;
        const serviceId = variantData.serviceId;

        // Then get the service details
        const serviceResponse = await axios.get(
          `http://localhost:5050/api/Service/${serviceId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (serviceResponse.data.flag) {
          const serviceData = serviceResponse.data.data;
          
          // Store both service and variant info
          setServiceInfo(prev => ({
            ...prev,
            [serviceVariantId]: {
              serviceName: serviceData.serviceName,
              variantName: variantData.serviceVariantName,
              variantContent: variantData.serviceContent,
              variantPrice: variantData.servicePrice
            }
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
    }
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const bookingResponse = await axios.get(
          `http://localhost:5115/Bookings/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
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

        // Fetch account name
        const accountResponse = await axios.get(
          `http://localhost:5050/api/Account?AccountId=${bookingResponse.data.data.accountId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        setAccountName(accountResponse.data?.accountName || "Unknown");

        // Fetch booking status name
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
          const items = itemsResponse.data.data;
          setServiceItems(items);
          
          // Fetch details for each item
          items.forEach(item => {
            fetchPetName(item.petId);
            if (item.serviceVariantId && item.serviceVariantId !== "00000000-0000-0000-0000-000000000000") {
              fetchServiceDetails(item.serviceVariantId);
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
            `http://localhost:5115/Bookings/cancel/${bookingId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );

          if (response.data.flag) {
            Swal.fire("Cancelled!", "The booking has been cancelled.", "success");
            setBookingStatusName("Cancelled");
          } else {
            Swal.fire("Error!", response.data.message, "error");
          }
        } catch (err) {
          Swal.fire("Error!", "Failed to cancel the booking.", "error");
        }
      }
    });
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
      <NavbarCustomer />
      <div>
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
                    {serviceInfo[item.serviceVariantId] ? (
                      <>
                        <p className="text-gray-700">
                          <span className="font-semibold">Service:</span>{" "}
                          <span className="text-blue-600">
                            {serviceInfo[item.serviceVariantId].serviceName}
                          </span>
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-700">
                            <span className="font-semibold">Variant:</span>{" "}
                            <span className="text-gray-800">
                              {serviceInfo[item.serviceVariantId].variantName}
                            </span>
                          </p>
                          <p className="text-gray-700 mt-1">
                            <span className="font-semibold">Content:</span>{" "}
                            <span className="text-gray-800">
                              {serviceInfo[item.serviceVariantId].variantContent}
                            </span>
                          </p>
                          <p className="text-gray-700 mt-1">
                            <span className="font-semibold">Base Price:</span>{" "}
                            <span className="text-green-600 font-semibold">
                              {serviceInfo[item.serviceVariantId].variantPrice.toLocaleString()} VND
                            </span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">Loading service details...</p>
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

export default CustomerServiceBookingDetail;