import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import BookingRoomStatus from "../../../../components/Booking/booking-status/BookingRoomStatus";
import { motion } from "framer-motion";
import CameraModal from "../../../admins/camfeed/videoFeed/VideoFeed";

const CustomerRoomBookingDetail = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [roomHistory, setRoomHistory] = useState([]);
  const [roomName, setRoomName] = useState("Unknown");
  const [paymentTypeName, setPaymentTypeName] = useState("Unknown");
  const [accountName, setAccountName] = useState("Unknown");
  const [bookingStatusName, setBookingStatusName] = useState("Unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [petNames, setPetNames] = useState({});
  const [allDataLoaded, setAllDataLoaded] = useState(false);
const [selectedData, setSelectedData] = useState(null);
  const [isPushModalOpen, setPushModalOpen] = useState(false);
  const getToken = () => {
    return sessionStorage.getItem("token");
  };

  const fetchPetName = async (petId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/pet/${petId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.data.flag) {
        setPetNames((prev) => ({
          ...prev,
          [petId]: response.data.data.petName,
        }));
      }
    } catch (error) {
      console.error("Error fetching pet name:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
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

        const accountResponse = await axios.get(
          `http://localhost:5050/api/Account?AccountId=${bookingResponse.data.data.accountId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        setAccountName(accountResponse.data?.accountName || "Unknown");

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

        const historyResponse = await axios.get(
          `http://localhost:5050/api/RoomHistories/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        setRoomHistory(historyResponse.data.data);

        // Fetch pet names for all room histories
        const petFetchPromises = historyResponse.data.data.map((history) => 
          fetchPetName(history.petId)
        );

        const roomId = historyResponse.data.data[0]?.roomId;
        let roomPromise = Promise.resolve();
        if (roomId) {
          roomPromise = axios.get(
            `http://localhost:5050/api/Room/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          ).then(roomResponse => {
            setRoomName(roomResponse.data?.data?.roomName || "Unknown");
          });
        }

        // Wait for all data to be loaded
        await Promise.all([...petFetchPromises, roomPromise]);
        setAllDataLoaded(true);
      } catch (err) {
        setError("Failed to fetch booking details or related data");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
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
            null,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );

          if (response.data.flag) {
            Swal.fire({
              title: "Cancelled!",
              text: response.data.message || "Booking has been cancelled.",
              icon: "success",
              timer: 1500,
            });

            setBooking((prevBooking) => ({
              ...prevBooking,
              bookingStatusId: "Cancelled",
            }));
            setBookingStatusName("Cancelled");
          } else {
            Swal.fire({
              title: "Failed!",
              text: response.data.message || "The booking can't be cancelled.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "An error occurred while cancelling the booking.",
            icon: "error",
          });
        }
      }
    });
  };

  const handleCameraSettings = (roomHistoryId) => {
    const room = roomHistory.find((r) => r.roomHistoryId === roomHistoryId);
    if (!room) return;

   console.log(room);
   setSelectedData(room.cameraId);
   console.log("daya", selectedData);
   setPushModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarCustomer />
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
          Room Booking Details
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <BookingRoomStatus bookingStatus={bookingStatusName} />
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
                  <span className="font-semibold text-gray-700">
                    Booking Code:
                  </span>{" "}
                  <span className="text-blue-600">{booking.bookingCode}</span>
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-gray-700">
                    Account Name:
                  </span>{" "}
                  <span className="text-gray-800">{accountName}</span>
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-gray-700">
                    Payment Type:
                  </span>{" "}
                  <span className="text-gray-800">{paymentTypeName}</span>
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-lg">
                  <span className="font-semibold text-gray-700">
                    Total Amount:
                  </span>{" "}
                  <span className="text-green-600 font-bold">
                    {booking.totalAmount.toLocaleString()} VND
                  </span>
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-gray-700">Status:</span>{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      bookingStatusName === "Checked out"
                        ? "bg-green-100 text-green-800"
                        : bookingStatusName === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {bookingStatusName}
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-lg">
                <span className="font-semibold text-gray-700">
                  Booking Date:
                </span>{" "}
                <span className="text-gray-800">
                  {formatDate(booking.bookingDate)}
                </span>
              </p>
              <p className="text-lg mt-2">
                <span className="font-semibold text-gray-700">Notes:</span>{" "}
                <span className="text-gray-800">
                  {booking.notes || "No notes"}
                </span>
              </p>
              <p className="text-lg mt-2">
                <span className="font-semibold text-gray-700">
                  Payment Status:
                </span>{" "}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.isPaid
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
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
          Room Bookings
        </motion.h3>

        {!allDataLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="p-6 bg-white rounded-xl shadow-lg">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : roomHistory.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {roomHistory.map((history, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative"
              >
                {history.bookingCamera && history.status === "Checked in" && bookingStatusName === "Checked in"&& (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                      Camera
                    </span>
                    <button
                      onClick={() =>
                        handleCameraSettings(history.roomHistoryId)
                      }
                      className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition duration-300"
                      title="Camera Settings"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                <h4 className="text-xl font-semibold text-gray-800 mb-4">
                  Room Booking #{index + 1}
                </h4>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <span className="font-semibold">Room Name:</span>{" "}
                    <span className="text-blue-600">{roomName}</span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Pet:</span>{" "}
                    <span className="text-gray-800">
                      {petNames[history.petId] || "Unknown"}
                    </span>
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">
                      <span className="font-semibold">Booking Period:</span>{" "}
                      <span className="text-gray-800">
                        {formatDate(history.bookingStartDate)} -{" "}
                        {formatDate(history.bookingEndDate)}
                      </span>
                    </p>
                    <p className="text-gray-700 mt-1">
                      <span className="font-semibold">Check-in:</span>{" "}
                      <span className="text-gray-800">
                        {formatDate(history.checkInDate)}
                      </span>
                    </p>
                    <p className="text-gray-700 mt-1">
                      <span className="font-semibold">Check-out:</span>{" "}
                      <span className="text-gray-800">
                        {formatDate(history.checkOutDate)}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Camera:</span>{" "}
                      <span
                        className={
                          history.bookingCamera
                            ? "text-green-600"
                            : "text-gray-600"
                        }
                      >
                        {history.bookingCamera ? "Included" : "Not included"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        history.status === "Check out"
                          ? "bg-green-100 text-green-800"
                          : history.status === "Check in"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {history.status}
                    </span>
                  </div>
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
            No room history found for this booking.
          </motion.p>
        )}

        {(bookingStatusName === "Pending" ||
          bookingStatusName === "Confirmed") && (
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
      <CameraModal cameraId={selectedData} onClose={() => setPushModalOpen(false)} open={isPushModalOpen} />
    </div>
  );
};

export default CustomerRoomBookingDetail;