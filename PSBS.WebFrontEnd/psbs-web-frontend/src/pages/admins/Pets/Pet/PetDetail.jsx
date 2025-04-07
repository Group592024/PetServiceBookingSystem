import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Swal from 'sweetalert2';

// Define helper components at the top
const InfoField = ({ label, value, className, icon }) => (
    <div className="flex items-center gap-4">
        <label className="font-semibold text-gray-500 min-w-[120px]">{label}:</label>
        <div className={`flex-1 p-3 bg-gray-50 rounded-lg ${className || 'text-gray-700'}`}>
            {icon && <span className="mr-2">{icon}</span>}
            {value}
        </div>
    </div>
);

const ActionButton = ({ label, icon, className, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all ${className}`}
    >
        <span>{icon}</span>
        {label}
    </button>
);

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
                const token = sessionStorage.getItem("token");

                const petResponse = await fetch(`http://localhost:5050/api/Pet/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const petData = await petResponse.json();
                console.log(petData);

                const [accountResponse, breedResponse] = await Promise.all([
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
        return (
            <div className="flex flex-col items-center justify-center h-svh text-center">
                <svg aria-hidden="true" className="w-12 h-12 text-purple-500 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#8B5CF6" />
                </svg>
                <p className="mt-4 text-gray-700 text-lg">Loading your pets, please wait...</p>
            </div>
        );
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
                const token = sessionStorage.getItem("token");
                const response = await fetch(`http://localhost:5050/api/Pet/${petId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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
        <div className="min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />

                <main className="flex-1 overflow-auto p-8">
                    {/* Enhanced Header */}
                    <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center">
                            <button onClick={() => navigate(-1)}
                                className="hover:bg-indigo-100 p-3 rounded-xl transition-all">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-4xl font-bold text-indigo-900 ml-6">Pet Profile</h1>
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-indigo-50">
                        <div className="p-10">
                            <div className="flex flex-col lg:flex-row gap-16">
                                {/* Left Column */}
                                <div className="flex-1 space-y-10">
                                    {/* Enhanced Pet Image */}
                                    <div className="relative group">
                                        <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl ring-4 ring-indigo-100">
                                            <img
                                                src={`http://localhost:5050/pet-service${pet.petImage || '/Images/default-image.png'}`}
                                                alt="Pet"
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Styled Basic Info */}
                                    <div className="space-y-6 bg-indigo-50/50 p-6 rounded-2xl">
                                        <InfoField
                                            label="Name"
                                            value={pet.petName || 'Unknown'}
                                            className="text-lg font-semibold text-indigo-900"
                                        />
                                        <InfoField
                                            label="Gender"
                                            value={pet.petGender ? '♂ Male' : '♀ Female'}
                                            className={`text-lg font-medium ${pet.petGender ? 'text-blue-600' : 'text-pink-600'}`}
                                        />
                                        <InfoField
                                            label="Birthday"
                                            value={formatDate(pet.dateOfBirth)}
                                            className="text-gray-700"
                                        />
                                        <InfoField
                                            label="Owner"
                                            value={accountName}
                                            icon="👤"
                                            className="text-indigo-800"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="flex-1 space-y-8">
                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl space-y-6">
                                        <h3 className="text-xl font-semibold text-indigo-900 mb-6">Pet Details</h3>
                                        <InfoField label="Breed" value={petBreed} className="text-indigo-700" />
                                        <InfoField label="Weight" value={`${pet.petWeight || 'Unknown'} kg`} className="text-indigo-700" />
                                        <InfoField label="Fur Type" value={pet.petFurType || 'Unknown'} className="text-indigo-700" />
                                        <InfoField label="Fur Color" value={pet.petFurColor || 'Unknown'} className="text-indigo-700" />
                                    </div>

                                    {/* Enhanced Notes Section */}
                                    <div className="bg-white rounded-2xl p-6 shadow-inner">
                                        <label className="block text-xl font-semibold text-indigo-900 mb-4">
                                            📝 Notes
                                        </label>
                                        <div className="bg-gray-50 rounded-xl p-6 min-h-[200px]">
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {pet.petNote || 'No notes available'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Moved Status Here */}
                                    <div className={`px-6 py-2 rounded-xl ${pet.isDelete
                                        ? 'bg-red-50 border-2 border-red-200'
                                        : 'bg-emerald-50 border-2 border-emerald-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${pet.isDelete ? 'bg-red-500' : 'bg-emerald-500'
                                                }`}></div>
                                            <span className={`font-medium ${pet.isDelete ? 'text-red-700' : 'text-emerald-700'
                                                }`}>
                                                {pet.isDelete ? 'Inactive Pet' : 'Active Pet'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-12 pt-8 border-t border-indigo-100 flex flex-wrap justify-center gap-4">
                                <ActionButton
                                    label="Pet Diary"
                                    icon="📖"
                                    className="bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200"
                                    onClick={() => navigate(`/list/${pet.petId}`)} 
                                />
                                <ActionButton
                                    label="Health Book"
                                    icon="💊"
                                    className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                                    onClick={() => navigate(`/listAd/${pet.petId}/${pet.accountId}`)}
                                />
                                <ActionButton
                                    label="Edit Pet"
                                    icon="✏️"
                                    className="bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200"
                                    onClick={() => navigate(`/pet/edit/${pet.petId}`)}
                                />
                                <ActionButton
                                    label="Delete Pet"
                                    icon="🗑️"
                                    className="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                                    onClick={() => handleDelete(pet.petId)}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

};

export default AdminPetDetail;