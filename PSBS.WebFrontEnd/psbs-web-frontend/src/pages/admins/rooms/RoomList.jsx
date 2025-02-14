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
            const response = await fetch('http://localhost:5023/api/RoomType');
            const roomTypesData = await response.json();
    
            if (roomTypesData && Array.isArray(roomTypesData.data)) {
                setRoomTypes(roomTypesData.data);
            } else {
                console.error('Unexpected response format for roomTypes:', roomTypesData);
            }
        } catch (error) {
            console.error('Error fetching room types:', error);
        }
    };    

    const fetchDataFunction = async () => {
        try {
            const response = await fetch('http://localhost:5023/api/Room');
            const roomData = await response.json();
            if (roomData.data && Array.isArray(roomData.data)) {
                //Sort Deleted
                // const result = roomData.data
                // .map((item) => ({
                //     id: item.roomId,
                //     ...item,
                // }))
                // .sort((a, b) => a.isDeleted - b.isDeleted); 
                // setData(result);
                const result = roomData.data.map((item) => ({
                    id: item.roomId,
                    ...item,
                }));
                setData(result);
            } else {
                console.error('Unexpected response format:', roomData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
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
        console.log('Room Types state:', roomTypes);
    }, [roomTypes]);

    useEffect(() => {
        console.log('Room Data state:', data);
    }, [data]);

    useEffect(() => {
        if (data.length === 0) {
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
                        const deleteResponse = await fetch(
                            `http://localhost:5023/api/Room/${id}`,
                            {
                                method: 'DELETE',
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
            renderCell: (params) => {
                const roomType = roomTypes.find(type => type.roomTypeId === params.row.roomTypeId);
                return roomType ? `${roomType.price} VND` : 'N/A';
            }
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
                <main>
                    <div className='header'>
                        <div className='left'>
                            <h1>Room List</h1>
                        </div>
                        <button
                            className='report'
                            onClick={() => navigate('/room/add')}
                        >
                            <i className='bx bxs-plus-circle'></i>
                            <span>NEW</span>
                        </button>
                    </div>
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
                        {loading ? (
                            <div style={{ textAlign: 'center' }}>
                                <CircularProgress />
                            </div>
                        ) : (
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
                        )}
                    </Box>
                </main>
            </div>
        </div>
    );
};

export default RoomList;
