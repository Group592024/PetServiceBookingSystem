import "./admin_booking_datatable.css";
import React, { useEffect, useState, useMemo } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { Chip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import { min } from "date-fns";

const AdminBookingDatatable = ({ filterOptions }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const getToken = () => sessionStorage.getItem("token");

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
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!bookingsResponse.data.flag) {
                setError(bookingsResponse.data.message || "No bookings found");
                toast.error(bookingsResponse.data.message || "No bookings found");
                return;
            }
            const bookingServiceResponse = await axios.get(
                "http://localhost:5050/api/BookingServiceItems/GetBookingServiceList",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!bookingServiceResponse.data.flag) {
                setError(
                    bookingServiceResponse.data.message || "No booking service items found"
                );
                toast.error(
                    bookingServiceResponse.data.message || "No booking service items found"
                );
                return;
            }
            const serviceVariantResponse = await axios.get(
                "http://localhost:5050/api/ServiceVariant/all",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!serviceVariantResponse.data.flag) {
                setError(
                    serviceVariantResponse.data.message || "No service variants found"
                );
                toast.error(
                    serviceVariantResponse.data.message || "No service variants found"
                );
                return;
            }

            const servicesResponse = await axios.get("http://localhost:5050/api/Service", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!servicesResponse.data.flag) {
                setError(servicesResponse.data.message || "No services found");
                toast.error(servicesResponse.data.message || "No services found");
                return;
            }
            const bookingsData = bookingsResponse.data.data;
            const bookingServiceData = bookingServiceResponse.data.data;
            const serviceVariantData = serviceVariantResponse.data.data;

            const servicesData = servicesResponse.data.data;
            console.log("Service Data:", servicesData);
            const updatedBookings = await Promise.all(
                bookingsData.map(async (booking) => {
                    try {
                        const accountResponse = await axios.get(
                            `http://localhost:5050/api/Account?AccountId=${booking.accountId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        const customerName = accountResponse.data?.accountName || "Unknown";

                        const statusResponse = await axios.get(
                            `http://localhost:5050/api/BookingStatus/${booking.bookingStatusId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        const bookingStatusName =
                            statusResponse.data?.data?.bookingStatusName || "Unknown";

                        const typeResponse = await axios.get(
                            `http://localhost:5050/api/BookingType/${booking.bookingTypeId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        const bookingTypeName =
                            typeResponse.data?.data?.bookingTypeName || "Unknown";

                        const bookingItems = bookingServiceData.filter(
                            (item) => item.bookingId === booking.bookingId
                        );

                        const serviceNames = bookingItems.map((bItem) => {
                            const variant = serviceVariantData.find(
                                (v) => v.serviceVariantId === bItem.serviceVariantId
                            );
                            if (!variant) return "Unknown variant";

                            const service = servicesData.find(
                                (s) => s.serviceId === variant.serviceId
                            );
                            if (!service) return "Unknown service";

                            return service.name || service.serviceName || "Unknown";
                        });
                        console.log(serviceNames);
                        const joinedServiceNames = serviceNames.join(", ") || "Unknown";


                        // Debug: Log all serviceTypeIds to check what's available
                        console.log("Available serviceTypeIds:", servicesData.map(s => s.serviceTypeId));

                        const healthBookingItems = bookingItems.filter((bItem) => {
                            const variant = serviceVariantData.find(
                                (v) => v.serviceVariantId === bItem.serviceVariantId
                            );
                            if (!variant) return false;

                            const service = servicesData.find(
                                (s) => s.serviceId === variant.serviceId
                            );
                            if (!service) return false;

                            // Debug: Log each service and its type ID for inspection
                            console.log(`Service: ${service.serviceName}, TypeID: ${service.serviceTypeId}`);

                            // Check if the service has the specific serviceTypeId
                            // Using lowercase for case-insensitive comparison
                            return service.serviceTypeId.toLowerCase() === "2e9e9b22-81f8-4cda-900c-5e47d0849b67".toLowerCase();
                        });

                        console.log("Health booking items:", healthBookingItems);
                        const petIds = healthBookingItems.map((bItem) => bItem.petId);
                        console.log("Pet IDs from health bookings:", petIds);
                        const uniquePetIds = Array.from(new Set(petIds));
                        console.log("Unique pet IDs:", uniquePetIds);

                        const isMedicalBooking = bookingItems.some(bookingItem => {
                            // Find the service variant for this booking item
                            const variant = serviceVariantData.find(
                                v => v.serviceVariantId === bookingItem.serviceVariantId
                            );
                            if (!variant) return false;

                            // Find the service for this variant
                            const service = servicesData.find(
                                s => s.serviceId === variant.serviceId
                            );
                            if (!service) return false;

                            // Check if the service has the specific serviceTypeId
                            // Note: Using lowercase for case-insensitive comparison
                            return service.serviceTypeId.toLowerCase() === "2e9e9b22-81f8-4cda-900c-5e47d0849b67".toLowerCase();
                        });

                        // For debugging
                        console.log(`Booking ${booking.bookingCode} isMedicalBooking: ${isMedicalBooking}`);
                        return {
                            ...booking,
                            customerName,
                            bookingStatusName,
                            bookingTypeName,
                            serviceName: joinedServiceNames,
                            petIds: uniquePetIds.join(","),
                            isMedicalBooking
                        };
                    } catch (error) {
                        console.error("Error fetching additional details:", error);
                        return null;
                    }
                })
            );

            const filteredBookings = updatedBookings.filter((booking) => booking !== null);
            setBookings(filteredBookings);


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
            width: 50,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                const index = bookings.findIndex(
                    (row) => row.bookingId === params.row.bookingId
                );
                return index + 1;
            },
        },
        {
            field: "bookingCode",
            headerName: "Booking Code",
            flex: 2,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "customerName",
            headerName: "Customer Name",
            flex: 2,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "totalAmount",
            headerName: "Total Amount",
            minWidth: 100,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "bookingTypeName",
            headerName: "Booking Type",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "bookingDate",
            headerName: "Booking Date",
            flex: 2,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "createAt",
            headerName: "Created At",
            flex: 2,
            headerAlign: "center",
            align: "center",
            cellClassName: "cell-font"
        },
        {
            field: "bookingStatusName",
            headerName: "Status",
            flex: 1.5,
            minWidth: 130,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                const getStatusColor = (status) => {
                    switch (status) {
                        case 'Pending': return 'warning';
                        case 'Processing': return 'info';
                        case 'Cancelled': return 'error';
                        case 'Confirmed': return 'success';
                        case 'Checked in': return 'secondary';
                        case 'Checked out': return 'primary';
                        case 'Completed': return 'success';
                        case 'Refunded': return 'warning';
                        case 'Rejected': return 'error';
                        default: return 'default';
                    }
                };

                const status = params.value || 'Unknown';
                const color = getStatusColor(status);

                return (
                    <Chip
                        label={status}
                        color={color}
                        size="small"
                        variant="outlined"
                        sx={{
                            minWidth: '100px',
                            maxWidth: '100%',
                            fontWeight: 'medium'
                        }}
                    />
                );
            }
        },
        {
            field: "isPaid",
            headerName: "Paid",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                return params.value === true ? (
                    <Chip label="Paid" color="primary" />
                ) : (
                    <Chip label="No" color="error" />
                );
            },
        },
        {
            field: "action",
            headerName: "Action",
            flex: 1,
            headerAlign: "center",
            renderCell: (params) => {
                const detailPage =
                    params.row.bookingTypeName === "Hotel"
                        ? "RoomBookingDetailPage"
                        : "ServiceBookingDetailPage";
                return (
                    <div className="cellAction flex items-center w-full h-full justify-start gap-2 ">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <IconButton
                                aria-label="info"
                                onClick={() => navigate(`/bookings/detail/${detailPage}/${params.row.bookingId}`)}
                            >
                                <InfoIcon color="info" />
                            </IconButton>
                        </div>
                        {params.row.isMedicalBooking && params.row.petIds && (
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Link
                                    to={`/add?bookingCode=${params.row.bookingCode}&petIds=${params.row.petIds}`}
                                    className="addBtn"
                                    style={{ textDecoration: "none" }}
                                >
                                    <svg
                                        className="w-5 h-5 text-green-500 hover:bg-green-500 hover:text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            fill="none"
                                        />
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
                        )}
                    </div>
                );
            },
        },
    ];

    // Apply filters to the bookings data
    const filteredBookingsRows = useMemo(() => {
        let filtered = [...bookings];

        // Apply date filter if provided (today's bookings)
        if (filterOptions?.date) {
            const today = filterOptions.date;
            filtered = filtered.filter(booking => {
                const bookingDate = new Date(booking.bookingDate);
                return bookingDate.setHours(0, 0, 0, 0) === today.getTime();
            });
        }

        // Apply status filter if provided
        if (filterOptions?.status) {
            filtered = filtered.filter(booking =>
                booking.bookingStatusName === filterOptions.status
            );
        }


        return filtered.map((booking) => ({
            ...booking,
            totalAmount: new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(booking.totalAmount),
            bookingDate: new Date(booking.bookingDate).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            createAt: new Date(booking.createAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
        }));
    }, [bookings, filterOptions]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-svh">
                <div role="status">
                    <svg
                        aria-hidden="true"
                        className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
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
                    <span className="sr-only">Loading Booking...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="datatable">


            <Box
                sx={{
                    height: '100%',
                    width: "100%",
                    overflow: 'auto',
                    "& .MuiDataGrid-root": { backgroundColor: "#f9f9f9" },
                    "& .MuiDataGrid-row": { backgroundColor: "#f4f4f4" },
                    "& .MuiDataGrid-row.Mui-selected": { backgroundColor: "#c8f6e9 !important" },
                    "& .MuiDataGrid-footerContainer": { backgroundColor: "#9f9f9f" },
                    "& .MuiPaginationItem-root": { backgroundColor: "#b3f2ed", color: "#3f3f3f" },
                    "& .MuiPaginationItem-root:hover": { backgroundColor: "#ede4e2" },
                }}
            >
                <DataGrid
                    rows={filteredBookingsRows}
                    columns={columns}
                    getRowId={(row) => row.bookingId}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 5 } },
                        sorting: {
                            sortModel: [{
                                field: 'createAt',
                                sort: 'desc'
                            }]
                        }
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                />
            </Box>
        </div>
    );
};

export default AdminBookingDatatable;