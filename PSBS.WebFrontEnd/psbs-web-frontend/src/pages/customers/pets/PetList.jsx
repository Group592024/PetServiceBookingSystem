import React, { useState, useEffect } from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const CustomerPetList = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [filteredPets, setFilteredPets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPets = async () => {
        try {
            const accountId = sessionStorage.getItem("accountId");
            const token = sessionStorage.getItem("token");

            const response = await fetch(`http://localhost:5050/api/pet/available/${accountId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

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

    useEffect(() => {
        setFilteredPets(
            pets.filter(pet => pet.petName && pet.petName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, pets]);

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
                            `http://localhost:5050/api/pet/${petId}`,
                            {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                                }
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
            <div className="flex flex-col items-center justify-center h-svh text-center">
                <svg aria-hidden="true" className="w-12 h-12 text-blue-500 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#8B5CF6" />
                </svg>
                <p className="mt-4 text-gray-700 text-lg">Loading your pets, please wait...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
            <NavbarCustomer />
            <div className="container mx-auto px-6 py-8">
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                            Your Pet Collection
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Manage and view all your beloved pets in one place
                        </p>
                    </div>
                    {/* Search Input */}
                    <div className="relative w-full max-w-xs sm:max-w-md">
                        <input
                            type="text"
                            placeholder="Search pets by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md transition-all"
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    {/* Add New Pet Button */}
                    <button
                        onClick={() => navigate('add')}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                                 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 
                                 flex items-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add New Pet
                    </button>
                </div>
                {/* Pet Grid */}
                {filteredPets.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg font-semibold">
                        No pets found. Try searching with a different keyword.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPets.map((pet) => (
                            <div key={pet.petId} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="relative h-72 overflow-hidden">
                                    <img
                                        src={`http://localhost:5050/pet-service${pet.petImage}`}
                                        alt={pet.petName}
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <h2 className="absolute bottom-4 left-6 text-2xl font-bold text-white">{pet.petName}</h2>
                                </div>

                                {/* Pet Info */}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-gray-600 mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>
                                            Born: {new Date(pet.dateOfBirth).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-between items-center border-t pt-4">
                                        <button
                                            onClick={() => navigate(`${pet.petId}`)}
                                            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View
                                        </button>

                                        <button
                                            onClick={() => navigate(`edit/${pet.petId}`)}
                                            className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(pet.petId)}
                                            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Empty State */}
                {pets.length === 0 && (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-2xl p-6 max-w-md mx-auto shadow-sm">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pets Added Yet</h3>
                            <p className="text-gray-600 mb-6">Start building your pet collection by adding your first pet</p>
                            <button
                                onClick={() => navigate('add')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Add Your First Pet
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default CustomerPetList;