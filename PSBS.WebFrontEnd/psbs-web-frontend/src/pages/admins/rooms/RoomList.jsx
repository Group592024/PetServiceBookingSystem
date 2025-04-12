import React, { useEffect, useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import { Box, CircularProgress, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import InfoIcon from '@mui/icons-material/Info';

const RoomList = () => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRoomTypes = async () => {
        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch("http://localhost:5050/api/RoomType", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const roomTypesData = await response.json();

            if (roomTypesData && Array.isArray(roomTypesData.data)) {
                setRoomTypes(roomTypesData.data);
            } else {
                console.error("Unexpected response format for roomTypes:", roomTypesData);
            }
        } catch (error) {
            console.error("Error fetching room types:", error);
        }
    };

    const fetchDataFunction = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch('http://localhost:5050/api/Room', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const roomData = await response.json();

            console.log("API Response:", roomData);

            if (roomData && roomData.data && Array.isArray(roomData.data)) {
                const result = roomData.data.map((item) => ({
                    id: item.roomId,
                    ...item,
                }));
                setData(result);
            } else {
                console.error("Unexpected response format:", roomData);
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchRoomTypes();
            fetchDataFunction();
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (Array.isArray(roomTypes)) {
            console.log('Room Types state:', roomTypes);
        }
    }, [roomTypes]);

    useEffect(() => {
        console.log('Room Data state:', data);
    }, [data]);

    useEffect(() => {
        if (Array.isArray(data) && data.length === 0) {
            console.log("No rooms available!");
        }
    }, [data]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this item? This action may affect related data in the system.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        }).then((result) => {
            if (result.isConfirmed) {
                const fetchDelete = async () => {
                    try {
                        const token = sessionStorage.getItem("token");
                        const deleteResponse = await fetch(
                            `http://localhost:5050/api/Room/${id}`,
                            {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        );

                        const data = await deleteResponse.json();

                        if (deleteResponse.ok) {
                            Swal.fire(
                                'Deleted!',
                                data.message || 'The room has been deleted.',
                                'success'
                            );
                            fetchDataFunction();
                            setData((prevData) => {
                                if (prevData.length === 1) {
                                    return [];
                                }
                                //Còn lại 1 cái để xóa
                            });
                        } else {
                            Swal.fire(
                                'Error!',
                                data.message || 'Failed to delete the room.',
                                'error'
                            );
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error!', 'Failed to delete the room.', 'error');
                    }
                };

                fetchDelete();
            }
        });
    };

    const getRoomTypePrice = (roomTypeId) => {
        const roomType = roomTypes.find(type => type.roomTypeId === roomTypeId);
        if (roomType) {
            const roomTypePrice = roomType.price;
            return (
                <div>
                    <p>
                        {new Intl.NumberFormat('vi-VN', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 3
                        }).format(roomTypePrice)}
                    </p>
                </div>
            );
        }
        return <div>N/A</div>;
    };

    const columns = [
        {
            field: 'index',
            headerName: 'No.',
            flex: 0.5,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    No.
                </div>
            ),
            renderCell: (params) => {
                const index = data.findIndex(row => row.id === params.row.id);
                return <div>{index + 1}</div>;
            }
        },
        {
            field: 'roomName',
            headerName: 'Name',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Name
                </div>
            ),
        },
        {
            field: 'roomTypeId',
            headerName: 'Type',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Type
                </div>
            ),
            renderCell: (params) => {
                const roomType = roomTypes.find(type => type.roomTypeId === params.value);
                return roomType ? roomType.name : 'Unknown';
            }
        },
        {
            field: 'price',
            headerName: 'Price',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Price
                </div>
            ),
            renderCell: (params) => getRoomTypePrice(params.row.roomTypeId)
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Status
                </div>
            ),
            renderCell: (params) => {
                let color;
                switch (params.row.status) {
                    case 'In Use':
                        color = '#FFA500';
                        break;
                    case 'Free':
                        color = 'green';
                        break;
                    case 'Maintenance':
                        color = 'red';
                        break;
                    default:
                        color = 'gray';
                }
                return (
                    <div style={{ fontWeight: 'bold', color: color }}>
                        {params.row.status}
                    </div>
                );
            },
        },
        {
            field: 'isDeleted',
            headerName: 'Available',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Available
                </div>
            ),
            renderCell: (params) => (
                <div style={{ fontWeight: 'bold', color: params.row.isDeleted ? 'red' : 'green' }}>
                    {params.row.isDeleted ? 'Inactive' : 'Active'}
                </div>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Actions
                </div>
            ),
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <IconButton
                        color='primary'
                        onClick={() => navigate(`/room/${params.row.id}`)}
                    >
                        <InfoIcon />
                    </IconButton>
                    <IconButton
                        color='success'
                        onClick={() => navigate(`/room/edit/${params.row.id}`)}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color='error'
                        onClick={() => handleDelete(params.row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Sidebar ref={sidebarRef} />
            <div className='content'>
                <Navbar sidebarRef={sidebarRef} />
                <div className="p-8">
                    <main className="bg-white shadow-lg rounded-lg p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <h1 className="text-2xl font-bold text-gray-800">Room List</h1>
                            <button
                                className="flex items-center gap-2 px-5 py-2 text-white font-semibold bg-gradient-to-r from-blue-500 to-green-400 rounded-lg shadow-md hover:from-blue-600 hover:to-green-500 transition duration-300"
                                onClick={() => navigate('/room/add')}
                            >
                                <i className="bx bxs-plus-circle text-lg"></i>
                                <span>NEW</span>
                            </button>
                        </div>

                        {/* Data Grid */}
                        <Box
                            sx={{
                                height: 400,
                                width: "100%",
                                "& .MuiDataGrid-root": {
                                    backgroundColor: "#ffffff",
                                },
                                "& .MuiDataGrid-row": {
                                    backgroundColor: "#f8f9fa",
                                },
                                "& .MuiDataGrid-footerContainer": {
                                    backgroundColor: "#e2e8f0",
                                },
                                "& .MuiPaginationItem-root": {
                                    backgroundColor: "#93c5fd",
                                    color: "#1e3a8a",
                                },
                            }}
                        >
                            <DataGrid
                                columns={columns}
                                rows={data}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 5 },
                                    },
                                }}
                                pageSizeOptions={[5, 10, 20]}
                                getRowClassName={(params) => {
                                    return params.row.isDeleted ? 'opacity-50 bg-gray-200' : '';
                                }}
                            />
                        </Box>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default RoomList;
