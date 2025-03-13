import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import BookingRoomStatus from "../../../../components/Booking/booking-status/BookingRoomStatus";

const RoomBookingDetailPage = () => {
  const sidebarRef = useRef(null);
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [roomHistory, setRoomHistory] = useState([]);
  const [roomName, setRoomName] = useState("Unknown");
  const [paymentTypeName, setPaymentTypeName] = useState("Unknown");
  const [accountName, setAccountName] = useState("Unknown");
  const [bookingStatusName, setBookingStatusName] = useState("Unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => {
    return sessionStorage.getItem("token");
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

        const roomId = historyResponse.data.data[0]?.roomId;
        if (roomId) {
          const roomResponse = await axios.get(
            `http://localhost:5050/api/Room/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          setRoomName(roomResponse.data?.data?.roomName || "Unknown");
        }
      } catch (err) {
        setError("Failed to fetch booking details or related data");
      }
    };

    fetchBookingDetails();
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
            });

            // Refresh the booking details after cancellation
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

  const handleNextStatus = async () => {
    const statusOrder = ["Pending", "Confirmed", "Checked in", "Checked out"];
    const currentIndex = statusOrder.indexOf(bookingStatusName);

    if (currentIndex === -1 || bookingStatusName === "Cancelled") return; // Do nothing if cancelled or unknown status

    const nextStatus = statusOrder[currentIndex + 1];

    try {
      console.log(bookingId);
      const response = await axios.put(
        `http://localhost:5115/Bookings/updateRoomStatus/${bookingId}`,
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
      if (error.response) {
        Swal.fire(
          "Failed!",
          error.response.data.message || "Could not update status.",
          "error"
        );
      } else {
        Swal.fire(
          "Error!",
          "An error occurred while updating the status.",
          "error"
        );
      }
    }
  };

  if (loading)
    return <p className="text-center text-xl font-semibold">Loading...</p>;

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Room Booking Details
          </h2>
          <BookingRoomStatus bookingStatus={bookingStatusName} />
          {["Pending", "Confirmed", "Checked in"].includes(
            bookingStatusName
          ) && (
            <div className="mt-4 text-center">
              <button
                onClick={handleNextStatus}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
              >
                Move to Next Status
              </button>
            </div>
          )}

          {booking && (
            <div className="space-y-4 p-6 bg-white shadow-md rounded-lg">
              <div className="flex justify-between text-lg">
                <p>
                  <strong>Booking Code:</strong> {booking.bookingCode}
                </p>
                <p>
                  <strong>Total Amount:</strong> {booking.totalAmount}
                </p>
              </div>
              <div className="flex justify-between text-lg">
                <p>
                  <strong>Account Name:</strong> {accountName}
                </p>
                <p>
                  <strong>Status:</strong> {bookingStatusName}
                </p>
              </div>
              <div className="flex justify-between text-lg">
                <p>
                  <strong>Payment Type:</strong> {paymentTypeName}
                </p>
                <p>
                  <strong>Booking Date:</strong>{" "}
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </p>
              </div>
              <p>
                <strong>Notes:</strong> {booking.notes}
              </p>
              <p>
                <strong>Is Paid:</strong> {booking.isPaid ? "Yes" : "No"}
              </p>
            </div>
          )}

          <h3 className="text-xl font-semibold mt-6 mb-4 text-center">
            Room Bookings
          </h3>
          {roomHistory.length > 0 ? (
            <div className="mt-4 space-y-4">
              {roomHistory.map((history, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg shadow-md"
                >
                  <p>
                    <strong>Room Name:</strong> {roomName}
                  </p>
                  <p>
                    <strong>Pet ID:</strong> {history.petId}
                  </p>
                  <p>
                    <strong>Booking Start Date:</strong>{" "}
                    {new Date(history.bookingStartDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Booking End Date:</strong>{" "}
                    {new Date(history.bookingEndDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Check-in Date:</strong>{" "}
                    {new Date(history.checkInDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Check-out Date:</strong>{" "}
                    {new Date(history.checkOutDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {history.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No room history found for this booking.</p>
          )}

          {(bookingStatusName === "Pending" ||
            bookingStatusName === "Confirmed") && (
            <div className="mt-4 text-center">
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomBookingDetailPage;
