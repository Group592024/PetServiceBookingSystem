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
  const [accountName, setAccountName] = useState("");
  const [bookingStatusName, setBookingStatusName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [petNames, setPetNames] = useState({});
  const [serviceInfo, setServiceInfo] = useState({});
  const [statusLoading, setStatusLoading] = useState(false);
  const [voucherDetails, setVoucherDetails] = useState(null);
  const [bookingNote, setBookingNote] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  // Add this function to handle opening the note modal
  const handleOpenNoteModal = () => {
    setIsNoteModalOpen(true);
  };

  // Add this function to handle closing the note modal
  const handleCloseNoteModal = () => {
    setIsNoteModalOpen(false);
  };

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
          `http://localhost:5115/Bookings/${bookingId}`
        );
        setBooking(bookingResponse.data.data);

        // Fetch voucher details if voucherId exists
        if (bookingResponse.data.data.voucherId &&
          bookingResponse.data.data.voucherId !== "00000000-0000-0000-0000-000000000000") {
          await fetchVoucherDetails(bookingResponse.data.data.voucherId);
        }

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
          setServiceItems(itemsResponse.data.data);

          // Fetch details for each item
          itemsResponse.data.data.forEach(item => {
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
            `http://localhost:5115/Bookings/cancel/${bookingId}`,
            null,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
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

    if (currentIndex === -1 || bookingStatusName === "Cancelled") return;

    const nextStatus = statusOrder[currentIndex + 1];

    // Check if trying to move to "Processing" with unpaid VNPay
    if (nextStatus === "Processing" &&
      paymentTypeName === "VNPay" &&
      !booking.isPaid) {
      await Swal.fire(
        "Payment Required",
        "VNPay payment must be completed before processing the service.",
        "warning"
      );
      return;
    }

    try {
      setStatusLoading(true);

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
        if (nextStatus === "Completed" && paymentTypeName === "COD" && !booking.isPaid) {
          setBooking(prev => ({
            ...prev,
            isPaid: true
          }));
        }
        await Swal.fire(
          "Success!",
          `Booking status updated to ${nextStatus}.`,
          "success"
        );
      } else {
        throw new Error(response.data.message || "Could not update status");
      }
    } catch (error) {
      await Swal.fire(
        "Error!",
        error.response?.data?.message || error.message || "An error occurred while updating the status.",
        "error"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const handleVNPayPayment = async () => {
    try {
      if (!booking) return;

      // Get current path to redirect back after payment
      const currentPath = window.location.pathname;

      // Create description with booking code and path
      const description = JSON.stringify({
        bookingCode: booking.bookingCode.trim(),
        redirectPath: currentPath
      });

      const vnpayUrl = `https://localhost:5201/Bookings/CreatePaymentUrl?moneyToPay=${Math.round(
        booking.totalAmount
      )}&description=${encodeURIComponent(description)}&returnUrl=https://localhost:5201/Vnpay/Callback`;

      const vnpayResponse = await fetch(vnpayUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const vnpayResult = await vnpayResponse.text();

      if (vnpayResult.startsWith("http")) {
        window.location.href = vnpayResult;
      } else {
        throw new Error("VNPay payment initiation failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      Swal.fire("Error!", "An error occurred while processing payment.", "error");
    }
  };

  const fetchVoucherDetails = async (voucherId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/Voucher/${voucherId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.data.flag && response.data.data) {
        setVoucherDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching voucher details:", error);
    }
  };


  // Update the handleSaveNote function to match the backend API
  const handleSaveNote = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5115/Bookings/addnote/${bookingId}`,
        JSON.stringify(bookingNote),  // Send the note as a plain string
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.flag) {
        // Update local state with the new note
        setBooking(prev => ({
          ...prev,
          notes: bookingNote
        }));

        await Swal.fire(
          "Success!",
          "Note has been added to the booking.",
          "success"
        );
        setIsNoteModalOpen(false);
      } else {
        throw new Error(response.data.message || "Failed to add note");
      }
    } catch (error) {
      await Swal.fire(
        "Error!",
        error.response?.data?.message || error.message || "Failed to add note",
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
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${bookingStatusName === "Completed" ? "bg-green-100 text-green-800" :
                    bookingStatusName === "Cancelled" ? "bg-red-100 text-red-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                    {bookingStatusName}
                  </span>
                </div>
                <div className="h-8 w-px bg-gray-300 mx-2"></div>
                <button
                  onClick={handleNextStatus}
                  disabled={statusLoading}
                  className={`px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-3 ${statusLoading ? "opacity-50 cursor-not-allowed" : "hover:from-blue-600 hover:to-blue-700"
                    }`}
                >
                  {statusLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        {/* Loading spinner icon */}
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <span className="text-lg">Move to Next Status</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
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
                    <span className="text-green-600 font-bold">{new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(booking.totalAmount)}</span>
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold text-gray-700">Status:</span>{" "}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bookingStatusName === "Completed" ? "bg-green-100 text-green-800" :
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
                    }).replace(',', '')}
                  </span>
                </p>
                <p className="text-lg mt-2">
                  <span className="font-semibold text-gray-700">Notes:</span>{" "}
                  <span className="text-gray-800">{booking.notes || "No notes"}</span>
                </p>
                <p className="text-lg mt-2">
                  <span className="font-semibold text-gray-700">Payment Status:</span>{" "}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {booking.isPaid ? "Paid" : "Pending"}
                  </span>
                </p>
                {bookingStatusName === "Cancelled" && paymentTypeName === "VNPay" && booking.isPaid && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleOpenNoteModal}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                      Take Note
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      Add a note for this cancelled booking with paid VNPay payment.
                    </p>
                  </div>
                )}

                {/* Note Modal */}
                {isNoteModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <h3 className="text-xl font-semibold mb-4">Add Note to Booking</h3>
                      <p className="text-gray-600 mb-4">
                        This booking was cancelled but payment was received via VNPay.
                        Please add a note about how this situation was handled.
                      </p>

                      <textarea
                        value={bookingNote}
                        onChange={(e) => setBookingNote(e.target.value)}
                        className="w-full h-32 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your note here..."
                      ></textarea>

                      <div className="flex justify-end mt-4 space-x-2">
                        <button
                          onClick={handleCloseNoteModal}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNote}
                          disabled={!bookingNote.trim()}
                          className={`px-4 py-2 rounded-lg transition-colors duration-300 ${bookingNote.trim()
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-blue-300 text-white cursor-not-allowed"
                            }`}
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {voucherDetails && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Applied Voucher</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Voucher Name:</span>{" "}
                          <span className="text-blue-600">{voucherDetails.voucherName}</span>
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">Code:</span>{" "}
                          <span className="text-gray-800">{voucherDetails.voucherCode}</span>
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">Discount:</span>{" "}
                          <span className="text-green-600">
                            {voucherDetails.voucherDiscount}% (Max {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(voucherDetails.voucherMaximum)})
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                          {/* <p className="text-gray-700">
                            <span className="font-semibold">Variant:</span>{" "}
                            <span className="text-gray-800">
                              {serviceInfo[item.serviceVariantId].variantName}
                            </span>
                          </p> */}
                          <p className="text-gray-700 mt-1">
                            <span className="font-semibold">Content:</span>{" "}
                            <span className="text-gray-800">
                              {serviceInfo[item.serviceVariantId].variantContent}
                            </span>
                          </p>
                          <p className="text-gray-700 mt-1">
                            <span className="font-semibold">Base Price:</span>{" "}
                            <span className="text-green-600 font-semibold">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(serviceInfo[item.serviceVariantId].variantPrice)}
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
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.price)}
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
              className="mt-8 text-center space-x-4"
            >
              {!booking.isPaid &&
                paymentTypeName === "VNPay" &&
                (
                  <button
                    onClick={handleVNPayPayment}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Pay with VNPAY
                  </button>
                )}
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