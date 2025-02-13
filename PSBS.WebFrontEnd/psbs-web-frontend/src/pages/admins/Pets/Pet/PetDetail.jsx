import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Swal from 'sweetalert2';

const AdminPetDetail = () => {
    const [pet, setPet] = useState(null);
    const sidebarRef = useRef(null);
    const [accountName, setAccountName] = useState("Unknown");
    const [petBreed, setPetBreed] = useState("Unknown");
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const petResponse = await fetch(`http://localhost:5010/api/Pet/${id}`);
                const petData = await petResponse.json();
                console.log(petData);

                const [accountResponse, breedResponse] = await Promise.all([
                    fetch('http://localhost:5000/api/Account/all'),
                    fetch('http://localhost:5010/api/PetBreed'),
                ]);

                const accountData = await accountResponse.json();
                const breedData = await breedResponse.json();

                if (petData.data) {
                    const account = accountData.data.find(acc => acc.accountId === petData.data.accountId);
                    setAccountName(account ? account.accountName : "Unknown");
                    const breed = breedData.data.find(breed => breed.petBreedId === petData.data.petBreedId);
                    setPetBreed(breed ? breed.petBreedName : "Unknown");
                    setPet(petData.data);
                } else {
                    Swal.fire('Error', 'Pet not found', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to fetch data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!pet) {
        return <div>Pet not found</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDelete = async (petId) => {
        const confirmDelete = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        });
    
        if (confirmDelete.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:5010/api/Pet/${petId}`, {
                    method: 'DELETE',
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    Swal.fire('Deleted!', 'The pet has been deleted.', 'success');
                    navigate('/pet');
                } else {
                    Swal.fire('Error', data.message || 'Failed to delete the pet', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'An unexpected error occurred while deleting the pet', 'error');
            }
        }
    };
    
    return (
        <div className="bg-gray-200 min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />
                <main className="flex-1 overflow-auto p-6">
                    <div className="flex items-center mb-6 mx-auto w-full">
                        <button onClick={() => navigate(-1)} className="text-black font-bold text-4xl">⬅️</button>
                        <div className="text-center w-full">
                            <button className="text-black font-bold text-4xl px-4 py-2 pointer-events-none">
                                Pet Detail
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Left Side */}
                            <div className="flex-1">
                                <div className="mb-3 flex justify-center">
                                    <img
                                        src={`http://localhost:5010${pet.petImage || '/Images/default-image.png'}`}
                                        alt="Pet"
                                        className="w-[300px] h-[300px] object-cover rounded-lg shadow-lg"
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-7">
                                    <label className="font-bold text-lg text-gray-500 min-w-[120px]">Name:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={pet.petName || 'Unknown'}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-5">
                                    <label className="font-bold text-lg text-gray-500 min-w-[120px]">Gender:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={pet.petGender ? 'Male' : 'Female'}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-5">
                                    <label className="font-bold text-lg text-gray-500 min-w-[120px]">Date of Birth:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={formatDate(pet.dateOfBirth)}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-5">
                                    <label className="font-bold text-lg text-gray-500 min-w-[120px]">Owner:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={accountName}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-5">
                                    <label className="font-bold text-lg text-gray-500 min-w-[120px]">Status:</label>
                                    <input
                                        type="text"
                                        className={`flex-1 p-2 font-semibold border rounded-lg bg-gray-200 ${pet.isDelete ? 'text-red-500' : 'text-green-500'}`}
                                        value={pet.isDelete ? 'Stopping' : 'Active'}
                                        readOnly
                                    />
                                </div>

                            </div>

                            {/* Right Side */}
                            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                                <div className="mb-3 flex items-center gap-4 mt-2">
                                    <label className="font-bold text-lg text-gray-500 min-w-[120px]">Pet Breed:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={petBreed}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-2">
                                    <label className="font-bold text-lg text-gray-500 min-w-[120px]">Weight:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={pet.petWeight || 'Unknown'}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-2">
                                    <label className="font-bold text-lg text-gray-500 min-w-[120px]">Fur Type:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={pet.petFurType || 'Unknown'}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-2">
                                    <label className="font-bold text-lg text-gray-500 min-w-[120px]">Fur Color:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={pet.petFurColor || 'Unknown'}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 space-y-2">
                                    <label className="font-bold text-lg text-gray-500">Note:</label>
                                    <textarea
                                        className="w-full p-3 border rounded-lg bg-gray-200 h-40 resize-none"
                                        value={pet.petNote || 'No notes available'}
                                        readOnly
                                    />
                                </div>
                                {/* Buttons */}
                                <div className="flex justify-center gap-4 mb-3">
                                    <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Diary</button>
                                    <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">Healthbook</button>
                                    <button
                                        onClick={() => navigate(`/pet/edit/${pet.petId}`)}
                                        className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(pet.petId)}
                                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminPetDetail;
