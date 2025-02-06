import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";

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

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Fetch booking details
        const bookingResponse = await axios.get(
          `http://localhost:5115/Bookings/${bookingId}`
        );
        setBooking(bookingResponse.data.data);

        // Fetch payment type name
        const paymentResponse = await axios.get(
          `http://localhost:5115/api/PaymentType/${bookingResponse.data.data.paymentTypeId}`
        );
        setPaymentTypeName(paymentResponse.data?.data?.paymentTypeName || "Unknown");

        // Fetch account name using accountId
        const accountResponse = await axios.get(
          `http://localhost:5000/api/Account?AccountId=${bookingResponse.data.data.accountId}`
        );
        setAccountName(accountResponse.data?.accountName || "Unknown");

        // Fetch booking status name using bookingStatusId
        const statusResponse = await axios.get(
          `http://localhost:5115/api/BookingStatus/${bookingResponse.data.data.bookingStatusId}`
        );
        setBookingStatusName(statusResponse.data?.data?.bookingStatusName || "Unknown");

        // Fetch room history details
        const historyResponse = await axios.get(
          `http://localhost:5023/api/RoomHistories/${bookingId}`
        );
        setRoomHistory(historyResponse.data.data);

        // Fetch room details using roomId from roomHistory (assuming roomHistory contains roomId)
        const roomId = historyResponse.data.data[0]?.roomId; // Use the first entry's roomId
        if (roomId) {
          const roomResponse = await axios.get(
            `http://localhost:5023/api/Room/${roomId}`
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

  if (loading)
    return <p className="text-center text-xl font-semibold">Loading...</p>;
  if (error) return <p className="text-center text-xl text-red-500">{error}</p>;

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Room Booking Details
          </h2>
          {booking && (
            <div className="space-y-4 p-6 bg-white shadow-md rounded-lg">
              <div className="flex justify-between text-lg">
                <p>
                  <strong>Booking ID:</strong> {booking.bookingId}
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

          <h3 className="text-xl font-semibold mt-6 mb-4">Room History</h3>
          {roomHistory.length > 0 ? (
            <div className="bg-white p-6 shadow-md rounded-lg space-y-4">
              {roomHistory.map((history, index) => (
                <div key={index} className="space-y-2 p-4 border-b">
                  <p>
                    <strong>Room ID:</strong> {history.roomId}
                  </p>
                  <p>
                    <strong>Room Name:</strong> {roomName} {/* Use roomName from state */}
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
        </div>
      </div>
    </div>
  );
};

export default RoomBookingDetailPage;
