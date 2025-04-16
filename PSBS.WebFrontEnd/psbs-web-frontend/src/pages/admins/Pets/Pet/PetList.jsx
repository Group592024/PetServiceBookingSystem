import React, { useEffect, useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import { Box, CircularProgress, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Delete, Edit, Info } from '@mui/icons-material';
import Swal from 'sweetalert2';


const AdminPetList = () => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const [petResponse, accountResponse, breedResponse] = await Promise.all([
                fetch('http://localhost:5050/api/Pet', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('http://localhost:5050/api/Account/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('http://localhost:5050/api/PetBreed', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            ]);

            const petData = await petResponse.json();
            const accountData = await accountResponse.json();
            const breedData = await breedResponse.json();

            if (petData.data && Array.isArray(petData.data)) {
                const accountMap = accountData.data.reduce((map, acc) => {
                    map[acc.accountId] = acc.accountName;
                    return map;
                }, {});

                const breedMap = breedData.data.reduce((map, breed) => {
                    map[breed.petBreedId] = breed.petBreedName;
                    return map;
                }, {});

                const result = petData.data.map((item, index) => {
                    console.log('Gender:', item.petGender);
                    return {
                        id: item.petId,
                        no: index + 1,
                        petName: item.petName,
                        imageUrl: `http://localhost:5050/pet-service${item.petImage}`,
                        owner: accountMap[item.accountId] || 'Unknown',
                        breed: breedMap[item.petBreedId] || 'Unknown',
                        dateOfBirth: new Intl.DateTimeFormat('vi-VN').format(new Date(item.dateOfBirth)),
                        gender: item.petGender ? 'Male' : 'Female',
                        status: item.isDelete ? 'Stopping' : 'Active',
                    };
                });

                setData(result);
            } else {
                console.error('Unexpected response format:', petData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, []);

    const handleEdit = (id) => {
        navigate(`/pet/edit/${id}`);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this pet? This action may affect related data in the system.',
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
                        const deleteResponse = await fetch(`http://localhost:5050/api/pet/${id}`, {
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
                                'Pet has been deleted.',
                                'success'
                            );
                            fetchData();
                            setData((prevData) => {
                                if (prevData.length === 1) {
                                    return [];
                                }
                                //Còn lại 1 cái để xóa
                            });

                        } else {
                            Swal.fire(
                                'Error!',
                                data.message || 'Failed to delete the Pet.',
                                'error'
                            );
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error!', 'Failed to delete the Pet.', 'error');
                    }
                };

                fetchDelete();
            }
        });
    };

    const handleDetail = (id) => {
        navigate(`/pet/${id}`);
    };

    const columns = [
        {
            field: 'no', headerName: 'No.', flex: 0.3, headerAlign: 'center', align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    No.
                </div>
            ),
        },
        {
            field: 'petName',
            headerName: 'Pet Name',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Pet Name
                </div>
            ),
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '1rem' }}>
                    <img
                        src={params.row.imageUrl}
                        alt={params.row.petName}
                        style={{ width: 40, height: 40, borderRadius: '50%' }}
                    />
                    <span>{params.row.petName}</span>
                </div>
            ),
        },
        {
            field: 'owner', headerName: 'Owner', flex: 1, headerAlign: 'center', align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Owner
                </div>
            ),
        },
        {
            field: 'breed', headerName: 'Breed', flex: 1, headerAlign: 'center', align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Breed
                </div>
            ),
        },
        {
            field: 'dateOfBirth', headerName: 'Date of Birth', flex: 1, headerAlign: 'center', align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Date of Birth
                </div>
            ),
        },
        {
            field: 'gender', headerName: 'Gender', flex: 0.5, headerAlign: 'center', align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Gender
                </div>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 0.7,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Status
                </div>
            ),
            renderCell: (params) => (
                <div style={{ fontWeight: 'bold', color: params.value === 'Active' ? 'green' : 'red' }}>
                    {params.value}
                </div>
            ),
        },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Actions
                </div>
            ),
            renderCell: (params) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <IconButton color="primary" onClick={() => handleDetail(params.row.id)}>
                        <Info />
                    </IconButton>
                    <IconButton style={{ color: 'green' }} onClick={() => handleEdit(params.row.id)}>
                        <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
                        <Delete />
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
                            <h1 className="text-2xl font-bold text-gray-800">Pet List</h1>
                            <button
                                className="flex items-center gap-2 px-5 py-2 text-white font-semibold bg-gradient-to-r from-blue-500 to-green-400 rounded-lg shadow-md hover:from-blue-600 hover:to-green-500 transition duration-300"
                                onClick={() => navigate('/pet/add')}
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
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
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
                                />
                            )}
                        </Box>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminPetList;
