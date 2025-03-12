import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import BookingServiceStatus from "../../../../components/Booking/booking-status/BookingServiceStatus";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";

const CustomerServiceBookingDetail = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [serviceItems, setServiceItems] = useState([]);
  const [paymentTypeName, setPaymentTypeName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bookingStatusName, setBookingStatusName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => {
    return sessionStorage.getItem('token');
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const bookingResponse = await axios.get(
          `http://localhost:5115/Bookings/${bookingId}`, {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );
        setBooking(bookingResponse.data.data);

        // Fetch payment type name
        const paymentResponse = await axios.get(
          `http://localhost:5050/api/PaymentType/${bookingResponse.data.data.paymentTypeId}`, {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );
        setPaymentTypeName(
          paymentResponse.data?.data?.paymentTypeName || "Unknown"
        );

        // Fetch account name using accountId
        const accountResponse = await axios.get(
          `http://localhost:5050/api/Account?AccountId=${bookingResponse.data.data.accountId}`, {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );
        setAccountName(accountResponse.data?.accountName || "Unknown");

        // Fetch booking status name using bookingStatusId
        const statusResponse = await axios.get(
          `http://localhost:5050/api/BookingStatus/${bookingResponse.data.data.bookingStatusId}`, {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
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
          `http://localhost:5050/api/BookingServiceItems/${bookingId}`, {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
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
              `http://localhost:5050/api/ServiceVariant/${serviceVariantId}`, {
                headers: {
                  Authorization: `Bearer ${getToken()}`
                }
              }
            );
            const serviceId = serviceVariantResponse.data?.data?.serviceId;

            if (serviceId) {
              const serviceResponse = await axios.get(
                `http://localhost:5050/api/Service/${serviceId}`, {
                  headers: {
                    Authorization: `Bearer ${getToken()}`
                  }
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

  if (loading)
    return <p className="text-center text-xl font-semibold">Loading...</p>;
  if (error) return <p className="text-center text-xl text-red-500">{error}</p>;

  return (
    <div>
      <div>
      <NavbarCustomer/>
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Service Booking Details
          </h2>
          <BookingServiceStatus bookingStatus={bookingStatusName} />
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
                  <strong>Service:</strong> {serviceName}
                </p>
              </div>
              <div className="flex justify-between text-lg">
                <p>
                  <strong>Booking Date:</strong>{" "}
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </p>
              </div>
              <p>
                <strong>Notes:</strong> {booking.notes}
              </p>
              <p>
                <strong>Paid:</strong> {booking.isPaid ? "Yes" : "No"}
              </p>
            </div>
          )}
          <h3 className="text-xl font-semibold mt-6 text-center">
            Service Items
          </h3>
          {serviceItems.length > 0 ? (
            <div className="mt-4 space-y-4">
              {serviceItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg shadow-md"
                >
                  <p>
                    <strong>Service Name:</strong> {serviceName}
                  </p>
                  <p>
                    <strong>Pet ID:</strong> {item.petId}
                  </p>
                  <p>
                    <strong>Price:</strong> {item.price} VND
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              No service items found for this booking.
            </p>
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

export default CustomerServiceBookingDetail;
