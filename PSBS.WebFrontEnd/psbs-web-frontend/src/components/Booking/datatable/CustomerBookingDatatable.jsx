import "./customer_booking_datatable.css";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";

const CustomerBookingDatatable = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("User not authenticated");
        toast.error("User not authenticated");
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const accountId = decodedToken.AccountId;

      if (!accountId) {
        setError("Account ID not found");
        toast.error("Account ID not found");
        setLoading(false);
        return;
      }

      const bookingsResponse = await axios.get(
        `http://localhost:5115/Bookings/list/${accountId}`
      );

      if (!bookingsResponse.data.flag) {
        setError(bookingsResponse.data.message || "No bookings found");
        toast.error(bookingsResponse.data.message || "No bookings found");
        setLoading(false);
        return;
      }

      const bookingsData = bookingsResponse.data.data;

      const updatedBookings = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
            const accountResponse = await axios.get(`http://localhost:5000/api/Account?AccountId=${booking.accountId}`);
            const customerName = accountResponse.data?.accountName || "Unknown";

            const statusResponse = await axios.get(`http://localhost:5115/api/BookingStatus/${booking.bookingStatusId}`);
            const bookingStatusName = statusResponse.data?.data?.bookingStatusName || "Unknown";

            const typeResponse = await axios.get(`http://localhost:5115/api/BookingType/${booking.bookingTypeId}`);
            const bookingTypeName = typeResponse.data?.data?.bookingTypeName || "Unknown";

            return {
              ...booking,
              customerName,
              bookingStatusName,
              bookingTypeName,
            };
          } catch (error) {
            console.error("Error fetching additional details:", error);
            return {
              ...booking,
              customerName: "Error",
              bookingStatusName: "Error",
              bookingTypeName: "Error",
            };
          }
        })
      );

      setBookings(updatedBookings);
      toast.success("Booking data fetched successfully!");
    } catch (err) {
      setError("Error fetching data: " + err.message);
      toast.error("Error fetching data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1, headerAlign: "center", align: "center" },
    { field: "customerName", headerName: "Customer Name", flex: 2, headerAlign: "center", align: "center" },
    { field: "totalAmount", headerName: "Total Amount", flex: 1, headerAlign: "center", align: "center" },
    { field: "bookingTypeName", headerName: "Booking Type", flex: 1, headerAlign: "center", align: "center" },
    { field: "bookingStatusName", headerName: "Status", flex: 1, headerAlign: "center", align: "center" },
    {
      field: "paidStatus",
      headerName: "Paid",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ color: params.value ? "green" : "red", fontWeight: "bold" }}>
          {params.value ? "Paid" : "Unpaid"}
        </div>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 2,
      headerAlign: "center",
      renderCell: (params) => {
        const detailPage = params.row.bookingTypeName === "Hotel" ? "RoomBookingDetailPage" : "ServiceBookingDetailPage";
        return (
          <div className="cellAction flex justify-around items-center w-full h-full">
            <Link to={`/bookings/detail/${detailPage}/${params.row.bookingId}`} className="detailBtn" style={{ textDecoration: "none" }}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </Link>
          </div>
        );
      },
    },
  ];

  const bookingsRows = bookings.map((booking, index) => ({
    id: index + 1,
    bookingId: booking.bookingId,
    customerName: booking.customerName,
    totalAmount: booking.totalAmount,
    bookingTypeName: booking.bookingTypeName,
    bookingStatusName: booking.bookingStatusName,
    paidStatus: booking.isPaid,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-svh">
        <div role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="Datatable">
      <Box
        sx={{
          height: 400,
          width: "100%",
          "& .MuiDataGrid-root": {
            backgroundColor: "#f9f9f9", // Brighter background for the entire DataGrid
          },
          "& .MuiDataGrid-row": {
            backgroundColor: "#f4f4f4", // Brighter row background
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "#c8f6e9 !important", // Brighter selected row
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#9f9f9f", // Brighter background for pagination
          },
          "& .MuiPaginationItem-root": {
            backgroundColor: "#b3f2ed", // Brighter pagination buttons
            color: "#3f3f3f",
          },
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: "#ede4e2", // Hover effect on pagination buttons
          },
        }}
      >
        <DataGrid
          rows={bookingsRows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </Box>
      <ToastContainer />
    </div>
  );
};

export default CustomerBookingDatatable;
