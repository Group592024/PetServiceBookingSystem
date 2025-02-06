import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";

const ServiceBookingDetailPage = () => {
  const sidebarRef = useRef(null);
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [serviceItems, setServiceItems] = useState([]);
  const [paymentTypeName, setPaymentTypeName] = useState("");  // State for Payment Type Name
  const [serviceName, setServiceName] = useState("");  // State for Service Name
  const [accountName, setAccountName] = useState(""); // State for Account Name
  const [bookingStatusName, setBookingStatusName] = useState(""); // State for Booking Status Name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
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

      } catch (err) {
        setError("Failed to fetch booking details or related data");
      }
    };

    const fetchBookingServiceItems = async () => {
      try {
        const itemsResponse = await axios.get(
          `http://localhost:5023/api/BookingServiceItems/${bookingId}`
        );

        if (itemsResponse.data && itemsResponse.data.data.length > 0) {
          const item = itemsResponse.data.data[0]; // Assuming one service item per booking
          const serviceVariantId = item.serviceVariantId;

          // Check if serviceVariantId is valid
          if (serviceVariantId && serviceVariantId !== '00000000-0000-0000-0000-000000000000') {
            // Fetch service variant and get the serviceId
            const serviceVariantResponse = await axios.get(
              `http://localhost:5023/api/ServiceVariant/${serviceVariantId}`
            );
            const serviceId = serviceVariantResponse.data?.data?.serviceId;

            // Fetch service name using serviceId
            if (serviceId) {
              const serviceResponse = await axios.get(
                `http://localhost:5023/api/Service/${serviceId}`
              );
              setServiceName(serviceResponse.data?.data?.serviceName || "Unknown");
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
            Service Booking Details
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
                  <strong>Account Name:</strong> {accountName} {/* Display account name */}
                </p>
                <p>
                  <strong>Status:</strong> {bookingStatusName} {/* Display booking status */}
                </p>
              </div>
              <div className="flex justify-between text-lg">
                <p>
                  <strong>Payment Type:</strong> {paymentTypeName}
                </p>
                <p>
                  <strong>Service:</strong> {serviceName} {/* Display service name here */}
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
          <h3 className="text-xl font-semibold mt-6 mb-4">Service Items</h3>
          {serviceItems.length > 0 ? (
            <div className="bg-white p-6 shadow-md rounded-lg space-y-4">
              {serviceItems.map((item, index) => (
                <div key={index} className="space-y-2 p-4 border-b">
                  <p>
                    <strong>Service Name:</strong> {serviceName} {/* Show service name for each service item */}
                  </p>
                  <p>
                    <strong>Pet ID:</strong> {item.petId}
                  </p>
                  <p>
                    <strong>Price:</strong> {item.price}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No service items found for this booking.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingDetailPage;
