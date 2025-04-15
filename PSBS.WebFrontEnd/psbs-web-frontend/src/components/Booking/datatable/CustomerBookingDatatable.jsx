import "./customer_booking_datatable.css";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";


const CustomerBookingDatatable = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const getToken = () => {
    return sessionStorage.getItem('token');
  };


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
        `http://localhost:5115/Bookings/list/${accountId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
      );

      if (!bookingsResponse.data.flag) {
        setError(bookingsResponse.data.message || "No bookings found");
        toast.error(bookingsResponse.data.message || "No bookings found");
        setLoading(false);
        return;
      }

      const bookingsData = bookingsResponse.data.data;
      console.log("Booking dates:", bookingsResponse.data.data.map(b => ({
        id: b.bookingId,
        rawDate: b.bookingDate,
        parsed: new Date(b.bookingDate),
        isValid: !isNaN(new Date(b.bookingDate).getTime())
      })));

      const updatedBookings = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
            const accountResponse = await axios.get(`http://localhost:5050/api/Account?AccountId=${booking.accountId}`, {
              headers: {
                Authorization: `Bearer ${getToken()}`
              }
            });
            const customerName = accountResponse.data?.accountName || "Unknown";

            const statusResponse = await axios.get(`http://localhost:5050/api/BookingStatus/${booking.bookingStatusId}`, {
              headers: {
                Authorization: `Bearer ${getToken()}`
              }
            });
            const bookingStatusName = statusResponse.data?.data?.bookingStatusName || "Unknown";

            const typeResponse = await axios.get(`http://localhost:5050/api/BookingType/${booking.bookingTypeId}`, {
              headers: {
                Authorization: `Bearer ${getToken()}`
              }
            });
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
    { field: "id", headerName: "No.", flex: 1, headerAlign: "center", align: "center" },
    { field: "customerName", headerName: "Customer Name", flex: 2, headerAlign: "center", align: "center" },
    { field: "totalAmount", headerName: "Total Amount", flex: 1, headerAlign: "center", align: "center" },
    { field: "bookingTypeName", headerName: "Booking Type", flex: 1, headerAlign: "center", align: "center" },
    {
      field: "bookingDate",
      headerName: "Booking Date",
      flex: 2,
      headerAlign: "center",
      align: "center",
    },
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
            <IconButton
              aria-label="info"
              onClick={() => navigate(`/customer/bookings/detail/${detailPage}/${params.row.bookingId}`)}
            >
              <InfoIcon color="info" />
            </IconButton>
          </div>
        );
      },
    },
  ];

  const bookingsRows = bookings.map((booking, index) => ({
    id: index + 1,
    bookingId: booking.bookingId,
    customerName: booking.customerName,
    totalAmount: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(booking.totalAmount),
    bookingTypeName: booking.bookingTypeName,
    bookingDate: new Date(booking.bookingDate).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    bookingStatusName: booking.bookingStatusName,
    paidStatus: booking.isPaid,
  }));

  if (loading) {
    return (
      <div class="flex items-center justify-center h-svh">
        <div role="status">
          <svg
            aria-hidden="true"
            class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
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
            sorting: {
              sortModel: [{
                field: 'bookingDate',
                sort: 'desc'
              }]
            }
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
};

export default CustomerBookingDatatable;
