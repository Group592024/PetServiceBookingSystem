import "./customer_booking_datatable.css";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import jwtDecode from "jwt-decode";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CustomerBookingDatatable = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const getToken = () => sessionStorage.getItem('token');

    useEffect(() => {
        fetchBookings();
    }, []);

    const showErrorAlert = (message) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: '#3085d6',
        });
    };

    const fetchBookings = async () => {
      try {
          setLoading(true);
          const token = getToken();
          if (!token) {
              showErrorAlert("User not authenticated");
              setLoading(false);
              return;
          }
  
          const decodedToken = jwtDecode(token);
          const accountId = decodedToken.AccountId;
  
          if (!accountId) {
              showErrorAlert("Account ID not found");
              setLoading(false);
              return;
          }
  
          const bookingsResponse = await axios.get(
              `http://localhost:5115/Bookings/list/${accountId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
  
          if (!bookingsResponse.data.flag) {
              showErrorAlert(bookingsResponse.data.message || "No bookings found");
              setLoading(false);
              return;
          }
  
          const bookingsData = bookingsResponse.data.data;
          const updatedBookings = await Promise.all(
              bookingsData.map(async (booking) => {
                  try {
                      const [accountResponse, statusResponse, typeResponse] = await Promise.all([
                          axios.get(`http://localhost:5050/api/Account?AccountId=${booking.accountId}`, {
                              headers: { Authorization: `Bearer ${token}` }
                          }),
                          axios.get(`http://localhost:5050/api/BookingStatus/${booking.bookingStatusId}`, {
                              headers: { Authorization: `Bearer ${token}` }
                          }),
                          axios.get(`http://localhost:5050/api/BookingType/${booking.bookingTypeId}`, {
                              headers: { Authorization: `Bearer ${token}` }
                          })
                      ]);
  
                      const formatDate = (date) => {
                          if (!date) return "N/A";
                          const options = {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          };
                          return new Date(date).toLocaleString("en-GB", options).replace(",", "");
                      };
  
                      return {
                          ...booking,
                          id: booking.bookingId,
                          customerName: accountResponse.data?.accountName || "Unknown",
                          bookingStatusName: statusResponse.data?.data?.bookingStatusName || "Unknown",
                          bookingTypeName: typeResponse.data?.data?.bookingTypeName || "Unknown",
                          formattedAmount: new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                          }).format(booking.totalAmount || 0),
                          formattedDate: formatDate(booking.bookingDate),
                          formattedCreateAt: formatDate(booking.createAt),
                          rawCreateAt: booking.createAt, // Keep raw date for sorting
                      };
                  } catch (error) {
                      console.error("Error fetching additional details:", error);
                      return {
                          ...booking,
                          id: booking.bookingId,
                          customerName: "Error",
                          bookingStatusName: "Error",
                          bookingTypeName: "Error",
                          formattedAmount: "N/A",
                          formattedDate: "N/A",
                          formattedCreateAt: "N/A",
                          rawCreateAt: null,
                      };
                  }
              })
          );
  
          setBookings(updatedBookings);
          Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Booking data fetched successfully!',
              confirmButtonColor: '#3085d6',
              timer: 2000,
              showConfirmButton: false
          });
      } catch (err) {
        if (err.response && err.response.status === 404) {
          Swal.fire({
              icon: 'error',
              title: 'No Booking Found',
              text: 'No booking found for user!',
              confirmButtonColor: '#3085d6',
              timer: 2000,
              showConfirmButton: false
          });
      } else {
          showErrorAlert("Error fetching data: " + err.message);
      }
      } finally {
          setLoading(false);
      }
  };

    const columns = [
        { 
            field: "id", 
            headerName: "No.", 
            flex: 1, 
            headerAlign: "center", 
            align: "center",
            renderCell: (params) => {
                const rowIndex = bookings.findIndex(item => item.id === params.id);
                return rowIndex + 1;
            },
            cellClassName: "cell-font"
        },
        { 
            field: "customerName", 
            headerName: "Customer Name", 
            flex: 2, 
            headerAlign: "center", 
            align: "center",
            cellClassName: "cell-font"
        },
        { 
            field: "formattedAmount", 
            headerName: "Total Amount", 
            flex: 1, 
            headerAlign: "center", 
            align: "center",
            cellClassName: "cell-font"
        },
        { 
            field: "bookingTypeName", 
            headerName: "Booking Type", 
            flex: 1, 
            headerAlign: "center", 
            align: "center",
            cellClassName: "cell-font"
        },
        {
            field: "formattedDate",
            headerName: "Booking Date",
            flex: 2,
            headerAlign: "center",
            align: "center",
            cellClassName: "cell-font"
        },
        {
            field: "formattedCreateAt",
            headerName: "Created At",
            flex: 2,
            headerAlign: "center",
            align: "center",
            cellClassName: "cell-font"
        },
        { 
            field: "bookingStatusName", 
            headerName: "Status", 
            flex: 1, 
            headerAlign: "center", 
            align: "center",
            renderCell: (params) => (
                <div className={`status-pill ${params.value.toLowerCase().replace(/\s+/g, '-')}`}>
                    {params.value}
                </div>
            )
        },
        {
            field: "isPaid",
            headerName: "Paid",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <div className={`paid-status ${params.value ? 'paid' : 'unpaid'}`}>
                    {params.value ? "Paid" : "Unpaid"}
                </div>
            ),
        },
        {
            field: "action",
            headerName: "Action",
            flex: 1,
            headerAlign: "center",
            renderCell: (params) => {
                const detailPage = params.row.bookingTypeName === "Hotel" ? "RoomBookingDetailPage" : "ServiceBookingDetailPage";
                return (
                    <div className="cellAction flex justify-around items-center w-full h-full">
                        <IconButton
                            aria-label="info"
                            onClick={() => navigate(`/customer/bookings/detail/${detailPage}/${params.row.bookingId}`)}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <InfoIcon color="info" />
                        </IconButton>
                    </div>
                );
            },
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <svg aria-hidden="true" className="w-12 h-12 text-blue-500 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#8B5CF6" />
                </svg>
                <p className="mt-4 text-gray-700 text-lg">Loading your bookings, please wait...</p>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-white rounded-2xl p-6 max-w-md mx-auto shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-600 mb-6">Schedule your first service appointment for your pet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="Datatable">
            <Box
                sx={{
                    height: 500,
                    width: "100%",
                    backgroundColor: "#ffffff",
                    '& .MuiDataGrid-root': {
                        border: 'none',
                        fontFamily: 'inherit',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f7fa',
                        color: '#4b5563',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        borderBottom: '1px solid #e5e7eb',
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #e5e7eb',
                        color: '#4b5563',
                        fontSize: '0.875rem',
                    },
                    '& .MuiDataGrid-row': {
                        '&:hover': {
                            backgroundColor: '#f9fafb',
                        },
                        '&.Mui-selected': {
                            backgroundColor: '#f0fdf4',
                            '&:hover': {
                                backgroundColor: '#e0f7e9',
                            },
                        },
                    },
                    '& .MuiDataGrid-footerContainer': {
                        backgroundColor: '#f5f7fa',
                        borderTop: '1px solid #e5e7eb',
                    },
                    '& .MuiTablePagination-root': {
                        color: '#4b5563',
                    },
                    '& .MuiDataGrid-virtualScroller': {
                        scrollbarWidth: 'thin',
                        '&::-webkit-scrollbar': {
                            width: '6px',
                            height: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#cbd5e1',
                            borderRadius: '3px',
                        },
                    },
                }}
            >
                <DataGrid
                    rows={bookings}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                        sorting: {
                            sortModel: [{
                                field: 'formattedCreateAt',
                                sort: 'desc'
                            }]
                        }
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    disableColumnMenu
                    autoHeight={false}
                />
            </Box>
        </div>
    );
};

export default CustomerBookingDatatable;