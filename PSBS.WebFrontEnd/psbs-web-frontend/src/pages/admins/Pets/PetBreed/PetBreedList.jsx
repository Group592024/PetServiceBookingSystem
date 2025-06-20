import React, { useEffect, useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import { Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import InfoIcon from '@mui/icons-material/Info';

const PetBreedList = () => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [petTypes, setPetTypes] = useState([]);

    const fetchPetTypes = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch("http://localhost:5050/api/PetType", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (Array.isArray(data.data)) {
                setPetTypes(data.data);
            } else {
                console.error("Unexpected response format for petTypes:", data.data);
            }
        } catch (error) {
            console.error("Error fetching pet types:", error);
        }
    };

    const fetchDataFunction = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch("http://localhost:5050/api/PetBreed", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                const result = data.data.map((item) => ({
                    id: item.petBreedId,
                    ...item,
                }));
                console.log("Processed result: ", result);
                setData(result);
            } else {
                console.error("Unexpected response format: ", data);
            }
        } catch (error) {
            Swal.fire('Service Unavailable', 'Our service is down. Please contact admin for more information.', 'error');
            console.error("Error fetching data: ", error);
        }
    };

    useEffect(() => {
        fetchPetTypes();
        fetchDataFunction();
    }, []);

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this item? This action may affect related data in the system.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        }).then((result) => {
            if (result.isConfirmed) {
                const fetchDelete = async () => {
                    try {
                        const token = sessionStorage.getItem("token");
                        const deleteResponse = await fetch(`http://localhost:5050/api/PetBreed/${id}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        });

                        if (deleteResponse.ok) {
                            Swal.fire("Deleted!", "The pet breed has been deleted.", "success");
                            fetchDataFunction();
                            setData((prevData) => {
                                if (prevData.length === 1) {
                                    return [];
                                }
                                return prevData.filter((item) => item.id !== id); // Còn lại 1 cái để xóa
                            });
                        } else {
                            const errorData = await deleteResponse.json();
                            Swal.fire("Error!", errorData.message || "Failed to delete the pet breed.", "error");
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire("Error!", "Failed to delete the pet breed.", "error");
                    }
                };

                fetchDelete();
            }
        });
    };

    console.log("petTypes:", petTypes);
    const columns = [
        {
            field: 'index',
            headerName: 'No.',
            flex: 0.5,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>No.</div>
            ),
            renderCell: (params) => {
                const index = data.findIndex(row => row.id === params.row.id);
                return <div>{index + 1}</div>;
            }
        },
        {
            field: 'petBreedName',
            headerName: 'Breed Name',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Breed Name</div>
            ),
        },
        {
            field: 'petTypeId',
            headerName: 'Type',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Type</div>
            ),
            renderCell: (params) => {
                const petType = petTypes.find(type => type.petType_ID === params.value);
                return petType ? petType.petType_Name : 'Unknown';
            }
        },
        {
            field: 'petBreedDescription',
            headerName: 'Description',
            flex: 1.5,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Description</div>
            ),
        },
        {
            field: 'isDelete',
            headerName: 'Status',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Status</div>
            ),
            renderCell: (params) => (
                <div style={{ textAlign: "center", fontWeight: 'bold', color: params.row.isDelete ? "red" : "green" }}>
                    {params.row.isDelete ? 'Inactive' : 'Active'}
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
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</div>
            ),
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <IconButton
                        color='primary'
                        onClick={() => navigate(`/petBreed/${params.row.id}`)}
                    >
                        <InfoIcon />
                    </IconButton>
                    <IconButton
                        color='success'
                        onClick={() => navigate(`/petBreed/edit/${params.row.id}`)}
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
                            <h1 className="text-2xl font-bold text-gray-800">Pet Breed List</h1>
                            <button
                                className="flex items-center gap-2 px-5 py-2 text-white font-semibold bg-gradient-to-r from-blue-500 to-green-400 rounded-lg shadow-md hover:from-blue-600 hover:to-green-500 transition duration-300"
                                onClick={() => navigate('/petBreed/add')}
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
                            />
                        </Box>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PetBreedList;
