import React, { useState, useEffect } from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const CustomerPetList = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchPets = async () => {
        try {
            const accountId = sessionStorage.getItem('accountId');
            const response = await fetch(`http://localhost:5010/api/pet/available/${accountId}`);
            const data = await response.json();
            if (data.flag) {
                setPets(data.data.filter(pet => !pet.isDelete));
            } else {
                setError(data.message || "Failed to fetch pets.");
            }
        } catch (err) {
            setError("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleDelete = (petId) => {
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
                        const deleteResponse = await fetch(
                            `http://localhost:5010/api/pet/${petId}`,
                            {
                                method: 'DELETE',
                            }
                        );
                
                        if (!deleteResponse.ok) {
                            const errorData = await deleteResponse.json(); 
                            Swal.fire(
                                'Error!',
                                errorData.message || 'Failed to delete the pet.',
                                'error'
                            );
                            return;
                        }
                        else {
                            Swal.fire(
                                'Deleted!',
                                'The pet has been deleted.',
                                'success'
                            );
                            setPets((prevPets) => prevPets.filter(pet => pet.petId !== petId));
                        }
                
                        setPets((prevPets) => prevPets.filter(pet => pet.petId !== petId));
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error!', 'Failed to delete the pet.', 'error');
                    }
                };
    
                fetchDelete();
            }
        });
    };  

    if (loading) {
        return (
            <div className="flex items-center justify-center h-svh">
                <div role="status">
                    <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <NavbarCustomer />
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-5xl font-bold mt-3 mb-3 ml-5 text-gray-800">Your Pet List</h1>
                    <button
                        onClick={() => navigate('add')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 mr-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add New Pet
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pets.map((pet) => (
                        <div
                            key={pet.petId}
                            className="bg-gray-300 border border-gray-300 rounded-xl shadow-sm p-6 hover:shadow-xl transition-shadow"
                        >
                            <img
                                src={`http://localhost:5010${pet.petImage}`}
                                alt={pet.petName}
                                className="w-full h-64 object-cover rounded-lg mb-6"
                            />
                            <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
                                {pet.petName}
                            </h2>
                            <p className="text-gray-700 text-center mb-6">
                                {new Date(pet.dateOfBirth).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </p>
                            <div className="flex justify-center space-x-6 mt-4">
                                <button onClick={() => navigate(`${pet.petId}`)}
                                    className="p-3 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                                <button onClick={() => navigate(`edit/${pet.petId}`)}
                                    className="p-3 text-green-600 hover:bg-green-100 rounded-full transition-colors duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button onClick={() => handleDelete(pet.petId)}
                                    className="p-3 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

};

export default CustomerPetList;
