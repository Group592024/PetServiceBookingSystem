import "./admin_booking_datatable.css";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { Chip } from "@mui/material";

const AdminBookingDatatable = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getToken = () => {
        return sessionStorage.getItem('token');
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = getToken();
            if (!token) {
                setError("Authentication token missing.");
                toast.error("Authentication token missing.");
                return;
            }

            const bookingsResponse = await axios.get("http://localhost:5050/Bookings", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!bookingsResponse.data.flag) {
                setError(bookingsResponse.data.message || "No bookings found");
                toast.error(bookingsResponse.data.message || "No bookings found");
                return;
            }

            const bookingsData = bookingsResponse.data.data;

            const updatedBookings = await Promise.all(
                bookingsData.map(async (booking) => {
                    try {
                        const accountResponse = await axios.get(`http://localhost:5050/api/Account?AccountId=${booking.accountId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        const customerName = accountResponse.data?.accountName || "Unknown";

                        const statusResponse = await axios.get(`http://localhost:5050/api/BookingStatus/${booking.bookingStatusId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        const bookingStatusName = statusResponse.data?.data?.bookingStatusName || "Unknown";

                        const typeResponse = await axios.get(`http://localhost:5050/api/BookingType/${booking.bookingTypeId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
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
                        return null; // Return null for failed bookings
                    }
                })
            );
            const filteredBookings = updatedBookings.filter(booking => booking !== null); // Filter out failed bookings.
            console.log("Update" + filteredBookings);
            setBookings(filteredBookings);
            console.log(filteredBookings);

        } catch (err) {
            setError("Error fetching data: " + err.message);
            console.error("Main fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const columns = [
        {
            field: "id",
            headerName: "No.",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                const index = bookings.findIndex(booking => booking.bookingId === params.row.bookingId);
                return index + 1;
            }
        },
        { field: "bookingCode", headerName: "Booking Code", flex: 2, headerAlign: "center", align: "center" },
        { field: "customerName", headerName: "Customer Name", flex: 2, headerAlign: "center", align: "center" },
        { field: "totalAmount", headerName: "Total Amount", flex: 1, headerAlign: "center", align: "center" },
        { field: "bookingTypeName", headerName: "Booking Type", flex: 1, headerAlign: "center", align: "center" },
        { field: "bookingStatusName", headerName: "Status", flex: 1, headerAlign: "center", align: "center" },
        {
            field: "isPaid",
            headerName: "Paid",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                if (params.value === true) {
                    return <Chip label="Paid" color="primary" />;
                } else {
                    return <Chip label="No" color="error" />;
                }
            },
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
                        <Link to={`/admin/bookings/detail/${detailPage}/${params.row.bookingId}`} className="detailBtn" style={{ textDecoration: "none" }}>
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </Link>
                        <Link to={`/add?bookingCode=${params.row.bookingCode}`} className="addBtn">
                            <svg
                                className="w-5 h-5 text-green-500 hover:bg-green-500 hover:text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path
                                    d="M12 8v8m-4-4h8"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                />
                            </svg>
                        </Link>
                    </div>
                );
            },
        },
    ];


    const bookingsRows = bookings.map((booking) => ({
        ...booking,
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
                        backgroundColor: "#f9f9f9",
                    },
                    "& .MuiDataGrid-row": {
                        backgroundColor: "#f4f4f4",
                    },
                    "& .MuiDataGrid-row.Mui-selected": {
                        backgroundColor: "#c8f6e9 !important",
                    },
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: "#9f9f9f",
                    },
                    "& .MuiPaginationItem-root": {
                        backgroundColor: "#b3f2ed",
                        color: "#3f3f3f",
                    },
                    "& .MuiPaginationItem-root:hover": {
                        backgroundColor: "#ede4e2",
                    },
                }}
            >
                <DataGrid
                    rows={bookingsRows}
                    columns={columns}
                    getRowId={(row) => row.bookingId} // Use bookingId as the row ID
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

export default AdminBookingDatatable;